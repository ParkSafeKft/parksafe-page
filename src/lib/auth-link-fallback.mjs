export const AUTH_LINK_HTML = `<!doctype html>
<html lang="hu"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,nofollow">
<title>ParkSafe – megnyitás az alkalmazásban</title>
<h1>Folytatás a ParkSafe alkalmazásban</h1>
<p id="message">Az emailben kapott hivatkozást a ParkSafe alkalmazás kezeli. Ez az oldal nem erősíti meg a fiókodat.</p>
<p><a id="open" hidden>ParkSafe megnyitása</a></p>
<p>Ha még nincs telepítve: <a href="https://play.google.com/store/apps/details?id=com.parksafe.app" rel="noreferrer">Google Play</a> · <a href="https://apps.apple.com/app/id6752813810" rel="noreferrer">App Store</a>. Telepítés után nyisd meg újra az emailben kapott hivatkozást.</p>
<script src="/app/auth-link.js" defer></script></html>`;

export const AUTH_LINK_SCRIPT = `(() => {
  const url = new URL(location.href);
  const query = new URLSearchParams(url.search);
  for (const [key, value] of new URLSearchParams(url.hash.slice(1))) query.append(key, value);
  history.replaceState(null, '', location.pathname);
  const keys = ['token_hash', 'type', 'code', 'access_token', 'refresh_token'];
  const safe = new URLSearchParams();
  for (const key of keys) {
    if (query.getAll(key).length > 1) return;
    const value = query.get(key); if (value) safe.set(key, value);
  }
  if (query.has('error') || query.has('error_description')) return;
  const recovery = url.pathname === '/app/reset-password';
  if (recovery && safe.get('type') !== 'recovery') return;
  if (!safe.has('token_hash') && !safe.has('code') && !(safe.has('access_token') && safe.has('refresh_token'))) return;
  const open = document.getElementById('open');
  open.href = (recovery ? 'parksafe://reset-password' : 'parksafe://auth/callback') + '#' + safe.toString();
  open.hidden = false;
})();`;
