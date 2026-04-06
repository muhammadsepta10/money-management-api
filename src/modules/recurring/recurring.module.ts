import { Module } from '@nestjs/common';
import { RecurringController } from './recurring.controller';
import { RecurringService } from './recurring.service';
import { RecurringCronService } from './recurring-cron.service';

@Module({
  controllers: [RecurringController],
  providers: [RecurringService, RecurringCronService],
  exports: [RecurringService],
})
export class RecurringModule {}
