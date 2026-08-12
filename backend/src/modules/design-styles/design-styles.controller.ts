import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { DesignStylesService } from './design-styles.service';

@Controller('design-styles')
export class DesignStylesController {
  constructor(private readonly designStylesService: DesignStylesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const styles = await this.designStylesService.findAll();
    return {
      success: true,
      message: 'Design Styles Loaded',
      data: styles,
    };
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const style = await this.designStylesService.findBySlug(slug);
    return {
      success: true,
      message: `Design Style ${slug} Loaded`,
      data: style,
    };
  }
}
