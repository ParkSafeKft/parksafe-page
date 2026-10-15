# Admin dashboard design check

2026-10-15. Scope: `/admin` overview, period selector and sidebar selection stripe. Other admin tools retain their existing layouts.

## Apple Design review

Rating: Good. This web dashboard uses Apple's layout, loading, writing and accessibility principles; native macOS window/menu conventions do not apply.

- `layout.md › Visual hierarchy`: “Order content by relative importance.” The user's final direction puts encouraging community data first: total users, current-month active and returning riders, then weekly rides/distance. Growth and device charts follow, with the more technical registration-cohort metrics last.
- `loading.md › Best practices`: “Show something as soon as possible.” All three metric positions exist on initial load. Refresh retains old values with their matching date range and an explicit loading status.
- `motion.md › Best practices`: feedback for frequent interactions is brief. The graph does not animate on each refresh; reduced-motion mode disables overview button transitions.
- The user requested the segmented selector and removal of its green edge. It now uses a neutral selected background, heavier type and green text. The sidebar stripe is also removed.
- Short labels replace repeated explanations. At the user's request, the entire explanation disclosure was removed. Calculation definitions remain in `PARKS-144-activation-metrics.md`.
- Graphs provide real context rather than decoration: monthly registrations use the existing history; the device ring and three-column platform table share the same panel and device count. Monthly riding statistics no longer sit inside the unrelated device panel. Activation/return meters use their actual percentages, not invented time-series data. Summary and metric icons identify users, cycling, repeat activity and elapsed time.

## Verification

- Production build, TypeScript and targeted ESLint passed. Nine Node tests passed, including retained refresh data, cancelled responses, initial placeholders, failed refresh recovery and weekly ride links.
- Delayed request after the full-page reorder: activation height 349.6 px, page scroll height 1083 px, footer position and scroll position all unchanged before/during/after 30 day to all time. Mobile refresh and injected error also retained their previous layout and values.
- 390 px CSS viewport: document width 390 px, no overview descendants escape horizontally. Summary uses two columns, chart/platform panels stack. This is a responsive desktop-browser check.
- All five weekly buttons open their existing dialogs; Escape closes them. All periods and retry were operated. Shift+Tab shows a focus outline on a period button; Enter changes period. A delayed old request cannot replace a newer result. Browser fetch wrappers were restored after verification.
- Contrast checker: `#b0b0b0` on `#090909` = 9.18:1, `#858585` on `#0f0f0f` = 5.19:1, green on selected `#252525` = 8.89:1.
- Selected-period box-shadow and active-sidebar `::before` content are both `none` in the browser.
- Final grouping revision: top summary = 2504 users, 27 current-month active riders, 23 current-month returning riders; weekly rides/distance follow. Then the monthly registration chart sits beside one unified device panel containing the 2062 total, a platform ring and a semantic three-column table. Android 1313 + iOS 749 = 2062, verified in the DOM. Riding activity is absent from the device panel. Activation meters use the same displayed percentages as their numeric values. No invented trends or time-series were added.
- Final revision passes production build, TypeScript, targeted lint and all 9 relevant tests. At 390 px the document remains 390 px wide with no escaping descendants. After viewport resizing settled, a delayed all-time to 90-day update retained section height 364.8 px, scroll height 1205 px and the same scroll position. Temporary fetch wrappers restored.

## Antislop delivery gate

Checks cover the changed overview; absent patterns are explicitly noted.

- R-01 PASS: solid surfaces, no decorative gradient added.
- R-02 PASS: new product copy has no em dash.
- R-03 PASS: 390 px browser check has no horizontal overflow.
- R-04 PASS: bike/map/user/time icons identify real weekly metrics; platform marks identify Android/iOS.
- R-05 PASS: four distinct information scopes determine section order.
- R-06 PASS: existing Inter retained for legible admin numbers; no display monospace added.
- R-07 PASS: chart grid belongs to numeric axes, no decorative grid.
- R-08 PASS: chevrons open weekly details, not ornamental actions.
- R-09 PASS: requested pill is a working filter, no decorative badges.
- R-10 PASS: no glass/blur added.
- R-11 PASS: panel grouping and controls have different radii; metric values stay flat.
- R-12 PASS: overview has no floating shadows; existing dialog elevation is functional.
- R-13 PASS: no glow added; selection accent lines removed.
- R-14 PASS: equal columns compare related numeric metrics, not marketing features.
- R-15 PASS: actions name time ranges or retry.
- R-16 PASS: no marketing buzzwords.
- R-17 PASS: values come from authenticated existing APIs.
- R-18 PASS: no testimonials or fictional people added.
- R-19 PASS: graph animation disabled and reduced-motion button feedback verified in source.
- R-20 PASS: existing ParkSafe colors/type retained; layout serves actual admin data.
- R-21 PASS: dark appearance follows existing product and user-supplied reference.
- R-22 PASS: no illustrations added.
- R-23 PASS: no invented assets, claims or navigation.
- R-24 PASS: existing weekly destinations/dialogs operated in the browser.
- R-25 PASS: actual text and selected-control colors measured above.
- R-26 PASS: five weekly buttons, three periods and retry work.
- R-27 PASS: initial placeholders, empty metrics and failed-refresh recovery present.
- R-28 PASS: no FAQ in scope.
- R-29 PASS: neutral palette, green selection/data series and semantic red errors.
- R-30 PASS: reference used only for the requested segmented-control pattern.
- R-31 PASS: grouping separates summary, current activity, cohorts and historical context.
- R-32 PASS: focus outline, Enter activation and Escape close operated.
- R-33 PASS: source edited directly with patches.
- R-34 PASS: existing fixed admin theme, no new theme toggle.
- R-35 PASS: build and browser click-through completed.
- R-36 PASS: no security/performance/customer claims added.
- R-37 PASS: direction is existing ParkSafe admin and the user's control reference.
- R-38 PASS: no fabricated realistic content.
- Dials PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 declared before edits.
- Dial consistency PASS: quiet typography, comparative groupings and brief feedback.
- Focal point PASS: summary values lead the reading order.
- Whitespace PASS: gaps separate the four data scopes.
- Accent PASS: green marks selection and the registration series.
- Identity PASS: existing ParkSafe colors and number typography retained.
- Design Read PASS: quiet operations dashboard for administrators stated in the session.
- C-1 PASS: visual choices support grouping, legibility or the supplied control reference.
- C-2 PASS: no mock actions; changed controls work.
- C-3 PASS: every panel maps to existing real statistics.
- C-4 PASS: loading/error/mobile/keyboard states verified.
- C-5 PASS: values and claims remain source-backed.
