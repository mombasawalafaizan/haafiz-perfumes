import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-card">
      <div className="flex md:hidden">
        {/* Left Section - Product Image */}
        <div className="relative w-2/5 aspect-[3/4] overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Right Section - Product Details */}
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Product Name */}
            <div>
              <Skeleton className="h-4 md:h-5 w-3/4 mb-1" />
            </div>

            {/* Price Information */}
            <div className="space-y-2 mb-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Add to Cart Button */}
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
      <div className="hidden md:block relative aspect-[3/4] overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="hidden md:block p-3 md:p-4">
        <div className="space-y-2 md:space-y-3">
          <div>
            <Skeleton className="h-4 md:h-5 w-3/4 mb-1" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>

          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
