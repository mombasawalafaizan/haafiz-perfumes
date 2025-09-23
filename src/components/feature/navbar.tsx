"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { calculateCartMeta } from "@/lib/utils";
import { SearchProducts } from "./search-products";

export function Navbar() {
  const { items, setCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = calculateCartMeta(items);

  const navigationItems = [
    { name: "Home", href: "/" },
    // { name: 'Collections', href: '/collections' },
    { name: "Perfumes", href: "/collections/perfumes", disabled: false },
    { name: "Attars", href: "/collections/attars", disabled: false },
    // { name: "Combos", href: "/collections/combos", disabled: false },
    // { name: "Track Orders", href: "#", disabled: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Mobile Menu & Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 gap-0">
                {/* <SheetHeader className="border-b border-border">
                  <SheetTitle className="text-xl font-semibold text-foreground">
                    Menu
                  </SheetTitle>
                </SheetHeader> */}
                <div className="px-6 mt-6">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.disabled ? "#" : item.href}
                      className={`block py-3.5 text-foreground font-semibold text-md hover:text-primary transition-colors border-b-2 border-foreground ${
                        item.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => {
                        if (!item.disabled) {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/haafiz_perfumes_branding.png"
                alt="Haafiz Perfumes"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex w-full items-center justify-evenly max-w-2xl wrap">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.disabled ? "#" : item.href}
                className={`text-foreground font-semibold text-lg hover:text-primary transition-colors ${
                  item.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-accent"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Products Dialog */}
      <SearchProducts open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </nav>
  );
}
