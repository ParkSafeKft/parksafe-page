"use client";
import { useId, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Loader2,
  Pencil,
  SearchX,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  RECORD_STATUSES,
  recordCoordinates,
  recordMetadata,
  recordActions,
  recordCsv,
  recordDate,
  recordPerson,
  recordStatus,
  recordTone,
  recordTitle,
  type AdminRecord,
} from "./adminRecordModel";
import styles from "./AdminRecordBrowser.module.css";
export type RecordFilter = {
  label: string;
  value: string;
  options?: { value: string; label: string }[];
  type?: "date";
  onChange: (value: string) => void;
};
type Props = {
  kind: string;
  rows: AdminRecord[];
  title: string;
  total: number;
  loading?: boolean;
  busy?: boolean;
  selected: Set<string>;
  onSelect: (ids: Set<string>) => void;
  filters?: RecordFilter[];
  extraFilters?: ReactNode;
  page: number;
  pages: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  sort?: { key: string; direction: string };
  onSort?: (key: string) => void;
  onOpen?: (row: AdminRecord) => void;
  onEdit?: (row: AdminRecord) => void;
  onDelete?: (row: AdminRecord) => void;
  onUser?: (id: string) => void;
  onPoi?: (id: string, type: string) => void;
  onRide?: (id: string) => void;
  onAction?: (ids: string[], value: string) => Promise<void>;
};
function Selection({
  checked,
  partial,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { partial?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label>
      <input
        ref={(node) => {
          ref.current = node;
          if (node) node.indeterminate = Boolean(partial);
        }}
        type="checkbox"
        checked={checked}
        {...props}
      />
    </label>
  );
}
export default function AdminRecordBrowser({
  kind,
  rows,
  title,
  total,
  loading = false,
  busy = false,
  selected,
  onSelect,
  filters = [],
  extraFilters,
  page,
  pages,
  pageSize,
  onPage,
  onPageSize,
  sort,
  onSort,
  onOpen,
  onEdit,
  onDelete,
  onUser,
  onPoi,
  onRide,
  onAction,
}: Props) {
  const [action, setAction] = useState(""),
    [notice, setNotice] = useState("");
  const id = useId(),
    choices = RECORD_STATUSES[kind] || [],
    actions = recordActions(kind);
  const visibleSelected = rows.filter((row) => selected.has(row.id));
  const all = rows.length > 0 && visibleSelected.length === rows.length;
  const toggle = (rowId: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(rowId);
    else next.delete(rowId);
    onSelect(next);
  };
  const exportSelected = () => {
    const url = URL.createObjectURL(
      new Blob([recordCsv(kind, visibleSelected)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `parksafe-${kind}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`${visibleSelected.length} rekord exportálva.`);
  };
  const apply = async () => {
    if (!onAction || !action) return;
    try {
      await onAction(
        visibleSelected.map((row) => row.id),
        action,
      );
      setAction("");
    } catch {
      setNotice("A módosítás nem sikerült.");
    }
  };
  return (
    <section
      className={styles.browser}
      aria-label={title}
      aria-busy={loading || busy}
    >
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {filters.map((filter, index) => (
            <label key={filter.label} htmlFor={`${id}-${index}`}>
              <span>{filter.label}</span>
              {filter.type === "date" ? (
                <input
                  id={`${id}-${index}`}
                  type="date"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                />
              ) : (
                <select
                  id={`${id}-${index}`}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                >
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </label>
          ))}
          {extraFilters}
        </div>
        <button
          type="button"
          className={styles.selectPage}
          aria-pressed={all}
          disabled={busy || loading || !rows.length}
          onClick={() =>
            onSelect(all ? new Set() : new Set(rows.map((row) => row.id)))
          }
        >
          {all ? "Kijelölés törlése" : "Oldal kijelölése"}
        </button>
        <span className={styles.total}>
          {total.toLocaleString("hu-HU")} rekord
        </span>
      </div>
      {visibleSelected.length > 0 ? (
        <div
          className={styles.selection}
          data-selected={visibleSelected.length > 0}
        >
          <span>
            <Check aria-hidden="true" />
            {visibleSelected.length
              ? `${visibleSelected.length} kijelölve ezen az oldalon`
              : "Jelölj ki rekordokat a tömeges műveletekhez"}
          </span>
          <div>
            <button
              type="button"
              className={styles.mobileSelect}
              disabled={busy || loading || !rows.length}
              aria-pressed={all}
              onClick={() =>
                onSelect(all ? new Set() : new Set(rows.map((row) => row.id)))
              }
            >
              {all ? "Kijelölés törlése" : "Összes kijelölése"}
            </button>
            {onAction && actions.length > 0 && visibleSelected.length > 0 ? (
              <>
                <select
                  aria-label="Tömeges művelet"
                  value={action}
                  disabled={busy || loading || !visibleSelected.length}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option value="">Művelet kiválasztása</option>
                  {actions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={
                    busy || loading || !action || !visibleSelected.length
                  }
                  onClick={() => void apply()}
                >
                  {busy ? <Loader2 className={styles.spinner} /> : <Check />}
                  Alkalmazás
                </button>
              </>
            ) : null}
            <button
              type="button"
              disabled={busy || loading || !visibleSelected.length}
              onClick={exportSelected}
            >
              <Download />
              CSV
            </button>
            <button
              type="button"
              disabled={busy || loading || !selected.size}
              onClick={() => onSelect(new Set())}
              aria-label="Kijelölés törlése"
            >
              <X />
            </button>
          </div>
        </div>
      ) : null}
      <p className={styles.srOnly} role="status">
        {notice}
      </p>
      <div className={styles.scroll} tabIndex={0} aria-label="Rekordlista">
        <table className={styles.table} role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" className={styles.check}>
                <Selection
                  aria-label="Összes látható rekord kijelölése"
                  checked={all}
                  partial={!all && visibleSelected.length > 0}
                  disabled={busy || loading || !rows.length}
                  onChange={(e) =>
                    onSelect(
                      e.target.checked
                        ? new Set(rows.map((row) => row.id))
                        : new Set(),
                    )
                  }
                />
              </th>
              <th
                scope="col"
                aria-sort={
                  sort?.key === "name" || sort?.key === "title"
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                <button
                  type="button"
                  disabled={!onSort}
                  onClick={() =>
                    onSort?.(kind === "feedback" ? "title" : "name")
                  }
                >
                  Megnevezés
                  {onSort && (sort?.key === "name" || sort?.key === "title") ? (
                    sort?.direction === "asc" ? (
                      <ArrowUp />
                    ) : (
                      <ArrowDown />
                    )
                  ) : null}
                </button>
              </th>
              <th scope="col">
                {choices.length ? "Állapot" : "Típus / információ"}
              </th>
              <th scope="col">Kapcsolódó adatok</th>
              <th
                scope="col"
                aria-sort={
                  sort?.key === "created_at"
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                <button
                  type="button"
                  disabled={!onSort}
                  onClick={() => onSort?.("created_at")}
                >
                  Dátum
                  {onSort && sort?.key === "created_at" ? (
                    sort.direction === "asc" ? (
                      <ArrowUp />
                    ) : (
                      <ArrowDown />
                    )
                  ) : null}
                </button>
              </th>
              <th scope="col" className={styles.actionHeading}>
                Műveletek
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty} role="status">
                    <Loader2 className={styles.spinner} />
                    <strong>Rekordok betöltése…</strong>
                  </div>
                </td>
              </tr>
            ) : !rows.length ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <SearchX />
                    <strong>Nincs megjeleníthető rekord</strong>
                    <span>Próbálj más keresést vagy szűrést.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const name = recordTitle(kind, row),
                  status = recordStatus(kind, row),
                  statusLabel =
                    choices.find((c) => c.value === status)?.label || status;
                const metadata = recordMetadata(kind, row),
                  coordinates = recordCoordinates(row),
                  personId =
                    row.user_id || (kind === "audit_log" ? row.admin_id : null);
                return (
                  <tr
                    role="row"
                    key={row.id}
                    data-selected={selected.has(row.id)}
                  >
                    <td className={styles.check}>
                      <Selection
                        aria-label={`${name} kijelölése`}
                        checked={selected.has(row.id)}
                        disabled={busy || loading}
                        onChange={(e) => toggle(row.id, e.target.checked)}
                      />
                    </td>
                    <td data-label="Megnevezés">
                      <div className={styles.identity}>
                        {kind === 'users' || kind === 'leaderboard' ? (
                          <button type="button" className={styles.avatarButton} disabled={!onOpen} onClick={() => onOpen?.(row)} aria-label={`${name} profiljának megnyitása`}>
                            <Avatar className={styles.avatar} aria-hidden="true">
                              <AvatarImage src={row.avatar_url || undefined} alt="" />
                              <AvatarFallback>{name.trim().split(/\s+/).slice(0,2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('hu-HU')}</AvatarFallback>
                            </Avatar>
                          </button>
                        ) : row.image_url ? (
                          <ImageWithFallback
                            src={row.image_url}
                            width={44}
                            height={44}
                            alt="Beküldött kép"
                            loading="lazy"
                          />
                        ) : null}
                        <div>
                          {onOpen ? (
                            <button
                              type="button"
                              className={styles.name}
                              onClick={() => onOpen(row)}
                            >
                              {name}
                            </button>
                          ) : (
                            <strong>{name}</strong>
                          )}
                          <small title={metadata || row.id}>
                            {metadata || row.id}
                          </small>
                          {kind === "users" && row.is_supporter ? (
                            <span className={styles.supporter}>Támogató</span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td data-label="Állapot">
                      {choices.length ? (
                        onAction ? (
                          <select
                            className={styles.status}
                            data-tone={recordTone(status)}
                            aria-label={`${name} állapota`}
                            value={status}
                            disabled={busy || loading}
                            onChange={(e) =>
                              void onAction([row.id], e.target.value).catch(
                                () => setNotice("A módosítás nem sikerült."),
                              )
                            }
                          >
                            {!choices.some((c) => c.value === status) ? (
                              <option value={status}>
                                {statusLabel || "Nincs állapot"}
                              </option>
                            ) : null}
                            {choices.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                disabled={
                                  !actions.some((a) => a.value === option.value)
                                }
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={styles.state}
                            data-tone={recordTone(status)}
                          >
                            {statusLabel}
                          </span>
                        )
                      ) : (
                        <span>
                          {row.ride_type === "diagnostic"
                            ? "Diagnosztikai"
                            : row.target_type || row.role || "Mentett tekerés"}
                        </span>
                      )}
                    </td>
                    <td data-label="Kapcsolódó adatok">
                      <div className={styles.related}>
                        {personId && onUser ? (
                          <button
                            type="button"
                            onClick={() => onUser(personId)}
                          >
                            <UserRound />
                            {recordPerson(row) || personId}
                          </button>
                        ) : (
                          <span>
                            {kind === "users"
                              ? row.role === "admin"
                                ? "Adminisztrátor"
                                : "Felhasználó"
                              : kind === "cities"
                                ? `${row.country_code || "–"} · ${row.timezone || "–"}`
                                : row.surface_type ||
                                  row.phone ||
                                  row.suggested_type ||
                                  row.reason ||
                                  row.target_id ||
                                  ([
                                    "parking",
                                    "services",
                                    "repair",
                                    "drinking_fountain",
                                  ].includes(kind)
                                    ? row.covered
                                      ? "Fedett"
                                      : "Szabadtéri"
                                    : row.id.slice(0, 8))}
                          </span>
                        )}
                        {row.poi_id && onPoi ? (
                          <button
                            type="button"
                            onClick={() => onPoi(row.poi_id, row.poi_type)}
                          >
                            {row.poi_name || "Érintett helyszín"}
                            <ChevronRight />
                          </button>
                        ) : null}
                        {row.parking_spot_id && onPoi ? (
                          <button
                            type="button"
                            onClick={() =>
                              onPoi(row.parking_spot_id, "parking")
                            }
                          >
                            {row.parking_name || "Érintett parkoló"}
                            <ChevronRight />
                          </button>
                        ) : null}
                        {coordinates ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {coordinates.lat.toFixed(5)},{" "}
                            {coordinates.lon.toFixed(5)}
                            <ChevronRight />
                          </a>
                        ) : null}
                        {kind === "audit_log" &&
                        row.target_type === "user" &&
                        onUser ? (
                          <button
                            type="button"
                            onClick={() => onUser(row.target_id)}
                          >
                            Érintett felhasználó
                            <ChevronRight />
                          </button>
                        ) : null}
                        {kind === "audit_log" &&
                        row.target_type === "ride" &&
                        onRide ? (
                          <button
                            type="button"
                            onClick={() => onRide(row.target_id)}
                          >
                            Érintett tekerés
                            <ChevronRight />
                          </button>
                        ) : null}
                        {kind === "ride_diagnostics" ? (
                          <span>
                            Mozgás: {Number(row.moving_time_seconds || 0)} mp ·
                            Elfogadott / elutasított minták:{" "}
                            {Number(row.sample_accepted || 0)} /{" "}
                            {Number(row.sample_rejected || 0)}
                          </span>
                        ) : null}
                        {kind === "leaderboard" ? (
                          <span>
                            {row.xp?.toLocaleString("hu-HU")} XP ·{" "}
                            {row.home_city_name || "Globális"}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td data-label="Dátum" className={styles.date}>
                      {recordDate(row.started_at || row.created_at)}
                    </td>
                    <td data-label="Műveletek">
                      <div className={styles.actions}>
                        {onOpen ? (
                          <button
                            type="button"
                            onClick={() => onOpen(row)}
                            aria-label={`${name} részletei`}
                            title="Részletek"
                          >
                            <Eye />
                          </button>
                        ) : null}
                        {onEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            aria-label={`${name} szerkesztése`}
                            title="Szerkesztés"
                          >
                            <Pencil />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() =>
                            void navigator.clipboard.writeText(row.id).then(
                              () => setNotice("Azonosító másolva."),
                              () => setNotice("A másolás nem sikerült."),
                            )
                          }
                          aria-label={`${name} azonosítójának másolása`}
                          title="Azonosító másolása"
                        >
                          <Copy />
                        </button>
                        {onDelete ? (
                          <button
                            type="button"
                            className={styles.danger}
                            disabled={busy || loading}
                            onClick={() => onDelete(row)}
                            aria-label={`${name} törlése`}
                            title="Törlés"
                          >
                            <Trash2 />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <footer className={styles.pager}>
        <label>
          Sorok oldalanként
          <select
            value={pageSize}
            disabled={busy || loading}
            onChange={(e) => onPageSize(Number(e.target.value))}
          >
            {[10, 20, 25, 50, 100, 200]
              .filter((size) => kind === "leaderboard" || size !== 200)
              .map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
          </select>
        </label>
        <span>
          {page} / {Math.max(1, pages)} oldal
        </span>
        <div>
          <button
            type="button"
            aria-label="Előző oldal"
            disabled={page <= 1 || busy || loading}
            onClick={() => onPage(page - 1)}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Következő oldal"
            disabled={page >= pages || busy || loading}
            onClick={() => onPage(page + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </footer>
    </section>
  );
}
