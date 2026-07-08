"use client";

import type { CartItem as CartItemType } from "@/types/cart";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export function CartItem({ item, onUpdate, onRemove }: { item: CartItemType; onUpdate: (quantity: number) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.product.image_url || "/images/product-placeholder.svg"} alt={item.product.name} className="h-24 w-24 rounded-lg object-cover" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <h3 className="font-semibold text-slate-900">{item.product.name}</h3>
          <span className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</span>
        </div>
        <p className="text-sm text-slate-600">{formatCurrency(item.product.price)} each</p>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Quantity</label>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) => onUpdate(Math.max(1, Number(event.target.value)))}
            className="w-20 rounded border border-slate-300 px-2 py-1"
          />
          <Button variant="secondary" onClick={onRemove}>Remove</Button>
        </div>
      </div>
    </div>
  );
}
