import {
  IsEnum,
  IsHexColor,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ThemeMode } from '../schemas/setting.schema';

export class UpdateSettingsDto {
  // 1. Branding & Visual System
  @IsOptional()
  @IsString()
  applicationName?: string;

  @IsOptional()
  @IsEnum(ThemeMode)
  activeTheme?: ThemeMode;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsHexColor()
  textColor?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  borderRadius?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  glassOpacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  blurStrength?: number;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  // 2. Social Login & OAuth Credentials
  @IsOptional()
  @IsBoolean()
  enableGoogleLogin?: boolean;

  @IsOptional()
  @IsString()
  googleClientId?: string;

  @IsOptional()
  @IsString()
  googleClientSecret?: string;

  @IsOptional()
  @IsString()
  googleCallbackUrl?: string;

  @IsOptional()
  @IsBoolean()
  enableAppleLogin?: boolean;

  @IsOptional()
  @IsString()
  appleClientId?: string;

  @IsOptional()
  @IsString()
  appleTeamId?: string;

  @IsOptional()
  @IsString()
  appleKeyId?: string;

  @IsOptional()
  @IsString()
  applePrivateKey?: string;

  // 3. AI Engine & API Tokens
  @IsOptional()
  @IsString()
  primaryAiProvider?: string;

  @IsOptional()
  @IsString()
  replicateApiKey?: string;

  @IsOptional()
  @IsString()
  openaiApiKey?: string;

  @IsOptional()
  @IsString()
  huggingfaceToken?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  aiGenerationTimeout?: number;

  // 4. Stripe Payment Gateway
  @IsOptional()
  @IsBoolean()
  stripeTestMode?: boolean;

  @IsOptional()
  @IsString()
  stripePublishableKey?: string;

  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  @IsOptional()
  @IsString()
  stripeWebhookSecret?: string;

  // 5. Cloud Storage & Media Delivery
  @IsOptional()
  @IsString()
  storageProvider?: string;

  @IsOptional()
  @IsString()
  cloudinaryCloudName?: string;

  @IsOptional()
  @IsString()
  cloudinaryApiKey?: string;

  @IsOptional()
  @IsString()
  cloudinaryApiSecret?: string;

  @IsOptional()
  @IsString()
  awsS3Bucket?: string;

  @IsOptional()
  @IsString()
  awsRegion?: string;

  // 6. Email & SMTP Server
  @IsOptional()
  @IsString()
  smtpHost?: string;

  @IsOptional()
  @IsNumber()
  smtpPort?: number;

  @IsOptional()
  @IsString()
  smtpUser?: string;

  @IsOptional()
  @IsString()
  smtpPass?: string;

  @IsOptional()
  @IsString()
  smtpFromEmail?: string;

  @IsOptional()
  @IsString()
  smtpFromName?: string;

  // 7. System Controls & Credit Economy
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultUserCredits?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  creditsPerGeneration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRoomsPerProject?: number;

  @IsOptional()
  @IsBoolean()
  enableWatermark?: boolean;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsString()
  supportEmail?: string;
}
