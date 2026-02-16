'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface UseRealtimeSubscriptionOptions {
  table: string;
  schema?: string;
  event?: PostgresChangeEvent | '*';
  onchange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  enabled?: boolean;
}

/**
 * Custom hook that subscribes to Supabase Realtime changes on a given table.
 * When a change is detected, it calls the provided `onchange` callback.
 * 
 * Also exposes a `lastEvent` state that can be used to trigger re-fetches,
 * and an `isSubscribed` boolean to show connection status.
 */
export function useRealtimeSubscription({
  table,
  schema = 'public',
  event = '*',
  onchange,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<{
    eventType: string;
    table: string;
    timestamp: number;
  } | null>(null);

  const stableOnChange = useRef(onchange);
  stableOnChange.current = onchange;

  const subscribe = useCallback(() => {
    if (!enabled || !table) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsSubscribed(false);
    }

    const channelName = `admin-realtime-${table}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as const,
        {
          event,
          schema,
          table,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          setLastEvent({
            eventType: payload.eventType,
            table: payload.table,
            timestamp: Date.now(),
          });

          stableOnChange.current?.(payload);
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;
  }, [enabled, table, schema, event]);

  useEffect(() => {
    subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsSubscribed(false);
      }
    };
  }, [subscribe]);

  return { isSubscribed, lastEvent };
}

interface UseMultiTableRealtimeOptions {
  tables: string[];
  schema?: string;
  onchange?: (table: string, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  enabled?: boolean;
}

/**
 * Subscribe to multiple tables at once on a single channel.
 * Useful for the admin dashboard where we want to listen to all tables.
 */
export function useMultiTableRealtime({
  tables,
  schema = 'public',
  onchange,
  enabled = true,
}: UseMultiTableRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<{
    eventType: string;
    table: string;
    timestamp: number;
  } | null>(null);

  const stableOnChange = useRef(onchange);
  stableOnChange.current = onchange;

  const tablesKey = tables.sort().join(',');

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsSubscribed(false);
    }

    const channelName = `admin-multi-realtime-${Date.now()}`;
    let channel = supabase.channel(channelName);

    for (const table of tables) {
      channel = channel.on(
        'postgres_changes' as const,
        {
          event: '*',
          schema,
          table,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          setLastEvent({
            eventType: payload.eventType,
            table: payload.table,
            timestamp: Date.now(),
          });

          stableOnChange.current?.(payload.table, payload);
        }
      );
    }

    channel.subscribe((status) => {
      setIsSubscribed(status === 'SUBSCRIBED');
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsSubscribed(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tablesKey, schema]);

  return { isSubscribed, lastEvent };
}
