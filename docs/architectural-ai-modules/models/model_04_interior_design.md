# Model 04: Interior Design (`interior-design`)

## 1. Overview
Full interior room restyling across 40+ room categories while preserving wall and window geometry.

---

## 2. Technical Neural Architecture
* **Core Model**: `ControlNet MLSD` (Straight Line Segment Detection) / `ControlNet Depth` + `SDXL Interior`.
* **Replicate Endpoint**: `jagilley/controlnet-mlsd`.

---

## 3. Required User Inputs
| Input Field | Type | Options / Validation |
| :--- | :--- | :--- |
| **Room Photo** | File | Original photo of the interior room. |
| **Room Type** | Select | 40+ categories (`Living Room`, `Bedroom`, `Kitchen`, `Bathroom`, `Office`, etc.). |
| **Design Style** | Grid | `Modern`, `Japandi`, `Scandinavian`, `Industrial`, `Luxury`, `Boho`. |
| **Color Palette** | Select | `Warm Neutrals`, `Earthy Tones`, `Emerald Luxury`, `Monochrome`. |
| **Materials** | Multi-Select | `Marble`, `Light Oak Wood`, `Velvet`, `Brass Accents`. |
| **Lighting** | Select | `Natural Daylight`, `Golden Hour`, `RGB Neon`, `Recessed LED`. |
| **Custom Prompt** | Textarea | Optional user custom instructions. |

---

## 4. Prompt Engineering Formula
```typescript
const prompt = `A high-end photorealistic 8k architectural photograph of a ${roomType}, designed in ${style} style, featuring ${materials.join(', ')} finishes, ${colorPalette} color scheme, illuminated by ${lighting}, custom detail: ${customMessage}, Architectural Digest quality, octane render, 8k resolution`;
```

---

## 5. Step-by-Step Build Tasks
- [x] Create `InteriorPromptBuilder` in `backend/src/modules/prompt/builders/interior-prompt.builder.ts`.
- [x] Seed 40+ room types in `room-types.service.ts`.
- [ ] Connect Replicate MLSD ControlNet pipeline.
