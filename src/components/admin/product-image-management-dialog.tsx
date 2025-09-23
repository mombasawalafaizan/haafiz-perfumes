"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
import {
  Upload,
  Trash2,
  Star,
  StarOff,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { IImage, IProductImage } from "@/types/product";
import { uploadFile, deleteFile } from "@/lib/actions/upload";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  saveImage,
  deleteProductImage,
  getProductImages,
} from "@/lib/actions/product";
import { cn } from "@/lib/utils";

interface ImageManagementDialogProps {
  isOpen: boolean;
  productId: string;
  onClose: () => void;
  title?: string;
  description?: string;
  onSave: (images: Partial<IProductImage>[]) => void;
}

type ImageState = Partial<IProductImage> & Partial<IImage>;

const checkPrimaryImage = (images: ImageState[]) => {
  return images.some((img) => img.is_primary);
};

function ProductImageManagementDialog({
  isOpen,
  onClose,
  onSave,
  productId,
  title = "Manage Images",
  description = "Upload and manage product images",
}: ImageManagementDialogProps) {
  const [images, setImages] = useState<ImageState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: productImages, isLoading: isProductImagesLoading } = useQuery({
    queryKey: ["productImages", productId, isOpen],
    queryFn: () => getProductImages(productId),
    enabled: !!productId && isOpen,
  });

  useEffect(() => {
    if (productImages?.data) {
      const newArray = productImages.data?.map((image) => {
        return {
          ...image.images,
          id: image.id!,
          image_id: image.images?.id,
          is_primary: image.is_primary || false,
          display_order: image.display_order || 0,
        };
      });
      newArray.sort((a, b) => a.display_order - b.display_order);
      setImages(newArray);
    }
  }, [productImages]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadFile(formData);

        if (result.success && result.data) {
          const imagePayload: Partial<IImage> = {
            filename: result.data.fileName,
            backblaze_url: result.data.downloadUrl,
            backblaze_key: result.data.backblazeKey,
            alt_text: result.data.altText,
            file_size: result.data.fileSize,
            mime_type: result.data.mimeType,
            context: "product",
          };
          const createImageResult = await saveImage(imagePayload);
          if (!result.success)
            throw new Error(result.error || "Failed to create image");
          const newImageWithState: ImageState = {
            ...createImageResult.data!,
            is_primary: images.length === 0,
            image_id: createImageResult.data?.id,
            display_order: images.length,
          };
          delete newImageWithState.id;
          setImages((prev) => [...prev, newImageWithState]);
          toast.success("Image uploaded successfully");
        } else {
          throw new Error(result.error || "Failed to create image");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [images.length]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = useCallback(
    async (imageId: string) => {
      setIsDeleting(imageId);
      try {
        const image = images.find((img) => img.image_id! === imageId);
        if (!image) return;

        // Delete image from Backblaze
        const result = await deleteFile(image.backblaze_key!, image.filename!);
        if (!result.success)
          throw new Error(result.error || "Failed to delete image");

        // Delete image from database
        const deleteImageResult = await deleteProductImage(imageId);
        if (!deleteImageResult.success)
          throw new Error(deleteImageResult.error || "Failed to delete image");

        setImages((prev) => {
          const updated = prev.filter((img) => img.image_id! !== imageId);
          // If we deleted the primary image, make the first remaining image primary
          if (!checkPrimaryImage(updated) && updated.length > 0)
            updated[0].is_primary = true;

          return updated;
        });
        toast.success("Image deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Error deleting image!");
      } finally {
        setIsDeleting(null);
      }
    },
    [images]
  );

  const handleSetPrimary = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.image_id! === imageId,
      }))
    );
  };

  const handleSave = () => {
    if (images.length === 0) {
      toast.error("At least one image is required");
      return;
    }
    if (!checkPrimaryImage(images)) {
      toast.error("At least one image must be primary");
      return;
    }

    const productImages: Partial<IProductImage>[] = images.map((image, idx) => {
      const res = {
        id: image.id,
        product_id: productId,
        image_id: image.image_id!,
        display_order: idx + 1,
        is_primary: image.is_primary!,
      };
      if (!image.id) delete res.id;
      return res;
    });

    onSave(productImages);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const isLoading = isUploading || !!isDeleting || isProductImagesLoading;

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
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  loading={isUploading}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">
                  Upload one image at a time
                </span>
              </div>
            </div>

            {isProductImagesLoading ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Loader2 className="h-12 animate-spin w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Loading images...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Images ({images.length})
                  </Label>
                  {images.length > 0 && (
                    <Badge variant="secondary">
                      {images.filter((img) => img.is_primary).length} Primary
                    </Badge>
                  )}
                </div>

                {images.length === 0 ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No images uploaded yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click &quot;Upload Image&quot; to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.image_id!}
                        className={cn(
                          `relative group border rounded-lg overflow-hidden bg-muted/30`
                        )}
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={image.backblaze_url!}
                            alt={image.alt_text || `Product image`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover"
                          />

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(image.image_id!)}
                              disabled={isDeleting === image.image_id!}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant={
                                image.is_primary ? "default" : "secondary"
                              }
                              onClick={() => handleSetPrimary(image.image_id!)}
                            >
                              {image.is_primary ? (
                                <Star className="h-4 w-4" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {/* Primary Badge */}
                          {image.is_primary && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="default" className="text-xs">
                                Primary
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={images.length === 0}>
            Continue to Variants
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProductImageManagementDialog;
