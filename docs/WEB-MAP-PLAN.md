# ParkSafe webes térkép — megvalósítási terv

Dátum: 2026-10-02. Állapot: megvalósításra átadott specifikáció, nem elkészült funkció.

## 1. Cél és elfogadott irány

Egy bejelentkezés nélkül használható magyarországi térkép a meglévő ParkSafe weboldalon. Ugyanaz a térkép négy külön, közvetlenül megnyitható URL-en, eltérő helytípus-szűrővel. A kategóriaváltás ne töltse újra az egész oldalt és ne állítsa vissza a térképet.

A ParkSafe már országosan él. Ez nem indulási pilot, nem piackutatás és nem random résztvevős teszt. A szükséges ellenőrzés a megvalósítás buildje, működése, adatvédelme és mobilos használhatósága.

Prioritások: hasznos térkép és helylista; a jelenlegi webhez illő igényes design; nulla fizetős térkép-API; minimális élő backend-terhelés. Több URL nem jelent garantált Google-rangsorolást.

## 2. A jelenlegi repo alapján ismert tények

- Next.js App Router 16.1.6, React 19, TypeScript, Tailwind 4.
- `maplibre-gl` már telepítve van, a package.json szerint `^5.23.0`. Ne frissítsd csak ezért.
- Az admin `src/components/admin/InteractiveRouteMap.tsx` már MapLibre + OpenFreeMap Liberty stílust használ. Referenciaként olvasd, az admin privát útvonaladatait és jogosultságát ne használd publikus adatforrásként.
- `src/app/(main)/layout.tsx`: meglévő Header/Footer; `src/components/Header.tsx`: fix, 72–80 px magas fejléc.
- A marketingoldal vizuális mintája: világos törtfehér/zöld háttér, sötét szöveg, élénk zöld kiemelések, erős tipográfia, vékony keretek, 12 px körüli gombsarkok.
- `src/lib/seo.ts`: meglévő `publicPageMetadata` és `siteUrl`; új SEO-rendszer helyett ezt használd.
- `src/lib/translations.ts` + LanguageContext: meglévő HU/EN fordítási megoldás.
- `public/sitemap.xml` jelenleg öt publikus oldalt tartalmaz. `scripts/check-seo.mjs` is ezt ellenőrzi; új publikus route-oknál mindkettőt összehangoltan módosítsd.
- A `next.config.ts` jelenleg `geolocation=()` Permissions-Policy fejlécet küld minden oldalra. V1-ben ne ígérj működő „helyzetem” gombot ezzel a konfigurációval; lásd a scope-ot.
- Adminban láthatók POI-k és `cities` lekérdezések, de publikus olvasási szerződés, tényleges teljes HU exportméret és hosting/CDN nincs ebben a tervben igazolva. Ez megvalósítás előtti rövid technikai felderítés, nem új kutatási projekt.
- A terv készítésekor `graphify-out/` nincs a projektben. Ha később létrejön, a felderítés előtt a graphify-t használd.

## 3. Kötelező design-folyamat

Olvasd el és használd:

1. **apple-design**: `C:/Users/kopa/.agents/skills/apple-design/SKILL.md`. Mobilos kezelhetőség, hozzáférhetőség, hierarchia, érthető állapotok, listák és panelek. Az alkalmazandó HIG referenciákat a skill előírása szerint olvasd; a webhez fordítsd a mintákat.
2. **design-taste-frontend / tasteskill**: `C:/Users/kopa/.agents/skills/design-taste-frontend/SKILL.md`. Brandilleszkedés, tudatos vizuális döntések. Ez eredetileg landing/design skill: a stíluselveit alkalmazd, ne kényszeríts marketinghero-kompozíciót az interaktív térképre.

Ha a skill helye másik gépen eltér, keresd meg név szerint. Ne állítsd, hogy alkalmaztad, ha nem tudtad elolvasni.

A design előtt nézd meg böngészőben a helyi Home, Rólunk és Kapcsolat oldalakat desktopon és mobilméretben, és olvasd a kapcsolódó komponenseket. T3-ban először `preview_status`, szükség esetén `preview_open`; a natív preview-eszközöket használd. A meglévő oldalhoz készíts matching megjelenést, ne különálló admin dashboardot vagy generikus üveghatású appot.

Design read: világos, zöld ParkSafe márkába illeszkedő praktikus térképes felület, erős, de nyugodt vizuális hierarchiával. Meglévő Inter betű, Lucide ikonok, visszafogott mozgás. A használhatóság megelőzi a dekorációt.

## 4. Route-ok, kategóriák és scope

| URL | Aktív szűrő | HU cím/H1 irány | Tartalom |
| --- | --- | --- | --- |
| `/map` | minden támogatott típus | Bringás helyek térképe | tárolók, szervizek, javítópontok, ivókutak |
| `/bikerack` | kerékpártárolók | Kerékpártárolók térképe | kizárólag tároló típus |
| `/service` | szervizek és javítópontok | Kerékpárszervizek és javítópontok | két valós típust külön ikonnal/jelöléssel |
| `/water` | ivókutak | Ivókutak térképe | kizárólag ivókút típus |

Ezek végleges V1 útvonalak. További kategóriát csak tényleges publikus adattal vegyél fel. A belső típusnevek (`bicycleService`, `repairStation`, `drinkingFountain`, parking) nem szükségszerűen azonosak a DB-táblanevekkel: igazold a leképezést.

Kész V1: mind a négy nézet. Fejlesztési sorrendben először `/map` + `/bikerack`, ugyanazzal az architektúrával utána `/service` + `/water`.

Nem része: webes útvonaltervező, navigáció, ride-rögzítés, fizetés, prémium/offline letöltés, új auth, értékelésbeküldés, új analitika, országos helyoldal-generátor. A jelenlegi app és minden jelenlegi funkció ingyenes; ne adj hozzá jövőbeli előfizetési árat.

## 5. Térkép: MapLibre + OSM-adatok OpenFreeMapről

- A felhasználó „openstreamap” alatt OpenStreetMapet ért. OSM az alapadat; **OpenFreeMap** a választott ingyenes vektoros alaptérkép-szolgáltató; **MapLibre GL JS** a kliens.
- Használd a meglévő `maplibre-gl` csomagot közvetlenül, új React-map wrapper nélkül.
- Induló stílus: `https://tiles.openfreemap.org/styles/liberty`, amely a repóban már használt. A környező UI világos, saját ParkSafe színvilágú legyen. Másik OpenFreeMap-stílus csak akkor indokolt, ha a helyi vizuális összevetés jobb olvashatóságot mutat.
- Importáld a MapLibre CSS-t a Next.js által támogatott módon. MapLibre csak kliensen inicializálódjon, ne érje el szerveroldalon a DOM-ot.
- A böngésző közvetlenül az OpenFreeMapről kérje a stílust, tile-okat, glyph-eket és sprite-okat. Ne proxyzd ezeket a ParkSafe backendjén.
- Őrizd meg az OSM/OpenMapTiles attribúciót és a stílusban megadott kreditlinkeket, mobilpanelek se takarják el.
- Ne használd a publikus OSM raster tile-szervert tömeges adatforrásként. Ne prefetch-elj várost/országot offline módhoz. Ne kérj Overpass-adatot minden látogatáskor vagy térképmozgatáskor.
- MapLibre pont/cloud rétegek és beépített GeoJSON clustering; ne legyen egy DOM Marker minden POI-hoz. Csak a kiválasztott ponthoz lehet külön popup/panel.
- Az OpenFreeMap publikus szolgáltatása jelenleg díj és API-kulcs nélkül használható, kereskedelmi célra is; nincs SLA. Kezeld az alaptérkép hibáját, és tartsd működőképesen az olvasható helylistát.

## 6. Adatarchitektúra — statikus snapshot, minimális költség

### Elsődleges döntés

**Ne legyen látogatónkénti POI-adatbázislekérdezés.** A már létező, publikálható ParkSafe helyadatokról készíts időszakos, földrajzilag darabolt statikus exportot. Ezeket a jelenlegi site statikus tárhelye/CDN-je szolgálja ki. Nem kell új állandó szerver, Redis, fizetős API vagy látogatónként futó serverless function.

Ez a térképfunkció adatútján serverless/static megoldás; nem kell az egész Next.js appot statikus exporttá alakítani. Az admin és más meglévő API-k maradnak a jelenlegi környezetükben.

```text
Meglévő, publikálható ParkSafe POI-forrás
  -> kézi/időzített export, kezdetben legfeljebb naponta
  -> normalizált és validált HU snapshot + területi fájlok
  -> statikus tárhely / meglévő CDN
  -> böngésző: csak a látható terület fájljai

OpenFreeMap -> közvetlen böngészős alaptérkép
```

### Forrásfelderítés és publikálás

1. Keress már létező publikus POI-exportot, tile-forrást vagy mobilos publikus lekérési megoldást. Ha már kiszolgálható statikus adat létezik, azt használd.
2. Ha nincs, a meglévő adatforrásból készíts explicit mezőlistás exportot. Ne használd az admin `select('*')` mintáját publikálásra.
3. A lekérést stabil rendezéssel, lapozással és korlátozott párhuzamossággal végezd. Ne támaszkodj egyetlen korlátos DB-válaszra: a részleges export ne tűnjön teljes országos adatnak.
4. Forráslicenc, nyilvános megjeleníthetőség és elfogadott/moderált státusz ellenőrzése. Nem kell minden helyet újra személyesen felmérni; a meglévő publikus adatok jogszerűen használható részét vedd át, korlátokkal és dátummal.
5. Titkos adatot csak exportoldalon használj. Service-role/admin kulcs soha ne legyen `NEXT_PUBLIC_*`, böngészős bundle, log vagy publikus manifest része. Meglévő RLS-t és authot ne gyengíts.
6. Ne kerüljön az exportba user ID, email, reportbeküldő, moderációs jegyzet, ride-track, privát fotó vagy személyes helyadat. Csak nyilvános, elfogadott POI.
7. A koordináta-formátumot olvasd ki a tényleges forrásból. GeoJSON sorrend: `[longitude, latitude]`. Validáld a tartományt, duplikált ID-kat és a Magyarország-lefedettséget.
8. Ha nincs hozzáférhető valós forrás, készíts működő UI-t/adapterszerződést, de az adatút hiányát jelentsd. Demo pontot ne adj el éles adatként; a feature ilyenkor nem teljesen kész.

### Statikus fájlok

Javasolt hely: `public/map-data/` vagy a már meglévő, publikus statikus tárhely. Új cloud fiókot ne hozz létre automatikusan.

```text
map-data/manifest.json
map-data/<version>/cells/10/<x>/<y>.geojson
map-data/<version>/places.json
map-data/<version>/seo-samples.json
```

- `version`: exportverzió. A cellafájlok tartalom-verziózott URL-en változatlanok; a manifest mutat az aktuális verzióra.
- Manifest: schemaVersion, version, generatedAt, forrás/származás, licences/attribution, lefedettség, cellák elérhetősége és bájtmérete. Nem kell több ezer hiányzó URL-t 404-gyel próbálgatni.
- Egy cella az összes támogatott típust tartalmazza, így a kategóriaváltás kliensoldali, új adatlekérés nélkül megtörténhet.
- Induló felosztás Web Mercator z=10 cellák szerint, pontonként egy cella. Ez kezdőérték: valódi exportméret alapján módosítható, dokumentált indokkal.
- `places.json`: kis, helyi településkereső index igazolt koordinátákkal; ne legyen minden betűre geocoding API-hívás.
- `seo-samples.json`: kategóriánként kis, valódi, névvel/helyadattal rendelkező mintalista szerveroldali HTML-hez. Ez nem teljes országos adatcsomag a HTML-ben.
- Az exportot előbb ideiglenes helyen építsd és validáld; csak kész snapshot után válts manifestet. Hiba esetén maradjon az utolsó jó verzió. Az oldaltól független export ne induljon el user-request miatt.
- Régi verziók fájljai legalább 7 napig maradjanak elérhetők, hogy nyitott böngészők és cache-elt manifestek ne törjenek deploy után. Verziózott fájl 404 esetén egyszer frissítsd a manifestet és válts konzisztensen az új snapshotra; ne keverd a régi és új verzió pontjait. Ha a hosting csak egy release fájljait tartja meg, az export/publikálás ezt a megtartást is oldja meg vagy jelentse konkrét korlátként.
- Első körben dokumentált kézi frissítés elegendő. Ha a jelenlegi infrastruktúrában van ingyenes ütemező, később a meglévő publikálási folyamathoz kapcsolható. Ne állíts be új CI/CD-t bizonyítatlan hostingfeltételezéssel.

### Minimális POI-szerződés

```ts
type PublicPoi = {
  id: string; // globálisan egyedi, szükség esetén típus + forrásazonosító
  kind: 'bikerack' | 'service' | 'repair' | 'water';
  longitude: number;
  latitude: number;
  name: string | null;
  city: string | null;
  address: string | null;
  covered: boolean | null;
  access: string | null;
  website: string | null;
  phone: string | null;
  source: string | null;
  sourceUpdatedAt: string | null;
  verifiedAt: string | null;
};
```

Nem kötelező minden mezőnek léteznie a forrásban. A `null` valódi ismeretlenség. Exportideje nem azonos helyszíni ellenőrzés idejével. Nincs kitalált név, cím, nyitvatartás, üres férőhely vagy biztonsági minősítés. A tárolóhoz kapcsolt `free` mezőt ne keverd az app ingyenességével. Fotó V1-ben opcionális, csak igazoltan publikus és cache-elhető assetből.

### Kliensoldali kéréskorlátozás és cache

- Országos nyitónézet, Magyarországra illesztett térképkamera. Nem Budapest-pilot.
- z<11 szinten csak alaptérkép és „Nagyíts rá vagy válassz települést a helyek megjelenítéséhez” állapot; nincs teljes HU POI-letöltés. Ez országos lefedettségű böngésző, nem egyetlen városra korlátozott oldal.
- POI-fájlok csak z>=11 és a látható cellákhoz. Ha egyszerre 16-nál több cella kellene, kérj további nagyítást; ne küldj száz kérést és ne mutass észrevétlenül részleges találatot.
- `moveend`, legfeljebb 250–350 ms késleltetéssel. Nem `move`/animációs frame, nincs polling/realtime.
- URL-verzió + cella azonosító alapján sessioncache és közös in-flight promise. Ugyanaz a cella egy sessionben egyszer tölthető, amíg ki nem esik a korlátos cache-ből.
- Max. 3 egyidejű POI-fájlkérés; viewport-generáció alapján régi válasz ne írja felül az új nézetet. Már megkezdett hasznos kérés újrahasználható; felesleges kérés megszakítható. Abort ne jelenjen meg userhibaként.
- Bounded cache: kezdetben max. 64 cella / kb. 20 MB dekódolt célkeret; a tényleges memória mérésével állítsd be. Ne nőjön korlátlanul országos böngészés közben.
- Hiányzó cellát a manifestből ismerj fel, ne legyen végtelen újrapróbálás. Hálózati hibára legfeljebb egy automatikus retry; utána explicit „Újrapróbálás”.
- Kategóriaváltás a már letöltött cellákon **0 új POI-hívás**. A látható MapLibre forrást frissítsd a kiválasztott kategória pontjaiból; a clustering csak a kiválasztott kategóriát számolja. A rétegfilter önmagában nem szűri ki a más típusokat a cluster darabszámából.
- Egy sessionben a manifest és településindex ne töltődjön minden route-váltáskor újra.
- HTTP-cache: manifest legfeljebb 5 perc, verziózott assetek hosszú `public, max-age=31536000, immutable`. Next `public/` alapértelmezésére ne feltételezz immutable cache-t: ellenőrizd a tényleges HTTP-fejléceket, szükség esetén a map-data útvonalra szűkített beállítással. CDN/compression csak ha a hosting tényleg biztosítja; dokumentáld.
- Exportméret cél: cellánként <=250 KB tömörítve, tipikus részletes nézet <=1 MB POI-forgalom. Ezek célértékek, nem garantált mérés. Túl nagy cellánál sűrűbb statikus felosztás; ne országos, több tíz MB-os JSON-letöltés.
- Túl sok részletes pontnál (>20 000 egy nézetben) újabb nagyítás kell vagy mérés alapján statikus vektortile/PMTiles következő lépés. Ne csonkítsd csendben a találatokat. PMTiles infrastruktúrát ne építs előre, ha a HU cellaexport elég.

### Ha a statikus export tényleg nem megoldható

Először írd le a konkrét akadályt. Csak ezután alkalmazz a meglévő hostingon egy olvasási API-t fix földrajzi cellaazonosítóval, szigorú inputvalidálással, megosztott cache-sel, fix mezőkkel és felső rekordkorláttal. Tetszőleges bbox/szűrőkombináció ne kerülhesse meg a cache-t. Egy processben tárolt Map nem elég több serverless instance közös cache-ének.

Nem alapértelmezett megoldás a browserből Supabase-lekérdezés, az új Redis, az Edge Function vagy a backend proxy. Új fizetős szolgáltatás előtt külön felhasználói döntés kell. Ne állítsd, hogy a serverless önmagában olcsóbb: invocation és adatforgalom is számíthat. A preferált V1 statikus fájlokkal elkerüli ezt a POI-adatúton.

## 7. UI és működés

### Desktop

- Meglévő Header, benne egy „Térkép” link; ne duplikáld az authot/nyelvváltót.
- Rövid kategóriacím és bevezető, utána nagy, ténylegesen használható térkép.
- Bal oldali 320–360 px panel: kategórialinkek, helyi településkereső, aktuális térképterület helylistája.
- Jobbra rugalmas térkép, visszafogott zoomkontrollok, attribúció, elkülönített hibajelzés.
- Aktív pont a listában és térképen összehangolt. Clusterkattintás nagyít, pontkattintás részletet nyit.
- Lista legfeljebb 50 látható elemmel; több találatnál kliensoldali „További találatok”, nem DB-lapozás. Valós nézethez tartozó deduplikált rekordokból számolj, ne a cluster markerekből.

### Mobil

- A Header alatti tartalom ne csússzon a fix fejléc mögé.
- Kompakt kategóriasor és településkereső; képernyőszélességű térkép.
- Mobilos helylista/részletpanel egyszerű alsó panelként vagy „Térkép / Lista” váltóval. V1-ben ne írj saját gesztusfizikát. A gombos nyitás/zárás billentyűzettel is működjön.
- 44 px körüli minimális érintési célok; safe-area, böngészős címsorhoz alkalmazkodó `dvh`, nincs vízszintes kilógás.
- A panel ne takarja az attribúciót vagy összes térképkezelőt. Az oldal lefelé görgetése maradjon használható; a térkép ne ejtse csapdába a görgetést.
- Pont részlete: név vagy tényszerű típusnév, hely, tényleges mezők, adatsnapshot ideje, egyszerű hibajelzési link a meglévő Kapcsolat oldalhoz. A névtelen pont ne kapjon kitalált tulajdonnevet.

### Állapotok

- Kezdeti térkép-loading: a méretet megtartó skeleton, nem ugráló layout.
- Nagyítás szükséges; nincs találat; még nincs letöltve; adatforrás hiányzik; hálózati hiba; WebGL/alaptérkép hiba: külön, őszinte állapotok.
- Régi snapshot használható, de dátum látható. Exportdátum alapján ne ígérj élő helyadatot.
- Településkereső: helyi index, nincs automatikus címgeocoding. A mező neve „Település keresése”, ne ígérjen teljes utcacímkeresést.
- V1-ben nincs GPS-helyzetgomb: a jelenlegi globális policy tiltja, és az új permission flow nem szükséges a funkcióhoz. Később külön, csak userkattintásra, map route-ra szűkített policy-változtatással vezethető be.
- HU/EN szövegek a meglévő fordítási rendszerben. Nincs két külön nyelvi URL vagy új i18n-rendszer.
- Felhasználói szöveget React textként jeleníts meg, ne `setHTML`/dangerouslySetInnerHTML útján. Weblinkeknél csak http(s), telefonnál biztonságos `tel:`. A POI-adatot nem tekintjük megbízható HTML-nek.
- A térkép mellett a lista billentyűzettel és képernyőolvasóval is használható; jelölt aktív kategória, fókuszgyűrű, érthető kontrollnevek, reduced-motion tisztelete.

## 8. Seamless URL-váltás és kamera

- Minden útvonal valós Next route: közvetlen megnyitás/frissítés helyes HTTP 200, kategória, HTML, metadata.
- Egy közös, csak ezekhez a route-okhoz tartozó layoutban éljen a MapLibre példány és a sessioncache. A route-oldalak adják a kategóriaspecifikus szerveres tartalmat és metadata-t. A tartós layoutban levő klienskomponens `usePathname` alapján követheti a kategóriát.
- Kategóriagomb valós `<Link href="/bikerack" scroll={false}>` vagy ekvivalens bejárható link. A router-váltás frissítse az oldalcímet/canonicalt is, miközben a közös map layout nem mountolódik újra.
- Őrizd a középpontot, zoomot, cache-t. Az új kategóriával nem kompatibilis kijelölt pont záródjon; régi requestválasz nem állíthatja vissza a korábbi szűrőt.
- Ne csak `pushState`-tel írd át a pathot változatlan SSR-HTML/metadatával. Natív History API legfeljebb kameraquery módosítására indokolt; kategóriánál a tényleges route a forrás.
- Opcionális kameraquery: `?lat=...&lng=...&z=...`, `replaceState`-tel a mozgatás végén. Kategóriaváltás `push` jellegű, pan nem hoz létre száz history-bejegyzést. Back/Forward állítsa vissza a route szűrőjét és a queryben tárolt kamerát.
- Kameraparamétereknél finite numerikus parse, koordináta/zoom tartományellenőrzés; hibás értéknél országos alapnézet. Érvényes queryt a kategóriaváltó link továbbvihet.
- Ne legyen külön indexelhető URL minden koordinátához, ponthoz vagy filterkombinációhoz. Canonical mindig a négy kategória egyikének query nélküli URL-je.
- `Map.remove()` és event/listener/ResizeObserver cleanup a térképcsalád elhagyásakor; kategóriaváltáskor ne szűnjön meg a map. StrictMode se duplázza a kéréseket vagy WebGL-contextet.

## 9. SEO — valódi tartalom, négy fix oldal

- Négy saját title, description, H1 és self-canonical, a `publicPageMetadata` használatával.
- Kategóriánként rövid, külön hasznos magyarázat: milyen pontokat látsz, milyen információ áll rendelkezésre, hogyan kereshetsz. Ne ugyanaz a szöveg legyen más kulcsszóval.
- A szerveres HTML-ben legyen cím, leírás, kategórialink, forrás/dátum és kategóriánként néhány tényleges, publikálható hely. A statikus mintalistát jelöld példaként; ne mutasd az aktuális viewport teljes találataként.
- A kliensoldali viewportlista külön feliratot kapjon („Helyek a megjelenített területen”), így nem keveredik az országos mintákkal. Mindkettő ugyanabból a snapshotból származzon.
- SEO-érdemi helyadat ne csak WebGL canvasban létezzen. Nincs rejtett kulcsszólista vagy kitalált helytartalom.
- Csak a négy fix route kerüljön sitemapbe és bejárható navigációba. Kameraqueryk nem. Sitemap és robots tényleges összevetése, noindex ne kerüljön véletlenül a négy oldalra.
- `scripts/check-seo.mjs`: a publikus pathlista az öt meglévő + négy új route; a meglévő auth/private ellenőrzések megmaradnak. Ne indíts új SEO-checker keretrendszert.
- App/store CTA a meglévő valós URL-ekkel. Ne ígérj garantált szabad férőhelyet, őrzést, biztonságot, működő ivókutat vagy nyitvatartást igazolt adat nélkül.
- Ne generálj automatikusan város x típus x útvonal oldalakat. A Google-megjelenés és indexing nincs garantálva; Search Console hiánya nem akadálya a helyi fejlesztésnek.

## 10. Megvalósítási sorrend és várható fájlok

1. Ellenőrizd a worktree-t, graphify meglétét, a jelenlegi app/pub POI-forrást és hostingot. Olvasd a design skilleket, nézd meg a helyi meglévő oldalakat.
2. Rögzíts egyetlen döntést: már létező statikus forrás újrahasználata vagy kis HU snapshot-export. Igazold mezők, licenc, adatméret és nyilvános státusz; titkos értéket ne írj ki.
3. Ha szükséges: exportáló script, manifest és cellaadatok; legyen egy kis determinisztikus ellenőrzése a hibás koordinátára, duplikált ID-ra és cellabesorolásra.
4. Közös tartós map layout + kliensmap; `/map` és `/bikerack`, helylista és pontpanel, kamera/cache megőrzése.
5. `/service` és `/water`; HU/EN, településkereső, teljes mobil/desktop design.
6. Metadata, bejárható linkek, SSR minták, sitemap és meglévő SEO-check frissítése.
7. Build, célzott lint, rövid működési és requestszám-ellenőrzés; eredményjelentés.

Lehetséges minimális szerkezet, a meglévő mintákhoz igazítva:

```text
src/app/(main)/(map)/layout.tsx
src/app/(main)/(map)/map/page.tsx
src/app/(main)/(map)/bikerack/page.tsx
src/app/(main)/(map)/service/page.tsx
src/app/(main)/(map)/water/page.tsx
src/components/map/MapExperience.tsx
src/lib/map-data.ts
scripts/export-map-data.mjs             # csak ha nincs meglévő export
public/map-data/...
```

A négy page vékony route-specifikus wrapper, nem négy térképkód. Kisebb UI-részeket csak indokolt olvashatóság miatt bonts külön. Nem kötelező új globális provider, repository layer, cache-framework vagy state library. Hostingheader változtatás csak a statikus map-data kiszolgáláshoz, ha ténylegesen szükséges. Privát/admin kódhoz ne nyúlj.

## 11. Ellenőrzés és elfogadás

Ezek fejlesztői ellenőrzések, nem résztvevős kutatás. Egy rövid, újrafuttatható adat/cache-check elég az új nem triviális logikára; a SEO-hoz a meglévő scriptet bővítsd.

- `npm run build` és célzott ESLint sikeres. A build vége előtt ne indíts új production szervert a félig elkészült `.next` tartalomból.
- Mind a négy URL közvetlenül nyitható, frissíthető; kategória helyes, HTTP 200, saját SSR title/description/canonical/H1.
- `/map` -> `/bikerack` -> `/service` -> `/water`, majd Back/Forward: kamera megmarad, nincs mapvillanás/remount, metadata változik.
- Kategóriaváltás betöltött területen 0 új POI-request; nyitott map instance 1. A szokásos Next HTML/RSC/route lekérés nem POI-backend hívás.
- Kis pan ugyanazon cellákon 0 új POI-request; új területhez csak hiányzó cellák töltődnek. Max. 3 in-flight, azonos cella nem duplázódik. Országos kezdőnézet nem tölti le az összes POI-t.
- App-backendhez a látogató POI-felderítése 0 élő DB/API-hívást indít a preferált statikus változatban. A meglévő AuthProvider vagy CO2-stats külön kéréseit ne nevezd tévesen a map POI-költségének.
- Statikus HTTP-cache-fejlécek és tömörítés ténylegesen ellenőrizve; ha hosting/CDN nem igazolható, ezt a jelentésben korlátként add meg.
- Valódi adatpéldák mindhárom kategóriában, deduplikált lista, helyes koordináták és típusszűrés. Más típusok nem számítódnak bele a kategóriaclusterbe.
- Hálózathiba, hiányzó cella, üres terület, z<11, blokkolt tiles/WebGL kipróbálva. Nem marad végtelen loader, az attribúció látható.
- 390x844 és 1440x900 helyi böngésző-ellenőrzés; 320 px szélességen legalább overflow és kontroll-elérhetőség. Mobil HU/EN, panel, keresés, lista, billentyűzet és reduced-motion.
- Nincs titkos adat a publikus exportban vagy bundle-ben. Nincs admin/service-role kulcs, privát riport vagy useradat.
- Mért snapshotméret, nézetenkénti POI-bájt/requestszám és frissítési út szerepel a jelentésben. Nem kell teljesítménymérő infrastruktúra.
- A végeredmény vizuálisan a meglévő ParkSafe site része, nem demo. Mutass egy desktop és egy mobil screenshotot.

## 12. Költség, frissesség, korlátok

Térkép-API díj: a választott OpenFreeMap publikus szolgáltatás jelenleg ingyenes. POI runtime compute/DB: preferált megoldásban nincs. A statikus fájlok tárhelye és adatforgalma a tényleges hostingcsomagtól függ; az egész üzemeltetés korlátlan ingyenességét nem ígérjük.

Trade-off: naponta vagy kézzel frissülő adat, nem élő availability. Írd ki a snapshot dátumát. „Ismeretlen” adat marad ismeretlen. Nem cél új nagy infra felépítése, csak a jelenlegi országos adatok olcsó, biztonságos webes megjelenítése.

A régi PARKS-264/290/291/292/293 szerkesztett Budapest-pilot briefje helyett ez a felhasználó által elfogadott új termékirány. Jira-leírást/státuszt, commitot, push-t és deploymentet ez a handoff nem engedélyez automatikusan; a megvalósítást helyben készítsd és add vissza reviewra. PARKS-269 már törölve; ne hozd vissza és ne szervezz userkutatást.

## 13. Elsődleges technikai források

Ellenőrizve a terv készítésekor; az implementáló a telepített verzióhoz igazítsa az API-használatot.

- [OpenFreeMap — díj, API-kulcs, commercial use, SLA, attribution](https://openfreemap.org/).
- [OpenFreeMap Quick Start — MapLibre stílus és integráció](https://openfreemap.org/quick_start/). A Vite-specifikus worker példát ne másold vakon Next.js-be.
- [MapLibre — clustering](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/).
- [MapLibre — nagy GeoJSON-adatok kezelése](https://maplibre.org/maplibre-gl-js/docs/guides/large-data/).
- [Next.js — linking and navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating).
- [Google — JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- [Google — bejárható linkek](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).
- [Google — szűrt URL-ek kezelése](https://developers.google.com/crawling/docs/faceted-navigation).
- [OSM — raster tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
