import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoomTypesService } from './room-types.service';

@Controller('room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  /**
   * GET /api/v1/room-types (Returns all 9 room types with mapped tools)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const roomTypes = await this.roomTypesService.findAll();
    return {
      success: true,
      message: 'Room Types Loaded',
      data: roomTypes,
    };
  }

  /**
   * GET /api/v1/room-types/:slug
   */
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const roomType = await this.roomTypesService.findBySlug(slug);
    return {
      success: true,
      message: `Room Type ${slug} Loaded`,
      data: roomType,
    };
  }
}
