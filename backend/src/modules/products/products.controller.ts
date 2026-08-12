import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('roomType') roomType?: string,
    @Query('type') type?: string,
  ) {
    const products = await this.productsService.findAll(roomType, type);
    return {
      success: true,
      message: 'Products Catalog Loaded',
      count: products.length,
      data: products,
    };
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    return {
      success: true,
      message: `Product ${slug} Loaded`,
      data: product,
    };
  }
}
