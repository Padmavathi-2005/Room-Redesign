# RoomAI API v1 Specification

All API routes are prefixed with `/api/v1`.

## Module Route Maps

| Module Route | Description | Auth Required |
|---|---|---|
| `POST /api/v1/auth/login` | Authenticate user with credentials | No |
| `POST /api/v1/auth/register` | Register new user account | No |
| `POST /api/v1/auth/refresh` | Refresh JWT access tokens | Yes |
| `GET /api/v1/users/me` | Fetch active user profile | Yes |
| `GET /api/v1/projects` | List user room redesign projects | Yes |
| `POST /api/v1/projects` | Create a new project workspace | Yes |
| `POST /api/v1/upload/presigned` | Request Cloudinary direct upload signature | Yes |
| `POST /api/v1/ai/generate` | Trigger AI room redesign generation task | Yes |
| `GET /api/v1/ai/status/:jobId` | Poll background generation job status | Yes |
| `GET /api/v1/prompt/styles` | Fetch available interior design styles | No |
| `GET /api/v1/image/history` | Paginated list of generated redesigns | Yes |
| `POST /api/v1/payment/checkout` | Initialize Stripe checkout session | Yes |
| `POST /api/v1/payment/webhook` | Listen for Stripe events | Webhook Signature |
| `GET /api/v1/admin/analytics` | Platform metrics & usage stats | Admin Guard |
| `GET /api/v1/marketplace` | List published projects by tool slug/room type (Sanitized preview) | Optional |
| `GET /api/v1/marketplace/:id` | Fetch project details (Full access if buyer/author, else 1 sample + metadata) | Optional |
| `POST /api/v1/marketplace/publish` | Publish generated project to Marketplace with price & 1 sample image | Yes |
| `POST /api/v1/marketplace/:id/purchase` | Unlock published project (80% credited to seller, 20% platform fee) | Yes |
| `POST /api/v1/wishlist/toggle/:id` | Add/remove project from user wishlist | Yes |
| `GET /api/v1/wishlist` | Fetch active user wishlisted projects | Yes |
| `GET /api/v1/users/earnings` | Fetch seller payout balance & transaction logs | Yes |

