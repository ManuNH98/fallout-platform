# 13. AI task template

Use this template when asking OpenCode or another AI agent to implement a task.

## Template

```md
# Task: <short task name>

## Goal

Describe the exact outcome.

## Context

This project is a Spanish-first Fallout platform.
Follow the architecture in AGENTS.md.

## Relevant docs

- AGENTS.md
- docs/<specific-doc>.md

## Allowed files

- path/to/file/or/folder

## Do not modify

- path/to/file/or/folder

## Requirements

- Requirement 1
- Requirement 2
- Requirement 3

## Constraints

- Do not add new libraries unless necessary.
- Do not change architecture.
- Do not modify unrelated files.
- Keep user-facing text in Spanish.
- Use TypeScript.
- Follow existing patterns.

## Validation

Run or make sure these would pass:

```bash
pnpm lint
pnpm check-types
pnpm build
```

## Expected response

Summarize:

- files changed
- what was implemented
- any TODOs
- validation result
```

## Example 1: API module skeleton

```md
# Task: Create Games API module skeleton

## Goal

Create the initial Games module in the NestJS API.

## Context

The project is a Spanish-first Fallout platform. Games represent Fallout games and related media.

## Relevant docs

- AGENTS.md
- docs/05-api-conventions.md
- docs/04-database-model.md

## Allowed files

- apps/api/src/modules/games/**
- apps/api/src/app.module.ts

## Do not modify

- apps/web/**
- packages/ui/**
- docs/**

## Requirements

- Create games.module.ts
- Create games.controller.ts
- Create games.service.ts
- Add create/update/query DTO files
- Add routes:
  - GET /games
  - GET /games/:slug
  - POST /games
  - PATCH /games/:id
  - DELETE /games/:id
- Keep controllers thin
- Add TODO comments where Prisma integration will be added later

## Constraints

- Do not add new dependencies.
- Do not implement authentication in this task.
- Do not modify unrelated modules.

## Validation

Run:

```bash
pnpm check-types
pnpm lint
```
```

## Example 2: Admin page

```md
# Task: Create admin wiki list page

## Goal

Create the initial admin page for listing wiki pages.

## Relevant docs

- AGENTS.md
- docs/06-frontend-conventions.md
- docs/08-admin-panel.md

## Allowed files

- apps/web/src/app/(admin)/admin/wiki/**
- apps/web/src/features/wiki/**
- apps/web/src/components/admin/**

## Do not modify

- apps/api/**
- packages/db/**
- docs/**

## Requirements

- Create `/admin/wiki` page
- Use Spanish UI text
- Use shadcn/ui style patterns
- Include title, description, search input, create button and empty table state
- Do not connect to API yet
- Add TODO for API integration

## Validation

Run:

```bash
pnpm check-types
pnpm lint
```
```
