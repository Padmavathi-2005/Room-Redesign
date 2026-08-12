# Model 08: Style Transfer (`style-transfer`)

## 1. Overview
Transfers design aesthetic, materials, and color scheme from a reference inspiration photo onto the user's room.

---

## 2. Technical Neural Architecture
* **Core Model**: `IP-Adapter` + `ControlNet Depth`.
* **Replicate Endpoint**: `tencentarc/ip-adapter` + `stability-ai/sdxl`.

---

## 3. Step-by-Step Build Tasks
- [ ] Add dual-dropzone upload (User Room + Inspiration Photo).
- [ ] Connect IP-Adapter image prompt embedding pipeline.
