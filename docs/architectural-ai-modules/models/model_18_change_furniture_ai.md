# Model 18: Change Furniture AI (`change-furniture-ai`)

## 1. Overview
Allows clicking to select a specific furniture item in a room and inpainting a replacement piece.

---

## 2. Technical Neural Architecture
* **Core Model**: `SAM Point Click Selection` + `SDXL Furniture Inpainting`.

---

## 3. Step-by-Step Build Tasks
- [ ] Implement point-click SAM mask selector on frontend canvas.
- [ ] Send mask + replacement item description to SDXL Inpainting.
