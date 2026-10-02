# PARKS-199 – publikus SEO ellenőrzés és javítás

Ellenőrzés: 2026-10-02. Ticket: https://perjesi-szabolcs.atlassian.net/browse/PARKS-199

## Hatókör és indexelési döntés

A publikus marketing oldal repoja: `ParkSafeKft/parksafe-page`, helyi projekt: `parksafe-page`, publikus host: `https://parksafe.hu`. Az `ads-market-reserch` research workspace nem a publikus oldal és nem az élesítés forrása.

A felhasználó 2026-10-02-án jóváhagyta: `/`, `/about`, `/contact`, `/privacy`, `/terms` mind indexelhető, saját canonical URL-lel. Az utóbbi kettő jogi oldal; indexelhetően tartásuk tudatos döntés. A login, profil, jelszókezelés és admin marad kizárva. Jogosultságkezelést nem módosítottunk.

## Előtte – tényleges éles HTML és HTTP állapot

Az alábbi minta a javítás előtt, HTTP GET-tel készült. Minden oldal `lang="hu"`, nincs `noindex` sem a HTML robots metában, sem az `X-Robots-Tag` fejlécben. Az öt URL szerepelt az éles sitemapben.

| URL útvonal | HTTP | Title | Description | Canonical | Megállapítás |
| --- | --- | --- | --- | --- | --- |
| `/` | 200 | Közös cím | Közös leírás | `https://parksafe.hu` | Főoldali canonical helyes |
| `/about` | 200 | Közös cím | Közös leírás | `https://parksafe.hu` | Oldaladatok duplikáltak, canonical főoldalra mutat |
| `/contact` | 200 | Közös cím | Közös leírás | `https://parksafe.hu` | Oldaladatok duplikáltak, canonical főoldalra mutat |
| `/privacy` | 200 | Közös cím | Közös leírás | `https://parksafe.hu` | Oldaladatok duplikáltak, canonical főoldalra mutat |
| `/terms` | 200 | Közös cím | Közös leírás | `https://parksafe.hu` | Oldaladatok duplikáltak, canonical főoldalra mutat |

Közös cím: `ParkSafe: Kerékpáros Navigáció & Térkép`.

Közös leírás: „Tervezz bringás útvonalat, keress kerékpártárolót és szervizt a közeledben. A ParkSafe ingyenes, iOS-re és Androidra is letöltheted.”

A gyökér URL-nél a `https://parksafe.hu` és `https://parksafe.hu/` ugyanazt az URL-t jelenti; a Next.js a HTML attribútumban perjel nélkül, a böngésző normalizált URL-ként perjellel adhatja vissza. Ez nem canonical hiba.

## Utána – helyi production build HTML

Ellenőrzött szerver: `http://localhost:3002`, `next build` majd `next start`. Nem az éles deployment eredménye. Mind az öt oldal HTTP 200, egy canonical tag, egyedi cím és leírás, `lang="hu"`, nincs noindex, és szerepel a sitemapben.

| URL útvonal | Title | Canonical |
| --- | --- | --- |
| `/` | ParkSafe: Kerékpáros navigáció és térkép | `https://parksafe.hu/` |
| `/about` | Rólunk – ParkSafe | `https://parksafe.hu/about` |
| `/contact` | Kapcsolat – ParkSafe | `https://parksafe.hu/contact` |
| `/privacy` | Adatvédelmi szabályzat – ParkSafe | `https://parksafe.hu/privacy` |
| `/terms` | Általános szerződési feltételek – ParkSafe | `https://parksafe.hu/terms` |

| Útvonal | Description |
| --- | --- |
| `/` | Tervezz bringás útvonalat, keress kerékpártárolót és szervizt a közeledben. A ParkSafe ingyenes, iOS-re és Androidra is letöltheted. |
| `/about` | Ismerd meg a ParkSafe történetét, csapatát és a kerékpáros közlekedést segítő alkalmazás fejlődését. |
| `/contact` | Kérdésed van a ParkSafe-ről, vagy együttműködnél velünk? Itt találod az elérhetőségeinket. |
| `/privacy` | Ismerd meg, milyen adatokat kezel a ParkSafe, hogyan használjuk és védjük őket, és milyen jogok illetnek meg. |
| `/terms` | A ParkSafe alkalmazás és szolgáltatások használati feltételei, a felhasználók jogai és kötelezettségei. |

Az Open Graph és Twitter cím/leírás minden oldalon megegyezik a saját metadata tartalmával; az OG URL saját canonicalra mutat. A meglévő logó tényleges mérete 512 × 512, ezt adjuk meg a korábbi téves 1200 × 630 helyett. A kliensoldali lapokhoz kisméretű szerveroldali layout adja a metadata exportot, közös beépített Next.js Metadata megoldással.

Az első szerveroldali megjelenés magyar, a keresőcímek magyarok. Nyelvváltáskor a HTML `lang` már követi a HU/EN tartalmat. Nincs külön angol URL: nincs kitalált `hreflang` alternatíva, a canonical és a szerveroldali SEO-adatok a magyar elsődleges oldalt jelölik.

## Sitemap, robots és privát utak

- A sitemap továbbra is pontosan az öt jóváhagyott, HTTP 200-as, indexelhető, saját canonical URL-t tartalmazza.
- A statikus `lastmod` dátumokat eltávolítottuk, mert nem mindegyik volt igazolható valódi tartalmi módosításként. A jogi dokumentumok látható dátuma augusztus 12., miközben a sitemap január 29-et adott. Új lastmod csak igazolt változáskövetésből kerüljön vissza.
- `robots.txt` és `sitemap.xml`: élesen és helyi production szerveren HTTP 200. A robots sitemap-hivatkozása a helyes hostra mutat.
- A korábbi mérésben `/login`, `/profile`, `/forgot-password`, `/reset-password`, `/admin` esetén robots.txt kizárás és `X-Robots-Tag: noindex, nofollow, noarchive` is szerepelt. A PARKS-288 jóváhagyott helyi korrekciója lent külön szerepel; ez nem élesítés igazolása.
- `/api/admin-usage-stats`: bejelentkezés nélküli kérésre HTTP 401 és noindex, élesen és helyben is. A teljes auth rendszer nem volt auditálva.

## Strukturált adatok és látható állítások

| Mező | Ellenőrzött egyezés / változtatás |
| --- | --- |
| Ár | `offers.price=0`, `isAccessibleForFree=true`; egyezik a HU/EN főoldal és az ingyenességről szóló FAQ állításával |
| Platform | iOS és Android; egyezik a letöltési gombokkal és a FAQ-val |
| Store URL-ek | Ugyanaz az App Store app ID és Google Play package szerepel a schema és a gombok adataiban |
| Funkciók | Útvonaltervezés, tárolókeresés, szerviz/pumpa keresése, közösségi értékelések/fotók/hibajelzés; a főoldali és FAQ tartalommal egyezik |
| Organization | Email, telefonszám és közösségi linkek egyeznek a kapcsolat/lábléc tartalmával |
| App kategória | `NavigationApplication` helyett a Google támogatott `TravelApplication` kategóriája; az útvonaltervezési alcím megmarad |
| FAQ | 7 kérdés és válasz, HU/EN nyelven ugyanabból a fordítási forrásból; mind a 7-et megnyitva a látható tartalom és a JSON-LD egyezett |

Validátor: `https://validator.schema.org/`, 2026-10-02, a helyi production főoldal renderelt JSON-LD kódrészletével. Eredmény: **0 hiba, 0 figyelmeztetés**, három felső szintű elem: SoftwareApplication, WebSite, FAQPage; Organization a kapcsolódó gráf része.

Ez Schema.org markup-validálás, nem Google rich-result jogosultsági igazolás. Nincs kitalált értékelés/review. A Google SoftwareApplication rich result rating vagy review mezőt is kér; ilyen igazolt adatot nem adtunk hozzá. A schema ár/funkció egyezés itt a publikus tartalomhoz történt, nem a mobilapp aktuális release-ének külön auditja.

## Search Console – dokumentált hozzáférési blokk

2026-10-02: megnyitottuk a `https://search.google.com/search-console` oldalt, majd a „Start now” belépést. A böngésző a Google-fiók email/telefon bejelentkezési képernyőjére irányított. Ebben a munkamenetben nincs hitelesített GSC session és nincs elérhető Search Console connector.

Ezért nem volt ellenőrizhető a `parksafe.hu` property tulajdonjoga, a hozzáférhető időtáv vagy a tényleges indexelési eredmény. Nem készült query/page/country/device, Pages vagy CWV nyers export, és nincs branded/nonbranded toplista. Keresési volument, kattintást és CWV értéket nem becsültünk. A konkrét access blokk a kapcsolódó GSC részfeladat elfogadási feltételei szerint dokumentált eredmény.

Hozzáférés pótlásának felelőse: a ParkSafe GSC-property tulajdonosa vagy adminisztrátora. A konkrét személy és fiók nem volt igazolható ebből a sessionből. Szükséges lépés: bejelentkezés egy jogosult fiókkal vagy dátumos export átadása. Ekkor 16 hónapra, illetve a teljes elérhető időszakra kell exportálni a fenti bontásokat, jelölve az anonim query-k és exportlimitek hiányát. Új propertyt vagy Google-fiókot nem hoztunk létre.

## Ellenőrzés és átadás

- `npm run build`: sikeres fordítás, TypeScript ellenőrzés és 16 oldal generálása.
- Módosított TS/TSX fájlok és ellenőrző script ESLint: hibamentes.
- `node scripts/check-seo.mjs http://localhost:3002`: PASS. Ellenőrzi az öt oldal HTTP/canonical/title/description/OG/Twitter/lang adatait, a JSON-LD alapmezőit, sitemapet, robotsot, privát noindexet és a kiválasztott privát API 401-es válaszát.
- Böngészőben az öt production oldal metadata ellenőrzése, valamint HU/EN nyelvváltás és mind a 7 FAQ megnyitása megtörtént.
- Élesítés és kereső általi újrafeldolgozás nem történt ebben a munkában. A meglévő, külön adminos módosítások nem részei a PARKS-199 változtatásnak.

Források: [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Google sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Google SoftwareApplication](https://developers.google.com/search/docs/appearance/structured-data/software-app).

## PARKS-288 — jóváhagyott helyi robots korrekció

2026-10-02: a felhasználó jóváhagyta a `/login`, `/forgot-password`, `/reset-password` Disallow sorok eltávolítását. Ezek publikus belépési felületek, de nem keresőbe szánt tartalmak. A bejárás engedett, hogy a kereső elolvashassa a meglévő noindex fejlécet. [Google noindex feltételek](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

| Útvonal | Helyi HTTP | Robots bejárás | Noindex | Sitemap | Canonical / szándék |
| --- | --- | --- | --- | --- | --- |
| `/` | 200 | engedett | nincs | igen | saját URL, indexelhető |
| `/about` | 200 | engedett | nincs | igen | saját URL, indexelhető |
| `/contact` | 200 | engedett | nincs | igen | saját URL, indexelhető |
| `/privacy` | 200 | engedett | nincs | igen | saját URL, jóváhagyott jogi indexelés |
| `/terms` | 200 | engedett | nincs | igen | saját URL, jóváhagyott jogi indexelés |
| `/login` | 200 | engedett | HTTP fejléc | nem | nem indexelendő belépési felület |
| `/forgot-password` | 200 | engedett | HTTP fejléc | nem | nem indexelendő jelszókezelési felület |
| `/reset-password` | 200 | engedett | HTTP fejléc | nem | nem indexelendő jelszókezelési felület |
| `/profile`, `/admin` | HTTP kérés és noindex ellenőrizve | tiltott | HTTP fejléc; crawl tiltás mellett önmagában nem deindexelési bizonyíték | nem | privát felület, a hozzáférési szabályok nem változtak |
| `/api/admin-usage-stats` | 401 bejelentkezés nélkül | robots admin-prefix tiltás | HTTP fejléc | nem | API hozzáférés változatlan |

A sitemap pontosan az öt szándékosan indexelhető saját canonicalos URL-t tartalmazza. Nincs kitalált lastmod dátum. A robots sitemap-hivatkozása megfelelő.

Ellenőrzés: `node scripts/check-seo.mjs http://localhost:3002` PASS, a friss robots.txt HTTP válaszával; script ESLint és diff ellenőrzés hibamentes. A három belépési URL HTTP 200 és noindex, bejárási tiltás nélkül. Jogosultságkezelés és Next.js header konfiguráció nem változott. A statikus robots.txt módosításához nem kellett új build; a futó helyi production szerver már az új fájlt adta vissza.
