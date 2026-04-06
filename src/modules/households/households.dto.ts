import { ApiProperty } from '@nestjs/swagger';

export class CreateHouseholdDto {
  @ApiProperty({ description: 'Household name', example: 'Keluarga Budi' })
  name: string;

  @ApiProperty({ description: 'Default currency', example: 'IDR', required: false })
  defaultCurrency?: string;
}

export class UpdateHouseholdDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false, example: 'IDR' })
  defaultCurrency?: string;
}

export class JoinHouseholdDto {
  @ApiProperty({ description: 'Invite code to join household', example: 'A1B2C3D4' })
  inviteCode: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['admin', 'member'], example: 'admin' })
  role: string;
}
