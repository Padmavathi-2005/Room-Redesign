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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { SubscriptionPlanDefinition } from './schemas/subscription-plan.schema';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * GET /api/v1/subscription/status
   * Fetch subscription details of the logged in user
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(@CurrentUser('_id') userId: string) {
    const status = await this.subscriptionService.getSubscriptionStatus(userId.toString());
    return {
      success: true,
      message: 'Subscription status loaded successfully',
      data: status,
    };
  }

  /**
   * POST /api/v1/subscription/upgrade
   * Upgrade user subscription plan
   */
  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  async upgradePlan(@CurrentUser('_id') userId: string, @Body('planCode') planCode: string) {
    const data = await this.subscriptionService.upgradeUserPlan(userId.toString(), planCode);
    return {
      success: true,
      message: `Plan upgraded successfully to ${planCode.toUpperCase()}`,
      data,
    };
  }

  /**
   * GET /api/v1/subscription/plans
   * Public route to retrieve all active plans
   */
  @Get('plans')
  @HttpCode(HttpStatus.OK)
  async getPlans(@Query('includeInactive') includeInactive?: string) {
    const includeInactiveBool = includeInactive === 'true';
    const plans = await this.subscriptionService.getPlans(includeInactiveBool);
    return {
      success: true,
      message: 'Subscription plans retrieved successfully',
      data: plans,
    };
  }

  /**
   * POST /api/v1/subscription/plans
   * Admin only: Create a subscription plan definition
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  async createPlan(@Body() planData: Partial<SubscriptionPlanDefinition>) {
    const plan = await this.subscriptionService.createPlan(planData);
    return {
      success: true,
      message: 'Subscription plan created successfully',
      data: plan,
    };
  }

  /**
   * PATCH /api/v1/subscription/plans/:id
   * Admin only: Edit a subscription plan definition
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('plans/:id')
  @HttpCode(HttpStatus.OK)
  async updatePlan(
    @Param('id') id: string,
    @Body() planData: Partial<SubscriptionPlanDefinition>,
  ) {
    const plan = await this.subscriptionService.updatePlan(id, planData);
    return {
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan,
    };
  }

  /**
   * DELETE /api/v1/subscription/plans/:id
   * Admin only: Delete a subscription plan definition
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('plans/:id')
  @HttpCode(HttpStatus.OK)
  async deletePlan(@Param('id') id: string) {
    await this.subscriptionService.deletePlan(id);
    return {
      success: true,
      message: 'Subscription plan deleted successfully',
      data: null,
    };
  }
}
