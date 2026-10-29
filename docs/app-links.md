# App Links and mobile Auth callbacks (PARKS-361)

`/app/[...segments]` is an HTTP route handler, bypassing the marketing layout and GTM. It provides app-absent content redirects to fixed stores and an Auth helper with same-origin JavaScript, no-store/no-referrer, noindex and restrictive CSP. The script strips the credential-bearing browser address and offers an explicit custom-scheme action. It never calls Supabase or automatically verifies email links. New templates keep token hashes in fragments so proxies do not receive them. Legacy credential queries still require proxy/CDN log redaction.

The `.well-known` handlers publish Apple and Android association responses. Set server-side `ANDROID_APP_SIGNING_SHA256` to comma-separated Play App Signing certificate fingerprints, uppercase colon-delimited SHA-256. Missing valid fingerprints returns 503. Do not substitute debug/upload keys. Both apex and www endpoints must respond without cross-host redirects. iOS identity: `32G9VBK79P.com.parksafe.ios`; Android: `com.parksafe.app`.

`public/email-templates` contains GoTrue templates, not rendered emails. Auth must be configured with their HTTPS URLs; publishing files alone does not change emails. Mobile confirmation/recovery redirects select the app branches. Website recovery retains its `/reset-password` token-hash branch; other redirects preserve ConfirmationURL. Back up and merge existing template customizations before applying.

The mobile repo contains the operator runbook at `server-rollout/parks-361/README.md`, also copied to the Desktop SSH handoff folder. Roll out the website/certificates, new native builds, then Auth template URLs/allowlist. Source changes do not deploy production Auth configuration.

Run `node --test scripts/tests/appLinks.test.mjs`. After a production build, start Next on loopback port 3117 and run `node scripts/check-app-links.mjs` for actual HTTP headers, association responses, store redirects and template availability. Installed/app-absent verification on both platforms remains necessary after deployment. No Expo Web is involved.
