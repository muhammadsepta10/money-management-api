import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { CreateHouseholdDto, UpdateHouseholdDto } from './households.dto';

@Injectable()
export class HouseholdsService {
  constructor(private prisma: PrismaService) {}

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async create(userId: string, dto: CreateHouseholdDto) {
    const inviteCode = this.generateInviteCode();

    return this.prisma.$transaction(async (tx) => {
      const household = await tx.household.create({
        data: {
          name: dto.name,
          inviteCode,
          defaultCurrency: dto.defaultCurrency || 'IDR',
          createdById: userId,
        },
      });

      await tx.householdMember.create({
        data: {
          householdId: household.id,
          userId,
          role: 'admin',
        },
      });

      return household;
    });
  }

  async findAllForUser(userId: string) {
    const memberships = await this.prisma.householdMember.findMany({
      where: { userId },
      include: {
        household: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.household,
      role: m.role,
      memberCount: m.household._count.members,
    }));
  }

  async findOne(id: string) {
    const household = await this.prisma.household.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    if (!household) throw new NotFoundException('Household not found');
    return household;
  }

  async update(id: string, dto: UpdateHouseholdDto) {
    return this.prisma.household.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.defaultCurrency && { defaultCurrency: dto.defaultCurrency }),
      },
    });
  }

  async remove(id: string) {
    await this.prisma.household.delete({ where: { id } });
  }

  async join(householdId: string, userId: string, inviteCode: string) {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
      include: { _count: { select: { members: true } } },
    });

    if (!household) throw new NotFoundException('Household not found');
    if (household.inviteCode !== inviteCode) {
      throw new BadRequestException('Invalid invite code');
    }
    if (household._count.members >= 10) {
      throw new BadRequestException('Household is full (max 10 members)');
    }

    const existing = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId, userId } },
    });
    if (existing) throw new ConflictException('Already a member of this household');

    await this.prisma.householdMember.create({
      data: { householdId, userId, role: 'member' },
    });

    return { message: 'Successfully joined household', householdId };
  }

  async joinByInviteCode(userId: string, inviteCode: string) {
    const household = await this.prisma.household.findFirst({
      where: { inviteCode },
      include: { _count: { select: { members: true } } },
    });

    if (!household) throw new NotFoundException('Invalid invite code');
    if (household._count.members >= 10) {
      throw new BadRequestException('Household is full (max 10 members)');
    }

    const existing = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId: household.id, userId } },
    });
    if (existing) throw new ConflictException('Already a member of this household');

    await this.prisma.householdMember.create({
      data: { householdId: household.id, userId, role: 'member' },
    });

    return { message: 'Successfully joined household', householdId: household.id };
  }

  async resetInviteCode(id: string) {
    const newCode = this.generateInviteCode();
    const household = await this.prisma.household.update({
      where: { id },
      data: { inviteCode: newCode },
    });
    return { inviteCode: household.inviteCode };
  }
}
