import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 pb-16 pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <div className="hidden md:flex justify-center space-x-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Pricing Skeleton */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-24 rounded-lg" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Add to Cart Skeleton */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-10 w-10" />
            </div>
            <Skeleton className="flex-1 h-12" />
          </div>

          {/* Features Banner Skeleton */}
          <Skeleton className="h-32 w-full rounded-lg" />

          {/* Fragrance Notes Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
