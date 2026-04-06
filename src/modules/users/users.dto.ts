import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'New display name', example: 'Budi Santoso' })
  displayName: string;
}

export class UpdateFcmTokenDto {
  @ApiProperty({ description: 'Firebase Cloud Messaging token' })
  fcmToken: string;
}
