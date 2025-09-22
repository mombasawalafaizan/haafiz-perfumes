import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster
          position="top-center"
          richColors
          mobileOffset={{ top: "35px", left: "20px", right: "20px" }}
        />
      </body>
    </html>
  );
}
