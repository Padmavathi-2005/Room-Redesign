import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserWalletDocument = UserWallet & Document;

@Schema({ timestamps: true, collection: 'user_wallets' })
export class UserWallet {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  balance: number; // Cash balance ($ USD)

  @Prop({ default: 0 })
  totalEarned: number; // Lifetime earnings ($ USD)

  @Prop({ default: '' })
  stripeConnectAccountId: string; // Stripe Express connected account ID

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserWalletSchema = SchemaFactory.createForClass(UserWallet);
