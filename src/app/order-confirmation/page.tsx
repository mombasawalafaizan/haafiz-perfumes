'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, CreditCard, MapPin } from 'lucide-react';

const OrderConfirmationPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentStatus = searchParams.get('payment');

  const isPaymentSuccess = paymentStatus === 'success';

  return (
    <div>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{orderId || 'ORD-20250804-0001'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Status:</span>
                <Badge
                  variant={isPaymentSuccess ? 'default' : 'secondary'}
                  className={isPaymentSuccess ? 'bg-green-100 text-green-800' : ''}
                >
                  {isPaymentSuccess ? 'Paid' : 'Pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">
                  {isPaymentSuccess ? 'Online Payment' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">₹1,999</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We'll send you shipping updates via email and WhatsApp. You can
                also track your order using the order ID above.
              </p>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Order Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll process your order within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Shipping</h4>
                    <p className="text-sm text-muted-foreground">
                      Your order will be shipped within 2-3 business days
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Delivery</h4>
                    <p className="text-sm text-muted-foreground">
                      Delivery typically takes 3-5 business days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 btn-gradient-golden text-black font-semibold">
              <Link href="/collections">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          {/* Contact Information */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Have questions? Contact us at{' '}
              <a href="mailto:hello@saffronscents.com" className="text-primary hover:underline">
                hello@saffronscents.com
              </a>{' '}
              or call{' '}
              <a href="tel:+919876543210" className="text-primary hover:underline">
                +91 98765 43210
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
