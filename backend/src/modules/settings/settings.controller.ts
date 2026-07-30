import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/settings (Public Endpoint)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      success: true,
      message: 'Settings Loaded',
      data: settings,
    };
  }

  /**
   * PATCH /api/v1/settings (Admin Only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    const updatedSettings = await this.settingsService.updateSettings(updateSettingsDto);
    return {
      success: true,
      message: 'Settings Updated',
      data: updatedSettings,
    };
  }
}
