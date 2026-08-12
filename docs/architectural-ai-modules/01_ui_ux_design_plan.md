# RoomAI Platform — UI/UX Design System & Studio Layout Plan

This document defines the **UI/UX Design System, Component Hierarchy, and Visual Layout Specification** for the RoomAI platform.

---

## 1. Visual Design System & Aesthetics

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ COLOR PALETTE                                                                    │
│ • Dark Background: Slate 950 (#020617) & Slate 900 (#0F172A)                     │
│ • Accent Primary: Electric Indigo (#6366F1) & Violet Glow (#8B5CF6)              │
│ • Accent Secondary: Cyan Highlight (#06B6D4) & Emerald Success (#10B981)         │
│ • Glassmorphism: bg-slate-900/70 backdrop-blur-2xl border-white/10               │
└──────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────┐
│ TYPOGRAPHY                                                                       │
│ • Headings (h1-h6): Outfit (font-heading, font-extrabold, tracking-tight)        │
│ • Body & Form Inputs: Inter (font-sans, font-medium)                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Interactive Studio Interface Mockup & Layout Architecture

![RoomAI Studio Generator Interface](file:///C:/Users/SAI/.gemini/antigravity-ide/brain/c96e160b-0f9a-4294-989b-85bcecdfc2c9/roomai_generator_ui_1786450479597.png)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP NAVIGATION HEADER                                                                       │
│ [ Logo: RoomAI ]   [ Tools Dropdown (18) ▼ ]   [ Projects ]   [ ⚡ 50 Credits ]   [ Profile ]  │
├──────────────────────────────────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR TOOL CONTROLS (380px)        │ MAIN CANVAS VIEWPORT (Flex-1)                        │
│                                      │                                                      │
│ 1. Active Tool Indicator             │ ┌──────────────────────────────────────────────────┐ │
│    e.g., "Interior Design Engine"    │ │  INTERACTIVE BEFORE / AFTER COMPARISON SLIDER    │ │
│                                      │ │                                                  │ │
│ 2. Image Upload Dropzone             │ │  [ Before Photo ]  │█│  [ 4K AI Render ]        │ │
│    [ Drag & Drop Room Photo ]        │ │                    │█│                           │ │
│                                      │ │                    │█│                           │ │
│ 3. Room Type Picker                  │ └──────────────────────────────────────────────────┘ │
│    (Living Room, Bedroom, Kitchen)   │                                                      │
│                                      │ CANVAS TOOLBAR                                       │
│ 4. Design Style Chips                │ [ 🔍 Zoom ] [ 🖌️ Mask Paint ] [ 💾 Save ] [ ⬇️ 4K ]  │
│    [ Japandi ] [ Modern ] [ Luxe ]   │                                                      │
│                                      │ GENERATION HISTORY CAROUSEL                          │
│ 5. Color & Material Selectors        │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│                                      │ │ Render│ │ Render│ │ Render│ │ Render│                  │
│ 6. Custom Text Prompt                │ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                      │                                                      │
│ 7. [ 🚀 Generate Redesign (1 ⚡) ]   │                                                      │
└──────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 3. 3D Architectural & Floor Plan Studio Design

![3D Architectural & Floor Plan Studio](file:///C:/Users/SAI/.gemini/antigravity-ide/brain/c96e160b-0f9a-4294-989b-85bcecdfc2c9/roomai_arch_studio_ui_1786450494907.png)

### Key Architectural Viewport Features:
* **Isometric & Cutaway Controls**: Switch seamlessly between 2D vector plans and 45° isometric 3D textured renders.
* **Material Palette Tiles**: Clickable texture swatches for oak flooring, marble, tile, and concrete.
* **Lighting Simulator**: Adjust time of day and sunlight angle dynamically.

---

## 4. Frontend Component Breakdown (Task-by-Task Implementation)

### Component 1: `HeaderNavigation.tsx`
* **Features**: Dynamic 18-tool dropdown with icons, credits counter badge, and user menu.
* **Styling**: `h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-6`.

### Component 2: `GeneratorSidebar.tsx`
* **Features**: Dynamic form builder loading inputs based on selected tool slug.
* **Controls**: Image dragzone, room type select, style pills, material checkboxes, custom prompt.

### Component 3: `BeforeAfterSlider.tsx`
* **Features**: Mouse and touch-draggable comparison line dividing original upload and generated output.
* **Smoothness**: 60fps hardware-accelerated CSS clip-path mask.

### Component 4: `MaskingCanvasModal.tsx`
* **Features**: Canvas brush tool allowing users to paint wall areas for `paint-color-visualizer` or furniture items for `change-furniture-ai`.

### Component 5: `HistoryDrawer.tsx`
* **Features**: Bottom slider displaying project history thumbnail cards with one-click reload.
