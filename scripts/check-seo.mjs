// Run against a production server: node scripts/check-seo.mjs http://localhost:3002
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:3002';
const site = 'https://parksafe.hu';
const paths = ['/', '/about', '/contact', '/privacy', '/terms'];
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

async function check() {
    const pages = await Promise.all(paths.map(async path => {
        const response = await fetch(new URL(path, base));
        assert.equal(response.status, 200, path);
        assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), path);
        const html = await response.text();
        assert.match(html, /<html[^>]*lang="hu"/, path);
        const tags = [...html.matchAll(/<(?:meta|link)\b[^>]*>/g)].map(([tag]) =>
            Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)])));
        const meta = name => tags.find(tag => tag.name === name || tag.property === name)?.content;
        const canonical = tags.filter(tag => tag.rel === 'canonical');
        assert.equal(canonical.length, 1, path);
        assert.equal(new URL(canonical[0].href).href, `${site}${path}`, path);
        assert.ok(!/noindex/i.test(meta('robots') || ''), path);
        const title = decode(html.match(/<title>(.*?)<\/title>/)?.[1] || '');
        const description = meta('description');
        assert.ok(title && description, path);
        assert.equal(meta('og:title'), title, path);
        assert.equal(meta('twitter:title'), title, path);
        assert.equal(meta('og:description'), description, path);
        assert.equal(meta('twitter:description'), description, path);
        assert.equal(new URL(meta('og:url')).href, `${site}${path}`, path);
        assert.equal(meta('og:image:width'), '512', path);
        assert.equal(meta('og:image:height'), '512', path);
        const graph = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
            .map(([, json]) => JSON.parse(json)).find(json => json['@graph'])?.['@graph'];
        assert.ok(graph, path);
        const org = graph.find(node => node['@type'] === 'Organization');
        const app = graph.find(node => node['@type'] === 'SoftwareApplication');
        assert.equal(app.publisher['@id'], org['@id'], path);
        assert.equal(app.applicationCategory, 'TravelApplication', path);
        assert.equal(Number(app.offers.price), 0, path);
        assert.equal(app.isAccessibleForFree, true, path);
        assert.equal(app.screenshot, `${site}/parksafe-phone-mockup.png`, path);
        assert.deepEqual(app.operatingSystem, ['iOS', 'Android'], path);
        assert.deepEqual(app.downloadUrl, ['https://apps.apple.com/app/id6752813986', 'https://play.google.com/store/apps/details?id=com.parksafe.app'], path);
        return { path, status: response.status, title, description, canonical: canonical[0].href };
    }));
    assert.equal(new Set(pages.map(page => page.title)).size, paths.length, 'Distinct titles');
    const screenshotResponse = await fetch(new URL('/parksafe-phone-mockup.png', base));
    assert.equal(screenshotResponse.status, 200, 'Schema screenshot asset');
    assert.match(screenshotResponse.headers.get('content-type') || '', /image\/png/, 'Schema screenshot asset');
    assert.equal(new Set(pages.map(page => page.description)).size, paths.length, 'Distinct descriptions');
    const sitemapResponse = await fetch(new URL('/sitemap.xml', base));
    assert.equal(sitemapResponse.status, 200);
    const sitemap = await sitemapResponse.text();
    assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url).sort(), paths.map(path => `${site}${path}`).sort());
    const robotsResponse = await fetch(new URL('/robots.txt', base));
    assert.equal(robotsResponse.status, 200);
    const robots = await robotsResponse.text();
    assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`));
    for (const path of ['/profile', '/admin']) {
        assert.ok(robots.includes(`Disallow: ${path}`), path);
    }
    for (const path of ['/login', '/forgot-password', '/reset-password']) {
        assert.ok(!robots.includes(`Disallow: ${path}`), `${path} must be crawlable to read noindex`);
        const response = await fetch(new URL(path, base));
        assert.equal(response.status, 200, path);
        assert.match(response.headers.get('x-robots-tag') || '', /noindex/, path);
    }
    for (const path of ['/profile', '/admin']) {
        const response = await fetch(new URL(path, base));
        assert.match(response.headers.get('x-robots-tag') || '', /noindex/, path);
    }
    const privateResponse = await fetch(new URL('/api/admin-usage-stats', base));
    assert.equal(privateResponse.status, 401, 'Unauthenticated private API');
    assert.match(privateResponse.headers.get('x-robots-tag') || '', /noindex/);
    console.log(JSON.stringify(pages, null, 2));
    console.log('PASS: public metadata, JSON-LD, sitemap, robots and private noindex/access checks');
}

check().catch(error => { console.error(error); process.exitCode = 1; });
