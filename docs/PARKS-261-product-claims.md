# PARKS-261 — ár- és platformállítások

2026-10-02. Forrás: a termékgazda ebben a munkamenetben megadott és jóváhagyott tájékoztatása; a jelenlegi webes kód; az alább megjelölt publikus store-listingek. Nem külön mobilapp-release audit.

| Állítás | Igazolás / státusz | Publikus megfogalmazás |
| --- | --- | --- |
| Az app és minden jelenlegi funkció ingyenes | Termékgazda megerősítette | A ParkSafe használata és minden jelenlegi funkció teljesen ingyenes. |
| Önkéntes támogatás | Termékgazda: Buy Me a Coffee, ellenszolgáltatás nélkül | A támogatás önkéntes, nem feltétele egyetlen jelenlegi funkció használatának sem. |
| Havi prémium előfizetés | Jövőbeli terv, fejlesztési kapacitástól függ; nincs indulási dátum | Később havi előfizetéssel elérhető extra funkciókat tervezünk. |
| Offline térkép- és POI-letöltés | Az előfizetéshez biztosan tervezett funkció; még nem elérhető | Tervezett extra funkció, nem jelenlegi szolgáltatás. |
| Előfizetési ár | Kb. 1000 Ft csak példa, nem végleges ár | Az ár nincs véglegesítve; összeget nem publikálunk. |
| További prémium funkciók | Még nincsenek meghatározva | Nincs konkrét ígéret. |
| iOS és Android | A jelenlegi webes letöltési gombok és schema azonos store URL-eket használnak | iPhone-on és Androidon is használhatod. |

Jóváhagyott HU/EN módosítások: ingyenességi FAQ, letöltési lépés, ÁSZF támogatási bekezdés, a partnerajánlatok „prémium” jelzőjének cseréje „kedvezményes”-re. A FAQ schema ugyanazokat a fordításokat használja, így követi a látható választ. A schema `price=0` és `isAccessibleForFree=true` megmarad, mert a jelenlegi állapotot jelöli.

A ticket régi leírásának „offline map és letölthető marker prémium” állítása a jövőbeli tervre vonatkozik a termékgazda pontosítása alapján. A többi funkcióállítás külön igazolását ez az árlista nem helyettesíti.

## Store-listing összevetés és javítási átadás

2026-10-02: [Google Play, HU](https://play.google.com/store/apps/details?id=com.parksafe.app&hl=hu) és [App Store, US/EN](https://apps.apple.com/us/app/parksafe-cycle-secure/id6752813986) publikus szövege ellenőrizve. Az Apple általános app-linkje US/EN listingre irányított; magyar Apple-listinget nem igazoltunk. Store-szöveget nem módosítottunk.

| Listing állítás | Összevetés / bizonyíték | Javasolt szöveg vagy döntés |
| --- | --- | --- |
| Apple: ingyenes app | Egyezik a termékgazda jelenlegi árazási megerősítésével | Megtartható. |
| Apple: offline használat letölthető alaptérképpel | Ellentmond a termékgazda pontosításának: az offline letöltés későbbi prémium terv | Törlendő a jelenlegi funkciólistából; jövőbeli tervként csak egyértelműen jelölve szerepeljen. |
| Apple és Play: útvonaltervezés, tárolók, szervizek, ivókutak | Mindkét listingben és a webes FAQ-ban szerepel; ez állításegyezés, nem független funkcióteszt | Meglévő állítás; az offline funkció elérhetőségét nem igazolja. |
| Play: tekerésrögzítés és előzmények | Listing és webes FAQ egyezik | Meglévő állítás, nem külön mobil-smoke check. |
| Apple: partnerkedvezmények már elérhetők | A web partnerhálózata „Hamarosan” jelölésű; működő kedvezményre nincs itt bizonyíték | Jelenlegi előnyként ne ígérjük; a partnerhálózatot tervként jelöljük. |
| Apple: minden utca biztonsági pontozása és legbiztonságosabb út | A web útvonalpreferenciákról beszél; az abszolút garanciára nincs itt bizonyíték | Kerékpáros útvonaltervezést, kerékpárutak és biztonságosabb utak előnyben részesítését írjuk; biztonsági garancia nélkül. |

A listingekben nem találtunk konkrét előfizetési árat. A GPX, őrzés és szabad kapacitás igazolását nem vezetjük le a listingekből. A store-szövegkorrekció külön feladat: PARKS-275; az ár- és tervállítások forrása ez a tábla.

Webes ellenőrzés: build, ESLint és a meglévő SEO-script PASS; HU/EN FAQ és JSON-LD mind a 7 kérdés/válasznál egyezik. A főoldal és a támogatási bekezdés mobilméretben nem lóg ki vízszintesen.
