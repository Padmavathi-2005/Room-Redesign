import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionController, CreditPacksController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SubscriptionPlanDefinition, SubscriptionPlanDefinitionSchema } from './schemas/subscription-plan.schema';

import { Setting, SettingSchema } from '../settings/schemas/setting.schema';

import { CreditLedger, CreditLedgerSchema } from './schemas/credit-ledger.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { CreditPack, CreditPackSchema } from './schemas/credit-pack.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SubscriptionPlanDefinition.name, schema: SubscriptionPlanDefinitionSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: CreditLedger.name, schema: CreditLedgerSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: CreditPack.name, schema: CreditPackSchema },
    ]),
  ],
  controllers: [SubscriptionController, CreditPacksController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
