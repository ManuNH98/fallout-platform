# 15. Current project status

## Objetivo

Proporcionar un punto de entrada breve para retomar el desarrollo sin depender del historial de una conversacion o de una herramienta concreta.

Este documento resume el estado operativo. Las decisiones normativas siguen perteneciendo a `AGENTS.md` y a los documentos especificos de `docs/`.

## Estado actual

Actualizado el 21 de octubre de 2026.

- **Phase 0: Repository foundation** esta completada.
- La parte local de **Phase 1: Infrastructure and configuration** esta preparada.
- La integracion externa con Supabase esta aplazada de forma intencionada.
- **Phase 2: Public design with mocks** esta completada.
- La fase activa es **Phase 3: Mock content browsing**.

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
- Shell publico responsive y home inicial en espanol, con mocks tipados de juegos, categorias y articulos destacados.
- Tailwind CSS v4, tokens de tema, configuracion inicial de shadcn/ui y metadata SEO base.
- Listado `/wiki` con ocho articulos de muestra, metadata propia, contador y breadcrumbs; la home conserva los tres destacados iniciales.
- Busqueda en titulo y resumen y filtros combinables por juego y categoria mediante formulario GET y parametros URL.
- Relaciones mock de varios juegos y categorias por articulo mediante slugs y tipos compartidos.
- Lectura de mocks wiki encapsulada en `apps/web/features/wiki/lib/content.ts`, con coleccion independiente de los destacados de la home.
- Estados de carga, vacio y error preparados para `/wiki`; cabecera adaptada a la navegacion desde paginas interiores.
- Ocho detalles `/wiki/[slug]` con cuerpos Markdown originales, fuentes dentro de los juegos, articulos relacionados y metadata individual.
- Tarjetas de articulos enlazadas desde home, listado y relacionados; enlaces por juego y categoria al listado filtrado.
- Estado espanol de articulo no encontrado para slugs desconocidos.

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

Implementar una tarea pequena y acotada de **Phase 3: Mock content browsing**. Antes de modificar codigo frontend se deben leer:

- `AGENTS.md`
- `docs/06-frontend-conventions.md`
- `docs/09-wiki-content-model.md`
- `docs/12-roadmap.md`
- Este documento

El listado `/wiki`, su busqueda y filtros, y los ocho detalles por slug estan implementados. La tarea de detalles esta pendiente de revision del propietario antes de continuar. Las tarjetas reutilizadas enlazan a los detalles; el contenido sigue identificado como muestra.

La siguiente tarea propuesta es implementar el listado `/juegos`, reutilizando las tarjetas, breadcrumbs y estados existentes. Despues se implementaran los detalles de juegos y la revision de integracion. Phase 3 sigue abierta; no hay rutas de juegos implementadas.

Validacion del listado con filtros: `pnpm --filter web lint`, `pnpm --filter web check-types`, `pnpm --filter web build`, `pnpm --filter @repo/types lint` y `pnpm --filter @repo/types check-types` completados correctamente. Comprobados busqueda normalizada, filtros combinados, relaciones multiples, resultados vacios, parametros desconocidos/repetidos y coherencia de slugs en los mocks. Al leer `searchParams`, `/wiki` se renderiza en servidor por peticion; la home sigue estatica. La carga y el error no se fuerzan en la experiencia publica; su comprobacion controlada queda para la revision de estados.

Los detalles incorporan `react-markdown` como dependencia de web para renderizar
Markdown en servidor sin HTML embebido ni parser propio. Se han comprobado
los ocho cuerpos, referencias y enlaces, la separacion entre resumen y detalle,
el renderizado sin scripts/URLs ejecutables y el estado espanol de no encontrado.

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

Phase 0 is complete, local Phase 1 is prepared, and Phase 2 public design with typed mocks is complete. Real Supabase integration is intentionally deferred. The active phase is Phase 3: Mock content browsing. Use Spanish-first UI copy and keep mocks isolated from presentation. Do not implement Supabase/Auth or real persistence yet.
```
