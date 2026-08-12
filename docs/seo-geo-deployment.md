# ParkSafe Technical SEO and GEO Deployment Guide

## Deployment baseline

ParkSafe is an iOS and Android urban cycling application at `https://parksafe.hu`. Its primary discoverable topics are safety-first bicycle routing, bicycle parking, repair and pump locations, community-maintained place data, and aggregated cycling-impact data.

The repository now ships these discovery assets:

- `/robots.txt` allows primary search and AI crawlers while excluding admin, authentication, account, checkout, and private API paths.
- `/llms.txt` provides a curated, specification-aligned AI guide with links to canonical content.
- `/sitemap.xml` lists only public, canonical HTML pages.
- The root layout emits one JSON-LD `@graph` containing `Organization`, `WebSite`, and `SoftwareApplication` entities with stable `@id` references.
- A `Link` response header points agents to `/llms.txt` with `rel="describedby"`.

`llms.txt` is a community proposal rather than an IETF, W3C, or search-engine ranking standard. The `LLMs-txt` line in `robots.txt` is also a non-standard discovery hint; the conventional root URL and `Link` response header are the primary discovery mechanisms. Treat the file as a low-cost machine-readable guide, not as a replacement for crawlable HTML, structured data, or the XML sitemap.

`robots.txt` is a crawl policy, not an authorization control. Every admin and private API route must continue to enforce authentication and authorization at the application or data layer.

## Answer-first content

- Start every major H2 section with a self-contained, factual answer of 40–150 words before cards, animations, accordions, or calls to action.
- Put the entity and answer in the first sentence: “ParkSafe is…”, “ParkSafe costs…”, or “ParkSafe route planning uses…”.
- Make each answer understandable without the page title or surrounding copy. Define acronyms and avoid pronouns with unclear referents.
- Follow the direct answer with supporting evidence, limitations, methodology, examples, and a next action.
- Keep important facts in server-rendered text. Do not expose essential explanations only after a click, inside an image, or through client-only API calls.

Recommended homepage opening answer:

> ParkSafe is a free urban cycling app for iOS and Android that helps riders plan safety-first routes and find bicycle parking, repair shops, and public pumps. Its map combines ParkSafe location records with community ratings, photos, and reports so cyclists can compare parking security and choose a suitable destination before they ride.

## Evidence and factual density

- Attach a visible source, owner, methodology, coverage date, and last-updated date to every material statistic.
- Maintain an internal evidence register for the current `7,500+` parking, `800+` service-point, and `98%` accuracy claims. If a claim cannot be reproduced, qualify or remove it.
- Keep the CO2 methodology adjacent to the result. State that the figure is an estimate, list the emissions and modal-shift assumptions, and link to the original source for each assumption.
- Prefer measured wording: “ParkSafe currently lists…” over “the largest” unless an independent comparison proves the superlative.
- Use expert quotes only when they add a checkable claim. Include the expert's full name, role, organization, relevant credential, quote date, and a link to the original interview, publication, or transcript.
- Give case studies a named customer or cohort, baseline, intervention, time window, measured result, methodology, and limitations. Do not publish anonymous percentage improvements without supporting data.

## Headings, FAQs, and extractable answers

- Use one descriptive H1 per page, followed by H2 sections that match real search questions and H3 subsections for narrower follow-ups.
- Add a visible H2 such as “ParkSafe pricing” with the direct answer that core features are currently free and there is no paid service tier.
- Keep each FAQ question in visible HTML and answer it immediately in plain text. Use concise answers first, then optional detail.
- Keep the existing `FAQPage` JSON-LD synchronized with the visible questions. Mark up only content users can see and do not treat structured data as a guarantee of a search feature.
- Use stable fragment IDs such as `#platform`, `#how-it-works`, `#impact`, and `#faq` so search and AI agents can cite the relevant section.

Suggested strategic pages when enough original content exists:

- `/features`: one canonical page for routing, parking, service points, and community data.
- `/pricing`: current free-access terms, future-plan policy, and a dated FAQ.
- `/methodology`: data sources, verification process, coverage, update frequency, and CO2 calculations.
- `/case-studies`: evidence-led rider, city, and partner outcomes.

Do not create these as thin doorway pages. Until they have substantial unique content, the existing homepage sections linked from `/llms.txt` are the canonical sources.

## Technical indexing controls

- Return `200` only for canonical public content, permanent `301` redirects for moved URLs, and genuine `404` or `410` responses for missing content.
- Add unique titles, descriptions, and canonical URLs to `/about`, `/contact`, `/privacy`, and `/terms`; the root metadata should not be reused unchanged on every route.
- Apply `noindex, nofollow, noarchive` through page metadata or `X-Robots-Tag` to login, password reset, profile, admin, cart, and checkout responses.
- Keep sitemap URLs indexable, canonical, and free of authentication requirements. Never list fragment URLs or blocked routes.
- If Hungarian and English receive separate URLs later, add reciprocal `hreflang="hu"`, `hreflang="en"`, and `x-default` annotations. Do not emit hreflang while language is only client-side state on one URL.
- Consider maintained Markdown alternates such as `/features.md` and `/methodology.md` only if they are generated from the same source as the HTML. Advertise each with `rel="alternate" type="text/markdown"` to prevent content drift.

## Validation before release

1. Run `npm run lint` and `npm run build`.
2. Confirm `/robots.txt`, `/llms.txt`, and `/sitemap.xml` return `200` with plain-text or XML content types as appropriate.
3. Test JSON-LD with Schema.org Validator and Google's Rich Results Test; check that all `@id` references resolve within the graph.
4. Inspect rendered HTML with JavaScript disabled and confirm the H1, opening answer, factual claims, FAQ text, canonical, and JSON-LD remain present.
5. Test blocked routes with Google Search Console's robots tester and inspect server logs for the named crawler user agents.
6. Validate all URLs in `/llms.txt`; remove or update links during the same release that moves a strategic page.
7. Recheck evidence dates quarterly and whenever product coverage, pricing, methodology, or app-store URLs change.
