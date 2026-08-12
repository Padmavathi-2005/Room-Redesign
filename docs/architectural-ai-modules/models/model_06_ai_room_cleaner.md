# Model 06: AI Room Cleaner (`ai-room-cleaner`)

## 1. Overview
Declutters rooms by automatically detecting and erasing furniture, trash, boxes, and personal items.

---

## 2. Technical Neural Architecture
* **Core Model**: `GroundingDINO` (Zero-Shot Object Detection) + `LAMA Inpainting`.
* **Replicate Endpoint**: `idea-research/grounding-dino` + `sanster/lama-cleaner`.

---

## 3. Step-by-Step Build Tasks
- [ ] Connect GroundingDINO text prompts (`furniture, clutter, boxes, trash, clothes`).
- [ ] Run LAMA cleaner mask restoration.
