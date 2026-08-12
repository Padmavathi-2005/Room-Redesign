# RoomAI Platform — Master Architecture & Complete 18-Tool System Flow

This document serves as the **single source of truth** for the entire RoomAI Architectural & Interior AI Platform.

---

## 1. System Flow & Execution Architecture

```
                                ┌───────────────────────────────────────────────────┐
                                │      User Interaction & Tool Header Dropdown      │
                                └─────────────────────────┬─────────────────────────┘
                                                          │
                                ┌─────────────────────────▼─────────────────────────┐
                                │   Frontend Generator UI  (/generate?tool=<slug>)   │
                                └─────────────────────────┬─────────────────────────┘
                                                          │
                                ┌─────────────────────────▼─────────────────────────┐
                                │    NestJS Backend Controller & Auth Guard         │
                                └─────────────────────────┬─────────────────────────┘
                                                          │
                                ┌─────────────────────────▼─────────────────────────┐
                                │  PromptModule: 12-Stage Prompt Construction Engine│
                                └─────────────────────────┬─────────────────────────┘
                                                          │
                                ┌─────────────────────────▼─────────────────────────┐
                                │ Replicate API Provider Dispatcher (ControlNet/SDXL)│
                                └─────────────────────────┬─────────────────────────┘
                                                          │
                                ┌─────────────────────────▼─────────────────────────┐
                                │  Cloudinary Storage & Before/After Comparison View│
                                └─────────────────────────┬─────────────────────────┘
                                                          │
                                ┌─────────────────────────▼─────────────────────────┐
                                │   Post-Generation Prompt: "Publish to Marketplace" │
                                └─────────────────────────┬─────────────────────────┘
                                                          │
            ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
            │                                                                                           │
┌───────────▼─────────────────────────┐                                           ┌─────────────────────▼─────────────────────┐
│ UNPURCHASED / PUBLIC PREVIEW        │                                           │ PURCHASE & CREATOR PAYOUT ENGINE          │
│ • Display 1 Watermarked Sample      │                                           │ • Buyer unlocks via Stripe / Credits      │
│ • Lock remaining renders            │                                           │ • Platform Fee (20%) deducted             │
│ • Metadata (Count, Room Type, Specs)│                                           │ • Seller Balance Credited (80% / $12.00)  │
│ • Wishlist Heart Bookmark Button    │                                           │ • Real-time sales alert & notification    │
└─────────────────────────────────────┘                                           └───────────────────────────────────────────┘
```

---

## 2. Documentation & Design Index

* **[UI/UX Design System & Studio Layout Plan](./01_ui_ux_design_plan.md)** — UI Mockups, Visual Aesthetics, Component Hierarchy & Layout Plan.
* **[Published Projects Marketplace & Monetization Architecture](../published_projects_marketplace_plan.md)** — Wishlist, 1-Sample Image Paywall, Metadata View & Revenue Split Payout Specification.
* **[Index of All 18 Specialized Models](#3-index-of-all-18-specialized-model-specifications)** — Individual model specs and technical build guidelines.

---

## 3. Index of All 18 Specialized Model Specifications

All 18 tools are organized into 3 domain categories. Click any model to view its full technical spec:

### Category 1: Floor Plan Models
1. **[Model 01: Floor Plan Generator](./models/model_01_floor_plan_generator.md)** — 2D Blueprint Layout Generator (`ControlNet Lineart`).
2. **[Model 02: 3D Floor Plan](./models/model_02_3d_floor_plan.md)** — 2D Blueprint to 3D Isometric Cutaway (`ControlNet Seg`).
3. **[Model 03: Floor Plan Maker](./models/model_03_floor_plan_maker.md)** — Interactive Canvas Wall Vector Parser.

### Category 2: Interior Suite Models
4. **[Model 04: Interior Design](./models/model_04_interior_design.md)** — Full Room Restyling for 40+ Room Types (`ControlNet MLSD`).
5. **[Model 05: AI Room Decorator](./models/model_05_ai_room_decorator.md)** — Empty Room Virtual Staging (`SAM` + `ControlNet Depth Inpainting`).
6. **[Model 06: AI Room Cleaner](./models/model_06_ai_room_cleaner.md)** — Decluttering & Object Removal (`GroundingDINO` + `LAMA`).
7. **[Model 07: Paint Color Visualizer](./models/model_07_paint_color_visualizer.md)** — Wall Paint & Texture Editor (`SAM Masking`).
8. **[Model 08: Style Transfer](./models/model_08_style_transfer.md)** — Aesthetic & Material Transfer (`IP-Adapter`).
9. **[Model 09: Change Room Light](./models/model_09_change_room_light.md)** — Relighting & Illumination Control (`IC-Light`).
10. **[Model 10: AI Wall Design](./models/model_10_ai_wall_design.md)** — Accent Wall & Slatted Wood Panel Inpainting.

### Category 3: Exterior & Architecture Models
11. **[Model 11: Exterior Design](./models/model_11_exterior_design.md)** — Home Facade & Siding Restyling (`ControlNet HED`).
12. **[Model 12: Landscape Design](./models/model_12_landscape_design.md)** — Yard, Pool & Patio Design Engine (`ControlNet HED`).
13. **[Model 13: Garden Design](./models/model_13_garden_design.md)** — Botanical Gardens & Pathways Diffusion.
14. **[Model 14: Change Sky](./models/model_14_change_sky.md)** — Sky Replacement & Lighting Color Temperature (`BiRefNet`).
15. **[Model 15: Sketch to Render](./models/model_15_sketch_to_render.md)** — Hand Sketch / Pencil Drawing to 3D Render (`ControlNet Scribble`).
16. **[Model 16: AI Architecture Generator](./models/model_16_ai_architecture_generator.md)** — Architectural Building Concept Generator (`SDXL ArchViz`).
17. **[Model 17: AI Blueprint Generator](./models/model_17_ai_blueprint_generator.md)** — Structural Elevation & CAD Blueprint Generator.
18. **[Model 18: Change Furniture AI](./models/model_18_change_furniture_ai.md)** — Target Furniture Item Replacement (`SAM`).

---

## 3. Global Task-by-Task Implementation Plan

- [x] **Task 1 — Central Tool Registry**: Register all 18 tools in `uploads.service.ts` and `producttools` MongoDB collection.
- [x] **Task 2 — Prompt Engine Synthesizer**: Modular prompt builders under `backend/src/modules/prompt/builders/`.
- [x] **Task 3 — Navigation Header Menu**: Dropdown header displaying 4 space categories and 20+ tools.
- [x] **Task 4 — Generator Form Routing**: `/generate?tool=<tool-slug>` dynamically loading tool parameters, badges, and controls.
- [x] **Task 5 — Interactive Before/After Console & Admin Manager**: Side-by-side Original vs Converted AI comparison cards on `/tools` and full Table Manager on `/admin/models` storing uploaded images in `/uploads/images/`.
- [x] **Task 6 — Community Marketplace & Wishlist Architecture**: Created comprehensive spec in `docs/published_projects_marketplace_plan.md` covering Wishlist, 1-sample paywall preview, creator price setting, and 80/20 revenue payout logic.

