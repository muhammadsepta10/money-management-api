import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { HouseholdsModule } from '../households/households.module';

@Module({
  imports: [NotificationsModule, HouseholdsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
