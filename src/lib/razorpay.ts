// Razorpay integration utilities
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: number;
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
};

// Create Razorpay order
export const createRazorpayOrder = async (
  amount: number,
  receipt: string
): Promise<RazorpayOrder> => {
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to paise
      receipt,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order');
  }

  return response.json();
};

// Initialize Razorpay checkout
export const initializeRazorpayCheckout = async (
  order: RazorpayOrder,
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  },
  onSuccess: (paymentId: string) => void,
  onFailure: (error: any) => void
) => {
  await loadRazorpayScript();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: order.amount,
    currency: order.currency,
    name: 'Haafiz Perfumes',
    description: 'Premium Fragrances & Attars',
    order_id: order.id,
    prefill: {
      name: customerInfo.name,
      email: customerInfo.email,
      contact: customerInfo.phone,
    },
    theme: {
      color: '#f59e0b',
    },
    handler: function (response: any) {
      onSuccess(response.razorpay_payment_id);
    },
    modal: {
      ondismiss: function () {
        onFailure(new Error('Payment cancelled by user'));
      },
    },
  };

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
};

// Verify payment signature
export const verifyPaymentSignature = async (
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> => {
  const response = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
      paymentId,
      signature,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.verified;
};
