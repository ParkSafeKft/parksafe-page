# PARKS-243 — képek és tárolószám

## Elkészült

- A főoldal mindkét régi telefonképe helyett a küldött térképscreenshot jelenik meg.
- A felhasználó Shots.so telefonmockupja jelenik meg, eredeti átlátszósággal; az üres vásznat CSS-sel levágjuk.
- A contact oldalon a küldött 2160 × 3240-es eredeti portré (`psz-portrait.jpg`) váltotta a kis felbontású képet. A 4:5 keretben az arcot megtartó vágással jelenik meg.
- A Rólunk első fotóját a felhasználó páros stúdióportréja (`parksafe-founders-portrait.png`, 1024 × 1536) váltotta. Négyzetes keret és 35%-os függőleges fókusz vágja le az alsó részt, mindkét fejet és a felsőtestet megtartva.
- Hero: a tényleges telefon szélessége desktopon kb. 356 px, mobilon kb. 276 px. A régi 460 px-es négyzetes asset jelentős üres teret tartalmazott.
- A második telefon a platform kártyáján dekoratív, döntött és részben levágott.
- Next/Image optimalizálás, megadott képméretek, hero előtöltés; nincs új függőség.

## Igazolt, szándékosan kerekített tárolószám

Forrás: ParkSafe Supabase, `public."parkingSpots"`, 2026-10-02.

```sql
select count(*) as total,
       count(*) filter (where osm_deleted is not true) as not_deleted,
       count(*) filter (where available is true and osm_deleted is not true) as available_not_deleted,
       count(*) filter (where coordinate is not null and osm_deleted is not true) as mapped_not_deleted
from public."parkingSpots";
```

Mind a négy eredmény **674272**. A weben a felhasználó kérésére továbbra is **674 000+ / 674,000+** szerepel. A szám igazolt; a tárolókhoz nincs külön verified mező, ezért nem állítunk helyszínen ellenőrzött minősítést.

## Kért eredeti képek

| Prioritás | Hely / jelenlegi fájl | Jelenlegi méret | Kért eredeti |
| --- | --- | --- | --- |
| Magas | Rólunk, világbajnoki bemutató — `parksafe-world-final-showcase.jpg` | 800 × 533 | Legalább 1600 × 1000, lehetőleg az eredeti fotó a két alapítóról a kijelző mellett. Desktopon 416 px széles; nagy pixelsűrűségen kevés a jelenlegi forrás. |
| Opcionális | Főoldali telefon — `parksafe-phone-mockup.png` | 1920 × 1440 vászon | 2× Shots-export eredeti, legalább 1080 px széles screenshotból a jobb retina részletességhez. A felhasználó mockupja már használatban van. |

Nem szükséges új forrás a `start.jpg` (5270 × 3506), `virtus.JPG` (2048 × 1365) és `parksafe-world-final-team.jpg` (1900 × 1425) képekhez felbontás miatt. A logó nagy felbontású eredetije már rendelkezésre áll. Átméretezéssel vagy AI nagyítással nem pótoljuk a hiányzó fotórészletet.

## Mockup eszköz

[Shots.so](https://shots.so/): Android- és iPhone-keretek, átlátszó háttér, PNG-export. A küldött Android screenshothoz Android keretet és átlátszó hátteret érdemes választani. A webes CSS-kerethez később elég a screenshot assetet cserélni.

## Ellenőrzés / lezárás

Production build és célzott ESLint. A helyi production előnézet újraindítva a friss builddel. Mobilon és desktopon a képek betöltését, a telefonok elhelyezését és a vízszintes túlcsordulást a böngészőben ellenőrizzük. A preview screenshot funkciója hibát adott; ezt nem tekintjük sikeres vizuális ellenőrzésnek.

A két Rólunk-fotóhoz készült AI-próbaverziót a felhasználó elutasította. Egyik sem került a projektbe. Az első képet azóta a küldött stúdióportré váltotta; a világbajnoki bemutató eredeti fotója megmaradt, annak felbontási kompromisszuma fennmarad.
