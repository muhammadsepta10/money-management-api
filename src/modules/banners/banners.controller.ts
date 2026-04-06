import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Banners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'List active banners' })
  async findAll() {
    return this.bannersService.findAll();
  }
}
