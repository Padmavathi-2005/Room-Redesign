import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AiToolsService } from './ai-tools.service';

@Controller('ai-tools')
export class AiToolsController {
  constructor(private readonly aiToolsService: AiToolsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('category') category?: string) {
    const tools = await this.aiToolsService.findAll(category);
    return {
      success: true,
      message: 'AI Tools Loaded',
      data: tools,
    };
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const tool = await this.aiToolsService.findBySlug(slug);
    return {
      success: true,
      message: `AI Tool ${slug} Loaded`,
      data: tool,
    };
  }
}
