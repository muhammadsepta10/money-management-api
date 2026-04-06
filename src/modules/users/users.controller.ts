import { Controller, Get, Patch, Body, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto, UpdateFcmTokenDto } from './users.dto';
import { UpdateUserPipe, UpdateFcmTokenPipe } from './users.pipe';
import { User } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update display name' })
  @UsePipes(new UpdateUserPipe())
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/fcm-token')
  @ApiOperation({ summary: 'Update FCM token for push notifications' })
  @UsePipes(new UpdateFcmTokenPipe())
  async updateFcmToken(@CurrentUser() user: User, @Body() dto: UpdateFcmTokenDto) {
    return this.usersService.updateFcmToken(user.id, dto.fcmToken);
  }
}
