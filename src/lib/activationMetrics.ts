export const ANALYTICS_TIMEZONE = 'Europe/Budapest';
export type RegistrationPreset = '30' | '90' | 'all';

export function registrationPeriod(preset: RegistrationPreset, now: Date, firstRegistration?: string | null) {
    const to = budapestDate(now);
    if (preset === 'all') return { from: firstRegistration ? budapestDate(new Date(firstRegistration)) : to, to };
    const start = new Date(`${to}T12:00:00Z`);
    start.setUTCDate(start.getUTCDate() - (Number(preset) - 1));
    return { from: start.toISOString().slice(0, 10), to };
}

export type ActivationMetrics = {
    registration_from: string;
    registration_to: string;
    cutoff: string;
    timezone: string;
    window_hours: number;
    cohort_users: number;
    activation: { numerator: number; denominator: number; percent: number | null };
    return: { numerator: number; denominator: number; percent: number | null };
    first_ride: { median_seconds: number | null; sample_users: number };
};

export function budapestDate(date: Date) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: ANALYTICS_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(date);
}

export function validDate(value: string | null): value is string {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function formatMedianTime(seconds: number | null) {
    if (seconds === null) return 'Nincs adat';
    const minutes = seconds / 60;
    const number = (value: number) => value.toLocaleString('hu-HU', { maximumFractionDigits: 1 });
    if (minutes < 1) return '1 percnél kevesebb';
    if (minutes < 60) return `${number(minutes)} perc`;
    if (minutes < 1440) return `${number(minutes / 60)} óra`;
    return `${number(minutes / 1440)} nap`;
}
