import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Haafiz Perfumes - Luxury Perfumes & Authentic Attars",
  description:
    "Discover our exquisite collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world. Premium fragrances for every occasion.",
  keywords: [
    "perfumes",
    "attars",
    "luxury fragrances",
    "indian perfumes",
    "authentic attars",
    "haafiz perfumes",
    "premium fragrances",
    "traditional attars",
    "surat perfumes",
    "halal perfumes",
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
  // verification: {
  //   google: process.env.GOOGLE_SITE_VERIFICATION,
  // },
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
