import type { Product } from "./product";

export type CartLineInput = {
  productId: string;
  quantity: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
