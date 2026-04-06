import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NewsQueryDto } from './news.dto';
import { NewsQueryPipe } from './news.pipe';

@ApiTags('News')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'List news (paginated, searchable)' })
  async findAll(@Query(new NewsQueryPipe()) query: NewsQueryDto) {
    return this.newsService.findAll(query);
  }

  @Get(':newsId')
  @ApiOperation({ summary: 'Get news detail' })
  async findOne(@Param('newsId') newsId: string) {
    return this.newsService.findOne(newsId);
  }
}
