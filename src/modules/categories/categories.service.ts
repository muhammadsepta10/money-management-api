import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: string) {
    return this.prisma.category.findMany({
      where: {
        isDefault: true,
        ...(type && { type }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
