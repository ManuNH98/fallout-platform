# 02. Monorepo structure

## Expected structure

```txt
fallout-platform/
  apps/
    web/
    api/

  packages/
    db/
    ui/
    types/
    validation/
    eslint-config/
    typescript-config/

  docs/
    00-product-vision.md
    01-architecture.md
    02-monorepo-structure.md
    03-tech-stack.md
    04-database-model.md
    05-api-conventions.md
    06-frontend-conventions.md
    07-auth-and-permissions.md
    08-admin-panel.md
    09-wiki-content-model.md
    10-builds-module.md
    11-ai-workflow.md
    12-roadmap.md
    13-task-template.md
    14-environment-and-supabase.md
    15-current-status.md

  AGENTS.md
  README.md
  package.json
  pnpm-workspace.yaml
  turbo.json
```

## apps/web

Next.js application.

Contains:

- public website
- wiki pages
- guide pages
- mods pages
- builds pages
- auth pages
- admin panel

Recommended structure:

```txt
apps/web/src/
  app/
    (public)/
    (auth)/
    (admin)/
  components/
  features/
  lib/
  styles/
```

## apps/api

NestJS application.

Contains:

- REST API
- auth guards
- business modules
- admin endpoints
- validation
- services

Recommended modules:

```txt
apps/api/src/
  modules/
    auth/
    users/
    wiki/
    games/
    categories/
    media/
    guides/
    mods/
    builds/
    admin/
    health/
  common/
    decorators/
    filters/
    guards/
    interceptors/
    pipes/
  config/
  main.ts
```

## packages/db

Shared database package.

Will contain:

```txt
packages/db/
  prisma/
    schema.prisma
  src/
    client.ts
    index.ts
  package.json
  tsconfig.json
```

Purpose:

- Prisma schema
- generated Prisma client
- database helpers
- shared database exports

## packages/types

Shared TypeScript types.

Use for stable contracts used by frontend and backend.

Examples:

```txt
packages/types/src/
  auth.ts
  wiki.ts
  games.ts
  users.ts
  builds.ts
  index.ts
```

Do not place implementation logic here.

## packages/validation

Shared validation schemas.

Recommended library: Zod.

Examples:

```txt
packages/validation/src/
  auth.schemas.ts
  wiki.schemas.ts
  game.schemas.ts
  build.schemas.ts
  index.ts
```

Purpose:

- avoid duplicated frontend/backend validation
- infer TypeScript types from schemas when useful
- make AI-generated forms and API DTOs more consistent

## packages/ui

Shared UI components.

Do not move all shadcn/ui components here immediately.

Initial recommendation:

- keep shadcn primitives in `apps/web`
- move only truly reusable project-level components to `packages/ui`

## packages/eslint-config

Shared ESLint configuration.

## packages/typescript-config

Shared TypeScript configuration.

## docs

Human and AI-readable documentation.

All architectural decisions should be reflected here.

AI agents must check documentation before implementing features.
