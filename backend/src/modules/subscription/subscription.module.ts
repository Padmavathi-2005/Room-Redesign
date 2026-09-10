import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SubscriptionPlanDefinition, SubscriptionPlanDefinitionSchema } from './schemas/subscription-plan.schema';

import { Setting, SettingSchema } from '../settings/schemas/setting.schema';

import { CreditLedger, CreditLedgerSchema } from './schemas/credit-ledger.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SubscriptionPlanDefinition.name, schema: SubscriptionPlanDefinitionSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: CreditLedger.name, schema: CreditLedgerSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
