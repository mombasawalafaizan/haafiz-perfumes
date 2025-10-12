"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  paymentId?: string;
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  orderId,
  paymentId,
}: OrderSuccessModalProps) {
  const router = useRouter();

  const handleContinueShopping = () => {
    onClose();
    router.push("/collections");
  };

  const handleBackToHome = () => {
    onClose();
    router.push("/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-muted-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <p className="text-center text-muted-foreground">
            Thank you for your order. We&apos;ll process it and get back to you
            soon.
          </p>

          {orderId && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Order Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="min-w-fit">Order ID:</span>
                  <span className="font-mono font-bold text-xs leading-normal">
                    {orderId}
                  </span>
                </div>
                {paymentId && (
                  <div className="flex justify-between">
                    <span>Payment ID:</span>
                    <span className="font-mono font-bold text-xs leading-normal">
                      {paymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-info/10 border border-info/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Package className="h-5 w-5 text-info mt-0.5" />
              <h4 className="font-semibold text-info">What&apos;s Next?</h4>
            </div>
            <ul className="text-sm text-info mt-2 space-y-1 ml-0">
              <li>
                • You&apos;ll receive an order confirmation message shortly via
                WhatsApp
              </li>
              <li>• We&apos;ll process your order within 1-2 business days</li>
              <li>
                • You&apos;ll get tracking information once your order ships
              </li>
              <li>
                • For any queries, contact us at haafizperfumescare@gmail.com
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleContinueShopping} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="flex-1"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
