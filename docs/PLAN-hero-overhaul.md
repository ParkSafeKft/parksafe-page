# ParkSafe Hero Overhaul & Professionalization Plan

> **Objective:** Completely scrap the "generic" Hero section and build a high-end, competition-grade SaaS header. Fix the broken text animation and alignment issues.
> **Status:** PLANNING
> **Owner:** User / Antigravity

## 1. Design Diagnosis & pivot

**Why the current design fails:**
- **Animation Jitter:** The rotating text likely causes layout shifts because it lacks a fixed width container.
- **"Generic AI" Feel:** Random colored blobs and floating icons look like a basic template.
- **Weak Alignment:** The 2-column grid isn't "locking" visually. The phone feels disconnected from the text.

**The "Professional Corporate" Strategy:**
1.  **Stable, Confidence-Inspiring Layout:** Move from "floating elements" to a grounded **Split-Screen** or **contained** layout.
2.  **Tech-First Aesthetic:** Replace organic blobs with a **subtle geometric pattern** (e.g., a faint map topography or grid) to tie into the "Safe Parking/Navigation" theme.
3.  **Typography Authority:** Use a heavy, static headline. If animation is kept, it must be contained in a fixed-width `AnimatePresence` block to prevent jumping.

---

## 2. Implementation Roadmap

### Phase 1: Structural Demolition & Rebuild
*Focus: Creating a rock-solid grid.*
- [ ] **Remove** `HeroBackground` blobs completely.
- [ ] **Background:** Implement a subtle "Map/Grid" pattern in `bg-zinc-50` to signal "Location App" immediately.
- [ ] **Layout:** Switch to a **50/50 Split** with defined padding (`gap-12` -> `gap-20`).
    - **Left (Copy):** Vertically centered.
    - **Right (Visual):** A dedicated "Device Container" that clips content properly.

### Phase 2: Fixing the "Messed Up" Text Animation
*Focus: Professional text handling.*
- [ ] **AnimatePresence:** Wrap the changing words in `<AnimatePresence mode="wait">` from Framer Motion.
- [ ] **Alignment:** Set the text container to `inline-block` with a fixed minimum width (e.g., `w-[200px]`) and `text-left` to prevent the headline from center-shifting.
- [ ] **Headline:** Change to: "Parkolj [DynamicWord] Szegeden." (Keep it simple).

### Phase 3: "De-Generifying" the Visuals
*Focus: Making it look like a real brand.*
- [ ] **Phone Mockup:** Place the phone on a "Glass Card" or a "Map Bed" platform so it feels grounded.
- [ ] **Real Widgets:** Instead of floating icons, create a **"Live Status" card** (like a notification: "🚲 Your bike is safe • 2 mins ago") floating *near* the phone. This tells a story.
- [ ] **Logos/badges:** Replace generic star ratings with a "Supported by [City/Uni]" style bar or "Featured in" (even if placeholders, structure them professionally).

### Phase 4: Mobile & Polish
- [ ] Ensure the phone moves *below* the text on mobile (Stack order).
- [ ] Add a "Scroll Down" indicator to guide users to the "How it Works" section.

---

## 3. Verification Checklist
- [ ] Does the text animation line-break or jump? (Must be NO).
- [ ] Is the "Generic AI" blob background gone?
- [ ] Do the buttons look aligned with the text?

## 4. Next Actions
- Run `/create` to start Phase 1.
