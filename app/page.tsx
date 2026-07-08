import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <section className="container-page grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">Full-stack foundation project</p>
        <h1 className="text-5xl font-bold tracking-tight text-slate-950">Build AuraCart from database to deployment.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          AuraCart teaches students how a professional e-commerce application is planned, coded, debugged, tested, and deployed.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/products"><Button>Shop Products</Button></Link>
          <Link href="/auth/register"><Button variant="secondary">Create Account</Button></Link>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold">Course skills</h2>
        <ul className="mt-4 space-y-3 text-slate-700">
          <li>✓ Next.js App Router</li>
          <li>✓ TypeScript data models</li>
          <li>✓ Supabase/PostgreSQL schema</li>
          <li>✓ Stripe Checkout</li>
          <li>✓ Vercel-ready deployment</li>
        </ul>
      </div>
    </section>
  );
}
