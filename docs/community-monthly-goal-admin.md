# Havi közösségi cél az adminban

A dashboard jobb oldali oszlopában a közösségi cél és a kompakt eszközmegoszlás együtt tölti ki a regisztrációs diagram magasságát. A tollikon külön szerkesztőablakot nyit; a dashboard elrendezése szerkesztéskor is változatlan.

## Használat

- Hónap: az aktuális és a következő 23 hónap választható.
- Cél: kilométerben, legfeljebb három tizedessel; vessző és pont is elfogadott.
- Megjelenítés az appban: a kiválasztott hónap `enabled` beállítása.
- Mentés után az app a következő sikeres havi lekérdezéskor kapja meg a célt. Minden hónaphoz külön rekord szükséges.
- Másik admin közben mentett változtatását nem írja felül a régi szerkesztő: ütközéskor újratöltés szükséges.

## Adatkapcsolat és jogosultság

Az `/api/admin-community-monthly-goal` ellenőrzi a Supabase-sessiont és a `profiles.role = 'admin'` jogosultságot. Az aktuális adatokat a meglévő `get_current_community_monthly_goal()` szolgáltatja. A százalék számítása megegyezik a mobiléval: egy tizedesre lefelé kerekítés; a sáv legfeljebb 100%, a kijelzett teljesítés túllépheti ezt.

A két új függvény: `admin_get_community_monthly_goal(date)` és `admin_set_community_monthly_goal(date,bigint,boolean,timestamptz)`. Mindkettő önállóan ellenőrzi a hívó adminjogát. A céltábla közvetlen jogosultságai változatlanok; nincs új service-role kulcs a weboldalban. A mentés és az előtte/utána állapot naplózása egy tranzakcióban történik. A havi napló célazonosítója a hónapból képzett stabil UUID, a hónap a JSON notes mezőben is szerepel.

## Éles telepítés, 2026-10-16

A felhasználó kifejezett engedélyével a `parksafe-self` MCP telepítette az `admin_community_monthly_goal` migrációt, éles verzió: `20261016103832`. A helyi SQL-artifact: `supabase/migrations/20261016120000_admin_community_monthly_goal.sql`.

Telepítés előtti és utáni összehasonlítás: az októberi 4 000 000 méteres aktív cél teljes rekordja változatlan, beleértve az `updated_at` értékét. Az eredeti mobil RPC definíciójának MD5-je mindkét alkalommal `efd5f0f0eee6786902b10c12cb9269e8`. Anon nem futtathatja az új függvényeket; bejelentkezett nem-admin hívót a függvény elutasít.

Az éles célt nem módosítottuk tesztelés céljából. A weboldal éles publikálása külön kiadás.

## Ellenőrzés

```powershell
node --test src/lib/communityMonthlyGoal.test.cjs
node scripts/test-community-monthly-goal-sql.cjs
npx tsc --noEmit
npm run build
```

A SQL-teszt kizárólag memóriabeli PGlite adatbázist használ, hálózati kapcsolat és Supabase-kulcs nélkül. Az eredeti mobil migrációt a szomszédos `../parksafe` repóból tölti be a kompatibilitás ellenőrzéséhez. Lefedi a szerepköröket, mentést, ütközést, hibás célértékeket, naplózást és a naplóhiba miatti teljes visszagörgetést.
