# Bővített modalkép-leltár

Nyisd meg az index.html fájlt. A galériában 43 PNG van: 38 tartalmi változat és 5 további állapot. A manifest.json minden képhez megadja a forráskomponenst, típust és fájlnevet.

Az eredeti 16 képes gyűjtemény válogatás volt; ez külön ábrázolja a paraméterezett változatokat is. A felhasználó három mintaképe a WeeklyStatsDetailModal active-users, rides és distance változatának felel meg. A duration és new-users is külön szerepel.

A képek 1280×1000-es böngészőnézetben, az eredeti komponensekkel és stílusokkal, mintaadatokkal készültek. A profil két overlayét, a ride beágyazott dialogját és a POI-javaslat belső komponensét ideiglenes előnézeti modul jelenítette meg az eredeti JSX-ből. Mentés, törlés és emailküldés nem futott. Mind a 43 nézetnél egy megjelenített role=dialog elemet ellenőriztem; az ideiglenes előnézet TypeScript-ellenőrzése sikeres volt.

A hosszú modalok megnyitás utáni nézete látszik: a görgethető tartalom alsó része nem feltétlenül fér rá ugyanarra a képre. Nem szerepel az összes adat-, betöltési-, státusz- és jogosultságiállapot-kombináció. A két natív böngészős confirm és a nem modális oldalpanelek külön szerepelnek a ../modal-audit.md jelentésben.

Az önállóan megnyitható tartalmak közösíthetők úgy is, hogy külön nézetek maradnak. Például az öt heti nézet ugyanazt a keretet használja; a távolság és az idő ugyanazt a ride-listát eltérően rendezi, az aktív és új felhasználók pedig más oszlopokat mutatnak.
