import { ProductGrid } from "@/components/products/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="container-page text-red-600">Unable to load products: {error.message}</div>;
  }

  return (
    <section className="container-page">
      <h1 className="text-3xl font-bold">Products</h1>
      <p className="mt-2 text-slate-600">Browse AuraCart demo products loaded from Supabase.</p>
      <div className="mt-8"><ProductGrid products={(data || []) as Product[]} /></div>
    </section>
  );
}
