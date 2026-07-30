# RoomAI Architectural Blueprint

## System Core Modules

### 1. Frontend Layer (Next.js 16 App Router)
- **App Router Layouts**: Separated into `(auth)` group routes and `(dashboard)` group routes.
- **State & Data Fetching**: TanStack Query (React Query) for server state management combined with Axios client instances.
- **Form Controls & Validation**: React Hook Form with Zod schema validation.
- **UI Engine**: Tailwind CSS, custom design system utilities, Framer Motion animations, and shadcn/ui components.

### 2. Backend Layer (NestJS Modular Micro-Architecture)
- **Authentication (`modules/auth`)**: JWT strategy, refresh token rotation, bcrypt password hashing, and Guard protection.
- **User Management (`modules/users`)**: Profile data, user preferences, and usage quotas.
- **Project Management (`modules/projects`)**: Room transformation workspaces, version history, and tags.
- **Upload & Storage (`modules/uploads`, `modules/storage`)**: Cloudinary integration with pre-signed upload parameters and secure image storage.
- **AI Core (`modules/ai`, `modules/room-analysis`, `modules/image-generation`)**: Replicate & OpenAI API connectors for interior design image generation and prompt construction.
- **Queue & Async Processing (`jobs/`, `queue/`)**: BullMQ & Redis infrastructure for handling background AI generation tasks cleanly.
- **Billing & Subscriptions (`modules/billing`, `modules/payments`, `modules/subscription`)**: Stripe Webhook listeners and subscription plan tier validation.

### 3. Database Schema (MongoDB Mongoose Collections)
- `users`: Core account details, auth provider, role, subscription tier.
- `projects`: Workspace collections organizing user uploads and AI outputs.
- `original_images`: Metadata for user uploaded room photos.
- `generated_images`: Rendered redesign outputs, prompt parameters, style references.
- `design_styles`: Supported themes (Modern, Scandinavian, Minimalist, Industrial, Luxury).
- `room_types`: Supported space categories (Living Room, Bedroom, Office, Kitchen).
- `prompt_templates`: Optimized diffusion prompt builders.
- `generation_logs`: Audit logs for AI API usage, timing, latency, and credit usage.
- `subscriptions`: Active user membership statuses and plan details.
- `payments`: Processed transaction records and invoice receipts.
- `notifications`: User alert feeds.
