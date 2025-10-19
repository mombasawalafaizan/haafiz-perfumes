"use server";
import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

export interface RecentActivity {
  id: string;
  type: "order" | "product" | "stock";
  message: string;
  timestamp: Date;
  status: "success" | "warning" | "info";
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Get total orders
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Get total revenue
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid");

    const totalRevenue =
      revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
      0;

    // Get total customers (unique email addresses)
    const { data: customersData } = await supabase
      .from("orders")
      .select("customer_phone")
      .not("customer_phone", "is", null);

    const uniqueCustomers = new Set(
      customersData?.map((order) => order.customer_phone) || []
    );
    const totalCustomers = uniqueCustomers.size;

    return {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue: Math.round(totalRevenue),
      totalCustomers,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = [];

    // Get recent orders
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("order_number, created_at, status")
      .order("created_at", { ascending: false })
      .limit(3);

    recentOrders?.forEach((order) => {
      activities.push({
        id: `order-${order.order_number}`,
        type: "order",
        message: `New order #${order.order_number} received`,
        timestamp: new Date(order.created_at),
        status: "success",
      });
    });

    // Get recent product updates
    const { data: recentProducts } = await supabase
      .from("products")
      .select("id, name, updated_at")
      .order("updated_at", { ascending: false })
      .limit(2);

    recentProducts?.forEach((product) => {
      activities.push({
        id: `product-${product.id}`,
        type: "product",
        message: `Product "${product.name || "Unknown"}" updated`,
        timestamp: new Date(product.updated_at),
        status: "info",
      });
    });

    // Sort by timestamp and return latest 5
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [stats, recentActivities] = await Promise.all([
      getDashboardStats(),
      getRecentActivities(),
    ]);

    return {
      stats,
      recentActivities,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}
