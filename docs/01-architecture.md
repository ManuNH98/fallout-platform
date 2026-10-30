# 01. Architecture

## High-level architecture

```txt
User
  |
  v
Next.js web app
  |
  | REST API calls with Supabase access token
  v
NestJS API
  |
  | Prisma
  v
PostgreSQL (local en desarrollo; Supabase en produccion)

Supabase also provides:
- Auth
- Storage
```

## Main decision

Supabase is used as infrastructure.

NestJS remains the main business backend.

This means:

- Supabase Auth handles identity.
- PostgreSQL stores application data: native local server for development; Supabase hosting remains the production target.
- Supabase Storage stores images and files.
- NestJS validates tokens and applies business rules.
- Next.js renders the public site, auth pages and admin panel.

## Why not backend-only Supabase?

A Supabase-only backend would be fast for a small MVP, but this product is expected to grow into a platform with:

- complex Fallout 76 build rules
- admin workflows
- roles
- future moderation
- guides and mods modules
- integrations
- possible AI features
- public API-like endpoints

Keeping NestJS provides a clearer place for business logic.

## Responsibilities

### Next.js

Responsible for:

- Public pages
- SEO
- Page rendering
- Admin UI
- Auth screens
- Calling NestJS API
- Using shadcn/ui and TailwindCSS
- Client-side interactivity

Not responsible for:

- Complex business rules
- Database writes directly for core business data
- Authorization decisions beyond UI visibility

### NestJS

Responsible for:

- REST API
- Business logic
- Authorization
- Validation
- Admin operations
- Wiki CRUD
- Games/categories management
- Builds logic
- Media metadata
- User profile logic
- Integration with Prisma

### Supabase

Responsible for:

- PostgreSQL hosting
- Auth identity provider
- Storage for images/files
- Auth and Storage remain remote during local application development

### Prisma

Responsible for:

- Database schema
- Migrations
- Type-safe database client
- Database model documentation through schema

## Recommended request flow

### Public wiki page

```txt
User opens /wiki/facciones/hermandad-del-acero
  -> Next.js renders page
  -> Next.js fetches published page data
  -> API returns public page data
  -> Next.js renders SEO-friendly page
```

### Admin edit page

```txt
Admin opens /admin/wiki/edit/[id]
  -> Next.js checks Supabase session
  -> Next.js calls NestJS with access token
  -> NestJS validates token
  -> NestJS checks app role
  -> NestJS returns editable content
```

### Upload image

```txt
Admin uploads image
  -> frontend requests upload flow
  -> Supabase Storage stores file
  -> NestJS stores media metadata
```

## Entornos de desarrollo y produccion

Decision del 30 de octubre de 2026: PostgreSQL nativo en el Mac para desarrollo,
sin Docker ni Supabase local; Supabase Auth y Storage remotos. Supabase PostgreSQL
se conserva para produccion. L1 prepara PostgreSQL 17.11 local; la migracion L2 sigue pendiente.
La preparacion local, migraciones y validacion remota diferida se rigen por
[la decision de entorno local](19-local-development-database.md).

## Deployment target

Initial deployment idea:

```txt
Frontend: Vercel
API: Render, Railway or VPS
Database: Supabase PostgreSQL
Auth: Supabase Auth
Storage: Supabase Storage
```

## API style

Use REST first.

GraphQL is not part of the initial architecture.

## Monorepo approach

The project uses a monorepo because AI agents need full project context and because frontend, backend, shared types and database schema should evolve together.
