"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { IOrderDetail, TOrderStatus, TPaymentStatus } from "@/types/order";
import { updateOrderStatus } from "@/lib/actions/order";
import { formatDate } from "@/lib/calendar";
import { toast } from "sonner";
import { Package, User, MapPin, Phone, Mail, Truck } from "lucide-react";
import Image from "next/image";
import { getAdminQueryClient } from "@/lib/query-client";

interface OrderManageProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrderDetail | null;
}

const ORDER_STATUS_OPTIONS: { value: TOrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS: { value: TPaymentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export function OrderManage({ isOpen, onClose, order }: OrderManageProps) {
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<TOrderStatus>("pending");
  const [newPaymentStatus, setNewPaymentStatus] =
    useState<TPaymentStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setNewPaymentStatus(order.payment_status);
      setAdminNotes(order.admin_notes || "");
      setTrackingNumber(order.tracking_number || "");
    }
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      const result = await updateOrderStatus(
        order.id,
        newStatus,
        newPaymentStatus,
        adminNotes,
        trackingNumber
      );

      if (result.success) {
        toast.success("Order status updated successfully!");
        getAdminQueryClient().invalidateQueries({
          queryKey: ["orders"],
        });
        onClose();
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string, type: "order" | "payment") => {
    const configs = {
      order: {
        pending: { variant: "warning" as const, label: "Pending" },
        confirmed: { variant: "default" as const, label: "Confirmed" },
        processing: { variant: "secondary" as const, label: "Processing" },
        shipped: { variant: "info" as const, label: "Shipped" },
        delivered: { variant: "success" as const, label: "Delivered" },
        cancelled: { variant: "destructive" as const, label: "Cancelled" },
      },
      payment: {
        pending: { variant: "warning" as const, label: "Pending" },
        paid: { variant: "success" as const, label: "Paid" },
        failed: { variant: "destructive" as const, label: "Failed" },
        refunded: { variant: "outline" as const, label: "Refunded" },
      },
    };

    const config =
      configs[type][status as keyof (typeof configs)[typeof type]] ||
      configs[type].pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!order) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-6xl max-h-[95vh] min-w-3xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details - {order.order_number}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Order Number
                    </Label>
                    <p className="font-mono text-sm">{order.order_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Order Date
                    </Label>
                    <p>{formatDate.long(order.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Order Status
                    </Label>
                    <div className="mt-1">
                      {getStatusBadge(order.status, "order")}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Payment Status
                    </Label>
                    <div className="mt-1">
                      {getStatusBadge(order.payment_status, "payment")}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Payment Method
                    </Label>
                    <p className="capitalize">{order.payment_method}</p>
                  </div>
                  {order.razorpay_order_id && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Razorpay Order ID
                      </Label>
                      <p>{order.razorpay_order_id}</p>
                    </div>
                  )}
                  {order.razorpay_payment_id && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Razorpay Payment ID
                      </Label>
                      <p>{order.razorpay_payment_id}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Customer Notes
                      </Label>
                      <p className="capitalize">{order.notes}</p>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Tracking Number
                      </Label>
                      <p className="font-mono text-sm">
                        {order.tracking_number}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Total Amount
                    </Label>
                    <p className="text-lg font-semibold">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Name
                    </Label>
                    <p>{order.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </Label>
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.customer_phone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email
                    </Label>
                    <p className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {order.customer_email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Address
                    </Label>
                    <p className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        {order.customer_address}, {order.customer_city || ""},{" "}
                        {order.customer_state || ""} -{" "}
                        {order.customer_pincode || ""}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Items ({order.order_items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                        {item.product_snapshot?.image_url ? (
                          <Image
                            src={item.product_snapshot.image_url}
                            alt={item.product_name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <h4 className="font-medium text-sm">
                          {item.product_name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.product_quality} - {item.product_volume}ml
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.product_sku}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ₹{item.unit_price.toFixed(2)}
                            </span>
                            {item.unit_mrp > item.unit_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{item.unit_mrp.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-sm font-semibold mt-1">
                          Total: ₹{item.total_price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{order.shipping_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{order.tax_amount.toFixed(2)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Update Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="order-status">Order Status</Label>
                    <Select
                      value={newStatus}
                      onValueChange={(value: TOrderStatus) =>
                        setNewStatus(value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="payment-status">Payment Status</Label>
                    <Select
                      value={newPaymentStatus}
                      onValueChange={(value: TPaymentStatus) =>
                        setNewPaymentStatus(value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(newStatus === "processing" ||
                  newStatus === "shipped" ||
                  newStatus === "delivered") && (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="tracking-number">
                      Tracking Number
                      <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="tracking-number"
                      placeholder="Enter tracking number..."
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for {newStatus} orders
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="admin-notes">Admin Notes</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add notes about this order..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {order && (
            <Button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="flex items-center gap-2"
            >
              {updating ? "Updating..." : "Update Status"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
