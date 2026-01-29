# ParkSafe FAQ Restoration Plan

> **Objective:** Restore the FAQ section to the homepage, as it was unintentionally removed or obscured during recent layout updates.
> **Status:** PLANNING
> **Owner:** User / Antigravity

## 1. Context Analysis
*   **User Request:** "bring back the faq".
*   **Current State:** The `<FAQSection />` component likely exists in the codebase (`src/components/FAQSection.tsx`) but is missing from the `HomePage.tsx` render tree after the Bento Grid and CTA updates.

## 2. Implementation Steps

### Step 1: Locate Placement (HomePage.tsx)
*   Identify the gap between the **Bento Grid** section (`bg-slate-50`) and the **Corporate CTA** section (`bg-slate-900`).
*   The FAQ should sit logically between these two, likely on a white or neutral background to separate the "Feature heavy" top from the "Action heavy" bottom.

### Step 2: Restore Code
*   Import `FAQSection` (if import was removed, though unlikely).
*   Insert `<FAQSection />` JSX element.
*   Ensure proper spacing (vertical padding) if the component doesn't have it built-in.

## 3. Verification
*   Is the FAQ visible?
*   Is the spacing correct (no double padding)?
