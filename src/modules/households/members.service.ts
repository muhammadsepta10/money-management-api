import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(householdId: string) {
    return this.prisma.householdMember.findMany({
      where: { householdId },
      include: {
        user: {
          select: { id: true, displayName: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async remove(householdId: string, userId: string) {
    const member = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId, userId } },
    });

    if (!member) throw new NotFoundException('Member not found');

    // Prevent removing the last admin
    if (member.role === 'admin') {
      const adminCount = await this.prisma.householdMember.count({
        where: { householdId, role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last admin. Transfer admin role first.');
      }
    }

    await this.prisma.householdMember.delete({
      where: { householdId_userId: { householdId, userId } },
    });
  }

  async updateRole(householdId: string, userId: string, role: string) {
    const member = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId, userId } },
    });

    if (!member) throw new NotFoundException('Member not found');

    // If demoting last admin, prevent it
    if (member.role === 'admin' && role === 'member') {
      const adminCount = await this.prisma.householdMember.count({
        where: { householdId, role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last admin');
      }
    }

    return this.prisma.householdMember.update({
      where: { householdId_userId: { householdId, userId } },
      data: { role },
      include: {
        user: {
          select: { id: true, displayName: true, email: true, avatarUrl: true },
        },
      },
    });
  }
}
