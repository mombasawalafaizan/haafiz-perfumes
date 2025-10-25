"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IHeroSlideWithImage } from "@/types/hero-slide";
import { ExternalLink } from "@/components/ui/external-link";

export function HeroCarousel({
  heroSlides,
}: {
  heroSlides: IHeroSlideWithImage[];
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (heroSlides?.length || 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides?.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (heroSlides?.length || 1));
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + (heroSlides?.length || 1)) % (heroSlides?.length || 1)
    );
  };

  return (
    <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
      {/* Slides */}
      {heroSlides
        ?.filter((slide) => slide.is_active)
        ?.map((slide, index) => {
          const hasContent =
            slide.title ||
            slide.subtitle ||
            slide.button_text ||
            slide.link_url;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={slide.image?.backblaze_url || ""}
                  alt={slide.title ?? "Hero Slide"}
                  fill
                  className={
                    slide.is_landscape_image ? "object-cover" : "object-contain"
                  }
                  priority={index === 0}
                />

                {/* Overlay */}
                {hasContent && <div className="absolute inset-0 bg-black/40" />}

                {/* Content */}
                {hasContent && (
                  <div className="relative h-full flex items-center justify-center text-center">
                    <div className="max-w-4xl mx-auto px-4 animate-fade-in">
                      {slide.title && (
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                          {slide.title}
                        </h1>
                      )}
                      {slide.subtitle && (
                        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.button_text &&
                        (slide.is_internal_link ? (
                          <Button
                            size="lg"
                            asChild
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-premium hover:shadow-elegant transition-all duration-300 hover:scale-105"
                          >
                            <Link href={slide.link_url || ""}>
                              {slide.button_text}
                            </Link>
                          </Button>
                        ) : (
                          <ExternalLink href={slide.link_url || ""}>
                            <Button
                              size="lg"
                              asChild
                              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-premium hover:shadow-elegant transition-all duration-300 hover:scale-105"
                            >
                              {slide.button_text}
                            </Button>
                          </ExternalLink>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="md:flex hidden absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 hover:bg-white/30 text-white backdrop-blur-sm"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="md:flex hidden absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 hover:bg-white/30 text-white backdrop-blur-sm"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
