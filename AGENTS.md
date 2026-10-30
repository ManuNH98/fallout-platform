# AGENTS.md

## Project identity

This repository is `fallout-platform`, a Spanish-first web platform focused on the Fallout universe.

It is not only a wiki. The wiki is the first major module, but the long-term product will include guides, mods, Fallout 76 builds, S.P.E.C.I.A.L. tools, user accounts, saved builds, favorites, media, and other Fallout-related utilities.

## Product language

The product is initially Spanish-first.

All user-facing copy, routes, labels, validation messages, admin labels, and seed content should be written in Spanish unless a task explicitly says otherwise.

## Current stack

- Monorepo: pnpm workspaces + Turborepo
- Frontend app: `apps/web`
- Backend API: `apps/api`
- Frontend framework: Next.js App Router
- Backend framework: NestJS
- Language: TypeScript
- UI: TailwindCSS + shadcn/ui
- Database: native local PostgreSQL 17.11 for development (L1/L2 ready; UserProfile migrated locally); Supabase PostgreSQL for production
- Auth: Supabase Auth
- Storage: Supabase Storage
- ORM: Prisma
- API style: REST first
- Package manager: pnpm

## Repository structure

Expected structure:

```txt
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
```

## Architectural rules

1. Do not invent a new architecture without updating the relevant documentation.
2. Keep frontend and backend separated by app:
   - `apps/web` is the Next.js app.
   - `apps/api` is the NestJS API.
3. Shared code must live in packages:
   - database client and Prisma schema in `packages/db`
   - shared TypeScript types in `packages/types`
   - shared validation schemas in `packages/validation`
   - shared UI only when it is truly reusable in `packages/ui`
4. Do not duplicate types across frontend and backend if they belong in `packages/types`.
5. Do not duplicate validation logic if it belongs in `packages/validation`.
6. Database schema changes must go through Prisma.
7. Public pages must be SEO-friendly.
8. Admin pages must be protected.
9. Supabase Auth identifies users, but NestJS owns business authorization.
10. Avoid placing business logic only in the frontend.
11. Avoid placing complex business logic in Supabase policies, SQL functions, or Edge Functions unless explicitly planned.
12. The API should expose clear REST endpoints and be documented through Swagger/OpenAPI later.
13. The wiki content must support references/sources and should avoid copied text from external wikis.
14. Keep tasks small and scoped when working with AI agents.

## Frontend rules

- Use Next.js App Router.
- Use route groups for public, auth, and admin sections.
- Use TailwindCSS for styling.
- Prefer shadcn/ui components for UI primitives.
- Keep public pages optimized for SEO.
- Use Spanish route names where it makes sense for public pages.
- Avoid large client components unless interaction requires it.
- Prefer server components for static/public content.
- Use client components for forms, modals, interactive filters, builders, and dashboards.

Recommended route groups:

```txt
apps/web/app/
  (public)/
    page.tsx
    wiki/
    juegos/
    guias/
    mods/
    builds/
  (auth)/
    login/
    registro/
  (admin)/
    admin/
```

## Backend rules

- Use NestJS modules, controllers, services, DTOs, guards, and providers.
- Use REST first.
- Keep modules domain-oriented.
- Validate incoming data.
- Keep business logic inside services.
- Controllers should be thin.
- Avoid direct database calls from controllers.
- Use Prisma through a database service/package.
- Validate Supabase Auth JWTs before allowing protected operations.
- Authorization decisions should happen in the API, not only in the frontend.

Recommended API modules:

```txt
auth
users
wiki
games
categories
media
guides
mods
builds
admin
health
```

## Database rules

- Use PostgreSQL.
- Use Prisma for schema and migrations.
- Keep slugs unique where needed.
- Track `createdAt` and `updatedAt` on persistent models.
- Track author/owner where relevant.
- Use enums for stable statuses and types.
- Do not over-normalize too early, but keep important domain relations explicit.

## Auth rules

- Supabase Auth is the identity provider.
- Frontend obtains Supabase session.
- Frontend calls NestJS using the Supabase access token.
- NestJS validates the Supabase JWT.
- Application roles are stored in the application database.
- Initial roles:
  - `USER`
  - `ADMIN`
  - `EDITOR`
  - `MODERATOR`

## AI workflow rules

When using AI agents such as OpenCode:

1. Give the agent one small task at a time.
2. Reference the relevant docs file.
3. Tell the agent which files it may modify.
4. Tell the agent which files it must not modify.
5. Require type checks and linting after changes.
6. Ask for a summary of changed files.
7. Do not allow broad instructions like "build the backend" or "finish the app".
8. Prefer tasks like:
   - "Create the Games module in NestJS following docs/05-api-conventions.md."
   - "Create the admin wiki list page following docs/06-frontend-conventions.md and docs/08-admin-panel.md."
   - "Add Prisma models from docs/04-database-model.md without modifying frontend files."

## Skills and prompts

This repository may include AI-oriented instructions under:

```txt
.ai/
  skills/
  prompts/
```

### Skills

Skills are task-specific execution guides for AI agents.

Before implementing a task, agents must check `.ai/skills/` and use the most relevant skill.

If a task matches an existing skill, follow that skill step by step.

If no skill matches, follow:

1. `AGENTS.md`
2. relevant `docs/`
3. existing project patterns

Agents must not ignore project documentation in favor of generic framework advice.

### Prompts

Prompts in `.ai/prompts/` are reusable instructions for common AI workflows.

Use them for:

- reading project context
- planning a feature
- implementing a scoped task
- reviewing changes
- fixing errors
- creating API modules
- creating Prisma changes
- creating admin pages
- implementing Supabase auth flows
- updating documentation
- reviewing before commit

### Priority order

When instructions conflict, follow this order:

1. Explicit user request in the current task
2. `AGENTS.md`
3. Specific docs file related to the task
4. Relevant `.ai/skills/` file
5. Existing code patterns
6. Generic external best practices

If a generic skill conflicts with this project's architecture, the project architecture wins.

### Scope discipline

Agents must keep tasks small and scoped.

Agents must not:

- implement broad features in one pass
- change architecture silently
- add libraries casually
- move files without need
- duplicate shared types
- duplicate shared validation schemas
- put secrets in code
- expose Supabase service role keys to the frontend

### Required agent output

After every implementation task, agents must summarize:

1. Files changed
2. What was implemented
3. Decisions made
4. TODOs or limitations
5. Validation result
6. Any documentation that should be updated

### Validation preference

Prefer validating with:

```bash
pnpm lint
pnpm check-types
pnpm build
```

For package-specific tasks, use filters when useful:

```bash
pnpm --filter web check-types
pnpm --filter api check-types
pnpm --filter @repo/ui check-types
```

## Current priority

Phase 0 and the local part of Phase 1 are complete; the external infrastructure deferred from Phase 1 was verified in Phase 4. Phases 2 and 3 are complete; Phase 3 was integrated through PR #6 (merge commit `4cf28bd`). Phase 4 is complete and integrated into develop through PR #7 (merge commit `b324cd5`). The owner confirmed the merge and authorized progression to Phase 5 on 23 October 2026. Phase 5: Auth foundation is active on `feature/Phase-5_auth_foundation`; tasks 2 to 6 are implemented and local PostgreSQL L1/L2 are prepared; the UserProfile migration is applied locally. Phase 5 task 8 (profile synchronization and roles) is committed in 9a2c3ef. Task 9 login/logout is implemented, pending review; task 10 registration/email confirmation is next after authorization. Public pages must retain typed mock data and the existing design throughout Phase 5.

Current implementation order:

1. Public design and shell with typed mock data (Phase 2, completed).
2. Mock wiki and games browsing routes (Phase 3, completed).
3. Real Supabase infrastructure and connection verification (Phase 4, completed).
4. Authentication flow and application roles (Phase 5, active; implementation requires a scoped owner-authorized task).
5. Core Prisma content models and REST API.
6. Replace public mocks with API data.
7. Protected admin panel and content CRUD.

The complete phase definitions are maintained in `docs/12-roadmap.md`.

On 30 October 2026 the owner approved documenting a move to native local PostgreSQL for development at zero additional service cost. Follow docs/19-local-development-database.md: documentation was committed in 326ee0e; L1 has now installed PostgreSQL 17.11, created a dedicated SCRAM/loopback cluster on 127.0.0.1:55432 and switched API/DB ignored .env files to fallout_platform_dev as fallout_app. L1 was committed in 514fdb6; L2 has now applied and verified the approved migration locally. UserProfile has zero rows, RLS is enabled without client policies and effective anon/authenticated privileges are denied. L2 was committed in ffee55a; task 8 has implemented profile synchronization, per-request profile loading and explicit role guards, with shared JSON types and simulated tests. Task 8 was committed in 9a2c3ef. Task 9 adds server-side web login, profile synchronization/retry and local logout, with 47 simulated web tests; real Auth integration remains pending. Next is separately authorized Phase 5 task 10 registration/email confirmation after review. Do not create real users/emails or promote ADMIN implicitly. No remote migrations have been applied. Use pnpm --filter @repo/db db:local:start|stop|status; no global service/autostart. Private prior-env backups and cluster data are ignored in packages/db/.local-postgres; never publish them or restore remote connections implicitly. Supabase Auth and Storage stay remote. Keep one Prisma schema/migration history; account for SQL roles anon/authenticated locally without installing Supabase or editing the approved migration. Remote task 7 is deferred, not completed; remote deployment checks are required before production. Do not resume remote deploy or create CI as an implicit next step. GitHub Actions and local Supabase/Docker are not authorized by this decision.

For Phase 5, follow `docs/07-auth-and-permissions.md`, `docs/12-roadmap.md` and the environment requirements in `docs/14-environment-and-supabase.md`. Auth flows, sessions, JWT validation, UserProfile and application roles belong to Phase 5; implement them only in separately authorized scoped tasks. Do not introduce content models, CRUD, seeds, replace public mocks or change the public design. Do not introduce Docker, local Supabase, or a root `.env` file. Never request secrets in chat or use migrations or `db:push` as connectivity checks. Applying migrations, creating users, sending test emails or changing remote configuration requires an expressly authorized task.

Phase 4 evidence remains in `docs/17-phase-4-validation.md`; this documentation update is not a new infrastructure verification. Direct previously worked on this Mac with WARP and a temporary hosts entry; Phase 5 attempts now time out, and native Prisma rejects session-pooler TLS while Node runtime validates it. The target local development environment does not require WARP; do not remove WARP or hosts automatically. Any cleanup is a separate owner-reviewed task after local validation. Preserve strict TLS for remote connections. Do not change networking or keychain settings automatically. Current ECC P-256 is owner-confirmed and public ES256 JWKS was inspected; real Auth flows, sessions and email delivery remain unverified. `/health` reports API availability, not PostgreSQL connectivity.

Execute one scoped task at a time. After each implementation, validate affected workspaces, report changes and limitations, and provide an English commit title and description. Stop for owner review; the owner creates and pushes commits and authorizes the next task. Phase 5 stays open until all its acceptance criteria have been verified and the owner authorizes its closure.
