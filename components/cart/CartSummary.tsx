"use client";

import { useState } from "react";
import type { CartItem } from "@/types/cart";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

export function CartSummary({ items }: { items: CartItem[] }) {
  const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function checkout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="sticky top-4 h-fit">
      <h2 className="text-xl font-bold">Order Summary</h2>
      <div className="mt-4 flex justify-between text-slate-700">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <p className="mt-2 text-sm text-slate-500">Taxes and shipping can be added as a future course extension.</p>
      <Button className="mt-6 w-full" disabled={items.length === 0 || loading} onClick={checkout}>
        {loading ? "Creating checkout..." : "Checkout with Stripe"}
      </Button>
    </Card>
  );
}
