import type { Metadata } from "next";
import { CartProvider } from "@/hooks/useCart";
import { CartSidebar } from "@/components/feature/cart-sidebar";
import { Navbar } from "@/components/feature/navbar";
import { Footer } from "@/components/ui/footer";
import { QueryProvider } from "@/components/feature/query-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Haafiz Perfumes - Luxury Perfumes & Authentic Attars",
    template: "%s | Haafiz Perfumes",
  },
  description:
    "Discover our exquisite collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world. Premium fragrances for every occasion.",
  keywords: [
    "perfumes",
    "perfume",
    "attars",
    "attar",
    "luxury fragrances",
    "indian perfumes",
    "authentic attars",
    "haafiz perfumes",
    "hafiz perfumes",
    "haafiz perfume",
    "hafiz perfume",
    "hafeez perfumes",
    "haafeez perfumes",
    "hafeez perfume",
    "haafeez perfume",
    "premium fragrances",
    "traditional attars",
    "surat perfumes",
    "halal perfumes",
    "fragrance",
    "fragrances",
    "cologne",
    "eau de parfum",
    "eau de toilette",
  ],
  authors: [{ name: "Haafiz Perfumes" }],
  creator: "Haafiz Perfumes",
  publisher: "Haafiz Perfumes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://haafizperfumes.in"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Haafiz Perfumes",
    title: "Haafiz Perfumes - Luxury Perfumes & Authentic Attars",
    description:
      "Discover our exquisite collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world.",
    images: [
      {
        url: "/haafiz_perfumes_branding.png",
        width: 1200,
        height: 630,
        alt: "Haafiz Perfumes - Luxury Perfumes & Authentic Attars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haafiz Perfumes - Luxury Perfumes & Authentic Attars",
    description:
      "Discover our exquisite collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world.",
    images: ["/haafiz_perfumes_branding.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
