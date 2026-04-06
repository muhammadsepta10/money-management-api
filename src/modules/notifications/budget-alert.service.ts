import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class BudgetAlertService {
  private readonly logger = new Logger(BudgetAlertService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async checkAfterTransaction(
    householdId: string,
    categoryId: string,
    userId: string,
  ) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budget = await this.prisma.budget.findUnique({
      where: {
        householdId_categoryId_month_year: {
          householdId,
          categoryId,
          month,
          year,
        },
      },
      include: { category: true },
    });

    if (!budget) return;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const {
      _sum: { amount: spent },
    } = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        householdId,
        categoryId,
        type: 'expense',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    if (!spent) return;

    const spentNum = Number(spent);
    const budgetNum = Number(budget.amount);
    const pct = (spentNum / budgetNum) * 100;

    if (pct < 80) return;

    const categoryName = budget.category?.name ?? 'Unknown';
    const label = pct >= 100 ? 'exceeded' : 'reached 80% of';

    const members = await this.prisma.householdMember.findMany({
      where: { householdId },
      include: { user: { select: { fcmToken: true } } },
    });

    const title = 'Budget Alert';
    const body = `You have ${label} your ${categoryName} budget (${Math.round(pct)}%)`;

    for (const m of members) {
      if (m.user.fcmToken) {
        this.notifications.sendToUser(m.user.fcmToken, title, body).catch(() => {});
      }
    }

    this.logger.log(
      `Budget alert: ${categoryName} at ${Math.round(pct)}% for household ${householdId}`,
    );
  }
}
