"use client";
import React from "react";
import { ColumnMeta, flexRender, Row, Table } from "@tanstack/react-table";
import { useDataTableLogic } from "@/components/common/DataTable/DataTableLogic";
import { Checkbox, IndeterminateCheckbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  Columns4Icon,
  SearchIcon,
  TableIcon,
  Grid3X3Icon,
  EyeIcon,
  FilterIcon,
  SettingsIcon,
  DownloadIcon,
  RefreshCwIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TooltipSimple } from "@/components/ui/tooltip";
import { DataTableFilters } from "@/components/common/DataTable/DataTableFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";

interface IColumnMeta<T, V> extends ColumnMeta<T, V> {
  className?: string;
  hideTitle?: boolean;
  wrapperClassName?: string;
}

// Memoized Search Input Component
const SearchInput = React.memo(
  ({
    searchValue,
    searchPlaceholder,
    onSearchChange,
    searchClassName,
  }: {
    searchValue: string;
    searchPlaceholder: string;
    onSearchChange: (value: string) => void;
    searchClassName?: string;
  }) => {
    const [localSearchValue, setLocalSearchValue] = React.useState(searchValue);
    const [debouncedSearchValue] = useDebounce(localSearchValue, 1000);

    // Update local value when prop changes
    React.useEffect(() => {
      setLocalSearchValue(searchValue);
    }, [searchValue]);

    // Debounce the search callback
    React.useEffect(() => {
      if (debouncedSearchValue !== searchValue) {
        onSearchChange(debouncedSearchValue);
      }
    }, [debouncedSearchValue, onSearchChange, searchValue]);

    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchValue(e.target.value);
      },
      []
    );

    return (
      <div className={cn("relative w-full max-w-sm min-w-48", searchClassName)}>
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={searchPlaceholder}
          value={localSearchValue}
          onChange={handleInputChange}
          className={cn("h-9 pl-10")}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

// GridCard component
function GridCard<T extends { id: string | number }>({
  item,
  isSelected,
  onCardClick,
  renderCard,
  getRowId,
}: IGridCardProps<T>) {
  if (renderCard) {
    return (
      <div
        key={getRowId(item)}
        onClick={() => onCardClick?.(item)}
        className="h-full"
      >
        {renderCard(item)}
      </div>
    );
  }

  // Default card rendering
  return (
    <div
      key={getRowId(item)}
      className={`bg-card flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow ${
        isSelected ? "border-primary ring-primary/20 ring-2" : "border-border"
      }`}
      onClick={() => onCardClick?.(item)}
    >
      <div className="border-border/50 flex-1 border-b p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-card-foreground text-sm font-semibold">
              {String(item.id)}
            </h3>
            <p className="text-muted-foreground text-xs">Item Details</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <div className="text-muted-foreground text-xs">Details</div>
              <div className="text-muted-foreground max-w-[150px] truncate text-xs">
                Click to view more information
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted/50 flex-shrink-0 p-4">
        <button className="border-border bg-background text-primary hover:bg-accent flex w-full items-center justify-center rounded-md border py-2 text-xs font-medium transition-colors duration-200">
          <EyeIcon className="mr-1.5 h-3.5 w-3.5" />
          View Details
        </button>
      </div>
    </div>
  );
}

export const TableFilterSkeleton = React.memo(
  ({ className }: { className?: string }) => (
    <Skeleton
      className={cn("bg-foreground/10 h-22 w-full rounded-lg", className)}
    />
  )
);

TableFilterSkeleton.displayName = "TableFilterSkeleton";

// Skeleton components for loading states
export const TableSkeleton = React.memo(() => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead>
        <tr className="bg-muted border-border border-b">
          {Array.from({ length: 5 }).map((_, index) => (
            <th key={index} className="px-4 py-3 text-center">
              <Skeleton className="mx-auto h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <tr key={rowIndex} className="border-border h-15 border-b">
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <td key={colIndex} className="bg-background px-4 py-3">
                <Skeleton className="h-6 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

TableSkeleton.displayName = "TableSkeleton";

export const GridSkeleton = React.memo(() => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="bg-card border-border space-y-3 rounded-lg border p-5"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="pt-2">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    ))}
  </div>
));

GridSkeleton.displayName = "GridSkeleton";

// Memoize GridCard
const MemoizedGridCard = React.memo(GridCard) as typeof GridCard;

// Memoized TableRow component
const MemoizedTableRow = React.memo(function TableRow({
  row,
  shouldShowCheckbox,
  columnStyles,
  rowClassName = "",
}: {
  row: Row<any>;
  shouldShowCheckbox: boolean;
  columnStyles: Record<string, React.CSSProperties>;
  rowClassName?: string;
}) {
  return (
    <tr
      key={row.id}
      className={cn(
        "bg-card border-border hover:bg-primary/10 border-b",
        // Add group row styling
        (row.original as any)?.type === "group" && "bg-muted/50 font-medium",
        rowClassName
      )}
      data-state={row.getIsSelected() && "selected"}
      data-group={(row.original as any)?.type === "group" ? "true" : "false"}
    >
      {shouldShowCheckbox && (
        <td
          className="px-3 py-3 text-center"
          style={{ width: "48px", minWidth: "48px", maxWidth: "48px" }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(checked: boolean) =>
              row.toggleSelected(!!checked)
            }
            className="data-[state=unchecked]:bg-background cursor-pointer"
            aria-label="Select row"
          />
        </td>
      )}
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta as IColumnMeta<any, unknown>;
        const style = columnStyles[cell.column.id] || {};
        return (
          <td
            key={cell.id}
            className={cn("px-4 py-3", meta?.className)}
            style={{ ...style, overflow: "hidden" }}
          >
            <div
              className={cn(
                "w-full truncate",
                meta?.wrapperClassName,
                // Add flex layout for group rows
                (row.original as any)?.type === "group" &&
                  "flex items-center gap-2"
              )}
              title={
                meta?.hideTitle
                  ? undefined
                  : typeof cell.getValue() === "string"
                  ? (cell.getValue() as string)
                  : undefined
              }
            >
              {(() => {
                const item = row.original as any;
                if (item.type === "group") {
                  // Group header row
                  return (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item[cell.column.id] || item.groupValue}
                      </span>
                      {cell.column.id === item.groupField && (
                        <span className="text-muted-foreground text-sm">
                          ({item.groupSize} items)
                        </span>
                      )}
                    </div>
                  );
                } else if (item.type === "group-item" && item.isFirstInGroup) {
                  // First item in group - show with count
                  return (
                    <div className="flex items-center gap-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                      {cell.column.id === item.groupField && (
                        <span className="text-muted-foreground text-sm">
                          ({item.totalInGroup} total)
                        </span>
                      )}
                    </div>
                  );
                } else {
                  // Regular row
                  return flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  );
                }
              })()}
            </div>
          </td>
        );
      })}
    </tr>
  );
});

// Memoized Table Header Component
const TableHeader = React.memo(
  ({
    table,
    shouldShowCheckbox,
    columnStyles,
    columnSizing,
    resizeHandleHover,
    setResizeHandleHover,
  }: {
    table: Table<any>;
    shouldShowCheckbox: boolean;
    columnStyles: Record<string, React.CSSProperties>;
    columnSizing: Record<string, number>;
    resizeHandleHover: string | null;
    setResizeHandleHover: (id: string | null) => void;
  }) => {
    return (
      <thead>
        <tr className="bg-muted/20 border-border border-b">
          {shouldShowCheckbox && (
            <th
              className="text-muted-foreground px-4 py-3 text-center text-xs font-medium tracking-wider uppercase"
              style={{
                width: "48px",
                minWidth: "48px",
                maxWidth: "48px",
              }}
            >
              <IndeterminateCheckbox
                checked={table.getIsAllPageRowsSelected() as boolean}
                indeterminate={table.getIsSomePageRowsSelected()}
                onCheckedChange={(checked: boolean) =>
                  table.toggleAllPageRowsSelected(!!checked)
                }
                aria-label="Select all"
              />
            </th>
          )}
          {table.getHeaderGroups()[0].headers.map((header: any) => {
            const col = header.column;
            const isSorted = col.getIsSorted();
            const meta = col.columnDef.meta as
              | {
                  className?: string;
                  width?: string | number;
                  minWidth?: string | number;
                  maxWidth?: string | number;
                }
              | undefined;

            const style = columnStyles[col.id] || {};

            return (
              <th
                key={col.id}
                className={`text-muted-foreground px-4 py-3 text-center text-xs font-medium tracking-wider uppercase ${
                  meta?.className || ""
                } ${col.getCanSort() ? "cursor-pointer select-none" : ""} ${
                  isSorted ? "text-primary" : ""
                }`}
                onClick={
                  col.getCanSort() ? col.getToggleSortingHandler() : undefined
                }
                style={{
                  ...style,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div className="flex items-center justify-center truncate">
                  {col.columnDef.header as React.ReactNode}
                  {col.getCanSort() &&
                    (isSorted === "asc" ? (
                      <ArrowUpIcon className="ml-1 h-3 w-3 flex-shrink-0" />
                    ) : isSorted === "desc" ? (
                      <ArrowDownIcon className="ml-1 h-3 w-3 flex-shrink-0" />
                    ) : (
                      <ArrowUpDownIcon className="ml-1 h-3 w-3 flex-shrink-0" />
                    ))}
                </div>
                {columnSizing && (
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onMouseEnter={() => setResizeHandleHover(header.id)}
                    onMouseLeave={() => {
                      if (
                        table.getState().columnSizingInfo.isResizingColumn !==
                        header.id
                      ) {
                        setResizeHandleHover(null);
                      }
                    }}
                    className={`absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none transition-colors duration-150 select-none ${
                      table.getState().columnSizingInfo.isResizingColumn ===
                        header.id || resizeHandleHover === header.id
                        ? "bg-primary opacity-100"
                        : "bg-border/30 hover:bg-primary/50 hover:opacity-100"
                    }`}
                    style={{
                      transform:
                        table.getState().columnSizingInfo.isResizingColumn ===
                        header.id
                          ? `translateX(${
                              table.getState().columnSizingInfo.deltaOffset
                            }px)`
                          : "",
                    }}
                  >
                    <div className="bg-border absolute top-1/2 right-0 h-4 w-1 -translate-y-1/2 opacity-0 hover:opacity-100" />
                  </div>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }
);

TableHeader.displayName = "TableHeader";

export function DataTableUI<T extends { id: string | number }>({
  logic,
}: {
  logic: ReturnType<typeof useDataTableLogic<T>>;
}) {
  const {
    table,
    columnSizing,
    resizeHandleHover,
    setResizeHandleHover,
    localIFilterState,
    pageInput,
    showFilters,
    setShowFilters,
    shouldShowCheckbox,
    columnStyles,
    outsideFilters,
    panelFilters,
    activeFilterCount,
    displayPage,
    displayPageSize,
    displayTotalRows,
    totalPages,
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
    pageSizeOptions,
    searchValue,
    searchPlaceholder,
    onSearchChange,
    searchClassName,
    enableColumnVisibility,
    onViewModeChange,
    viewMode,
    gridConfig,
    loading,
    emptyText,
    tableLayout,
    actions,
    getRowId,
    selectedRowIds,
    showViewModeChange,
    headerMoreButtons,
    getRowClassName,
  } = logic;

  // Get current page rows
  const currentPageRows = table.getRowModel().rows;

  // Memoize row mapping for table view with group support
  const tableRows = React.useMemo(() => {
    return currentPageRows.map((row) => {
      const customClassName = getRowClassName?.(row) || "";

      // Regular data row
      return (
        <MemoizedTableRow
          key={row.id}
          row={row}
          shouldShowCheckbox={shouldShowCheckbox}
          columnStyles={columnStyles}
          rowClassName={customClassName} // Pass the custom rowClassName
        />
      );
    });
  }, [currentPageRows, shouldShowCheckbox, columnStyles, getRowClassName]);

  // Memoize row mapping for grid view
  const gridRows = React.useMemo(() => {
    return currentPageRows.map((row) => {
      const item = row.original;
      const isSelected = selectedRowIds.includes(getRowId(item));
      return (
        <MemoizedGridCard
          key={getRowId(item)}
          item={item}
          isSelected={isSelected}
          onCardClick={gridConfig?.onCardClick}
          renderCard={gridConfig?.renderCard}
          getRowId={getRowId}
        />
      );
    });
  }, [currentPageRows, selectedRowIds, getRowId, gridConfig]);

  // Memoize the search change handler
  const memoizedOnSearchChange = React.useCallback(
    (value: string) => {
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  return (
    <div className="mb-6 text-center">
      {/* Table Header with Search, Filters, and Column Controls */}
      {(onSearchChange ||
        enableColumnVisibility ||
        onViewModeChange ||
        outsideFilters.length > 0 ||
        panelFilters.length > 0 ||
        actions?.showRefresh ||
        actions?.showExport) && (
        <div className="bg-card border-border mb-4 flex flex-wrap items-start justify-between gap-2 rounded-lg border px-4 py-3 shadow-sm">
          {/* Search and Filter Controls */}
          <div className="flex flex-1 flex-wrap items-end gap-2">
            {/* Search Input */}
            {onSearchChange && (
              <SearchInput
                searchValue={searchValue}
                searchPlaceholder={searchPlaceholder}
                onSearchChange={memoizedOnSearchChange}
                searchClassName={searchClassName}
              />
            )}

            {/* Outside Filters - Filters that should be shown next to search */}
            {outsideFilters.map((filter) => (
              <div key={filter.id} className="flex-shrink-0">
                <DataTableFilters
                  filters={[filter]}
                  filterState={localIFilterState}
                  onFilterChange={(newFilters) => {
                    handleOutsideFilterChange(newFilters);
                  }}
                  onClearAll={() => {
                    handleOutsideFilterClear(filter.id);
                  }}
                  className="inline-block"
                />
              </div>
            ))}
          </div>

          {/* Actions and Controls */}
          <div
            className={`ml-auto flex items-center justify-end gap-2 ${
              outsideFilters.length > 0 ? "mt-auto" : "mt-0"
            }`}
          >
            {/* Filter Toggle - Only show if there are filters that don't have showOutside */}
            {panelFilters.length > 0 && (
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FilterIcon className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}
            {/* Actions Menu */}
            {(actions?.showRefresh || actions?.showExport) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions?.showRefresh && (
                    <DropdownMenuItem onClick={actions.onRefresh}>
                      <RefreshCwIcon className="mr-2 h-4 w-4" />
                      Refresh
                    </DropdownMenuItem>
                  )}
                  {actions?.showExport && (
                    <DropdownMenuItem onClick={actions.onExport}>
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {headerMoreButtons && (
              <div className="flex items-center gap-2">{headerMoreButtons}</div>
            )}

            {/* Column Visibility Toggle */}
            {enableColumnVisibility && viewMode === "table" && (
              <DropdownMenu>
                <TooltipSimple content="Columns">
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default">
                      <Columns4Icon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipSimple>
                <DropdownMenuContent align="end">
                  {table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.columnDef?.header as string}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* View Mode Toggle */}
            {showViewModeChange && onViewModeChange && (
              <div className="border-border rounded-md border">
                <TooltipSimple content="Table View">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="default"
                    onClick={() => onViewModeChange("table")}
                    className="border-border rounded-r-none border-r"
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </TooltipSimple>
                <TooltipSimple content="Grid View">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="default"
                    onClick={() => onViewModeChange("grid")}
                    className="rounded-l-none"
                  >
                    <Grid3X3Icon className="h-4 w-4" />
                  </Button>
                </TooltipSimple>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {panelFilters.length > 0 && showFilters && (
        <div className="bg-card border-border mb-4 rounded-lg border p-4 shadow-sm">
          <DataTableFilters
            filters={panelFilters}
            filterState={localIFilterState}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAllFilters}
          />
        </div>
      )}

      {/* Table/Grid Content */}
      <div
        className={`bg-foreground-50 overflow-hidden rounded-lg ${
          viewMode === "table" ? "border-border border" : ""
        }`}
      >
        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="relative">
            {loading ? (
              <GridSkeleton />
            ) : table.getRowModel().rows.length > 0 ? (
              <div
                className={`grid gap-4 ${
                  gridConfig?.columns
                    ? `grid-cols-1 ${
                        gridConfig?.columns?.sm
                          ? `sm:grid-cols-${gridConfig.columns.sm}`
                          : ""
                      } ${
                        gridConfig?.columns?.md
                          ? `md:grid-cols-${gridConfig.columns.md}`
                          : ""
                      } ${
                        gridConfig?.columns?.lg
                          ? `lg:grid-cols-${gridConfig.columns.lg}`
                          : ""
                      } ${
                        gridConfig?.columns?.xl
                          ? `xl:grid-cols-${gridConfig.columns.xl}`
                          : ""
                      }`
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                }`}
                style={{ gridAutoRows: "1fr" }}
              >
                {gridRows}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                {emptyText}
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="relative">
            {loading ? (
              <div className="p-4">
                <TableSkeleton />
              </div>
            ) : (
              <div className="text-muted-foreground overflow-x-auto text-sm">
                <table
                  key={JSON.stringify(table.getState().columnVisibility)}
                  className="data-table-fixed min-w-full"
                  style={{ tableLayout, width: "100%" }}
                >
                  <colgroup>
                    {shouldShowCheckbox && (
                      <col
                        style={{
                          width: "48px",
                          minWidth: "48px",
                          maxWidth: "48px",
                        }}
                      />
                    )}
                    {table.getHeaderGroups()[0].headers.map((header) => {
                      const style = columnStyles[header.column.id] || {};
                      return <col key={header.id} style={style} />;
                    })}
                  </colgroup>
                  <TableHeader
                    table={table}
                    shouldShowCheckbox={shouldShowCheckbox}
                    columnStyles={columnStyles}
                    columnSizing={columnSizing}
                    resizeHandleHover={resizeHandleHover}
                    setResizeHandleHover={setResizeHandleHover}
                  />
                  <tbody>
                    {currentPageRows.length > 0 ? (
                      tableRows
                    ) : (
                      <tr className={`hover:bg-primary/10`}>
                        <td
                          colSpan={
                            table.getHeaderGroups()[0].headers.length +
                            (shouldShowCheckbox ? 1 : 0)
                          }
                          className="text-muted-foreground py-8 text-center"
                        >
                          {emptyText}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls - Consistent for both views */}
        <div
          className={`${
            viewMode === "grid" ? "bg-foreground-50" : "bg-card"
          } border-border flex items-center justify-between px-4 py-3 text-sm sm:px-6 ${
            viewMode === "table" ? "border-t" : ""
          }`}
        >
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(displayPage - 1)}
              disabled={displayPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(displayPage + 1)}
              disabled={displayPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-card-foreground text-sm">
                Showing{" "}
                <span className="font-medium">
                  {(displayPage - 1) * displayPageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(displayPage * displayPageSize, displayTotalRows)}
                </span>{" "}
                of <span className="font-medium">{displayTotalRows}</span>{" "}
                {viewMode === "table" ? "results" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-card-foreground text-sm">
                  {viewMode === "table" ? "Rows" : "Items"} per page:
                </span>
                <Select
                  value={String(displayPageSize)}
                  onValueChange={(value) =>
                    handlePageSizeChange({ target: { value } } as any)
                  }
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <nav
                className="relative z-0 inline-flex -space-x-px rounded-md"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-md"
                  onClick={() => handlePageChange(displayPage - 1)}
                  disabled={displayPage === 1}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  <span className="sr-only">Previous</span>
                </Button>
                <div className="flex items-center">
                  <span className="text-card-foreground px-2 text-sm">
                    Page
                  </span>
                  <form
                    onSubmit={handlePageInputSubmit}
                    className="flex items-center"
                  >
                    <Input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageInput}
                      onChange={handlePageInputChange}
                      onBlur={handlePageInputBlur}
                      onKeyPress={handlePageInputKeyPress}
                      className="border-foreground h-8 w-16 rounded-none text-center text-sm"
                      aria-label="Go to page"
                    />
                  </form>
                  <span className="text-card-foreground px-2 text-sm">
                    of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-r-md"
                  onClick={() => handlePageChange(displayPage + 1)}
                  disabled={displayPage === totalPages}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                  <span className="sr-only">Next</span>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
