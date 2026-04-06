import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRecurringDto, UpdateRecurringDto } from './recurring.dto';

@Injectable()
export class RecurringService {
  constructor(private prisma: PrismaService) {}

  async findAll(householdId: string) {
    const rules = await this.prisma.recurringRule.findMany({
      where: { householdId },
      orderBy: { createdAt: 'desc' },
    });

    return rules.map((r) => ({
      ...r,
      amount: Number(r.amount),
    }));
  }

  async create(householdId: string, userId: string, dto: CreateRecurringDto) {
    const rule = await this.prisma.recurringRule.create({
      data: {
        householdId,
        categoryId: dto.categoryId,
        type: dto.type,
        amount: dto.amount,
        currency: dto.currency || 'IDR',
        note: dto.note || null,
        frequency: dto.frequency,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: true,
        createdById: userId,
      },
    });

    return { ...rule, amount: Number(rule.amount) };
  }

  async update(householdId: string, ruleId: string, dto: UpdateRecurringDto) {
    const existing = await this.prisma.recurringRule.findFirst({
      where: { id: ruleId, householdId },
    });
    if (!existing) throw new NotFoundException('Recurring rule not found');

    const rule = await this.prisma.recurringRule.update({
      where: { id: ruleId },
      data: {
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.type && { type: dto.type }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.frequency && { frequency: dto.frequency }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
      },
    });

    return { ...rule, amount: Number(rule.amount) };
  }

  async remove(householdId: string, ruleId: string) {
    const existing = await this.prisma.recurringRule.findFirst({
      where: { id: ruleId, householdId },
    });
    if (!existing) throw new NotFoundException('Recurring rule not found');

    await this.prisma.recurringRule.delete({ where: { id: ruleId } });
  }

  async toggle(householdId: string, ruleId: string) {
    const existing = await this.prisma.recurringRule.findFirst({
      where: { id: ruleId, householdId },
    });
    if (!existing) throw new NotFoundException('Recurring rule not found');

    const rule = await this.prisma.recurringRule.update({
      where: { id: ruleId },
      data: { isActive: !existing.isActive },
    });

    return { ...rule, amount: Number(rule.amount) };
  }
}
