"use server";

import Razorpay from "razorpay";
import { Orders } from "razorpay/dist/types/orders";
import { Payments } from "razorpay/dist/types/payments";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create Razorpay order
export async function createRazorpayOrder(
  amount: number,
  receipt: string
): Promise<{ success: boolean; data?: Orders.RazorpayOrder; error?: string }> {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt,
    };

    const order = await razorpay.orders.create(options);

    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create Razorpay order",
    };
  }
}

// Verify payment signature
export async function verifyPaymentSignature(
  razorpayOrderId: string,
  paymentId: string,
  signature: string,
  databaseOrderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(`${razorpayOrderId}|${paymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
      // Update order status in database using database order ID
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          razorpay_payment_id: paymentId,
          razorpay_order_id: razorpayOrderId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", databaseOrderId);
      if (error) {
        throw new Error(`Failed to update order: ${error.message}`);
      }

      return { success: true };
    } else {
      return { success: false, error: "Invalid payment signature" };
    }
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}

// Handle payment captured webhook
export async function handlePaymentCaptured(
  payment: Payments.RazorpayPayment
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        razorpay_payment_id: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", payment.order_id);

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling payment captured:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to handle payment captured",
    };
  }
}

// Handle payment failed webhook
export async function handlePaymentFailed(
  payment: Payments.RazorpayPayment
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "failed",
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", payment.order_id);

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling payment failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to handle payment failed",
    };
  }
}
