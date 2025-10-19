"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/actions/auth";

export function AdminNavbar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
            >
              <Package className="h-4 w-4" />
              <span className="font-medium">Products</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">Orders</span>
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
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2"
            >
              <Package className="h-4 w-4" />
              <span className="font-medium">Products</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">Orders</span>
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
