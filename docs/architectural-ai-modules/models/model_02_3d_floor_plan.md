# Model 02: 3D Floor Plan (`3d-floor-plan`)

## 1. Overview
Converts 2D flat floor plan drawings into top-down isometric 3D cutaway renderings populated with floor textures and furniture layouts.

---

## 2. Technical Neural Architecture
* **Core Model**: `ControlNet Seg` (Segmentation) + `SDXL Isometric Cutaway Engine`.
* **Replicate Endpoint**: `jagilley/controlnet-seg` + `stability-ai/sdxl`.
* **Inference Parameters**: `num_inference_steps: 35`, `guidance_scale: 8.0`, `conditioning_scale: 0.90`.

---

## 3. Required User Inputs
| Input Field | Type | Options / Validation |
| :--- | :--- | :--- |
| **2D Blueprint Image** | File | Upload 2D floor plan PNG/PDF. |
| **Flooring Materials** | Select | `Light Oak Herringbone Wood`, `Polished Concrete`, `White Marble Tile`. |
| **Perspective View** | Select | `Isometric 45°`, `Top-Down 3D Cutaway`. |

---

## 4. Prompt Engineering Formula
```typescript
const prompt = `photorealistic 3d ${perspective} isometric architectural visualization of a floor plan layout, featuring ${flooring} flooring, modern furniture placement, octane render, 8k resolution, clean studio lighting`;
```

---

## 5. Step-by-Step Build Tasks
- [x] Register `3d-floor-plan` slug.
- [ ] Implement isometric prompt conditioning in NestJS backend.
- [ ] Add 2D Blueprint upload dropzone in generator UI.
