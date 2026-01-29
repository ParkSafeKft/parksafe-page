import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Eye,
    ChevronUp,
    ChevronDown,
    Users,
} from 'lucide-react';

interface UsersTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    users: any[];
    isLoading: boolean;
    selectedRows: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onSort: (key: string) => void;
    sortConfig: { key: string; direction: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRowClick: (item: any) => void;
    searchTerm?: string;
    selectAll: boolean;
}

export default function UsersTable({
    users,
    selectedRows,
    onSelectAll,
    onSelectRow,
    onSort,
    sortConfig,
    onRowClick,
    searchTerm,
    selectAll,
}: UsersTableProps) {
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

    if (users.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchTerm ? 'Nincs találat' : 'Nincsenek felhasználók'}
                </h3>
                <p className="text-muted-foreground">
                    {searchTerm
                        ? 'Próbálj meg más keresési kifejezést használni.'
                        : 'Még nem regisztrált senki az alkalmazásba.'}
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
                            {selectedRows.size} felhasználó kijelölve
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
                            <TableHead className="text-muted-foreground font-medium">
                                Avatar
                            </TableHead>
                            <TableHead
                                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort('username')}
                            >
                                <div className="flex items-center justify-between">
                                    Felhasználónév
                                    <SortIcon columnKey="username" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort('email')}
                            >
                                <div className="flex items-center justify-between">
                                    Email
                                    <SortIcon columnKey="email" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort('role')}
                            >
                                <div className="flex items-center justify-between">
                                    Szerepkör
                                    <SortIcon columnKey="role" />
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
                            <TableHead className="text-muted-foreground font-medium">
                                Telefonszám
                            </TableHead>
                            <TableHead className="text-muted-foreground font-medium w-16">
                                Műveletek
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow
                                key={user.id}
                                className={`border-border hover:bg-muted/50 transition-colors ${selectedRows.has(user.id) ? 'bg-primary/5' : ''
                                    }`}
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows.has(user.id)}
                                        onCheckedChange={(checked) =>
                                            onSelectRow(user.id, checked as boolean)
                                        }
                                        className="border-muted-foreground"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Avatar className="h-10 w-10 ring-1 ring-border">
                                        <AvatarImage
                                            src={user.avatar_url}
                                            alt={user.username || 'User'}
                                        />
                                        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                                            {(user.username || user.email || 'U')
                                                .charAt(0)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell
                                    className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => onRowClick(user)}
                                >
                                    {user.username || 'Nincs megadva'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.email || 'Nincs email'}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                                        className={
                                            user.role === 'admin'
                                                ? 'bg-primary hover:bg-primary/80 text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }
                                    >
                                        {user.role === 'admin' ? 'Admin' : 'Felhasználó'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.created_at
                                        ? new Date(user.created_at).toLocaleDateString('hu-HU', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })
                                        : 'Ismeretlen'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.phone || 'Nincs megadva'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-muted"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                                onClick={() => onRowClick(user)}
                                                className="cursor-pointer"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Részletek megtekintése
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
