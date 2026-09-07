import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@CurrentUser() currentUser: any) {
    const userId = currentUser._id ? currentUser._id.toString() : (currentUser.id?.toString() || currentUser.sub);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      data: { user },
      user,
      credits: user.credits ?? 0,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@CurrentUser() currentUser: any, @Param('id') id: string) {
    const currentUserId = currentUser._id ? currentUser._id.toString() : (currentUser.id?.toString() || currentUser.sub);
    const targetId = id === 'me' ? currentUserId : id;
    const isAdmin = currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === 'admin');
    if (!isAdmin && currentUserId !== targetId) {
      throw new ForbiddenException('You are not authorized to view this user profile.');
    }

    const user = await this.usersService.findById(targetId);
    if (!user) {
      throw new NotFoundException(`User with ID ${targetId} not found`);
    }
    return {
      success: true,
      data: { user },
      user,
      credits: user.credits ?? 0,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/credits')
  async getUserCredits(@CurrentUser() currentUser: any, @Param('id') id: string) {
    const currentUserId = currentUser._id ? currentUser._id.toString() : (currentUser.id?.toString() || currentUser.sub);
    const targetId = id === 'me' ? currentUserId : id;
    const isAdmin = currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === 'admin');
    if (!isAdmin && currentUserId !== targetId) {
      throw new ForbiddenException('You are not authorized to view this user\'s credit balance.');
    }

    const user = await this.usersService.findById(targetId);
    if (!user) {
      throw new NotFoundException(`User with ID ${targetId} not found`);
    }
    return {
      success: true,
      credits: user.credits ?? 0,
      subscriptionTier: user.subscriptionTier || 'FREE',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/credits')
  @HttpCode(HttpStatus.OK)
  async updateUserCredits(
    @Param('id') id: string,
    @Body() body: { credits?: number; delta?: number; description?: string },
  ) {
    const user = await this.subscriptionService.adminAdjustCredits(
      id,
      body.credits,
      body.delta,
      body.description || 'Manual Admin Adjustment',
    );

    return {
      success: true,
      message: 'User credits adjusted successfully with server-side audit ledger',
      credits: user.credits,
      user,
    };
  }
}
