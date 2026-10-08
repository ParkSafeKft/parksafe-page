# PARKS-289 – SEO és indexelési ellenőrzés

Ellenőrzés: 2026-10-08. A munka kezdetén a `git status --short` üres volt; a projektben nem volt `graphify-out/`. Commit és deploy nem készült. A parksafe repó 2026-10-07-i Search Console exportjai csak olvasva voltak.

## Kiinduló állapot és diagnózis

Az export szerint a sitemap beküldését elfogadta a Search Console, de feldolgozása sikertelen, a felfedezett oldalak száma 0. A négy új oldal indexelési kérelme elfogadott, indexelésük nem igazolt. A CWV-adathiány nem technikai SEO-hiba.

Az éles oldalon a módosítások előtti HTTP-ellenőrzés eredménye:

- A sitemap normál kéréssel és Googlebot User-Agent mellett HTTP 200 és `application/xml`; a robots.txt HTTP 200 és `text/plain`.
- A meglévő sitemap már kilenc publikus production URL-t tartalmazott, a robots.txt helyesen hivatkozott rá. Hibás XML-t, autholt vagy preview URL-t nem találtam.
- `/map`, `/bikerack`, `/service`, `/water`: HTTP 200, nincs redirect, nincs HTML noindex vagy X-Robots-Tag noindex, nincs robots tiltás. Mindegyiken saját, query nélküli `https://parksafe.hu/...` canonical, egyedi title és description, egy szerveroldalon renderelt H1 és magyarázó tartalom van. Mind a négy szerepel a sitemapben.
- Kameraquery mellett is az alapoldal a canonical. Nincs szükség JavaScriptre a SEO-szöveghez; az interaktív térkép kliensoldali működése ettől különálló.
- HTTP → HTTPS: 301. `https://www.parksafe.hu/...` → `https://parksafe.hu/...`: 307. A www átirányítás ideiglenes státusza hostingoldali utánkövetést igényel; a repóban nincs ezt létrehozó redirect konfiguráció.
- Egy nem létező éles URL 404-et adott, nem a főoldal 200-as SPA fallbackjét.

A GSC sitemap-hiba gyökérokát a nyilvános HTTP-siker nem bizonyítja. A Googlebot User-Agent utánzása sem a Google saját hálózatáról érkező kérés igazolása. Nem állítjuk, hogy a generátorra átállás megoldotta a GSC feldolgozási hibáját.

## Elvégzett változtatások

- `src/app/sitemap.ts`: Next.js metadata route, explicit kilencelemű publikus engedélylista, a meglévő fix production `siteUrl` használatával. Nem használ request hostot, környezeti preview domaint, kamerakoordinátát vagy auth route-ot. Nincs kitalált lastmod; a Google által figyelmen kívül hagyott priority/changefreq mezők elmaradnak.
- `src/app/robots.ts`: egyetlen közös wildcard crawlercsoport, publikus bejárás és a production sitemap hivatkozása. A privát útvonalak korábbi tiltása megmarad; a login és jelszóoldalak bejárhatók, hogy a meglévő noindex fejléc olvasható legyen. A nem szabványos LLMs-txt sor elmarad; a llms.txt és Link fejléc megmarad.
- `public/sitemap.xml`, `public/robots.txt`: törölve, hogy ne ütközzenek a generált route-okkal.
- A négy `src/app/(main)/(map)/{map,bikerack,service,water}/page.tsx`: pontosított, egyedi title és meta description, a kerékpáros térkép, kerékpártároló/bicikliparkoló, szerviz/javítópont és ivókút keresési szándékhoz igazítva. Az OG/Twitter adatok a meglévő közös helperből ugyanazt a tartalmat kapják.
- `src/lib/translations.ts`: a magyar map, bikerack és service H1 és a map H2 pontosítása. A már megfelelő ivókút H1 megmarad. Nem került bele nem létező webes útvonaltervezés, garantált férőhely vagy működő ivókút ígérete.
- `scripts/check-seo.mjs`: normál és Googlebot-kérések; automatikus redirectkövetés kikapcsolva; sitemap teljes minimális XML-formátuma, MIME-típusok, pontos URL-lista, közös robotsszabályok, query státusz/canonical, SSR tartalom és valódi 404 ellenőrzése. A korábbi metadata/JSON-LD/privát noindex/access ellenőrzések megmaradnak.
- `docs/seo-geo-deployment.md`: a generált route-ok és a crawl/noindex viszony dokumentálása.

A sitemap/robots átállás karbantarthatósági és regressziómegelőző megerősítés; az audit nem talált igazolt publikus crawlblokkolást vagy hibás sitemap XML-t a korábbi verzióban.

## Ellenőrzések

- `npm run lint`: PASS, hiba és lint warning nélkül.
- `npx tsc --noEmit`: PASS. Nincs külön typecheck script a package.json-ban.
- `npm run build`: PASS. A négy térképes oldal, a sitemap és a robots statikusan prerenderelt.
- `node scripts/check-map-data.mjs`: PASS.
- `node --test src/components/admin/weekly-ride-navigation.test.cjs`: PASS, 2 teszt. Nincs közös npm test script a projektben.
- `npm run start -- --hostname 127.0.0.1 --port 3002`, majd `node scripts/check-seo.mjs http://127.0.0.1:3002`: PASS normál és Googlebot User-Agent mellett. A négy oldal HTTP 200, bejárható és saját canonicalt használ, a tartalom SSR HTML-ben megvan; nincs noindex. A hiányzó normál és map alútvonal HTTP 404.
- A build `.next/server/app/sitemap.xml.body` fájljának .NET XML-parseres beolvasása PowerShell `[xml]` típussal: PASS, kilenc várt production URL.
- `git diff --check`: PASS.

Meglévő környezeti figyelmeztetések: Next.js több lockfile miatt a `C:/Users/kopa` mappát következteti workspace rootnak; a map-data Node teszt MODULE_TYPELESS_PACKAGE_JSON warningot ad. Ezek nem akadályozták a buildet vagy a teszteket, és nem indokolták a jelen SEO-feladatban a buildkonfiguráció vagy package module típus módosítását.

## Deploy utáni teendők és külső függőségek

1. A friss deployment ellen futtatni a `node scripts/check-seo.mjs https://parksafe.hu` parancsot. Ellenőrizni a XML/robots MIME-típust, redirect nélküli HTTP 200-at és a production canonicalokat.
2. Search Console Sitemaps alatt újra beküldeni/ellenőrizni a `https://parksafe.hu/sitemap.xml` címet. A siker feltétele a feldolgozás sikeres státusza és a kilenc URL felfedezése, nem pusztán a beküldés elfogadása.
3. A négy oldalon URL Inspection → élő URL teszt: bejárás engedélyezett, lekérés sikeres, renderelt tartalom elérhető, indexelés engedélyezett. Külön ellenőrizni a tárolt jelentésben a Google által választott canonicalt és az indexelt állapotot. Indokolt esetben új indexelési kérelem; az elfogadás önmagában továbbra sem indexelési bizonyíték.
4. A korábban indexelt, robots által tiltott URL-t a GSC részletjelentésében azonosítani. A login/jelszóoldalak crawl/noindex párosítása megfelelő; a privát admin/profile robotstiltást nem szabad az ismeretlen figyelmeztetés miatt találomra feloldani.
5. Ha a sitemap lekérési hiba megmarad, a GSC hibarészlet és időpont alapján ellenőrizni a hosting/CDN/WAF logokat, rate limitinget, botvédelmet, DNS/TLS és IPv6 elérést. Ezekhez a repo és a User-Agent-es HTTP-próba nem elegendő.
6. A hostingban a www → apex átirányítást végleges 301/308 státuszra állítani, majd újramérni. Preview deploymentek hozzáférési/indexelési védelmét hostingoldalon ellenőrizni; a production canonical és sitemap nem önmagában preview-indexelési tiltás.
7. A Search Console teljesítményében idővel követni a nem márkás megjelenéseket/kattintásokat. A szövegjavítás és sitemap nem garantál rangsorolást vagy indexelést; a CWV adathiányt továbbra sem hibaként kezelni.

Forrás: [Google sitemap útmutató](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). A saját mérések és a Search Console export külön bizonyítékok; a helyi PASS nem éles deploy vagy indexelési igazolás.
