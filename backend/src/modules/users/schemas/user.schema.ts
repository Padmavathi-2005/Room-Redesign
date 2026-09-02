import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  STANDARD = 'standard',
  PROFESSIONAL = 'professional',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ trim: true, required: false })
  phone?: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ default: null })
  avatar?: string;

  @Prop({ type: String, enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER, index: true })
  role: UserRole;

  @Prop({ type: String, enum: SubscriptionPlan, default: SubscriptionPlan.FREE, index: true })
  plan: SubscriptionPlan;

  @Prop({ default: 'FREE' })
  subscriptionTier?: string;

  @Prop({ default: 0 })
  credits: number;

  @Prop({ default: null })
  stripeCustomerId?: string;

  @Prop({ default: null })
  stripeSubscriptionId?: string;

  @Prop({ default: null })
  subscriptionPeriodStart?: Date;

  @Prop({ default: null })
  subscriptionPeriodEnd?: Date;

  @Prop({ default: 'active' })
  subscriptionStatus: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ select: false, default: null })
  refreshToken?: string;

  @Prop({ default: null })
  lastLogin?: Date;

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop({ default: null })
  lockUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Password Pre-Save Hash Hook
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});
