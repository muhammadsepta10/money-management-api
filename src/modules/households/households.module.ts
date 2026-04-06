import { Module } from '@nestjs/common';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';
import { HouseholdSummaryService } from './household-summary.service';
import { HouseholdSummaryCronService } from './household-summary-cron.service';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  controllers: [HouseholdsController, MembersController],
  providers: [
    HouseholdsService,
    MembersService,
    HouseholdSummaryService,
    HouseholdSummaryCronService,
  ],
  exports: [HouseholdsService, HouseholdSummaryService],
})
export class HouseholdsModule {}
