# ParkSafe Page Redesign Plan

> **Objective:** Redesign Contact, Login, and Profile pages to match the new "Corporate Slate" aesthetic of the HomePage, AND fix the Landing Page hero image issue.
> **Status:** PLANNING
> **Owner:** User / Antigravity

## 1. Analysis & Requirements

The user wants consistent "Corporate Slate" (TailwindCSS) styling across:
*   `Contact.tsx`
*   `Login.tsx`
*   `Profile.tsx`
*   **Fix:** `HomePage.tsx` Hero Image (looks too small/contained).

**Style Guide:**
*   **Background:** `bg-slate-50` (or white for distinct sections).
*   **Cards:** `bg-white`, `rounded-[2rem]`, `shadow-xl`, `border border-slate-200`.
*   **Typography:** `text-slate-900` headings, `text-slate-500` body.
*   **Inputs:** `rounded-xl`, `border-slate-200`, `focus:ring-slate-900`.
*   **Buttons:** `bg-slate-900 text-white rounded-full`.

## 2. Implementation Steps

### Step 1: Fix HomePage Hero Image
*   **Issue:** The `ios_mapview.png` is constrained by a `w-[300px]` div and `aspect-[9/19.5]` ratio which makes it look small inside the hero section on desktop.
*   **Fix:** 
    *   Increase width to `w-[360px]` or `w-[400px]` for desktop (`md:w-[...`).
    *   Check if the `aspect` ratio is cutting off the image or making it too narrow.
    *   Ensure the container allows the image to "breathe".

### Step 2: Redesign Contact.tsx
*   Remove `Contact.css` import.
*   Layout: Split view or Centered Card? -> **Centered Corporate Card**.
*   Header: "Kapcsolat" -> "Get in Touch" (or keep Hungarian but style it).
*   Grid: Icon cards for Email, Phone, Location.
*   Person: "Perjési Szabolcs" in a nice profile row.

### Step 3: Redesign Login.tsx
*   Remove `Login.css` import.
*   Layout: Centered Card on `bg-slate-50`.
*   Input Fields: Modern "large" inputs with floating labels or clean top labels.
*   Buttons: High contrast black/slate buttons.
*   Google Button: White with border, corporate look.

### Step 4: Redesign Profile.tsx
*   Remove `Profile.css` import.
*   Layout: Dashboard style.
*   Header: Avatar + Name + "Admin Badge" (if applicable).
*   Content: distinct "Info Cards" grid using the Bento style.
*   Actions: Red/Slate buttons for "Dangerous Zone".

## 3. Verification
*   Check if `HomePage` image looks larger and better.
*   Check if CSS files are removed/unused.
*   Ensure all functionality (Login/Profile data) remains intact.
