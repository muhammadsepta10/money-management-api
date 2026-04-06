import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NewsQueryDto } from './news.dto';
import { buildPaginatedResult } from '../../common/types/pagination.type';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: NewsQueryDto) {
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    const where: any = { isPublished: true };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          imageUrl: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    // For list view, truncate content to first 200 chars
    const serialized = items.map((item) => ({
      ...item,
      content: item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content,
    }));

    return buildPaginatedResult(serialized, total, limit, offset);
  }

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id, isPublished: true },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return news;
  }
}
