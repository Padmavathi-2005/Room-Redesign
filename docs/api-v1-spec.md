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
