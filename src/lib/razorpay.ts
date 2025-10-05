// Razorpay integration utilities
import { verifyPaymentSignature } from "@/lib/actions/razorpay";
import { Orders } from "razorpay/dist/types/orders";

// Based on official Razorpay documentation and community standards
// These types are derived from the official Razorpay checkout documentation

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  readonly?: {
    name?: boolean;
    email?: boolean;
    contact?: boolean;
  };
  image?: string;
  callback_url?: string;
  method?: {
    netbanking?: boolean;
    wallet?: boolean;
    emi?: boolean;
    upi?: boolean;
    card?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayCheckoutOptions): {
        open(): void;
        close(): void;
      };
    };
  }
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.head.appendChild(script);
  });
};

// Initialize Razorpay checkout
export const initializeRazorpayCheckout = async (
  order: Orders.RazorpayOrder,
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  },
  onSuccess: (paymentId: string) => void,
  onFailure: (error: any) => void
) => {
  await loadRazorpayScript();

  const options: RazorpayCheckoutOptions = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: Number(order.amount),
    currency: order.currency,
    name: "Haafiz Perfumes",
    description: "Premium Fragrances & Attars",
    order_id: order.id,
    prefill: {
      name: customerInfo.name,
      email: customerInfo.email,
      contact: customerInfo.phone,
    },
    theme: {
      color: "#f59e0b",
    },
    handler: async function (response: RazorpayPaymentResponse) {
      try {
        const result = await verifyPaymentSignature(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        if (result.success) {
          onSuccess(response.razorpay_payment_id);
        } else {
          onFailure(new Error("Payment verification failed"));
        }
      } catch (error) {
        onFailure(error);
      }
    },
    modal: {
      ondismiss: function () {
        onFailure(new Error("Payment cancelled by user"));
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
