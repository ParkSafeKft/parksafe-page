# ParkSafe Corporate Redesign: The "Modern SaaS" Overhaul

> **Objective:** Execute a complete, step-by-step redesign to shed the "AI/Template" look (grids, blobs) and build a **reliable, attractive corporate presence**.
> **Status:** PLANNING
> **Owner:** User / Antigravity

## 1. Design Concept: "Crystal Clarity"

**The Pivot:**
- **From:** "Playful/Tech" (Grids, Blobs, Green/Purple accents).
- **To:** "Trusted Infrastructure" (Clean white/gray, sharp shadows, deep forest green, Glassmorphism).
- **Vibe:** Think Stripe, Linear, or Revolut. High-end, serious, expensive.

**Key Stylistic Changes:**
- **Background:** Pure white (`#ffffff`) transitioning to subtle gray (`#fafafa`). NO "beans/blobs" or "checkerboards".
- **Typography:** Tight tracking, heavy weights for headlines, high contrast.
- **Imagery:** High-fidelity implementation of the new `ios_mapview.png` inside a premium CSS-device frame.

---

## 2. Step-by-Step Implementation Roadmap

### Phase 1: The Trust Header & Clean Hero
*Focus: First impressions. Solid, grounded, expensive.*
- [ ] **Header:** Redesign as a "Floating Island" – a centered styling glass bar with blur, distinct from the page background.
- [ ] **Hero Background:** Remove `hero-background.tsx` entirely. Replace with a minimalist bright background with a single, sharp "slash" or subtle noise texture if needed.
- [ ] **Hero Content:**
    - **Asset:** Implement `public/ios_mapview.png` inside a **CSS-only iPhone 15 Pro Titanium frame**. No generic white bezels.
    - **Headline:** Static, powerful. "Professional Parking for Hungary's Cyclists." No jumping animations.

### Phase 2: The "Bento" Feature Grid (Replacing 'How it Works')
*Focus: Information density & modern trends.*
- [ ] **Strategy:** Replace the current "Icon Rows" with a **Bento Grid**.
    - Large "Master" card showing the map functionality.
    - Smaller "Detail" cards for specific features (Security, Navigation).
- [ ] **Style:** White cards on light gray background, deep shadows (`shadow-xl`), subtle hover lifts.

### Phase 3: "Corporate" Social Proof
*Focus: Showing reliability.*
- [ ] **Ticker:** Add a "Trusted By / Featured In" marquee band (infinite scroll) with gray-scale logos of relevant entities (Universities, Cities, Partners).
- [ ] **Metrics:** "850+ Users" becomes a clean stat bar: "12k+ Routes Planned | 98% Safety Score".

### Phase 4: Footer & Polish
- [ ] **Footer:** Multi-column layout. Dark mode footer (Deep Green/Black) to anchor the page.
- [ ] **Touch:** "Download" buttons need to be crisp, black-and-white vector badges, pixel perfect.

---

## 3. Verification Checklist
- [ ] Are all "blobs" and "checkerboards" gone?
- [ ] Is `ios_mapview.png` clearly visible and framed professionally?
- [ ] Does the page feel "stable" (no jittery animations)?
- [ ] Is the header sticky and glass-like?

## 4. Next Actions
- Run `/create` to start **Phase 1: Header & Hero**.
