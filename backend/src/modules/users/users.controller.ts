import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      success: true,
      data: user,
    };
  }

  @Get(':id/credits')
  async getUserCredits(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      success: true,
      credits: user.credits ?? 0,
      subscriptionTier: user.subscriptionTier || 'FREE',
    };
  }

  @Patch(':id/credits')
  @HttpCode(HttpStatus.OK)
  async updateUserCredits(
    @Param('id') id: string,
    @Body() body: { credits?: number; delta?: number },
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (body.credits !== undefined) {
      user.credits = Math.max(0, body.credits);
    } else if (body.delta !== undefined) {
      user.credits = Math.max(0, (user.credits ?? 0) + body.delta);
    }

    await user.save();
    return {
      success: true,
      message: 'User credits updated successfully',
      credits: user.credits,
      user,
    };
  }
}
