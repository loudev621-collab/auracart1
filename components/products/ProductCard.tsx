import Link from "next/link";
import type { Product } from "@/types/product";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="flex h-full flex-col gap-4">
      <Link href={`/products/${product.id}`} className="block overflow-hidden rounded-xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url || "/images/product-placeholder.svg"}
          alt={product.name}
          className="h-48 w-full object-cover transition hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <Link href={`/products/${product.id}`} className="text-lg font-semibold text-slate-900">{product.name}</Link>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-bold text-brand-700">{formatCurrency(product.price)}</span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </Card>
  );
}
