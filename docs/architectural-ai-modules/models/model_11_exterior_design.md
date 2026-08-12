# Model 11: Exterior Design (`exterior-design`)

## 1. Overview
Restyles building exteriors, home facades, roof tiles, and entryway design.

---

## 2. Technical Neural Architecture
* **Core Model**: `ControlNet HED / Lineart` + `SDXL Exterior Architecture`.
* **Replicate Endpoint**: `lllyasviel/control_v11p_sd15_hed`.

---

## 3. Step-by-Step Build Tasks
- [x] Create `ExteriorPromptBuilder` in `backend/src/modules/prompt/builders/exterior-design-prompt.builder.ts`.
- [ ] Connect facade material & style selector UI.
