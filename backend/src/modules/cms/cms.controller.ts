import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateCmsPageDto } from './dto/create-cms-page.dto';
import { UpdateCmsPageDto } from './dto/update-cms-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  /**
   * GET /api/v1/cms
   * List all CMS pages (Public sees published only, Admin sees all)
   */
  @Get()
  async findAll(@Query('includeDrafts') includeDrafts?: string) {
    const pages = await this.cmsService.findAll(includeDrafts === 'true');
    return {
      success: true,
      count: pages.length,
      data: pages,
    };
  }

  /**
   * GET /api/v1/cms/slug/:slug
   * Public page renderer fetcher by slug (Increments view count)
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const page = await this.cmsService.findBySlug(slug, true);
    return {
      success: true,
      data: page,
    };
  }

  /**
   * GET /api/v1/cms/:id
   * Admin fetch page by ID for builder editing
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const page = await this.cmsService.findById(id);
    return {
      success: true,
      data: page,
    };
  }

  /**
   * POST /api/v1/cms
   * Admin create new CMS page
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createCmsPageDto: CreateCmsPageDto) {
    const page = await this.cmsService.create(createCmsPageDto);
    return {
      success: true,
      message: 'CMS Page created successfully.',
      data: page,
    };
  }

  /**
   * PATCH /api/v1/cms/:id
   * Admin update CMS page
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCmsPageDto: UpdateCmsPageDto,
  ) {
    const page = await this.cmsService.update(id, updateCmsPageDto);
    return {
      success: true,
      message: 'CMS Page updated successfully.',
      data: page,
    };
  }

  /**
   * DELETE /api/v1/cms/:id
   * Admin delete custom page
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const result = await this.cmsService.delete(id);
    return {
      success: true,
      ...result,
    };
  }
}
