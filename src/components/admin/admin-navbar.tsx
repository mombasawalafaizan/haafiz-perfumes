"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/actions/auth";

export function AdminNavbar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAdmin();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="flex items-center">
              <Image
                src="/haafiz_perfumes_branding.png"
                alt="Haafiz Perfumes Admin"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <div className="hidden md:block text-sm text-muted-foreground">
              Admin Panel
            </div>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="/admin/dashboard"
              prefetch={true}
              className={`flex items-center space-x-2 transition-colors rounded-lg px-3 py-2 ${
                isActive("/admin/dashboard")
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/admin/products"
              prefetch={true}
              className={`flex items-center space-x-2 transition-colors rounded-lg px-3 py-2 ${
                isActive("/admin/products")
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <Package className="h-4 w-4" />
              <span className="font-medium">Products</span>
            </Link>
            <Link
              href="/admin/orders"
              prefetch={true}
              className={`flex items-center space-x-2 transition-colors rounded-lg px-3 py-2 ${
                isActive("/admin/orders")
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">Orders</span>
            </Link>
            <Link
              href="/admin/hero-slides"
              prefetch={true}
              className={`flex items-center space-x-2 transition-colors rounded-lg px-3 py-2 ${
                isActive("/admin/hero-slides")
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="font-medium">Hero Slides</span>
            </Link>
          </div>

          {/* Right Side - Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-muted-foreground">
              Welcome, Saeed Akbar
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border py-4">
          <div className="flex flex-col space-y-3">
            <Link
              href="/admin/dashboard"
              prefetch={true}
              className={`flex items-center space-x-2 transition-colors rounded-lg px-3 py-2 ${
                isActive("/admin/dashboard")
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/admin/products"
              prefetch={true}
              className={`flex items-center space-x-2 transition-colors rounded-lg px-3 py-2 ${
                isActive("/admin/products")
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <Package className="h-4 w-4" />
              <span className="font-medium">Products</span>
            </Link>
            <Link
              href="/admin/orders"
              prefetch={true}
              className={`flex items-center space-x-2 transition-colors rounded-lg px-3 py-2 ${
                isActive("/admin/orders")
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">Orders</span>
            </Link>
            <Link
              href="/admin/hero-slides"
              prefetch={true}
              className={`flex items-center space-x-2 transition-colors rounded-lg px-3 py-2 ${
                isActive("/admin/hero-slides")
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="font-medium">Hero Slides</span>
            </Link>
            <div className="pt-2 border-t border-border">
              <div className="text-sm text-muted-foreground mb-2">
                Welcome, Saeed Akbar
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 w-full"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
