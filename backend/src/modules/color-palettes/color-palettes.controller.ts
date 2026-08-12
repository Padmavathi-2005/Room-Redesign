import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ColorPalettesService } from './color-palettes.service';

@Controller('color-palettes')
export class ColorPalettesController {
  constructor(private readonly colorPalettesService: ColorPalettesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const palettes = await this.colorPalettesService.findAll();
    return {
      success: true,
      message: 'Color Palettes Loaded',
      data: palettes,
    };
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const palette = await this.colorPalettesService.findBySlug(slug);
    return {
      success: true,
      message: `Color Palette ${slug} Loaded`,
      data: palette,
    };
  }
}
