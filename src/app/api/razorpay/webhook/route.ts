import {
  handlePaymentCaptured,
  handlePaymentFailed,
} from "@/lib/actions/razorpay";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Payments } from "razorpay/dist/types/payments";

// Webhook event interface based on Razorpay documentation
interface RazorpayWebhookEvent {
  event: string;
  account_id: string;
  created_at: number;
  payload: {
    payment: {
      entity: Payments.RazorpayPayment;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const hmac = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_WEBHOOK_SECRET!
    );
    hmac.update(body);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event: RazorpayWebhookEvent = JSON.parse(body);

    switch (event.event) {
      case "payment.captured":
        const capturedResult = await handlePaymentCaptured(
          event.payload.payment.entity
        );
        if (!capturedResult.success) {
          return NextResponse.json(
            { error: capturedResult.error },
            { status: 500 }
          );
        }
        break;

      case "payment.failed":
        const failedResult = await handlePaymentFailed(
          event.payload.payment.entity
        );
        if (!failedResult.success) {
          return NextResponse.json(
            { error: failedResult.error },
            { status: 500 }
          );
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in webhook API:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
