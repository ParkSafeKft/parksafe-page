/* eslint-disable @typescript-eslint/no-explicit-any -- Adapts the existing admin API's heterogeneous records. */
export type AdminRecord = { id: string; [key: string]: any };
export type RecordOption = { value: string; label: string };
export const RECORD_COLLECTIONS = [
  "users",
  "parking",
  "services",
  "repair",
  "drinking_fountain",
  "cities",
  "feedback",
  "poi_flags",
  "poi_suggestions",
  "parking_images",
  "community_routes",
  "audit_log",
];
const options = (entries: Record<string, string>): RecordOption[] =>
  Object.entries(entries).map(([value, label]) => ({ value, label }));
export const RECORD_STATUSES: Record<string, RecordOption[]> = {
  users: options({ active: "Aktív", banned: "Letiltva" }),
  parking: options({ available: "Elérhető", unavailable: "Nem elérhető" }),
  cities: options({ active: "Aktív", inactive: "Inaktív" }),
  feedback: options({
    open: "Nyitott",
    in_progress: "Folyamatban",
    resolved: "Megoldva",
    closed: "Lezárt",
    duplicate: "Duplikált",
  }),
  poi_flags: options({
    pending: "Függőben",
    reviewed: "Áttekintve",
    resolved: "Megoldva",
    dismissed: "Elutasítva",
  }),
  poi_suggestions: options({
    pending: "Függőben",
    reviewed: "Áttekintve",
    approved: "Elfogadva feldolgozásra",
    rejected: "Elutasítva",
  }),
  parking_images: options({
    pending: "Függőben",
    approved: "Jóváhagyva",
    rejected: "Elutasítva",
  }),
  community_routes: options({
    pending: "Függőben",
    in_review: "Vizsgálat alatt",
    accepted: "Elfogadva",
    rejected: "Elutasítva",
  }),
  leaderboard: options({ visible: "Látható", hidden: "Elrejtve" }),
};
for (const kind of ["services", "repair", "drinking_fountain"])
  RECORD_STATUSES[kind] = RECORD_STATUSES.parking;
export function recordActions(kind: string) {
  const statuses = (RECORD_STATUSES[kind] || []).filter(
    (option) => kind !== "parking_images" || option.value !== "pending",
  );
  return kind === "users"
    ? [
        ...statuses,
        ...options({
          grant_supporter: "Támogatói jelvény megadása",
          revoke_supporter: "Támogatói jelvény visszavonása",
        }),
      ]
    : statuses;
}
export function recordStatus(kind: string, row: AdminRecord): string {
  if (kind === "users") return row.banned_at ? "banned" : "active";
  if (kind === "cities") return row.is_active ? "active" : "inactive";
  if (["parking", "services", "repair", "drinking_fountain"].includes(kind))
    return row.available === false ? "unavailable" : "available";
  if (kind === "leaderboard")
    return row.show_on_regional_leaderboard ? "visible" : "hidden";
  return row.status || "";
}
export function recordTitle(kind: string, row: AdminRecord): string {
  if (kind === "users" || kind === "leaderboard")
    return row.username || row.full_name || row.email || "Névtelen felhasználó";
  if (kind === "feedback") return row.title || "Visszajelzés";
  if (kind === "parking_images")
    return row.parking_name || "Beküldött parkolókép";
  if (kind === "poi_flags")
    return row.poi_name || row.name || "Helyszínbejelentés";
  if (kind === "audit_log") return row.action || "Naplóbejegyzés";
  if (kind === "ride_diagnostics")
    return (
      row.favorite_name ||
      (row.ride_type === "diagnostic"
        ? "Diagnosztikai próbálkozás"
        : "Mentett tekerés")
    );
  return row.name || "Névtelen rekord";
}
export const recordPerson = (row: AdminRecord) =>
  row.reporter_username ||
  row.reporter_full_name ||
  row.profiles?.username ||
  row.profiles?.full_name ||
  row.username ||
  row.user_id;
export const recordDate = (value: unknown) =>
  value && Number.isFinite(new Date(String(value)).getTime())
    ? new Date(String(value)).toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Nincs dátum";
export function recordCoordinates(
  row: AdminRecord,
): { lat: number; lon: number } | null {
  const valid = (lat: unknown, lon: unknown) =>
    lat != null &&
    lon != null &&
    String(lat).trim() !== "" &&
    String(lon).trim() !== "" &&
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lon)) &&
    Math.abs(Number(lat)) <= 90 &&
    Math.abs(Number(lon)) <= 180
      ? { lat: Number(lat), lon: Number(lon) }
      : null;
  const direct = valid(row.lat ?? row.latitude, row.lon ?? row.longitude);
  if (direct) return direct;
  const point = row.coordinate;
  if (point?.type === "Point" && Array.isArray(point.coordinates))
    return valid(point.coordinates[1], point.coordinates[0]);
  if (
    typeof point !== "string" ||
    !/^[0-9a-f]+$/i.test(point) ||
    point.length < 42
  )
    return null;
  try {
    const bytes = Uint8Array.from(point.match(/.{2}/g) || [], (hex) =>
      parseInt(hex, 16),
    );
    const view = new DataView(bytes.buffer),
      little = view.getUint8(0) === 1,
      type = view.getUint32(1, little);
    if ((type & 0xff) !== 1) return null;
    const offset = type & 0x20000000 ? 9 : 5;
    return valid(
      view.getFloat64(offset + 8, little),
      view.getFloat64(offset, little),
    );
  } catch {
    return null;
  }
}
export function recordMetadata(kind: string, row: AdminRecord): string {
  if (kind === "users") return row.email || row.id;
  if (kind === "leaderboard")
    return `#${row.rank} · ${Number(row.xp || 0).toLocaleString("hu-HU")} XP`;
  if (kind === "ride_diagnostics")
    return `${Number(row.distance_meters || 0).toLocaleString("hu-HU")} m · ${Number(row.duration_seconds || 0)} mp · ${Number(row.sample_total || 0)} minta`;
  if (kind === "feedback")
    return row.description || row.contact_email || row.id;
  if (kind === "audit_log") {
    if (row.action === "view_user_ride_diagnostics")
      return "Ride-előzmények és GPS/refinement metrikák megtekintve. Pontos útvonal nem lett lekérve.";
    if (row.action === "view_ride_location")
      return `Pontos rögzített és finomított GPS-útvonal megtekintve. Admin indoklása: ${row.notes || "nincs megadva"}`;
    return row.notes || row.target_id || row.id;
  }
  return (
    row.city || row.parking_city || row.comment || row.description || row.id
  );
}
export function recordCsv(kind: string, rows: AdminRecord[]): string {
  const cell = (value: unknown) =>
    '"' +
    String(value ?? "")
      .replace(/^[\t\r\n]|^\s*[=+@\-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return (
    "\uFEFF" +
    [
      [
        "Azonosító",
        "Megnevezés",
        "Állapot",
        "Dátum",
        "Felhasználó",
        "Kapcsolódó rekord",
        "Megjegyzés",
      ],
      ...rows.map((row) => [
        row.id,
        recordTitle(kind, row),
        recordStatus(kind, row),
        row.created_at || row.started_at || "",
        row.user_id || row.admin_id || "",
        row.poi_id || row.parking_spot_id || row.target_id || "",
        recordMetadata(kind, row),
      ]),
    ]
      .map((row) => row.map(cell).join(";"))
      .join("\r\n")
  );
}

export function recordTone(status: string): string {
  if (
    [
      "active",
      "available",
      "visible",
      "accepted",
      "approved",
      "resolved",
    ].includes(status)
  )
    return "success";
  if (["open", "pending"].includes(status)) return "warning";
  if (["in_review", "in_progress", "reviewed"].includes(status)) return "info";
  if (
    [
      "banned",
      "unavailable",
      "inactive",
      "hidden",
      "rejected",
      "dismissed",
      "duplicate",
    ].includes(status)
  )
    return "danger";
  return "neutral";
}
