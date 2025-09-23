import type { Metadata } from "next";
import { CartProvider } from "@/hooks/useCart";
import { CartSidebar } from "@/components/feature/cart-sidebar";
import { Navbar } from "@/components/feature/navbar";
import { Footer } from "@/components/ui/footer";
import { QueryProvider } from "@/components/feature/query-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Haafiz Perfumes",
  description:
    "Discover our exquisite collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <CartProvider>
        <Navbar />
        <main className="h-full bg-background">{children}</main>
        <Footer />
        <CartSidebar />
      </CartProvider>
    </QueryProvider>
  );
}
