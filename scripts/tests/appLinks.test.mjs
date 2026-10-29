import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { campaignLinkResponse } from '../../src/lib/campaign-link-handler.mjs';
import { AUTH_LINK_SCRIPT } from '../../src/lib/auth-link-fallback.mjs';

const hash = 'a'.repeat(64);
test('Apple and Android association endpoints match native identities, including auth and content', async () => {
    const apple = await campaignLinkResponse(new Request('https://parksafe.hu/.well-known/apple-app-site-association')).json();
    assert.equal(apple.applinks.details[0].appID, '32G9VBK79P.com.parksafe.ios');
    for (const path of ['/app/auth/callback', '/app/reset-password', '/app/profile/*', '/app/challenge/*']) assert.ok(apple.applinks.details[0].paths.includes(path));
    const request = new Request('https://parksafe.hu/.well-known/assetlinks.json');
    assert.equal(campaignLinkResponse(request).status, 503);
    const android = await campaignLinkResponse(request, { androidFingerprints: ['invalid', 'AA:'.repeat(31) + 'AA'] }).json();
    assert.equal(android[0].target.package_name, 'com.parksafe.app'); assert.equal(android[0].target.sha256_cert_fingerprints.length, 1);
});
test('auth fallback bypasses root analytics/layout and never embeds or forwards credentials', async () => {
    const response = campaignLinkResponse(new Request(`https://parksafe.hu/app/auth/callback?token_hash=${hash}&type=email`));
    assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    assert.match(response.headers.get('content-security-policy'), /default-src 'none'/);
    const html = await response.text(); assert.ok(!html.includes(hash)); assert.doesNotMatch(html, /googletagmanager|vercel|supabase/);
    const script = campaignLinkResponse(new Request('https://parksafe.hu/app/auth-link.js'));
    assert.match(script.headers.get('content-type'), /javascript/);
});
function runFallback(url) {
    const anchor = { hidden: true }, replaced = [];
    runInNewContext(AUTH_LINK_SCRIPT, { URL, URLSearchParams, location: new URL(url), history: { replaceState: (...args) => replaced.push(args) }, document: { getElementById: () => anchor } });
    return { anchor, replaced };
}
test('fallback requires an explicit click, strips browser address and forwards only auth allowlist', () => {
    const result = runFallback(`https://parksafe.hu/app/auth/callback#token_hash=${hash}&type=email&utm_source=private&email=private@example.com`);
    assert.equal(result.anchor.hidden, false);
    assert.equal(result.anchor.href, `parksafe://auth/callback#token_hash=${hash}&type=email`);
    assert.equal(result.replaced[0][2], '/app/auth/callback');
    assert.equal(runFallback('https://parksafe.hu/app/auth/callback?error_description=private').anchor.hidden, true);
    assert.equal(runFallback(`https://parksafe.hu/app/reset-password#token_hash=${hash}&type=recovery`).anchor.href, `parksafe://reset-password#token_hash=${hash}&type=recovery`);
    assert.equal(runFallback(`https://parksafe.hu/app/reset-password#token_hash=${hash}&type=email`).anchor.hidden, true);
    assert.equal(runFallback(`https://parksafe.hu/app/auth/callback?code=x#code=y`).anchor.hidden, true);
});
test('app-absent content redirect uses fixed store URLs without query or referrer leakage', () => {
    for (const [ua, host] of [['Android', 'play.google.com'], ['iPhone', 'apps.apple.com'], ['desktop', 'parksafe.hu']]) {
        const response = campaignLinkResponse(new Request('https://parksafe.hu/app/challenge/fixture?token=private', { headers: { 'user-agent': ua } }));
        assert.equal(response.status, 302); assert.equal(new URL(response.headers.get('location')).hostname, host);
        assert.doesNotMatch(response.headers.get('location'), /private|token/);
        assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    }
});
