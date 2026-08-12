# RoomAI — Published Projects Marketplace, Wishlist & Monetization Architecture Specification

## 1. High-Level Ecosystem & System Flow

The **Published Projects Marketplace** enables RoomAI creators to publish, showcase, and monetize their AI room redesign projects within each topic model (`/generate?tool=<slug>`) and a centralized marketplace (`/marketplace`).

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
                               ROOMAI PUBLISHED PROJECTS ECOSYSTEM                          
                                                                                           
 ┌────────────────────────┐    ┌────────────────────────┐    ┌───────────────────────────┐ 
 │  Published Projects    │    │    Wishlist System     │    │   Creator Monetization    │ 
 │  Section per Model     │    │  (Heart Bookmark Cards)│    │   & Instant Payouts       │ 
 └───────────┬────────────┘    └───────────┬────────────┘    └─────────────┬─────────────┘ 
             │                             │                               │               
             └─────────────────────────────┼───────────────────────────────┘               
                                           ▼                                               
 ┌───────────────────────────────────────────────────────────────────────────────────────┐ 
 │                     PAYWALL & PREVIEW PROTECTION ENGINE                               │ 
 │ • Public View: 1 Sample Display Image + Metadata (Count, Room Types, Specs)           │ 
 │ • Purchased View: Unlocked 4K Renders, Original Photo, Prompts & Material Specs       │ 
 └───────────────────────────────────────────────────────────────────────────────────────┘ 
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. End-to-End Architectural Flows

### 2.1 Post-Generation Publishing & Paywall Flow

```
   [USER GENERATION STUDIO]              [BACKEND MARKETPLACE API]              [DATABASE / STORAGE]
              │                                      │                                    │
 1. Generation Complete (5 Renders)                  │                                    │
              │                                      │                                    │
 2. User Clicks "Publish Project"                    │                                    │
              │                                      │                                    │
 3. Select 1 Sample Image + Price ($15.00)           │                                    │
              ├─────────────────────────────────────►│                                    │
              │ POST /api/v1/marketplace/publish     │                                    │
              │                                      │ 4. Store Published Project Spec    │
              │                                      ├───────────────────────────────────►│
              │                                      │    (1 Sample URL, Locked URLs,     │
              │                                      │     Price, Metadata, Room Type)    │
              │◄─────────────────────────────────────┤                                    │
              │ 5. Returns Published Object          │                                    │
```

### 2.2 Public Unpurchased View vs Purchased Unlock Sequence

```
   [UNAUTHENTICATED / PUBLIC USER]        [SECURITY SANITIZER GUARD]             [BUYER (POST-PURCHASE)]
              │                                      │                                    │
 1. Request Project Detail                           │                                    │
              ├─────────────────────────────────────►│                                    │
              │ GET /api/v1/marketplace/:id          │                                    │
              │                                      │ 2. Check Purchase/Author Status    │
              │                                      ├───────┐                            │
              │                                      │       │ False (Unpurchased)        │
              │                                      │◄──────┘                            │
              │                                      │ 3. Strip locked URLs & prompts     │
              │◄─────────────────────────────────────┤                                    │
              │ 4. Returns 1 Sample Image            │                                    │
              │    + Metadata (Count, Room Type)     │                                    │
              │                                                                           │
              │                                                              5. Click "Unlock ($15.00)"
              │                                                                           ├────────► Stripe Payment
              │                                                                           │          (20% Platform Fee,
              │                                                                           │           80% Seller Wallet)
              │                                                                           │
              │                                      6. Returns Full Unlocked Object      │
              │◄──────────────────────────────────────────────────────────────────────────┤
              │    (All 4K Renders, Original Photo, Prompts & Finish Specs)             │
```

### 2.3 Wishlist Interaction Flow

```
   [USER INTERFACE]                     [WISHLIST CONTROLLER]                 [WISHLIST COLLECTION]
          │                                       │                                     │
 1. Click Heart Icon on Card                      │                                     │
          ├──────────────────────────────────────►│                                     │
          │ POST /api/v1/wishlist/toggle/:id      │                                     │
          │                                       │ 2. Upsert / Remove Compound Key     │
          │                                       ├────────────────────────────────────►│
          │                                       │    (userId + projectId)             │
          │◄──────────────────────────────────────┤                                     │
          │ 3. Returns { wishlisted: true/false } │                                     │
```

---

## 3. Core Feature Specifications

### 3.1 Topic Model Published Projects Section
- **Location**: Embedded inside each AI generator tool (`/generate?tool=<slug>`) as a **"Community Showcase & Inspiration"** section, and on the main `/marketplace` page.
- **Filtering**: Automatically scoped by the active topic model (`toolSlug`), room category (`Living Room`, `Bedroom`, `Kitchen`, `Bathroom`, `Office`, `Landscape`, etc.), price range, and search tags.
- **Card View Component**: Displays the **1 sample display image**, project title, author badge, price tag ($ USD), room type pill, render count badge (e.g., "5 Renders"), and **Wishlist Heart Icon**.

### 3.2 Wishlist System
- Authenticated users can click the **Heart Icon** to add/remove a project from their personal collection.
- **Backend Toggle Endpoint**: `POST /api/v1/wishlist/toggle/:projectId`.
- **Wishlist Dashboard**: Accessible via `/dashboard/wishlist` allowing users to view, sort, and purchase saved designs.

### 3.3 Post-Generation Publishing Modal
When a user completes an AI room redesign generation task:
1. **Publish Modal Prompt**: Prompted with *"Publish your redesign to the Community Marketplace & earn from sales!"*
2. **Publish Form Parameters**:
   - **Project Title & Description**.
   - **Set Price**: Free ($0) or custom price set by creator (e.g., $5.00, $15.00, $50.00).
   - **Sample Image Selection**: Creator selects **exactly 1 image** from the generated batch to serve as the free public preview display image.
   - **Category Tags**: Room type (`Living Room`, `Bedroom`, etc.), architectural style, materials, lighting.
3. **Database Status**: Saved with `status: 'published'`.

### 3.4 Paywall & Data Access Protection Model
Backend security sanitization ensures unpurchased projects do not expose full-resolution outputs or non-sample images:

| Access State | Sample Display Image | Locked Remaining Renders | Project Metadata | Prompts & Material Specs |
|---|---|---|---|---|
| **Public / Unpurchased** | Visible (Watermarked Preview) | **Locked / Hidden** (Padlock Overlay) | **Visible** (Render Count, Room Type, Style Tags) | **Hidden** |
| **Buyer (Purchased)** | Visible (4K High-Res) | **Unlocked** (4K High-Res + Original Photo) | **Visible** | **Unlocked** (Full Prompts & Finishes) |
| **Seller (Author)** | Full Access | Full Access | Full Access | Full Access |

> [!IMPORTANT]
> The backend `GET /api/v1/marketplace/:id` endpoint dynamically sanitizes the response JSON. If `requesterId !== authorId` and `hasPurchased === false`, array fields `lockedImages` and `promptDetails` are stripped from the response object payload.

### 3.5 Monetization & Revenue Distribution Engine
1. **Purchase Transaction**: Buyer clicks **"Unlock Full Project ($15.00)"**.
2. **Payment Execution**: Handled via Stripe PaymentIntent (`POST /api/v1/marketplace/:id/purchase`) or user platform credits.
3. **Automated 80/20 Revenue Split**:
   - **Platform Fee**: Platform retains a 20% commission fee ($3.00 on a $15.00 sale).
   - **Seller Net Earnings**: 80% ($12.00) is credited directly to the author user's `UserWallet` balance.
4. **Creator Payout & Notifications**:
   - Real-time notification dispatched to seller: *"Your project 'Modern Scandinavian Studio' was purchased! $12.00 credited to your wallet."*
   - Sellers manage earnings stats and trigger Stripe Express payouts via `/dashboard/earnings`.

---

## 4. Database Schemas & Data Contracts (Mongoose)

### 4.1 `PublishedProject` Collection (`published_projects`)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PublishedProjectDocument = PublishedProject & Document;

@Schema({ timestamps: true, collection: 'published_projects' })
export class PublishedProject {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  sourceProjectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, default: 0 }) // Price in USD ($0 = free)
  price: number;

  @Prop({ required: true, index: true }) // e.g., 'interior-design', 'floor-plan-generator'
  toolSlug: string;

  @Prop({ required: true, index: true }) // e.g., 'Living Room', 'Bedroom', 'Kitchen'
  roomType: string;

  @Prop()
  style: string;

  @Prop({ required: true }) // Cloudinary URL for the single free sample preview
  sampleImageUrl: string;

  @Prop({ type: [String], default: [] }) // Cloudinary URLs locked until purchased
  lockedImageUrls: string[];

  @Prop() // Cloudinary URL for original uploaded photo
  originalImageUrl: string;

  @Prop({ default: 1 }) // Total count of images in the set
  totalImageCount: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: 0 })
  wishlistCount: number;

  @Prop({ default: 'published', enum: ['published', 'draft', 'archived'] })
  status: string;
}

export const PublishedProjectSchema = SchemaFactory.createForClass(PublishedProject);
```

### 4.2 `ProjectPurchase` Collection (`project_purchases`)
```typescript
@Schema({ timestamps: true, collection: 'project_purchases' })
export class ProjectPurchase {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PublishedProject', required: true, index: true })
  projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amountPaid: number;

  @Prop({ required: true })
  platformFee: number; // 20% platform commission

  @Prop({ required: true })
  sellerEarnings: number; // 80% net credited

  @Prop({ required: true })
  stripePaymentIntentId: string;

  @Prop({ default: 'completed', enum: ['pending', 'completed', 'refunded'] })
  status: string;
}
```

### 4.3 `Wishlist` Collection (`wishlists`)
```typescript
@Schema({ timestamps: true, collection: 'wishlists' })
export class Wishlist {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PublishedProject', required: true, index: true })
  projectId: MongooseSchema.Types.ObjectId;
}

// Compound index enforcing uniqueness per user & project
WishlistSchema.index({ userId: 1, projectId: 1 }, { unique: true });
```

### 4.4 `UserWallet` Collection (`user_wallets`)
```typescript
@Schema({ timestamps: true, collection: 'user_wallets' })
export class UserWallet {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  balance: number; // Cash balance ($ USD)

  @Prop({ default: 0 })
  totalEarned: number; // Lifetime total earnings

  @Prop()
  stripeConnectAccountId: string; // Stripe Express payout account
}
```

---

## 5. API v1 Endpoint Map

| Method | Endpoint | Description | Auth | Response Security |
|---|---|---|---|---|
| `GET` | `/api/v1/marketplace` | List published projects by `toolSlug`, `roomType`, `style` | Optional | Sanitized (1 Sample + Metadata) |
| `GET` | `/api/v1/marketplace/:id` | Fetch single project detail & image set | Optional | Sanitized unless Buyer or Author |
| `POST` | `/api/v1/marketplace/publish` | Publish generated project with price & sample choice | Yes | Returns created `PublishedProject` |
| `POST` | `/api/v1/marketplace/:id/purchase` | Initiate Stripe unlock payment (80% seller / 20% platform) | Yes | Returns unlock transaction |
| `POST` | `/api/v1/wishlist/toggle/:id` | Toggle project in user wishlist | Yes | Returns `{ wishlisted: boolean, count: number }` |
| `GET` | `/api/v1/wishlist` | Fetch wishlisted projects for user | Yes | Returns array of `PublishedProject` cards |
| `GET` | `/api/v1/users/earnings` | Fetch seller earnings & balance | Yes | Returns balance & sales audit |

---

## 6. Implementation Action Plan

- [x] **Architecture Specification**: Detailed in `docs/published_projects_marketplace_plan.md`.
- [x] **Master Flow & API Index**: Integrated into `00_master_architecture_flow.md`, `api-v1-spec.md`, and `architecture.md`.
- [ ] **Mongoose Schemas**: Implement `PublishedProject`, `ProjectPurchase`, `Wishlist`, and `UserWallet` in `backend/src/modules/marketplace/schemas/`.
- [ ] **Marketplace Backend Module**: Implement `MarketplaceController` and `MarketplaceService` handling publish flows, paywall sanitization, purchase payouts, and wishlist toggles.
- [ ] **Frontend Components**: Build `TopicModelShowcase.tsx`, `PublishModal.tsx`, `ProjectCard.tsx`, and `ProjectDetailPaywall.tsx`.
