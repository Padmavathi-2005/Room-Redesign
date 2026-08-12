import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MoodsService } from './moods.service';

@Controller('moods')
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const moods = await this.moodsService.findAll();
    return {
      success: true,
      message: 'Moods Loaded',
      data: moods,
    };
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const mood = await this.moodsService.findBySlug(slug);
    return {
      success: true,
      message: `Mood ${slug} Loaded`,
      data: mood,
    };
  }
}
