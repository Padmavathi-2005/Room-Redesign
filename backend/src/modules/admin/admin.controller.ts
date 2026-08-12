import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  @Get('users')
  async getAllUsers(): Promise<Array<Record<string, any>>> {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: { role?: UserRole; credits?: number; subscriptionTier?: string },
  ) {
    return this.adminService.updateUser(id, updateData);
  }

  @Post('users/:id/add-credits')
  @HttpCode(HttpStatus.OK)
  async addCredits(
    @Param('id') id: string,
    @Body() body: { amount: number },
  ) {
    return this.adminService.addCreditsToUser(id, body.amount || 0);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('projects')
  async getAllProjects(): Promise<Array<Record<string, any>>> {
    return this.adminService.getAllProjects();
  }

  @Delete('projects/:id')
  @HttpCode(HttpStatus.OK)
  async deleteProject(@Param('id') id: string) {
    return this.adminService.deleteProject(id);
  }

  @Get('images')
  async getAllConvertedImages() {
    return this.adminService.getAllConvertedImages();
  }

  @Get('tools')
  async getAllProductTools() {
    return this.adminService.getAllProductTools();
  }

  @Patch('tools/:id')
  async updateProductTool(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateProductTool(id, updateData);
  }

  @Post('tools/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadToolImage(@UploadedFile() file: any) {
    return this.adminService.saveToolImage(file);
  }
}
