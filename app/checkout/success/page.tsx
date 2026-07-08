import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CheckoutSuccessPage() {
  return (
    <section className="container-page max-w-2xl">
      <Card>
        <h1 className="text-3xl font-bold text-green-700">Payment successful</h1>
        <p className="mt-4 text-slate-600">Thank you for testing AuraCart checkout. In production, order details are confirmed through Stripe webhooks.</p>
        <Link href="/products" className="mt-6 inline-block"><Button>Continue shopping</Button></Link>
      </Card>
    </section>
  );
}
