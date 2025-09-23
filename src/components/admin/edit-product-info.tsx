"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { TagsInput } from "@/components/ui/tags-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, Package, Save } from "lucide-react";
import { IProductImage, IProductDetail } from "@/types/product";
import {
  createProduct,
  updateProduct,
  bulkUpsertProductImages,
} from "@/lib/actions/product";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormData, productSchema } from "@/lib/validations/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createProductSlug, getArrFromString } from "@/lib/utils";
import ProductImageManagementDialog from "@/components/admin/product-image-management-dialog";
import { getAdminQueryClient } from "@/lib/query-client";

interface EditProductProps {
  isOpen: boolean;
  onClose: (
    saved?: boolean,
    options?: { showVariants?: boolean; productId?: string }
  ) => void;
  product?: IProductDetail;
}

const categoryOptions = [
  { label: "Perfume", value: "perfume" },
  { label: "Attar", value: "attar" },
];

function EditProductInfo({ isOpen, onClose, product }: EditProductProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showImageManagement, setShowImageManagement] = useState(false);
  // const [currentVariantId, setCurrentVariantId] = useState<string>();
  const [savedProductId, setSavedProductId] = useState<string>(
    product?.id || ""
  );

  const isEditing = !!product;

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      category: product?.category || "perfume",
      fragrance_family: product?.fragrance_family || "",
      description: product?.description || "",
      top_notes: product?.top_notes || "",
      middle_notes: product?.middle_notes || "",
      base_notes: product?.base_notes || "",
      additional_notes: product?.additional_notes || "",
      is_featured: product?.is_featured ?? false,
    },
  });

  const handleProductSave = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      let result;
      if (isEditing && product) {
        result = await updateProduct(product.id!, data);
      } else {
        result = await createProduct(data);
      }

      if (result.success) {
        getAdminQueryClient().invalidateQueries({
          queryKey: ["product", result.data.id],
        });
        setSavedProductId(result.data.id);
        if (!product?.id) setShowImageManagement(true); // If new product, show image management
        toast.success(
          isEditing
            ? "Product updated successfully!"
            : "Product created successfully!"
        );
      } else {
        toast.error(result.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductImageSave = async (images: Partial<IProductImage>[]) => {
    if (!!images?.length) {
      const result = await bulkUpsertProductImages(images);
      if (result.success) {
        setShowImageManagement(false);
        getAdminQueryClient().invalidateQueries({
          queryKey: ["productImages", savedProductId],
        });
        if (product?.id)
          onClose(true, {
            showVariants: false,
          });
        // Don't show variants if editing product
        else onClose(true, { showVariants: true, productId: savedProductId }); // Show variants if new product
      } else {
        toast.error(result.error || "Failed to link images with products");
      }
    }
  };

  const handleClose = () => {
    form.reset();
    onClose(false, { showVariants: false, productId: undefined });
  };

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={() => onClose(false, { showVariants: false })}
      >
        <SheetContent side="right" className="w-full gap-0 sm:max-w-2xl">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isEditing ? "Edit Product" : "Create Product"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update product information, images, and variants"
                : "Create a new product with images and variants"}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea>
            <div className="max-h-[calc(100vh-150px)]">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Form {...form}>
                      <form className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Luxury Perfume"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    form.setValue(
                                      "slug",
                                      createProductSlug(e.target.value)
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Describe your product..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Category *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl className="w-full">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categoryOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="is_featured"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Featured Product
                                  </FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Show this product in featured sections
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="fragrance_family"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fragrance Family</FormLabel>
                              <FormControl>
                                <TagsInput
                                  value={getArrFromString(field.value || "")}
                                  onValueChange={(tags) => {
                                    field.onChange(tags.join(","));
                                  }}
                                  placeholder="Add fragrance families..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="top_notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Top Notes</FormLabel>
                              <FormControl>
                                <TagsInput
                                  value={getArrFromString(field.value || "")}
                                  onValueChange={(tags) => {
                                    field.onChange(tags.join(","));
                                  }}
                                  placeholder="Add top notes..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="middle_notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Middle Notes</FormLabel>
                              <FormControl>
                                <TagsInput
                                  value={getArrFromString(field.value || "")}
                                  onValueChange={(tags) => {
                                    field.onChange(tags.join(","));
                                  }}
                                  placeholder="Add middle notes..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="base_notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base Notes</FormLabel>
                              <FormControl>
                                <TagsInput
                                  value={getArrFromString(field.value || "")}
                                  onValueChange={(tags) => {
                                    field.onChange(tags.join(","));
                                  }}
                                  placeholder="Add base notes..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="additional_notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any additional information..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="flex bg-background border-t flex-row justify-end gap-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {!!savedProductId && (
              <Button
                onClick={() => setShowImageManagement(true)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Upload Images
              </Button>
            )}
            {!!savedProductId && (
              <Button
                onClick={() =>
                  onClose(false, {
                    showVariants: true,
                    productId: savedProductId,
                  })
                }
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                Modify Variants
              </Button>
            )}
            <Button
              onClick={form.handleSubmit(handleProductSave)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Product"
                : "Save & Continue"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Image Management Dialog */}
      {showImageManagement && (
        <ProductImageManagementDialog
          key={savedProductId}
          isOpen={showImageManagement}
          onClose={() => setShowImageManagement(false)}
          onSave={handleProductImageSave}
          title="Upload Product Images"
          description="Upload and manage images for your product. Mark one as primary."
          productId={savedProductId!}
        />
      )}
    </>
  );
}

export default EditProductInfo;
