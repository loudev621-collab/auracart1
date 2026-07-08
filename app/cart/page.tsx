"use client";

import { useEffect, useState } from "react";
import type { CartItem as CartItemType } from "@/types/cart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";

const CART_KEY = "auracart.cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>([]);

  function loadCart() {
    setItems(JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItemType[]);
  }

  function saveCart(nextItems: CartItemType[]) {
    setItems(nextItems);
    localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
  }

  useEffect(() => {
    loadCart();
    window.addEventListener("auracart:cart-updated", loadCart);
    return () => window.removeEventListener("auracart:cart-updated", loadCart);
  }, []);

  return (
    <section className="container-page">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.length === 0 ? <p className="rounded-xl bg-white p-6 text-slate-600">Your cart is empty.</p> : null}
          {items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdate={(quantity) => saveCart(items.map((entry) => entry.product.id === item.product.id ? { ...entry, quantity } : entry))}
              onRemove={() => saveCart(items.filter((entry) => entry.product.id !== item.product.id))}
            />
          ))}
        </div>
        <CartSummary items={items} />
      </div>
    </section>
  );
}
