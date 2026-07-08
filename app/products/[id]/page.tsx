import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error || !data) notFound();
  const product = data as Product;

  return (
    <section className="container-page grid gap-8 lg:grid-cols-2">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url || "/images/product-placeholder.svg"} alt={product.name} className="h-[420px] w-full object-cover" />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold">{product.name}</h1>
        <p className="mt-4 text-2xl font-bold text-brand-700">{formatCurrency(product.price)}</p>
        <p className="mt-6 leading-8 text-slate-600">{product.description}</p>
        <div className="mt-8"><AddToCartButton product={product} /></div>
      </div>
    </section>
  );
}
