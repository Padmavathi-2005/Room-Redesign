import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

@Schema({ timestamps: true, collection: 'settings' })
export class Setting {
  // 1. Branding & Visual System
  @Prop({ default: 'RoomAI' })
  applicationName: string;

  @Prop({ type: String, enum: ThemeMode, default: ThemeMode.LIGHT })
  activeTheme: ThemeMode;

  @Prop({ default: '#2563eb' })
  primaryColor: string;

  @Prop({ default: '#4f46e5' })
  secondaryColor: string;

  @Prop({ default: '#06B6D4' })
  accentColor: string;

  @Prop({ default: '#FFFFFF' })
  backgroundColor: string;

  @Prop({ default: '#111827' })
  textColor: string;

  @Prop({ default: 16 })
  borderRadius: number;

  @Prop({ default: 0.7 })
  glassOpacity: number;

  @Prop({ default: 20 })
  blurStrength: number;

  @Prop({ default: null })
  logo?: string;

  @Prop({ default: null })
  favicon?: string;

  // 2. Social Login & OAuth Credentials
  @Prop({ default: false })
  enableGoogleLogin: boolean;

  @Prop({ default: '' })
  googleClientId?: string;

  @Prop({ default: '' })
  googleClientSecret?: string;

  @Prop({ default: '' })
  googleCallbackUrl?: string;

  @Prop({ default: false })
  enableAppleLogin: boolean;

  @Prop({ default: '' })
  appleClientId?: string;

  @Prop({ default: '' })
  appleTeamId?: string;

  @Prop({ default: '' })
  appleKeyId?: string;

  @Prop({ default: '' })
  applePrivateKey?: string;

  // 3. AI Engine & API Tokens
  @Prop({ default: 'replicate' })
  primaryAiProvider: string;

  @Prop({ default: '' })
  replicateApiKey?: string;

  @Prop({ default: '' })
  openaiApiKey?: string;

  @Prop({ default: '' })
  huggingfaceToken?: string;

  @Prop({ default: 60 })
  aiGenerationTimeout: number;

  // 4. Stripe & PayPal Payment Gateways
  @Prop({ default: true })
  stripeEnabled: boolean;

  @Prop({ default: true })
  stripeTestMode: boolean;

  @Prop({ default: '' })
  stripePublishableKey?: string;

  @Prop({ default: '' })
  stripeSecretKey?: string;

  @Prop({ default: '' })
  stripeWebhookSecret?: string;

  @Prop({ default: true })
  paypalEnabled: boolean;

  @Prop({ default: true })
  paypalSandboxMode: boolean;

  @Prop({ default: '' })
  paypalClientId?: string;

  @Prop({ default: '' })
  paypalClientSecret?: string;

  @Prop({ default: '' })
  paypalSecretKey?: string;

  @Prop({ default: '' })
  paypalWebhookId?: string;

  // 4b. Taxes & Fees Configuration
  @Prop({ type: Array, default: [{ id: 'tax-vat', name: 'VAT (Sales Tax)', rate: 0, enabled: false }] })
  taxes: any[];

  // 5. Cloud Storage & Media Delivery
  @Prop({ default: 'local' })
  storageProvider: string;

  @Prop({ default: '' })
  cloudinaryCloudName?: string;

  @Prop({ default: '' })
  cloudinaryApiKey?: string;

  @Prop({ default: '' })
  cloudinaryApiSecret?: string;

  @Prop({ default: '' })
  awsS3Bucket?: string;

  @Prop({ default: '' })
  awsRegion?: string;

  // 6. Email & SMTP Server
  @Prop({ default: '' })
  smtpHost?: string;

  @Prop({ default: 587 })
  smtpPort: number;

  @Prop({ default: '' })
  smtpUser?: string;

  @Prop({ default: '' })
  smtpPass?: string;

  @Prop({ default: '' })
  smtpFromEmail?: string;

  @Prop({ default: 'RoomAI System' })
  smtpFromName?: string;

  // 7. System Controls & Credit Economy
  @Prop({ default: 50 })
  defaultUserCredits: number;

  @Prop({ default: 1 })
  creditsPerGeneration: number;

  @Prop({ default: 20 })
  maxRoomsPerProject: number;

  @Prop({ default: false })
  enableWatermark: boolean;

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop({ default: 'support@roomai.com' })
  supportEmail?: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
