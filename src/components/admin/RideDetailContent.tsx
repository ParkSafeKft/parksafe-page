'use client';

import { useEffect, useState } from 'react';
import { Bike, Copy, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AdminModalBody, AdminModalHeader, AdminModalRelations, AdminModalSection, AdminRelationCard } from './AdminModal';
import { toast } from 'sonner';

export interface AdminRideRecord {
    id: string;
    user_id?: string | null;
    client_ride_id?: string | null;
    ride_type?: 'normal' | 'diagnostic';
    started_at?: string | null;
    created_at?: string | null;
    duration_seconds?: number | null;
    moving_time_seconds?: number | null;
    distance_meters?: number | null;
    average_speed_kmh?: number | null;
    max_speed_kmh?: number | null;
    elevation_gain_meters?: number | null;
    favorite_name?: string | null;
    sample_total?: number | null;
    sample_accepted?: number | null;
    sample_rejected?: number | null;
    raw_sample_count?: number | null;
    rejection_counts?: Record<string, number> | null;
    reason?: string | null;
    model?: string | null;
}

const number = (value: number | null | undefined, suffix = '') => value == null ? 'Nincs adat' : value.toLocaleString('hu-HU', { maximumFractionDigits: 1 }) + suffix;
const date = (value?: string | null) => value ? new Date(value).toLocaleString('hu-HU', { dateStyle: 'medium', timeStyle: 'short' }) : 'Nincs adat';
const duration = (value?: number | null) => {
    if (value == null) return 'Nincs adat';
    const hours = Math.floor(value / 3600), minutes = Math.floor((value % 3600) / 60), seconds = Math.round(value % 60);
    return hours ? `${hours} ó ${minutes} p` : minutes ? `${minutes} p${seconds ? ` ${seconds} mp` : ''}` : `${seconds} mp`;
};

export default function RideDetailContent({ ride, onBack, backLabel, onOpenUser }: {
    ride: AdminRideRecord;
    onBack?: () => void;
    backLabel?: string;
    onOpenUser?: (id: string) => void;
}) {
    const [person, setPerson] = useState<{ id: string; username: string | null; full_name: string | null } | null>(null);
    useEffect(() => {
        let cancelled = false;
        if (ride.user_id) void (async () => {
            const { data } = await supabase.from('profiles').select('id,username,full_name').eq('id', ride.user_id).maybeSingle();
            if (!cancelled) setPerson(data);
        })();
        return () => { cancelled = true; };
    }, [ride.user_id]);
    const diagnostic = ride.ride_type === 'diagnostic';
    const personName = person && person.id === ride.user_id ? person.username || person.full_name || ride.user_id : ride.user_id;
    return <>
        <AdminModalHeader title={ride.favorite_name || (diagnostic ? 'Diagnosztikai próbálkozás' : 'Tekerés részletei')}
            eyebrow={diagnostic ? 'El nem mentett tekerés' : 'Mentett tekerés'} icon={Bike}
            subtitle={date(ride.started_at || ride.created_at)} onBack={onBack} backLabel={backLabel}
            meta={<><code>{ride.id}</code><button type="button" className="admin-modal-meta-action" aria-label="Tekerésazonosító másolása"
                onClick={() => void navigator.clipboard.writeText(ride.id).then(() => toast.success('ID másolva'), () => toast.error('Másolás sikertelen'))}><Copy aria-hidden="true" /></button></>} />
        <AdminModalBody className="space-y-6">
            <AdminModalRelations><AdminRelationCard label="Tekerő" title={personName || 'Nincs kapcsolt felhasználó'}
                description={person?.id === ride.user_id ? ride.user_id : undefined} icon={<UserRound />}
                onClick={ride.user_id && onOpenUser ? () => onOpenUser(ride.user_id!) : undefined} /></AdminModalRelations>
            <AdminModalSection title="Tekerés adatai"><dl className="admin-ride-summary">
                <div><dt>Megtett távolság</dt><dd>{number(ride.distance_meters == null ? null : ride.distance_meters / 1000, ' km')}</dd></div>
                <div><dt>Rögzített idő</dt><dd>{duration(ride.duration_seconds)}</dd></div>
                <div><dt>Mozgásban töltött idő</dt><dd>{duration(ride.moving_time_seconds)}</dd></div>
                <div><dt>Átlagsebesség</dt><dd>{number(ride.average_speed_kmh, ' km/h')}</dd></div>
                <div><dt>Legnagyobb sebesség</dt><dd>{number(ride.max_speed_kmh, ' km/h')}</dd></div>
                <div><dt>Szintemelkedés</dt><dd>{number(ride.elevation_gain_meters, ' m')}</dd></div>
            </dl></AdminModalSection>
            <AdminModalSection title="Technikai adatok"><dl className="ride-diagnostic-modal-grid">
                <div><dt>Client ride ID</dt><dd>{ride.client_ride_id || 'Nincs adat'}</dd></div>
                <div><dt>Mentés időpontja</dt><dd>{date(ride.created_at)}</dd></div>
                <div><dt>Összes minta</dt><dd>{number(ride.sample_total ?? ride.raw_sample_count)}</dd></div>
                <div><dt>Elfogadott / elutasított minták</dt><dd>{number(ride.sample_accepted)} / {number(ride.sample_rejected)}</dd></div>
                {diagnostic ? <><div><dt>Elutasítás oka</dt><dd>{ride.reason || 'Nincs adat'}</dd></div><div><dt>Készülék</dt><dd>{ride.model || 'Nincs adat'}</dd></div></> : null}
            </dl></AdminModalSection>
            {diagnostic && Object.keys(ride.rejection_counts || {}).length > 0 ? <AdminModalSection title="Elutasított minták okai"><dl className="ride-diagnostic-modal-grid">
                {Object.entries(ride.rejection_counts || {}).map(([reason, count]) => <div key={reason}><dt>{reason}</dt><dd>{number(count)}</dd></div>)}
            </dl></AdminModalSection> : null}
        </AdminModalBody>
    </>;
}
