# Model 01: Floor Plan Generator (`floor-plan-generator`)

## 1. Overview
Generates clean 2D architectural blueprint layouts from user dimension requirements and room program specs.

---

## 2. Technical Neural Architecture
* **Core Model**: `ControlNet Lineart` + `SDXL Blueprint Fine-Tune`.
* **Replicate Endpoint**: `stability-ai/sdxl` + ControlNet Lineart Adapter.
* **Inference Parameters**: `num_inference_steps: 30`, `guidance_scale: 7.5`, `conditioning_scale: 0.85`.

---

## 3. Required User Inputs
| Input Field | Type | Options / Validation |
| :--- | :--- | :--- |
| **Room Program Specs** | Form | Number of Bedrooms, Bathrooms, Kitchen type, Living area size. |
| **Architectural Style** | Select | `Modern`, `Minimalist`, `Traditional`, `Open-Concept`. |
| **Plot Dimensions** | Text | e.g., `40ft x 60ft`. |

---

## 4. Prompt Engineering Formula
```typescript
const prompt = `photorealistic 2d architectural floor plan blueprint layout, crisp black vector lines on clean white background, ${bedrooms} bedrooms, ${bathrooms} bathrooms, ${style} style, room labels, dimension markers, 8k resolution, professional architectural drawing`;
```

---

## 5. Step-by-Step Build Tasks
- [x] Register `floor-plan-generator` slug in `room-types.service.ts`.
- [x] Implement `FloorPlanPromptBuilder` in `backend/src/modules/prompt/builders/floorplan-prompt.builder.ts`.
- [x] Build 2D Blueprint parameter input form on frontend (`generate/page.tsx`).
- [x] Connect Replicate ControlNet Lineart pipeline dispatcher in `PromptBuilderService`.
