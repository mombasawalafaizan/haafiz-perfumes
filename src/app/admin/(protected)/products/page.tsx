"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  StarIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
} from "lucide-react";
import { IProductDetail } from "@/types/product";
import {
  cloneProduct,
  deleteProduct,
  getProducts,
} from "@/lib/actions/product";
import usePaginatedQuery from "@/hooks/usePaginatedQuery";
import { getColumnOrdering } from "@/components/common/DataTable/DataTableUtils";
import { formatDate, manipulateDate } from "@/lib/calendar";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import DataTable from "@/components/common/DataTable/DataTable";
import { IPaginationParams } from "@/types/query";
import { Badge } from "@/components/ui/badge";
import EditProduct from "@/components/admin/edit-product";
import { pluralize } from "@/lib/utils";
import { toast } from "sonner";

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
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    IProductDetail | undefined
  >();
  const [cloningProductIds, setCloningProductIds] = useState<string[]>([]);
  const [deletingProductIds, setDeletingProductIds] = useState<string[]>([]);
  const params: IPaginationParams = useMemo(() => {
    const createdAtLte = filterState?.created_at?.to
      ? formatDate.iso(manipulateDate.addDays(filterState?.created_at?.to, 1))
      : undefined;
    return {
      page,
      page_size: pageSize,
      search: search,
      ordering: getColumnOrdering(sorting),
      category: filterState.category,
      created_at_gte: filterState.created_at?.from
        ? formatDate.iso(filterState.created_at?.from)
        : undefined,
      created_at_lte: createdAtLte,
      is_featured: filterState.is_featured ? true : undefined,
    };
  }, [page, pageSize, search, sorting, filterState]);

  const { data, isLoading, error, refetch } = usePaginatedQuery(
    ["products"],
    getProducts,
    params
  );

  const onClickDeleteProduct = useCallback(
    async (product: IProductDetail) => {
      setDeletingProductIds((prev) => [...prev, product.id]);
      try {
        const result = await deleteProduct(product.id, product);
        if (result.success) {
          toast.success("Product deleted successfully!");
          refetch();
        } else {
          toast.error(result.error || "Failed to delete product!");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        setDeletingProductIds((prev) => prev.filter((id) => id !== product.id));
      }
    },
    [refetch]
  );

  const rowsData = useMemo(() => data?.data || [], [data?.data]);

  useEffect(() => setPage(1), [search, sorting, filterState]);

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setIsEditProductOpen(true);
  };

  const handleEditProduct = useCallback((product: IProductDetail) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  }, []);

  const handleCloneProduct = useCallback(
    async (product: IProductDetail) => {
      setCloningProductIds((prev) => [...prev, product.id]);
      try {
        const cloneProductRes = await cloneProduct(product.id);
        if (cloneProductRes.success) {
          toast.success("Product cloned successfully!");
          refetch();
        } else {
          toast.error(cloneProductRes.error || "Failed to clone product!");
        }
      } catch (error) {
        console.error("Error cloning product:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to clone product!"
        );
      } finally {
        setCloningProductIds((prev) => prev.filter((id) => id !== product.id));
      }
    },
    [refetch]
  );

  const handleCloseEditProduct = (saved?: boolean) => {
    setIsEditProductOpen(false);
    setSelectedProduct(undefined);
    if (saved === true) refetch();
  };

  const columns: ColumnDef<(typeof rowsData)[0]>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: {
          width: "300px",
          wrapperClassName: "text-foreground text-left w-full truncate",
        },
        cell: ({ row }) => row.original?.name,
        enableSorting: true,
      },
      {
        accessorKey: "images",
        header: "Images",
        meta: {
          width: "130px",
          minWidth: "130px",
          maxWidth: "130px",
          wrapperClassName:
            "flex justify-center text-muted-foreground font-medium",
        },
        cell: ({ row }) =>
          (row.original?.product_images?.length ?? 0) +
          " " +
          pluralize("image", row.original?.product_images?.length ?? 0),
        enableSorting: false,
      },
      {
        accessorKey: "variants",
        header: "Variants Info",
        cell: ({ row }) => (
          <div className="flex flex-col gap-2">
            {row.original?.product_variants?.map((variant, idx) => (
              <div
                key={idx}
                className="text-sm text-muted-foreground font-medium"
              >
                {variant.product_quality} - ₹{variant.price} - ({variant.volume}
                ml) - {variant.variant_images?.length} img
              </div>
            ))}
          </div>
        ),
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
            {row.original?.category}
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
          row.original?.is_featured ? <CheckIcon /> : <XIcon />,
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
        cell: ({ row }) =>
          row.original?.created_at
            ? formatDate.long(row.original.created_at!)
            : "-",
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
        cell: ({ row }) =>
          row.original.updated_at
            ? formatDate.long(row.original.updated_at!)
            : "-",
        enableSorting: true,
      },

      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-row gap-2 justify-center">
            <Button
              variant="info"
              size="xs"
              className="text-xs"
              onClick={() => handleEditProduct(row.original)}
            >
              <EditIcon className="size-3" />
              Edit
            </Button>
            <Button
              variant="secondary"
              size="xs"
              className="text-xs"
              loading={cloningProductIds.includes(row.original.id)}
              onClick={() => handleCloneProduct(row.original)}
            >
              <CopyIcon className="size-3" />
              Clone
            </Button>
            <Button
              variant="error"
              size="xs"
              className="text-xs"
              loading={deletingProductIds.includes(row.original.id)}
              onClick={() => onClickDeleteProduct(row.original)}
            >
              {!deletingProductIds.includes(row.original.id) && (
                <TrashIcon className="size-3" />
              )}
              Delete
            </Button>
          </div>
        ),
        meta: {
          width: "215px",
          minWidth: "215px",
        },
        enableSorting: false,
      },
    ],
    [
      cloningProductIds,
      deletingProductIds,
      onClickDeleteProduct,
      handleCloneProduct,
      handleEditProduct,
    ]
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
        <Button
          className="flex items-center space-x-2"
          onClick={handleAddProduct}
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {error && <div className="text-destructive">{error.message}</div>}

      <DataTable
        columns={columns}
        data={rowsData}
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

      {/* Edit Product Component */}
      {isEditProductOpen && (
        <EditProduct
          isOpen={true}
          onClose={handleCloseEditProduct}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
