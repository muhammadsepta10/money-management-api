import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BudgetAlertService } from '../notifications/budget-alert.service';
import { HouseholdSummaryService } from '../households/household-summary.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryDto,
  MonthlyBalanceQueryDto,
} from './transactions.dto';
import { buildPaginatedResult } from '../../common/types/pagination.type';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private budgetAlert: BudgetAlertService,
    private summaryService: HouseholdSummaryService,
  ) {}

  async findAll(householdId: string, query: TransactionQueryDto) {
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    const where: any = { householdId };

    if (query.type) where.type = query.type;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.memberId) where.createdById = query.memberId;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const serialized = items.map((t) => ({
      ...t,
      amount: Number(t.amount),
      exchangeRate: Number(t.exchangeRate),
    }));

    return buildPaginatedResult(serialized, total, limit, offset);
  }

  async create(householdId: string, userId: string, dto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        householdId,
        categoryId: dto.categoryId,
        type: dto.type,
        amount: dto.amount,
        currency: dto.currency || 'IDR',
        exchangeRate: dto.exchangeRate || 1.0,
        note: dto.note || null,
        date: new Date(dto.date),
        recurringId: dto.recurringId || null,
        budgetId: dto.budgetId || null,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });

    // Check budget alerts asynchronously (don't block response)
    if (dto.type === 'expense') {
      this.budgetAlert.checkAfterTransaction(householdId, dto.categoryId, userId).catch(() => {});
    }

    // Update household summary
    if (dto.type === 'income') {
      this.summaryService.incrementIncome(householdId, dto.amount).catch(() => {});
    } else {
      this.summaryService.incrementExpense(householdId, dto.amount).catch(() => {});
    }

    return {
      ...transaction,
      amount: Number(transaction.amount),
      exchangeRate: Number(transaction.exchangeRate),
    };
  }

  async update(householdId: string, txId: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findFirst({
      where: { id: txId, householdId },
    });
    if (!existing) throw new NotFoundException('Transaction not found');

    const transaction = await this.prisma.transaction.update({
      where: { id: txId },
      data: {
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.type && { type: dto.type }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.exchangeRate !== undefined && { exchangeRate: dto.exchangeRate }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.budgetId !== undefined && { budgetId: dto.budgetId || null }),
      },
      include: {
        createdBy: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });

    return {
      ...transaction,
      amount: Number(transaction.amount),
      exchangeRate: Number(transaction.exchangeRate),
    };
  }

  async remove(householdId: string, txId: string) {
    const existing = await this.prisma.transaction.findFirst({
      where: { id: txId, householdId },
    });
    if (!existing) throw new NotFoundException('Transaction not found');

    await this.prisma.transaction.delete({ where: { id: txId } });

    // Update household summary
    const amount = Number(existing.amount);
    if (existing.type === 'income') {
      this.summaryService.decrementIncome(householdId, amount).catch(() => {});
    } else {
      this.summaryService.decrementExpense(householdId, amount).catch(() => {});
    }
  }

  async getMonthlySummary(householdId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [income, expense] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { householdId, type: 'income', date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { householdId, type: 'expense', date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpense = Number(expense._sum.amount || 0);

    // Category breakdown for expenses
    const categoryBreakdown = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { householdId, type: 'expense', date: { gte: startDate, lt: endDate } },
      _sum: { amount: true },
    });

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        categoryId: c.categoryId,
        total: Number(c._sum.amount || 0),
      })),
    };
  }

  async getMonthlyTrend(householdId: string, months: number = 6) {
    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 1);

      const [income, expense] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: { householdId, type: 'income', date: { gte: startDate, lt: endDate } },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: { householdId, type: 'expense', date: { gte: startDate, lt: endDate } },
          _sum: { amount: true },
        }),
      ]);

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'Mei',
        'Jun',
        'Jul',
        'Agu',
        'Sep',
        'Okt',
        'Nov',
        'Des',
      ];

      result.push({
        month: monthNames[m - 1],
        monthNumber: m,
        year: y,
        income: Number(income._sum.amount || 0),
        expense: Number(expense._sum.amount || 0),
      });
    }

    return result;
  }

  async getMonthlyBalance(householdId: string, query: MonthlyBalanceQueryDto) {
    const now = new Date();
    const defaultEnd = { month: now.getMonth() + 1, year: now.getFullYear() };
    const defaultStart = {
      month: now.getMonth() - 4 <= 0 ? now.getMonth() - 4 + 12 : now.getMonth() - 4,
      year: now.getMonth() - 4 <= 0 ? now.getFullYear() - 1 : now.getFullYear(),
    };

    const startMonth = query.startMonth || defaultStart.month;
    const startYear = query.startYear || defaultStart.year;
    const endMonth = query.endMonth || defaultEnd.month;
    const endYear = query.endYear || defaultEnd.year;

    const result = [];
    let currentDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth - 1, 1);

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];

    while (currentDate <= endDate) {
      const m = currentDate.getMonth() + 1;
      const y = currentDate.getFullYear();
      const periodStart = new Date(y, m - 1, 1);
      const periodEnd = new Date(y, m, 1);

      const [income, expense] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: { householdId, type: 'income', date: { gte: periodStart, lt: periodEnd } },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: { householdId, type: 'expense', date: { gte: periodStart, lt: periodEnd } },
          _sum: { amount: true },
        }),
      ]);

      const totalIncome = Number(income._sum.amount || 0);
      const totalExpense = Number(expense._sum.amount || 0);

      result.push({
        month: monthNames[m - 1],
        monthNumber: m,
        year: y,
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
      });

      currentDate = new Date(y, m, 1);
    }

    return result;
  }
}
