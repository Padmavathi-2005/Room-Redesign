# RoomAI - Monorepo AI SaaS Platform Architecture

Production-ready enterprise full-stack monorepo for **RoomAI**, an AI Interior Design Platform.

## 🏗️ Architecture Overview

The system is structured as a scalable, modular monorepo separated into `frontend` (Next.js 16 App Router) and `backend` (NestJS micro-modular architecture).

```
roomai/
├── frontend/             # Next.js 16 (React 19, Tailwind CSS, shadcn/ui, TanStack Query)
├── backend/              # NestJS (MongoDB Mongoose, Redis, Cloudinary, OpenAI/Replicate)
├── docs/                 # System architecture documentation & API specifications
├── docker/               # Containerization configurations (Frontend & Backend Dockerfiles)
├── docker-compose.yml    # Monorepo local orchestration (MongoDB, Redis, App services)
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Docker & Docker Compose (optional for containerized runtime)
- MongoDB Atlas account or local MongoDB instance
- Redis server instance (optional for queue processing)

### Quick Setup

1. **Install Root & Monorepo Dependencies**
   ```bash
   npm run install:all
   ```

2. **Environment Configuration**
   - Copy `.env.example` files to `.env` in both `frontend/` and `backend/` directories.
   - Configure your MongoDB connection string (`MONGODB_URI`) and API credentials.

3. **Development Mode**
   - Run Frontend: `npm run dev:frontend`
   - Run Backend: `npm run dev:backend`
   - Run both concurrently with Docker: `docker-compose up --build`

## 📊 API Versioning & Endpoints Summary
All backend APIs are scoped under `/api/v1`:
- `/api/v1/auth` - Authentication & JWT token management
- `/api/v1/users` - User profiles & preferences
- `/api/v1/projects` - User redesign projects
- `/api/v1/upload` - Image upload & Cloudinary signed URLs
- `/api/v1/ai` - AI interior design processing
- `/api/v1/prompt` - AI prompt templates & design styles
- `/api/v1/image` - Generated image history & metadata
- `/api/v1/payment` - Stripe payments & subscriptions
- `/api/v1/admin` - Admin analytics & platform settings

## 💳 Local Stripe Testing Documentation

To test Stripe Checkout payments and webhooks in local development (`localhost`):

1. **CLI Webhook Tunnel Setup**:
   ```powershell
   stripe login
   stripe listen --forward-to http://localhost:5000/api/v1/payments/webhook
   ```
2. **Webhook Signing Secret**:
   The `stripe listen` command outputs a local webhook signing secret (`whsec_...`). Copy this key into `backend/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. **Dual Verification Architecture**:
   - **Stripe Webhooks**: Primary production authority (`POST /api/v1/payments/webhook`).
   - **Return-Sync Flow**: Verified fallback (`POST /api/v1/subscription/confirm-checkout-success`).
   - Returning users hitting `/billing?checkout=success&session_id=cs_...` trigger a server-side Stripe SDK verification call (`stripe.checkout.sessions.retrieve`).
   - Durable period-level idempotency (`stripeSubscriptionId:currentPeriodEnd`) prevents double-crediting if both return-sync and webhooks execute.
