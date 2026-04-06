import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdRoleGuard } from '../../common/guards/household-role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateMemberRoleDto } from './households.dto';
import { UpdateMemberRolePipe } from './households.pipe';

@ApiTags('Household Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, HouseholdRoleGuard)
@Controller('households/:id/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'List household members' })
  async findAll(@Param('id') householdId: string) {
    return this.membersService.findAll(householdId);
  }

  @Delete(':userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove a member (admin only)' })
  async remove(
    @Param('id') householdId: string,
    @Param('userId') userId: string,
  ) {
    await this.membersService.remove(householdId, userId);
    return { message: 'Member removed' };
  }

  @Patch(':userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Update member role (admin only)' })
  async updateRole(
    @Param('id') householdId: string,
    @Param('userId') userId: string,
    @Body(new UpdateMemberRolePipe()) dto: UpdateMemberRoleDto,
  ) {
    return this.membersService.updateRole(householdId, userId, dto.role);
  }
}
