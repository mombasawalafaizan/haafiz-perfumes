declare interface IProduct extends IProductPricing {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  priceMRP: number;
  priceActual: number;
  sizeMl: number;
  fragrance_family: string[];
  top_notes: string;
  base_notes: string;
  middle_notes: string;
  featured?: boolean;
  additional_notes: string;
  description: string;
  pricing?: IProductPricing[];
  category: "perfume" | "attar";
}

declare interface IProductPricing {
  mrp?: number;
  price?: number;
  volume?: number;
  stock?: number;
  quality?: "Standard" | "Premium" | "Luxury";
  sku?: string;
}

declare interface IFilterState {
  [key: string]: string | number | boolean | null;
}
