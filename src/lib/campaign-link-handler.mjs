import { AUTH_LINK_HTML, AUTH_LINK_SCRIPT } from './auth-link-fallback.mjs';
// Mount this handler on parksafe.hu and www.parksafe.hu; it does not serve Expo Web.
/** @param {Request} request
 * @param {{ androidFingerprints?: string[] }} [options]
 */
export function campaignLinkResponse(request, { androidFingerprints = [] } = {}) {
  const url = new URL(request.url);
  const json = body => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } });
  if (url.pathname === '/.well-known/apple-app-site-association') {
    return json({ applinks: { apps: [], details: [{ appID: '32G9VBK79P.com.parksafe.ios', paths: ['/app/ride/*', '/app/route/*', '/app/poi/*', '/app/profile/*', '/app/user/*', '/app/challenge/*', '/app/expedition/*', '/app/auth/callback', '/app/reset-password', '/app/profile', '/app/settings', '/app/challenges', '/app/leaderboard'] }] } });
  }
  if (url.pathname === '/.well-known/assetlinks.json') {
    const fingerprints = androidFingerprints.filter(value => typeof value === 'string' && /^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(value));
    if (!fingerprints.length) return new Response('Android app signing certificate is not configured', { status: 503 });
    return json([{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: 'com.parksafe.app', sha256_cert_fingerprints: fingerprints } }]);
  }
  if (['/app/auth/callback', '/app/reset-password', '/app/auth-link.js'].includes(url.pathname)) {
    return new Response(url.pathname.endsWith('.js') ? AUTH_LINK_SCRIPT : AUTH_LINK_HTML, { headers: {
      'content-type': url.pathname.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8',
      'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; script-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'x-robots-tag': 'noindex, nofollow',
    } });
  }
  if (!/^\/app\/(?:ride|route|poi|profile|user|challenge|expedition)\/[^/]+$/.test(url.pathname)
    && !/^\/app\/(?:profile|settings|challenges|leaderboard)\/?$/.test(url.pathname)) return new Response('Not found', { status: 404 });
  // Installed apps intercept verified links before HTTP. Otherwise offer the store.
  const agent = request.headers.get('user-agent') ?? '';
  const target = /android/i.test(agent) ? 'https://play.google.com/store/apps/details?id=com.parksafe.app'
    : /iphone|ipad|ipod/i.test(agent) ? 'https://apps.apple.com/app/id6752813810' : 'https://parksafe.hu/';
  return new Response(null, { status: 302, headers: { location: target, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
}
