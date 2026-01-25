# ParkSafe Landing Page Redesign Plan

> **Objective:** transform the current "messed up" hero and landing page into a competition-ready, professional yet "sleek & fun" product showcase.
> **Status:** PLANNING
> **Owner:** User / Antigravity

## 1. Diagnostics & Design Strategy

**Current Issues (Based on feedback & observation):**
- **Hero Alignment:** Content is pushed too low or cut off (visible in screenshot).
- **Responsive Overflow:** Phone mockup likely clipping on smaller/medium screens.
- **Visual Balance:** Text vs. Image ratio is unbalanced.
- **Vibe:** Needs to bridge "Corporate Trust" (for the competition) with "Cyclist Fun" (for the users).

**Design Pillars:**
1.  **Corporate Structure:** Rigid grid, perfect alignment, clear hierarchy.
2.  **Playful Accents:** Organic shapes (blobs), bounce animations, vibrant Green (#34aa56).
3.  **Competition Ready:** polished buttons, high-res assets, "Social Proof" visible immediately.

---

## 2. Implementation Roadmap

### Phase 1: Hero Section Reconstruction (High Priority)
*Focus: Fixing the "messed up" layout immediately.*
- [ ] **Container Fix:** Switch Hero container from fixed `vh` to `min-h-screen` + `py-spacing` to handle all heights.
- [ ] **Grid Layout:** Implement a strictly balanced `grid-cols-1 lg:grid-cols-2` layout.
    - **Left (Text):** Vertically centered, strictly aligned to container edge.
    - **Right (Visual):** constrain max-height/width of the Phone Mockup to prevent overflow.
- [ ] **Typography:** Clean up the "Tekerj Szegeden" headline. Use `clamp()` for font sizes to prevent line-wrapping issues.

### Phase 2: "Underneath" Section Polish
*Focus: Improving the flow below the fold.*
- [ ] **Features Grid:** Standardize card heights. Ensure "Clean & White" corporate look with clear icon hierarchy.
- [ ] **Audience Section:** Fix the visual abstract (200+ cities) to be responsive.
- [ ] **Trust Signals:** Ensure the "850+ Users" logic flows naturally between sections.

### Phase 3: "Sleek & Fun" Micro-Interactions
*Focus: The "Fun" part of the brief.*
- [ ] **Hover Effects:** Add `scale-[1.02]` on significant cards (Features, Download).
- [ ] **Scroll Reveal:** Add subtle Framer Motion `viewport={{ once: true }}` reveals for sections.
- [ ] **Living UI:** Ensure the "floating widgets" (e.g., "Kamerás helyek") near the phone mockup float gently.

### Phase 4: Responsive Hardening
*Focus: Competition stability.*
- [ ] **Mobile Check:** Ensure stacking order is Text -> Image -> Content.
- [ ] **Tablet Check:** Fix the awkward 768px-1024px range (condense padding).
- [ ] **Touch Targets:** Verify all buttons are minimum 44px height.

---

## 3. Verification Checklist
- [ ] Does the Hero text cut off on 1366x768 (standard laptop)?
- [ ] Is horizontal scrolling completely eliminated?
- [ ] Do the "Download" buttons look premium (Apple/Google style)?
- [ ] Is the ParkSafe Green (#34aa56) consistent everywhere?

## 4. Next Actions
- Run `/create` or ask to start **Phase 1** immediately.
