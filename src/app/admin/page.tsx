'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    XCircle,
    Plus,
    Loader2,
    Users,
    MapPin,
    Building,
    Wrench,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

import AdminSidebar from '@/components/admin/AdminSidebar';
import UsersTable from '@/components/admin/UsersTable';
import ParkingTable from '@/components/admin/ParkingTable';
import ServicesTable from '@/components/admin/ServicesTable';
import RepairTable from '@/components/admin/RepairTable';
import AddLocationModal from '@/components/admin/AddLocationModal';
import EditLocationModal from '@/components/admin/EditLocationModal';
import DetailModal from '@/components/admin/DetailModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

export default function AdminPage() {
    const router = useRouter();
    const { user: profile, loading: authLoading, signOut } = useAuth();


    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');

    // Data states
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [users, setUsers] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [parkingSpots, setParkingSpots] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bicycleServices, setBicycleServices] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [repairStations, setRepairStations] = useState<any[]>([]);

    const [dataLoading, setDataLoading] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Selection
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // Modals
    const [addLocationModal, setAddLocationModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editLocationModal, setEditLocationModal] = useState<{ show: boolean; item: any }>({
        show: false,
        item: null
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [detailModal, setDetailModal] = useState<{ show: boolean; item: any; type: string }>({
        show: false,
        item: null,
        type: 'user'
    });
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; table: string | null; id: string | null }>({
        show: false,
        table: null,
        id: null
    });

    // Fetch data
    const fetchData = async () => {
        if (!profile) return;
        setDataLoading(true);
        try {
            let query;
            let countQuery;

            switch (activeTab) {
                case 'users':
                    query = supabase.from('profiles').select('*');
                    countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
                    break;
                case 'parking':
                    query = supabase.from('parkingSpots').select('*');
                    countQuery = supabase.from('parkingSpots').select('*', { count: 'exact', head: true });
                    break;
                case 'services':
                    query = supabase.from('bicycleService').select('*');
                    countQuery = supabase.from('bicycleService').select('*', { count: 'exact', head: true });
                    break;
                case 'repair':
                    query = supabase.from('repairStation').select('*');
                    countQuery = supabase.from('repairStation').select('*', { count: 'exact', head: true });
                    break;
                default:
                    return;
            }

            // Search
            if (searchTerm) {
                if (activeTab === 'users') {
                    query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
                    countQuery = countQuery.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
                } else {
                    query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
                    countQuery = countQuery.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
                }
            }

            // Sorting
            query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

            // Pagination
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const [dataRes, countRes] = await Promise.all([query, countQuery]);

            if (dataRes.error) throw dataRes.error;
            if (countRes.error) throw countRes.error;

            setTotalCount(countRes.count || 0);

            if (activeTab === 'users') setUsers(dataRes.data || []);
            else if (activeTab === 'parking') setParkingSpots(dataRes.data || []);
            else if (activeTab === 'services') setBicycleServices(dataRes.data || []);
            else if (activeTab === 'repair') setRepairStations(dataRes.data || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Hiba történt az adatok betöltésekor');
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        // Reset page and selection on tab/search change
        setCurrentPage(1);
        setSelectedRows(new Set());
        setSelectAll(false);
    }, [activeTab, searchTerm]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, currentPage, sortConfig, searchTerm, profile, pageSize]);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            const currentData = activeTab === 'users' ? users :
                activeTab === 'parking' ? parkingSpots :
                    activeTab === 'services' ? bicycleServices : repairStations;
            setSelectedRows(new Set(currentData.map(item => item.id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
            setSelectAll(false);
        }
        setSelectedRows(newSelected);
    };

    const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
        setToggleLoading(id);
        const table = activeTab === 'parking' ? 'parkingSpots' :
            activeTab === 'services' ? 'bicycleService' : 'repairStation';

        try {
            const { error } = await supabase
                .from(table)
                .update({ available: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success('Státusz sikeresen módosítva');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Hiba történt a státusz módosítása során');
        } finally {
            setToggleLoading(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        const table = activeTab === 'users' ? 'profiles' :
            activeTab === 'parking' ? 'parkingSpots' :
                activeTab === 'services' ? 'bicycleService' : 'repairStation';
        setDeleteModal({ show: true, table, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.table || !deleteModal.id) return;

        try {
            const { error } = await supabase
                .from(deleteModal.table)
                .delete()
                .eq('id', deleteModal.id);

            if (error) throw error;

            toast.success('Elem sikeresen törölve');
            setDeleteModal({ show: false, table: null, id: null });
            fetchData();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Hiba történt a törlés során');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error(error);
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!profile || (profile as any).role !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="bg-card border-border shadow-2xl max-w-md w-full">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-destructive/20 border-2 border-destructive/30 mx-auto mb-6 flex items-center justify-center">
                                <XCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">Hozzáférés megtagadva</h2>
                            <p className="text-muted-foreground mb-6">Nincs jogosultságod az admin panel megtekintéséhez.</p>
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Vissza a főoldalra
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="admin-dark min-h-screen bg-background text-foreground flex w-full">
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    profile={profile}
                    onLogout={handleLogout}
                    onHomeConfig={() => router.push('/')}
                />

                <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden">
                    <header className="flex-shrink-0 p-6 pb-2">
                        <Card className="bg-card border-border shadow-lg">
                            <CardContent className="p-4">
                                <div className="hidden xl:flex items-center justify-between">
                                    {/* Left Section */}
                                    <div className="flex items-center gap-4">
                                        <SidebarTrigger />
                                        <Separator orientation="vertical" className="h-8 bg-sidebar-border" />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                                {activeTab === 'users' && <Users className="h-5 w-5 text-white" />}
                                                {activeTab === 'parking' && <MapPin className="h-5 w-5 text-white" />}
                                                {activeTab === 'services' && <Building className="h-5 w-5 text-white" />}
                                                {activeTab === 'repair' && <Wrench className="h-5 w-5 text-white" />}
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                                    {activeTab === 'users' && 'Felhasználók'}
                                                    {activeTab === 'parking' && 'Bicikli Parkolók'}
                                                    {activeTab === 'services' && 'Szervizek & Boltok'}
                                                    {activeTab === 'repair' && 'Javító Állomások'}
                                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                        {totalCount} elem
                                                    </Badge>
                                                </h1>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    {activeTab === 'users' && 'Összes regisztrált felhasználó kezelése'}
                                                    {activeTab === 'parking' && 'Bicikli parkolók létrehozása és kezelése'}
                                                    {activeTab === 'services' && 'Kerékpár szervizek és boltok kezelése'}
                                                    {activeTab === 'repair' && 'Önkiszolgáló javító állomások kezelése'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Keresés..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-80"
                                            />
                                            {searchTerm && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                    onClick={() => setSearchTerm('')}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {activeTab !== 'users' && (
                                            <>
                                                <Separator orientation="vertical" className="h-8 bg-sidebar-border" />
                                                <Button
                                                    onClick={() => setAddLocationModal(true)}
                                                    className="gap-2"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Új hozzáadása
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Header logic - simiplified */}
                                <div className="xl:hidden flex items-center justify-between">
                                    <SidebarTrigger />
                                    <h1 className="text-lg font-bold">Admin</h1>
                                </div>
                            </CardContent>
                        </Card>
                    </header>

                    <main className="flex-1 overflow-hidden p-6 pt-2">
                        {dataLoading ? (
                            <Card className="bg-card border-border shadow-lg h-full flex items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </Card>
                        ) : (
                            <Card className="bg-card border-border overflow-hidden h-full flex flex-col">
                                <CardContent className="p-0 m-0 flex-1 overflow-hidden flex flex-col">
                                    {activeTab === 'users' && (
                                        <UsersTable
                                            users={users}
                                            isLoading={dataLoading}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'user' })}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'parking' && (
                                        <ParkingTable
                                            data={parkingSpots}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'parking' })}
                                            onEdit={(item) => setEditLocationModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleAvailability={handleToggleAvailability}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'services' && (
                                        <ServicesTable
                                            data={bicycleServices}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'service' })}
                                            onEdit={(item) => setEditLocationModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleAvailability={handleToggleAvailability}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            selectAll={selectAll}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'repair' && (
                                        <RepairTable
                                            data={repairStations}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'repair' })}
                                            onEdit={(item) => setEditLocationModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleAvailability={handleToggleAvailability}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            selectAll={selectAll}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </main>
                </SidebarInset>

                {/* Modals */}
                <AddLocationModal
                    isOpen={addLocationModal}
                    onClose={() => setAddLocationModal(false)}
                    locationType={activeTab}
                    onSuccess={() => {
                        setAddLocationModal(false);
                        fetchData();
                    }}
                />

                <EditLocationModal
                    isOpen={editLocationModal.show}
                    onClose={() => setEditLocationModal({ show: false, item: null })}
                    locationType={activeTab}
                    item={editLocationModal.item}
                    onSuccess={() => {
                        setEditLocationModal({ show: false, item: null });
                        fetchData();
                    }}
                />

                <DetailModal
                    isOpen={detailModal.show}
                    onClose={() => setDetailModal({ ...detailModal, show: false })}
                    item={detailModal.item}
                    type={detailModal.type}
                    onEdit={(item) => {
                        setDetailModal({ ...detailModal, show: false });
                        setEditLocationModal({ show: true, item });
                    }}
                />

                <DeleteConfirmModal
                    isOpen={deleteModal.show}
                    onClose={() => setDeleteModal({ show: false, table: null, id: null })}
                    onConfirm={confirmDelete}
                />
            </div>
        </SidebarProvider>
    );
}
