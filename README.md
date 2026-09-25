# global-grid-admin

Admin panel for GlobaGRID, used by the staff who run the platform (`ADMIN` and `SUPER_ADMIN`
accounts). Vite 8 + React 19 + TanStack Router + Tailwind CSS 4 + shadcn/ui, against the same API
as the storefront (`global-grid-frontend`).

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in VITE_API_URL
pnpm dev                     # http://localhost:5173
```

Requires Node 24 (see `.nvmrc` — 24.21.0) and pnpm 12.

The dev server stays on port 5173 because that is the origin the API's CORS allows; if the port is
taken it stops instead of moving to another one.

## Scripts

| Command          | What it does                                                |
| ---------------- | ----------------------------------------------------------- |
| `pnpm dev`       | Dev server on `:5173`                                       |
| `pnpm build`     | Type-check, then a production build into `dist/`            |
| `pnpm preview`   | Serve the production build on `:5173`                       |
| `pnpm lint`      | ESLint (`lint:fix` to autofix)                              |
| `pnpm format`    | Prettier write (`format:check` in CI)                       |
| `pnpm typecheck` | `tsc -b`                                                    |
| `pnpm api:types` | Regenerate `src/lib/api/schema.d.ts` from the API's Swagger |

## Stack

| Concern        | Choice                                                             |
| -------------- | ------------------------------------------------------------------ |
| Build          | Vite 8, React Compiler on                                          |
| Routing        | TanStack Router, file-based (`src/routes`)                         |
| Server state   | TanStack Query 5                                                   |
| API client     | openapi-fetch + openapi-react-query, typed from the Swagger        |
| Client state   | Zustand 5 (the session only)                                       |
| Forms          | react-hook-form + Zod 4                                            |
| UI             | Tailwind CSS 4 + shadcn/ui (Radix, the storefront's preset `b2fA`) |
| Icons / toasts | lucide-react / sonner                                              |

TypeScript stays on 6.0: typescript-eslint and openapi-typescript do not support TypeScript 7 yet.

## Structure

```
src/
  routes/          # file-based routes; routeTree.gen.ts is generated from them
    __root.tsx     # toaster, devtools, 404
    login.tsx
    _app.tsx       # the sign-in guard and the sidebar layout for every page below
    _app/          # dashboard, categories, rfqs, …
  features/        # one folder per domain slice (auth, then categories, rfqs, …)
  components/
    ui/            # shadcn/ui primitives
    layout/        # sidebar, header, placeholder
  config/          # the sidebar's navigation
  hooks/
  lib/
    api/           # schema.d.ts (generated), client, pending endpoints, error reading
    env.ts         # zod-validated env vars
  stores/          # the session (Zustand)
```

## Talking to the API

- `src/lib/api/schema.d.ts` is generated — never edit it. Run `pnpm api:types` after a backend
  change and commit the result.
- Calls go through `$api` (TanStack Query hooks) or `fetchClient` in `@/lib/api/client`, by path:
  `$api.useQuery("get", "/api/rfqs", { params: { query: { status: "NEW" } } })`.
- `problemOf(error)` in `@/lib/api/problems` turns a failure into field errors and one message.
- `src/lib/api/pending.ts` types the endpoints the admin needs before the Swagger lists them.
  Delete an entry once it shows up in `schema.d.ts`.

## Signing in

The admin signs in through the same login as the storefront, `POST /api/auth/login`
(`{ email, password }` → the account, its `roles` and a JWT). That login takes every account, so
the panel keeps the session only when `roles` includes `ADMIN` or `SUPER_ADMIN`; a customer
(`USER`) is turned away on the sign-in page (`src/features/auth/admin-session.ts`).

The JWT is kept in localStorage, because the API returns it in the response body rather than as a
cookie. Every request carries it; a 401 ends the session, and so does the token's `exp`.

## Conventions

- Anything from the backend goes through TanStack Query — never into Zustand.
- Filters, search and pagination live in the URL, validated by the route's `validateSearch`.
- Env vars are read only through `@/lib/env`.
- A section that is not built yet stays in the menu, marked "Soon" (`src/config/navigation.ts`).

## Deploying

`pnpm build` writes a static site to `dist/`. Serve it with every path falling back to
`index.html`, and add the admin's origin to the API's CORS allowlist.
# admin-globGrid
