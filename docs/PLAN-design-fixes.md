# ParkSafe Design Fixes & Content Correction

> **Objective:** Address user feedback regarding layout alignment, broken assets, redundant UI elements, and factual accuracy.
> **Status:** PLANNING
> **Owner:** User / Antigravity

## 1. Issues & Solutions

### A. Footer Misalignment & Design
*   **Issue:** The footer is legacy code, misaligned, and doesn't match the new "Corporate Slate" theme.
*   **Solution:**
    *   Locate the Footer component (likely in `App.tsx` or `src/components/Footer.tsx`).
    *   Redesign it to use `bg-slate-900` (matching the new CTA).
    *   Ensure proper flex grid alignment (4 columns: Brand, Links, Legal, Social).
    *   Fix padding and spacing.

### B. Header Icon Rendering
*   **Issue:** The logo in the header is broken.
*   **Solution:**
    *   Verify the path in `Header.tsx`.
    *   Ensure `logo.png` exists in `public/` or update to the correct filename (user mentioned it is in public).
    *   Remove complex CSS masks if they are interfering with the image rendering.

### C. Hero Phone Frame Redundancy
*   **Issue:** The `ios_mapview.png` already contains a phone frame, making the CSS "Titanium Frame" redundant and ugly.
*   **Solution:**
    *   Remove the `div` wrappers responsible for the CSS Bezel, Island, and Screen masking in `HomePage.tsx`.
    *   Render `ios_mapview.png` directly with a simple drop shadow and hover effect.

### D. Missing Android Download (Hero)
*   **Issue:** Hero section only implies one download or is missing specific platform links.
*   **Solution:**
    *   Update the Hero "Action Bar" to match the bottom CTA style (Two distinct buttons: "App Store" and "Google Play").

### E. Factual Corrections (Metrics & Trust)
*   **Issue:** The "7,500+ spots" and "Trusted By" sections contain false information.
*   **Solution:**
    *   **Metrics:** Remove the specific false numbers. Replace with generic "Growing Community" text or remove the metrics grid entirely if no real data exists.
    *   **Trusted By:** Remove the "Trusted by institutions" marquee section entirely.

---

## 2. Implementation Roadmap

### Step 1: Content Cleanup (HomePage.tsx)
- [ ] Remove "Trusted by..." marquee section.
- [ ] Remove/Update "Impact Metrics" grid.
- [ ] Update Hero Buttons to include Android.
- [ ] Remove CSS Phone Frame wrapper, keep just the image.

### Step 2: Component Repair
- [ ] **Header.tsx:** Fix `img src` validation and styling.
- [ ] **Footer:** Create or update into a clean `bg-slate-900` component with white text and proper alignment.

## 3. Verification
- [ ] Does the Footer match the CTA?
- [ ] Is the Hero image clean (no double frame)?
- [ ] Are false claims removed?
- [ ] Does the Logo show up?
