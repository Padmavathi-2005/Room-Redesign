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

## 🔒 Security & Best Practices
- Strict TypeScript configurations across all modules
- Modular dependency injection with NestJS
- Clean architecture and feature-based folder structure
- Global Exception Filters & Data Transfer Objects (DTOs) with class-validator
