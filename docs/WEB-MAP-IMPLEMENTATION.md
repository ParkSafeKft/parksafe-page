# Helyi webes térkép átadás — 2026-10-02

## Aktuális változat: közép-európai keresés és mobiljavítások

A felhasználó kibővítette a korábbi HU scope-ot. Az új statikus snapshot a **8–25° hosszúság, 45–55° szélesség** közép-európai térség publikus adatbázisrekordjait tartalmazza; ez földrajzi régió, nem minden érintett ország teljes lefedettségének ígérete. Magyarország maradt a nyitónézet. Bécs/Wien/Vienna, Prága/Praha/Prague, Pozsony/Bratislava és más régiós városok kereshetők. A 38 984 helyet tartalmazó GeoNames-index névvariánsokat és országkódokat is tartalmaz; a magyar kis települések korábbi indexe megmaradt. A külföldi index forrása a [GeoNames cities500](https://download.geonames.org/export/dump/readme.txt), CC BY 4.0.

Új snapshot: **365 306 POI** (272 634 tároló, 12 244 szerviz, 7053 javítópont, 73 375 ivókút), verzió `2026-10-02-babb4ba7ba73`, időpont `2026-10-02T14:13:27.946Z`. A lekérés előtt és után a read-only MCP-számlálás egyezett. A táblák és a publikálhatósági szűrők az alábbi HU-átadásban leírtakkal azonosak; kizárólag SELECT történt.

A sűrűbb adatok miatt az export z=13 cellákra váltott: 36 467 fájl, összesen 152 505 700 nyers / 28 552 228 gzip bájt; legnagyobb cella 99 667 gzip bájt. Városkiválasztás a cellafelosztáshoz igazodó nagyítást használ. A teljes POI-állomány továbbra sem töltődik le a látogatónál. Manifest: 1 555 904 nyers / 301 425 gzip bájt; keresőindex: 6 089 863 nyers / 1 521 596 gzip bájt. A nagyobb régiós index egyszer töltődik, kategóriaváltás nem kérdez geocoding szolgáltatást.

Frissítési input: `C:/Users/kopa/AppData/Local/Temp/parksafe-ce-map-export`. A `cities500.txt` a kézzel letöltött GeoNames ZIP-ből származik. Friss MCP-adatgyűjtés után:

```powershell
node scripts/export-map-places.mjs C:/Users/kopa/AppData/Local/Temp/parksafe-ce-map-export/cities500.txt C:/Users/kopa/AppData/Local/Temp/parksafe-ce-map-export/places.json
node scripts/export-map-data.mjs C:/Users/kopa/AppData/Local/Temp/parksafe-ce-map-export
node scripts/check-map-data.mjs
```

A friss `export-info.json` `countryCode: "CE"` és `coverageBounds` mezői a régiós határokat rögzítik. Az exportáló továbbra is kizárólag helyi inputot alakít át; az MCP-lekérést külön kell elvégezni. A régi HU-verzió is megmaradt.

Az app négy, a felhasználó által megadott PNG-ikonja változtatás nélkül került a `public/branding/icons/` mappába; kategóriák, helylista és térkép használják. Az utólag megadott ivókútikon is bekerült; a különböző képfelbontások azonos megjelenítési méretet kapnak. Kisebb feliratok, listaelemek, appikonok és clusterek; mobilon rejtett jelmagyarázat; 44 px-es gombfelületek és 16 px-es keresőinput.

A részletpanel rögzíti, honnan nyitották: markerből bezárva ugyanarra a térképre és lapgörgetésre tér vissza; listából bezárva a lista és a lap görgetési pozíciója megmarad. X és Escape közös bezárást használ. A mobil listán az örökölt flex megakadályozta a magasságkorlátot; `flex:none` javítja a saját görgetést. A listából kiválasztott pont nem mozgatja fölöslegesen a kamerát. Valós mobilkattintással ellenőrizve: marker 380→380 px lapgörgetés; lista 500→500 px belső görgetés, 380→380 px lapgörgetés.

A régiós snapshot determinisztikus ellenőrzése mind a 365 306 pontot validálta; a Bécs és Prága névvariánsai és a valódi bécsi cellaadatok is ellenőrizve. Build, célzott ESLint, TypeScript és a kibővített SEO-check sikeres. Friss production smoke: Bécs mobilnézetében 1 POI-kérés, 97 157 gzip bájt; `/water` → `/service` váltáskor 0 új POI-kérés és ugyanaz a canvas. 320 px / EN és 390 px / HU: nincs horizontális overflow; a jelmagyarázat mobilon rejtett, desktopon megmaradt. Élesítés és adatbázis-módosítás nem történt.

Aktuális képek:

![Mobil, ivókutak Bécsben](C:/Users/kopa/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mur29m03-46d12e7a.png)

![Desktop, szervizek](C:/Users/kopa/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mur2abm6-5259455b.png)

Az alábbi rész a korábbi, csak HU-ra vonatkozó átadás történeti adatait tartalmazza; az aktuális méreteket és lefedettséget a fenti bekezdések adják meg.

A `/map`, `/bikerack`, `/service`, `/water` route-ok elkészültek. Közös, tartós MapLibre-példány, OpenFreeMap Liberty, helyi településkereső, kategóriaszűrés, clustering, lista és részletek, HU/EN. A felhasználó későbbi kérése alapján a teljes „Példák az országos snapshotból” blokk és a látható koordináták eltávolítva; a terv szerveres mintalista követelményét ez a kérés felülírja.

## Valós adatút

Kizárólag a `parksafe-self` MCP-n futó SELECT lekérdezések történtek. Az adatbázis nem változott. Forrás: `public."parkingSpots"`, `public."bicycleService"`, `public."repairStation"`, `public."drinkingFountain"`. Mind a négy tábla RLS-védett, publikus SELECT-hozzáféréssel; `available = true`, `osm_deleted IS NOT TRUE`, `osm_id IS NOT NULL` rekordok kerültek az exportba. Nincs külön moderációs státusz ezekben a táblákban; az elérhető publikus rekord nem helyszíni ellenőrzés igazolása. Függő javaslatok, user- és adminadatok nem kerültek az exportba.

Az ország befoglaló téglalapját tényleges HU-határpolygon szűrés követi. Végleges snapshot: **23 545 POI** — 8012 tároló, 571 szerviz, 5 javítópont, 14 957 ivókút. A régi ivókútimportok hiányzó OSM-elemtípusa ismeretlen maradt. Cím, ellenőrzési dátum és más hiányzó adat nincs kitalálva.

Verzió: `2026-10-02-0be988cd6200`; export időpontja: `2026-10-02T13:39:47.665Z`. Publikus fájlok: `public/map-data/`. A böngésző kizárólag statikus fájlokat olvas, térképmozgatáskor nem kapcsolódik Supabase-hez.

- POI: [OpenStreetMap, ODbL 1.0](https://www.openstreetmap.org/copyright).
- 9970 település/lakott hely: [GeoNames HU.zip](https://download.geonames.org/export/dump/HU.zip), [CC BY 4.0](https://www.geonames.org/about.html).
- HU-határ: [geoBoundaries HUN ADM0](https://www.geoboundaries.org/api/current/gbOpen/HUN/ADM0/), HUN-ADM0-27208725, CC0 1.0; a helyi másolat `scripts/map-hu-boundary.geojson`.

## Frissítés

Node 22+ szükséges. A jelenlegi, teljes MCP-export helyi könyvtára:
`C:/Users/kopa/AppData/Local/Temp/parksafe-web-map-export`.

```powershell
node scripts/export-map-data.mjs C:/Users/kopa/AppData/Local/Temp/parksafe-web-map-export
node scripts/check-map-data.mjs
```

Ez a parancs a helyi exportból épít snapshotot; új adatbázisadatot nem kér le. Frissítés előtt a read-only MCP-n újra le kell kérni mind a négy tábla teljes, szűrt rekordhalmazát stabil `id` szerinti keyset lapozással. A kis, 30 rekordos válaszok elkerülik az MCP nagy válaszainál tapasztalt 502 hibát. Az input fájlformátum `<kind>-<sorszám>.json` rekordtömb, `places.json`, és `export-info.json` (`complete`, `generatedAt`, `source`, `license`, `attribution`, típusonkénti `counts`). Az exportáló explicit mezőlistára szűr, koordinátát és teljességet ellenőriz; a számlálást a lekérés végén újra ellenőrizni kell. Titkos kulcs és közvetlen DB-kapcsolat nem szükséges az exportálóhoz.

Az új verziófájlok a manifest cseréje előtt készülnek el; a régi verziókat az exportáló megtartja. Következő kiadáskor a régi fájlokat is meg kell tartani a tervben előírt időszakra. Friss export után új build kell a szerveres dátum frissítéséhez.

## Mérés és ellenőrzés

164 földrajzi cella, z=10. Összes POI-fájl: 9 922 827 nyers bájt, 1 174 106 gzip bájt. Legnagyobb cella: 168 939 gzip bájt. Településindex: 769 647 nyers bájt; a helyi böngészőben 140 544 átvitt tömörített bájt.

Desktop nyitónézet: 0 POI-kérés; manifest és településindex betöltődik. Budapest kiválasztása: 4 cellakérés, legfeljebb 3 egyidejű kérés; összesen 293 340 gzip bájt. Kategóriaváltás betöltött területen: 0 új POI-kérés, azonos canvas. Back visszaállította a route-ot és annak címét. Kis billentyűzetes pan a betöltött területen: 0 új POI-kérés. Mobil átméretezés és HU/EN-váltás: 0 új cellakérés ebben a nézetben.

Sikeres: production build, célzott ESLint, TypeScript, kibővített SEO-check (9 publikus route és meglévő privát/auth ellenőrzések), determinisztikus adat/cache-check (valós snapshot teljessége, koordináták, HU-határ, deduplikáció, háromkéréses korlát, cache-határok, hibák). A példablokk hiányát mind a négy route szerveres HTML-jében ellenőrzi a SEO-check. Desktop 1440×900, mobil 390×844 és 320 px szélesség: nincs horizontális overflow; HU/EN megvizsgálva.

Képek a T3 helyi browser-artifacts könyvtárában:
- Desktop: `browser-screenshot-localhost-mur0zdy5-d95b2636.png`
- Mobil: `browser-screenshot-localhost-mur0zloi-5d12eadf.png`

## Konkrét fennmaradó ellenőrzések

Az élő hosting Cloudflare előtt/ mögött Vercel-válaszazonosítót küld; az új fájlok éles CDN-tömörítése, megőrzése és a csomag adatforgalmi ára nincs ellenőrizve. Helyben a manifest 300 másodperces, a verziózott fájlok egyéves immutable HTTP-cache-t kapnak. Korlátlan ingyenes tárhelyforgalom nincs ígérve.

## Átadás előtti ellenőrzés — 2026-10-02

Az elfogadott térképes V1 helyben ellenőrizve, review-ra kész. A navbar korábbi fix színezése javítva: pontosan az aktuális menüpont aktív, mind a négy térképes route a Térkép menüpontot jelöli. Ezt a meglévő SEO-check is ellenőrzi mind a kilenc publikus route-on.

- `npm run build`, `npm run lint`, `node scripts/check-map-data.mjs`, `node scripts/check-seo.mjs http://localhost:3002`: sikeres.
- Production böngészős ellenőrzés: mind a négy route közvetlen betöltése; településkeresés (Budapest, Bécs); kategóriaváltás; clustering nagyítása; helyrészletek és Escape; Back/Forward; HU/EN.
- Desktop 1440×900, mobil 390×844 és 320×700: nincs horizontális overflow.
- Budapest desktop nézet: 6 cellakérés, 104 602 tömörített adatbájt; kategóriaváltáskor 0 új cellakérés, azonos canvas. A helyi böngésző HTTP-cache találatai miatt a `transferSize` 0; ez nem nulla fájlméretet jelent.
- WebGL szándékos letiltása mellett a településkereső és a helylista működött. Cellakérések szándékos hálózati hibájánál érthető hibaállapot jelent meg; visszakapcsolás és Újrapróbálás után Bécs helyadatai betöltődtek. A hibainjektálás kizárólag a helyi böngészőben történt.

A végleges specifikáció a felhasználó későbbi kéréseivel együtt értendő: közép-európai lefedettség; nincs szerveres példalista és látható koordináta. Kamera-query-paraméterek megosztása nem készült; az URL a kategóriát osztja meg, a kamera a közös térképen váltáskor megmarad.

Jira megfeleltetés az elfogadott új scope szerint: PARKS-203 főfeladat; PARKS-264 specifikáció és adatforrás/licenc; PARKS-290 közös térképes felület és adatbetöltés; PARKS-291 `/map` és `/water`; PARKS-292 `/bikerack`; PARKS-293 `/service`. A korábbi budapesti pilot/útvonalhub terv történeti háttér, a felhasználó által jóváhagyott térképes megoldás felülírja. Search Console, pilotinterjú és mobilos útvonalaudit nem előfeltétele ennek a V1-nek.

Éles deploy és éles CDN/csomagköltség ellenőrzés nem része ennek a helyi készrejelentésnek; a fent jelzett hostingkorlátok továbbra is fennállnak.
