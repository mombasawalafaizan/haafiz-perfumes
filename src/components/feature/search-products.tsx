"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { getProducts } from "@/lib/actions/product";
import usePaginatedQuery from "@/hooks/usePaginatedQuery";
import { IProductDetail } from "@/types/product";
import { imageSortFn } from "@/lib/utils";

interface SearchProductsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchProducts({ open, onOpenChange }: SearchProductsProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Only search when we have at least 3 characters
  const shouldSearch = debouncedSearchQuery.length >= 3;

  const { data: productsResult, isLoading } = usePaginatedQuery(
    ["search-products", debouncedSearchQuery],
    getProducts,
    {
      page: 1,
      page_size: 3,
      search: shouldSearch ? debouncedSearchQuery : undefined,
      ordering: "-updated_at",
    },
    {
      enabled: shouldSearch, // Only run query when we have enough characters
    }
  );

  const closeSearch = useCallback(() => {
    onOpenChange(false);
    setSearchQuery("");
  }, [onOpenChange, setSearchQuery]);

  const handleProductClick = useCallback(
    (product: IProductDetail) => {
      router.push(`/products/${product.slug}`);
      onOpenChange(false);
      setSearchQuery("");
    },
    [router, onOpenChange, setSearchQuery]
  );

  const getProductImage = (product: IProductDetail) => {
    // First try to get primary product image
    const productImages = product.product_images?.sort(imageSortFn);
    const primaryProductImage = productImages?.find((img) => img.is_primary);

    if (primaryProductImage?.images?.backblaze_url)
      return primaryProductImage.images.backblaze_url;

    // If no primary product image, try to get first product image
    if (productImages?.[0]?.images?.backblaze_url)
      return productImages[0].images.backblaze_url;

    // Fallback to placeholder
    return product.category === "perfume"
      ? "/perfume_placeholder.jpg"
      : "/attar_placeholder.jpg";
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={closeSearch}
      className="top-[150px]"
    >
      <CommandInput
        placeholder="Search products..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {shouldSearch ? (
            isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching products...
                </span>
              </div>
            ) : !productsResult?.data?.length ? (
              `No products found for "${debouncedSearchQuery}"`
            ) : null
          ) : (
            "Type at least 3 characters to search..."
          )}
        </CommandEmpty>

        {shouldSearch &&
          !isLoading &&
          productsResult?.data &&
          productsResult.data.length > 0 && (
            <CommandGroup heading="Products">
              {productsResult.data.map((product: IProductDetail) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleProductClick(product)}
                  className="flex items-center gap-3 p-3 cursor-pointer data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary"
                  value={`${product.name} ${product.category}`}
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize font-bold">
                      {product.category}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
      </CommandList>
    </CommandDialog>
  );
}
