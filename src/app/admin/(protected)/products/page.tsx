import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Edit, Trash2 } from "lucide-react";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample Product Cards */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="overflow-hidden">
            <div className="aspect-square bg-muted/50 flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Sample Product {item}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Premium fragrance collection
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">₹1,299</div>
                  <div className="text-sm text-muted-foreground">
                    In Stock: 25
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (when no products) */}
      <Card className="text-center py-12">
        <CardContent>
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first product to the store
          </p>
          <Button className="flex items-center space-x-2 mx-auto">
            <Plus className="h-4 w-4" />
            <span>Add Your First Product</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
