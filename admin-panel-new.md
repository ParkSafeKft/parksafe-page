# ParkSafe Admin Panel — Clean Spec

> Status: Planning
> Date: 2026-04-13
> Replaces: [admin-panel-spec.md](./admin-panel-spec.md), [adminpanel-community-routes.md](./adminpanel-community-routes.md)
> Audience: Web admin panel developer

---

## 0. TL;DR

Egy egyszerű, egy helyen minden admin felület. **Olvass + módosíts** alap flow, semmi automatizálás, semmi flag-logika, semmi szerver-oldali cheat detekció. Ami a DB-ben van, azt mutatjuk; ami státuszt a panel átír, azt a mobil olvassa — ennyi.

Egyszerre egy admin ül előtte, manuálisan átnézi a community lane-eket, ránéz a city/challenge/leaderboard állapotra, ennyi. **Nincs** suspicious queue, **nincs** automatikus flagelés, **nincs** push küldés a paneléből (egyelőre).

---

## 1. Tech & Access

- **Next.js** (app router) + Supabase JS client
- Login: Supabase Auth (email/password), a user `profiles.role = 'admin'` kell legyen
- Middleware: `/admin` route mögött session + role check
- Service role key **soha** ne kerüljön kliensre — minden DB művelet RLS-en keresztül megy, saját user tokennel. Az admin RLS policy-k már be vannak állítva a DB-ben.
- 3 admin user már létezik a `profiles` táblában (`role='admin'`)

---

## 2. Architektúra — minden egy oldalon

**Az admin panel EGY oldal: `/admin`.** Nincsenek külön route-ok az egyes szekciókhoz. A felül (vagy oldalt) lévő **tab-sáv** váltja a tartalmat kliens-oldali state-tel — az URL nem változik tabváltáskor.

```
┌─────────────────────────────────────────────────────────┐
│  ParkSafe Admin                           🔔  👤 Logout │
├─────────────────────────────────────────────────────────┤
│  [Dashboard] [Routes] [Leaderboards] [Cities] [Challenges] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         <aktív tab tartalma itt>                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementáció:**
- Egyetlen `app/admin/page.tsx` komponens
- `useState<'dashboard'|'routes'|'leaderboards'|'cities'|'challenges'>` az aktív tabhoz
- Minden tab egy-egy React komponens (`<RoutesTab/>`, `<LeaderboardsTab/>`, stb.), feltételesen renderelve
- A detail nézetek (pl. egy community route kiválasztva) is state alapján jelennek meg ugyanazon az oldalon — pl. a Routes tab lista + opcionális jobb oldali detail panel. **Nincs `/admin/routes/[id]`.**
- Opcionálisan: query string (`?tab=routes&route=<id>`) ha szeretnéd, hogy frissítéskor ne essen vissza az első tabra — de az URL szintű route-ok nem kellenek.

**Tabok:**

| Tab | Ikon | Tartalom |
|---|---|---|
| Dashboard | 🏠 | Számlálók, gyors linkek |
| Routes | 🚴 | Community Routes lista + detail |
| Leaderboards | 🏆 | Global + Per city leaderboard |
| Cities | 🏙️ | City lista + új/szerkeszt |
| Challenges | 📅 | Challenge lista + detail |

**Nem lesz:** suspicious queue, moderation inbox, feedback tab, external auth szekció. Ha később kell, új tabként kerül be — **nem** külön oldalként.

---

## 3. Dashboard tab

Egyszerű számláló kártyák, semmi grafikon:

- Új community route-ok (`status = 'pending'`) — szám + „Átnézés" gomb: `onClick` → vált Routes tabra, `pending` szűrővel (kliens state)
- Aktív city-k száma
- Mai challenge-ek száma (`daily_challenges` ahol `challenge_date = today AND is_active`)
- Utolsó 7 napban regisztrált user-ek (`auth.users.created_at >= now() - 7d`)
- Utolsó 7 nap befejezett challenge attempt-ek (`challenge_attempts.status = 'completed'`)

SQL-ek egyszerű `count(*)` lekérdezések, oldalbetöltéskor párhuzamosan lefutnak.

---

## 4. Routes tab

### 4.1 Tábla

| Név | Beküldő | Hossz | Státusz | Beküldve | — |
|---|---|---|---|---|---|
| Route 2026.04.10 | @username | 2.3 km | 🟡 Pending | 3 napja | „Megnyit" |

**Oszlopok:**
- Név (ha `null`, akkor `Community Route <created_at>`)
- Beküldő username (`profiles.username` join) + avatar
- Hossz: a `geometry.coordinates`-ból kliens-oldalon haversine-nal kiszámolva
- Státusz badge (lásd 4.3)
- `created_at` relatív
- Akciók: „Megnyit" (detail view), 3-pont menü (gyors státusz váltás, törlés)

**Szűrők (felső sor):**
- Státusz: All / Pending / In Review / Accepted / Rejected
- Dátum range
- Kereső: név vagy username

**Bulk:** checkbox több sorra → státusz tömeges beállítása (dropdown a fejlécben).

**Lapozás:** server-side `range()` 50-es oldallal.

### 4.2 Detail view (ugyanezen a tabon, state-alapon)

A lista sor „Megnyit" gombjára klikkelve a Routes tab **nem navigál** — csak a tab belső state-je vált (pl. `selectedRouteId`). „Vissza" gomb visszaadja a listát. Opcionálisan query paraméterben tárolható (`?tab=routes&route=<id>`), hogy deep-link működjön, de nincs külön `/admin/routes/[id]` page file.

Kettős layout:

**Bal (40%) — metaadatok:**
- Név, leírás, surface_type, quality_rating
- Beküldő: profil link + regisztráció dátuma
- `created_at`, `updated_at`
- Review info: `reviewed_by` (username) + `reviewed_at` (csak ha nem null)
- **Státusz dropdown** — lásd 4.3
- **Admin notes** textarea (mentés gombbal)
- Gombok:
  - **Google Maps-en megnyit** → `https://www.google.com/maps/dir/?api=1&origin=<startLat>,<startLng>&destination=<endLat>,<endLng>&travelmode=bicycling` (a `points` tömb első és utolsó elemével)
  - **iD editor-ben megnyit** → `https://www.openstreetmap.org/edit?#map=17/<midLat>/<midLng>` — ide az admin manuálisan felviszi az utat OSM-re
  - **Törlés** (confirm dialog) — admin bárkiét törölhet (RLS engedi)

**Jobb (60%) — térkép:**
- MapLibre GL JS (ugyanaz a stack mint a mobilon) vagy Leaflet
- Tile: OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`)
- Polyline: zöld=accepted / sárga=in_review / piros=rejected / szürke=pending
- Start marker zöld pin, end marker piros pin
- Auto-fit bounds a `geometry`-re
- Geometry forrás: a `community_bike_lanes.geometry` oszlop GeoJSON MultiLineString — közvetlenül adható a map layer-nek

### 4.3 Státusz modell

4 érték van, ebből 1 a „semleges" (= még nem nyúlt hozzá senki):

| Érték | UI szöveg | Szín | Jelentés |
|---|---|---|---|
| `pending` | „Új" (semleges) | szürke | Beküldve, nincs vele semmi |
| `in_review` | „Folyamatban" | sárga | Admin elkezdte nézni |
| `accepted` | „Elfogadva" | zöld | Jóvá van hagyva — admin manuálisan felviszi OSM-re |
| `rejected` | „Elutasítva" | piros | Duplikált, hibás, stb. |

**Szabad átmenet bármelyikről bármelyikre.**

### 4.4 Mi történik státusz váltáskor

Kliens kód csak ennyit csinál:

```ts
await supabase
  .from('community_bike_lanes')
  .update({ status: 'accepted', admin_notes: note })
  .eq('id', laneId);
```

A DB trigger (`trg_sync_community_bike_lane_verified`) automatikusan beállítja:
- `reviewed_at = now()` (ha a status változott)
- `reviewed_by = auth.uid()` (ha a status változott)
- `is_verified = (status = 'accepted')` (legacy)

**A mobil appban semmi nem történik** státuszváltás után. Az `accepted` route-ok **nem** rajzolódnak a mobil térképen — az admin manuálisan felviszi OSM-re, és az OSM tile-on keresztül jelenik meg a usernél. A `community_bike_lanes` tábla lényegében a TODO queue az adminnak.

### 4.5 Validáció

- Elutasításnál kötelezően kérjünk `admin_notes`-ot (min. 5 karakter) — dropdown-szerű gyors opciók + szabad szöveg: „duplikáció" / „nem létező út" / „pontatlan" / „egyéb"
- Elfogadásnál nem kötelező notes, de legyen egy infó toast: *„Ne felejtsd el felvinni OSM-re"*

### 4.6 DB referencia (már élesben)

```
community_bike_lanes
├── id uuid pk
├── user_id uuid fk auth.users (NOT null — anon insert letiltva RLS-ben)
├── geometry jsonb  (GeoJSON MultiLineString)
├── points jsonb    ([{latitude, longitude}] — sárga pin koordináták)
├── name text
├── description text
├── surface_type text
├── quality_rating int (1-5)
├── status text ('pending'|'in_review'|'accepted'|'rejected')  ← fő mező
├── admin_notes text
├── reviewed_by uuid fk profiles
├── reviewed_at timestamptz
├── is_verified bool     ← legacy, trigger tartja szinkronban
├── verification_count int
├── reported_count int
├── created_at / updated_at
```

RLS — admin már mindent lát, update-el, delete-el.

---

## 5. Leaderboards tab

Két belső al-nézet (segment control a tab tetején, kliens state):

### 5.1 Global

Top 100 user XP szerint.

```sql
SELECT p.id, p.username, p.avatar_url, up.xp, up.current_streak, up.longest_streak
FROM user_progress up
JOIN profiles p ON p.id = up.user_id
ORDER BY up.xp DESC
LIMIT 100;
```

Tábla: rang, username, XP, streak, longest streak, badge count (`badge_*` oszlopok összegzése).

### 5.2 Per city

City-választó dropdown felül (cities táblából). Alatta: a kiválasztott city összes challenge-én teljesített attempt-ek összesítése userenként.

```sql
SELECT p.username, count(ca.id) AS completions,
       avg(ca.average_speed_kmh) AS avg_speed,
       sum(ca.distance_meters) AS total_distance
FROM challenge_attempts ca
JOIN daily_challenges dc ON dc.id = ca.challenge_id
JOIN profiles p ON p.id = ca.user_id
WHERE dc.city_id = $1 AND ca.status = 'completed'
GROUP BY p.username
ORDER BY completions DESC, avg_speed DESC
LIMIT 100;
```

Oszlopok: rang, username, teljesítések száma, átlagsebesség, össztáv.

**Eltávolíthatóság:** Ha egy admin gyanúsnak lát egy sort, kattint a „Láthatatlan" checkbox-ra a sor végén → `UPDATE challenge_attempts SET hidden_from_leaderboard = true WHERE id = $1`. A mobil leaderboard query már szűri ezt (ha nem, külön ticket). **Nem töröl, csak elrejt.**

> Az `admin-panel-spec.md`-ben szerepelt „suspicious attempts" kategória **nem implementálandó** — se a DB-ben, se a mobilban nincs ehhez flag-logika. Ha később kell, külön munka.

---

## 6. Cities tab

Egyszerű CRUD a `cities` táblán.

**Lista:**
| Név | Slug | Country | Center (lat, lng) | Aktív? | Challenge-ek | — |

- Challenge-ek: `count(*)` a `daily_challenges` táblán városonként
- Aktív toggle inline (optimista UPDATE)

**Új város modal (ugyanazon a tabon nyíló dialog, nem külön oldal):**
- name, name_en, slug, country_code (default `HU`), center_lat, center_lng, bbox (4 érték), timezone (default `Europe/Budapest`), is_active

**Nem kell** térkép-alapú bbox rajzolás — egyszerű input mezők. Ha később kell, v2.

**RLS:** `cities` táblán adminnak INSERT/UPDATE/DELETE — ha még nincs ilyen policy, hozd létre:

```sql
CREATE POLICY "Admins manage cities"
  ON public.cities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

---

## 7. Challenges tab

### 7.1 Lista

**Szűrők:** City dropdown, dátum range, `is_active`.

**Oszlopok:** dátum, city, hossz (km), elevation (m), `generation_source` (auto/manual), `is_active` toggle, attempt-ek száma (join `challenge_attempts`-re), megnyit gomb.

### 7.2 Detail (state-alapon a tabon belül)

**Bal (40%):**
- Challenge adatok: dátum, city, start/finish koordináták, táv, elevation, `generation_source`, `generated_at`
- Attempt-ek táblázat: username, status, distance, avg speed, duration, `xp_awarded`, `hidden_from_leaderboard` toggle
- Gombok: „Deaktiválás" (`is_active=false`), „Duplikáció másik napra" (opcionális v2)

**Jobb (60%):**
- Térkép a `route_geometry`-vel (ugyanaz a MapLibre mint 4.2-ben)
- Start/finish markerek (zöld/piros)
- Checkpoint markerek, ha a `route_points` jsonb-ben van ilyen

### 7.3 Új challenge

**Nem kell kézi rajzolás a panelben.** A challenge generálás egy másik rendszer / cron edge function feladata. A panel csak **megjeleníti és deaktivál**. Ha manuálisan kell újat létrehozni:
- Dátum + city választás → backend endpoint hívása, ami generál (későbbi munka)
- Ideiglenesen: nincs create gomb, csak lista + deaktiválás

---

## 8. Users tab — opcionális v2

Ha kell:
- Lista: email, username, regisztráció, utolsó aktivitás (devices.last_seen_at max), XP, role
- Szűrő: role (user/admin)
- Műveletek: role váltás (`profiles.role` update), ban (`auth.users` disable — service role kell → külön edge function)

**Első körben kihagyható.** Ha gyanús user van, nyisd a Supabase Studio-t.

---

## 9. Implementációs sorrend

Prioritás (fentről lefelé, megállhatsz bármelyiknél):

1. **Auth + sidebar shell** — login, role check, layout
2. **Community Routes lista + detail** — ez a leggyakoribb feladat lesz
3. **Dashboard** — 4-5 számláló
4. **Leaderboards** (Global + Per city)
5. **Cities CRUD**
6. **Challenges lista + detail** (read-only először)
7. Users (ha van kapacitás)

---

## 10. Amit **NEM** kell csinálni

- Automatikus cheat detekció / suspicious queue — nincs hozzá DB séma, nincs mobil integráció
- Push notification küldés a panelből — most nem
- Feedback inbox (bár a `feedback` tábla létezik — v2)
- POI flagek moderálás (a `poi_flags` tábla létezik — v2)
- Parking image submission review (létezik — v2)
- Cities térképes bbox-rajzolás
- Challenge kézi route-rajzolás
- Community route **rajzolása a mobilra** — az `accepted` route OSM-re megy, nem a mobil térképére

Ha ezekre később szükség van, **ne ebbe a doc-ba** tedd — külön spec.

---

## 11. Referencia: miért nincs suspicious queue

A jelenlegi mobil kód ([stores/challengeStore.ts:216-251](../../stores/challengeStore.ts#L216-L251)) a cheat-detekcióra csak ennyit csinál:
1. `abandonAttempt(id)` → `status = 'abandoned'`
2. `saveRideForChallenge(id, false)` → sima ride-ként menti, nem challenge-ként
3. UI-n „cheating detected" üzenet

**Nincs** `suspicious` státusz, **nincs** `flag_reason` oszlop, **nincs** szerver-oldali avg-speed check. Az [admin-panel-spec.md](./admin-panel-spec.md) „Suspicious Attempt Moderation" szekciója **csak terv**, nem implementált. Ezt a doc-ot felülírja ez a file — ha suspicious queue kell, az külön feature, saját spec-cel.
