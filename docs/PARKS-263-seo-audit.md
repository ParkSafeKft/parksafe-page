# PARKS-263 — aktuális publikus metadata/canonical audit

Ellenőrzés: **2026-10-02, 12:41 Europe/Budapest** (10:41 UTC).
Ticket: https://perjesi-szabolcs.atlassian.net/browse/PARKS-263

## Hatókör és módszer

Publikus marketing site: **https://parksafe.hu**.
Élesítés forrása: **ParkSafeKft/parksafe-page**; helyi projekt: `C:/Users/kopa/Desktop/DEV/PARKSAFE/parksafe-page`.
A `../ads-market-reserch` kutatási workspace; nem a publikus site. Az ottani `research/seo/seo-audit.md` 2026-09-30-as megfigyeléseit friss éles bizonyítékkal vetettük össze.

A T3 böngészőből ugyanazon originre indított HTTP GET-ek (`fetch`, `cache: no-store`), a visszakapott HTML DOMParser feldolgozása. Nem keresőcache vagy localhost alapján állítjuk az éles állapotot. A nyers mérési rekordok a [PARKS-263-live-evidence.json](PARKS-263-live-evidence.json) fájlban vannak. A közvetlen Python HTTP kliens 403 választ kapott; a böngészős HTTP mérés viszont mind a hét vizsgált URL-nél 200-at adott. Ebből nem állítunk Googlebot hozzáférési hibát.

## Ötoldalas mátrix

T1 = **ParkSafe: Kerékpáros Navigáció & Térkép**

D1 = **Tervezz bringás útvonalat, keress kerékpártárolót és szervizt a közeledben. A ParkSafe ingyenes, iOS-re és Androidra is letöltheted.**

Robots oszlop: HTML robots meta / X-Robots-Tag fejléc. A hiányzó robots meta önmagában nem hiba; egyik vizsgált publikus oldalon sincs noindex.

| URL | HTTP | Title | Description | Canonical | Robots | Lang | Sitemapben |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [/](https://parksafe.hu/) | 200 | T1 | D1 | https://parksafe.hu/ | nincs / nincs | hu | igen |
| [/about](https://parksafe.hu/about) | 200 | T1 | D1 | https://parksafe.hu/ | nincs / nincs | hu | igen |
| [/contact](https://parksafe.hu/contact) | 200 | T1 | D1 | https://parksafe.hu/ | nincs / nincs | hu | igen |
| [/privacy](https://parksafe.hu/privacy) | 200 | T1 | D1 | https://parksafe.hu/ | nincs / nincs | hu | igen |
| [/terms](https://parksafe.hu/terms) | 200 | T1 | D1 | https://parksafe.hu/ | nincs / nincs | hu | igen |

Mind az öt oldalon pontosan egy canonical van. A főoldal self-canonicalja helyes. A `https://parksafe.hu` és `https://parksafe.hu/` azonos normalizált gyökér URL; ez nem külön hiba.

## Konkrét fennmaradt hibák

1. **Négy hibás aloldali canonical:** `/about`, `/contact`, `/privacy`, `/terms` mind a főoldalt jelöli a saját URL helyett. A már jóváhagyott indexelési szándék szerint mind az öt oldal indexelhető és saját canonicalt kap. Javítás gazdája: **PARKS-287**.
2. **Öt oldalon közös title és description:** a négy aloldal nem a saját tartalmát írja le. A főoldali metadata létezése rendben van; a hiba az oldalankénti különbség hiánya. Javítás gazdája: **PARKS-287**.
3. **Megosztási adatok ugyanilyen közösek:** az OG title/description mindegyik oldalon T1/D1, OG URL mindegyiken `https://parksafe.hu`. Az aloldalakhoz saját cím/leírás/URL kell. Javítás gazdája: **PARKS-287**.
4. **Téves megosztási képméret:** mind az öt HTML 1200 × 630-as OG képméretet ad, miközben az éles `/logo.png` letöltött bitmapje **512 × 512**. Javítás gazdája: **PARKS-287**.

## Ami a vizsgált scope-ban rendben van

- Mind az öt publikus URL HTTP 200.
- Mind az öt HTML nyelve `hu`, a kezdeti magyar megjelenésnek megfelelően.
- Nincs publikus noindex a metaadatban vagy az X-Robots-Tag fejlécben.
- A robots.txt HTTP 200, engedi az öt publikus útvonal bejárását, és a megfelelő sitemap URL-t adja.
- A sitemap.xml HTTP 200, pontosan az öt vizsgált publikus URL-t tartalmazza.
- Az OG title/description a jelenlegi HTML title/description értékével egyezik; a hiba itt is a közös, nem oldalspecifikus érték.

A sitemap aloldali URL-jei és a főoldalra mutató aloldali canonicalok jelenleg eltérő URL-szándékot jeleznek. Ez az 1. számú canonical hibából következik; a **PARKS-288** alatt újraellenőrizendő a javítás után. Az éles lastmod értékeket rögzítettük a bizonyítékban, de az értékek korából önmagában nem állítunk új SEO-hibát.

## Korábbi audit → most

A 2026-09-30-as audit négy hibás canonicalja és a közös metadata problémája **továbbra is fennáll élesen**. A description szövege megváltozott a kutatási snapshotban idézett verzióhoz képest, de továbbra is közös az öt URL-en. A HTTP/robots/sitemap alapelérhetőség továbbra is rendben van.

## Helyi javítások elkülönítése

A korábbi PARKS-199 munkában a helyi repó már tartalmazza az egyedi metadata és self-canonical javításokat. A `node scripts/check-seo.mjs http://localhost:3002` ellenőrzés 2026-10-02-án PASS eredményt adott. Ez **nem éles deployment bizonyíték**, és nem helyettesíti a PARKS-287/288/294 részfeladatok saját elfogadási ellenőrzését.

## Következő átadás

A PARKS-263 audit elkészült; nem implementációs ticket. Következő: **PARKS-287**, a már meglévő helyi javítások felülvizsgálata és éles ellenőrzése. Kód, deployment és Jira-státusz nem változott ebben a feladatban.

A tényleges Google indexelés, sitemap feldolgozás, keresési teljesítmény és CWV nem állapítható meg ebből a HTML auditból; ezek a **PARKS-289** scope-jába tartoznak.

