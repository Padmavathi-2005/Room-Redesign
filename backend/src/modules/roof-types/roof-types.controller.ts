import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoofTypesService } from './roof-types.service';

@Controller('roof-types')
export class RoofTypesController {
  constructor(private readonly roofTypesService: RoofTypesService) {}

  /**
   * GET /api/v1/roof-types
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const roofTypes = await this.roofTypesService.findAll();
    return {
      success: true,
      message: 'Roof Types Loaded',
      data: roofTypes,
    };
  }

  /**
   * GET /api/v1/roof-types/:slug
   */
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const roofType = await this.roofTypesService.findBySlug(slug);
    return {
      success: true,
      message: `Roof Type ${slug} Loaded`,
      data: roofType,
    };
  }
}
