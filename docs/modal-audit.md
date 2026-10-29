# Modal-leltár és funkcionális csoportosítás

## Javítás: a komponensszám nem a külön megnyitható nézetek száma

Az eredeti 12-es szám a megvalósításokat jelölte, az első 16 képes galéria pedig válogatás volt. Nem mutatta külön az összes típusváltozatot. A teljességre utaló korábbi megfogalmazás ezért félrevezető volt.

A bővített képes leltár: **38 tartalmi változat és 5 további állapot, összesen 43 képernyőkép**. A részletes jegyzék a [manifest.json](modal-screenshots-complete/manifest.json), a galéria a [bővített galéria](modal-screenshots-complete/index.html).

| Megvalósítás | Külön fényképezett tartalmi változat |
| --- | ---: |
| AddLocationModal: 4 helytípus | 4 |
| EditLocationModal: 4 helytípus | 4 |
| CityFormModal: új és meglévő város | 2 |
| DetailModal: 4 hely, user, feedback, parkolókép, 4 POI-bejelentési típus | 11 |
| EditSuggestionModal: 4 helytípus és típus nélküli javaslat | 5 |
| CommunityRouteReviewModal | 1 |
| WeeklyStatsDetailModal: aktív tekerők, tekerések, távolság, idő, új regisztrálók | 5 |
| RideDiagnosticsTab: mentett ride és diagnosztikai próbálkozás | 2 |
| ImagePreview | 1 |
| DeleteConfirmModal | 1 |
| Profil: fióktörlés és jelszó-visszaállítás | 2 |
| **Tartalmi változatok összesen** | **38** |

Az öt külön állapot: útvonal elutasítási indokokkal; jelszó-visszaállítás siker és hiba; fióktörlési hiba; üres heti lista. Ezek nem új modalkomponensek. A képek nem fedik le minden adat-, státusz-, betöltési és jogosultsági állapot összes kombinációját.

A két natív böngészős confirm, a nyilvános térkép oldalpanele és a mobil navigáció külön kategória; nem részei a 43 React-modal-képernyőképnek. A használaton kívüli generikus Sidebar/Sheet ág sem került aktív modalként a galériába.

Az alábbi eredeti, komponensenkénti leltár ennek megfelelően értelmezendő.

Dátum: 2026-10-15. Hatókör: a `parksafe-page` webalkalmazás jelenlegi `src/` könyvtára; a külön mobilalkalmazás nincs ebben a vizsgálatban.

## Eredmény és ellenőrzési korlát

12 konkrét modalmegvalósítást azonosítottam: 10 az adminfelületen, 2 a profiloldalon. Mindegyikhez létezik renderelés és felhasználói megnyitási pont a kódban. Teljesen bekötetlen üzleti modalt nem találtam. Ez statikus használatot bizonyít, nem tényleges felhasználói használati gyakoriságot.

A localhost:3000 alkalmazás elérhető. Az `/admin` oldalon a böngésző „Hozzáférés megtagadva” választ kapott, ezért a modalok élő megnyitását, adatbetöltését és mentését nem tudtam végigpróbálni. A leltár a TypeScript AST alapján felépített importláncokra, a JSX-renderelésekre és a megnyitó eseménykezelőkre támaszkodik. A projektben nincs `graphify-out/`.

## Konkrét modalok

Az alábbi fájlok a `src/components/admin/` könyvtárban vannak, kivéve a két profilmodalt.

| Modal | Funkció | Honnan nyílik a kód szerint? | Kategória |
| --- | --- | --- | --- |
| `AddLocationModal` | Új parkoló, szerviz/bolt, javítóállomás vagy ivókút felvitele | Admin új hely gombjai | Adatfelviteli űrlap |
| `EditLocationModal` | Ugyanezen négy helytípus szerkesztése, képek és törlés elérése | Helylista szerkesztés gombja; hely részletezőjének szerkesztés gombja | Adatszerkesztő űrlap |
| `CityFormModal` | Város létrehozása és szerkesztése; koordináták, határok, időzóna, aktív állapot | Városok új gombja, táblázatsora vagy szerkesztése | Adatfelviteli/adatszerkesztő űrlap |
| `DetailModal` | Felhasználó, helyszín vagy beküldés részletei; típustól függően adminműveletek | Admin táblázatsorok; ranglista felhasználója; kapcsolódó rekordok | Részletező és moderáció |
| `EditSuggestionModal` | POI-javaslat ellenőrzése, adatainak szerkesztése és státuszkezelése | POI-javaslat sora vagy szerkesztés gombja | Beküldések moderálása |
| `CommunityRouteReviewModal` | Közösségi útvonal térképes ellenőrzése, státusz és megjegyzés mentése | Közösségi útvonal táblázatsora | Beküldések moderálása |
| `WeeklyStatsDetailModal` | Heti aktív felhasználók, tekerések, távolság, idő és új regisztrálók részletezése | Vezérlőpult „Elmúlt 7 nap” öt mutatójának gombjai | Statisztikai részletező |
| `RideDiagnosticsTab` beágyazott dialogja | Mentett ride vagy eldobott diagnosztikai próbálkozás technikai adatai | Ride diagnosztika sora vagy Részletek gomb; `?ride=` hivatkozás | Technikai részletező |
| `ImagePreview` | Kép nagyítása | Parkolóképek lista; hely/képkérelem részletező; képfeltöltő bélyegképe | Média-előnézet |
| `DeleteConfirmModal` | Adminrekord törlésének megerősítése | Admin törlés gombok; hely szerkesztőjéből indított törlés | Műveletmegerősítés |
| Profil: fióktörlés | Saját fiók törlésének megerősítése és indítása | `/profile` fióktörlés gomb | Fiókkezelés / műveletmegerősítés |
| Profil: jelszó-visszaállítás | Visszaállító hivatkozás küldése, folyamat visszajelzése | `/profile` jelszó-visszaállító link küldése gomb | Fiókkezelés |

Az `EditSuggestionModal` a `PoiSuggestionsTable.tsx:349` fájlon belüli komponens. A ride dialogja a `RideDiagnosticsTab.tsx:82` sorban van. A két profilmodal a `src/app/(main)/profile/page.tsx:386` és `:446` soroknál kezdődik.

### A DetailModal változatai

Egy komponens nyolc funkcionális változatot szolgál ki:

- `user`: profil, aktivitás, jelvények, legutóbbi túrák, tiltás/támogatói státusz kezelése.
- `parking`, `service`, `repair`, `drinking_fountain`: négy helytípus adatai, képek, helymeghatározás, továbblépés szerkesztésre.
- `feedback`: visszajelzés tartalma, kapcsolat és státusz.
- `poi_flags`: hibás/pontatlan POI bejelentése, kapcsolódó hely és bejelentő, feldolgozási státusz.
- `parking_image`: beküldött parkolókép, kapcsolódó parkoló és beküldő, jóváhagyás/elutasítás/törlés.

Forrás: `DetailModal.tsx:527`, `:738`, `:979`, `:1173`, `:1407`. Megnyitó táblázatok: `src/app/admin/[[...slug]]/page.tsx:1569–1822`; külön felhasználói megnyitás: `LeaderboardTab.tsx:86` és `:113`.

## Mi hasonló, és mit érdemes közösíteni?

1. **AddLocationModal + EditLocationModal: a legerősebb összevonási jelölt.** A négy helytípus és a formállapot mezői szinte azonosak; a szerkesztőben plusz `available` mező is van. Közös helyűrlap, típusfüggő mezőcsoportok és koordinátavalidálás indokolt. A létrehozás és módosítás mentési logikája külön maradhat, mert a létrehozásnál a képfeltöltés az új rekord azonosítójától függ. Forrás: `AddLocationModal.tsx:36`, `:102`, `:179`; `EditLocationModal.tsx:42`.

2. **Moderációs család: feedback, POI-bejelentés, parkolókép, POI-javaslat, közösségi útvonal.** Mindegyik beküldött tartalmat, beküldőt/kapcsolódó rekordot és feldolgozási műveleteket mutat. Közös fejléc, metaadatblokk, kapcsolatok és státuszművelet-elrendezés hasznos. A státuszokat és a mentést nem célszerű vakon egységesíteni: a munkafolyamatok eltérnek. A javaslat szerkeszthető helyadatokat, az útvonal térképes geometriát, a képkérelem képet kezel.

3. **Részletező család: felhasználó, hely, heti statisztika, ride diagnosztika.** Mind adatmegtekintés, de eltérő célból. Közös keret és adatsorok indokoltak; egyetlen óriás komponensbe összevonásuk kevésbé. A heti lista már hivatkozik a ride diagnosztikára (`WeeklyStatsDetailModal.tsx:272` környéke).

4. **Megerősítések: admin törlés, fióktörlés és két natív confirm.** Közös megerősítő felület szóba jön, paraméterezett címmel, következményekkel és folyamatállapottal. A fióktörlés saját feltételeit meg kell őrizni. Natív megerősítés: parkolókép-kérelem törlése (`src/app/admin/[[...slug]]/page.tsx:1093`), feltöltött kép törlése (`ImageUpload.tsx:180`). Ezek jelenleg a `DeleteConfirmModal` mellett külön megoldások.

5. **CityFormModal:** az űrlapcsalád része, de eltérő adatmodellje miatt külön maradjon. Már egyesíti a létrehozást és szerkesztést, tehát jó helyi példa az add/edit közösítésére.

6. **ImagePreview:** már több helyen újrahasznált, egyetlen képnézegető. Nem találtam második külön képmodal-megvalósítást.

Az adminmodalok közös kerete már létezik: `AdminModal.tsx:6` négy változata `inspector`, `form`, `confirm`, `media`. A profil két felugrója ettől külön, kézzel felépített overlay.

## Van kód, amelyhez nem vezet aktív felület?

**Igen, a generikus mobil sidebar-fiók.** A `src/components/ui/sidebar.tsx:154` `Sidebar` komponens mobilon `Sheet` modalt renderel (`:185`). A projektben nincs `<Sidebar>` használat és nincs importálója ennek az exportnak. Az admin ehelyett saját `AdminSidebar` komponenst használ, saját mobil háttérrel és `<aside>` elemmel (`AdminSidebar.tsx:27–47`).

Ez nem egy elfelejtett üzleti modal, hanem egy használaton kívüli alternatív navigációs megvalósítás. A teljes `sidebar.tsx` fájl nem törölhető egyszerűen: a `SidebarProvider`, `SidebarTrigger`, `SidebarInset` és `useSidebar` használatban van. A `sheet.tsx` egyetlen importálója a generikus sidebar fájl; a benne lévő fiókhoz jelenleg nem vezet renderelési út.

A `dialog.tsx` több exportja sincs közvetlenül használva, például `DialogTrigger`, `DialogFooter`, `DialogDescription`. Ezek UI-könyvtári segédelemek, nem külön rejtett modalok; megtartásuk vagy eltávolításuk külön takarítási döntés.

## Modalnak tűnhet, de más felület

- A nyilvános térkép helyrészletezője a `MapExperience.tsx:179–209` saját oldalpanele. Négy POI-típusra működik, de nem `Dialog`/modal, és nincs külön modalkomponens mindegyikhez.
- Az admin mobil menüje saját háttérrel megjelenő navigációs panel.
- A két böngészős `confirm()` szintén felugró megerősítés, de nem React-modalkomponens.

## Javasolt sorrend

1. Közös helyűrlap az AddLocationModal és EditLocationModal mögé.
2. Az admin törlési megerősítések közös felületre hozása.
3. A DetailModal szétválasztása felhasználó-, hely- és moderációs tartalmakra a meglévő közös keret megtartásával.
4. Moderációs részblokkok közösítése az eltérő munkafolyamatok megőrzésével.
5. A generikus Sidebar/Sheet használaton kívüli ágának célzott takarítása.

A vizsgálat alkalmazáskódot nem módosított és adatot nem írt.
