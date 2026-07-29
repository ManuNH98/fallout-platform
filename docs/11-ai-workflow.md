# 11. AI workflow

## Goal

This repository is designed to be worked on with AI agents such as OpenCode.

The main risk is not that an AI fails to write code. The main risk is that an AI writes code that ignores the architecture.

To avoid this, keep documentation explicit and tasks small.

## Core rule

Never ask an AI agent to "build the app".

Ask for small, scoped, verifiable tasks.

## Good task format

Every AI task should include:

1. Goal
2. Relevant docs
3. Files/folders allowed to modify
4. Files/folders not allowed to modify
5. Expected result
6. Validation command
7. Constraints

## Example task

```md
Goal:
Create the Games module in the NestJS API.

Relevant docs:
- docs/05-api-conventions.md
- docs/04-database-model.md
- AGENTS.md

Allowed files:
- apps/api/src/modules/games/**
- apps/api/src/app.module.ts

Not allowed:
- apps/web/**
- packages/ui/**
- docs/**

Requirements:
- Create games.module.ts
- Create games.controller.ts
- Create games.service.ts
- Add DTOs for create/update/query
- Use REST routes
- Do not implement Prisma yet; use TODO comments where DB integration will go

Validation:
- pnpm check-types
- pnpm lint
```

## Use GPT-5.5 for

- architecture decisions
- database model design
- security review
- prompt/task design
- roadmap planning
- code review
- refactor strategy
- diagnosing complex errors

## Use cheaper models for

- small CRUD modules
- simple components
- forms
- tables
- DTOs
- tests
- documentation updates
- refactors with clear instructions

## Agent rules

Agents must:

- read `AGENTS.md`
- follow docs
- keep changes small
- avoid unrelated edits
- summarize changed files
- run or suggest validation commands
- ask for a new task if scope is unclear

Agents must not:

- change architecture silently
- add libraries without explaining why
- move files around unnecessarily
- duplicate shared types
- hardcode secrets
- put service role keys in frontend
- implement broad features in one pass

## Recommended workflow

1. Plan feature with GPT-5.5.
2. Write a precise task from `docs/13-task-template.md`.
3. Run task in OpenCode.
4. Review diff manually.
5. Run:
   ```bash
   pnpm lint
   pnpm check-types
   pnpm build
   ```
6. Fix errors with a small follow-up task.
7. Update docs if architecture changed.

## Commit style

Recommended commit messages:

```txt
feat(api): add games module skeleton
feat(web): add admin wiki list page
chore(docs): add architecture docs
fix(api): validate Supabase JWT audience
refactor(web): extract admin layout
```

## When an AI changes architecture

If an AI introduces a meaningful new pattern, require it to update the relevant docs in the same PR/commit.

Examples:

- new API response format
- new auth pattern
- new folder convention
- new package
- new database model
