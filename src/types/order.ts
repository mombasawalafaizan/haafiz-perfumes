// Order Management Types for Haafiz Perfumes

// Order Status Types
export type TOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type TPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type TPaymentMethod = "cod" | "online";

// Customer Information
export interface ICustomerInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Order Item (snapshot of product at time of order)
export interface IOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;

  // Product details at time of order
  product_name: string;
  product_quality: string;
  product_volume: number;
  product_sku: string;

  // Pricing at time of order
  unit_price: number;
  unit_mrp: number;
  quantity: number;
  total_price: number;

  // Flexible product metadata storage
  product_snapshot: any; // JSONB field for flexible data

  created_at: string;
}

// Main Order Interface
export interface IOrder {
  id: string;
  order_number: string;

  // Customer information
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_pincode: string;

  // Order totals
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;

  // Payment information
  payment_method: TPaymentMethod;
  payment_status: TPaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;

  // Order status
  status: TOrderStatus;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Additional fields
  notes?: string;
  admin_notes?: string;
}

// Order with items
export interface IOrderDetail extends IOrder {
  order_items: IOrderItem[];
}

// Order Summary for listings
export interface IOrderSummary {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: TOrderStatus;
  payment_status: TPaymentStatus;
  payment_method: TPaymentMethod;
  created_at: string;
  order_items: IOrderItem[];
}

// Order Statistics
export interface IOrderStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  cod_orders: number;
  online_orders: number;
}

// Cart to Order conversion
export interface ICartToOrderData {
  customer_info: ICustomerInfo;
  payment_method: TPaymentMethod;
  notes?: string;
}

// Checkout Form Schema
export interface ICheckoutFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: TPaymentMethod;
  notes?: string;
}
