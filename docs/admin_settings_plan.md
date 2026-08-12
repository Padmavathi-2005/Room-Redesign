# RoomAI Admin Panel — Comprehensive Settings & API Integration Specification

## 1. Executive Summary & Architecture Overview

The **Admin Settings Console** (`/admin/settings`) provides system administrators with centralized control over authentication providers, AI generation engine tokens, payment gateways, cloud storage, SMTP email services, credit economy controls, and UI theme customization.

---

## 2. Categorized Admin Settings Breakdown

```
                                ┌─────────────────────────────────────────────────────────┐
                                │             Admin Settings Console (/admin/settings)   │
                                └────────────────────────────┬────────────────────────────┘
                                                             │
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         │                   │                   │                   │                   │
┌────────┴────────┐ ┌────────┴────────┐ ┌────────┴────────┐ ┌────────┴────────┐ ┌────────┴────────┐
│  Social Logins  │ │  AI Engine Keys │ │ Payment Gateway │ │  Cloud Storage  │ │ System & Credits│
│ (Google/Apple)  │ │(Replicate/OpenAI)││    (Stripe)     │ │ (Cloudinary/S3) │ │ (Economy/Theme) │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 3. Detailed Setting Modules & Required Schema Fields

### Module 1: Social Login & OAuth Credentials
Allows administrators to configure and toggle Google and Apple single sign-on (SSO) authentication.

| Setting Name | Environment Variable / DB Key | Type | Description / Usage |
|---|---|---|---|
| **Enable Google Login** | `enableGoogleLogin` | Boolean | Toggle Google OAuth sign-in button on Login & Register modals. |
| **Google Client ID** | `GOOGLE_CLIENT_ID` | String | Google OAuth 2.0 Client ID generated in Google Cloud Console. |
| **Google Client Secret** | `GOOGLE_CLIENT_SECRET` | String (Masked) | Google OAuth 2.0 Client Secret key. |
| **Google Redirect URI** | `GOOGLE_CALLBACK_URL` | String | Authorized redirect URL e.g., `https://yourdomain.com/api/v1/auth/google/callback`. |
| **Enable Apple Login** | `enableAppleLogin` | Boolean | Toggle Sign in with Apple button for iOS and web users. |
| **Apple Services ID** | `APPLE_CLIENT_ID` | String | Apple Developer Services ID identifier. |
| **Apple Team ID** | `APPLE_TEAM_ID` | String | 10-character Apple Developer Team ID. |
| **Apple Key ID** | `APPLE_KEY_ID` | String | Key ID for Sign in with Apple private key. |
| **Apple Private Key** | `APPLE_PRIVATE_KEY` | String (Masked) | Encrypted `.p8` private key file content. |

---

### Module 2: AI Engine & Generation API Tokens
Configures API authentication tokens for AI generation models (SDXL, ControlNet, IC-Light, SAM).

| Setting Name | Environment Variable / DB Key | Type | Description / Usage |
|---|---|---|---|
| **Primary AI Provider** | `primaryAiProvider` | Enum (`replicate` \| `openai` \| `huggingface`) | Primary dispatch engine for image generation. |
| **Replicate API Token** | `REPLICATE_API_TOKEN` | String (Masked) | Replicate API key for ControlNet, SDXL, and Inpainting models. |
| **OpenAI API Key** | `OPENAI_API_KEY` | String (Masked) | OpenAI API key for GPT-4o vision prompt enhancement. |
| **HuggingFace Access Token** | `HUGGINGFACE_TOKEN` | String (Masked) | Backup token for HuggingFace Inference API endpoints. |
| **AI Timeout (Seconds)** | `aiGenerationTimeout` | Number | Maximum allowed seconds before timing out a generation request. |

---

### Module 3: Payment Gateway & Subscription Keys
Manages Stripe payment processing, webhook verification, and test/sandbox modes.

| Setting Name | Environment Variable / DB Key | Type | Description / Usage |
|---|---|---|---|
| **Stripe Enable Sandbox** | `stripeTestMode` | Boolean | Switch between Stripe Test Keys and Production Live Keys. |
| **Stripe Publishable Key** | `STRIPE_PUBLISHABLE_KEY` | String | Client-side publishable key for Stripe Elements checkout. |
| **Stripe Secret Key** | `STRIPE_SECRET_KEY` | String (Masked) | Server-side secret key for subscriptions and credit top-ups. |
| **Stripe Webhook Secret** | `STRIPE_WEBHOOK_SECRET` | String (Masked) | Secret key for validating incoming `payments/webhook` signatures. |

---

### Module 4: Cloud Storage & Media Delivery
Configures image file storage for original uploads and AI generated renders.

| Setting Name | Environment Variable / DB Key | Type | Description / Usage |
|---|---|---|---|
| **Storage Provider** | `storageProvider` | Enum (`local` \| `cloudinary` \| `s3`) | Storage destination for generated 8K images. |
| **Cloudinary Cloud Name** | `CLOUDINARY_CLOUD_NAME` | String | Cloudinary cloud account name. |
| **Cloudinary API Key** | `CLOUDINARY_API_KEY` | String | Cloudinary API access key. |
| **Cloudinary API Secret** | `CLOUDINARY_API_SECRET` | String (Masked) | Cloudinary API secret key. |
| **AWS S3 Bucket Name** | `AWS_S3_BUCKET` | String | Amazon S3 storage bucket name. |
| **AWS S3 Region** | `AWS_REGION` | String | AWS datacenter region (e.g. `us-east-1`). |

---

### Module 5: Email & SMTP Notification Server
Configures automated transactional email delivery for welcome emails, password resets, and credit receipts.

| Setting Name | Environment Variable / DB Key | Type | Description / Usage |
|---|---|---|---|
| **SMTP Server Host** | `SMTP_HOST` | String | Mail server hostname (e.g., `smtp.sendgrid.net` or `smtp.gmail.com`). |
| **SMTP Port** | `SMTP_PORT` | Number | Port number (`587` for TLS, `465` for SSL). |
| **SMTP Username** | `SMTP_USER` | String | Email server login username. |
| **SMTP Password** | `SMTP_PASS` | String (Masked) | Email server password / App Password. |
| **Sender Email Address** | `SMTP_FROM_EMAIL` | String | Official address e.g. `noreply@yourdomain.com`. |
| **Sender Display Name** | `SMTP_FROM_NAME` | String | Display name shown in user inbox (e.g., `Dehome AI`). |

---

### Module 6: System Controls & Credit Economy
Controls signup rewards, credit pricing, watermarking, and maintenance mode.

| Setting Name | DB Key | Default Value | Description / Usage |
|---|---|---|---|
| **Default Signup Credits** | `defaultUserCredits` | `40` | Free credits awarded immediately upon new user registration. |
| **Default Generation Cost** | `defaultModelCreditCost` | `4` | Credits deducted per standard room generation. |
| **Watermark Free Renders** | `enableWatermark` | `false` | Apply logo watermark on free-tier generated images. |
| **Maintenance Mode** | `maintenanceMode` | `false` | Temporarily block generation requests with a maintenance banner. |
| **Support Email** | `supportEmail` | `support@dehome.ai` | Contact email displayed on help modals and footers. |

---

## 4. Proposed Database Schema Model (`SystemSettings`)

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemSettingsDocument = SystemSettings & Document;

@Schema({ timestamps: true, collection: 'settings' })
export class SystemSettings {
  // Theme & Branding
  @Prop({ default: 'Dehome AI' })
  applicationName: string;

  @Prop({ default: '#6366F1' })
  primaryColor: string;

  @Prop({ default: '#8B5CF6' })
  secondaryColor: string;

  @Prop({ default: '#06B6D4' })
  accentColor: string;

  // Social Auth
  @Prop({ default: false })
  enableGoogleLogin: boolean;

  @Prop({ default: '' })
  googleClientId: string;

  @Prop({ default: '' })
  googleClientSecret: string;

  @Prop({ default: false })
  enableAppleLogin: boolean;

  @Prop({ default: '' })
  appleClientId: string;

  // AI Keys
  @Prop({ default: '' })
  replicateApiKey: string;

  @Prop({ default: '' })
  openaiApiKey: string;

  // Payments
  @Prop({ default: '' })
  stripeSecretKey: string;

  @Prop({ default: '' })
  stripeWebhookSecret: string;

  // Storage
  @Prop({ default: 'local' })
  storageProvider: string;

  @Prop({ default: '' })
  cloudinaryCloudName: string;

  @Prop({ default: '' })
  cloudinaryApiKey: string;

  @Prop({ default: '' })
  cloudinaryApiSecret: string;

  // System Economy
  @Prop({ default: 40 })
  defaultUserCredits: number;

  @Prop({ default: false })
  maintenanceMode: boolean;
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);
```

---

## 5. UI/UX Layout Plan for `/admin/settings`

The page will be organized into **Tabbed Accordion Sections**:
1. 🎨 **Branding & Visual System** (App name, colors, border radius, glass opacity)
2. 🔑 **Social Login & OAuth Keys** (Google Client ID/Secret, Apple Key ID/Private Key toggles)
3. ⚡ **AI Model Providers & Tokens** (Replicate API token, OpenAI key, timeout settings)
4. 💳 **Stripe Payment Gateway** (Sandbox toggle, Publishable & Secret keys, Webhook secret)
5. ☁️ **Cloud Storage & Deliveries** (Provider selection, Cloudinary / S3 credentials)
6. 📧 **Email & SMTP Server** (SMTP host, port, credentials, sender address)
7. ⚙️ **Credit Economy & System Toggles** (Default signup credits, watermark, maintenance mode)

---

## 6. Implementation Action Plan

- [x] **Analysis & Specs**: Created comprehensive architecture blueprint in `docs/admin_settings_plan.md`.
- [ ] **Backend Settings Controller & Service**: Add `GET /api/v1/admin/settings` and `PATCH /api/v1/admin/settings` in `backend/src/modules/admin/`.
- [ ] **Frontend Tabbed UI**: Update `frontend/src/app/admin/settings/page.tsx` with Google Auth, Apple Auth, Stripe, and Replicate API forms.
- [ ] **Auth Integration**: Update NestJS `auth.module.ts` and Passport Google strategy to load `googleClientId` dynamically from settings.
