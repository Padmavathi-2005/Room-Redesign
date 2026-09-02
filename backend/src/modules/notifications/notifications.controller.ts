import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserNotifications(@Request() req: any) {
    const userId = req.user.id || req.user._id;
    return this.notificationsService.getUserNotifications(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  async getAdminNotifications() {
    return this.notificationsService.getAdminNotifications();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('user/read-all')
  async markAllUserAsRead(@Request() req: any) {
    const userId = req.user.id || req.user._id;
    return this.notificationsService.markAllUserAsRead(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/read-all')
  async markAllAdminAsRead() {
    return this.notificationsService.markAllAdminAsRead();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('broadcast')
  async broadcastAnnouncement(@Body() body: { title: string; message: string }) {
    return this.notificationsService.broadcastAnnouncement(body.title, body.message);
  }
}
