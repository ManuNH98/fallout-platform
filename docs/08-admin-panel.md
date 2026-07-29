# 08. Admin panel

## Purpose

The admin panel is used by the owner/admin to manage platform content.

Initially, only the project owner will edit content.

## Location

The admin panel lives inside the Next.js app.

Recommended route:

```txt
/apps/web/src/app/(admin)/admin
```

Do not create a separate `apps/admin` app initially.

## Why inside Next.js?

Benefits:

- less complexity
- same design system
- same auth flow
- easier routing
- easier deployment
- easier for AI agents to understand
- can be extracted later if needed

## Initial admin sections

```txt
/admin
/admin/wiki
/admin/wiki/nuevo
/admin/wiki/[id]/editar
/admin/juegos
/admin/categorias
/admin/media
/admin/usuarios
```

## Future sections

```txt
/admin/guias
/admin/mods
/admin/builds
/admin/fuentes
/admin/configuracion
```

## Admin layout

Recommended layout:

- sidebar navigation
- top bar
- user menu
- content area
- breadcrumbs
- responsive behavior

## Admin UI components

Recommended shadcn/ui components:

- Button
- Card
- Input
- Textarea
- Select
- Dialog
- Sheet
- DropdownMenu
- Table
- Badge
- Tabs
- Form
- Alert
- Skeleton

## Admin list pages

Each list page should include:

- title
- description
- create button
- filters
- search input
- table
- status badges
- actions menu
- empty state
- loading state
- error state

## Admin forms

Forms should use:

- react-hook-form
- zod
- shadcn form primitives

Common fields for content:

- title
- slug
- summary
- bodyMarkdown
- status
- type/category
- game relations
- cover image
- sources

## Editor

Initial body editor can be a Markdown textarea.

Do not overcomplicate early.

Future options:

- MDX editor
- TipTap
- custom Markdown editor
- live preview

## Publishing workflow

Initial statuses:

```txt
DRAFT
PUBLISHED
ARCHIVED
```

Rules:

- public pages only show PUBLISHED content
- admin can see all statuses
- published pages should have `publishedAt`

## Media workflow

Initial media flow:

- upload file to Supabase Storage
- store metadata in `MediaAsset`
- use media URL in content entities

## User management

Initial user management can be minimal:

- list users
- view profile
- change role

Only ADMIN should manage roles.
