// import {
//   ColumnDef,
//   SortingState,
//   OnChangeFn,
//   VisibilityState,
// } from "@tanstack/react-table";

// Filter Types and Interfaces
declare type IFilterType =
  | "text"
  | "select"
  | "multiSelect"
  | "date"
  | "dateRange"
  | "dateRangeWithOptions"
  | "number"
  | "boolean"
  | "toggleGroup"
  | "switch"
  | "groupBy";

declare interface IFilterOption {
  label: string | React.ReactNode;
  value: string | number | boolean;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  searchText?: string; // Additional text for searching when label is ReactNode
}

declare interface IFilterConfig {
  id: string;
  label: string;
  type: IFilterType;
  field: string; // The data field to filter on
  placeholder?: string;
  options?: IFilterOption[]; // For select/multiSelect filters
  defaultValue?: any;
  // Date range specific
  dateFormat?: string;
  // Number specific
  min?: number;
  max?: number;
  step?: number;
  // Validation
  required?: boolean;
  // UI
  className?: string;
  width?: string;
  // Display options
  showOutside?: boolean; // Show filter next to search input instead of in filter panel
  fullWidth?: boolean; // For toggle groups to span full width on new line
  icon?: React.ComponentType<{ className?: string }>;
  // Group by specific
  groupByField?: string; // The field to group by when this filter is used for grouping
}

declare interface IFilterState {
  [filterId: string]: any;
}

// Simplified DataTable Props Interface
declare interface IDataTableProps<T extends { id: string | number }> {
  // Core props
  columns: ColumnDef<T, any>[];
  data: T[];
  onDataFiltered?: (data: T[]) => void;

  // Pagination
  pagination?: {
    mode: "server" | "client";
    page?: number;
    pageSize?: number;
    totalCount?: number;
    pageSizeOptions?: number[];
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };

  // Row selection
  selection?: {
    selectedIds?: (string | number)[];
    onSelectionChange?: (ids: (string | number)[]) => void;
    showCheckbox?: boolean;
    enableRowSelection?: (row: Row<T>) => boolean;
  };

  // Sorting
  sorting?: {
    state?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
  };

  // Search
  search?: {
    value?: string;
    placeholder?: string;
    fields?: string[]; // Changed from (keyof T)[] to string[] to support nested paths
    onSearchChange?: (search: string) => void;
    searchClassName?: string;
  };

  // Filters
  filters?: {
    configs?: IFilterConfig[];
    state?: IFilterState;
    onFilterChange?: (filters: IFilterState) => void;
    mode?: "client" | "server";
  };

  // Column management
  columnConfig?: {
    enableResizing?: boolean;
    enableVisibility?: boolean;
    visibility?: VisibilityState;
    onVisibilityChange?: OnChangeFn<VisibilityState>;
    onResizeChange?: (sizing: Record<string, number>) => void;
  };

  // View modes
  view?: {
    mode?: "table" | "grid";
    showViewModeChange?: boolean;
    onModeChange?: (mode: "table" | "grid") => void;
    gridConfig?: {
      onCardClick?: (item: T) => void;
      renderCard?: (item: T) => React.ReactNode;
      columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
      };
    };
  };

  // Actions
  actions?: {
    onRefresh?: () => void;
    onExport?: () => void;
    showRefresh?: boolean;
    showExport?: boolean;
  };

  // UI customization
  ui?: {
    loading?: boolean;
    emptyText?: string;
    tableLayout?: "auto" | "fixed";
    className?: string;
  };

  // Utilities
  getRowId?: (row: T) => string;
  headerMoreButtons?: React.ReactNode;
  getRowClassName?: (row: Row<T>) => string;
}

// Grid Card Component
declare interface IGridCardProps<T> {
  item: T;
  isSelected: boolean;
  onCardClick?: (item: T) => void;
  renderCard?: (item: T) => React.ReactNode;
  getRowId: (row: T) => string;
}

interface IFilterComponentProps {
  filter: IFilterConfig;
  value: any;
  onChange: (value: any) => void;
  onClear: () => void;
}
interface IDataTableFiltersProps {
  filters: IFilterConfig[];
  filterState: IFilterState;
  onFilterChange: (filters: IFilterState) => void;
  onClearAll: () => void;
  className?: string;
}
interface IUseFilterOptionsProps {
  apiConfig?: IFilterApiConfig;
  enabled?: boolean;
}
type GroupedDataItem<T> =
  | T
  | {
      type: "group";
      value: any;
      count: number;
      key: string;
      items: T[];
      title: string;
      id: string;
    };
