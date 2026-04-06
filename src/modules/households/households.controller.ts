import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { HouseholdsService } from './households.service';
import { HouseholdSummaryService } from './household-summary.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdRoleGuard } from '../../common/guards/household-role.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateHouseholdDto, UpdateHouseholdDto, JoinHouseholdDto } from './households.dto';
import { CreateHouseholdPipe, UpdateHouseholdPipe, JoinHouseholdPipe } from './households.pipe';

@ApiTags('Households')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('households')
export class HouseholdsController {
  constructor(
    private readonly householdsService: HouseholdsService,
    private readonly summaryService: HouseholdSummaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new household' })
  async create(
    @CurrentUser() user: User,
    @Body(new CreateHouseholdPipe()) dto: CreateHouseholdDto,
  ) {
    return this.householdsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List households the current user belongs to' })
  async findAll(@CurrentUser() user: User) {
    return this.householdsService.findAllForUser(user.id);
  }

  @Get(':id')
  @UseGuards(HouseholdRoleGuard)
  @ApiOperation({ summary: 'Get household detail' })
  async findOne(@Param('id') id: string) {
    return this.householdsService.findOne(id);
  }

  @Get(':id/members')
  @UseGuards(HouseholdRoleGuard)
  @ApiOperation({ summary: 'List household members' })
  async getMembers(@Param('id') id: string) {
    const household = await this.householdsService.findOne(id);
    return household.members;
  }

  @Patch(':id')
  @UseGuards(HouseholdRoleGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update household (admin only)' })
  async update(@Param('id') id: string, @Body(new UpdateHouseholdPipe()) dto: UpdateHouseholdDto) {
    return this.householdsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(HouseholdRoleGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete household (admin only)' })
  async remove(@Param('id') id: string) {
    await this.householdsService.remove(id);
    return { message: 'Household deleted' };
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a household using invite code only' })
  async joinByCode(
    @CurrentUser() user: User,
    @Body(new JoinHouseholdPipe()) dto: JoinHouseholdDto,
  ) {
    return this.householdsService.joinByInviteCode(user.id, dto.inviteCode);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a household using invite code' })
  async join(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body(new JoinHouseholdPipe()) dto: JoinHouseholdDto,
  ) {
    return this.householdsService.join(id, user.id, dto.inviteCode);
  }

  @Post(':id/invite-code/reset')
  @UseGuards(HouseholdRoleGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Reset invite code (admin only)' })
  async resetInviteCode(@Param('id') id: string) {
    return this.householdsService.resetInviteCode(id);
  }

  @Get(':id/summary-total')
  @UseGuards(HouseholdRoleGuard)
  @ApiOperation({ summary: 'Get household summary totals (income, expense, carry-over)' })
  async getSummaryTotal(@Param('id') id: string) {
    return this.summaryService.getSummary(id);
  }
}
