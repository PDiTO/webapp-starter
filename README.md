This is a full-stack web app starter template with native Convex Auth and a live task list built on Convex queries and mutations.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - UI components
- **Lucide Icons** - Icon library
- **Convex** - Database, backend functions, live queries, and native auth

## Features

- Email/password auth with native Convex Auth
- Create, complete, and delete tasks
- Live task updates with Convex `useQuery`
- User-scoped task data enforced in Convex queries and mutations
- Responsive UI built with Shadcn and Tailwind

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Link the repo to your existing Convex cloud dev deployment:

```bash
pnpm convex:dev --configure existing
```

3. Configure native Convex Auth for your local web URL:

```bash
npx @convex-dev/auth --web-server-url http://localhost:3000
```

The URL must match the exact origin used by `pnpm dev`. If you run Next.js on a different port, use that URL instead. For example: `http://localhost:3002`.

4. Start Convex against the cloud dev deployment:

```bash
pnpm convex:dev
```

5. In another terminal, start Next.js:

```bash
pnpm dev
```

## Environment Variables

You do not need to create `.env` or `.env.local` by hand for local development.

`pnpm convex:dev --configure existing` writes these local values into `.env.local`:

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`

`npx @convex-dev/auth --web-server-url ...` sets the required auth env vars on your linked Convex deployment:

- `SITE_URL`
- `JWT_PRIVATE_KEY`
- `JWKS`

If you delete `.env.local`, rerun:

```bash
pnpm convex:dev --configure existing
```

## Deploying

### Dev

Push schema and function changes to the linked Convex cloud dev deployment:

```bash
pnpm convex:dev --once
```

If you need to relink the repo:

```bash
pnpm convex:dev --configure existing
```

### Prod

1. Configure native Convex Auth on the production deployment:

```bash
npx @convex-dev/auth --prod --web-server-url https://your-app.example.com
```

This sets the production Convex auth env vars on the deployment:

- `SITE_URL`
- `JWT_PRIVATE_KEY`
- `JWKS`

2. Deploy the Convex backend:

```bash
pnpm convex:deploy
```

3. In your frontend host, set `NEXT_PUBLIC_CONVEX_URL` to the production Convex URL from the Convex dashboard.
4. Deploy the Next.js app.

If your frontend host needs explicit env vars, set:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

## Notes

- Native Convex Auth is configured in `convex/auth.ts`, `convex/auth.config.ts`, and `convex/http.ts`.
- Next.js server auth integration lives in `proxy.ts` and `app/layout.tsx`.
- The task list reads data with `useQuery`, so updates stay live without manual refetching.
- `@auth/core` is a required package for native Convex Auth.
