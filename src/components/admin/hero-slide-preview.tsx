"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ICreateHeroSlide } from "@/types/hero-slide";

interface HeroSlidePreviewProps {
  slideData: ICreateHeroSlide;
}

export function HeroSlidePreview({ slideData }: HeroSlidePreviewProps) {
  const {
    title,
    subtitle,
    button_text,
    link_url,
    is_internal_link,
    is_landscape_image,
    is_active,
    image_url,
  } = slideData;

  const hasContent = title || subtitle || button_text || link_url;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Preview
          <div className="flex items-center space-x-2">
            <Badge variant={is_active !== false ? "default" : "secondary"}>
              {is_active !== false ? "Active" : "Inactive"}
            </Badge>
            {is_landscape_image && <Badge variant="outline">Landscape</Badge>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Hero Carousel Style Preview */}
          <div className="relative h-[40vh] md:h-[50vh] overflow-hidden rounded-lg">
            {image_url ? (
              <div className="relative w-full h-full">
                <Image
                  src={image_url}
                  alt={title || "Hero Slide Image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`${
                    is_landscape_image ? "object-cover" : "object-contain"
                  }`}
                />

                {/* Overlay */}
                {hasContent && <div className="absolute inset-0 bg-black/40" />}

                {/* Content */}
                {hasContent && (
                  <div className="relative h-full flex items-center justify-center text-center">
                    <div className="max-w-4xl mx-auto px-4">
                      {title && (
                        <h1 className="text-5xl font-bold text-white mb-4">
                          {title}
                        </h1>
                      )}
                      {subtitle && (
                        <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                          {subtitle}
                        </p>
                      )}
                      {button_text && (
                        <Button
                          // size="lg"
                          className="bg-[#d9a514] hover:bg-[#d9a514]/90 text-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          {button_text}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No image selected</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {link_url && (
              <p>
                Link: {link_url}
                {is_internal_link ? " (Internal)" : " (External)"}
              </p>
            )}
            <p>Image Type: {is_landscape_image ? "Landscape" : "Portrait"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
