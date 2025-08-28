"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Package, MapPin } from "lucide-react";
import { calculateCartMeta } from "@/lib/utils";

interface ShippingForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { totalPrice } = calculateCartMeta(items);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">(
    "razorpay"
  );
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push("/");
    return null;
  }

  const handleInputChange = (field: keyof ShippingForm, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return Object.values(shippingForm).every((value) => value.trim() !== "");
  };

  const handleCODOrder = async () => {
    if (!isFormValid()) {
      toast.error("Please fill all fields", {
        description: "All shipping information is required.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Integrate with Supabase to create order
      const orderData = {
        customer: shippingForm,
        items: items,
        total: totalPrice,
        paymentMethod: "cod",
        paymentStatus: "pending",
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Send WhatsApp notification

      toast.success("Order placed successfully! 🎉", {
        description: "Your order has been confirmed. We'll contact you soon.",
      });
      // toast({
      //   title: "Order placed successfully! 🎉",
      //   description: "Your order has been confirmed. We'll contact you soon.",
      // });

      clearCart();
      router.push("/order-confirmation?orderId=ORD-20250804-0001");
    } catch (error) {
      toast.error("Order failed", {
        description: "Please try again or contact support.",
      });
      // toast({
      //   title: "Order failed",
      //   description: "Please try again or contact support.",
      //   variant: "destructive",
      // });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayOrder = async () => {
    if (!isFormValid()) {
      // toast({
      //   title: "Please fill all fields",
      //   description: "All shipping information is required.",
      //   variant: "destructive",
      // });
      toast.error("Please fill all fields", {
        description: "All shipping information is required.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Create Razorpay order via API
      const orderData = {
        customer: shippingForm,
        items: items,
        total: totalPrice,
        paymentMethod: "razorpay",
      };

      // Simulate API call to create Razorpay order
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Initialize Razorpay checkout
      toast.info("Redirecting to payment...", {
        description: "Please complete your payment to confirm the order.",
      });
      // toast({
      //   title: "Redirecting to payment...",
      //   description: "Please complete your payment to confirm the order.",
      // });

      // Simulate Razorpay redirect
      setTimeout(() => {
        router.push(
          "/order-confirmation?orderId=ORD-20250804-0001&payment=success"
        );
      }, 2000);
    } catch (error) {
      toast.error("Payment failed", {
        description: "Please try again or choose a different payment method.",
      });
      // toast({
      //   title: "Payment failed",
      //   description: "Please try again or choose a different payment method.",
      //   variant: "destructive",
      // });
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "cod") {
      handleCODOrder();
    } else {
      handleRazorpayOrder();
    }
  };

  const shippingCost = totalPrice >= 1999 ? 0 : 199;
  const finalTotal = totalPrice + shippingCost;

  return (
    <div>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order</p>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={shippingForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address *
                  </label>
                  <textarea
                    value={shippingForm.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingForm.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={shippingForm.pincode}
                      onChange={(e) =>
                        handleInputChange("pincode", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Pincode"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingForm.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="State"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="w-4 h-4 text-primary border-border focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        Online Payment
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pay securely with Razorpay (Credit/Debit cards, UPI, Net
                        Banking)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4 text-primary border-border focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        Cash on Delivery
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pay when you receive your order
                      </div>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground text-sm">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {item.sizeMl}ml • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          ₹{(item.priceActual * item.quantity).toLocaleString()}
                        </p>
                        {item.priceMRP > item.priceActual && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{(item.priceMRP * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shippingCost === 0 ? (
                        <Badge variant="secondary">FREE</Badge>
                      ) : (
                        `₹${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Free shipping on orders above ₹1,999
                    </div>
                  )}
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">
                        ₹{finalTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessing || !isFormValid()}
              className="w-full btn-gradient-golden text-black font-semibold hover:opacity-90 shadow-elegant hover:shadow-premium transition-all duration-300"
              size="lg"
            >
              {isProcessing
                ? "Processing..."
                : paymentMethod === "cod"
                ? "Place Order (Cash on Delivery)"
                : "Proceed to Payment"}
            </Button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By placing your order, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
