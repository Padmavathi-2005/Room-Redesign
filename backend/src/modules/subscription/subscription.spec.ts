import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPlan, UserRole } from '../users/schemas/user.schema';

describe('Subscription, Credit & Room Protection Test Suite', () => {
  let service: SubscriptionService;
  let mockUserModel: any;
  let mockPlanModel: any;
  let mockSettingModel: any;
  let mockCreditLedgerModel: any;
  let mockInvoiceModel: any;

  const mockUser: any = {
    _id: '507f1f77bcf86cd799439011',
    email: 'user@example.com',
    plan: SubscriptionPlan.FREE,
    subscriptionTier: 'Free Plan',
    credits: 0,
    stripeCustomerId: 'cus_test123',
    stripeSubscriptionId: 'sub_test123',
    subscriptionPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    subscriptionStatus: 'active',
    lastRefilledPeriodEnd: null,
    creditLots: [],
    markModified: jest.fn(),
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  };

  beforeEach(async () => {
    mockUser.credits = 0;
    mockUser.plan = SubscriptionPlan.FREE;
    mockUser.subscriptionStatus = 'active';
    mockUser.subscriptionPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    mockUser.lastRefilledPeriodEnd = null;
    mockUser.creditLots = [];

    mockUserModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
      findOneAndUpdate: jest.fn().mockImplementation((query, update) => {
        if (query.credits && query.credits.$gte !== undefined) {
          if (mockUser.credits >= query.credits.$gte) {
            mockUser.credits += update.$inc.credits;
            return { exec: jest.fn().mockResolvedValue(mockUser) };
          }
          return { exec: jest.fn().mockResolvedValue(null) };
        }
        if (update.$inc && update.$inc.credits) {
          mockUser.credits += update.$inc.credits;
          return { exec: jest.fn().mockResolvedValue(mockUser) };
        }
        return { exec: jest.fn().mockResolvedValue(mockUser) };
      }),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
    };

    mockPlanModel = {
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
      findOne: jest.fn().mockImplementation(({ code }) => ({
        exec: jest.fn().mockResolvedValue({
          name: code === 'pro' ? 'Pro Plan' : 'Starter Plan',
          code,
          priceMonthly: code === 'pro' ? 39 : 19,
          priceAnnual: code === 'pro' ? 31 : 15,
          credits: code === 'pro' ? 100 : 40,
          stripePriceIdMonthly: `price_${code}_monthly`,
          stripePriceIdAnnual: `price_${code}_annual`,
          isActive: true,
        }),
      })),
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) }),
    };

    mockSettingModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          stripeSecretKey: 'sk_test_mock12345',
          stripeWebhookSecret: 'whsec_test_mock12345',
        }),
      }),
    };

    mockCreditLedgerModel = {
      create: jest.fn().mockResolvedValue({ _id: 'ledger_123' }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    mockInvoiceModel = {
      create: jest.fn().mockResolvedValue({ _id: 'inv_123' }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    const mockPackModel = {
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(3) }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            { _id: 'pack_1', name: 'Quick Boost', code: 'quick-boost', credits: 20, price: 12, validityDays: 1, eligiblePlans: ['starter', 'pro'], isActive: true },
            { _id: 'pack_2', name: 'Project Boost', code: 'project-boost', credits: 50, price: 28, validityDays: 10, eligiblePlans: ['starter', 'pro'], isActive: true },
          ]),
        }),
      }),
      findOne: jest.fn().mockImplementation(({ code, _id }) => ({
        exec: jest.fn().mockResolvedValue({
          _id: 'pack_1',
          name: 'Quick Boost',
          code: code || 'quick-boost',
          credits: 20,
          price: 12,
          currency: 'usd',
          validityDays: 1,
          eligiblePlans: ['starter', 'pro'],
          isActive: true,
        }),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: 'UserModel', useValue: mockUserModel },
        { provide: 'SubscriptionPlanDefinitionModel', useValue: mockPlanModel },
        { provide: 'SettingModel', useValue: mockSettingModel },
        { provide: 'CreditLedgerModel', useValue: mockCreditLedgerModel },
        { provide: 'InvoiceModel', useValue: mockInvoiceModel },
        { provide: 'CreditPackModel', useValue: mockPackModel },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  it('1. Admin Credit Adjustment: Should update balance and create ADJUSTMENT ledger entry', async () => {
    const updated = await service.adminAdjustCredits(
      '507f1f77bcf86cd799439011',
      50,
      undefined,
      'Test Admin Grant',
    );

    expect(updated.credits).toBe(50);
    expect(mockCreditLedgerModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 50,
        type: 'ADJUSTMENT',
        description: 'Test Admin Grant',
      }),
    );
  });

  it('2. Verified Webhook Credit Provisioning: Should allocate Starter credits (40)', async () => {
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const updated = await service.grantSubscriptionCredits(
      '507f1f77bcf86cd799439011',
      'starter',
      'cus_test123',
      'sub_test123',
      periodEnd,
      'monthly',
    );

    expect(updated.plan).toBe(SubscriptionPlan.STARTER);
    expect(updated.credits).toBe(40);
    expect(mockCreditLedgerModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 40, type: 'GRANT' }),
    );
  });

  it('3. Period-Level Idempotency: Should NOT double-grant credits for identical subscription periodEnd', async () => {
    const periodEnd = new Date('2026-10-01T00:00:00.000Z');

    // First call (Checkout session completed)
    await service.grantSubscriptionCredits(
      '507f1f77bcf86cd799439011',
      'starter',
      'cus_test123',
      'sub_test123',
      periodEnd,
      'monthly',
    );
    expect(mockUser.credits).toBe(40);

    // Reset ledger call counts to isolate second call
    mockCreditLedgerModel.create.mockClear();

    // Second call (First recurring invoice succeeded for same period)
    await service.grantSubscriptionCredits(
      '507f1f77bcf86cd799439011',
      'starter',
      'cus_test123',
      'sub_test123',
      periodEnd,
      'monthly',
    );

    // Credits should remain 40 (no duplicate addition) and no new GRANT ledger entry created
    expect(mockUser.credits).toBe(40);
    expect(mockCreditLedgerModel.create).not.toHaveBeenCalled();
  });

  it('4. Renewal Refill: Should refill Pro credits (100) on new billing periodEnd', async () => {
    const periodEnd1 = new Date('2026-10-01T00:00:00.000Z');
    await service.grantSubscriptionCredits(
      '507f1f77bcf86cd799439011',
      'pro',
      'cus_test123',
      'sub_test123',
      periodEnd1,
      'monthly',
    );
    expect(mockUser.credits).toBe(100);

    const periodEnd2 = new Date('2026-11-01T00:00:00.000Z'); // Next cycle
    const refilled = await service.grantSubscriptionCredits(
      '507f1f77bcf86cd799439011',
      'pro',
      'cus_test123',
      'sub_test123',
      periodEnd2,
      'monthly',
    );

    expect(refilled.credits).toBe(100);
    expect(refilled.plan).toBe(SubscriptionPlan.PRO);
  });

  it('5. Cancellation & Expiry: Should revert plan to free when cancelled subscription expires', async () => {
    mockUser.subscriptionPeriodEnd = new Date(Date.now() - 1000); // Expired
    const cancelled = await service.handleSubscriptionCancellation('sub_test123');

    expect(cancelled).toBeDefined();
    expect(cancelled?.plan).toBe(SubscriptionPlan.FREE);
    expect(cancelled?.credits).toBe(0);
  });

  it('6. Atomic Credit Deduction: Should deduct credits atomically if balance is sufficient', async () => {
    mockUser.credits = 10;
    mockUser.creditLots = [{ lotId: 'l1', source: 'Test', initialCredits: 10, remainingCredits: 10, expiryDate: '2030-01-01' }];
    const result = await service.deductCreditsAtomic('507f1f77bcf86cd799439011', 4, 'Test deduction');

    expect(result.credits).toBe(6);
    expect(mockCreditLedgerModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: -4, type: 'DEDUCTION' }),
    );
  });

  it('7. Insufficient Credits Error: Should throw BadRequestException if balance is insufficient', async () => {
    mockUser.credits = 2;
    mockUser.creditLots = [{ lotId: 'l1', source: 'Test', initialCredits: 2, remainingCredits: 2, expiryDate: '2030-01-01' }];
    await expect(
      service.deductCreditsAtomic('507f1f77bcf86cd799439011', 4, 'Test overspend'),
    ).rejects.toThrow(BadRequestException);
  });

  it('8. Refund on Failed Generation: Should automatically refund credits to balance and write to ledger', async () => {
    mockUser.credits = 5;
    const refunded = await service.refundCreditsAtomic('507f1f77bcf86cd799439011', 4, 'Auto-refund test');

    expect(refunded.credits).toBe(9);
    expect(mockCreditLedgerModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 4, type: 'REFUND' }),
    );
  });

  it('9. Return-Sync + Webhook Idempotency: Webhook after Return-Sync does not double-grant credits', async () => {
    const periodStart = new Date('2026-09-01T00:00:00.000Z');
    const periodEnd = new Date('2026-10-01T00:00:00.000Z');

    // 1. Return-Sync runs first
    await service.grantSubscriptionCredits(
      '507f1f77bcf86cd799439011',
      'starter',
      'cus_sync123',
      'sub_sync123',
      periodEnd,
      'monthly',
      periodStart,
      'cs_test_session_123',
    );
    expect(mockUser.credits).toBe(40);
    expect(mockUser.subscriptionPeriodStart).toEqual(periodStart);

    mockCreditLedgerModel.create.mockClear();

    // 2. Webhook arrives second for exact same period
    await service.grantSubscriptionCredits(
      '507f1f77bcf86cd799439011',
      'starter',
      'cus_sync123',
      'sub_sync123',
      periodEnd,
      'monthly',
      periodStart,
      'cs_test_session_123',
    );

    // Credits remain 40, no double grant
    expect(mockUser.credits).toBe(40);
    expect(mockCreditLedgerModel.create).not.toHaveBeenCalled();
  });

  it('10. Strict Session Verification: Should throw BadRequestException when confirmCheckoutSuccess is called without sessionId', async () => {
    await expect(
      service.confirmCheckoutSuccess('507f1f77bcf86cd799439011', ''),
    ).rejects.toThrow(BadRequestException);
  });

  it('11. Credit Pack Purchase Rejection: Free user cannot buy credit booster packs', async () => {
    mockUser.plan = SubscriptionPlan.FREE;
    const packsRes = await service.getEligibleCreditPacks('507f1f77bcf86cd799439011');
    expect(packsRes.isEligible).toBe(false);
    expect(packsRes.packs).toHaveLength(0);

    await expect(
      service.createCreditPackCheckoutSession('507f1f77bcf86cd799439011', 'quick-boost'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('12. Credit Pack Provisioning: Active Starter user can provision verified credit pack', async () => {
    mockUser.plan = SubscriptionPlan.STARTER;
    mockUser.subscriptionStatus = 'active';
    mockUser.credits = 40;
    mockUser.creditLots = [];

    const updated = await service.grantCreditPack('507f1f77bcf86cd799439011', 'quick-boost', 'cs_pack_123', 12);
    expect(updated.credits).toBe(60); // 40 + 20
    expect(updated.creditLots[0].source).toContain('QUICK BOOST');
    expect(mockCreditLedgerModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 20, type: 'GRANT' }),
    );
  });

  it('13. Earliest-Expiry-First (FEFO) Consumption: Should consume credits from earliest expiring lot first', async () => {
    mockUser.plan = SubscriptionPlan.STARTER;
    mockUser.creditLots = [
      { lotId: 'l1', source: 'Pack 30-Day', initialCredits: 50, remainingCredits: 50, expiryDate: '2026-10-01' },
      { lotId: 'l2', source: 'Pack 1-Day', initialCredits: 20, remainingCredits: 20, expiryDate: '2026-09-04' },
    ];
    mockUser.credits = 70;

    const deducted = await service.deductCreditsAtomic('507f1f77bcf86cd799439011', 10, 'Test FEFO spend');
    expect(deducted.credits).toBe(60);

    // The 1-Day lot (expiring 2026-09-04) must be consumed first from 20 -> 10 left!
    const lot1Day = deducted.creditLots.find((l) => l.lotId === 'l2');
    expect(lot1Day.remainingCredits).toBe(10);
  });
});
