import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnvironmentService } from './environment.service';

@Controller('environments')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  /**
   * GET /api/v1/environments
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const environments = await this.environmentService.findAll();
    return {
      success: true,
      message: 'Environments Loaded',
      data: environments,
    };
  }

  /**
   * GET /api/v1/environments/:slug
   */
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const environment = await this.environmentService.findBySlug(slug);
    return {
      success: true,
      message: `Environment ${slug} Loaded`,
      data: environment,
    };
  }
}
