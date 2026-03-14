# Stealth Order Hub

Standalone full-stack order workspace for Stealth kayak factory orders. The app is built with Next.js, TypeScript, Prisma, PostgreSQL, Tailwind, and shadcn/ui.

## Included

- Multi-dealer-aware schema and query scoping
- Internal roles: `ADMIN`, `DEALER_ADMIN`, `FACTORY_USER`
- Auth.js credentials scaffolding with server-side route protection
- Order list/detail pages
- Kayak build create/edit flow with Stealth-specific fields
- Build-level dealer/factory comment threads
- Tokenized customer portal at `/portal/[token]`
- Receiving session workflow with discrepancy logging
- Customer status email trigger persisted to notification events

## Explicitly deferred for the POC

- Catalogue management UI
- In-app notifications UI
- Deposit / balance placeholders in the customer portal
- Stronger admin auth such as 2FA or magic link
- Shipment / ETA workflow

## Local setup

1. Copy `.env.example` to `.env`.
2. Point `DATABASE_URL` at a Postgres database.
3. Generate the Prisma client:

```bash
npm run db:generate
```

4. Apply the schema to your database. For a quick local setup, `prisma db push` is sufficient:

```bash
npx prisma db push
```

5. Seed demo data:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

## Demo credentials

- Admin: `admin@stealthorderhub.local`
- Dealer admin: `dealer@stealthorderhub.local`
- Factory user: `factory@stealthorderhub.local`
- Password: `stealth-demo`

Demo customer portal token after seeding:

- `demo-portal-token-jules-2026-long-secret`

Open it locally at:

- `http://localhost:3000/portal/demo-portal-token-jules-2026-long-secret`

## Verification

The current codebase passes:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
