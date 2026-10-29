# Heti statisztikák: vizuális irány

## Feladat és irány

Webes admineszköz öt összetartozó heti adatnézethez. Az elsődleges cél gyorsan átlátni a heti teljesítményt, keresni az adatokban, és egy tekerés technikai adataihoz jutni. A felhasználó szabad áttervezést kért Apple Design és Anti Slop alapján, zöld elsődleges színnel. Anti Slop: during, a felhasználó erre a munkamenetre választotta.

Design Read: visszafogott, jól olvasható elemzőablak; a zöld a heti mutatót és a kiválasztott tartalmat jelöli. ENERGY 2 / RHYTHM 2 / MOTION 1. A nagy heti összeg és a sűrűbb adatsorok eltérő ritmusa az áttekintést és az összehasonlítást szolgálja. Sem dekoratív grafikon, sem új arculati kép nem szükséges.

## Referenciák és döntések

A Refero élő eszközei nem érhetők el, ezért a csomagolt craft-referenciákra és az Apple helyi HIG-gyűjteményére támaszkodom. Ez webes felület; az Apple olvashatósági és interakciós elveit alkalmazom, natív ablakdekorációt nem utánzok.

- Apple `layout.md › Visual hierarchy`: összetartozó elemek csoportosítása, fontosság szerinti sorrend. A cím, heti összeg és adatok külön szintet kapnak.
- Apple `typography.md`, `accessibility.md › Vision`: olvasható méret, skálázható szöveg, színen kívüli jelzések. Legalább 13–14 px-es adat- és kiegészítő szöveg, tabuláris számok, névvel ellátott ikonvezérlők és látható fókusz.
- Apple `color.md › Inclusive color`, `dark-mode.md › Dark Mode colors`: szemantikus színek mindkét megjelenéshez. A zöld szöveg és aktív állapot szöveges címkét is kap.
- Apple `modality.md › Best practices`: egy világos feladat és egyértelmű bezárás. Az öt heti nézet ugyanabban a modalban váltható, új modalréteg nélkül.
- Apple `lists-and-tables.md › Content`: értelmes oszlopcímek és jól átfutható sorok. Asztalon szemantikus táblázat, keskeny nézetben ugyanazon adatok újratördelt elrendezése.
- Apple `search-fields.md`: keresés közvetlenül a hozzá tartozó tartalom mellett, egyértelmű törlési lehetőséggel.
- Apple `designing-for-macos.md › Best practices`, `cross-platform.md`: billentyűzet, egér és átméretezhető nézet; a weben ARIA és CSS töréspontok valósítják meg ezeket.
- Refero `craft-details.md › Focus States`: focus-visible, billentyűzetes visszajelzés; `typography.md › Context First`: munkaeszközben a semleges, pontos tipográfia elsőbbsége.

## Megvalósítási keret

- Elsődleges felület: semleges világos, automatikus sötét változattal. A felhasználó külön kérte a zöldes háttértinták eltávolítását: a sötét felületek semleges fekete/szürke színeket kapnak, a zöld csak kiemelőszín. Egyetlen árnyék a modal rétegét jelzi. A tartalmi sorok sík felületen maradnak.
- Zöld: aktív nézet és a heti fő mutató. A háttér és az összes adat nem kap zöld színezést.
- Rendszerbetű: a platformon megszokott olvashatóságot szolgálja. A heti érték mérete ad hierarchiát, nem külön dekoratív betűtípus.
- A keresés és a bezárás ikonja cselekvést magyaráz; a tekerés sorának jelzése a részletezőbe vezetést mutatja.
- Megmarad mind az öt nézet, az eredeti adatforrás és a ride diagnosztika hivatkozása. A heti összeg az API-adatból származik; a keresési találatszám ettől külön jelenik meg.
- A komponens saját CSS modult és dialog-tartalmi slotot kap, hogy a régi adminmodal-stílusok ne írják felül az új elrendezést.
- Betöltés és adatbetöltési hiba továbbra is a hívó ContentStatsOverview felelőssége. A modal a betöltött üres adatot és az eredménytelen keresést külön kezeli.

## Átadási ellenőrzés

- Hard Gate: PASS. Sikeres production build, TypeScript és lint; négy automatizált teszt. Böngészőben ellenőrizve az öt nézet, keresés, mindkét kereséstörlés, üres adat, bezárógomb, Escape, billentyűzetes tabváltás és fókuszcsapda. A tekerés hivatkozását a meglévő navigációs teszt és a sorok tényleges kattintási területe is ellenőrzi. Nem kerültek be új arculati képek vagy alá nem támasztott üzleti állítások.
- Purpose Gate: PASS. A semleges hátterek, az egyetlen zöld kiemelőszín, a rendszerbetű, a modal rétegét jelző árnyék és a keresés/bezárás/részletek funkcionális ikonjainak indoka fent dokumentált. Dekoratív grafikon nincs.
- Liveliness: PASS. ENERGY 2 / RHYTHM 2 / MOTION 1; a heti összeg a fókuszpont, a kereső és a tömör adatsorok eltérő ritmusúak. A zöld heti összeg és az aktív nézet jelölése következetesen ismétlődik.
- Craftsmanship C-1–C-5 és minőségi ellenőrzések: PASS. Célhoz kötött szerkezet, működő vezérlők, 320/390/768/900/1440 px-en túlcsordulásmentes nézet, mindkét megjelenés ellenőrizve. Szövegkontraszt: világosban legalább 5,40:1, sötétben legalább 8,85:1 a használt szemantikus szöveg/háttér párokon. A sötét háttérfelületek RGB-csatornái megegyeznek, tehát nincs zöld háttértinta.

A böngészős vizsgálat mintaadatokkal futott. Az éles adatbetöltés és a backend nem változott. A képek a weekly-stats-redesign könyvtárban vannak. Az ideiglenes, kizárólag helyi előnézeti útvonal a production build előtt eltávolítva.
