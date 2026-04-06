import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringRule } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecurringCronService {
  private readonly logger = new Logger(RecurringCronService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async generate() {
    this.logger.log('Checking recurring rules...');

    const rules = await this.prisma.recurringRule.findMany({
      where: { isActive: true },
    });

    let generated = 0;
    for (const rule of rules) {
      generated += await this.processRule(rule);
    }

    if (generated > 0) {
      this.logger.log(`Generated ${generated} recurring transactions`);
    }
  }

  private async processRule(rule: RecurringRule): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (rule.endDate && new Date(rule.endDate) < today) return 0;

    const startDate = new Date(rule.startDate);
    startDate.setHours(0, 0, 0, 0);

    let cursor = rule.lastGenerated
      ? this.calculateNextDate(new Date(rule.lastGenerated), rule.frequency)
      : new Date(startDate);
    cursor.setHours(0, 0, 0, 0);

    let count = 0;

    while (cursor <= today) {
      if (cursor < startDate) {
        cursor = this.calculateNextDate(cursor, rule.frequency);
        continue;
      }

      if (rule.endDate && cursor > new Date(rule.endDate)) break;

      await this.prisma.transaction.create({
        data: {
          householdId: rule.householdId,
          categoryId: rule.categoryId,
          type: rule.type,
          amount: rule.amount,
          currency: rule.currency,
          note: rule.note,
          date: cursor,
          recurringId: rule.id,
          createdById: rule.createdById,
        },
      });

      await this.prisma.recurringRule.update({
        where: { id: rule.id },
        data: { lastGenerated: cursor },
      });

      count++;
      cursor = this.calculateNextDate(cursor, rule.frequency);
    }

    return count;
  }

  private calculateNextDate(from: Date, frequency: string): Date {
    const next = new Date(from);
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }
}
