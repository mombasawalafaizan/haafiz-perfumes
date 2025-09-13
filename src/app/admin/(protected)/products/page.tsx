"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, StarIcon, EyeIcon, CheckIcon, XIcon } from "lucide-react";
import { IProduct } from "@/types/product";
import { getProducts } from "@/lib/actions/product";
import usePaginatedQuery from "@/hooks/usePaginatedQuery";
import { getColumnOrdering } from "@/components/common/DataTable/DataTableUtils";
import { formatDate } from "@/lib/calendar";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import DataTable from "@/components/common/DataTable/DataTable";
import { IPaginationParams } from "@/types/query";
import { Badge } from "@/components/ui/badge";

const CategoryOptions = [
  { label: "Perfume", value: "perfume" },
  { label: "Attar", value: "attar" },
];

const filters: IFilterConfig[] = [
  {
    id: "category",
    label: "Category",
    type: "select",
    field: "category",
    placeholder: "All Categories",
    options: CategoryOptions,
    width: "w-90",
    showOutside: true,
  },
  {
    id: "created_at",
    label: "Created Between",
    type: "dateRangeWithOptions",
    field: "created_at",
    placeholder: "Select date range",
    dateFormat: "MMM dd, yyyy",
    showOutside: true,
    width: "280px",
  },
  {
    id: "is_featured",
    label: "Featured",
    type: "switch",
    field: "is_featured",
    icon: StarIcon,
    defaultValue: false,
    showOutside: true,
  },
];

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterState, setFilterState] = useState<IFilterState>({});

  const params: IPaginationParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search,
      ordering: getColumnOrdering(sorting),
      category: filterState.category,
      created_at_gte: formatDate.iso(filterState.created_at?.from),
      created_at_lte: formatDate.iso(filterState.created_at?.to),
      is_featured: filterState.is_featured ? true : undefined,
    }),
    [page, pageSize, search, sorting, filterState]
  );

  const { data, isLoading, error } = usePaginatedQuery(
    ["products"],
    getProducts,
    params
  );

  useEffect(() => setPage(1), [search, sorting, filterState]);

  const columns: ColumnDef<IProduct>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: {
          width: "300px",
          wrapperClassName: "text-foreground text-left w-full truncate",
        },
        cell: ({ row }) => row.original.name,
        enableSorting: true,
      },
      {
        accessorKey: "description",
        header: "Description",
        meta: {
          wrapperClassName: "text-foreground truncate text-left",
        },
        cell: ({ row }) => row.original.description,
        enableSorting: false,
      },
      {
        accessorKey: "category",
        header: "Category",
        meta: {
          width: "130px",
          minWidth: "130px",
          maxWidth: "130px",
          wrapperClassName: "text-foreground text-center flex justify-center",
        },
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize">
            {row.original.category}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "is_featured",
        header: "Featured",
        meta: {
          width: "130px",
          minWidth: "130px",
          maxWidth: "130px",
          wrapperClassName: "flex justify-center",
        },
        cell: ({ row }) =>
          row.original.is_featured ? <CheckIcon /> : <XIcon />,
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        meta: {
          width: "130px",
          minWidth: "130px",
          maxWidth: "130px",
          wrapperClassName: "text-foreground text-center",
        },
        cell: ({ row }) => formatDate.long(row.original.created_at!),
        enableSorting: true,
      },
      {
        accessorKey: "updated_at",
        header: "Updated At",
        meta: {
          width: "130px",
          minWidth: "130px",
          maxWidth: "130px",
          wrapperClassName: "text-foreground text-center",
        },
        cell: ({ row }) => formatDate.long(row.original.updated_at!),
        enableSorting: true,
      },

      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({}) => (
          <div className="flex flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="xs"
              className="text-xs"
              onClick={() => null}
            >
              <EyeIcon className="size-3" />
              View
            </Button>
          </div>
        ),
        meta: {
          width: "150px",
          minWidth: "80px",
        },
        enableSorting: false,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {error && <div className="text-destructive">{error.message}</div>}

      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={{
          mode: "server",
          page,
          pageSize,
          totalCount: data?.count || 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        selection={{ showCheckbox: false }}
        sorting={{ state: sorting, onSortingChange: setSorting }}
        search={{
          value: search,
          onSearchChange: setSearch,
          fields: ["name", "description"],
          placeholder: "Search...",
          searchClassName: "w-90",
        }}
        filters={{
          configs: filters,
          state: filterState,
          onFilterChange: setFilterState,
          mode: "server",
        }}
        view={{ mode: "table", showViewModeChange: false }}
        columnConfig={{ enableVisibility: true, enableResizing: true }}
        ui={{ loading: isLoading, emptyText: "No products found" }}
      />
    </div>
  );
}
