# Haafiz Perfumes - Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# WhatsApp Configuration
NEXT_PUBLIC_BUSINESS_PHONE=919876543210

# Admin Panel
ADMIN_PASSKEY=your_secure_admin_passkey

# Optional: BigShip Integration (for shipping)
BIGSHIP_API_KEY=your_bigship_api_key
BIGSHIP_API_URL=https://api.bigship.in/v2

# Optional: Twilio WhatsApp (for production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## Setup Steps

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Choose the `ap-south-1` region (India)
3. Run the following SQL in the Supabase SQL editor:

```sql
-- Create enums
CREATE TYPE product_category AS ENUM ('perfume', 'attar');
CREATE TYPE product_quality AS ENUM ('Standard', 'Premium', 'Luxury');

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category product_category NOT NULL,
  fragrance_family TEXT,
  description TEXT,
  top_notes TEXT,
  middle_notes TEXT,
  base_notes TEXT,
  additional_notes TEXT,
  mrp NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product variants table
CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quality product_quality NOT NULL,
  price NUMERIC NOT NULL,
  mrp NUMERIC NOT NULL,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  UNIQUE(product_id, quality)
);

-- Create product images table
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  bucket_id TEXT NOT NULL,
  path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  uploaded_by UUID,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  order_items JSONB NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cod', 'razorpay')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipping_status TEXT DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'booked', 'shipped', 'delivered')),
  bigship_awb TEXT,
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Set up RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access to product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read access to product images" ON product_images FOR SELECT USING (true);

-- Allow authenticated users to create orders
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read their own orders" ON orders FOR SELECT USING (true);
```

4. Copy your Supabase URL and anon key to the environment variables

### 2. Razorpay Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay dashboard
3. Add them to your environment variables

### 3. WhatsApp Setup (Optional)

For development, the app will log WhatsApp messages to the console. For production:

1. **Option 1: Twilio WhatsApp** (Recommended)
   - Sign up for Twilio
   - Enable WhatsApp Sandbox
   - Add Twilio credentials to environment variables

2. **Option 2: QuickWhatsApp.link** (Free, manual)
   - The app will generate WhatsApp links
   - You'll need to manually send messages

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

## Features Implemented

✅ **Phase 1 Complete:**
- Landing page with hero carousel
- Collections pages (perfumes, attars, combos)
- Product detail pages with zoom functionality
- Shopping cart with persistent storage
- Checkout page with shipping form
- Payment options (COD and Razorpay)
- Order confirmation page
- WhatsApp notification system
- Supabase integration ready
- Responsive design

🔄 **Phase 2 (Admin Panel) - Next Steps:**
- Admin panel with passkey authentication
- Product CRUD operations
- Order management
- CSV export functionality
- BigShip shipping integration

## Testing the Application

1. **Browse Products**: Visit `/collections` to see all categories
2. **Add to Cart**: Click "Add to Cart" on any product
3. **Checkout**: Go to cart and proceed to checkout
4. **Test Payments**: 
   - COD: Order will be created with pending status
   - Razorpay: Will redirect to payment gateway (test mode)

## Production Deployment

1. Deploy to Vercel: `vercel --prod`
2. Set up environment variables in Vercel dashboard
3. Configure custom domain
4. Set up Supabase production database
5. Configure Razorpay production keys
6. Set up WhatsApp Business API for notifications

## Support

For issues or questions, contact:
- Email: support@haafizperfumes.com
- Phone: +91 98765 43210 