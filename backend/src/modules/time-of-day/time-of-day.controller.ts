import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TimeOfDayService } from './time-of-day.service';

@Controller('time-of-day')
export class TimeOfDayController {
  constructor(private readonly timeOfDayService: TimeOfDayService) {}

  /**
   * GET /api/v1/time-of-day
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const times = await this.timeOfDayService.findAll();
    return {
      success: true,
      message: 'Time of Day Loaded',
      data: times,
    };
  }

  /**
   * GET /api/v1/time-of-day/:slug
   */
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const record = await this.timeOfDayService.findBySlug(slug);
    return {
      success: true,
      message: `Time of Day ${slug} Loaded`,
      data: record,
    };
  }
}
