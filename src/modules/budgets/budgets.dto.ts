import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ description: 'Category UUID' })
  categoryId: string;

  @ApiProperty({ minimum: 1, maximum: 12 })
  month: number;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ description: 'Budget amount', example: 2000000 })
  amount: number;

  @ApiProperty({ required: false, default: 'IDR' })
  currency?: string;

  @ApiProperty({ required: false, example: 'Anggaran makan bulan ini' })
  note?: string;
}

export class UpdateBudgetDto {
  @ApiProperty({ required: false, description: 'New budget amount' })
  amount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  note?: string;
}

export class CopyBudgetDto {
  @ApiProperty({ minimum: 1, maximum: 12 })
  fromMonth: number;

  @ApiProperty()
  fromYear: number;

  @ApiProperty({ minimum: 1, maximum: 12 })
  toMonth: number;

  @ApiProperty()
  toYear: number;
}

export class BudgetQueryDto {
  @ApiProperty({ minimum: 1, maximum: 12 })
  month: number;

  @ApiProperty()
  year: number;
}
