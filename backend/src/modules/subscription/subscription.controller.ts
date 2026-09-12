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
  BadRequestException,
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
   * Fetch server-authoritative subscription & credit details
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
   * POST /api/v1/subscription/cancel-auto-renew
   * Pause automatic renewal (cancel at period end)
   */
  @UseGuards(JwtAuthGuard)
  @Post('cancel-auto-renew')
  @HttpCode(HttpStatus.OK)
  async cancelAutoRenew(@CurrentUser('_id') userId: string) {
    const status = await this.subscriptionService.cancelAutoRenewal(userId.toString());
    return {
      success: true,
      message: 'Auto-renewal paused. Your current plan and remaining credits will remain active until the end of your billing cycle.',
      data: status,
    };
  }

  /**
   * POST /api/v1/subscription/resume-auto-renew
   * Reactivate automatic renewal
   */
  @UseGuards(JwtAuthGuard)
  @Post('resume-auto-renew')
  @HttpCode(HttpStatus.OK)
  async resumeAutoRenew(@CurrentUser('_id') userId: string) {
    const status = await this.subscriptionService.resumeAutoRenewal(userId.toString());
    return {
      success: true,
      message: 'Auto-renewal reactivated successfully. Your subscription will renew automatically.',
      data: status,
    };
  }

  /**
   * POST /api/v1/subscription/create-checkout-session
   * Generate official Stripe Hosted Checkout Session URL
   */
  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @CurrentUser('_id') userId: string,
    @Body('planCode') planCode: string,
    @Body('billingCycle') billingCycle: 'monthly' | 'annual' = 'monthly',
    @Body('successUrl') successUrl?: string,
    @Body('cancelUrl') cancelUrl?: string,
  ) {
    const data = await this.subscriptionService.createCheckoutSession(
      userId.toString(),
      planCode,
      billingCycle,
      successUrl,
      cancelUrl,
    );
    return {
      success: true,
      message: 'Stripe Checkout session initialized',
      data,
    };
  }

  /**
   * POST /api/v1/subscription/confirm-checkout-success
   * Authenticated return-sync endpoint to verify Stripe Checkout Session server-side
   */
  @UseGuards(JwtAuthGuard)
  @Post('confirm-checkout-success')
  @HttpCode(HttpStatus.OK)
  async confirmCheckoutSuccess(
    @CurrentUser('_id') userId: string,
    @Body('sessionId') sessionId: string,
  ) {
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
      throw new BadRequestException('Stripe Session ID parameter is required for payment verification.');
    }

    const user = await this.subscriptionService.confirmCheckoutSuccess(
      userId.toString(),
      sessionId.trim(),
    );

    const status = await this.subscriptionService.getSubscriptionStatus(userId.toString());

    return {
      success: true,
      message: `Payment verified. Your ${user.subscriptionTier || 'Starter Plan'} subscription and generation credits are active.`,
      data: {
        user: {
          _id: user._id.toString(),
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          plan: user.plan,
          subscriptionTier: user.subscriptionTier,
          subscriptionPlanId: (user as any).subscriptionPlanId,
          credits: user.credits,
        },
        subscription: status,
      },
    };
  }

  /**
   * GET /api/v1/subscription/credit-ledger
   * Fetch server-side credit audit transaction history
   */
  @UseGuards(JwtAuthGuard)
  @Get('credit-ledger')
  @HttpCode(HttpStatus.OK)
  async getCreditLedger(@CurrentUser('_id') userId: string) {
    const ledger = await this.subscriptionService.getCreditLedger(userId.toString());
    return {
      success: true,
      message: 'Credit ledger retrieved successfully',
      data: ledger,
    };
  }

  /**
   * GET /api/v1/subscription/invoices
   * Fetch verified database billing invoices
   */
  @UseGuards(JwtAuthGuard)
  @Get('invoices')
  @HttpCode(HttpStatus.OK)
  async getInvoices(@CurrentUser('_id') userId: string) {
    const invoices = await this.subscriptionService.getUserInvoices(userId.toString());
    return {
      success: true,
      message: 'User invoices retrieved successfully',
      data: invoices,
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
