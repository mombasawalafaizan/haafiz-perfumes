import { verifyPaymentSignature } from "@/lib/actions/razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    const result = await verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (result.success) {
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json(
        { verified: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in verify-payment API:", error);
    return NextResponse.json(
      { verified: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
