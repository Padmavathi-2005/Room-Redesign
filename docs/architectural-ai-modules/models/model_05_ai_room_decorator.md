# Model 05: AI Room Decorator (`ai-room-decorator`)

## 1. Overview
Virtual staging engine for empty, unfurnished rooms.

---

## 2. Technical Neural Architecture
* **Core Model**: `Segment Anything Model (SAM)` + `ControlNet Depth` + `SDXL Inpainting`.
* **Replicate Endpoint**: `facebook/sam` + `stability-ai/sdxl-inpainting`.

---

## 3. Required User Inputs
| Input Field | Type | Options / Validation |
| :--- | :--- | :--- |
| **Empty Room Photo** | File | Upload bare room image. |
| **Room Function** | Select | `Master Bedroom`, `Living Room`, `Executive Office`, `Dining Room`. |
| **Staging Density** | Select | `Minimalist`, `Standard`, `Luxury`. |
| **Furniture Items** | Multi-Select | `L-Sectional Sofa`, `Platform Bed`, `Dining Table`, `Bookshelves`. |
| **Design Style** | Select | `Japandi`, `Scandinavian`, `Modern Luxury`. |

---

## 4. Step-by-Step Build Tasks
- [ ] Connect SAM floor/wall segmentation pre-pass.
- [ ] Build Staging Density slider in UI.
- [ ] Implement depth-guided furniture placement inpainter.
