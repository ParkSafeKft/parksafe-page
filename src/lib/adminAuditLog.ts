import { supabase } from '@/lib/supabaseClient';

export type AuditAction =
    | 'hide_from_leaderboard'
    | 'show_on_leaderboard'
    | 'ban_user'
    | 'unban_user'
    | 'toggle_city_active'
    | 'toggle_challenge_active'
    | 'delete_challenge'
    | 'delete_city'
    | 'community_route_status'
    | 'delete_community_route'
    | 'create_city'
    | 'update_city';

export type AuditTargetType =
    | 'challenge_attempt'
    | 'user'
    | 'daily_challenge'
    | 'city'
    | 'community_bike_lane';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Best-effort audit log writer. Failures are logged in dev but do not throw —
 * the audit log must never block the user-facing action.
 */
export async function writeAuditLog(params: {
    adminId: string | null | undefined;
    action: AuditAction;
    targetType: AuditTargetType;
    targetId: string;
    notes?: string | null;
}): Promise<void> {
    if (!params.adminId) {
        if (isDev) console.warn('writeAuditLog: missing adminId, skipping');
        return;
    }
    try {
        const { error } = await supabase.from('admin_audit_log').insert({
            admin_id: params.adminId,
            action: params.action,
            target_type: params.targetType,
            target_id: params.targetId,
            notes: params.notes ?? null,
        });
        if (error && isDev) console.error('Audit log insert failed:', error);
    } catch (err) {
        if (isDev) console.error('Audit log insert exception:', err);
    }
}
