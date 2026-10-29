# Adminmodalok: közös megjelenés és navigáció

Referencia: a már elfogadott heti statisztika és felhasználói profil. Apple Design és Anti Slop, a korábban kiválasztott `during` módban. Az adminisztrátor feladata a helyek, beküldések, felhasználók és tekerések áttekintése, ellenőrzése és szerkesztése. A részletező ablakból a kapcsolódó rekordhoz lehessen jutni, majd az eredeti munkához visszatérni.

## Vizuális szerződés

A `WeeklyStatsDetailModal.module.css` közös változói adják az összes modern adminmodal palettáját, rendszerbetűjét, címméretét és ablakméretét. A zöld az elsődleges műveletet, hivatkozást és fókuszt jelöli. A sötét felületek semleges RGB-szürkék: #181818, #242424, #101010. Világosban #fafafa, #ffffff és #eeeeef szerepel. Szöveg: #1c1c1e / #f4f4f4, kiegészítő szöveg: #606064 / #b7b7b7. A korábban ellenőrzött közös szöveg/háttér párok kontrasztja világosban legalább 5,40:1, sötétben legalább 8,85:1.

- A fejléc sorrendje: bal felső Vissza, nézettípus, bezárás; alatta cím, leírás és metaadatok. Külön dekoratív fejlécikon helyett a tartalom kap hangsúlyt.
- Az űrlapokban az összetartozó mezőket címsor és elválasztó vonal csoportosítja. A korábbi egymásba ágyazott sötét kártyák helyett sík szakaszok jelennek meg.
- A kapcsolódó rekordok nevei a Kapcsolatok rész kattintható sorai. Azonosítóval nem rendelkező információból nem készül látszólagos hivatkozás.
- A fő műveletek a rögzített láblécben maradnak. A hiba és a veszélyes művelet szemantikus vörös színt is használhat; a folyamatállapot szövegesen is szerepel.
- A kapcsolók valódi, billentyűzettel működtethető `role="switch"` vezérlők. A képek nagyításához és törléséhez fókuszálható gombok tartoznak.
- A színek a rendszer megjelenését követik. Csökkentett mozgásnál nincs animáció; csökkentett áttetszőségnél nincs elmosott háttér.

Az Apple HIG helyi referenciái és a döntések alapjai a `weekly-stats-design.md` dokumentumban találhatók: `layout.md › Visual hierarchy`, `modality.md › Best practices`, `typography.md`, `accessibility.md › Vision`, `color.md › Inclusive color`, `dark-mode.md › Dark Mode colors`, `lists-and-tables.md`. A közös keret CSS-modult és saját dialog-slotot használ, hogy a korábbi, globális adminstílusok ne írják felül a megjelenést.

## Lefedettség

| Család | Tartalmi változat |
| --- | ---: |
| Új hely: parkoló, szerviz/bolt, javítóállomás, ivókút | 4 |
| Hely szerkesztése: ugyanaz a négy típus | 4 |
| Város: új és meglévő | 2 |
| DetailModal: négy hely, profil, visszajelzés, parkolókép, négy POI-bejelentés | 11 |
| POI-javaslat: négy típus és típus nélkül | 5 |
| Közösségi útvonal ellenőrzése | 1 |
| Heti statisztika | 5 |
| DetailModal: mentett tekerés és diagnosztikai próbálkozás | 2 |
| Képnézegető és törlési megerősítés | 2 |
| **Összesen** | **36** |

A feltöltött kép és a képkérelem korábbi böngészős megerősítése is a közös DeleteConfirmModal keretet használja. Ezek ugyanannak a megerősítésnek eltérő szövegű változatai; külön tesztelve a megszakítás. A nyilvános profiloldal fióktörlési és jelszó-visszaállítási modaljai kívül esnek az adminfelületen.

A `RideDiagnosticsTab` önálló ride-dialogja megszűnt. A táblázat, a heti listák és a profil legutóbbi tekerései a központi `DetailModal` `ride` nézetébe vezetnek. A tartalmat a `RideDetailContent` jeleníti meg. A régi `?ride=` hivatkozás továbbra is pontosan a kért tekerést tölti be. A meglévő megtekintési naplózás és a védett útvonal-feltárás megmaradt; a nyers GPS-pontok nem kerülnek a részletező állapotába.

## Navigáció

| Kiindulópont | Kapcsolat | Visszatérés |
| --- | --- | --- |
| Heti aktív / új felhasználók | Felhasználó neve → profil | Fül, keresés, görgetés, fókusz |
| Heti tekeréslista | Felhasználó neve → profil; útvonal neve → tekerés | Az eredeti heti nézet állapota |
| Tekerés | Tekerő → profil | DetailModal előzményverem |
| Profil | Legutóbbi tekerés / diagnosztikai rekord → tekerés | Profil, görgetés és fókusz az aktivitás betöltése után |
| Visszajelzés | Beküldő → profil | DetailModal előzményverem |
| POI-bejelentés | Bejelentő → profil; érintett hely → helyadatok | DetailModal előzményverem |
| Parkolókép | Feltöltő → profil; parkoló → helyadatok | DetailModal előzményverem |
| POI-javaslat | Beküldő → profil | Szerkesztett mezők, görgetés és fókusz |
| Közösségi útvonal | Beküldő → profil | Jegyzet, kiválasztott státusz, görgetés és fókusz |
| Hely részletei | Szerkesztés → helyűrlap | Bal felső Vissza; mentés után frissített rekord |
| Képfeltöltő | Nagyítás / törlési megerősítés | Bezárás vagy Escape után az indító gomb fókusza |

A kapcsolódó részletező nézetek egy navigációs előzményt használnak; a forrásmodal profil- vagy tekerésnézet közben rejtve marad. A képnézegető és a műveletmegerősítés átmeneti alablak lehet. A megszakított vagy elavult adatlekérés nem nyithatja újra a bezárt részletezőt, és nem cserélheti le az időközben megnyitott rekordot.

A keresztből indított törlés célpontja a kiválasztott rekord táblája, nem az aktuális adminfül. Például a POI-bejelentésből megnyitott parkoló szerkesztőjében a törlés a parkolót célozza. Sikertelen törléskor a szerkesztő és a megerősítés megmarad. Jogosultság vagy adatbázisséma nem változott.

## Ellenőrzés és Anti Slop Delivery Gate

- Hard Gate: PASS. Az érintett források lintellenőrzése tiszta, a production build és TypeScript sikeres. 13 automatizált teszt ellenőrzi a hivatkozásokat, rendezést, üres állapotokat, profil- és tekerésnavigációt, megszakított/elavult válaszokat, megtekintési naplózást és a törlés helyes célpontját.
- Purpose Gate: PASS. A közös keret az adatok közötti tájékozódást és visszatérést szolgálja. Egyetlen modalszintű árnyék jelöli a réteget, a hangsúlyt a cím és az adatok adják. Új arculati kép vagy dekoratív grafikon nem készült.
- Liveliness: PASS. ENERGY 2 / RHYTHM 2 / MOTION 1. A tekerés mutatói, a profil identitása és a moderációs tartalom eltérő szerkezetet kapnak a közös kereten belül. A zöld a ParkSafe műveleteit és hivatkozásait azonosítja.
- Craftsmanship: PASS. Mind a 36 tartalmi változat ellenőrizve 1440×900 világos és 390×844 sötét megjelenésben; nincs vízszintes túlcsordulás és az ablakok a képernyőn belül maradnak. Nyolc fő nézet további ellenőrzése 320 és 768 px szélességen is sikeres. Kapcsolók egérrel és Space billentyűvel, valamint Escape és visszatérés ellenőrizve.
- Folyamatellenőrzés: a javaslat szerkesztett neve és az útvonal módosított jegyzete/státusza profilnézetből visszatérve megmarad. Visszajelzésből profilra, majd vissza: ugyanaz a görgetés (173,5 px) és az indító vezérlő fókusza. Képnagyítás és képtörlési megerősítés megszakítása után az indító gombra kerül vissza a fókusz.

A böngészős ellenőrzés helyi mintaadatokkal történt, adminmunkamenet nélkül. Éles mentést, törlést, moderációt vagy jogosultságmódosítást nem indítottam a vizuális tesztből. A képek és a teljes jegyzék az `admin-modal-redesign/index.html`, illetve `manifest.json` fájlban vannak: 36 változat, 72 kép. Az ideiglenes tesztútvonal és migrációs segédszkriptek eltávolítva a végső build előtt.
