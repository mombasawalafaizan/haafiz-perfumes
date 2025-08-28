// WhatsApp notification utilities
export interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMode: 'cod' | 'razorpay';
  shippingAddress: {
    city: string;
    pincode: string;
    state: string;
  };
  orderDate: string;
}

// Send WhatsApp notification to business owner
export const sendBusinessNotification = async (
  orderData: OrderNotificationData
): Promise<boolean> => {
  try {
    const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE;
    if (!businessPhone) {
      console.error('Business phone number not configured');
      return false;
    }

    const message = formatBusinessMessage(orderData);

    // Using QuickWhatsApp.link API (free tier)
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: businessPhone,
        message,
        type: 'business',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send business notification:', error);
    return false;
  }
};

// Send WhatsApp notification to customer
export const sendCustomerNotification = async (
  orderData: OrderNotificationData
): Promise<boolean> => {
  try {
    const message = formatCustomerMessage(orderData);

    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: orderData.customerPhone,
        message,
        type: 'customer',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send customer notification:', error);
    return false;
  }
};

// Format message for business owner
const formatBusinessMessage = (orderData: OrderNotificationData): string => {
  const itemsList = orderData.items
    .map(
      (item) =>
        `- ${item.name} × ${item.quantity} @ ₹${item.price.toLocaleString()}`
    )
    .join('\n');

  return `🧾 NEW ORDER: #${orderData.orderNumber}
👤 Name: ${orderData.customerName}
📞 Phone: ${orderData.customerPhone}
🛍️ Items:
${itemsList}
💰 Total: ₹${orderData.totalAmount.toLocaleString()}
🪙 Payment: ${orderData.paymentMode.toUpperCase()}
📦 Shipping: ${orderData.shippingAddress.pincode}, ${
    orderData.shippingAddress.city
  }
📅 Placed: ${orderData.orderDate}`;
};

// Format message for customer
const formatCustomerMessage = (orderData: OrderNotificationData): string => {
  const itemsList = orderData.items
    .map((item) => `• ${item.name} × ${item.quantity}`)
    .join('\n');

  return `🎉 Thank you for your order!

Order #${orderData.orderNumber} has been confirmed.

📦 Your Order:
${itemsList}

💰 Total: ₹${orderData.totalAmount.toLocaleString()}
🪙 Payment: ${
    orderData.paymentMode === 'cod' ? 'Cash on Delivery' : 'Online Payment'
  }

📅 Order Date: ${orderData.orderDate}
📞 Need help? Call us: +91 98765 43210

We'll process your order within 24 hours and send you tracking details. Thank you for choosing Haafiz Perfumes! 🌸`;
};

// Send both notifications
export const sendOrderNotifications = async (
  orderData: OrderNotificationData
): Promise<{
  business: boolean;
  customer: boolean;
}> => {
  const [businessResult, customerResult] = await Promise.allSettled([
    sendBusinessNotification(orderData),
    sendCustomerNotification(orderData),
  ]);

  return {
    business:
      businessResult.status === 'fulfilled' ? businessResult.value : false,
    customer:
      customerResult.status === 'fulfilled' ? customerResult.value : false,
  };
};
