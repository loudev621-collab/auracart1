import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="container-page py-12">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="mt-4 text-red-600">
          Unable to load products: {error.message}
        </p>
      </section>
    );
  }

  return (
    <section className="container-page py-12">
      <h1 className="text-3xl font-bold">Products</h1>
      <p className="mt-2 text-slate-600">
        Browse AuraCart demo products loaded from Supabase.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {(data ?? []).map((product) => (
          <div key={product.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="mt-2 text-slate-600">
              {product.description ?? "No description"}
            </p>
            <p className="mt-4 font-semibold">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}