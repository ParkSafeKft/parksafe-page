/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { writeAuditLog } from "@/lib/adminAuditLog";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminRecordBrowser from "./AdminRecordBrowser";
import type { AdminRideRecord } from "./RideDetailContent";

type Row = Record<string, any> &
  AdminRideRecord & { ride_type: "normal" | "diagnostic" };

const normalSelect =
  "id,user_id,client_ride_id,started_at,created_at,duration_seconds,moving_time_seconds,distance_meters,track_samples,average_speed_kmh,max_speed_kmh,elevation_gain_meters,favorite_name";
const diagnosticSelect =
  "id,client_ride_id,user_id,started_at,created_at,duration_seconds,moving_time_seconds,distance_meters,raw_sample_count,rejection_counts,reason,model";

const number = (value: unknown) => (value == null ? 0 : Number(value) || 0);

export default function RideDiagnosticsTab({
  onOpenRide,
  onOpenUser,
}: {
  onOpenRide: (ride: AdminRideRecord) => void;
  onOpenUser?: (id: string) => void;
}) {
  const { user } = useAuth();
  const rideId = useSearchParams().get("ride");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    setSelected(new Set());
  }, [page, pageSize, query, type]);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [normal, diagnostic] = await Promise.all([
      supabase
        .from("ride_summaries")
        .select(normalSelect)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("discarded_ride_diagnostics")
        .select(diagnosticSelect)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    if (normal.error || diagnostic.error) {
      setRows([]);
      setError(
        "A diagnosztikai adatforrás vagy az admin RLS-hozzáférés hiányzik.",
      );
      setLoading(false);
      return;
    }
    const saved = (normal.data || []).map((row: any) => ({
      ...row,
      ride_type: "normal",
      sample_total: Array.isArray(row.track_samples)
        ? row.track_samples.length
        : 0,
      sample_accepted: Array.isArray(row.track_samples)
        ? row.track_samples.length
        : 0,
      sample_rejected: 0,
    }));
    const discarded = (diagnostic.data || []).map((row: any) => ({
      ...row,
      ride_type: "diagnostic",
      sample_total: number(row.raw_sample_count),
      sample_accepted: 0,
      sample_rejected: Object.values(row.rejection_counts || {}).reduce(
        (sum: number, value: any) => sum + number(value),
        0,
      ),
    }));
    setRows(
      [...saved, ...discarded].sort(
        (a, b) =>
          new Date(b.started_at || b.created_at || 0).getTime() -
          new Date(a.started_at || a.created_at || 0).getTime(),
      ),
    );
    setLoading(false);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          (type === "all" || row.ride_type === type) &&
          (!query ||
            JSON.stringify(row).toLowerCase().includes(query.toLowerCase())),
      ),
    [rows, type, query],
  );
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const openDetails = useCallback(
    (row: Row) => {
      const record = { ...row };
      delete record.track_samples;
      onOpenRide(record);
      void writeAuditLog({
        adminId: user?.id,
        action: "view_ride_diagnostic",
        targetType: "ride",
        targetId: String(row.id || row.client_ride_id),
        notes: "Diagnosztikai részletek megtekintve.",
      });
    },
    [user?.id, onOpenRide],
  );

  useEffect(() => {
    if (!rideId) return;
    let cancelled = false;
    const openRide = async () => {
      try {
        const { data, error } = await supabase
          .from("ride_summaries")
          .select(normalSelect)
          .eq("id", rideId)
          .single();
        if (error || !data)
          throw new Error("A kiválasztott ride nem tölthető be.");
        if (cancelled) return;
        const samples = Array.isArray(data.track_samples)
          ? data.track_samples.length
          : 0;
        openDetails({
          ...data,
          ride_type: "normal",
          sample_total: samples,
          sample_accepted: samples,
          sample_rejected: 0,
        });
      } catch {
        if (!cancelled)
          setError("A kiválasztott ride nem található vagy nem érhető el.");
      }
    };
    void openRide();
    return () => {
      cancelled = true;
    };
  }, [rideId, openDetails]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {error ? (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={() => void load()}>
            Újrapróbálás
          </button>
        </p>
      ) : null}
      <AdminRecordBrowser
        kind="ride_diagnostics"
        title="Ride diagnosztika"
        rows={pageRows}
        total={filtered.length}
        loading={loading}
        selected={selected}
        onSelect={setSelected}
        filters={[
          {
            label: "Típus",
            value: type,
            onChange: (value) => {
              setType(value);
              setPage(1);
            },
            options: [
              { value: "all", label: "Mind" },
              { value: "normal", label: "Mentett tekerés" },
              { value: "diagnostic", label: "Diagnosztikai" },
            ],
          },
        ]}
        extraFilters={
          <>
            <label>
              <span>Keresés</span>
              <input
                aria-label="Ride keresése"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Ride, felhasználó, modell…"
              />
            </label>
            <button type="button" onClick={() => void load()}>
              Frissítés
            </button>
          </>
        }
        page={page}
        pages={Math.ceil(filtered.length / pageSize)}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onOpen={(row) => openDetails(row as Row)}
        onUser={onOpenUser}
      />
    </div>
  );
}
