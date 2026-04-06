import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BudgetAlertService } from './budget-alert.service';

@Module({
  providers: [NotificationsService, BudgetAlertService],
  exports: [NotificationsService, BudgetAlertService],
})
export class NotificationsModule {}
