"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IProductDetail } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/common/product-card";

const FeaturedProductsSection = ({
  products,
}: {
  products: IProductDetail[];
}) => {
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
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Featured Products
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto hidden md:block">
          Discover our most popular perfumes and attars, carefully selected for
          their exceptional quality and captivating fragrances.
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
        <CarouselContent className="-ml-2 md:-ml-4 py-2">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard product={product} key={product.id} />
            </CarouselItem>
          ))}
        </CarouselContent>
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
  );
};

export default FeaturedProductsSection;
