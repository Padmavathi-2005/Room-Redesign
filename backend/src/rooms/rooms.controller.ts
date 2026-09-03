import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import { UserRole } from '../modules/users/schemas/user.schema';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * POST /api/v1/rooms/generate
   * Authenticated user room redesign generation.
   * Extracts user ID from verified JWT (ignores body userId).
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(@CurrentUser() user: any, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.generateRoomRedesign(user._id.toString(), createRoomDto);
  }

  /**
   * GET /api/v1/rooms
   * Fetch room designs belonging to authenticated user (or all if admin)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user && (user.role === UserRole.ADMIN || user.role === 'admin');
    return this.roomsService.findAllForUser(user._id.toString(), isAdmin);
  }

  /**
   * GET /api/v1/rooms/:id
   * Fetch single room design if owned by user (or if admin)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const isAdmin = user && (user.role === UserRole.ADMIN || user.role === 'admin');
    return this.roomsService.findOneForUser(id, user._id.toString(), isAdmin);
  }

  /**
   * DELETE /api/v1/rooms
   * Admin only bulk delete
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete()
  async removeAll() {
    return this.roomsService.removeAll();
  }

  /**
   * DELETE /api/v1/rooms/:id
   * Delete room design if owned by authenticated user (or if admin)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const isAdmin = user && (user.role === UserRole.ADMIN || user.role === 'admin');
    return this.roomsService.removeForUser(id, user._id.toString(), isAdmin);
  }
}
