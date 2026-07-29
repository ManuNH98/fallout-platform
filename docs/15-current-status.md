# 15. Current project status

## Objetivo

Proporcionar un punto de entrada breve para retomar el desarrollo sin depender del historial de una conversacion o de una herramienta concreta.

Este documento resume el estado operativo. Las decisiones normativas siguen perteneciendo a `AGENTS.md` y a los documentos especificos de `docs/`.

## Estado actual

Actualizado el 29 de julio de 2026.

- **Phase 0: Repository foundation** esta completada.
- La parte local de **Phase 1: Infrastructure and configuration** esta preparada.
- La integracion externa con Supabase esta aplazada de forma intencionada.
- La fase activa es **Phase 2: Public design with mocks**.

## Base completada

- Monorepo con pnpm workspaces y Turborepo.
- Frontend Next.js en `apps/web`, con puerto local `3000`.
- API NestJS en `apps/api`, con puerto local `3001`.
- Packages compartidos para base de datos, UI, tipos, validacion, ESLint y TypeScript.
- Prisma 7 preparado en `packages/db`, con schema inicial, cliente y scripts de trabajo.
- Ejemplos de variables de entorno separados por aplicacion y package.
- Validacion de entorno, CORS y endpoint `GET /health` en la API.
- Configuracion del frontend para consumir la API local.
- Roadmap reordenado para desarrollar primero la experiencia publica con mocks.

## Decisiones vigentes

- El producto es Spanish-first.
- La primera experiencia publica utilizara datos mock tipados.
- Los mocks deben quedar aislados para poder sustituirlos por la API sin redisenar las pantallas.
- Las paginas publicas deben ser responsive, accesibles y SEO-friendly.
- No se implementaran todavia Supabase Auth, persistencia real ni migraciones de contenido.
- No se utilizara Supabase local ni Docker salvo que se planifique expresamente.
- Next.js, NestJS, Prisma y Supabase mantienen las responsabilidades descritas en `docs/01-architecture.md`.

## Trabajo aplazado

Antes de implementar autenticacion o persistencia real se debe:

- Crear el proyecto remoto de Supabase.
- Configurar Supabase Auth y el bucket `media` de Storage.
- Crear los archivos `.env` locales a partir de los ejemplos, sin commitear secretos.
- Verificar la conexion PostgreSQL con `pnpm --filter @repo/db db:check`.
- Completar las tareas externas de Phase 4 y continuar con Auth en Phase 5.

La guia detallada se mantiene en `docs/14-environment-and-supabase.md`.

## Siguiente tarea

Implementar una tarea pequena y acotada de **Phase 2: Public design with mocks**. Antes de modificar codigo frontend se deben leer:

- `AGENTS.md`
- `docs/06-frontend-conventions.md`
- `docs/09-wiki-content-model.md`
- `docs/12-roadmap.md`
- Este documento

La tarea debe concretar las rutas o componentes permitidos, usar copy visible en espanol y exigir al menos lint, type checks y build del frontend.

## Validacion conocida

Al cerrar la preparacion local se validaron correctamente:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm check-types
pnpm build
pnpm test
pnpm --filter api test:e2e
pnpm --filter @repo/db prisma:validate
pnpm --filter @repo/db prisma:generate
```

La comprobacion `pnpm --filter @repo/db db:check` sigue pendiente porque requiere credenciales de un proyecto Supabase real.

## Inicio recomendado para un chat nuevo

```md
Read AGENTS.md, docs/15-current-status.md, docs/12-roadmap.md, and the documents relevant to the task before making changes.

Phase 0 is complete and the local part of Phase 1 is prepared. Real Supabase integration is intentionally deferred. The active phase is Phase 2: Public design with mocks. Use Spanish-first UI copy and typed mock data. Do not implement Supabase/Auth or real persistence yet.
```
