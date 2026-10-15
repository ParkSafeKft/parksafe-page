# PARKS-144: aktiválás és visszatérés

Megvalósítva és ellenőrizve: 2026-10-15. Ticket: https://perjesi-szabolcs.atlassian.net/browse/PARKS-144

A meglévő `/admin` dashboard az utolsó 30 naptári nap regisztrációs időszakával indul. A felhasználó kérésére a dátummezőket három gomb váltotta: **30 day / 90 day / all time**. Az all time kezdete a legrégebbi meglévő profil regisztrációs napja, nincs önkényes történelmi dátumhatár. Mindkét nap beleértve, Budapest éjféltől a záró napot követő éjfélig (felső határ kizárva). A lekérés egyetlen adatbázis-pillanatképet és adatlezárási időpontot használ, amely a felületen látható. Időszakváltás vagy a kijelölt időszak újrakattintása új adatlezárást készít.

## A képernyőkép számainak ellenőrzése

A 2025-09-16–2026-10-15 cohortot a képernyőképen szereplő 2026-10-15 02:14:39 Europe/Budapest adatlezárással újraszámoltuk a parksafe-self MCP-n. 2278 regisztráló = 310 legalább egyszer tekerő + 1968 még nem tekerő. A 310 első tekerőből 189 a regisztráció utáni első 7 napban, 121 később kezdett. A 2273 aktiválási nevező a legalább 7 napja regisztráltak száma. A 307 visszatérési nevező a legalább 7 napja először tekerők száma; közülük 111 tért vissza. A másik 3 első tekerő megfigyelési hete még nem telt le. A 310 fős minta mediánja 4,49715756 nap, kerekítve 4,5 nap. A medián nem átlag.

A korábbi feliratok félreérthetően egymás mellé tették ezeket a különböző csoportokat. A felhasználóval egyeztetett végső főnézet rövid címeket, időablakot, értéket és számláló/nevezőt mutat. A medián mintanagysága és az összes első tekerő száma is látható. A hosszú magyarázó blokkot kérésre teljesen eltávolítottuk. A számítási definíciók és a telepített SQL-függvény nem változtak. Az API új `period=30|90|all` paramétert fogad, a korábbi `from/to` lekérdezések továbbra is működnek. Váltás közben az előző értékek és a hozzájuk tartozó dátumok megmaradnak, Frissítés jelzéssel; az új válasz atomikusan váltja őket. Részletes UI-ellenőrzés: `ADMIN-DASHBOARD-DESIGN.md`.

A gombos változat ellenőrzése: az 5 dedikált Node teszt, a célzott lint, TypeScript és a production build sikeres. A 30 és 90 nap budapesti naptári napokat számol (a mai napot beleértve); all time a valódi legelső regisztrációnál kezd. Bejelentkezett admin böngészőben mindhárom gomb ellenőrizve: 30 day = 37 regisztráló/5 első tekerő; 90 day = 117/18; all time = 2279/311. Az all time 2025-07-23-nál indul, ezért a képernyőkép 2025-09-16-tól választott csoportjánál egy régebbi regisztrálót és első tekerőt is tartalmaz. 390 px szélességnél a gombok és a mutatók nem okoznak vízszintes túlcsordulást.

## Adatok és szabályok

- Regisztráció: `public.profiles.created_at`. A fióknak léteznie kell az `auth.users` táblában, nem lehet anonim és nem lehet törölt (`deleted_at`). A jelenlegi adatbázisban nincs orphan/anonim/törölt profil, de a lekérdezés ezeket is kezeli.
- Érvényes mentés: `ride_summaries.distance_meters > 0` és `duration_seconds > 0`; ismert `started_at`, amely nem előzi meg a regisztrációt és nem későbbi az adatlezárásnál. A mentés `created_at` értéke sem lehet későbbi az adatlezárásnál. A mozgásidő helyett a teljes rögzített időtartam a közös érvényességi feltétel.
- Deduplikáció: felhasználó és nem üres, szélső whitespace-től megtisztított `client_ride_id` szerint. A legkorábbi érvényes kezdés marad meg; azonosság esetén `created_at`, majd rekordazonosító dönti el a sorrendet. Hiányzó/üres kliensazonosítónál a ride saját UUID-je a kulcs, a külön régi ride-ok megmaradnak. Azonos kliensazonosító két külön felhasználónál két külön ride.
- Teszt/import kizárás: `kind` értékei `test`, `import`, `imported`, `seed`, `demo`, `synthetic`; illetve ilyen szavakkal és `:`, `_`, `-` elválasztóval induló kliensazonosítók. A fiók kizárható az admin által karbantartott `auth.users.raw_app_meta_data.analytics_exclude = true` jelöléssel. Nem használunk név/e-mail alapú találgatást vagy kliens által módosítható user_metadata-t. A megfigyelt ride-kind értékek `normal`, `approach`, `replay`: mindhárom valódi ride-kategóriát megtartjuk.
- Korlát: jelenleg nincs meglévő teszt/import jelölőmező vagy átadott kizárandó azonosítólista, az app_metadata-ban sincs analytics_exclude jelölés. Jelöletlen teszt/import rekordot nem tudunk megbízhatóan felismerni. A részletes szabályok ebben a dokumentumban maradnak; a felületi magyarázatokat a felhasználó kérésére eltávolítottuk. Új jelölést vagy fiókmódosítást nem végeztünk.
- A 7 nap pontosan 168 eltelt óra, a felső határ beleértve. A regisztrációs nap és a visszatérés naptári napjai `Europe/Budapest` időzónában értendők. Az óraátállítás nem változtatja 167/169 órára a megfigyelési időt.

## Mutatók

1. **Első tekerés 7 napon belül.** Nevező: az adatlezárásig legalább 168 órája regisztrált cohort-tagok. Számláló: közülük azok, akiknek az első érvényes ride-kezdése legfeljebb 168 órával a regisztráció után történt.
2. **Újabb bringázós nap 7 napon belül.** Nevező: azok, akiknek az első érvényes tekerése legalább 168 órával az adatlezárás előtt kezdődött, akkor is, ha a regisztrációtól több mint 7 nap telt el. Számláló: közülük az első kezdést követő 168 órán belül egy későbbi budapesti naptári napon új érvényes tekerést kezdők.
3. **Első tekerésig eltelt medián.** A regisztráció és az első érvényes kezdés közti másodpercek `percentile_cont(0.5)` értéke. Minden adatlezárásig első ride-ig eljutó cohort-tag része a mintának, a későn aktiválódók és a még nem teljesen megfigyelhető friss regisztrálók is. A sosem tekerők kimaradnak. A felület perc/óra/nap értéket és mintanagyságot mutat.

Mindkét százalék számlálója és nevezője látható. Nulla nevezőnél `percent = null`, nulla mediánmintánál `median_seconds = null`: a felületen „Nincs adat”. Valódi 0% lehetséges nem üres nevező esetén.

## Backend és hozzáférés

A `20261015000729_admin_activation_metrics.sql` migráció a parksafe-self MCP `apply_migration` eszközével alkalmazva. Csak egy új aggregáló függvény és annak jogosultságai változtak; fiókok és ride-rekordok nem. A függvény olvasó, nem ír audit- vagy eseményrekordokat.

A `/api/admin-activation-metrics?from=YYYY-MM-DD&to=YYYY-MM-DD` végpont a meglévő Supabase Bearer sessionnel azonosít, majd ellenőrzi a profil admin szerepét. A függvényben ettől függetlenül ismét ellenőrizzük az `auth.uid()` admin szerepét. `PUBLIC` és `anon` végrehajtási joga visszavonva; csak `authenticated` hívhatja, a normál felhasználót a függvény elutasítja. Nincs service role kulcs a kliensben vagy ebben a végpontban. Válasz: kizárólag aggregátumok, `Cache-Control: private, no-store`.

Az auth.users olvasása miatt a függvény `SECURITY DEFINER`, üres search_path-tal és teljesen minősített táblanevekkel. A Supabase advisor az authenticated szerep számára hívható definer függvényt [0029 figyelmeztetésként](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) jelzi. Ez tudatos, admin szerepellenőrzéssel védett RPC-hozzáférés; a közvetlen nem admin hívás elutasítását külön ellenőriztük. Az adatbázis más, korábbi advisor találatai nem ennek a ticketnek a részei.

## Ellenőrzések

- `npm run build`: sikeres, az új API útvonal a buildben szerepel. A meglévő több-lockfile workspace-root warning megmaradt.
- `npx tsc --noEmit`: sikeres.
- Célzott ESLint az új TS/TSX és CJS fájlokon: sikeres.
- `node --test src/lib/activationMetrics.test.cjs src/components/admin/weekly-ride-navigation.test.cjs`: 5 teszt sikeres. Dátumellenőrzés, mediánformázás, API 400/401/403/500/200, RPC-hívás és privát cache, továbbá a meglévő heti ride-link regresszió.
- `node scripts/check-activation-metrics.cjs`: JSON-kódolt SELECT-only SQL-t generál a migráció tényleges lekérdezéséből. A JSON dekódolt szövegét parksafe-self `execute_sql`-nek átadva mind a 13 `passed` érték true. Nem hoz létre és nem módosít éles tesztadatokat.
- SQL-példák: pontos 168 órás aktiválási/visszatérési határ; 1 másodpercnyi túllépés; azonos budapesti nap kizárása; azonos UTC-napon budapesti éjfél átlépése; duplikált kliensazonosítók; hiányzó kliensazonosítók; késői aktiválódás; friss regisztráció; páros elemszámú medián és sosem tekerők; nulla/negatív táv vagy idő, teszt/import, késői feltöltés és regisztráció előtti kezdés; vendég/törölt/orphan/kizárt fiókok; őszi óraátállítás; regisztrációs dátumhatárok; azonos kliensazonosító külön usereknél.
- Közvetlen függvényhívás session nélküli és nem admin identitással: mindkettő 42501. Anon EXECUTE=false, authenticated EXECUTE=true. Fordított időszak és jövőbeli adatlezárás: 22023.
- Bejelentkezett admin böngészőben: valódi backendadatok, dátumváltás és újralekérés, üres időszak három „Nincs adat” értékkel, számítási szabályok nyitása/zárása, kezdeti hiba és Újrapróbálás. Kliensengedély nélküli HTTP-hívás 401, érvénytelen dátum 400.
- 390 px-es CSS viewport: dokumentum scrollWidth=390, nincs vízszintes túlcsordulás; a három mutató egymás alatt. Asztali nézetben három oszlop. Ez desktop böngészőben végzett responsive ellenőrzés, nem valódi telefonos teszt.
- Ellenőrzött pillanatkép: 2026-09-16–2026-10-15, 37 cohort-tag, aktiválás 5/32 = 15,6%, visszatérés 2/5 = 40%, medián kb. 16 óra (5 fős minta). Az új Lekérés időben változó eredményt adhat.

A webkód helyi módosítás; webes deployment nem történt. Dev szerver: http://localhost:3000/admin.
