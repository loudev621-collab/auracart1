"use client";

import type { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";

const CART_KEY = "auracart.cart";

type StoredCartItem = {
  product: Product;
  quantity: number;
};

export function AddToCartButton({ product }: { product: Product }) {
  function addToCart() {
    const existing = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as StoredCartItem[];
    const match = existing.find((item) => item.product.id === product.id);

    const nextCart = match
      ? existing.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...existing, { product, quantity: 1 }];

    localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
    window.dispatchEvent(new Event("auracart:cart-updated"));
    alert(`${product.name} added to cart.`);
  }

  return <Button onClick={addToCart}>Add</Button>;
}
