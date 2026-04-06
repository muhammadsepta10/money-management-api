import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { RecurringService } from './recurring.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdRoleGuard } from '../../common/guards/household-role.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateRecurringDto, UpdateRecurringDto } from './recurring.dto';
import { CreateRecurringPipe, UpdateRecurringPipe } from './recurring.pipe';

@ApiTags('Recurring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, HouseholdRoleGuard)
@Controller('households/:id/recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  @ApiOperation({ summary: 'List recurring rules for a household' })
  async findAll(@Param('id') householdId: string) {
    return this.recurringService.findAll(householdId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recurring rule' })
  async create(
    @Param('id') householdId: string,
    @CurrentUser() user: User,
    @Body(new CreateRecurringPipe()) dto: CreateRecurringDto,
  ) {
    return this.recurringService.create(householdId, user.id, dto);
  }

  @Patch(':ruleId')
  @ApiOperation({ summary: 'Update a recurring rule' })
  async update(
    @Param('id') householdId: string,
    @Param('ruleId') ruleId: string,
    @Body(new UpdateRecurringPipe()) dto: UpdateRecurringDto,
  ) {
    return this.recurringService.update(householdId, ruleId, dto);
  }

  @Delete(':ruleId')
  @ApiOperation({ summary: 'Delete a recurring rule' })
  async remove(@Param('id') householdId: string, @Param('ruleId') ruleId: string) {
    await this.recurringService.remove(householdId, ruleId);
    return { message: 'Recurring rule deleted' };
  }

  @Patch(':ruleId/toggle')
  @ApiOperation({ summary: 'Pause or resume a recurring rule' })
  async toggle(@Param('id') householdId: string, @Param('ruleId') ruleId: string) {
    return this.recurringService.toggle(householdId, ruleId);
  }
}
