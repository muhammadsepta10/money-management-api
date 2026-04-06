import { ApiProperty } from '@nestjs/swagger';

export class NewsQueryDto {
  @ApiProperty({ required: false, default: 20 })
  limit?: number;

  @ApiProperty({ required: false, default: 0 })
  offset?: number;

  @ApiProperty({ required: false, description: 'Search by title (LIKE)' })
  search?: string;
}
