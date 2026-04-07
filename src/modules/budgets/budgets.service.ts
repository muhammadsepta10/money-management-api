import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto, CopyBudgetDto } from './budgets.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(householdId: string, month: number, year: number) {
    const budgets = await this.prisma.budget.findMany({
      where: { householdId, month, year },
      include: { category: true },
      orderBy: { category: { sortOrder: 'asc' } },
    });

    // Calculate spent per category from transactions
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const spending = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        householdId,
        type: 'expense',
        date: { gte: startDate, lt: endDate },
      },
      _sum: { amount: true },
    });

    const spendingMap = new Map(spending.map((s) => [s.categoryId, Number(s._sum.amount || 0)]));

    return budgets.map((budget) => {
      const amount = Number(budget.amount);
      const spent = spendingMap.get(budget.categoryId) || 0;
      return {
        ...budget,
        amount,
        spent,
        remaining: amount - spent,
        percentage: amount > 0 ? (spent / amount) * 100 : 0,
      };
    });
  }

  async create(householdId: string, userId: string, dto: CreateBudgetDto) {
    const budget = await this.prisma.budget.create({
      data: {
        householdId,
        categoryId: dto.categoryId,
        month: dto.month,
        year: dto.year,
        amount: dto.amount,
        currency: dto.currency || 'IDR',
        note: dto.note || null,
        createdById: userId,
      },
      include: { category: true },
    });

    return { ...budget, amount: Number(budget.amount) };
  }

  async copyFromPrevious(householdId: string, userId: string, dto: CopyBudgetDto) {
    const prevBudgets = await this.prisma.budget.findMany({
      where: {
        householdId,
        month: dto.fromMonth,
        year: dto.fromYear,
      },
    });

    if (prevBudgets.length === 0) {
      throw new NotFoundException('No budgets found for the source month');
    }

    const copied = [];
    for (const budget of prevBudgets) {
      const result = await this.prisma.budget.create({
        data: {
          householdId,
          categoryId: budget.categoryId,
          month: dto.toMonth,
          year: dto.toYear,
          amount: budget.amount,
          currency: budget.currency,
          note: budget.note,
          createdById: userId,
        },
        include: { category: true },
      });
      copied.push({ ...result, amount: Number(result.amount) });
    }

    return copied;
  }

  async update(householdId: string, budgetId: string, dto: UpdateBudgetDto) {
    const existing = await this.prisma.budget.findFirst({
      where: { id: budgetId, householdId },
    });
    if (!existing) throw new NotFoundException('Budget not found');

    const budget = await this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.note !== undefined && { note: dto.note || null }),
      },
      include: { category: true },
    });

    return { ...budget, amount: Number(budget.amount) };
  }

  async remove(householdId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, householdId },
    });
    if (!budget) throw new NotFoundException('Budget not found');

    await this.prisma.budget.delete({ where: { id: budgetId } });
  }

  async getTransactions(householdId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, householdId },
    });
    if (!budget) throw new NotFoundException('Budget not found');

    const transactions = await this.prisma.transaction.findMany({
      where: { budgetId, householdId },
      include: {
        createdBy: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      exchangeRate: Number(t.exchangeRate),
    }));
  }
}
