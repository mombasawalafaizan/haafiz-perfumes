"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import {
  IOrder,
  IOrderDetail,
  IOrderSummary,
  IOrderStats,
  ICartToOrderData,
  TOrderStatus,
  TPaymentStatus,
} from "@/types/order";
import { CartItem } from "@/hooks/useCart";
import { IQueryResult } from "@/types/query";

// Generate unique order number
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const day = String(new Date().getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `HAF-${year}${month}${day}-${random}`;
}

// Create order from cart
export async function createOrder(
  cartItems: CartItem[],
  orderData: ICartToOrderData
): Promise<IQueryResult<IOrder>> {
  try {
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const tax_amount = 0; // No tax for now
    const shipping_amount = 0; // Free shipping for now
    const discount_amount = 0; // No discount for now
    const total_amount =
      subtotal + tax_amount + shipping_amount - discount_amount;

    // Create order record
    const orderNumber = generateOrderNumber();
    const customer_name = `${orderData.customer_info.first_name} ${orderData.customer_info.last_name}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_email: orderData.customer_info.email,
        customer_phone: orderData.customer_info.phone,
        customer_address: orderData.customer_info.address,
        customer_city: orderData.customer_info.city,
        customer_state: orderData.customer_info.state,
        customer_pincode: orderData.customer_info.pincode,
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        total_amount,
        payment_method: orderData.payment_method,
        payment_status:
          orderData.payment_method === "cod" ? "pending" : "pending",
        status: "pending",
        notes: orderData.notes,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items - cart items already match IOrderItem structure
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      product_quality: item.product_quality,
      product_volume: item.product_volume,
      product_sku: item.product_sku,
      unit_price: item.unit_price,
      unit_mrp: item.unit_mrp,
      quantity: item.quantity,
      total_price: item.total_price,
      product_snapshot: item.product_snapshot,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // Rollback order if items creation fails
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    revalidatePath("/checkout");
    return { success: true, data: order, error: undefined };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      data: undefined,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get order by ID
export async function getOrderById(
  orderId: string
): Promise<IQueryResult<IOrderDetail>> {
  try {
    // Get order with items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*)
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError) {
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }

    return { success: true, data: order, error: undefined };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      success: false,
      data: undefined,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get orders for admin dashboard
export async function getOrders(
  page: number = 1,
  limit: number = 10,
  status?: TOrderStatus,
  paymentStatus?: TPaymentStatus
): Promise<IQueryResult<IOrderSummary[]>> {
  try {
    const offset = (page - 1) * limit;

    let query = supabase.from("orders").select(
      `
        id,
        order_number,
        customer_name,
        total_amount,
        status,
        payment_status,
        payment_method,
        created_at,
        order_items!inner(count)
      `,
      { count: "exact" }
    );

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (paymentStatus) {
      query = query.eq("payment_status", paymentStatus);
    }

    // Apply pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: orders, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    const formattedOrders: IOrderSummary[] =
      orders?.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        created_at: order.created_at,
        item_count: order.order_items?.[0]?.count || 0,
      })) || [];

    return {
      success: true,
      data: formattedOrders,
      error: undefined,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      data: undefined,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: TOrderStatus,
  paymentStatus?: TPaymentStatus,
  notes?: string,
  _updatedBy: string = "admin" // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<IQueryResult<null>> {
  try {
    // Update order
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    revalidatePath("/admin/orders");
    return { success: true, data: undefined, error: undefined };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      data: undefined,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get order statistics
export async function getOrderStats(): Promise<IQueryResult<IOrderStats>> {
  try {
    // Get total orders and revenue
    const { data: totalData, error: totalError } = await supabase
      .from("orders")
      .select("total_amount, status, payment_method")
      .neq("status", "cancelled");

    if (totalError) {
      throw new Error(`Failed to fetch order stats: ${totalError.message}`);
    }

    const totalOrders = totalData?.length || 0;
    const totalRevenue =
      totalData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const pendingOrders =
      totalData?.filter((order) => order.status === "pending").length || 0;
    const completedOrders =
      totalData?.filter((order) => order.status === "delivered").length || 0;
    const codOrders =
      totalData?.filter((order) => order.payment_method === "cod").length || 0;
    const onlineOrders =
      totalData?.filter((order) => order.payment_method === "online").length ||
      0;

    return {
      success: true,
      data: {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        cod_orders: codOrders,
        online_orders: onlineOrders,
      },
      error: undefined,
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return {
      success: false,
      data: undefined,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
