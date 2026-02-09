# Device Tracking Statistics Integration - Admin Dashboard

## Cél

Integráld a ParkSafe admin oldalba a device tracking statisztikákat, hogy valós időben lásd az app telepítéseket és felhasználói metrikákat SQL futtatás nélkül.

## Megjelenítendő Metrikák

A következő statisztikákat kell megjeleníteni a dashboardon:

### Összesített Metrikák (Cards/Widgets)
1. **Összes Eszköz** - Összes egyedi device_id (telepítések száma)
2. **Regisztrált Felhasználók** - Eszközök amelyekhez user_id tartozik
3. **Vendég Felhasználók** - Eszközök amelyek user_id nélkül vannak (guest mode)
4. **iOS Eszközök** - Platform = 'ios'
5. **Android Eszközök** - Platform = 'android'
6. **Web Eszközök** - Platform = 'web'
7. **Aktív (7 nap)** - Eszközök amelyek az utóbbi 7 napban aktívak voltak
8. **Aktív (30 nap)** - Eszközök amelyek az utóbbi 30 napban aktívak voltak

### Kalkulált Metrikák
- **Konverziós Ráta**: (Regisztrált / Összes) × 100%
- **Platform Megoszlás**: iOS/Android/Web százalékos eloszlás
- **Retention**: Aktív 7 nap / Aktív 30 nap arány

## Technikai Implementáció

### 1. Supabase Function Hívás

A ParkSafe backend-ben már létezik egy `get_device_stats()` Supabase function. Ezt kell meghívni:

**Supabase Setup:**
- Project URL: `https://xkboeigznjtpdycqfzyq.supabase.co`
- Service Role Key szükséges (admin hozzáféréshez)
- Function neve: `get_device_stats()`

**Function Response Schema:**
```typescript
interface DeviceStats {
  total_devices: number;
  registered_users: number;
  guest_users: number;
  ios_devices: number;
  android_devices: number;
  web_devices: number;
  active_last_7_days: number;
  active_last_30_days: number;
}
```

**Példa hívás (JavaScript/TypeScript):**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xkboeigznjtpdycqfzyq.supabase.co',
  'YOUR_SERVICE_ROLE_KEY' // Service role key szükséges
);

async function getDeviceStats() {
  const { data, error } = await supabase.rpc('get_device_stats');

  if (error) {
    console.error('Error fetching device stats:', error);
    return null;
  }

  // data egy tömb, az első elem tartalmazza a statisztikákat
  return data[0];
}
```

### 2. UI Komponensek

**Dashboard Layout Javaslat:**

```
┌─────────────────────────────────────────────────┐
│           Device Tracking Overview              │
├──────────┬──────────┬──────────┬───────────────┤
│ Összes   │ Regiszt. │ Vendég   │ Konverzió     │
│ Eszköz   │ User     │ User     │ Ráta          │
│  1,234   │   856    │   378    │   69.4%       │
└──────────┴──────────┴──────────┴───────────────┘

┌─────────────────────────────────────────────────┐
│         Platform Megoszlás (Chart)              │
│  🍎 iOS: 45%  🤖 Android: 50%  🌐 Web: 5%      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              Aktivitás (Chart)                  │
│  📊 Aktív 7 nap: 890  |  Aktív 30 nap: 1,100   │
└─────────────────────────────────────────────────┘
```

**Statisztika Card Példa (React):**
```tsx
<div className="stats-grid">
  <StatCard
    title="Összes Eszköz"
    value={stats.total_devices}
    icon="📱"
    description="Összes telepítés"
  />
  <StatCard
    title="Regisztrált User"
    value={stats.registered_users}
    icon="👤"
    description="Fiókkal rendelkezők"
  />
  <StatCard
    title="Vendég User"
    value={stats.guest_users}
    icon="👻"
    description="Fiók nélkül böngészők"
  />
  <StatCard
    title="Konverziós Ráta"
    value={`${((stats.registered_users / stats.total_devices) * 100).toFixed(1)}%`}
    icon="📈"
    description="Guest → Regisztráció"
  />
</div>
```

### 3. Real-time Frissítés (Opcionális)

**Polling verzió** (egyszerűbb):
```typescript
useEffect(() => {
  // Frissítés 30 másodpercenként
  const interval = setInterval(() => {
    fetchDeviceStats();
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

**Supabase Realtime verzió** (haladó):
```typescript
// Figyelés a devices tábla változásaira
supabase
  .channel('device-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'devices' },
    () => {
      // Újra lekérdezés ha változás történt
      fetchDeviceStats();
    }
  )
  .subscribe();
```

### 4. Részletes Device Lista (Opcionális)

Ha részletes listát is szeretnél megjeleníteni:

**Query:**
```typescript
async function getDeviceList(filters?: {
  platform?: 'ios' | 'android' | 'web';
  hasUser?: boolean;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('devices')
    .select('*')
    .order('last_seen_at', { ascending: false });

  if (filters?.platform) {
    query = query.eq('platform', filters.platform);
  }

  if (filters?.hasUser !== undefined) {
    query = filters.hasUser
      ? query.not('user_id', 'is', null)
      : query.is('user_id', null);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  return { data, error };
}
```

**Táblázat Mezők:**
- Device ID (részlet: első 8 karakter)
- Platform (ikon: 🍎/🤖/🌐)
- User ID (van/nincs)
- App Verzió
- Utoljára Látva (relatív: "2 órája", "3 napja")
- Első Látás Dátum

### 5. Chart/Grafikon Ötletek

**Pie Chart - Platform Megoszlás:**
```typescript
const platformData = [
  { name: 'iOS', value: stats.ios_devices },
  { name: 'Android', value: stats.android_devices },
  { name: 'Web', value: stats.web_devices }
];
```

**Bar Chart - Guest vs Registered:**
```typescript
const userTypeData = [
  { name: 'Vendég', value: stats.guest_users },
  { name: 'Regisztrált', value: stats.registered_users }
];
```

**Line Chart - Aktivitás Trend (Időbeli):**
Ehhez külön query kell napi bontásban:
```sql
SELECT
  DATE(first_seen_at) as date,
  COUNT(*) as new_devices
FROM devices
WHERE first_seen_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(first_seen_at)
ORDER BY date;
```

## Példa Komponens Struktúra

```tsx
// DeviceStatsOverview.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DeviceStats {
  total_devices: number;
  registered_users: number;
  guest_users: number;
  ios_devices: number;
  android_devices: number;
  web_devices: number;
  active_last_7_days: number;
  active_last_30_days: number;
}

export function DeviceStatsOverview() {
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    const { data, error } = await supabase.rpc('get_device_stats');

    if (!error && data && data.length > 0) {
      setStats(data[0]);
    }

    setLoading(false);
  }

  if (loading) return <div>Betöltés...</div>;
  if (!stats) return <div>Nincs adat</div>;

  const conversionRate = ((stats.registered_users / stats.total_devices) * 100).toFixed(1);

  return (
    <div className="device-stats">
      <h2>Device Tracking Statisztikák</h2>

      <div className="stats-grid">
        <StatCard
          title="Összes Eszköz"
          value={stats.total_devices.toLocaleString()}
          icon="📱"
        />
        <StatCard
          title="Regisztrált User"
          value={stats.registered_users.toLocaleString()}
          icon="👤"
        />
        <StatCard
          title="Vendég User"
          value={stats.guest_users.toLocaleString()}
          icon="👻"
        />
        <StatCard
          title="Konverziós Ráta"
          value={`${conversionRate}%`}
          icon="📈"
        />
      </div>

      <div className="platform-stats">
        <h3>Platform Megoszlás</h3>
        <div>🍎 iOS: {stats.ios_devices}</div>
        <div>🤖 Android: {stats.android_devices}</div>
        <div>🌐 Web: {stats.web_devices}</div>
      </div>

      <div className="activity-stats">
        <h3>Aktivitás</h3>
        <div>Aktív (7 nap): {stats.active_last_7_days}</div>
        <div>Aktív (30 nap): {stats.active_last_30_days}</div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
```

## Environment Variables

Add hozzá az admin oldal `.env` fájlhoz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xkboeigznjtpdycqfzyq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Fontos:** A Service Role Key-t SOHA ne tedd publikusssá! Csak szerver oldalon használd (API routes, server components).

## Security Best Practices

1. **Service Role Key**: Csak backend-en használd, soha ne kerüljön a kliensre
2. **API Route**: Készíts egy `/api/device-stats` endpoint-ot ami szerver oldalon hívja a Supabase-t
3. **Authentication**: Admin dashboard csak autentikált admin felhasználóknak legyen elérhető
4. **Rate Limiting**: Korlátozd a stat query-k gyakoriságát

**Példa API Route (Next.js):**
```typescript
// pages/api/device-stats.ts
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Check admin authentication
  // ... auth logic ...

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.rpc('get_device_stats');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data[0]);
}
```

## Tesztelés

1. Hívd meg a `get_device_stats()` function-t a Supabase SQL Editor-ban először
2. Ellenőrizd az API response formátumot
3. Teszteld a dashboard-ot különböző adatokkal
4. Ellenőrizd a refresh mechanizmust

## Extra Feature Ötletek

- **Export CSV**: Eszköz lista exportálás Excel-be
- **Trend Chart**: Napi új telepítések grafikonon
- **Device Details Modal**: Kattintható eszköz lista részletekkel
- **Filter Panel**: Szűrés platform, user type, dátum szerint
- **Notifications**: Alert ha konverziós ráta 50% alá esik

## Quick Test Query

Teszteléshez futtasd ezt a Supabase SQL Editor-ban:

```sql
-- Test the device stats function
SELECT * FROM get_device_stats();
```

Expected output:
```json
{
  "total_devices": 0,
  "registered_users": 0,
  "guest_users": 0,
  "ios_devices": 0,
  "android_devices": 0,
  "web_devices": 0,
  "active_last_7_days": 0,
  "active_last_30_days": 0
}
```

(Az értékek nullák lesznek amíg nem indítod el az appot és nem regisztrálódnak eszközök)

---

**Ezt a dokumentumot add át a fejlesztőnek aki az admin oldalt csinálja. Minden szükséges információ benne van az integrációhoz!** 🚀
