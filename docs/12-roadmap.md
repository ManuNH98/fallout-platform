# 12. Roadmap

## Phase 0: Repository foundation

Goal: create a stable monorepo foundation.

Tasks:

- Set up pnpm workspaces
- Set up Turborepo
- Keep `apps/web`
- Add `apps/api`
- Add packages:
  - `packages/db`
  - `packages/types`
  - `packages/validation`
  - `packages/ui`
- Add docs
- Add AGENTS.md
- Align scripts:
  - dev
  - build
  - lint
  - check-types
  - clean

Definition of done:

- `pnpm install` works
- `pnpm dev` starts apps
- `pnpm check-types` works or has known documented TODOs
- docs exist

## Phase 1: Infrastructure and configuration

Goal: connect the main stack.

Tasks:

- Create Supabase project
- Configure env files
- Configure Supabase Auth
- Configure Supabase Storage bucket
- Set up Prisma in `packages/db`
- Connect Prisma to Supabase PostgreSQL
- Create initial Prisma schema
- Add API config module
- Add health endpoint
- Add basic CORS configuration
- Add frontend env config

Definition of done:

- API can start
- web can start
- API health endpoint works
- Prisma can connect to database
- environment variables documented

## Phase 2: Auth foundation

Goal: allow users to log in and allow API to validate them.

Tasks:

- Add Supabase client to Next.js
- Create login page
- Create registration page
- Create logout action
- Create Supabase JWT validation in NestJS
- Create `UserProfile` model
- Auto-create profile on first authenticated API call or through explicit endpoint
- Add roles
- Add admin-only guard

Definition of done:

- user can log in
- frontend can call protected API endpoint
- API knows current user
- ADMIN can access protected admin endpoint

## Phase 3: Core content models

Goal: implement the first content backend.

Tasks:

- Add Prisma models:
  - Game
  - Category
  - WikiPage
  - WikiPageGame
  - WikiPageCategory
  - WikiRelation
  - Source
  - WikiPageSource
  - MediaAsset
- Run migrations
- Add seed script for initial games/categories
- Add API modules:
  - games
  - categories
  - wiki

Definition of done:

- database has games/categories
- API can list games
- API can list categories
- API can create/edit wiki pages as admin

## Phase 4: Public website foundation

Goal: build the public platform shell.

Tasks:

- Create public layout
- Create homepage
- Create navigation
- Create footer
- Create wiki list page
- Create wiki detail page
- Create games page
- Add basic SEO metadata
- Add basic empty states

Definition of done:

- public pages are accessible
- published wiki pages can be viewed
- unpublished pages are hidden from public routes

## Phase 5: Admin panel foundation

Goal: build the admin interface.

Tasks:

- Create admin layout
- Create admin dashboard
- Create admin navigation
- Create admin wiki list
- Create admin wiki create page
- Create admin wiki edit page
- Create games admin page
- Create categories admin page
- Add protected route behavior

Definition of done:

- admin can manage initial wiki content
- admin can publish/unpublish pages
- admin can assign games/categories to wiki pages

## Phase 6: Media

Goal: support images and file metadata.

Tasks:

- Create Supabase Storage bucket
- Add upload UI
- Add media API module
- Store media metadata in database
- Allow selecting cover image for wiki pages

Definition of done:

- admin can upload an image
- uploaded image can be used as wiki cover image

## Phase 7: Search and browsing

Goal: make the wiki usable.

Tasks:

- Add search field
- Add category filters
- Add game filters
- Add type filters
- Add pagination
- Improve internal linking

Definition of done:

- users can browse content by game/category/type
- search returns useful results

## Phase 8: Guides and mods

Goal: expand beyond wiki.

Tasks:

- Add Guide model
- Add Mod model
- Add API modules
- Add public pages
- Add admin pages

Definition of done:

- admin can publish guides
- admin can publish mod recommendations

## Phase 9: Builds foundation

Goal: start Fallout 76 build functionality.

Tasks:

- Add Build model
- Add basic authenticated build creation
- Add private builds
- Add S.P.E.C.I.A.L. JSON editor
- Add own-builds page

Definition of done:

- logged-in user can create and save a private build draft

## Phase 10: Full Fallout 76 planner

Goal: advanced build planner.

Tasks:

- Add perk cards
- Add mutations
- Add weapons/armor data
- Add validation rules
- Add public build pages
- Add sharing
- Add favorites

Definition of done:

- users can create, save, publish and browse Fallout 76 builds
