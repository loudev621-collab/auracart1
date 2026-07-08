# AuraCart Complete Source Code

AuraCart is a teaching-focused full-stack e-commerce foundation project built with Next.js, TypeScript, Supabase/PostgreSQL, and Stripe Checkout.

## 1. Install

```bash
npm install
```

## 2. Configure environment variables

Copy `.env.example` into `.env.local`, then replace the placeholder values.

Required values:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 3. Create database

Open Supabase SQL Editor and run:

1. `database/schema.sql`
2. `database/policies.sql`
3. `database/seed.sql`

## 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## 5. Test checkout locally

Install and run Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## 6. Verify

```bash
npm run type-check
npm run build
```

## Main folders

```text
app/          Next.js pages, layouts, and API route handlers
components/   Reusable React components
lib/          Supabase, Stripe, and utility helpers
types/        TypeScript types
database/     SQL schema, seed data, and RLS policies
public/       Static assets
```

## Teaching note

This source package matches the documentation structure used in the AuraCart reference library. It is designed for students to inspect, rebuild, debug, and extend.
