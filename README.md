# Fallout Platform

Spanish-first Fallout web platform.

This project starts as a classic wiki but is designed to evolve into a full Fallout platform with guides, mods, Fallout 76 builds, S.P.E.C.I.A.L. tools, user accounts, saved builds, favorites, and admin-managed content.

## Stack

- Monorepo: pnpm workspaces + Turborepo
- Frontend: Next.js + React + TypeScript
- Backend: NestJS + TypeScript
- UI: TailwindCSS + shadcn/ui
- Database: PostgreSQL on Supabase
- Auth: Supabase Auth
- Storage: Supabase Storage
- ORM: Prisma
- API: REST first

## Apps

```txt
apps/web    Next.js public website, auth pages and admin panel
apps/api    NestJS REST API
```

## Packages

```txt
packages/db                  Prisma schema and database client
packages/ui                  shared UI components when needed
packages/types               shared TypeScript types
packages/validation          shared validation schemas
packages/eslint-config       shared ESLint config
packages/typescript-config   shared TypeScript config
```

## Documentation

Read these files before making architectural changes:

```txt
AGENTS.md
docs/00-product-vision.md
docs/01-architecture.md
docs/11-ai-workflow.md
docs/12-roadmap.md
```

## Development

Install dependencies:

```bash
pnpm install
```

Run all apps:

```bash
pnpm dev
```

Run only frontend:

```bash
pnpm dev:web
```

Run only API:

```bash
pnpm dev:api
```

Type check:

```bash
pnpm check-types
```

Lint:

```bash
pnpm lint
```

Build:

```bash
pnpm build
```

## Product direction

The project is not intended to copy existing Fallout wikis. Content should be original, curated, sourced, and structured for search, SEO, relationships, guides, and future user features.
