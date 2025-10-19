"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { TProductQuality } from "@/types/product";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, ImageIcon, Package, Loader2 } from "lucide-react";
import { VariantImageManagementDialog } from "@/components/admin/variant-image-management-dialog";
import {
  productVariantsSchema,
  ProductVariantsFormData,
} from "@/lib/validations/product";
import {
  fetchProductVariants,
  deleteProductVariant,
  bulkUpsertProductVariants,
} from "@/lib/actions/product";
import { getAdminQueryClient } from "@/lib/query-client";

interface IVariantManagementProps {
  isOpen: boolean;
  productId?: string;
  onSave: (saved?: boolean, options?: { showProductInfo?: boolean }) => void;
}

const qualityOptions: { label: string; value: TProductQuality }[] = [
  { label: "Standard", value: "Standard" },
  { label: "Premium", value: "Premium" },
  { label: "Luxury", value: "Luxury" },
];

const EmptyVariant = {
  id: undefined, // New variant, no ID yet
  product_quality: "Standard" as TProductQuality,
  price: 0,
  mrp: 0,
  stock: 0,
  volume: 1,
  sku: "",
};

export function VariantManagement({
  isOpen,
  onSave,
  productId,
}: IVariantManagementProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null
  );
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const { data: productVariants, isLoading: isFetchingVariants } = useQuery({
    queryKey: ["productVariants", productId],
    queryFn: () => fetchProductVariants(productId!),
    enabled: !!productId,
  });

  const form = useForm<ProductVariantsFormData>({
    resolver: zodResolver(productVariantsSchema),
    defaultValues: { variants: [{ ...EmptyVariant }] },
  });

  useEffect(() => {
    if (!!productVariants?.data?.length)
      form.setValue("variants", productVariants.data);
  }, [productVariants, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
    keyName: "fieldId", // Rename RHF's internal id to avoid confusion with our database id
  });

  const addVariant = () => {
    append({ ...EmptyVariant });
  };

  const removeVariant = async (index: number) => {
    const variant = form.getValues(`variants.${index}`);

    // If variant has a database ID, delete it from the database first
    if (variant.id) {
      setDeletingVariantId(variant.id);
      try {
        const result = await deleteProductVariant(variant.id);

        if (result.success) {
          // Remove from form after successful database deletion
          remove(index);
          toast.success("Variant deleted successfully");
        } else {
          throw new Error(result.error || "Failed to delete variant");
        }
      } catch (error) {
        console.error("Error deleting variant:", error);
        toast.error("Failed to delete variant. Please try again.");
      } finally {
        setDeletingVariantId(null);
      }
    } else {
      // If it's a new variant (no database ID), just remove from form
      remove(index);
    }
  };

  const handleImageManagement = async (index: number) => {
    const variant = form.getValues(`variants.${index}`);
    let variantId = variant.id;

    // If variant doesn't have an ID (new variant), validate and save it first
    if (!variantId) {
      // Validate the specific variant before saving
      const variantValidation = await form.trigger(`variants.${index}`);

      if (!variantValidation) {
        toast.error("Please fix validation errors before managing images");
        return;
      }

      // Also validate the entire form to check for cross-variant validations (like unique quality)
      const formValidation = await form.trigger();

      if (!formValidation) {
        toast.error("Please fix all validation errors before managing images");
        return;
      }

      setIsSaving(true);
      try {
        const variantWithProductId = {
          ...variant,
          product_id: productId,
        };

        const result = await bulkUpsertProductVariants([variantWithProductId]);

        if (result.success && result.data && result.data.length > 0) {
          variantId = result.data[0].id;
          // Update the form with the new ID
          form.setValue(`variants.${index}.id`, variantId);
          toast.success("Variant saved successfully");
        } else {
          toast.error(result.error || "Failed to save variant");
        }
      } catch (error) {
        console.error("Error saving variant:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save variant. Please try again."
        );
        return;
      } finally {
        setIsSaving(false);
      }
    }

    // Open the image management dialog
    setSelectedVariantId(variantId || null);
    setImageDialogOpen(true);
  };

  const onSubmit = async (data: ProductVariantsFormData) => {
    setIsSaving(true);
    try {
      const variantsWithProductId = data.variants.map((variant) => ({
        ...variant,
        product_id: productId,
      }));

      const result = await bulkUpsertProductVariants(variantsWithProductId);
      getAdminQueryClient().invalidateQueries({
        queryKey: ["productVariants", productId],
      });

      if (result.success) {
        // Update form with the returned IDs for any new variants
        if (result.data) {
          const updatedVariants = data.variants.map((variant, index) => ({
            ...variant,
            id: result.data![index]?.id || variant.id,
          }));
          form.setValue("variants", updatedVariants);
        }

        toast.success("All variants saved successfully");
        onSave(true, { showProductInfo: false });
      } else {
        toast.error(result.error || "Failed to save variants");
      }
    } catch (error) {
      console.error("Error saving variants:", error);
      toast.error("Failed to save variants. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const generateSKU = (index: number, quality: TProductQuality) => {
    const qualityPrefix = quality.toUpperCase().substring(0, 3);
    const indexSuffix = String(index + 1).padStart(2, "0");
    return `${qualityPrefix}-${indexSuffix}`;
  };

  // Generate stable key for React rendering to avoid useFieldArray reinitialization issues
  const getStableKey = (variant: { id?: string }, fieldId: string) => {
    // Use database ID when available (existing variants), fallback to RHF's fieldId for new variants
    return variant.id || fieldId;
  };

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={() => onSave(false, { showProductInfo: false })}
      >
        <SheetContent side="right" className="w-full gap-0 sm:max-w-2xl">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Variants
            </SheetTitle>
            <SheetDescription>
              Create different quality levels and pricing for your product
            </SheetDescription>
          </SheetHeader>

          <ScrollArea>
            <div className="max-h-[calc(100vh-150px)] p-4 space-y-6">
              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="flex items-center gap-2 ml-auto"
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>

              {isFetchingVariants ? (
                <div className="flex items-center gap-2 text-muted-foreground justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading variants...
                </div>
              ) : (
                <Form {...form}>
                  <form className="space-y-6 pb-4">
                    {/* Display form-level errors */}
                    {!!form.formState.errors.variants?.message && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                          {form.formState.errors.variants.message}
                        </p>
                      </div>
                    )}
                    <div className="grid gap-6">
                      {fields.map((field, index) => {
                        const variant = form.getValues(`variants.${index}`);
                        // Use stable key to avoid useFieldArray reinitialization issues
                        const stableKey = getStableKey(variant, field.fieldId);
                        return (
                          <Card key={stableKey} className="relative">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  <FormField
                                    control={form.control}
                                    name={`variants.${index}.product_quality`}
                                    render={({ field }) => (
                                      <FormItem className="flex-1">
                                        <Select
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            // Auto-generate SKU when quality changes
                                            const sku = generateSKU(
                                              index,
                                              value as TProductQuality
                                            );
                                            form.setValue(
                                              `variants.${index}.sku`,
                                              sku
                                            );
                                          }}
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger className="w-40">
                                              <SelectValue placeholder="Quality" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {qualityOptions.map((option) => (
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
                                </CardTitle>

                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleImageManagement(index)}
                                    disabled={isSaving || isFetchingVariants}
                                    className="flex items-center gap-2"
                                  >
                                    <ImageIcon className="h-4 w-4" />
                                    {isSaving ? "Saving..." : "Manage Images"}
                                  </Button>

                                  {fields.length > 1 && variant.id && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          disabled={
                                            deletingVariantId === variant.id ||
                                            isSaving
                                          }
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          {deletingVariantId === variant.id &&
                                            "Deleting..."}
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete Variant
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this
                                            variant? This action cannot be
                                            undone.
                                            {variant.id && (
                                              <span className="block mt-2 text-sm text-muted-foreground">
                                                This will permanently remove the
                                                variant from the database.
                                              </span>
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => removeVariant(index)}
                                            className="bg-destructive text-background hover:bg-destructive/90"
                                            disabled={
                                              deletingVariantId !== null
                                            }
                                          >
                                            {deletingVariantId
                                              ? "Deleting..."
                                              : "Delete"}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Price */}
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.price`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Price (₹)</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          placeholder="29.99"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* MRP */}
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.mrp`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>MRP (₹)</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          placeholder="39.99"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Stock */}
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.stock`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Stock</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          placeholder="100"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Volume */}
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.volume`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Volume (ml)</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          placeholder="50"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 1
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* SKU */}
                              <FormField
                                control={form.control}
                                name={`variants.${index}.sku`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>SKU</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="LUX-STD-01"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Hidden ID field */}
                              <FormField
                                control={form.control}
                                name={`variants.${index}.id`}
                                render={({ field }) => (
                                  <input type="hidden" {...field} />
                                )}
                              />

                              {/* Variant Images Status */}
                              {/* {variantImages[`variant-${index}`] && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Images configured for this variant
                      </span>
                    </div>
                  )} */}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </ScrollArea>
          <SheetFooter className="flex bg-background border-t flex-row justify-end gap-4">
            <Button
              variant="outline"
              disabled={isSaving}
              className="min-w-32"
              onClick={() => onSave(false, { showProductInfo: false })}
            >
              Cancel
            </Button>
            <Button
              className="min-w-32"
              onClick={() => onSave(false, { showProductInfo: true })}
            >
              Go to Product Info
            </Button>
            <Button
              disabled={isSaving}
              className="min-w-32"
              onClick={() => {
                form.handleSubmit(onSubmit)();
              }}
            >
              {isSaving ? "Saving..." : "Save All Variants"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Variant Image Management Dialog */}
      {imageDialogOpen && (
        <VariantImageManagementDialog
          isOpen={true}
          variantId={selectedVariantId}
          productId={productId || ""}
          onClose={() => {
            setImageDialogOpen(false);
            setSelectedVariantId(null);
          }}
          title="Select Variant Images"
          description="Choose images for this variant from the product images"
        />
      )}
    </>
  );
}
