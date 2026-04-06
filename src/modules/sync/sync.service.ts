import {
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { SyncPushDto, SyncPullQueryDto, SyncChangeDto } from './sync.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async push(userId: string, dto: SyncPushDto) {
    await this.assertMembership(userId, dto.householdId);

    const lockKey = `sync:lock:${dto.householdId}`;
    const acquired = await this.redis.acquireLock(lockKey, 30);
    if (!acquired) {
      throw new ForbiddenException('Sync in progress for this household, try again shortly');
    }

    const idMapping: Record<string, string> = {};
    const errors: Array<{ index: number; message: string }> = [];

    try {
      for (let i = 0; i < dto.changes.length; i++) {
        try {
          const mapping = await this.processChange(
            userId,
            dto.householdId,
            dto.changes[i],
          );
          if (mapping) {
            idMapping[mapping.localId] = mapping.serverId;
          }
        } catch (err) {
          errors.push({ index: i, message: err.message });
        }
      }
    } finally {
      await this.redis.releaseLock(lockKey);
    }

    return { idMapping, errors };
  }

  async pull(userId: string, query: SyncPullQueryDto) {
    await this.assertMembership(userId, query.householdId);

    const since = new Date(query.since);
    const householdId = query.householdId;

    const [transactions, budgets, recurringRules] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { householdId, updatedAt: { gt: since } },
        orderBy: { updatedAt: 'asc' },
      }),
      this.prisma.budget.findMany({
        where: { householdId, updatedAt: { gt: since } },
        orderBy: { updatedAt: 'asc' },
      }),
      this.prisma.recurringRule.findMany({
        where: { householdId, updatedAt: { gt: since } },
        orderBy: { updatedAt: 'asc' },
      }),
    ]);

    return {
      transactions,
      budgets,
      recurringRules,
      serverTime: new Date().toISOString(),
    };
  }

  private async processChange(
    userId: string,
    householdId: string,
    change: SyncChangeDto,
  ): Promise<{ localId: string; serverId: string } | null> {
    const delegate = this.getDelegate(change.entity);

    switch (change.action) {
      case 'create': {
        const record = await delegate.create({
          data: {
            ...change.data,
            householdId,
            createdById: userId,
          },
        });
        return { localId: change.localId!, serverId: record.id };
      }

      case 'update': {
        const existing = await delegate.findFirst({
          where: { id: change.id, householdId },
        });
        if (!existing) return null;

        // Last-write-wins: only apply if local change is newer
        const localTs = new Date(change.timestamp);
        if (existing.updatedAt > localTs) return null;

        await delegate.update({
          where: { id: change.id },
          data: change.data,
        });
        return null;
      }

      case 'delete': {
        const exists = await delegate.findFirst({
          where: { id: change.id, householdId },
        });
        if (exists) {
          await delegate.delete({ where: { id: change.id } });
        }
        return null;
      }

      default:
        return null;
    }
  }

  private getDelegate(entity: string): any {
    switch (entity) {
      case 'transaction':
        return this.prisma.transaction;
      case 'budget':
        return this.prisma.budget;
      case 'recurringRule':
        return this.prisma.recurringRule;
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }
  }

  private async assertMembership(userId: string, householdId: string) {
    const member = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('Not a member of this household');
    }
  }
}
