# Plan: UI Refinements & Multilingual Support

> **Goal:** Address specific design feedback on Contact, Home, and Footer pages, and implement a bilingual (HU/EN) toggle.

## 1. Design Refinements
- [ ] **Contact Page (`src/Contact.tsx`)**
    - Remove the "Helyszín" (Location) card/section as requested.
    - Adjust the layout grid to fill the void left by the removed card (likely expand the "Response Time" card or center the remaining elements).
- [ ] **Home Page Hero (`src/HomePage.tsx`)**
    - **Issue:** Phone image is too small, "frame" (shadow/glow/container) appears too large/misaligned.
    - **Fix:** 
        - Increase the scale/width of the *actual image* within the container.
        - Tighten the container bounds or reduce the shadow spread (`shadow-2xl` might be too diffuse).
        - Ensure vertical alignment is centered relative to the text column.
- [ ] **Footer Redesign (`src/Footer.tsx`)**
    - **Issue:** Logo is purple.
    - **Fix:** Enforce the brand green (`#34aa56`) for the logo icon and text.

## 2. Multilingual Support (i18n)
- [ ] **Infrastructure (`src/contexts/LanguageContext.tsx`)**
    - Create a lightweight `LanguageContext` to manage state (`'hu' | 'en'`).
    - Store preference in `localStorage`.
    - Create a translation dictionary (`src/lib/translations.ts`) for static text.
        - *Scope:* Header, Footer, Home, Contact, Profile, Login.
- [ ] **Language Toggle Component (`src/components/LanguageToggle.tsx`)**
    - Design a simple graphical toggle or dropdown (Globe icon).
    - styling: `ghost` button, clean and minimal.
- [ ] **Header Integration (`src/Header.tsx`)**
    - Place the toggle next to the "Bejelentkezés" (Login) / Profile button.
    - Ensure it fits the mobile responsiveness (hamburger menu vs inline).

## 3. Implementation Steps

1.  **Refine UI First**: Fix the immediate visual issues (Contact, Home, Footer).
2.  **Build i18n Foundation**: Create the context and dictionary.
3.  **Wire Up Header**: Add the toggle.
4.  **Translate Pages**: Replace hardcoded Hungarian text with context-driven values.

## Verification
- [ ] Contact page looks balanced without the Location card.
- [ ] Hero phone image looks proportional and correctly framed.
- [ ] Footer logo is green.
- [ ] Switching language toggles UI text instantly.
- [ ] Language preference persists on reload.
