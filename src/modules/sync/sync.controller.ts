import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SyncService } from './sync.service';
import { SyncPushDto, SyncPullQueryDto } from './sync.dto';
import { SyncPushPipe, SyncPullPipe } from './sync.pipe';

@ApiTags('Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Push local changes to server' })
  @UsePipes(new SyncPushPipe())
  push(@CurrentUser() user: any, @Body() dto: SyncPushDto) {
    return this.syncService.push(user.id, dto);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Pull server changes since timestamp' })
  pull(
    @CurrentUser() user: any,
    @Query(new SyncPullPipe()) query: SyncPullQueryDto,
  ) {
    return this.syncService.pull(user.id, query);
  }
}
