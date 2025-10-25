import { Metadata } from "next";
import { getFeaturedProducts } from "@/lib/actions/product";
import { HeroCarousel } from "@/components/feature/hero-carousel";
import FeaturedProductsSection from "@/components/feature/featured-products";
import { StructuredData } from "@/components/seo/structured-data";
import { getHeroSlides } from "@/lib/actions/hero-slides";

export const metadata: Metadata = {
  title: "Haafiz Perfumes",
  description:
    "Discover our exquisite collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world.",
  keywords: [
    "perfumes",
    "perfume",
    "attars",
    "attar",
    "surat",
    "halal",
    "fragrances",
    "fragrance",
    "indian perfumes",
    "indian attars",
    "haafiz perfumes",
    "hafiz perfumes",
    "haafiz perfume",
    "hafiz perfume",
    "hafeez perfumes",
    "haafeez perfumes",
    "hafeez perfume",
    "haafeez perfume",
    "perfume collection",
    "attar collection",
    "luxury perfumes",
    "premium fragrances",
    "traditional attars",
    "authentic attars",
  ],
  openGraph: {
    title: "Haafiz Perfumes",
    description:
      "Discover our collection of luxury perfumes and authentic attars, crafted with the finest ingredients from around the world.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function HomePage() {
  const heroSlides = await getHeroSlides();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <div>
        {/* Hero Section */}
        <HeroCarousel heroSlides={heroSlides || []} />

        {/* Featured Products */}
        <FeaturedProductsSection products={featuredProducts} />
      </div>
    </>
  );
}
