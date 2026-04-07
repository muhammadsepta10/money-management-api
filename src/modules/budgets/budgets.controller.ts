import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdRoleGuard } from '../../common/guards/household-role.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBudgetDto, UpdateBudgetDto, CopyBudgetDto, BudgetQueryDto } from './budgets.dto';
import {
  CreateBudgetPipe,
  UpdateBudgetPipe,
  CopyBudgetPipe,
  BudgetQueryPipe,
} from './budgets.pipe';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, HouseholdRoleGuard)
@Controller('households/:id/budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get budgets for a given month/year' })
  async findAll(
    @Param('id') householdId: string,
    @Query(new BudgetQueryPipe()) query: BudgetQueryDto,
  ) {
    return this.budgetsService.findAll(householdId, query.month, query.year);
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget entry' })
  async create(
    @Param('id') householdId: string,
    @CurrentUser() user: User,
    @Body(new CreateBudgetPipe()) dto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(householdId, user.id, dto);
  }

  @Post('copy')
  @ApiOperation({ summary: 'Copy budgets from a previous month' })
  async copyFromPrevious(
    @Param('id') householdId: string,
    @CurrentUser() user: User,
    @Body(new CopyBudgetPipe()) dto: CopyBudgetDto,
  ) {
    return this.budgetsService.copyFromPrevious(householdId, user.id, dto);
  }

  @Patch(':budgetId')
  @ApiOperation({ summary: 'Update a budget entry' })
  async update(
    @Param('id') householdId: string,
    @Param('budgetId') budgetId: string,
    @Body(new UpdateBudgetPipe()) dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(householdId, budgetId, dto);
  }

  @Delete(':budgetId')
  @ApiOperation({ summary: 'Delete a budget entry' })
  async remove(@Param('id') householdId: string, @Param('budgetId') budgetId: string) {
    await this.budgetsService.remove(householdId, budgetId);
    return { message: 'Budget deleted' };
  }

  @Get(':budgetId/transactions')
  @ApiOperation({ summary: 'Get transactions linked to a budget' })
  async getTransactions(@Param('id') householdId: string, @Param('budgetId') budgetId: string) {
    return this.budgetsService.getTransactions(householdId, budgetId);
  }
}
