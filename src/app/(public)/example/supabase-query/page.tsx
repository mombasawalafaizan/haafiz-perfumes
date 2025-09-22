import { getProductImages } from "@/lib/actions/product";

export default async function SupabaseQueryPage() {
  const products = await getProductImages(
    "f60a567a-f373-4ee4-b738-a91cdb35f5d3"
  );
  return <div>Supabase Query</div>;

  return (
    <div>
      <h1>Supabase Query</h1>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}
