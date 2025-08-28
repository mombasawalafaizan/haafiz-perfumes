"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from '@/components/ui/card';
import { getProductById } from "@/data/products";
import { getLeastPriceOption, createProductWithPricing } from "@/lib/utils";
import {
  ShoppingCart,
  Minus,
  Plus,
  Search,
  Truck,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
// import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const ProductDetailPage = () => {
  const params = useParams();
  // const router = useRouter();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedPricing, setSelectedPricing] =
    useState<IProductPricing | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showMobileCarousel, setShowMobileCarousel] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mobileMainCarouselApi, setMobileMainCarouselApi] =
    useState<CarouselApi | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (params.id) {
      const foundProduct = getProductById(params.id as string);
      if (foundProduct) {
        setProduct(foundProduct);
        // Set default pricing to least price option if multiple pricing options exist
        if (foundProduct.pricing && foundProduct.pricing.length > 0) {
          const leastPriceOption = getLeastPriceOption(foundProduct.pricing);
          setSelectedPricing(leastPriceOption);
        }
      }
    }
  }, [params.id]);

  // Sync mobile main carousel with selected image
  useEffect(() => {
    if (mobileMainCarouselApi) {
      const handleSelect = () => {
        const selectedIndex = mobileMainCarouselApi.selectedScrollSnap();
        setSelectedImageIndex(selectedIndex);
      };

      mobileMainCarouselApi.on("select", handleSelect);
      return () => {
        mobileMainCarouselApi.off("select", handleSelect);
      };
    }
  }, [mobileMainCarouselApi]);

  const handleAddToCart = () => {
    if (product) {
      let productToAdd = product;

      // If there's selected pricing, create product with that pricing
      if (selectedPricing) {
        productToAdd = createProductWithPricing(product, selectedPricing);
      }
      addItem(productToAdd, quantity);
      // if (result.success) {
      //   if (result.discarded > 0) {
      //     toast({
      //       title: 'Cart limit reached! ⚠️',
      //       description: `${result.added} × ${product.name} added to cart. ${result.discarded} items discarded (max 10 items allowed).`,
      //       variant: 'destructive',
      //     });
      //   } else {
      //     toast({
      //       title: 'Added to cart! 🛍️',
      //       description: `${result.added} × ${product.name} added to your cart.`,
      //     });
      //   }
      // } else {
      //   toast({
      //     title: 'Cart is full! 🛒',
      //     description: 'Your cart has reached the maximum limit of 10 items. Please remove some items to add more.',
      //     variant: 'destructive',
      //   });
      // }
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Product Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/collections">Browse Collections</Link>
        </Button>
      </div>
    );
  }

  const discountPercentage = Math.round(
    ((product.priceMRP - product.priceActual) / product.priceMRP) * 100
  );

  const hasMultiplePricing = product.pricing && product.pricing.length > 1;

  // Create image array for carousel (using same image for now, you can add more images)
  const productImages = [
    product.imageUrl,
    "/haafiz_perfumes_branding.png", // Replace with actual different images
    product.imageUrl,
    "/haafiz_perfumes_branding.png", // Replace with actual different images
    product.imageUrl,
    "/haafiz_perfumes_branding.png", // Replace with actual different images
    product.imageUrl,
    "/haafiz_perfumes_branding.png", // Replace with actual different images
    product.imageUrl, // Replace with actual different images
    product.imageUrl, // Replace with actual different images
  ];

  return (
    <div>
      {/* Product Detail */}
      <section className="container mx-auto px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square overflow-hidden rounded-lg border border-border cursor-zoom-in group"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <Image
                src={productImages[selectedImageIndex]}
                alt={product.name}
                fill
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
            <div className="hidden md:block">
              <div className="flex justify-center space-x-2">
                {productImages.map((image, index) => (
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
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Mini Carousel - Only show in modal */}
            {/* Removed the mobile mini carousel from main view */}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Pricing Selection */}
            {hasMultiplePricing && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {product.pricing!.map((pricingOption, index) => {
                    const isSelected = selectedPricing === pricingOption;
                    // const optionDiscount = pricingOption.mrp && pricingOption.price
                    //   ? Math.round(((pricingOption.mrp - pricingOption.price) / pricingOption.mrp) * 100)
                    //   : 0;

                    return (
                      <div
                        key={index}
                        className={`py-2 px-4 border-2 rounded-lg cursor-pointer transition-all w-fit flex gap-0.5 flex-col items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-primary/20 hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPricing(pricingOption)}
                      >
                        <div className="font-semibold w-fit text-foreground">
                          {pricingOption.volume}ml
                        </div>
                        {pricingOption.quality && (
                          <span className="text-sm text-muted-foreground">
                            ({pricingOption.quality})
                          </span>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-primary">
                            ₹{pricingOption.price?.toLocaleString()}
                          </span>
                          {pricingOption.mrp &&
                            pricingOption.price &&
                            pricingOption.mrp > pricingOption.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{pricingOption.mrp.toLocaleString()}
                              </span>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Display */}
            {!hasMultiplePricing && (
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-primary">
                    ₹{product.priceActual.toLocaleString()}
                  </span>
                  {product.priceMRP > product.priceActual && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.priceMRP.toLocaleString()}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <p className="text-lg text-primary font-medium">
                    Save ₹
                    {(product.priceMRP - product.priceActual).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Selected Price Display */}
            {hasMultiplePricing && selectedPricing && (
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-primary">
                    ₹{selectedPricing.price?.toLocaleString()}
                  </span>
                  {selectedPricing.mrp &&
                    selectedPricing.price &&
                    selectedPricing.mrp > selectedPricing.price && (
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{selectedPricing.mrp.toLocaleString()}
                      </span>
                    )}
                </div>
                {selectedPricing.mrp && selectedPricing.price && (
                  <p className="text-lg text-primary font-medium">
                    Save ₹
                    {(
                      selectedPricing.mrp - selectedPricing.price
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={hasMultiplePricing && !selectedPricing}
                className="flex-1 btn-gradient-golden text-black font-semibold py-3 text-lg"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Features Banner */}
            <div className="bg-gradient-card p-6 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center relative">
                    <RotateCcw className="w-6 h-6 text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-0.5 bg-primary rotate-135 transform origin-center"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white">
                    Non Returnable
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    COD Available
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    Fast Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Fragrance Notes */}
            {product.fragrance_family &&
              product.fragrance_family.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Fragrance Family
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.fragrance_family.map((note, index) => (
                      <Badge key={index} variant="secondary">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Additional Notes */}
            {product.additional_notes && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Additional Notes
                </h3>
                <p className="text-muted-foreground">
                  {product.additional_notes}
                </p>
              </div>
            )}
            {/* Fragrance Notes Details */}
            {(product.top_notes ||
              product.middle_notes ||
              product.base_notes) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Fragrance Notes
                </h3>
                <div className="space-y-2">
                  {product.top_notes && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">
                        Top Notes:
                      </span>
                      <p className="text-foreground">{product.top_notes}</p>
                    </div>
                  )}
                  {product.middle_notes && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">
                        Middle Notes:
                      </span>
                      <p className="text-foreground">{product.middle_notes}</p>
                    </div>
                  )}
                  {product.base_notes && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">
                        Base Notes:
                      </span>
                      <p className="text-foreground">{product.base_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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
              >
                <CarouselContent>
                  {productImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        <Image
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          fill
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
            <div className="p-4 border-t border-white/20">
              <div className="flex justify-center space-x-2">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-16 h-16 overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                      selectedImageIndex === index
                        ? "border-white"
                        : "border-white/30 hover:border-white/50"
                    }`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      // Sync the main carousel with the selected image
                      if (mobileMainCarouselApi) {
                        mobileMainCarouselApi.scrollTo(index);
                      }
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
