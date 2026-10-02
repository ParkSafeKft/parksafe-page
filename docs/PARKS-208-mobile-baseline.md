# PARKS-208 – mobil CTA, képminőség és teljesítmény baseline

Dátum: 2026-10-02. Ticket: https://perjesi-szabolcs.atlassian.net/browse/PARKS-208

## Hatókör és kiválasztott javítás

A publikus főoldal (`https://parksafe.hu/`) mobilos hero, letöltésgomb és képhasználat ellenőrzése. A módosítás helyben készült, nincs deployolva.

Fő javítás: a magyar főcím levágódásának megszüntetése. Az eredeti 57,6 px-es minimum mellett a „Kerékpározás,” és az „Újragondolva.” túlnyúlt a szövegterületen. A mobilos méret most `clamp(2.25rem,12vw,3.6rem)`; 640 px-től a meglévő méretezés marad. A hero kép HTML méretaránya 480 × 900 helyett 480 × 480, összhangban a négyzetes forrásképekkel.

## Megjelenés és CTA mátrix

A nézeteket T3 Chromium böngészőben ellenőriztük, asztali user agenttel és 1,25 DPR-rel. A 390 px-es nézetben a görgetősáv miatt 375 px a hasznos dokumentumszélesség. Ez nem valódi telefonos teszt.

| Nézet | Főcím | Felső iOS / Android CTA | Eredmény |
| --- | --- | --- | --- |
| Éles HU, 390 × 844, javítás előtt | 335 px-es területen 389 / 376 px-es tartalom; levágódik | y=572,75 / 640,75 px; 56 px magas | Főcím hibás, mindkét gomb látható |
| Helyi HU, 390 × 844, javítás után | 46,848 px; 335 / 335 px, nincs túlcsordulás | y=533,20 / 601,20 px; 56 px magas | Főcím elfér; gombok kb. 40 px-szel feljebb |
| Helyi EN, 390 × 844 | 335 / 335 px, nincs túlcsordulás | y=447 / 515 px; 56 px magas | Főcím és gombok elférnek |
| Helyi HU, 320 × 740 | 38,4 px; 265 / 265 px, nincs túlcsordulás | y=534,10 / 602,10 px; 56 px magas | A keskenyebb mobilnézetben is elfér |
| Helyi HU/EN, 1440 × 900 | Meglévő desktop betűméret: 116,64 px | Egymás mellett, 56 px magas; az első képernyőn | Desktop smoke ellenőrzés megtörtént |

A magyar desktop főcím leghosszabb szava kb. 26 px-szel túlnyúlik a saját oszlopán, de nem a képernyőn; ezt a meglévő desktop elrendezést nem változtattuk.

| Gomb helye | HU / EN szöveg | Cél |
| --- | --- | --- |
| Hero és alsó letöltési szekció, iOS | Letöltés iOS-re / Download for iOS | https://apps.apple.com/app/id6752813986 |
| Hero és alsó letöltési szekció, Android | Irány az Android / Get it on Android | https://play.google.com/store/apps/details?id=com.parksafe.app |
| Lábléc | App Store / Google Play | Ugyanezek a store-címek |

Mind a hat főoldali store-link célját ellenőriztük. A két store-oldal HTTP GET ellenőrzése 200-as választ adott, ParkSafe appcímmel. A tényleges telefonos store-megnyitás és telepítés nincs ellenőrizve. A felső gombok elég nagyok, névvel és billentyűzetes fókuszjelzéssel rendelkeznek; az Inter betűtípus betöltődött.

## Képmátrix és PARKS-243 átadás

| Hely / asset | Forrásméret | Megjelenítés / crop | Megállapítás |
| --- | --- | --- | --- |
| Hero: `ios_mapview.png` és WebP/PNG változatok | Eredeti 1080 × 1080; változatok 300, 480, 600, 800 px, mind négyzetes | Mobilon 330 × 330 CSS px, desktopon 460 × 460; a teljes négyzetes mockup látható | HTML méretarány javítva. WebP és reszponzív `srcSet` már létezik. A mockupon belüli apró feliratok vizuálisan puhák; forrásminőség ellenőrzendő valódi telefonon. |
| Platform kártya: `ios_mapview_600.webp` / `.png` | 600 × 600 | 390-es nézetben a transzformált img doboz kb. 322 × 420 CSS px; `object-contain`, nagyítás, forgatás és a kártya szélén dekoratív levágás | A levágás az elrendezés része. A desktop transzformált doboz kb. 608 × 530 px; magas DPR-en a fix 600 px-es változat kevés lehet. PARKS-243 alatt vizsgálandó nagyobb reszponzív változattal. |
| Fejléc / lábléc: `logo_64.webp` / `.png` | 64 × 64 | 24 × 24 / 28 × 28 CSS px | Betöltődött; az ellenőrzött 1,25 DPR-en nincs szükség felnagyításra. |

A hero WebP változatok mérete: 300 px = 13 034 bájt; 480 px = 26 530; 600 px = 35 724; 800 px = 53 104. A böngésző a nézet, DPR és cache függvényében választ; az éles mobilvizsgálatban 600, a helyi vizsgálatban 480 px-es változat töltődött.

Nem állítjuk, hogy a korábbi low-res probléma minden assetje azonosítva vagy javítva van. A `/about` fotói, az új appképek és a verified POI-szám igazolása a PARKS-243 külön feladata. Most nem cseréltünk képet és nem módosítottunk POI-számot.

## Lab baseline – éles oldal, javítás előtt

Mérés: 2026-10-02 08:52:22 UTC. Egy betöltés a T3 Chromium 152 böngészőben, Windows asztali user agent, 390 × 844 CSS px, DPR 1,25. Nincs CPU- vagy hálózati lassítás, a cache nincs kiürítve. Ez böngészős diagnosztikai minta, nem Lighthouse pontszám és nem mobil field-eredmény.

Buffered `PerformanceObserver` a `largest-contentful-paint` és `layout-shift` eseményekre; a mérés a navigáció után kb. 24,77 másodpercnél zárult. A CLS a legnagyobb session window összege, a friss felhasználói bemenethez kapcsolódó elmozdulások nélkül (1 s szünet / legfeljebb 5 s ablak).

| Metrika | Mért érték | Korlát |
| --- | --- | --- |
| LCP | 1148 ms | A főcím (`H1`) volt az LCP elem |
| CLS | 0 | A megfigyelt betöltés során, nem a teljes felhasználói munkamenetre |
| FCP | 276 ms | Egyetlen, nem lassított betöltés |
| TTFB | 172,3 ms | Navigation Timing `responseStart` |
| INP | Nincs mérve | Nem helyettesítjük TBT-vel vagy kitalált értékkel |

A PageSpeed Insights mobil API-kérése HTTP 429 (`Too Many Requests`) hibával végződött. Lighthouse riport és pontszám nem készült. A helyi Next.js dev szerver idejét nem hasonlítjuk az éles production oldalhoz; ebből a munkából nem következik igazolt CWV-gyorsulás.

## Field-adathiány és nyitott ellenőrzések

- Search Console CWV-exportot és hitelesített hozzáférést ebben a munkában nem használtunk; GSC/CrUX field LCP, INP és CLS adat nincs a riportban. Ez hozzáférési/mérési hiány, nem bizonyíték arra, hogy az oldalnak nincs CrUX adata.
- Élesítés után mobil PageSpeed/Lighthouse újrafuttatás és elérhető GSC/CrUX field-adatok külön rögzítése szükséges.
- Valódi iPhone/Android próba még hátravan: HU/EN főcím, CTA láthatóság, store-megnyitás, képélesség és crop.
- Jira szerint PARKS-199 blokkolja PARKS-208-at. A metadata/canonical előfeltétel teljesülését ez a módosítás nem igazolja; a ticketet nem zártuk le.

A lab és field adatok külön értelmezésének forrása: https://web.dev/articles/vitals

## Ellenőrzés

`npx eslint 'src/app/(main)/page.tsx'` hibamentes. `git diff --check` sikeres. `npm run build` sikeres, beleértve a TypeScript ellenőrzést és mind a 16 oldal generálását. HU/EN 390 px-es és 1440 px-es böngészős smoke, valamint HU 320 px-es szélességellenőrzés megtörtént. A módosítás két JSX class/attribútum értéket érint; nincs új függőség.
