"use client";

import { writeAuditLog } from "@/lib/adminAuditLog";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AdminRecordBrowser, { type RecordFilter } from "./AdminRecordBrowser";
import { applyRecordAction } from "./adminRecordMutations";

const isDev = process.env.NODE_ENV === "development";
type XpScope = "global" | "country" | "city";

type City = { id: string; name: string; country_code?: string | null };
type LeaderboardTabProps = {
  cities: City[];
  adminId: string | null;
  onOpenUser: (id: string) => void;
};
type XpRow = {
  rank: number;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  xp: number;
  home_city_name: string | null;
  country_code: string | null;
  show_on_regional_leaderboard: boolean;
  is_supporter: boolean;
};

export default function LeaderboardTab({
  cities,
  adminId,
  onOpenUser,
}: LeaderboardTabProps) {
  const [scope, setScope] = useState<XpScope>("global");
  const [cityId, setCityId] = useState("");
  const [country, setCountry] = useState("HU");
  const [includeOptedOut, setIncludeOptedOut] = useState(true);
  const [rows, setRows] = useState<XpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [refreshTick, setRefreshTick] = useState(0);
  const viewScope = useRef('');
  viewScope.current = JSON.stringify([scope,cityId,country,includeOptedOut,page,pageSize]);

  const countryCodes = useMemo(() => {
    const values = new Set(
      cities
        .map((city) => city.country_code)
        .filter((value): value is string => Boolean(value)),
    );
    if (values.size === 0) values.add("HU");
    return Array.from(values).sort();
  }, [cities]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (scope === "city" && !cityId) {
          if (!cancelled) setRows([]);
          return;
        }
        const { data, error } = await supabase.rpc(
          "admin_get_regional_leaderboard",
          {
            p_scope: scope,
            p_city_id: scope === "city" ? cityId : null,
            p_country_code: scope === "country" ? country : null,
            p_include_opted_out: includeOptedOut,
            p_limit: 200,
          },
        );
        if (error) throw error;
        if (!cancelled) setRows((data || []) as XpRow[]);
      } catch (error) {
        if (isDev) console.error(error);
        if (!cancelled) { setRows([]); toast.error("Hiba a ranglista betöltésekor"); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [scope, cityId, country, includeOptedOut, refreshTick]);

  useEffect(() => {
    setSelected(new Set());
    setPage(1);
  }, [scope, cityId, country, includeOptedOut]);
  useEffect(() => {
    setSelected(new Set());
  }, [page, pageSize]);
  const filters: RecordFilter[] = [
    {
      label: "Ranglista",
      value: scope,
      options: [
        { value: "global", label: "Globális" },
        { value: "country", label: "Országos" },
        { value: "city", label: "Városi" },
      ],
      onChange: (value) => setScope(value as XpScope),
    },
  ];
  if (scope === "country")
    filters.push({
      label: "Ország",
      value: country,
      options: countryCodes.map((value) => ({ value, label: value })),
      onChange: setCountry,
    });
  if (scope === "city")
    filters.push({
      label: "Város",
      value: cityId,
      options: [
        { value: "", label: "Válassz várost" },
        ...cities.map((city) => ({ value: city.id, label: city.name })),
      ],
      onChange: setCityId,
    });
  if (scope !== "global")
    filters.push({
      label: "Láthatóság",
      value: includeOptedOut ? "all" : "visible",
      options: [
        { value: "all", label: "Rejtett felhasználók is" },
        { value: "visible", label: "Csak láthatók" },
      ],
      onChange: (value) => setIncludeOptedOut(value === "all"),
    });
  return (
    <AdminRecordBrowser
      kind="leaderboard"
      title="Ranglista"
      rows={rows
        .slice((page - 1) * pageSize, page * pageSize)
        .map((row) => ({ ...row, id: row.user_id }))}
      total={rows.length}
      loading={loading}
      busy={busy}
      selected={selected}
      onSelect={setSelected}
      filters={filters}
      page={page}
      pages={Math.ceil(rows.length / pageSize)}
      pageSize={pageSize}
      onPage={setPage}
      onPageSize={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      onOpen={(row) => onOpenUser(row.user_id)}
      onAction={
        scope === "global"
          ? undefined
          : async (ids, value) => {
              if (
                lock.current ||
                ids.some((id) => !rows.some((row) => row.user_id === id))
              )
                return;
              lock.current = true;
              const origin = viewScope.current;
              setBusy(true);
              try {
                const result = await applyRecordAction(
                  supabase,
                  writeAuditLog,
                  "leaderboard",
                  ids,
                  value,
                  adminId || "",
                );
                if (origin === viewScope.current) setSelected(new Set(result.failed));
                if (result.succeeded.length)
                  toast.success(
                    `${result.succeeded.length} felhasználó láthatósága frissítve`,
                  );
                if (result.failed.length)
                  toast.error(`${result.failed.length} módosítás nem sikerült`);
                setRefreshTick((tick) => tick + 1);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "A módosítás nem sikerült.",
                );
              } finally {
                lock.current = false;
                setBusy(false);
              }
            }
      }
    />
  );
}
