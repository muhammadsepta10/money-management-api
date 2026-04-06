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
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdRoleGuard } from '../../common/guards/household-role.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryDto,
  TransactionSummaryQueryDto,
  MonthlyBalanceQueryDto,
} from './transactions.dto';
import {
  CreateTransactionPipe,
  UpdateTransactionPipe,
  TransactionQueryPipe,
  TransactionSummaryQueryPipe,
  MonthlyBalanceQueryPipe,
} from './transactions.pipe';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, HouseholdRoleGuard)
@Controller('households/:id/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions (paginated, filterable)' })
  async findAll(
    @Param('id') householdId: string,
    @Query(new TransactionQueryPipe()) query: TransactionQueryDto,
  ) {
    return this.transactionsService.findAll(householdId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  async create(
    @Param('id') householdId: string,
    @CurrentUser() user: User,
    @Body(new CreateTransactionPipe()) dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(householdId, user.id, dto);
  }

  @Patch(':txId')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(
    @Param('id') householdId: string,
    @Param('txId') txId: string,
    @Body(new UpdateTransactionPipe()) dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(householdId, txId, dto);
  }

  @Delete(':txId')
  @ApiOperation({ summary: 'Delete a transaction' })
  async remove(@Param('id') householdId: string, @Param('txId') txId: string) {
    await this.transactionsService.remove(householdId, txId);
    return { message: 'Transaction deleted' };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get monthly summary (income, expense, balance)' })
  async summary(
    @Param('id') householdId: string,
    @Query(new TransactionSummaryQueryPipe()) query: TransactionSummaryQueryDto,
  ) {
    return this.transactionsService.getMonthlySummary(householdId, query.month, query.year);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get 6-month income/expense trend' })
  async trend(@Param('id') householdId: string) {
    return this.transactionsService.getMonthlyTrend(householdId);
  }

  @Get('monthly-balance')
  @ApiOperation({
    summary: 'Get monthly balance with configurable range (default 6 months, max 12)',
  })
  async monthlyBalance(
    @Param('id') householdId: string,
    @Query(new MonthlyBalanceQueryPipe()) query: MonthlyBalanceQueryDto,
  ) {
    return this.transactionsService.getMonthlyBalance(householdId, query);
  }
}
