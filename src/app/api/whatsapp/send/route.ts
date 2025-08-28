import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message, type } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Format phone number (remove +91 if present, add if not)
    const formattedPhone = phone.replace(/^\+91/, '').replace(/^91/, '');
    const fullPhone = `91${formattedPhone}`;

    // Using QuickWhatsApp.link API (free tier)
    // Note: In production, you might want to use Twilio or other paid services
    const whatsappUrl = `https://quickwhatsapp.link/send?phone=${fullPhone}&text=${encodeURIComponent(
      message
    )}`;

    // For now, we'll just log the message since QuickWhatsApp.link requires user interaction
    console.log(`WhatsApp ${type} notification:`, {
      phone: fullPhone,
      message,
      url: whatsappUrl,
    });

    // In a real implementation, you would:
    // 1. Use Twilio WhatsApp API (paid service)
    // 2. Or use a service like MessageBird
    // 3. Or integrate with WhatsApp Business API

    return NextResponse.json({
      success: true,
      message:
        'WhatsApp notification logged (requires manual sending in development)',
      url: whatsappUrl,
    });
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp notification' },
      { status: 500 }
    );
  }
}
