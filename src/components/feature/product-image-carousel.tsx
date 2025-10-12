"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useProductVariant } from "@/hooks/useProductVariant";
import { IProductDetail } from "@/types/product";
import { imageSortFn } from "@/lib/utils";

interface ProductImageCarouselProps {
  product: IProductDetail;
}

export function ProductImageCarousel({ product }: ProductImageCarouselProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showMobileCarousel, setShowMobileCarousel] = useState(false);
  const [mobileMainCarouselApi, setMobileMainCarouselApi] =
    useState<CarouselApi | null>(null);

  const { selectedVariant } = useProductVariant(product.id!);

  const variantImages = useMemo(
    () => selectedVariant?.variant_images || [],
    [selectedVariant]
  );

  const discountPercentage = useMemo(() => {
    if (!selectedVariant) return 0;
    return selectedVariant?.mrp > selectedVariant?.price
      ? Math.round(
          ((selectedVariant.mrp - selectedVariant.price) /
            selectedVariant.mrp) *
            100
        )
      : 0;
  }, [selectedVariant]);

  // Determine which images to display
  const displayImages = useMemo(() => {
    if (!!variantImages?.length)
      return variantImages
        .sort(imageSortFn)
        .map((img) => img.images?.backblaze_url);
    if (!!product.product_images?.length)
      return product.product_images
        .sort(imageSortFn)
        .map((img) => img.images?.backblaze_url);
    return ["/perfume_placeholder.jpg"];
  }, [variantImages, product.product_images]);

  // Sync mobile main carousel with selected image
  const handleCarouselSelect = () => {
    if (mobileMainCarouselApi) {
      const selectedIndex = mobileMainCarouselApi.selectedScrollSnap();
      setSelectedImageIndex(selectedIndex);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    if (mobileMainCarouselApi) {
      mobileMainCarouselApi.scrollTo(index);
    }
  };

  return (
    <>
      {/* Main Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border cursor-zoom-in group bg-muted/20"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <Image
          src={displayImages[selectedImageIndex] || "/placeholder-product.jpg"}
          alt={product.name}
          fill
          quality={95}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150" : "group-hover:scale-105"
          }`}
        />
        {discountPercentage > 0 && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
            {discountPercentage}% OFF
          </Badge>
        )}

        {/* Mobile Carousel Trigger */}
        <div className="md:hidden absolute bottom-4 right-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="bg-background shadow"
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileCarousel(true);
            }}
          >
            <Search className="w-4 h-4 text-foreground" />
          </Button>
        </div>
      </div>

      {/* Desktop Mini Carousel */}
      {displayImages.length > 1 && (
        <div className="hidden md:block">
          <div className="flex justify-center space-x-2">
            {displayImages.map((image, index) => (
              <div
                key={index}
                className={`relative w-20 h-20 overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                  selectedImageIndex === index
                    ? "border-primary"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  quality={90}
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Carousel Modal */}
      {showMobileCarousel && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center md:hidden">
          <div className="relative w-full h-full flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setShowMobileCarousel(false)}
            >
              <span className="text-2xl">×</span>
            </Button>

            {/* Main Carousel */}
            <div className="flex-1 flex items-center justify-center p-4">
              <Carousel
                className="w-full max-w-sm"
                setApi={setMobileMainCarouselApi}
                onSelect={handleCarouselSelect}
              >
                <CarouselContent>
                  {displayImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted/20">
                        <Image
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          fill
                          quality={95}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-white" />
                <CarouselNext className="text-white" />
              </Carousel>
            </div>

            {/* Mini Carousel at Bottom */}
            {displayImages.length > 1 && (
              <div className="p-4 border-t border-white/20">
                <div className="flex justify-center space-x-2">
                  {displayImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative w-16 h-16 overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                        selectedImageIndex === index
                          ? "border-white"
                          : "border-white/30 hover:border-white/50"
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        fill
                        quality={85}
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
