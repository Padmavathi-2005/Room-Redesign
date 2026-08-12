import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LightingService } from './lighting.service';

@Controller('lightings')
export class LightingController {
  constructor(private readonly lightingService: LightingService) {}

  /**
   * GET /api/v1/lightings
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const lightings = await this.lightingService.findAll();
    return {
      success: true,
      message: 'Lightings Loaded',
      data: lightings,
    };
  }

  /**
   * GET /api/v1/lightings/:slug
   */
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const lighting = await this.lightingService.findBySlug(slug);
    return {
      success: true,
      message: `Lighting ${slug} Loaded`,
      data: lighting,
    };
  }
}
