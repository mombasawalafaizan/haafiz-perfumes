"use client";

import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Truck } from "lucide-react";
import Link from "next/link";
import {
  calculateShipping,
  calculateTotalWithShipping,
  getShippingTierDescription,
} from "@/lib/utils";

export function CheckoutSummary() {
  const { items: cartItems } = useCart();

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateShippingInfo = () => {
    const subtotal = calculateSubtotal();
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return calculateShipping(subtotal, totalQuantity);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingInfo = calculateShippingInfo();
    return calculateTotalWithShipping(subtotal, shippingInfo.shipping_amount);
  };

  if (cartItems.length === 0) {
    return (
      <div className="sticky top-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild>
                <Link href="/collections">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="sticky top-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={`${item.product_id}-${item.variant_id}`}
                className="flex items-center gap-3"
              >
                <div className="w-16 h-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                  {item.product_snapshot?.image_url ? (
                    <Image
                      src={item.product_snapshot.image_url}
                      alt={item.product_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 min-w-0 max-w-sm flex-1 justify-between">
                  <h4 className="font-medium text-sm line-clamp-2 truncate">
                    {item.product_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.product_volume}ml • {item.product_quality}
                  </p>
                  <div className="flex items-center ">
                    <span className="text-sm font-medium mr-2">
                      ₹{item.unit_price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-foreground" />

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            {(() => {
              const shippingInfo = calculateShippingInfo();
              const totalQuantity = cartItems.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    <span>Shipping</span>
                    {!shippingInfo.is_free_shipping && (
                      <span className="text-xs text-muted-foreground">
                        ({getShippingTierDescription(totalQuantity)})
                      </span>
                    )}
                  </div>
                  <span
                    className={
                      shippingInfo.is_free_shipping
                        ? "text-success font-medium"
                        : ""
                    }
                  >
                    {shippingInfo.is_free_shipping
                      ? "Free"
                      : `₹${shippingInfo.shipping_amount}`}
                  </span>
                </div>
              );
            })()}
            {(() => {
              const shippingInfo = calculateShippingInfo();
              if (!shippingInfo.is_free_shipping) {
                const remainingForFree =
                  shippingInfo.free_shipping_threshold -
                  shippingInfo.total_before_shipping;
                return (
                  <div className="text-xs text-muted-foreground text-center">
                    Add ₹{remainingForFree.toFixed(0)} more for free shipping
                  </div>
                );
              }
              return null;
            })()}
            {/* <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax</span>
              <span>₹0.00</span>
            </div> */}
          </div>

          <Separator className="bg-foreground" />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
          </div>

          {/* Item Count */}
          <div className="text-xs text-muted-foreground text-center">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
