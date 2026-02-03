import {
    MoreHorizontal,
    MapPin,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ParkingTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    selectedRows: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onSort: (key: string) => void;
    sortConfig: { key: string; direction: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRowClick: (item: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    onToggleAvailability: (id: string, currentStatus: boolean) => void;
    toggleLoading: string | null;
    searchTerm?: string;
    selectAll: boolean;
}

export default function ParkingTable({
    data,
    // selectedRows,
    // onSelectAll,
    // onSelectRow,
    // onSort,
    // sortConfig,
    onRowClick,
    onEdit,
    onDelete,
    // onToggleAvailability,
    // toggleLoading,
    searchTerm,
    // selectAll,
}: ParkingTableProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseWKBPoint = (wkb: any) => {
        if (!wkb) return null;

        // Handle GeoJSON format
        if (typeof wkb === 'object' && wkb.type === 'Point' && Array.isArray(wkb.coordinates)) {
            const [lon, lat] = wkb.coordinates;
            return { lat, lon };
        }

        if (typeof wkb !== 'string') return null;

        try {
            const coordsHex = wkb.substring(18);
            if (coordsHex.length < 32) return null;

            const lonHex = coordsHex.substring(0, 16);
            const latHex = coordsHex.substring(16, 32);

            const lonBuffer = new ArrayBuffer(8);
            const lonView = new DataView(lonBuffer);
            for (let i = 0; i < 8; i++) {
                lonView.setUint8(i, parseInt(lonHex.substr(i * 2, 2), 16));
            }
            const lon = lonView.getFloat64(0, true);

            const latBuffer = new ArrayBuffer(8);
            const latView = new DataView(latBuffer);
            for (let i = 0; i < 8; i++) {
                latView.setUint8(i, parseInt(latHex.substr(i * 2, 2), 16));
            }
            const lat = latView.getFloat64(0, true);

            return { lat, lon };
        } catch (error) {
            console.error('Error parsing WKB:', error);
            return null;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getCoordinates = (item: any) => {
        if (item.lat && item.lon) {
            return { lat: item.lat, lon: item.lon };
        }

        if (item.coordinate) {
            return parseWKBPoint(item.coordinate);
        }

        return null;
    };

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                    {searchTerm ? 'Nincs találat' : 'Nincsenek parkolók'}
                </h3>
                <p className="text-zinc-500 max-w-xs text-center mt-2">
                    {searchTerm
                        ? 'Próbálj meg más keresési kifejezést használni.'
                        : 'Kattints az "Új hozzáadása" gombra az első parkoló létrehozásához.'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111111] pb-32">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Név</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Város</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Fedett</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Státusz</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Létrehozva</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((item) => {
                            const coords = getCoordinates(item);
                            return (
                                <tr
                                    key={item.id}
                                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                    onClick={() => onRowClick(item)}
                                >
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-white">{item.name}</span>
                                            {coords && (
                                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-zinc-400">{item.city}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {item.covered ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">IGEN</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-500 border border-zinc-700">NEM</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.available
                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] ${item.available ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-zinc-500'}`} />
                                            {item.available ? 'Aktív' : 'Inaktív'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-zinc-500">
                                            {new Date(item.created_at).toLocaleDateString('hu-HU', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#111111] border-white/10 text-zinc-400">
                                                    <DropdownMenuLabel className="text-white">Műveletek</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => onRowClick(item)} className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white">
                                                        <Eye className="mr-2 h-4 w-4" /> Megtekintés
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEdit(item)} className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white">
                                                        <Edit className="mr-2 h-4 w-4" /> Szerkesztés
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/10" />
                                                    <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Törlés
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between px-2">
                <p className="text-xs text-zinc-500">1 / 1 oldal</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg opacity-50 cursor-not-allowed">Előző</button>
                    <button className="px-4 py-2 text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors">Következő</button>
                </div>
            </div>
        </div>
    );
}
