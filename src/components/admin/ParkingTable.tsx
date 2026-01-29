import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    MapPin,
    CheckCircle,
    XCircle,
    Loader2,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';

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
    selectedRows,
    onSelectAll,
    onSelectRow,
    onSort,
    sortConfig,
    onRowClick,
    onEdit,
    onDelete,
    onToggleAvailability,
    toggleLoading,
    searchTerm,
    selectAll,
}: ParkingTableProps) {
    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) {
            return <MoreHorizontal className="h-4 w-4 text-muted-foreground" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ChevronUp className="h-4 w-4 text-green-500" />
        ) : (
            <ChevronDown className="h-4 w-4 text-green-500" />
        );
    };

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
            <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchTerm ? 'Nincs találat' : 'Nincsenek parkolók'}
                </h3>
                <p className="text-muted-foreground">
                    {searchTerm
                        ? 'Próbálj meg más keresési kifejezést használni.'
                        : 'Kattints az "Új hozzáadása" gombra az első parkoló létrehozásához.'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
            {selectedRows.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-primary/10 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                            {selectedRows.size} kijelölt
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {selectedRows.size} parkoló kijelölve
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectAll(false)}
                            className="border-border"
                        >
                            Kijelölés törlése
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow className="border-border hover:bg-muted/80">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectAll}
                                    onCheckedChange={onSelectAll}
                                    className="border-muted-foreground"
                                />
                            </TableHead>
                            <TableHead
                                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort('name')}
                            >
                                <div className="flex items-center justify-between">
                                    Név
                                    <SortIcon columnKey="name" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort('city')}
                            >
                                <div className="flex items-center justify-between">
                                    Város
                                    <SortIcon columnKey="city" />
                                </div>
                            </TableHead>
                            <TableHead className="text-muted-foreground font-medium">Leírás</TableHead>
                            <TableHead
                                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort('covered')}
                            >
                                <div className="flex items-center justify-between">
                                    Fedett
                                    <SortIcon columnKey="covered" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort('available')}
                            >
                                <div className="flex items-center justify-between">
                                    Státusz
                                    <SortIcon columnKey="available" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort('created_at')}
                            >
                                <div className="flex items-center justify-between">
                                    Létrehozva
                                    <SortIcon columnKey="created_at" />
                                </div>
                            </TableHead>
                            <TableHead className="text-muted-foreground font-medium w-16">Műveletek</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((spot) => {
                            const coords = getCoordinates(spot);
                            return (
                                <TableRow
                                    key={spot.id}
                                    className={`border-border hover:bg-muted/50 transition-colors ${selectedRows.has(spot.id) ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.has(spot.id)}
                                            onCheckedChange={(checked) => onSelectRow(spot.id, checked as boolean)}
                                            className="border-muted-foreground"
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => onRowClick(spot)}
                                    >
                                        <div>
                                            <div className="font-medium">{spot.name}</div>
                                            {coords && (
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{spot.city}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-48 truncate">
                                        {spot.description || 'Nincs leírás'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={spot.covered ? 'default' : 'secondary'}
                                            className={
                                                spot.covered
                                                    ? 'bg-primary hover:bg-primary/80 text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }
                                        >
                                            {spot.covered ? 'Igen' : 'Nem'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={spot.available ? 'default' : 'destructive'}
                                            className={
                                                spot.available
                                                    ? 'bg-primary hover:bg-primary/80 text-primary-foreground'
                                                    : 'bg-destructive hover:bg-destructive/80 text-destructive-foreground'
                                            }
                                        >
                                            <div className="flex items-center gap-1">
                                                {spot.available ? (
                                                    <CheckCircle className="h-3 w-3" />
                                                ) : (
                                                    <XCircle className="h-3 w-3" />
                                                )}
                                                {spot.available ? 'Aktív' : 'Inaktív'}
                                            </div>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(spot.created_at).toLocaleDateString('hu-HU', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => onRowClick(spot)}
                                                    className="cursor-pointer"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Részletek megtekintése
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(spot)}
                                                    className="cursor-pointer"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Szerkesztés
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onToggleAvailability(spot.id, spot.available)}
                                                    className="cursor-pointer"
                                                    disabled={toggleLoading === spot.id}
                                                >
                                                    {toggleLoading === spot.id ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : spot.available ? (
                                                        <EyeOff className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 mr-2" />
                                                    )}
                                                    {spot.available ? 'Deaktiválás' : 'Aktiválás'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(spot.id)}
                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Törlés
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
