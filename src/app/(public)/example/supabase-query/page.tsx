import { getProducts } from "@/lib/actions/product";

export default async function SupabaseQueryPage() {
  const products = await getProducts({
    page: 1,
    page_size: 4,
    updated_at_gte: new Date("2025-09-11").toISOString(),
  });
  console.log(products);
  return <div>Supabase Query</div>;

  return (
    <div>
      <h1>Supabase Query</h1>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}
