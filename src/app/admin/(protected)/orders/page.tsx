"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { IOrderDetail } from "@/types/order";
import { getOrders } from "@/lib/actions/order";
import usePaginatedQuery from "@/hooks/usePaginatedQuery";
import { getColumnOrdering } from "@/components/common/DataTable/DataTableUtils";
import { formatDate, manipulateDate } from "@/lib/calendar";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import DataTable from "@/components/common/DataTable/DataTable";
import { IPaginationParams } from "@/types/query";
import { Badge } from "@/components/ui/badge";
import { pluralize } from "@/lib/utils";
import { OrderManage } from "@/components/admin/order-manage";

const PaymentStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

// const PaymentMethodOptions = [
//   { label: "COD", value: "cod" },
//   { label: "Online Payment", value: "online" },
// ];

const filters: IFilterConfig[] = [
  {
    id: "payment_status",
    label: "Payment Status",
    type: "select",
    field: "payment_status",
    placeholder: "All Payment Status",
    options: PaymentStatusOptions,
    width: "w-90",
    showOutside: true,
  },
  // {
  //   id: "payment_method",
  //   label: "Payment Method",
  //   type: "select",
  //   field: "payment_method",
  //   placeholder: "All Payment Methods",
  //   options: PaymentMethodOptions,
  //   width: "w-90",
  //   showOutside: true,
  // },
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
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterState, setFilterState] = useState<IFilterState>({});
  const [isOrderManageOpen, setIsOrderManageOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderDetail | null>(null);

  const params: IPaginationParams = useMemo(() => {
    const createdAtLte = filterState?.created_at?.to
      ? formatDate.iso(manipulateDate.addDays(filterState?.created_at?.to, 1))
      : undefined;
    return {
      page,
      page_size: pageSize,
      search: search,
      ordering: getColumnOrdering(sorting),
      payment_status: filterState.payment_status,
      payment_method: filterState.payment_method,
      created_at_gte: filterState.created_at?.from
        ? formatDate.iso(filterState.created_at?.from)
        : undefined,
      created_at_lte: createdAtLte,
    };
  }, [page, pageSize, search, sorting, filterState]);

  const { data, isLoading, error } = usePaginatedQuery(
    ["orders", params],
    getOrders,
    params
  );

  const rowsData = useMemo(() => data?.data || [], [data?.data]);

  useEffect(() => setPage(1), [search, sorting, filterState]);

  const handleViewOrder = useCallback((order: IOrderDetail) => {
    setSelectedOrder(order);
    setIsOrderManageOpen(true);
  }, []);

  const handleCloseOrderManage = useCallback(() => {
    setIsOrderManageOpen(false);
    setSelectedOrder(null);
  }, []);

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "warning" as const, label: "Pending" },
      paid: { variant: "success" as const, label: "Paid" },
      failed: { variant: "destructive" as const, label: "Failed" },
      refunded: { variant: "outline" as const, label: "Refunded" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      cod: { variant: "outline" as const, label: "COD" },
      online: { variant: "outline" as const, label: "Online" },
    };

    const config =
      methodConfig[method as keyof typeof methodConfig] || methodConfig.cod;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: ColumnDef<(typeof rowsData)[0]>[] = useMemo(
    () => [
      {
        accessorKey: "order_number",
        header: "Order ID",
        meta: {
          width: "200px",
          wrapperClassName: "text-foreground text-left font-mono text-sm",
        },
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original?.order_number}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "customer_name",
        header: "Customer Name",
        meta: {
          width: "250px",
          wrapperClassName: "text-foreground text-center truncate",
        },
        cell: ({ row }) => row.original?.customer_name,
        enableSorting: true,
      },
      {
        accessorKey: "payment_status",
        header: "Payment Status",
        meta: {
          width: "150px",
          minWidth: "150px",
          maxWidth: "150px",
          wrapperClassName: "text-center flex justify-center",
        },
        cell: ({ row }) =>
          getPaymentStatusBadge(row.original?.payment_status || "pending"),
        enableSorting: false,
      },
      {
        accessorKey: "payment_method",
        header: "Payment Method",
        meta: {
          width: "150px",
          minWidth: "150px",
          maxWidth: "150px",
          wrapperClassName: "text-center flex justify-center",
        },
        cell: ({ row }) =>
          getPaymentMethodBadge(row.original?.payment_method || "cod"),
        enableSorting: false,
      },
      {
        accessorKey: "total_amount",
        header: "Total Amount",
        meta: {
          width: "150px",
          minWidth: "150px",
          maxWidth: "150px",
          wrapperClassName: "text-foreground text-center font-semibold",
        },
        cell: ({ row }) => (
          <span className="font-semibold">
            ₹{row.original?.total_amount?.toLocaleString()}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "item_count",
        header: "Products",
        meta: {
          width: "120px",
          minWidth: "120px",
          maxWidth: "120px",
          wrapperClassName: "text-center",
        },
        cell: ({ row }) => {
          const totalItems = row.original?.order_items?.reduce(
            (acc, item) => acc + item.quantity,
            0
          );
          const totalProducts = row.original?.order_items?.length || 0;
          return (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {totalProducts} {pluralize("product", totalProducts)}
              </span>
              <span className="text-sm text-muted-foreground">
                {totalItems} {pluralize("item", totalItems)}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        meta: {
          width: "180px",
          minWidth: "180px",
          maxWidth: "180px",
          wrapperClassName: "text-foreground text-center",
        },
        cell: ({ row }) =>
          row.original?.created_at
            ? formatDate.long(row.original.created_at!)
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
              onClick={() => handleViewOrder(row.original)}
            >
              <PencilIcon className="size-3" />
              Manage
            </Button>
          </div>
        ),
        meta: {
          width: "100px",
          minWidth: "80px",
        },
        enableSorting: false,
      },
    ],
    [handleViewOrder]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track order status
          </p>
        </div>
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
          fields: ["order_number", "customer_name"],
          placeholder: "Search by order number or customer name...",
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
        ui={{ loading: isLoading, emptyText: "No orders found" }}
      />

      {/* Order Management Dialog */}
      <OrderManage
        isOpen={isOrderManageOpen}
        onClose={handleCloseOrderManage}
        order={selectedOrder}
      />
    </div>
  );
}
