import React, { useDeferredValue } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  VisibilityState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { getNestedValue } from "@/components/common/DataTable/DataTableUtils";

// Type for grouped data
type GroupedDataItem<T> = T | { type: "group"; value: any; count: number };

export function useDataTableLogic<T extends { id: string | number }>({
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
  // Extract values with defaults
  const paginationMode = pagination?.mode || "client";
  const currentPage = pagination?.page || 1;
  const currentPageSize = pagination?.pageSize || 10;
  const totalCount = pagination?.totalCount || 0;
  const pageSizeOptions = pagination?.pageSizeOptions || [10, 20, 50, 100];
  const onPageChange = pagination?.onPageChange;
  const onPageSizeChange = pagination?.onPageSizeChange;

  const selectedRowIds = React.useMemo(
    () => selection?.selectedIds || [],
    [selection?.selectedIds]
  );
  const onRowSelectionChange = selection?.onSelectionChange;
  const showCheckbox = selection?.showCheckbox || false;
  const enableRowSelection = selection?.enableRowSelection || (() => true);

  const sortingState = sorting?.state || [];
  const onSortingChange = sorting?.onSortingChange;

  const searchValue = search?.value || "";
  const searchPlaceholder = search?.placeholder || "Search...";
  const searchFields = search?.fields;
  const onSearchChange = search?.onSearchChange;
  const searchClassName = search?.searchClassName || "";
  // Use deferred value for search to improve performance
  const deferredSearchValue = useDeferredValue(searchValue);

  const filterConfigs = React.useMemo(
    () => filters?.configs || [],
    [filters?.configs]
  );
  const filterState = filters?.state || {};
  const onFilterChange = filters?.onFilterChange;
  const filterMode = filters?.mode || "client";

  const enableColumnResizing = columnConfig?.enableResizing || false;
  const enableColumnVisibility = columnConfig?.enableVisibility || false;
  const columnVisibility = columnConfig?.visibility;
  const onColumnVisibilityChange = columnConfig?.onVisibilityChange;
  const onColumnResizeChange = columnConfig?.onResizeChange;

  const viewMode = view?.mode || "table";
  const onViewModeChange = view?.onModeChange;
  const showViewModeChange = view?.showViewModeChange ?? true;
  const gridConfig = view?.gridConfig;

  const loading = ui?.loading || false;
  const emptyText = ui?.emptyText || "No data found";
  const tableLayout = ui?.tableLayout || "fixed";

  // Row selection state for TanStack Table
  const rowSelection: RowSelectionState = React.useMemo(() => {
    const state: RowSelectionState = {};
    selectedRowIds.forEach((id) => {
      state[String(id)] = true;
    });
    return state;
  }, [selectedRowIds]);

  // Column resizing state
  const [columnSizing, setColumnSizing] = React.useState<
    Record<string, number>
  >({});

  // Resize handle interaction state
  const [resizeHandleHover, setResizeHandleHover] = React.useState<
    string | null
  >(null);

  // Column visibility state
  const [columnVisibilityState, setColumnVisibilityState] =
    React.useState<VisibilityState>({});

  // Filter state
  const [localIFilterState, setLocalIFilterState] =
    React.useState<IFilterState>(filterState || {});

  // Page input state
  const [pageInput, setPageInput] = React.useState<string>(String(currentPage));

  // Filter toggle state
  const [showFilters, setShowFilters] = React.useState(false);

  // Use deferred values for performance optimization
  const deferredFilterState = useDeferredValue(localIFilterState);
  const deferredColumnSizing = useDeferredValue(columnSizing);
  const deferredPageInput = useDeferredValue(pageInput);

  // Local pagination state for client-side mode
  const [pageIndex, setPageIndex] = React.useState(0);
  const [localPageSize, setLocalPageSize] = React.useState(currentPageSize);

  // Initialize local pagination state from props
  React.useEffect(() => {
    if (paginationMode === "client") {
      setPageIndex(currentPage - 1);
      setLocalPageSize(currentPageSize);
    }
  }, [paginationMode, currentPage, currentPageSize]);

  // Determine if checkbox should be shown
  const shouldShowCheckbox = showCheckbox && !!onRowSelectionChange;

  // Determine if sorting should be manual (server-side) or automatic (client-side)
  const isManualSorting = paginationMode === "server" && !!onSortingChange;

  // Memoized width calculation functions for performance
  const getColumnWidth = React.useCallback(
    (meta: any, columnId?: string): string | undefined => {
      if (enableColumnResizing && columnId && deferredColumnSizing[columnId]) {
        return `${deferredColumnSizing[columnId]}px`;
      }

      if (!meta?.width) return undefined;

      if (typeof meta.width === "number") {
        return `${meta.width}px`;
      }

      if (typeof meta.width === "string") {
        if (
          meta.width.includes("px") ||
          meta.width.includes("%") ||
          meta.width.includes("rem") ||
          meta.width.includes("em") ||
          meta.width.includes("vw") ||
          meta.width.includes("vh")
        ) {
          return meta.width;
        }

        if (!isNaN(Number(meta.width))) {
          return `${meta.width}px`;
        }
      }

      return meta.width;
    },
    [enableColumnResizing, deferredColumnSizing]
  );

  const getMinMaxWidth = React.useCallback(
    (meta: any, type: "minWidth" | "maxWidth"): string | undefined => {
      const value = meta?.[type];
      if (!value) return undefined;

      if (typeof value === "number") {
        return `${value}px`;
      }

      if (typeof value === "string") {
        if (
          value.includes("px") ||
          value.includes("%") ||
          value.includes("rem") ||
          value.includes("em") ||
          value.includes("vw") ||
          value.includes("vh")
        ) {
          return value;
        }

        if (!isNaN(Number(value))) {
          return `${value}px`;
        }
      }

      return value;
    },
    []
  );

  // Filter data for client-side search and filtering
  const filteredData = React.useMemo<T[]>(() => {
    let filtered: T[] = [...data];

    // Apply search filter
    if (paginationMode === "client" && deferredSearchValue) {
      const searchLower = deferredSearchValue.toLowerCase();
      filtered = filtered.filter((item) => {
        if (searchFields) {
          return searchFields.some((field) => {
            const value = getNestedValue(item, field as string);
            return (
              value !== undefined &&
              String(value).toLowerCase().includes(searchLower)
            );
          });
        } else {
          return Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchLower)
          );
        }
      });
    }

    // Apply filters (client-side only) - exclude groupBy filters as they're handled separately
    if (
      filterMode === "client" &&
      filterConfigs.length > 0 &&
      Object.keys(deferredFilterState).length > 0
    )
      filtered = filtered.filter((item) => {
        return filterConfigs.every((filter) => {
          // Skip groupBy filters as they're handled in groupedData
          if (filter.type === "groupBy") {
            return true;
          }

          const filterValue = deferredFilterState[filter.id];
          if (
            !filterValue ||
            filterValue === "" ||
            (Array.isArray(filterValue) && filterValue.length === 0)
          ) {
            return true;
          }

          const itemValue = item[filter.field as keyof T];

          switch (filter.type) {
            case "select":
              return String(itemValue) === String(filterValue);

            case "multiSelect":
              return (
                Array.isArray(filterValue) &&
                filterValue.includes(String(itemValue))
              );

            case "date":
              if (!itemValue || !filterValue) return true;
              const itemDate = new Date(itemValue as any);
              const filterDate = new Date(filterValue);
              return itemDate.toDateString() === filterDate.toDateString();

            case "dateRange":
              if (
                !itemValue ||
                !filterValue ||
                !filterValue.from ||
                !filterValue.to
              )
                return true;
              const date = new Date(itemValue as any);
              const from = new Date(filterValue.from);
              const to = new Date(filterValue.to);
              return date >= from && date <= to;

            case "number":
              const numValue = Number(itemValue);
              const numFilter = Number(filterValue);
              return (
                !isNaN(numValue) && !isNaN(numFilter) && numValue === numFilter
              );

            case "boolean":
              return Boolean(itemValue) === Boolean(filterValue);

            case "toggleGroup":
              if (String(filterValue) === "ALL") return true;
              if (String(filterValue) === "Unspecified") return !itemValue;
              return String(itemValue) === String(filterValue);

            case "switch":
              return Boolean(itemValue) === Boolean(filterValue);

            default:
              return true;
          }
        });
      });

    // Call onDataFiltered callback with filtered data
    onDataFiltered?.(filtered);

    return filtered;
  }, [
    data,
    paginationMode,
    deferredSearchValue,
    searchFields,
    filterMode,
    filterConfigs,
    deferredFilterState,
    onDataFiltered,
  ]);

  // Memoized column styles for performance
  const columnStyles = React.useMemo(() => {
    const styles: Record<
      string,
      { width?: string; minWidth?: string; maxWidth?: string }
    > = {};

    if (enableColumnResizing) {
      columns.forEach((column) => {
        const columnId = column.id || ((column as any).accessorKey as string);
        if (columnId) {
          const meta = column.meta as any;
          const columnWidth = getColumnWidth(meta, columnId);
          const minWidth = getMinMaxWidth(meta, "minWidth");
          const maxWidth = getMinMaxWidth(meta, "maxWidth");

          styles[columnId] = {
            width: columnWidth || "auto",
            minWidth: minWidth || columnWidth || "auto",
            maxWidth: maxWidth || columnWidth || "none",
          };
        }
      });
    }

    return styles;
  }, [enableColumnResizing, getColumnWidth, getMinMaxWidth, columns]);

  // Optimize grouping logic with better memoization
  const groupedData = React.useMemo(() => {
    // Check if any groupBy filter is active
    const groupByFilter = filterConfigs.find(
      (filter) => filter.type === "groupBy" && deferredFilterState[filter.id]
    );

    if (!groupByFilter || !deferredFilterState[groupByFilter.id]) {
      return filteredData;
    }

    // Get the selected grouping field from the filter value
    const selectedGroupByField = deferredFilterState[groupByFilter.id];
    if (!selectedGroupByField || selectedGroupByField === "") {
      return filteredData;
    }

    const groupByField = selectedGroupByField as keyof T;
    const groups: Record<string, T[]> = {};

    // Group the entire dataset (before filtering)
    data.forEach((item: T) => {
      const groupValue = item[groupByField];
      const groupKey =
        groupValue !== null && groupValue !== undefined
          ? String(groupValue)
          : "Unspecified";

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    // Filter function for items within groups
    const filterItemInGroup = (item: T) => {
      // Apply search filter
      if (paginationMode === "client" && deferredSearchValue) {
        const searchLower = deferredSearchValue.toLowerCase();
        if (searchFields) {
          const matchesSearch = searchFields.some((field) => {
            const value = getNestedValue(item, field as string);
            return (
              value !== undefined &&
              String(value).toLowerCase().includes(searchLower)
            );
          });
          if (!matchesSearch) return false;
        } else {
          const matchesSearch = Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchLower)
          );
          if (!matchesSearch) return false;
        }
      }

      // Apply filters within group
      if (
        filterMode === "client" &&
        filterConfigs.length > 0 &&
        Object.keys(deferredFilterState).length > 0
      ) {
        return filterConfigs.every((filter) => {
          // Skip groupBy filters as they're handled in grouping
          if (filter.type === "groupBy") return true;

          const filterValue = deferredFilterState[filter.id];
          if (
            !filterValue ||
            filterValue === "" ||
            (Array.isArray(filterValue) && filterValue.length === 0)
          ) {
            return true;
          }

          const itemValue = item[filter.field as keyof T];

          switch (filter.type) {
            case "select":
              return String(itemValue) === String(filterValue);
            case "multiSelect":
              return (
                Array.isArray(filterValue) &&
                filterValue.includes(String(itemValue))
              );
            case "date":
              if (!itemValue || !filterValue) return true;
              const itemDate = new Date(itemValue as any);
              const filterDate = new Date(filterValue);
              return itemDate.toDateString() === filterDate.toDateString();
            case "dateRange":
              if (
                !itemValue ||
                !filterValue ||
                !filterValue.from ||
                !filterValue.to
              ) {
                return true;
              }
              const date = new Date(itemValue as any);
              const from = new Date(filterValue.from);
              const to = new Date(filterValue.to);
              return date >= from && date <= to;
            case "number":
              const numValue = Number(itemValue);
              const numFilter = Number(filterValue);
              return (
                !isNaN(numValue) && !isNaN(numFilter) && numValue === numFilter
              );
            case "boolean":
              return Boolean(itemValue) === Boolean(filterValue);
            case "toggleGroup":
              if (String(filterValue) === "ALL") return true;
              if (String(filterValue) === "Unspecified") return !itemValue;
              return String(itemValue) === String(filterValue);
            case "switch":
              return Boolean(itemValue) === Boolean(filterValue);
            default:
              return true;
          }
        });
      }

      return true;
    };

    // Convert to array format with group summary rows and apply filters within each group
    const result: GroupedDataItem<T>[] = [];

    Object.entries(groups).forEach(([groupKey, items]) => {
      // Filter items within the group
      const filteredItems = items.filter(filterItemInGroup);

      // Create a summary object for the group
      const groupId = `group-${groupKey}`;
      // Only push the first item with group information if there are filtered items
      if (filteredItems.length > 0) {
        result.push({
          ...filteredItems[0],
          type: "group-item",
          groupId: groupId,
          groupField: groupByField,
          groupValue: groupKey,
          groupSize: filteredItems.length,
          isFirstInGroup: true,
          totalInGroup: filteredItems.length,
          items: filteredItems,
        });
      }
    });

    return result;
  }, [
    filteredData,
    filterConfigs,
    deferredFilterState,
    data,
    deferredSearchValue,
    filterMode,
    paginationMode,
    searchFields,
  ]);

  // Memoize outside filters to prevent unnecessary re-renders
  const outsideFilters = React.useMemo(() => {
    return filterConfigs.filter((filter) => filter.showOutside);
  }, [filterConfigs]);

  // Memoize panel filters
  const panelFilters = React.useMemo(() => {
    return filterConfigs.filter((filter) => !filter.showOutside);
  }, [filterConfigs]);

  // Helper function to check if a filter value is actually active/meaningful
  const isFilterActive = React.useCallback(
    (filter: IFilterConfig, value: any): boolean => {
      if (!value) return false;

      switch (filter.type) {
        case "select":
          return typeof value === "string" && value !== "" && value !== "all";

        case "multiSelect":
          return Array.isArray(value) && value.length > 0;

        case "date":
          return value !== null && value !== undefined;

        case "dateRange":
          return value && (value.from || value.to);

        case "number":
          // Handle number range (min/max object)
          if (filter.min !== undefined && filter.max !== undefined) {
            return (
              value &&
              ((value.min !== null &&
                value.min !== undefined &&
                value.min !== "") ||
                (value.max !== null &&
                  value.max !== undefined &&
                  value.max !== ""))
            );
          }
          // Handle single number
          return value !== null && value !== undefined && value !== "";

        case "boolean":
          return value !== null; // null means "all", true/false are active

        case "toggleGroup":
          return value !== null && value !== undefined;

        case "switch":
          return value === true || value === false;

        default:
          return false;
      }
    },
    []
  );

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    return panelFilters.filter((filter) => {
      const value = deferredFilterState[filter.id];
      return isFilterActive(filter, value);
    }).length;
  }, [panelFilters, deferredFilterState, isFilterActive]);

  // Sync local pagination state with external state
  React.useEffect(() => {
    if (paginationMode === "client") {
      setPageIndex(currentPage - 1);
      setLocalPageSize(currentPageSize);
      setPageInput(String(currentPage));
    }
  }, [currentPage, currentPageSize, paginationMode]);

  // Table instance
  const table = useReactTable({
    data: groupedData as T[],
    columns,
    getRowId,
    state: {
      rowSelection,
      sorting: sortingState,
      columnSizing: deferredColumnSizing,
      columnVisibility: columnVisibility || columnVisibilityState,
      pagination: {
        pageIndex,
        pageSize: localPageSize,
      },
    },
    enableRowSelection: onRowSelectionChange ? enableRowSelection : false,
    enableColumnResizing,
    columnResizeMode: "onChange",

    onRowSelectionChange: (updater) => {
      if (!onRowSelectionChange) return;
      let newState: RowSelectionState;
      if (typeof updater === "function") {
        newState = updater(rowSelection);
      } else {
        newState = updater;
      }
      const ids = Object.keys(newState).filter((id) => newState[id]);
      onRowSelectionChange(ids);
    },
    onSortingChange: onSortingChange || (() => {}),
    onColumnSizingChange: (updater) => {
      const newSizing =
        typeof updater === "function" ? updater(columnSizing) : updater;

      if (table.getState().columnSizingInfo.isResizingColumn) {
        requestAnimationFrame(() => {
          setColumnSizing(newSizing);
        });
      } else {
        setColumnSizing(newSizing);
      }

      onColumnResizeChange?.(newSizing);
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility =
        typeof updater === "function"
          ? updater(columnVisibilityState)
          : updater;
      setColumnVisibilityState(newVisibility);
      onColumnVisibilityChange?.(newVisibility);
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;

      if (paginationMode === "server") {
        if (onPageChange) {
          onPageChange(newState.pageIndex + 1);
        }
        if (onPageSizeChange && newState.pageSize !== currentPageSize) {
          onPageSizeChange(newState.pageSize);
        }
      } else {
        // Update local state
        setPageIndex(newState.pageIndex);
        setLocalPageSize(newState.pageSize);
        setPageInput(String(newState.pageIndex + 1));
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: paginationMode === "server",
    debugTable: true,
    pageCount:
      paginationMode === "server"
        ? Math.ceil(totalCount / currentPageSize)
        : Math.ceil(groupedData.length / localPageSize),
    manualSorting: isManualSorting,
  });

  // Reset page when data or filters change
  React.useEffect(() => {
    if (paginationMode === "client") {
      table.setPagination((old) => ({
        ...old,
        pageIndex: 0,
      }));
      setPageInput("1");
    }
  }, [
    filteredData,
    groupedData,
    deferredFilterState,
    deferredSearchValue,
    paginationMode,
    table,
  ]);

  // Call parent callback with deferred value for onChange mode
  React.useEffect(() => {
    if (onColumnResizeChange) {
      onColumnResizeChange(deferredColumnSizing);
    }
  }, [deferredColumnSizing, onColumnResizeChange]);

  // Notify parent of filter changes
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange(deferredFilterState);
    }
  }, [deferredFilterState, onFilterChange]);

  // Track global mouse events during resize to keep handle visible
  const isResizingColumn = table.getState().columnSizingInfo.isResizingColumn;

  React.useEffect(() => {
    const handleMouseUp = () => {
      setResizeHandleHover(null);
    };

    const handleMouseMove = () => {
      const resizingColumn = table.getState().columnSizingInfo.isResizingColumn;
      if (resizingColumn && typeof resizingColumn === "string") {
        setResizeHandleHover(resizingColumn);
      }
    };

    if (enableColumnResizing) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);

      return () => {
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [enableColumnResizing, isResizingColumn, table]);

  // Move event handlers and memoized values here, after all variables and table are defined
  const handlePageChange = React.useCallback(
    (newPage: number) => {
      const newPageIndex = Math.max(0, newPage - 1);
      if (paginationMode === "server") {
        if (onPageChange) {
          onPageChange(newPage);
        }
      } else {
        table.setPageIndex(newPageIndex);
      }
    },
    [paginationMode, onPageChange, table]
  );

  const handlePageSizeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = Number(e.target.value);
      if (paginationMode === "server") {
        if (onPageSizeChange) {
          onPageSizeChange(newSize);
        }
        if (onPageChange) {
          onPageChange(1);
        }
      } else {
        table.setPageSize(newSize);
      }
    },
    [paginationMode, onPageSizeChange, onPageChange, table]
  );

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(deferredPageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      if (paginationMode === "server") {
        if (onPageChange) {
          onPageChange(pageNumber);
        }
      } else {
        table.setPageIndex(pageNumber - 1);
      }
    } else {
      setPageInput(String(displayPage));
    }
  };

  const handlePageInputBlur = () => {
    const pageNumber = parseInt(deferredPageInput, 10);
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
      setPageInput(String(displayPage));
    }
  };

  const handlePageInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handlePageInputSubmit(e);
    }
  };

  // Pagination values
  const displayPage =
    paginationMode === "server"
      ? currentPage
      : (table?.getState().pagination.pageIndex ?? 0) + 1;

  const displayPageSize =
    paginationMode === "server"
      ? currentPageSize
      : (table?.getState().pagination.pageSize ?? currentPageSize);

  // Determine the correct total rows count based on whether grouping is active
  const isGroupingActive = React.useMemo(() => {
    const groupByFilter = filterConfigs.find(
      (filter) => filter.type === "groupBy" && localIFilterState[filter.id]
    );
    return !!(groupByFilter && localIFilterState[groupByFilter.id]);
  }, [filterConfigs, localIFilterState]);

  const displayTotalRows = React.useMemo(() => {
    if (paginationMode === "server") {
      return totalCount;
    }

    // When grouping is active, use the length of grouped data
    if (isGroupingActive) {
      return groupedData.length;
    }

    // Otherwise use the length of filtered data
    return filteredData.length;
  }, [
    paginationMode,
    totalCount,
    isGroupingActive,
    groupedData.length,
    filteredData.length,
  ]);

  const totalPages = Math.max(1, Math.ceil(displayTotalRows / displayPageSize));

  // Update page input when current page changes
  React.useEffect(() => {
    setPageInput(String(displayPage));
  }, [displayPage]);

  // Memoize filter handlers to prevent unnecessary re-renders
  const handleFilterChange = React.useCallback((newFilters: IFilterState) => {
    setLocalIFilterState(newFilters);
  }, []);

  const handleClearAllFilters = React.useCallback(() => {
    setLocalIFilterState({});
  }, []);

  // Memoize outside filter handlers
  const handleOutsideFilterChange = React.useCallback(
    (newFilters: IFilterState) => {
      setLocalIFilterState((prev) => ({
        ...prev,
        ...newFilters,
      }));
    },
    []
  );

  const handleOutsideFilterClear = React.useCallback((filterId: string) => {
    setLocalIFilterState((prev) => {
      const newState = { ...prev };
      delete newState[filterId];
      return newState;
    });
  }, []);

  return {
    // Table instance
    table,

    // State
    columnSizing,
    resizeHandleHover,
    setResizeHandleHover,
    localIFilterState,
    pageInput,
    showFilters,
    setShowFilters,

    // Computed values
    shouldShowCheckbox,
    columnStyles,
    filteredData,
    groupedData,
    outsideFilters,
    panelFilters,
    activeFilterCount,
    displayPage,
    displayPageSize,
    displayTotalRows,
    totalPages,

    // Handlers
    handlePageChange,
    handlePageSizeChange,
    handlePageInputChange,
    handlePageInputSubmit,
    handlePageInputBlur,
    handlePageInputKeyPress,
    handleFilterChange,
    handleClearAllFilters,
    handleOutsideFilterChange,
    handleOutsideFilterClear,

    // Props
    paginationMode,
    pageSizeOptions,
    searchValue,
    searchPlaceholder,
    onSearchChange,
    searchClassName,
    enableColumnVisibility,
    onViewModeChange,
    showViewModeChange,
    viewMode,
    gridConfig,
    loading,
    emptyText,
    tableLayout,
    actions,
    getRowId,
    selectedRowIds,
    headerMoreButtons,
    getRowClassName,
    enableRowSelection,
  };
}
