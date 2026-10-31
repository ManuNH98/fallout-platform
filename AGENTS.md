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

Phases 0 to 5 are complete for their agreed development scope. Phase 3 was merged through PR #6 (4cf28bd), Phase 4 through PR #7 (b324cd5). The owner reviewed/pushed task 11 (b3aeb6d) and explicitly authorized Phase 5 closure on 31 October 2026. Closure is recorded in docs/20-phase-5-validation.md. The owner reports a GitHub PR for feature/Phase-5_auth_foundation; its merge into develop remains pending confirmation. Do not claim that it is already merged.

Current implementation order:

1. Public design and typed mocks (Phase 2, complete).
2. Mock wiki and games browsing (Phase 3, complete).
3. Supabase infrastructure verification (Phase 4, complete).
4. Authentication and application roles (Phase 5, closed by owner).
5. Core Prisma content models and REST API (Phase 6, next; not started or implicitly authorized).
6. Replace public mocks with API data (Phase 7).
7. Protected admin panel and content CRUD.

Use docs/12-roadmap.md for phase definitions, docs/18-phase-5-auth-foundation.md for Auth history and docs/20-phase-5-validation.md for the accepted evidence and its limits. Phase 6 requires its own scoped owner-authorized task; this closure does not authorize new models, CRUD, seeds, migrations or public design/data changes. Preserve Spanish public pages and typed mocks until their planned replacement.

Development follows docs/19-local-development-database.md: native PostgreSQL 17.11 on the Mac, dedicated SCRAM cluster at 127.0.0.1:55432/fallout_platform_dev owned by fallout_app; manual pnpm --filter @repo/db db:local:start|stop|status, no global service/autostart. L1/L2 are integrated in 514fdb6/ffee55a, and the approved UserProfile migration 20261030000000_add_user_profile is applied locally. Final Auth validation left two USER profiles and zero ADMIN. Test accounts/profiles do not move implicitly to production. Keep one Prisma schema/history and the local anon/authenticated SQL roles; RLS/client ACLs remain protected.

Supabase Auth/Storage remain remote; PostgreSQL production migration and validation are deferred, not complete. Remote TLS, migrations, RLS/ACL/Data API, HTTPS origins/redirects, SMTP/delivery and deployed integration require separate tasks before production. Local loopback alone uses sslmode=disable; preserve strict TLS remotely. WARP/hosts/keychain cleanup was not performed and must not happen automatically. No Docker, local Supabase, root .env, paid services or CI setup is authorized implicitly. Sensitive previous-env backups and cluster data stay ignored under packages/db/.local-postgres.

Auth uses PKCE with the default Supabase email template and a fixed local redirect; open confirmation in the signup browser/device before testing other auth flows that clear its verifier. Nest validates ES256/JWKS and owns application authorization. No permanent ADMIN exists or is authorized. New real users/emails, remote configuration, migrations or role promotion require specific authorization; never request passwords/tokens in chat or put personal identifiers in documentation. The owner enters credentials directly in the web.

Accepted evidence: real signup/confirmation, login/logout, explicit SDK renewal, two-session/profile isolation and authorized temporary ADMIN 403-to-200-to-403 restored to USER. Proxy automatic expiry renewal and some callback error cases are simulated, distinguished in docs/20. Checks passed: 63 web, 105 API unit and 32 API HTTP tests, web/API lint/types/build and HTTP/CORS smoke. The test-only localhost:3196 diagnostic is stopped and must never be deployed. A remains signed in normal Safari; B is signed out in private.

Execute one scoped task at a time. Validate affected workspaces, report changes/limits and provide an English commit title/body. The owner creates/pushes commits and authorizes subsequent work. Do not reopen Phase 5 or repeat its closure approval without new evidence that requires it.
