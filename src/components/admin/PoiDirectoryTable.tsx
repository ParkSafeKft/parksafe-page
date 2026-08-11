'use client';

import { ExternalLink, Eye, MapPin, Pencil, SearchX, Trash2 } from 'lucide-react';

export type PoiDirectoryKind = 'parking' | 'fountain' | 'service' | 'repair';

export type PoiDirectoryItem = {
    id: string;
    name?: string | null;
    city?: string | null;
    available?: boolean | null;
    covered?: boolean | null;
    free?: boolean | null;
    phone?: string | null;
    rating?: number | string | null;
    created_at?: string | null;
    coordinate?: unknown;
    lat?: number | string | null;
    lon?: number | string | null;
};

export type PoiDirectoryTableProps = {
    data: PoiDirectoryItem[];
    onRowClick: (item: PoiDirectoryItem) => void;
    onEdit: (item: PoiDirectoryItem) => void;
    onDelete: (id: string) => void;
    searchTerm?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    kind: PoiDirectoryKind;
};

const kindLabels: Record<PoiDirectoryKind, { empty: string; fallback: string }> = {
    parking: { empty: 'Nincs bicikliparkoló', fallback: 'Névtelen parkoló' },
    fountain: { empty: 'Nincs ivókút', fallback: 'Névtelen ivókút' },
    service: { empty: 'Nincs szerviz vagy bolt', fallback: 'Névtelen szerviz' },
    repair: { empty: 'Nincs javítóállomás', fallback: 'Névtelen javítóállomás' },
};

function parseCoordinate(item: PoiDirectoryItem): { lat: number; lon: number } | null {
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };

    const coordinate = item.coordinate;
    if (coordinate && typeof coordinate === 'object' && 'type' in coordinate && 'coordinates' in coordinate) {
        const point = coordinate as { type?: string; coordinates?: unknown };
        if (point.type === 'Point' && Array.isArray(point.coordinates)) {
            const parsedLon = Number(point.coordinates[0]);
            const parsedLat = Number(point.coordinates[1]);
            if (Number.isFinite(parsedLat) && Number.isFinite(parsedLon)) return { lat: parsedLat, lon: parsedLon };
        }
    }

    if (typeof coordinate !== 'string') return null;
    try {
        const coordsHex = coordinate.substring(18);
        if (coordsHex.length < 32) return null;
        const readDouble = (hex: string) => {
            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            for (let index = 0; index < 8; index += 1) view.setUint8(index, parseInt(hex.slice(index * 2, index * 2 + 2), 16));
            return view.getFloat64(0, true);
        };
        const parsedLon = readDouble(coordsHex.substring(0, 16));
        const parsedLat = readDouble(coordsHex.substring(16, 32));
        return Number.isFinite(parsedLat) && Number.isFinite(parsedLon) ? { lat: parsedLat, lon: parsedLon } : null;
    } catch {
        return null;
    }
}

function getAttributes(item: PoiDirectoryItem, kind: PoiDirectoryKind): string {
    if (kind === 'parking') return item.covered ? 'Fedett' : 'Szabadtéri';
    if (kind === 'fountain') return 'Ivóvíz';
    if (kind === 'service') {
        const rating = Number(item.rating);
        return Number.isFinite(rating) && rating > 0 ? `${rating.toFixed(1)} értékelés` : item.phone || 'Nincs elérhetőség';
    }
    if (item.free === true) return item.covered ? 'Ingyenes · fedett' : 'Ingyenes';
    return item.covered ? 'Fedett' : 'Szabadtéri';
}

export default function PoiDirectoryTable({
    data,
    onRowClick,
    onEdit,
    onDelete,
    searchTerm,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
    kind,
}: PoiDirectoryTableProps) {
    const labels = kindLabels[kind];

    if (data.length === 0) {
        return (
            <div className="ops-empty">
                <div>
                    <SearchX aria-hidden="true" />
                    <strong>{searchTerm ? 'Nincs találat' : labels.empty}</strong>
                    <span>{searchTerm ? 'Próbálj másik keresést.' : 'Ebben a gyűjteményben még nincs megjeleníthető elem.'}</span>
                </div>
            </div>
        );
    }

    return (
        <section className="ops-collection" aria-label={labels.empty.replace('Nincs ', '')}>
            <div className="ops-list-header ops-poi-grid" aria-hidden="true">
                <span />
                <span>Hely</span>
                <span>Állapot</span>
                <span>Koordináta</span>
                <span>Tulajdonság</span>
                <span>Műveletek</span>
            </div>

            <div role="list">
                {data.map((item) => {
                    const coordinate = parseCoordinate(item);
                    return (
                        <div className="ops-list-row ops-poi-grid" role="listitem" data-clickable="true" key={item.id}>
                            <button type="button" className="ops-row-open-hit" onClick={() => onRowClick(item)} aria-label={`${item.name || labels.fallback} részleteinek megnyitása`} />
                            <button type="button" className="ops-row-pin" onClick={(event) => { event.stopPropagation(); onRowClick(item); }} aria-label={`${item.name || labels.fallback} megnyitása`}>
                                <MapPin aria-hidden="true" />
                            </button>

                            <button type="button" className="ops-list-row-title" onClick={(event) => { event.stopPropagation(); onRowClick(item); }}>
                                <strong>{item.name || labels.fallback}</strong>
                                <span>{item.city || 'Nincs város megadva'} · {item.id}</span>
                            </button>

                            <span className="ops-status" data-tone={item.available === false ? 'danger' : 'success'}>
                                {item.available === false ? 'Nem elérhető' : 'Elérhető'}
                            </span>

                            {coordinate ? (
                                <a
                                    className="ops-list-meta is-mono ops-coordinate-link"
                                    href={`https://www.openstreetmap.org/edit?#map=19/${coordinate.lat}/${coordinate.lon}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    title="Megnyitás az OSM szerkesztőben"
                                >
                                    {coordinate.lat.toFixed(5)}, {coordinate.lon.toFixed(5)}
                                    <ExternalLink aria-hidden="true" />
                                </a>
                            ) : (
                                <span className="ops-list-meta">Nincs koordináta</span>
                            )}

                            <span className="ops-list-meta">{getAttributes(item, kind)}</span>

                            <div className="ops-inline-actions" onClick={(event) => event.stopPropagation()}>
                                <button type="button" className="ops-icon-action" onClick={() => onRowClick(item)} title="Részletek" aria-label="Részletek">
                                    <Eye aria-hidden="true" />
                                </button>
                                <button type="button" className="ops-icon-action" onClick={() => onEdit(item)} title="Szerkesztés" aria-label="Szerkesztés">
                                    <Pencil aria-hidden="true" />
                                </button>
                                <button type="button" className="ops-icon-action is-danger" onClick={() => onDelete(item.id)} title="Törlés" aria-label="Törlés">
                                    <Trash2 aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer className="ops-pager">
                <label>
                    Sorok&nbsp;
                    <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
                        {[10, 20, 50, 100].map((size) => <option value={size} key={size}>{size}</option>)}
                    </select>
                </label>
                <div className="ops-pager-controls">
                    <span>{currentPage} / {Math.max(totalPages, 1)} oldal</span>
                    <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Előző</button>
                    <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Következő</button>
                </div>
            </footer>
        </section>
    );
}
