import PoiDirectoryTable, { type PoiDirectoryItem } from './PoiDirectoryTable';

interface ServicesTableProps {
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
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    selectAll?: boolean;
}
export default function ServicesTable(props: ServicesTableProps) {
    return (
        <PoiDirectoryTable
            kind="service"
            data={props.data as PoiDirectoryItem[]}
            onRowClick={props.onRowClick}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            searchTerm={props.searchTerm}
            currentPage={props.currentPage}
            totalPages={props.totalPages}
            onPageChange={props.onPageChange}
            pageSize={props.pageSize}
            onPageSizeChange={props.onPageSizeChange}
        />
    );
}
