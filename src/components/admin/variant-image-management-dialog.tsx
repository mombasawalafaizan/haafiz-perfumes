"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Star, StarOff, ImageIcon, Check, Loader2 } from "lucide-react";
import { IImage, IVariantImage } from "@/types/product";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  getProductImages,
  getVariantImages,
  replaceVariantImages,
} from "@/lib/actions/product";
import { cn } from "@/lib/utils";
import { getAdminQueryClient } from "@/lib/query-client";

interface VariantImageManagementDialogProps {
  isOpen: boolean;
  variantId: string | null;
  productId: string;
  onClose: () => void;
  title?: string;
  description?: string;
}

type ProductImageWithSelection = IImage & {
  isSelected: boolean;
  isPrimary: boolean;
  displayOrder: number;
};

const checkPrimaryImage = (images: ProductImageWithSelection[]) => {
  return images.some((img) => img.isPrimary);
};

export function VariantImageManagementDialog({
  isOpen,
  variantId,
  productId,
  onClose,
  title = "Select Variant Images",
  description = "Choose images for this variant from the product images",
}: VariantImageManagementDialogProps) {
  const [selectedImages, setSelectedImages] = useState<
    ProductImageWithSelection[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch product images
  const { data: productImages, isLoading: isProductImagesLoading } = useQuery({
    queryKey: ["productImages", productId, isOpen],
    queryFn: () => getProductImages(productId),
    enabled: !!productId && isOpen,
  });

  // Fetch variant images
  const { data: variantImages, isLoading: isVariantImagesLoading } = useQuery({
    queryKey: ["variantImages", variantId, isOpen],
    queryFn: () => getVariantImages(variantId!),
    enabled: !!variantId && isOpen,
  });

  // Initialize selected images when data is loaded
  useEffect(() => {
    if (productImages?.data && variantImages?.data) {
      const productImagesArray = productImages.data.map((item) => item.images);

      // Create a map of variant images for quick lookup
      const variantImagesMap = new Map();
      variantImages.data.forEach((variantImg) => {
        variantImagesMap.set(variantImg.image_id, {
          isPrimary: variantImg.is_primary || false,
          displayOrder: variantImg.display_order || 0,
        });
      });

      // Initialize selected images
      const initializedImages: ProductImageWithSelection[] =
        productImagesArray.map((image) => {
          const variantData = variantImagesMap.get(image.id);
          return {
            ...image,
            isSelected: !!variantData,
            isPrimary: variantData?.isPrimary || false,
            displayOrder: variantData?.displayOrder || 0,
          };
        });

      setSelectedImages(initializedImages);
    } else if (productImages?.data && !variantImages?.data) {
      // No variant images exist yet, initialize with all unselected
      const initializedImages: ProductImageWithSelection[] =
        productImages.data.map((item) => ({
          ...item.images,
          id: item.images.id,
          isSelected: false,
          isPrimary: false,
          displayOrder: 0,
        }));
      setSelectedImages(initializedImages);
    }
  }, [productImages, variantImages]);

  const handleImageSelection = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              isSelected: !img.isSelected,
              isPrimary: !img.isSelected ? false : img.isPrimary,
            }
          : img
      )
    );
  };

  const handleSetPrimary = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === imageId && img.isSelected,
      }))
    );
  };

  const handleSave = async () => {
    if (!variantId) {
      toast.error("Variant ID is required");
      return;
    }

    const selectedImagesList = selectedImages.filter((img) => img.isSelected);

    if (selectedImagesList.length === 0) {
      toast.error("At least one image must be selected");
      return;
    }

    if (!checkPrimaryImage(selectedImagesList)) {
      toast.error("At least one image must be marked as primary");
      return;
    }

    setIsSaving(true);
    try {
      const variantImages: Partial<IVariantImage>[] = selectedImagesList.map(
        (image, index) => ({
          variant_id: variantId,
          image_id: image.id,
          display_order: index + 1,
          is_primary: image.isPrimary,
        })
      );

      const result = await replaceVariantImages(variantId, variantImages);

      if (result.success) {
        getAdminQueryClient().invalidateQueries({
          queryKey: ["variantImages", variantId],
        });
        toast.success("Variant images updated successfully!");
        onClose();
      } else {
        throw new Error(result.error || "Failed to update variant images");
      }
    } catch (error) {
      console.error("Error saving variant images:", error);
      toast.error("Failed to update variant images. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isLoading =
    isProductImagesLoading || isVariantImagesLoading || isSaving;
  const selectedCount = selectedImages.filter((img) => img.isSelected).length;
  const primaryCount = selectedImages.filter(
    (img) => img.isSelected && img.isPrimary
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-7xl max-h-[90vh]"
        showCloseButton={!isLoading}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          {isProductImagesLoading || isVariantImagesLoading ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Loader2 className="h-12 animate-spin w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Loading images...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selection Summary */}
              <div className="flex flex-col items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4 mb-1">
                  <Label className="text-sm font-medium">
                    Selected Images: {selectedCount}
                  </Label>
                  {selectedCount > 0 && (
                    <Badge variant="secondary">{primaryCount} Primary</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Click images to select/deselect, then mark one as primary
                </div>
              </div>

              {/* Images Grid */}
              <div className="space-y-4">
                {selectedImages.length === 0 ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No product images available
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload product images first to select variant images
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {productImages?.data?.map((image) => {
                      const selectedImage = selectedImages.find(
                        (img) => img.id === image.images.id
                      )!;
                      return (
                        <div
                          key={image.id}
                          className={cn(
                            "relative group border rounded-lg overflow-hidden bg-muted/30 cursor-pointer transition-all",
                            {
                              "border-primary ring-2 ring-primary/20":
                                !!selectedImage.isSelected,
                              "border-muted-foreground/25": !selectedImage,
                            }
                          )}
                          onClick={() => handleImageSelection(image.images.id)}
                        >
                          <div className="aspect-[3/4] relative">
                            <Image
                              src={image.images.backblaze_url}
                              alt={image.images.alt_text || `Product image`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-cover"
                            />

                            {/* Selection Overlay */}
                            <div
                              className={cn(
                                "absolute inset-0 transition-opacity",
                                !!selectedImage.isSelected
                                  ? "bg-primary/20"
                                  : "bg-black/50 opacity-0 group-hover:opacity-100"
                              )}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                {!selectedImage.isSelected && (
                                  <div className="text-white text-sm font-medium">
                                    Click to select
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons - Only show for selected images */}
                            {selectedImage.isSelected && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant={
                                    selectedImage.isPrimary
                                      ? "default"
                                      : "secondary"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPrimary(image.images.id);
                                  }}
                                >
                                  {selectedImage.isPrimary ? (
                                    <Star className="h-4 w-4" />
                                  ) : (
                                    <StarOff className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            )}

                            {/* Selection Badge */}
                            {selectedImage.isSelected && (
                              <div className="absolute top-2 left-2">
                                <Badge
                                  variant="default"
                                  className="text-xs rounded-full"
                                >
                                  <Check className="h-4 w-4" />
                                </Badge>
                              </div>
                            )}

                            {/* Primary Badge */}
                            {selectedImage.isSelected &&
                              selectedImage.isPrimary && (
                                <div className="absolute top-2 right-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Primary
                                  </Badge>
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedCount === 0 || primaryCount === 0 || isSaving}
          >
            {isSaving ? "Saving..." : "Save Selection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
