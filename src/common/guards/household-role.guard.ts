import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class HouseholdRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    const householdId = request.params.id;
    if (!householdId) return true;

    const member = await this.prisma.householdMember.findUnique({
      where: {
        householdId_userId: {
          householdId,
          userId: user.id,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient role for this operation');
    }

    request.householdMember = member;
    return true;
  }
}
