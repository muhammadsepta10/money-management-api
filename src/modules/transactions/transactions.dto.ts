import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty({ enum: ['income', 'expense'] })
  type: string;

  @ApiProperty({ example: 50000 })
  amount: number;

  @ApiProperty({ required: false, default: 'IDR' })
  currency?: string;

  @ApiProperty({ required: false, default: 1.0 })
  exchangeRate?: number;

  @ApiProperty({ required: false, example: 'Makan siang' })
  note?: string;

  @ApiProperty({ type: String, format: 'date', example: '2026-04-01' })
  date: string;

  @ApiProperty({ required: false })
  recurringId?: string;

  @ApiProperty({ required: false, description: 'Budget UUID to link expense to' })
  budgetId?: string;
}

export class UpdateTransactionDto {
  @ApiProperty({ required: false })
  categoryId?: string;

  @ApiProperty({ required: false, enum: ['income', 'expense'] })
  type?: string;

  @ApiProperty({ required: false })
  amount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  exchangeRate?: number;

  @ApiProperty({ required: false })
  note?: string;

  @ApiProperty({ required: false, type: String, format: 'date' })
  date?: string;

  @ApiProperty({ required: false })
  budgetId?: string;
}

export class TransactionQueryDto {
  @ApiProperty({ required: false })
  startDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;

  @ApiProperty({ required: false, enum: ['income', 'expense'] })
  type?: string;

  @ApiProperty({ required: false })
  categoryId?: string;

  @ApiProperty({ required: false, description: 'Filter by member who created' })
  memberId?: string;

  @ApiProperty({ required: false, default: 20 })
  limit?: number;

  @ApiProperty({ required: false, default: 0 })
  offset?: number;
}

export class TransactionSummaryQueryDto {
  @ApiProperty({ minimum: 1, maximum: 12 })
  month: number;

  @ApiProperty()
  year: number;
}

export class MonthlyBalanceQueryDto {
  @ApiProperty({ required: false, minimum: 1, maximum: 12 })
  startMonth?: number;

  @ApiProperty({ required: false })
  startYear?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 12 })
  endMonth?: number;

  @ApiProperty({ required: false })
  endYear?: number;
}
