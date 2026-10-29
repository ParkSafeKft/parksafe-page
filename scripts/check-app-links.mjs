import assert from 'node:assert/strict';

const base = process.env.APP_LINKS_TEST_ORIGIN ?? 'http://127.0.0.1:3117';
const apple = await fetch(base + '/.well-known/apple-app-site-association');
assert.equal(apple.status, 200);
assert.match(apple.headers.get('content-type'), /application\/json/);
assert.equal((await apple.json()).applinks.details[0].appID, '32G9VBK79P.com.parksafe.ios');
const android = await fetch(base + '/.well-known/assetlinks.json');
assert.ok([200, 503].includes(android.status));
const auth = await fetch(base + '/app/auth/callback?token_hash=fixture-only&type=email');
assert.equal(auth.status, 200);
assert.equal(auth.headers.get('cache-control'), 'no-store');
assert.equal(auth.headers.get('referrer-policy'), 'no-referrer');
assert.doesNotMatch(await auth.text(), /fixture-only|googletagmanager|gtm.js/);
const fallback = await fetch(base + '/app/profile/fixture?utm_source=share', {
  headers: { 'user-agent': 'Android' }, redirect: 'manual',
});
assert.equal(fallback.status, 302);
assert.equal(fallback.headers.get('location'), 'https://play.google.com/store/apps/details?id=com.parksafe.app');
for (const name of ['confirmation', 'recovery']) {
  const response = await fetch(base + '/email-templates/' + name + '.html');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /\.TokenHash/);
}
console.log('PASS: Next HTTP association, protected auth fallback, store redirect and email templates');
if (android.status === 503) console.log('Android signing fingerprint is not configured; association verification remains pending.');
