# Felhasználói profil és heti visszalépés

A profil referenciafelülete a megújult WeeklyStatsDetailModal. Ugyanazt a CSS-modulban definiált palettát, betűcsaládot, ablakméretet, címsort és görgetési szerkezetet használja. A zöld kiemelőszín; a sötét háttér semleges szürke/fekete. Apple Design és Anti Slop (during) alapján készült; a részletes HIG-hivatkozások a weekly-stats-design.md dokumentumban szerepelnek.

Az identitás és a hozzáférési állapot a fejlécben marad. Alatta profiladatok, aktivitás, jelvények, legutóbbi tekerések és a meglévő védett diagnosztika található. A kapcsolati adatok és az azonosító másolhatók. Az adminisztrációs műveletek rögzített láblécbe kerültek. Mobilon az adatok egy oszlopba, az összesített mutatók két oszlopba tördelődnek.

Az aktív tekerők és az új regisztrálók névgombja a meglévő adminprofil-betöltést indítja. A heti nézet állapota megmarad, miközben a profil látható. A bal felső Vissza, a bezárás és az Escape visszaállítja az eredeti fület, keresést, görgetési helyet és felhasználógombra helyezett fókuszt. Egyszerre egy dialog látható. A megszakított betöltés nem nyit később profilt; a sikertelen kérés visszajelzést ad a heti listában.

## Ellenőrzés

- Hard Gate: PASS. Production build és TypeScript sikeres; az érintett fájlok ESLint-ellenőrzése tiszta; 7 automatizált navigációs teszt sikeres. Az aktivitás lekérdezési hibája külön hibaállapotot ad, és letiltja az ismeretlen támogatói állapot módosítását.
- Purpose Gate: PASS. Közös vizuális referencia, funkció szerint csoportosított adatok, névvel ellátott vezérlők, szemantikus adatlisták és zöld fókuszjelzés. Dekoratív grafikon vagy háttértinta nincs.
- Liveliness: PASS. ENERGY 2 / RHYTHM 2 / MOTION 1. A profilnév és az aktivitási mutatók adják a hangsúlyt; az adatsorok tömörebbek, az animáció betöltési visszajelzésre korlátozott.
- Craftsmanship: PASS. 320, 390, 768 és 1440 px szélességben nincs vízszintes túlcsordulás; a modal a képernyőn belül marad. Világos és sötét megjelenés ellenőrizve. A semleges háttér és szemantikus szövegszínek a heti modal ellenőrzött közös változóiból származnak.
- Böngészőben ellenőrizve: mindkét felhasználólista → profil → vissza, eredeti keresés/görgetés/fókusz; Escape; sikertelen profilbetöltés; betöltés közbeni bezárás; aktivitási hiba. A tiltás és a támogatói jelvény állapotváltása kizárólag teszt-visszahívásokkal lett kipróbálva.

A böngészős ellenőrzés mintaadatokkal történt, mivel az automatizált böngésző nem rendelkezett adminmunkamenettel. Adatbázisséma, jogosultság és diagnosztikai hozzáférés nem változott. A tesztoldal és a helyettesítő adatmodul a production build előtt törölve. A mentett képek a user-profile-redesign mappában találhatók.
