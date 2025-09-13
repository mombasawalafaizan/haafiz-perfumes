import { useDataTableLogic } from "@/components/common/DataTable/DataTableLogic";
import { DataTableUI } from "@/components/common/DataTable/DataTableUI";

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  pagination,
  selection,
  sorting,
  search,
  filters,
  columnConfig,
  view,
  actions,
  ui,
  getRowId = (row) => String(row.id),
  onDataFiltered,
  headerMoreButtons,
  getRowClassName,
}: IDataTableProps<T>) {
  const logic = useDataTableLogic({
    columns,
    data,
    pagination,
    selection,
    sorting,
    search,
    filters,
    columnConfig,
    view,
    actions,
    ui,
    getRowId,
    onDataFiltered,
    headerMoreButtons,
    getRowClassName,
  });

  return <DataTableUI logic={logic} />;
}

export default DataTable;
