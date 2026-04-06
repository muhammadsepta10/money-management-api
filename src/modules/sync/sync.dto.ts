import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncChangeDto {
  @ApiProperty({ enum: ['transaction', 'budget', 'recurringRule'] })
  entity: string;

  @ApiProperty({ enum: ['create', 'update', 'delete'] })
  action: string;

  @ApiPropertyOptional({ description: 'Server ID (for update/delete)' })
  id?: string;

  @ApiPropertyOptional({ description: 'Local temporary ID (for create)' })
  localId?: string;

  @ApiPropertyOptional({ description: 'Entity data' })
  data?: Record<string, any>;

  @ApiProperty({ description: 'ISO timestamp of local change' })
  timestamp: string;
}

export class SyncPushDto {
  @ApiProperty({ example: 'household-uuid' })
  householdId: string;

  @ApiProperty({ type: [SyncChangeDto] })
  changes: SyncChangeDto[];
}

export class SyncPullQueryDto {
  @ApiProperty({ description: 'ISO timestamp of last sync' })
  since: string;

  @ApiProperty({ example: 'household-uuid' })
  householdId: string;
}

export class SyncPushResultDto {
  @ApiProperty({ description: 'Mapping of localId → serverId for creates' })
  idMapping: Record<string, string>;

  @ApiProperty({ description: 'Errors encountered' })
  errors: Array<{ index: number; message: string }>;
}
