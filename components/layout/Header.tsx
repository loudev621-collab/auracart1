import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  let email: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  } catch {
    email = null;
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-brand-700">AuraCart</Link>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
          {email ? <span className="text-slate-500">{email}</span> : <Link href="/auth/login">Login</Link>}
        </div>
      </nav>
    </header>
  );
}
