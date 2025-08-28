"use client";

import { HeroCarousel } from "@/components/ui/hero-carousel";
import { ProductCard } from "@/components/ui/product-card";
import { getFeaturedProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();
  const isMobile = useIsMobile();
  const [api, setApi] = useState<CarouselApi | null>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (!api) return;

    const timer = setInterval(() => {
      api.scrollNext();
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(timer);
  }, [api]);

  return (
    <div>
      {/* Hero Section */}
      <HeroCarousel />

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular perfumes and attars, carefully selected
            for their exceptional quality and captivating fragrances.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
          setApi={setApi}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <ProductCard
                  product={product}
                  layout={isMobile ? "horizontal" : "vertical"}
                  onProductClick={() => {
                    window.location.href = `/products/${product.id}`;
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* <CarouselPrevious />
          <CarouselNext /> */}
        </Carousel>

        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="btn-gradient-golden text-black font-semibold"
          >
            <Link href="/collections">View All Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
