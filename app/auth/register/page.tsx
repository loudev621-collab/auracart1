"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    setMessage(error ? error.message : "Registration successful. Check your email if confirmation is enabled.");
  }

  return (
    <section className="container-page max-w-md">
      <Card>
        <h1 className="text-2xl font-bold">Create account</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          <Button className="w-full" disabled={loading}>{loading ? "Creating account..." : "Register"}</Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">Already have an account? <Link className="text-brand-700" href="/auth/login">Log in</Link></p>
      </Card>
    </section>
  );
}
