import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecurringDto {
  @ApiProperty({ example: 'uuid' })
  categoryId: string;

  @ApiProperty({ enum: ['income', 'expense'] })
  type: string;

  @ApiProperty({ example: 150000 })
  amount: number;

  @ApiProperty({ example: 'IDR' })
  currency: string;

  @ApiProperty({ enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  frequency: string;

  @ApiProperty({ example: '2024-03-01' })
  startDate: string;

  @ApiPropertyOptional({ example: '2025-03-01' })
  endDate?: string;

  @ApiPropertyOptional({ example: 'Internet bill' })
  note?: string;
}

export class UpdateRecurringDto {
  @ApiPropertyOptional({ example: 'uuid' })
  categoryId?: string;

  @ApiPropertyOptional({ enum: ['income', 'expense'] })
  type?: string;

  @ApiPropertyOptional({ example: 150000 })
  amount?: number;

  @ApiPropertyOptional({ example: 'IDR' })
  currency?: string;

  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  frequency?: string;

  @ApiPropertyOptional({ example: '2024-03-01' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-03-01' })
  endDate?: string;

  @ApiPropertyOptional({ example: 'Internet bill' })
  note?: string;
}

export class RecurringResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() householdId: string;
  @ApiProperty() categoryId: string;
  @ApiProperty() type: string;
  @ApiProperty() amount: number;
  @ApiProperty() currency: string;
  @ApiProperty() frequency: string;
  @ApiProperty() startDate: Date;
  @ApiPropertyOptional() endDate: Date | null;
  @ApiPropertyOptional() note: string | null;
  @ApiProperty() isActive: boolean;
  @ApiPropertyOptional() lastGenerated: Date | null;
  @ApiProperty() createdById: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
