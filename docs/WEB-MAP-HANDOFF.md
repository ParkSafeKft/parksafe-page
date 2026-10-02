# ParkSafe webes térkép — handoff prompt

Másold az alábbi promptot az implementáló agentnek. A `docs/WEB-MAP-PLAN.md` fájlt is add át neki / legyen ugyanabban a repóban.

---

A ParkSafe jelenlegi Next.js weboldalán készíts publikus, bejelentkezés nélkül használható országos térképet a **docs/WEB-MAP-PLAN.md** specifikáció szerint. A tervet olvasd végig, mielőtt kódolsz. Az ott megadott elfogadási feltételek a feladat részei.

Workspace: `C:/Users/kopa/Desktop/DEV/PARKSAFE/parksafe-page`. Más gépen a projekt megfelelő gyökerét használd.

## Kontextus

- Az app már egész Magyarországon él. Nem indulási pilotot építünk.
- Ne szervezz piackutatást, random emberes tesztet, új A/B tesztet vagy személyes országos helyszínbejárást.
- A felhasználó igényes, a meglévő webhez illő, ingyenes / alacsony API-költségű megoldást kér.
- A korábbi szerkesztett Budapest-pilot oldalak helyett a jelenlegi irány egy közös térképfelület kategória-URL-ekkel. PARKS-269 törölve; ne állítsd vissza.
- Az app és minden jelenlegi funkció ingyenes. A támogatás önkéntes Buy Me a Coffee. Havi előfizetés és offline térkép/POI-letöltés csak későbbi terv, nincs végleges ár. Ezt ne módosítsd.

## Kötelező előkészítés

1. Olvasd az AGENTS.md utasításait, nézd meg a git státuszt. Mások munkáját ne írd felül. Ha van `graphify-out/`, először query/architektúra; a végén frissítsd, ha kódot módosítottál.
2. **Használd az apple-design skillt**: `C:/Users/kopa/.agents/skills/apple-design/SKILL.md`, a releváns HIG referenciáival.
3. **Használd a design-taste-frontend / tasteskill skillt**: `C:/Users/kopa/.agents/skills/design-taste-frontend/SKILL.md`; a brandilleszkedési elveit alkalmazd ehhez az interaktív felülethez. Ha eltér az elérési út, keresd meg a skilleket.
4. Nézd meg a helyi Home, Rólunk és Kapcsolat oldalakat desktopon és mobilon. T3-ban a preview-eszközöket használd, először `preview_status`, szükség esetén `preview_open`. A vizuális nyelvet és a Header/Footer mintát illeszd, ne tervezz különálló admin dashboardot.
5. Olvasd a tervben megjelölt repo-fájlokat. `maplibre-gl` már telepítve; az admin InteractiveRouteMap már OpenFreeMap Liberty-t használ. Publikus POI-forrást és tényleges hostingot ellenőrizz, ne találj ki API-t vagy táblát. Ha Supabase-adatforrást érintesz, alkalmazd az elérhető Supabase skillt is.

## Mit építs

- Négy valós route: `/map`, `/bikerack`, `/service`, `/water`.
- Ugyanaz a tartós MapLibre példány, route-specifikus szűrők. `/service` valós szervizek + javítópontok, egymástól megkülönböztetve.
- Client-side route-váltás, megmaradó kamera/cache, helyes Back/Forward, közvetlen link és refresh. Minden route saját szerveres tartalommal és metadata-val; ne csak a címsort írd át.
- Magyarország nyitónézet, helyi településkereső, zoom, kategóriák, clustering, helylista és pont-részletpanel.
- Közvetlen OpenFreeMap alaptérkép: `https://tiles.openfreemap.org/styles/liberty`. Nincs API-kulcs, fizetős térképszolgáltató vagy tile-proxy a saját backendünkön. OSM/OpenMapTiles attribúció megmarad.
- Világos ParkSafe törtfehér/zöld design, sötét szöveg, meglévő Inter/Lucide, mobilra illő lista/panel. HU/EN, hozzáférhetőség és reduced-motion.

## Adat és költség — fontos

Elsőként már létező, biztonságosan publikus statikus adatot használj. Ha nincs, a publikus ParkSafe POI-kból készíts **statikus, földrajzilag darabolt HU snapshotot**, manifesttel és verziózott fájlokkal, a jelenlegi tárhely/CDN kiszolgálásával. Export kézzel/időszakosan, nem látogatónként. Így a látogató térképmozgatása nem kérdezi az élő app-adatbázist, és nem kell új állandó szerver vagy requestenkénti serverless function.

Csak látható terület, kezdetben z>=11, `moveend` debounce, max. 3 in-flight POI-kérés, cellánként deduplikáció, korlátos sessioncache, hosszú HTTP-cache a verziózott fájlokra. Kategóriaváltás betöltött területen 0 új POI-request. Cluster pontszám csak az aktív típusokból. Országos JSON-egyben letöltés, polling, realtime, Overpass/geocoding minden panra vagy billentyűre tilos. A részletes limiteket a terv tartalmazza.

Az exportból zárj ki minden privát/user/admin adatot. Explicit mezőlista, validált koordináták, moderált/publikálható rekordok, licenc és forrás. Titkos kulcs nem kerülhet kliensbe vagy publikus exportba. A forrásban hiányzó mező ismeretlen marad; ne találj ki helyet, ellenőrzési dátumot, nyitvatartást, kapacitást vagy biztonságot. Valós adat hiányánál a UI-t készítsd el, de a hiányt jelentsd, ne mondd késznek az adatintegrációt.

Ha a statikus út bizonyíthatóan nem megoldható, előbb írd le az akadályt és a legkisebb működő alternatívát. Ne hozz létre önkényesen fizetős szolgáltatást vagy új cloud fiókot. A hosting adatforgalma nem garantáltan ingyenes; mérj és dokumentálj, ne ígérj korlátlan nulla költséget.

## SEO és scope

Új route-onként saját title/description/H1/self-canonical, rövid külön magyarázat és valódi helyadatokat tartalmazó szerveres mintalista. Használd a meglévő `publicPageMetadata` helper-t. Csak a négy fix route kerüljön sitemapbe, kameraqueryk canonicalja query nélküli. Bővítsd a meglévő `scripts/check-seo.mjs` publikus pathlistáját is; a régi SEO/auth ellenőrzések maradjanak.

Nem része útvonaltervező, navigáció, offline térkép, fizetés, új auth, új analytics vagy automatikus város/útvonal SEO-oldalgenerálás. V1-ben GPS-gomb sincs: a jelenlegi globális Permissions-Policy tiltja; nem módosítjuk szükségtelenül.

## Megvalósítás és ellenőrzés

Haladj a terv sorrendjében. Először adatút + `/map` és `/bikerack`, utána `/service` és `/water`. A végleges V1 mind a négy route. A meglévő komponenseket és telepített csomagokat használd; ne építs új frameworköt vagy kitalált absztrakciót.

Futtass buildet, célzott lintet, a bővített SEO-checket és egy minimális determinisztikus adat/cache-checket az új nem triviális logikára. Ellenőrizd a valós requestszámokat, kategóriaváltást, pan-cache-t, direkt URL-eket, Back/Forward-ot, hibákat, titkosadat-mentességet. Mobil 390x844 és desktop 1440x900, HU/EN; 320 px-en ne legyen overflow. Ez fejlesztői smoke check, nem userkutatás.

Csak helyi implementációt készíts. Ne commitolj, pusholj, deployolj vagy módosíts Jira-t automatikusan. Ne nyúlj más ticketekhez, meglévő admin- és authfunkcióhoz. A szükséges rutin technikai döntéseket hozd meg, ne állj meg minden CSS-részletnél jóváhagyásért.

## Mit adj vissza

Rövid átadás: elkészült route-ok, választott POI-forrás/adatút, snapshot frissítési parancs és dátum, mért fájlméret/requestszám, lefutott ellenőrzések, desktop és mobil screenshot, fennmaradó konkrét akadályok. A felhasználó visszahozza az eredményt reviewra. Nincs élesítési vagy Google-indexelési készrejelentés pusztán a helyi build alapján.
