import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on the PRD schema
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: "perfume" | "attar";
  fragrance_family: string;
  description: string;
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  additional_notes: string;
  mrp: number;
  price: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  quality: "Standard" | "Premium" | "Luxury";
  price: number;
  mrp: number;
  stock: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  bucket_id: string;
  path: string;
  public_url: string;
  is_primary: boolean;
  uploaded_by?: string;
  inserted_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: {
    street: string;
    city: string;
    pincode: string;
    state: string;
  };
  order_items: Array<{
    variant_id: string;
    quantity: number;
    price: number;
    mrp: number;
  }>;
  payment_mode: "cod" | "razorpay";
  payment_status: "pending" | "paid" | "failed";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  shipping_status: "pending" | "booked" | "shipped" | "delivered";
  bigship_awb?: string;
  total_amount: number;
  created_at: string;
}

// API functions
export const productsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*),
        product_images (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByCategory(category: "perfume" | "attar") {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*),
        product_images (*)
      `
      )
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*),
        product_images (*)
      `
      )
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*),
        product_images (*)
      `
      )
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) throw error;
    return data;
  },
};

export const ordersApi = {
  async create(orderData: Omit<Order, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByOrderNumber(orderNumber: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(
    id: string,
    paymentStatus: Order["payment_status"],
    razorpayIds?: { order_id?: string; payment_id?: string }
  ) {
    const updateData: Partial<Order> = { payment_status: paymentStatus };
    if (razorpayIds?.order_id)
      updateData.razorpay_order_id = razorpayIds.order_id;
    if (razorpayIds?.payment_id)
      updateData.razorpay_payment_id = razorpayIds.payment_id;

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const storageApi = {
  async uploadProductImage(file: File, productId: string, isPrimary = false) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    // Save to database
    const { data: imageData, error: dbError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        bucket_id: "product-images",
        path: fileName,
        public_url: urlData.publicUrl,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return imageData;
  },

  async deleteProductImage(imageId: string) {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error) throw error;
  },
};
