"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Plus, Minus, ShoppingBag, Trash2, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { calculateCartMeta } from "@/lib/utils";
import {
  calculateShipping,
  getShippingTierDescription,
  calculateTotalWithShipping as calculateTotalWithShippingUtil,
} from "@/lib/utils";

export function CartSidebar() {
  const router = useRouter();
  const { items, isOpen, setCartOpen, updateQuantity, removeItem } = useCart();
  const { totalPrice, availableSpace } = calculateCartMeta(items);

  // Close cart on browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        setCartOpen(false);
      }
    };

    if (isOpen) {
      // Add a history entry when cart opens
      window.history.pushState({ cartOpen: true }, "");
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, setCartOpen]);

  const handleCheckout = () => {
    setCartOpen(false);
    router.push("/checkout");
  };

  const handleUpdateQuantity = (
    productId: string,
    variantId: string,
    newQuantity: number
  ) => {
    updateQuantity(productId, variantId, newQuantity);
  };

  // const totalSavings = items.reduce((sum, item) => {
  //   return sum + (item.unit_mrp - item.unit_price) * item.quantity;
  // }, 0);

  const calculateShippingInfo = () => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return calculateShipping(totalPrice, totalQuantity);
  };

  const calculateTotals = (options: { withShipping?: boolean }) => {
    const shippingInfo = options.withShipping ? calculateShippingInfo() : null;
    return calculateTotalWithShippingUtil(
      totalPrice,
      shippingInfo?.shipping_amount ?? 0
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="min-w-[350px] w-[95vw] max-w-[600px] p-0 gap-0 border-l-2 border-primary/10"
      >
        <SheetHeader className="p-4 border-b border-primary/75">
          <SheetTitle className="text-xl font-medium text-foreground">
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Your cart is
                </h3>
                <p className="text-lg font-semibold text-foreground mb-6">
                  empty
                </p>
              </div>
            ) : (
              <div className="py-4 px-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product_id}-${item.variant_id}`}
                    className="bg-background rounded-lg p-2 shadow-sm border border-primary/20"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="relative w-16 h-20 flex-shrink-0">
                        {item.product_snapshot?.image_url ? (
                          <Image
                            src={item.product_snapshot.image_url}
                            alt={item.product_name}
                            fill
                            sizes="(min-resolution: 2dppx) 160px, 80px"
                            className="object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 max-w-[95%]">
                            <h3
                              className="font-bold text-foreground text-sm leading-tight truncate"
                              title={item.product_name}
                            >
                              {item.product_name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-2">
                              {item.product_quality} - {item.product_volume} ML
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              removeItem(item.product_id, item.variant_id)
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex justify-between">
                          {/* Price */}
                          <div className="flex items-center space-x-2 pt-1">
                            <span className="text-sm font-bold text-primary">
                              ₹{item.unit_price.toLocaleString()}
                            </span>
                            {item.unit_mrp > item.unit_price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{item.unit_mrp.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product_id,
                                  item.variant_id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product_id,
                                  item.variant_id,
                                  item.quantity + 1
                                )
                              }
                              disabled={availableSpace === 0}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter>
          <div className="border-t border-primary/75 py-2 px-3 space-y-4">
            {items.length > 0 ? (
              <>
                {/* Savings Banner */}
                {/* {totalSavings > 0 && (
                <div className="wavy-box bg-green-500 text-white p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Your total savings</span>
                    <span className="text-lg font-bold">₹{totalSavings.toLocaleString()}</span>
                  </div>
                </div>
              )} */}

                {/* Shipping Preview */}
                {(() => {
                  const shippingInfo = calculateShippingInfo();
                  const totalQuantity = items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );

                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>Subtotal</span>
                        </div>
                        <span>
                          {`₹${calculateTotals({
                            withShipping: false,
                          }).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
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
                      {!shippingInfo.is_free_shipping && (
                        <div className="text-xs text-muted-foreground font-medium text-center">
                          Add items worth ₹
                          {(
                            shippingInfo.free_shipping_threshold -
                            shippingInfo.total_before_shipping
                          ).toFixed(0)}{" "}
                          more to avail free shipping
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Total Payable */}
                <div className="space-y-0">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">
                      Total Payable
                    </span>
                    <span className="text-xl font-bold text-primary">
                      ₹
                      {calculateTotals({ withShipping: true }).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    MRP Inclusive Of All Taxes
                  </p>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-accent font-semibold py-3 text-lg"
                  size="lg"
                >
                  CHECKOUT
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setCartOpen(false)}
                className="w-full btn-gradient-golde font-semibold"
                size="lg"
              >
                Continue Shopping
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
