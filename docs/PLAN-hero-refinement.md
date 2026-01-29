# ParkSafe Scope Expansion & Visual Tuning Plan

> **Objective:** Broaden the app's messaging from "Szeged-only" to "National/Universal" utility while restoring vibrancy to the Hero section without losing the professional grid.
> **Status:** PLANNING
> **Owner:** User / Antigravity

## 1. Pivot Strategy

**1. Copywriting Pivot (Szeged -> Hungary/Universal):**
- **Problem:** "Tekerj Szegeden" / "Szeged Kerékpáros Applikációja" limits the audience.
- **Solution:** Change to broad value propositions: "Parkolj biztonságban bárhol" (Park safely anywhere).
- **Subtext:** Mention "Induló város: Szeged" (Starting city: Szeged) or "Elérhető Szegeden, hamarosan országszerte" (Available in Szeged, coming soon nationwide), but keep the *headline* universal.

**2. Visual Tuning (Sterile -> Lively):**
- **Problem:** The new grid is *too* clinical/grey.
- **Solution:** Re-introduce **Subtle Gradient Orbs** (Aurora effect) *behind* the grid.
    - Low opacity (20-30%) so it doesn't distract.
    - Colors: Emerald (#34aa56) + Teal + soft Yellow to bring back "Life".

**3. Cleanup:**
- **Remove Sticky Download Button:** The user mentioned a button appearing on scroll—likely a legacy `Header` or floating CTA component.

---

## 2. Implementation Roadmap

### Phase 1: Nationalizing the Copy
*Focus: Removing "Szeged-lock".*
- [ ] **Badge:** Change "Szeged Kerékpáros Applikációja" -> "Magyarország Okos Kerékpáros Appja" (Hungary's Smart Bike App) or similar.
- [ ] **Headline:** "Parkolj [Dynamic] Szegeden" -> "Parkolj [Dynamic] Bárhol".
- [ ] **Body:** "városi bringások" (urban cyclists) instead of specific location constraints.

### Phase 2: Reactivating the "Aurora"
*Focus: Buying back the 'life'.*
- [ ] **Background Update:** Modify `src/components/ui/hero-background.tsx`.
- [ ] **Gradient Injection:** Add 2-3 large, highly blurred (`blur-[120px]`) colored blobs *behind* the grid pattern.
    - One Top-Right (Green).
    - One Bottom-Left (Teal/Blue).
    - Keep the technical grid *on top* of the color for that "Tech + Life" balance.

### Phase 3: Removing the Ghost Button
*Focus: Cleaning up scroll behavior.*
- [ ] **Inspect:** Check `Header.tsx` or `HomePage.tsx` for a "scroll-based" floating action button.
- [ ] **Action:** Delete/Disable the conditional rendering logic for this floating button.

---

## 3. Verification Checklist
- [ ] Does the Headline say "Szegeden" anymore? (Should be NO/Optional).
- [ ] Is the background grayscale only? (Should be NO - needs color).
- [ ] Does a sticky button appear when scrolling down? (Should be NO).

## 4. Next Actions
- Run `/create` to execute the copy and visual changes.
