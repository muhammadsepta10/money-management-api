import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HouseholdSummaryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create summary for a household.
   * On first access, initializes from existing transaction history.
   */
  async getOrCreate(householdId: string) {
    const existing = await this.prisma.householdSummary.findUnique({
      where: { householdId },
    });

    if (existing) {
      return {
        totalIncome: Number(existing.totalIncome),
        totalExpense: Number(existing.totalExpense),
        totalBalanceCarryOver: Number(existing.totalBalanceCarryOver),
        lastCarryOverAt: existing.lastCarryOverAt,
      };
    }

    // Initialize from existing transaction history
    const [income, expense] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { householdId, type: 'income' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { householdId, type: 'expense' },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpense = Number(expense._sum.amount || 0);

    const summary = await this.prisma.householdSummary.create({
      data: {
        householdId,
        totalIncome,
        totalExpense,
        totalBalanceCarryOver: 0,
      },
    });

    return {
      totalIncome: Number(summary.totalIncome),
      totalExpense: Number(summary.totalExpense),
      totalBalanceCarryOver: Number(summary.totalBalanceCarryOver),
      lastCarryOverAt: summary.lastCarryOverAt,
    };
  }

  async incrementIncome(householdId: string, amount: number) {
    await this.prisma.householdSummary.upsert({
      where: { householdId },
      update: { totalIncome: { increment: amount } },
      create: { householdId, totalIncome: amount, totalExpense: 0, totalBalanceCarryOver: 0 },
    });
  }

  async decrementIncome(householdId: string, amount: number) {
    await this.prisma.householdSummary.upsert({
      where: { householdId },
      update: { totalIncome: { decrement: amount } },
      create: { householdId, totalIncome: 0, totalExpense: 0, totalBalanceCarryOver: 0 },
    });
  }

  async incrementExpense(householdId: string, amount: number) {
    await this.prisma.householdSummary.upsert({
      where: { householdId },
      update: { totalExpense: { increment: amount } },
      create: { householdId, totalIncome: 0, totalExpense: amount, totalBalanceCarryOver: 0 },
    });
  }

  async decrementExpense(householdId: string, amount: number) {
    await this.prisma.householdSummary.upsert({
      where: { householdId },
      update: { totalExpense: { decrement: amount } },
      create: { householdId, totalIncome: 0, totalExpense: 0, totalBalanceCarryOver: 0 },
    });
  }

  async getSummary(householdId: string) {
    return this.getOrCreate(householdId);
  }
}
