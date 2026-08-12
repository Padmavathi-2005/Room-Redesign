# Model 15: Sketch to Render (`sketch-to-render`)

## 1. Overview
Converts rough hand-drawn pencil sketches into photorealistic 3D architectural renders.

---

## 2. Technical Neural Architecture
* **Core Model**: `ControlNet Scribble` / `Lineart` + `SDXL ArchViz`.
* **Replicate Endpoint**: `jagilley/controlnet-scribble`.

---

## 3. Step-by-Step Build Tasks
- [ ] Connect ControlNet Scribble edge extraction prepass.
- [ ] Render 8k 3D architectural facade outputs.
