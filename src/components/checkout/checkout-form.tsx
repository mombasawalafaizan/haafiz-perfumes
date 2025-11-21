"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  checkoutFormSchema,
  CheckoutFormData,
} from "@/lib/validations/checkout";
import { createOrder } from "@/lib/actions/order";
import { initializeRazorpayCheckout } from "@/lib/razorpay";
import { createRazorpayOrder } from "@/lib/actions/razorpay";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderSuccessModal } from "@/components/feature/order-success-modal";

interface CheckoutFormProps {
  className?: string;
}

// List of Indian States and Union Territories
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function CheckoutForm({ className }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId?: string;
    paymentId?: string;
  }>({});
  const { items: cartItems, clearCart } = useCart();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      payment_method: "online",
      notes: "",
    },
  });

  // const paymentMethod = form.watch("payment_method");

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      // Create order in database
      const orderResult = await createOrder(cartItems, {
        customer_info: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        payment_method: data.payment_method,
        notes: data.notes,
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      if (data.payment_method === "online") {
        // Handle online payment
        try {
          const razorpayOrderResult = await createRazorpayOrder(
            orderResult.data!.total_amount,
            orderResult.data!.order_number
          );

          if (!razorpayOrderResult.success || !razorpayOrderResult.data) {
            throw new Error(
              razorpayOrderResult.error || "Failed to create Razorpay order"
            );
          }

          await initializeRazorpayCheckout(
            razorpayOrderResult.data,
            orderResult.data!.id,
            {
              name: `${data.first_name} ${data.last_name}`,
              email: data.email,
              phone: data.phone,
            },
            (paymentId) => {
              // Payment successful
              toast.success("Payment successful!");
              clearCart();
              setOrderData({
                orderId: orderResult.data!.order_number,
                paymentId,
              });
              setShowSuccessModal(true);
              setIsLoading(false);
            },
            (error) => {
              // Payment failed
              toast.error(`Payment failed: ${error.message}`);
              setIsLoading(false);
            }
          );
        } catch {
          toast.error("Failed to initialize payment");
          setIsLoading(false);
        }
      } else {
        // COD order
        toast.success("Order placed successfully!");
        clearCart();
        setOrderData({ orderId: orderResult.data!.order_number });
        setShowSuccessModal(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to place order"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Customer Information */}
          <Card>
            <CardHeader className="pt-2 md:pt-4 px-4">
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name*</FormLabel>
                      <FormControl>
                        <Input
                          className="border-foreground"
                          placeholder="Enter first name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name*</FormLabel>
                      <FormControl>
                        <Input
                          className="border-foreground"
                          placeholder="Enter last name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          className="border-foreground"
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (WhatsApp)*</FormLabel>
                      <div className="flex space-x-2 items-center">
                        <span className="font-bold text-muted-foreground">
                          +91
                        </span>
                        <FormControl>
                          <Input
                            className="border-foreground"
                            placeholder="Enter your phone number"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                      <FormDescription>
                        Order info will be sent on this number
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your full address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <FormControl>
                        <Input
                          className="border-foreground"
                          placeholder="Enter city"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-foreground w-full max-w-full truncate">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode*</FormLabel>
                      <FormControl>
                        <Input
                          className="border-foreground"
                          placeholder="Enter pincode"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          {/* <Card>
            <CardHeader className="px-4 pt-2">
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-0">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            className="border-foreground"
                            value="cod"
                            id="cod"
                          />
                          <Label htmlFor="cod" className="flex-1">
                            <div>
                              <div className="font-medium">
                                Cash on Delivery (COD)
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Pay when your order is delivered
                              </div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            className="border-foreground"
                            value="online"
                            id="online"
                          />
                          <Label htmlFor="online" className="flex-1">
                            <div>
                              <div className="font-medium">Online Payment</div>
                              <div className="text-sm text-muted-foreground">
                                Pay securely with Razorpay
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card> */}

          {/* Order Notes */}
          <Card>
            <CardHeader className="px-4">
              <CardTitle>Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Any special instructions for your order..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-[calc(100%-1.5rem)] mx-auto"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Processing Payment...
                {/* {paymentMethod === "online"
                  ? "Processing Payment..."
                  : "Placing Order..."} */}
              </>
            ) : (
              <>
                Pay Now
                {/* {paymentMethod === "online" ? "Pay Now" : "Place Order (COD)"} */}
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderId={orderData.orderId}
        paymentId={orderData.paymentId}
      />
    </div>
  );
}
