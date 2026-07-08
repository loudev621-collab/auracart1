import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CheckoutCancelPage() {
  return (
    <section className="container-page max-w-2xl">
      <Card>
        <h1 className="text-3xl font-bold">Checkout cancelled</h1>
        <p className="mt-4 text-slate-600">No payment was processed. You can return to your cart and try again.</p>
        <Link href="/cart" className="mt-6 inline-block"><Button>Return to cart</Button></Link>
      </Card>
    </section>
  );
}
