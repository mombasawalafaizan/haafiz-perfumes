import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/hooks/useCart";
import { CartSidebar } from "@/components/feature/cart-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/feature/navbar";
import { Footer } from "@/components/ui/footer";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <CartProvider>
          <Navbar />
          <main className="h-full bg-background">{children}</main>
          <Footer />
          <CartSidebar />
          <Toaster
            position="top-center"
            richColors
            mobileOffset={{ top: "35px", left: "20px", right: "20px" }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
