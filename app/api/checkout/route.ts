import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";
import type { CartLineInput } from "@/types/cart";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { items?: CartLineInput[] };
    const items = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const supabase = await createClient();
    const productIds = items.map((item) => item.productId);
    const { data: products, error } = await supabase
      .from("products")
      .select("id,name,description,price,image_url,active")
      .in("id", productIds)
      .eq("active", true);

    if (error) throw error;

    const typedProducts = (products || []) as Array<{
      id: string;
      name: string;
      description: string | null;
      price: number;
      image_url: string | null;
      active: boolean;
    }>;

    const lineItems = items.map((item) => {
      const product = typedProducts.find((entry) => entry.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images:
     product.image_url && product.image_url.startsWith("http")
       ? [product.image_url]
       : undefined,
          }
        }
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${getSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/checkout/cancel`,
      metadata: {
        source: "auracart"
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
