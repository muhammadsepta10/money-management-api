import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HouseholdSummaryCronService {
  private readonly logger = new Logger(HouseholdSummaryCronService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs on the 1st of every month at 00:00.
   * Computes previous month's (income - expense) for each household
   * and adds it to totalBalanceCarryOver.
   */
  @Cron('0 0 1 * *')
  async handleMonthlyCarryOver() {
    this.logger.log('Starting monthly balance carry-over...');

    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth(); // getMonth() is 0-based
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const startDate = new Date(prevYear, prevMonth - 1, 1);
    const endDate = new Date(prevYear, prevMonth, 1);

    const households = await this.prisma.household.findMany({
      select: { id: true },
    });

    for (const household of households) {
      try {
        // Check if already carried over for this month
        const existing = await this.prisma.householdSummary.findUnique({
          where: { householdId: household.id },
        });

        if (existing?.lastCarryOverAt && existing.lastCarryOverAt >= startDate) {
          this.logger.debug(
            `Household ${household.id} already carried over for ${prevMonth}/${prevYear}`,
          );
          continue;
        }

        const [income, expense] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: {
              householdId: household.id,
              type: 'income',
              date: { gte: startDate, lt: endDate },
            },
            _sum: { amount: true },
          }),
          this.prisma.transaction.aggregate({
            where: {
              householdId: household.id,
              type: 'expense',
              date: { gte: startDate, lt: endDate },
            },
            _sum: { amount: true },
          }),
        ]);

        const monthBalance = Number(income._sum.amount || 0) - Number(expense._sum.amount || 0);

        await this.prisma.householdSummary.upsert({
          where: { householdId: household.id },
          update: {
            totalBalanceCarryOver: { increment: monthBalance },
            lastCarryOverAt: now,
          },
          create: {
            householdId: household.id,
            totalIncome: 0,
            totalExpense: 0,
            totalBalanceCarryOver: monthBalance,
            lastCarryOverAt: now,
          },
        });

        this.logger.log(
          `Household ${household.id}: carried over ${monthBalance} for ${prevMonth}/${prevYear}`,
        );
      } catch (error) {
        this.logger.error(`Failed carry-over for household ${household.id}: ${error.message}`);
      }
    }

    this.logger.log('Monthly balance carry-over completed.');
  }
}
