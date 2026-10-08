// Run against a production server: node scripts/check-seo.mjs http://localhost:3002
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:3002';
const site = 'https://parksafe.hu';
const paths = ['/', '/about', '/contact', '/privacy', '/terms', '/map', '/bikerack', '/service', '/water'];
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

async function check(userAgent) {
    const request = url => fetch(url, { redirect: 'manual', headers: { 'User-Agent': userAgent } });
    const pages = await Promise.all(paths.map(async path => {
        const response = await request(new URL(path, base));
        assert.equal(response.status, 200, path);
        assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), path);
        const html = await response.text();
        const nav = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
        const activeLinks = [...nav.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
        const activeHref = ['/map', '/bikerack', '/service', '/water'].includes(path) ? '/map' : path;
        const hasNavItem = ['/', '/map', '/about', '/contact'].includes(activeHref);
        assert.equal(activeLinks.length, hasNavItem ? 1 : 0, `${path} active navbar item count`);
        if (hasNavItem) assert.equal(activeLinks[0][0].match(/href="([^"]*)"/)?.[1], activeHref, `${path} active navbar href`);
        if (['/map', '/bikerack', '/service', '/water'].includes(path)) {
            assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${path} single SSR H1`);
            assert.match(html, /<h1[^>]*>[^<]+<\/h1>/, `${path} SSR heading without JavaScript`);
            assert.match(html, /<section class="web-map-explanation">[\s\S]*?<h2>/, `${path} SSR explanation`);
            assert.doesNotMatch(html, /Példák az országos snapshotból/, `${path} removed sample list`);
            assert.match(html, /OpenStreetMap/, `${path} data provenance`);
            const queryResponse = await request(new URL(`${path}?lat=47.5&lng=19.04&z=12`, base));
            assert.equal(queryResponse.status, 200, `${path} camera query`);
            assert.match(await queryResponse.text(), new RegExp(`rel="canonical" href="${site}${path}"`), `${path} query-free canonical`);
        }
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
    const screenshotResponse = await request(new URL('/parksafe-phone-mockup.png', base));
    assert.equal(screenshotResponse.status, 200, 'Schema screenshot asset');
    assert.match(screenshotResponse.headers.get('content-type') || '', /image\/png/, 'Schema screenshot asset');
    assert.equal(new Set(pages.map(page => page.description)).size, paths.length, 'Distinct descriptions');
    const sitemapResponse = await request(new URL('/sitemap.xml', base));
    assert.equal(sitemapResponse.status, 200);
    assert.match(sitemapResponse.headers.get('content-type') || '', /^(?:application|text)\/xml\b/i, 'Sitemap XML content type');
    const sitemap = await sitemapResponse.text();
    // Validate the entire deliberately minimal XML format, not just loc substrings in an HTML fallback.
    assert.match(sitemap, /^\s*<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">(?:\s*<url>\s*<loc>https:\/\/parksafe\.hu\/[a-z]*<\/loc>\s*<\/url>)+\s*<\/urlset>\s*$/, 'Complete sitemap XML document');
    assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url).sort(), paths.map(path => `${site}${path}`).sort());
    const robotsResponse = await request(new URL('/robots.txt', base));
    assert.equal(robotsResponse.status, 200);
    assert.match(robotsResponse.headers.get('content-type') || '', /^text\/plain\b/i, 'Robots plain text content type');
    const robots = await robotsResponse.text();
    assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`));
    assert.deepEqual([...robots.matchAll(/^User-agent:\s*(.+)$/gmi)].map(([, agent]) => agent.trim()), ['*'], 'One shared policy including Googlebot');
    assert.match(robots, /^Allow:\s*\/$/m, 'Public crawling allowed');
    const disallowed = [...robots.matchAll(/^Disallow:\s*(.+)$/gmi)].map(([, path]) => path.trim());
    for (const path of [...paths, '/sitemap.xml', '/robots.txt']) {
        assert.ok(!disallowed.some(rule => path.startsWith(rule)), `${path} not robots-blocked`);
    }
    for (const path of ['/profile', '/admin']) {
        assert.ok(robots.includes(`Disallow: ${path}`), path);
    }
    for (const path of ['/login', '/forgot-password', '/reset-password']) {
        assert.ok(!robots.includes(`Disallow: ${path}`), `${path} must be crawlable to read noindex`);
        const response = await request(new URL(path, base));
        assert.equal(response.status, 200, path);
        assert.match(response.headers.get('x-robots-tag') || '', /noindex/, path);
    }
    for (const path of ['/profile', '/admin']) {
        const response = await request(new URL(path, base));
        assert.match(response.headers.get('x-robots-tag') || '', /noindex/, path);
    }
    const privateResponse = await request(new URL('/api/admin-usage-stats', base));
    assert.equal(privateResponse.status, 401, 'Unauthenticated private API');
    assert.match(privateResponse.headers.get('x-robots-tag') || '', /noindex/);
    for (const path of ['/seo-missing-page-check', '/map/seo-missing-page-check']) {
        const response = await request(new URL(path, base));
        assert.equal(response.status, 404, `${path} genuine 404, no SPA fallback`);
    }
    if (userAgent === 'ParkSafe-SEO-check') console.log(JSON.stringify(pages, null, 2));
    console.log(`PASS (${userAgent}): public SSR metadata, status codes, JSON-LD, sitemap XML, robots and private noindex/access checks`);
}

async function main() {
    for (const agent of ['ParkSafe-SEO-check', 'Googlebot']) await check(agent);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
