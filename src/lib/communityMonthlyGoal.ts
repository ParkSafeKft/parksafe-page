export type MonthlyGoalSnapshot = {
    month_key: string;
    timezone: 'Europe/Budapest';
    period_start: string;
    period_end: string;
    computed_at: string;
} & ({ enabled: true; target_distance_meters: number; total_distance_meters: number } |
    { enabled: false; target_distance_meters: null; total_distance_meters: null });

export interface MonthlyGoalConfig {
    month_start: string;
    target_meters: number;
    enabled: boolean;
    updated_at: string;
}

export function validGoalMonth(value: unknown): value is string {
    return typeof value === 'string' && /^20\d{2}-(0[1-9]|1[0-2])$/.test(value);
}

export function goalMeters(kilometers: unknown): number | null {
    if (typeof kilometers !== 'string' || kilometers.length > 24 || !/^\d+(?:[.,]\d{1,3})?$/.test(kilometers.trim())) return null;
    const [whole, fraction = ''] = kilometers.trim().replace(',', '.').split('.');
    const meters = BigInt(whole) * BigInt(1000) + BigInt(fraction.padEnd(3, '0'));
    return meters > 0 && meters <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(meters) : null;
}

export function goalKilometersInput(meters: number): string {
    const digits = String(meters).padStart(4, '0');
    return `${digits.slice(0, -3)}.${digits.slice(-3)}`.replace(/\.?0+$/, '');
}

export function goalProgress(snapshot: Extract<MonthlyGoalSnapshot, { enabled: true }>) {
    const ratio = snapshot.total_distance_meters / snapshot.target_distance_meters;
    return {
        percent: Math.floor(ratio * 1000) / 10,
        bar: Math.min(100, ratio * 100),
        completed: snapshot.total_distance_meters >= snapshot.target_distance_meters,
        remainingKm: Math.max(0, snapshot.target_distance_meters - snapshot.total_distance_meters) / 1000,
    };
}

export function validGoalSnapshot(value: unknown): value is MonthlyGoalSnapshot {
    if (!value || typeof value !== 'object') return false;
    const v = value as MonthlyGoalSnapshot;
    const times = [v.period_start, v.period_end, v.computed_at].map(value => typeof value === 'string' ? Date.parse(value) : NaN);
    if (!validGoalMonth(v.month_key) || v.timezone !== 'Europe/Budapest' || !times.every(Number.isFinite) ||
        !(times[0] <= times[2] && times[2] < times[1])) return false;
    if (v.enabled === false) return v.target_distance_meters === null && v.total_distance_meters === null;
    return v.enabled === true && Number.isSafeInteger(v.target_distance_meters) && v.target_distance_meters > 0 &&
        typeof v.total_distance_meters === 'number' && Number.isFinite(v.total_distance_meters) &&
        v.total_distance_meters >= 0 && v.total_distance_meters <= Number.MAX_SAFE_INTEGER;
}
