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

  /* -------------------------------------------------------------------------- */
  /*                      CUSTOMER CREDIT PACK ENDPOINTS                        */
  /* -------------------------------------------------------------------------- */

  /**
   * GET /api/v1/subscription/credit-packs
   * Fetch active credit booster packs eligible for user's active paid plan
   */
  @UseGuards(JwtAuthGuard)
  @Get('credit-packs')
  @HttpCode(HttpStatus.OK)
  async getEligibleCreditPacks(@CurrentUser('_id') userId: string) {
    const result = await this.subscriptionService.getEligibleCreditPacks(userId.toString());
    return {
      success: true,
      message: result.message,
      data: result,
    };
  }

  /**
   * POST /api/v1/subscription/credit-packs/create-checkout-session
   * Generate Stripe Checkout session for one-time credit pack purchase
   */
  @UseGuards(JwtAuthGuard)
  @Post('credit-packs/create-checkout-session')
  @HttpCode(HttpStatus.OK)
  async createCreditPackCheckoutSession(
    @CurrentUser('_id') userId: string,
    @Body('packId') packId?: string,
    @Body('packCode') packCode?: string,
    @Body('successUrl') successUrl?: string,
    @Body('cancelUrl') cancelUrl?: string,
  ) {
    const targetCode = packId || packCode;
    if (!targetCode) {
      throw new BadRequestException('Credit pack ID or pack code is required.');
    }

    const data = await this.subscriptionService.createCreditPackCheckoutSession(
      userId.toString(),
      targetCode,
      successUrl,
      cancelUrl,
    );

    return {
      success: true,
      message: 'Stripe Credit Pack Checkout session initialized',
      data,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                        ADMIN CREDIT PACK CRUD ENDPOINTS                   */
  /* -------------------------------------------------------------------------- */

  /**
   * GET /api/v1/subscription/admin/credit-packs
   * Admin only: List all credit packs
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/credit-packs')
  @HttpCode(HttpStatus.OK)
  async getAllCreditPacksAdmin() {
    const packs = await this.subscriptionService.getAllCreditPacksAdmin();
    return {
      success: true,
      message: 'Credit booster packs retrieved successfully',
      data: packs,
    };
  }

  /**
   * POST /api/v1/subscription/admin/credit-packs
   * Admin only: Create a new credit booster pack
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/credit-packs')
  @HttpCode(HttpStatus.CREATED)
  async createCreditPack(@Body() packData: any) {
    const pack = await this.subscriptionService.createCreditPack(packData);
    return {
      success: true,
      message: 'Credit booster pack created successfully',
      data: pack,
    };
  }

  /**
   * PATCH /api/v1/subscription/admin/credit-packs/:id
   * Admin only: Update an existing credit booster pack
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/credit-packs/:id')
  @HttpCode(HttpStatus.OK)
  async updateCreditPack(@Param('id') id: string, @Body() packData: any) {
    const pack = await this.subscriptionService.updateCreditPack(id, packData);
    return {
      success: true,
      message: 'Credit booster pack updated successfully',
      data: pack,
    };
  }

  /**
   * DELETE /api/v1/subscription/admin/credit-packs/:id
   * Admin only: Delete a credit booster pack
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/credit-packs/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCreditPack(@Param('id') id: string) {
    await this.subscriptionService.deleteCreditPack(id);
    return {
      success: true,
      message: 'Credit booster pack deleted successfully',
      data: null,
    };
  }
}

/**
  * Alias Controller for /api/v1/credit-packs to satisfy requirement #4
  */
@Controller('credit-packs')
export class CreditPacksController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getEligibleCreditPacks(@CurrentUser('_id') userId: string) {
    const result = await this.subscriptionService.getEligibleCreditPacks(userId.toString());
    return {
      success: true,
      message: result.message,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  @HttpCode(HttpStatus.OK)
  async createCreditPackCheckoutSession(
    @CurrentUser('_id') userId: string,
    @Body('packId') packId?: string,
    @Body('packCode') packCode?: string,
    @Body('successUrl') successUrl?: string,
    @Body('cancelUrl') cancelUrl?: string,
  ) {
    const targetCode = packId || packCode;
    if (!targetCode) {
      throw new BadRequestException('Credit pack ID or pack code is required.');
    }

    const data = await this.subscriptionService.createCreditPackCheckoutSession(
      userId.toString(),
      targetCode,
      successUrl,
      cancelUrl,
    );

    return {
      success: true,
      message: 'Stripe Credit Pack Checkout session initialized',
      data,
    };
  }
}
