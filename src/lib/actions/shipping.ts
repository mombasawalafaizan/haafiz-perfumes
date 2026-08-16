"use server";

import { supabase } from "@/lib/supabase";
import { getShippingTierForQuantity } from "@/lib/utils";

const SHIPPING_XPRESS_URL = "https://shippingxpress.in/ship/api/order/store";
const SHIPPING_XPRESS_DETAILS_URL =
  "https://shippingxpress.in/ship/api/order/details";
const SHIPPING_XPRESS_TRACKING_URL =
  "https://shippingxpress.in/ship/api/order/tracking";

export interface ShipmentDetails {
  order_id: string;
  awb_number: string | null;
  order_type: string;
  shipping_mode: string;
  total_amount: string;
  shipment_status: string;
  order_date: string;
  courier_name: string | null;
}

export interface ShipmentTrackingEvent {
  status_code: string;
  location: string;
  event_time: string;
  message: string;
}

export interface ShipmentTracking {
  order_id: string;
  created: string;
  awb_number: string;
  status: string;
  history: ShipmentTrackingEvent[];
  expected_delivery_date: string;
}

async function callShippingXpress<T>(
  url: string,
  body: Record<string, string>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SHIPPING_XPRESS_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.status) {
      throw new Error(result?.message || "ShippingXpress request failed");
    }
    return { success: true, data: result.data as T };
  } catch (err) {
    console.error(`[ShippingXpress] request to ${url} failed:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "ShippingXpress request failed",
    };
  }
}

export async function getShipmentDetails(
  orderNumber: string
): Promise<{ success: boolean; data?: ShipmentDetails; error?: string }> {
  return callShippingXpress<ShipmentDetails>(SHIPPING_XPRESS_DETAILS_URL, {
    order_id: orderNumber,
  });
}

export async function getShipmentTracking(
  awbNumber: string
): Promise<{ success: boolean; data?: ShipmentTracking; error?: string }> {
  return callShippingXpress<ShipmentTracking>(SHIPPING_XPRESS_TRACKING_URL, {
    awb_number: awbNumber,
  });
}

export async function initiateShipment(orderId: string): Promise<void> {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items (*)")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      throw new Error(error?.message || "Order not found");
    }

    const totalQuantity = order.order_items.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    );
    const tier = getShippingTierForQuantity(totalQuantity);

    const [firstName, ...rest] = order.customer_name.split(" ");
    const lastName = rest.join(" ") || firstName;

    const items = order.order_items.map(
      (item: {
        product_name: string;
        product_quality: string;
        product_volume: number;
        unit_price: number;
        quantity: number;
      }) => ({
        product_name: item.product_name,
        product_discription: `${item.product_quality} - ${item.product_volume}ml`,
        amount: String((item.unit_price || 0) * (item.quantity || 0)),
        quantity: String(item.quantity),
      })
    );

    const payload = {
      shipping_mode: "Surface",
      order_id: order.order_number,
      order_date: new Date(order.created_at).toISOString().split("T")[0],
      order_type: order.payment_method === "cod" ? "cod" : "prepaid",
      cod_amount:
        order.payment_method === "cod" ? String(order.total_amount) : "0",
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: order.customer_email || null,
        mobile: order.customer_phone,
        address: `${order.customer_address}, ${order.customer_city}, ${order.customer_state} ${order.customer_pincode}, India`,
        zip_code: order.customer_pincode,
        city: order.customer_city,
        state: order.customer_state,
        country: "India",
      },
      items,
      total_amount: String(order.total_amount),
      weight: String(tier.weightGrams / 1000),
      length: String(tier.length),
      width: String(tier.width),
      height: String(tier.height),
    };

    const response = await fetch(SHIPPING_XPRESS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SHIPPING_XPRESS_API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);
    console.log("[ShippingXpress] response", response.status, result);
  } catch (err) {
    console.error("[ShippingXpress] failed to initiate shipment:", err);
  }
}
