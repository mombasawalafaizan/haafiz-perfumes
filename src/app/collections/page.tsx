import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CollectionsPage() {
  return (
    <div>
      {/* Header */}
      <div className="container text-center mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          All Collections
        </h1>
        <p className="text-muted-foreground">
          Discover our complete range of perfumes and attars
        </p>
      </div>

      {/* Collections Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2  gap-8 mb-16">
          {/* Perfumes Collection */}
          <div className="bg-gradient-hero p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Premium Perfumes
            </h2>
            <p className="text-foreground mb-6">
              Luxury fragrances crafted with the finest ingredients from around
              the world
            </p>
            <Button
              asChild
              className="btn-gradient-golden text-black font-semibold"
            >
              <Link href="/collections/perfumes">Explore Perfumes</Link>
            </Button>
          </div>

          {/* Attars Collection */}
          <div className="bg-gradient-hero p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Authentic Attars
            </h2>
            <p className="text-foreground mb-6">
              Traditional attars with modern sophistication and lasting
              fragrance
            </p>
            <Button
              asChild
              className="btn-gradient-golden text-black font-semibold"
            >
              <Link href="/collections/attars">Explore Attars</Link>
            </Button>
          </div>

          {/* Combos Collection */}
          {/* <div className="bg-gradient-card p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Combo Offers
            </h2>
            <p className="text-muted-foreground mb-6">
              Curated sets and special offers for the perfect fragrance
              experience
            </p>
            <Button
              asChild
              className="btn-gradient-golden text-black font-semibold"
            >
              <Link href="/collections/combos">View Combos</Link>
            </Button>
          </div> */}
        </div>

        {/* All Products */}
        {/* <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            All Products
          </h2>
          <p className="text-muted-foreground">
            Browse our complete collection of premium fragrances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div> */}
      </div>
    </div>
  );
}
