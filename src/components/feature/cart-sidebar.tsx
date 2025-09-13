"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
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

export function CartSidebar() {
  const { items, isOpen, setCartOpen, updateQuantity, removeItem } = useCart();
  const { totalPrice, availableSpace } = calculateCartMeta(items);
  const router = useRouter();

  const handleCheckout = () => {
    setCartOpen(false);
    router.push("/checkout");
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);

    // if (!result.success) {
    //   toast({
    //     title: "Error updating quantity",
    //     description: "Unable to update item quantity.",
    //     variant: "destructive",
    //   });
    // } else if (result.actualQuantity !== newQuantity) {
    //   toast({
    //     title: "Cart limit reached! ⚠️",
    //     description: `Quantity limited to ${result.actualQuantity} (max ${maxItems} items allowed).`,
    //     variant: "destructive",
    //   });
    // }
  };

  const totalSavings = items.reduce((sum, item) => {
    return sum + (item.priceMRP - item.priceActual) * item.quantity;
  }, 0);

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
                    key={item.id}
                    className="bg-background rounded-lg p-2 shadow-sm border border-primary/20"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(min-resolution: 2dppx) 160px, 80px"
                          className="object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-sm leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.name} - {item.sizeMl} ML
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex justify-between">
                          {/* Price */}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-sm font-bold text-primary">
                              ₹{item.priceActual.toLocaleString()}
                            </span>
                            {item.priceMRP > item.priceActual && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{item.priceMRP.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 mt-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
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
                                handleUpdateQuantity(item.id, item.quantity + 1)
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

                {/* Total Payable */}
                <div className="space-y-0">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">
                      Total Payable
                    </span>
                    <span className="text-xl font-bold text-primary">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    MRP Inclusive Of All Taxes
                  </p>
                  <p className="text-sm text-center mt-4 text-muted-foreground font-medium">
                    Wohoo! You save{" "}
                    <strong>₹{totalSavings.toLocaleString()} </strong> 🎉
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
