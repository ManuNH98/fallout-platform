# 03. Tech stack

## Monorepo

- pnpm workspaces
- Turborepo

Reason:

- reliable monorepo tooling
- strong ecosystem compatibility
- works well with Next.js, NestJS and Prisma
- clear for AI agents

## Frontend

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui

Reason:

- SEO-friendly public pages
- good routing and layouts
- strong React ecosystem
- excellent fit for wiki-style content
- good Vercel deployment experience

## Backend

- NestJS
- TypeScript
- REST API first

Reason:

- modular architecture
- familiar mental model for developers coming from Spring Boot
- clear controllers/services/modules structure
- good for long-term business logic

## Database

- PostgreSQL
- Hosted on Supabase

Reason:

- strong relational model
- good JSON support
- future-friendly for search and advanced queries
- suitable for complex relationships

## ORM

- Prisma

Reason:

- database schema as code
- migrations
- generated TypeScript types
- good developer experience
- helpful for AI-generated code because models are explicit

## Auth

- Supabase Auth

Reason:

- fast initial setup
- handles identity, sessions and providers
- avoids building auth security from scratch at the beginning

Important rule:

Supabase Auth identifies the user. NestJS authorizes platform actions.

## Storage

- Supabase Storage

Used for:

- wiki images
- cover images
- guide images
- mod thumbnails
- build screenshots
- admin uploads

## UI

- TailwindCSS
- shadcn/ui
- lucide-react
- react-hook-form
- zod

Recommended future additions:

- TanStack Table for admin tables
- Sonner for toasts
- TipTap or MDX editor for rich editing
- Fuse.js or server-side search later

## API validation

Initial options:

- NestJS DTOs with class-validator
- shared Zod schemas in `packages/validation`

Preferred direction:

Use Zod for shared schemas where frontend and backend need the same rules.

## Testing

Initial priority:

- type checks
- linting
- API unit tests for business logic
- basic e2e tests later

## Deployment

Initial target:

```txt
web: Vercel
api: Render/Railway/VPS
db: Supabase
storage: Supabase
auth: Supabase
```
