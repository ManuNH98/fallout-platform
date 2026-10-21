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
- Tarjetas de articulos enlazadas desde home, listado y relacionados; enlaces de juegos a sus fichas y categorias al listado filtrado.
- Estado espanol de articulo no encontrado para slugs desconocidos.
- Listado `/juegos` con cuatro juegos mock, metadata, contador, breadcrumbs y estados de carga, vacio y error preparados.
- Lectura de juegos encapsulada en `apps/web/features/games/lib/content.ts`; coleccion completa separada de los destacados de la home.
- La opcion Juegos de la cabecera abre `/juegos` desde cualquier pagina publica.
- Cuatro detalles `/juegos/[slug]` con metadata, escenario, localizacion, ano de referencia y articulos wiki asociados.
- Tarjetas de juegos enlazadas desde home y listado; recorrido entre fichas wiki, fichas de juegos y wiki filtrada.
- Estado espanol de juego no encontrado; resumenes y textos de detalle separados en los mocks.

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

La integracion de **Phase 3: Mock content browsing** esta implementada y
validada tecnicamente, pendiente de revision final del propietario. La fase
permanece abierta y no se inicia Phase 4 automaticamente.

Entregado:

- Home conectada a los listados y seis categorias enlazadas a sus filtros.
- Listado wiki con busqueda y filtros por juego/categoria, y ocho detalles.
- Listado de juegos y cuatro fichas con articulos wiki asociados.
- Tarjetas, breadcrumbs y enlaces entre modulos; mensajes de no encontrado
  en espanol, incluido el 404 general.
- Correccion de contraste del boton principal y de los colores de enlaces,
  con margen de desplazamiento adaptado a la cabecera movil.
- Mocks y contratos separados de la presentacion, sin integrar API ni Supabase.

Validacion final: `pnpm --filter web lint`, `pnpm --filter web check-types`,
`pnpm --filter web build` y `git diff --check` correctos. Recorrido de 25 URLs
sobre el build de produccion sin enlaces internos rotos y metadata propia
para los doce detalles. Revision visual a 320/375/768/1265 px y comprobacion de
teclado, salto al contenido, envio del formulario, carga, vacios, error/reintento
y no encontrado. Los estados excepcionales se renderizan con sustituciones de
datos en memoria, sin modificar los mocks ni publicar modos de prueba.

Los slugs wiki/juegos desconocidos muestran `noindex` y mensajes propios, pero
las respuestas de streaming observadas usan HTTP 200; el 404 general devuelve
HTTP 404. El alcance, las comprobaciones y los limites estan en
`docs/16-phase-3-validation.md`.

Tras la revision final y el commit del propietario se puede cerrar Phase 3.
La siguiente fase del roadmap es la infraestructura real de Supabase, que
requiere planificacion expresa antes de activar recursos externos.

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
