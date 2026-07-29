# 06. Frontend conventions

## Framework

Use Next.js App Router.

## Language

All user-facing text should be Spanish by default.

## Route groups

Recommended structure:

```txt
apps/web/src/app/
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
      page.tsx
      wiki/
      juegos/
      categorias/
      guias/
      mods/
      builds/
      media/
      usuarios/
```

## Public routes

Recommended public routes:

```txt
/
 /wiki
 /wiki/[slug]
 /juegos
 /juegos/[slug]
 /guias
 /guias/[slug]
 /mods
 /mods/[slug]
 /builds
 /builds/[slug]
```

Spanish route names are preferred for public sections.

## Admin routes

Recommended admin routes:

```txt
/admin
/admin/wiki
/admin/wiki/nuevo
/admin/wiki/[id]/editar
/admin/juegos
/admin/categorias
/admin/media
/admin/usuarios
/admin/builds
```

## UI stack

Use:

- TailwindCSS
- shadcn/ui
- lucide-react
- react-hook-form
- zod
- sonner
- TanStack Table for admin tables later

## Component organization

Recommended structure:

```txt
apps/web/src/
  components/
    layout/
    navigation/
    ui/
  features/
    wiki/
      components/
      hooks/
      lib/
    games/
    auth/
    admin/
    builds/
  lib/
    api/
    supabase/
    utils.ts
```

## shadcn/ui convention

Initially, keep shadcn/ui primitives in `apps/web`.

Do not prematurely move all shadcn components to `packages/ui`.

Use `packages/ui` only for project-level reusable components once needed.

## Data fetching

Public pages:

- prefer server components when possible
- fetch published content
- include metadata for SEO

Interactive pages:

- use client components where needed
- use forms and client state only for actual interactivity

Admin pages:

- protected
- call NestJS API
- handle loading/error states clearly

## API client

Create a small API client under:

```txt
apps/web/src/lib/api/
```

It should handle:

- base API URL
- Authorization header with Supabase access token
- JSON parsing
- basic error handling

## Supabase client

Use separate clients for browser/server if needed:

```txt
apps/web/src/lib/supabase/
  client.ts
  server.ts
```

## SEO

Public wiki pages should include:

- title
- description
- canonical URL later
- open graph metadata later
- clean slugs
- internal links

## Styling principles

Visual direction:

- clean
- dark-friendly
- readable
- inspired by terminal/Pip-Boy/wasteland aesthetics without harming usability
- avoid visual clutter
- prioritize content readability

## Forms

Use:

- react-hook-form
- zod
- shadcn form components

## Error/loading states

Every admin page that fetches data should include:

- loading state
- empty state
- error state
