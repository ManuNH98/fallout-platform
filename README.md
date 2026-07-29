# Fallout Platform

Plataforma web Spanish-first dedicada al universo Fallout.

El primer modulo principal es una wiki clasica, pero el producto esta disenado para crecer hacia guias, recomendaciones de mods, builds de Fallout 76, herramientas S.P.E.C.I.A.L., cuentas de usuario, favoritos, contenido guardado y administracion editorial.

## Arquitectura

```txt
Usuario
  -> Next.js web app
  -> NestJS REST API con Supabase access token
  -> Prisma
  -> Supabase PostgreSQL

Supabase tambien proporciona Auth y Storage.
```

Supabase se utiliza como infraestructura. NestJS sigue siendo el backend principal de negocio y autorizacion:

- Supabase Auth identifica al usuario y gestiona sesiones.
- Supabase PostgreSQL almacena los datos de la aplicacion.
- Supabase Storage almacena imagenes y archivos.
- NestJS valida tokens, aplica permisos y contiene las reglas de negocio.
- Next.js renderiza la web publica, las pantallas de autenticacion y el panel admin.

## Stack Tecnico

- Monorepo: pnpm workspaces + Turborepo
- Frontend: Next.js App Router + React + TypeScript
- Backend: NestJS + TypeScript
- API: REST first
- UI: TailwindCSS + shadcn/ui
- Formularios: react-hook-form + Zod
- Base de datos: PostgreSQL alojado en Supabase
- ORM: Prisma
- Auth: Supabase Auth
- Storage: Supabase Storage
- Testing inicial: type checks, linting y unit tests de logica de negocio

## Aplicaciones

### `apps/web`

Aplicacion Next.js responsable de:

- Web publica y SEO.
- Wiki, juegos, guias, mods y builds.
- Login, registro y gestion de sesion.
- Panel de administracion.
- Llamadas a la API NestJS.
- Interactividad cliente cuando sea necesaria.

No debe contener reglas complejas de negocio, escrituras directas a la base de datos para datos core ni decisiones finales de autorizacion.

### `apps/api`

Aplicacion NestJS responsable de:

- API REST y modulos por dominio.
- Validacion de entrada.
- Logica de negocio.
- Autorizacion y roles.
- Validacion de Supabase JWT.
- CRUD de wiki, juegos y categorias.
- Operaciones administrativas.
- Integracion con Prisma.
- Metadatos de media y futura logica de builds.

## Packages

### `packages/db`

Schema, migraciones y cliente Prisma compartido.

### `packages/types`

Contratos TypeScript estables compartidos entre frontend y backend. No debe contener logica de implementacion.

### `packages/validation`

Schemas Zod compartidos para evitar duplicar reglas entre formularios y API.

### `packages/ui`

Componentes UI de proyecto realmente reutilizables. Los primitives de shadcn/ui deben permanecer inicialmente en `apps/web`.

### `packages/eslint-config`

Configuracion ESLint compartida.

### `packages/typescript-config`

Configuracion TypeScript compartida.

## Reglas Del Proyecto

- Todo texto visible, rutas publicas, validaciones y seed content debe estar en espanol por defecto.
- Frontend y backend deben permanecer separados en `apps/web` y `apps/api`.
- El codigo compartido debe vivir en `packages/`.
- No deben duplicarse tipos ni schemas de validacion compartibles.
- Todo cambio de base de datos debe realizarse mediante Prisma.
- Las paginas publicas deben ser SEO-friendly.
- El panel admin y los endpoints protegidos deben validar permisos en NestJS.
- Supabase Auth identifica usuarios; NestJS autoriza acciones.
- Los controllers NestJS deben ser delgados y la logica debe residir en services.
- El contenido wiki debe ser original, estructurado y apoyado por fuentes cuando corresponda.
- Los cambios deben ser pequenos, acotados y verificables.

La fuente normativa completa es [`AGENTS.md`](./AGENTS.md).

## Estructura

```txt
apps/
  web/                    Next.js
  api/                    NestJS
packages/
  db/                     Prisma y acceso a datos
  types/                  tipos compartidos
  validation/             schemas compartidos
  ui/                     UI compartida cuando proceda
  eslint-config/          ESLint compartido
  typescript-config/      TypeScript compartido
docs/                     documentacion de producto y arquitectura
.ai/prompts/              prompts reutilizables
.ai/skills/               guias especializadas para agentes
```

## Estado Actual

El repositorio esta en **Phase 0: Repository foundation**.

Ya existen el monorepo, las dos aplicaciones, la documentacion y los packages previstos. La fase todavia no esta completa: `packages/db`, `packages/types` y `packages/validation` existen como directorios, pero aun no son workspace packages funcionales reconocidos por pnpm. Ademas, web y API intentan usar actualmente el puerto `3000`, por lo que `pnpm dev` no puede mantener ambas aplicaciones activas a la vez.

El estado y los criterios de cierre se mantienen en [`docs/12-roadmap.md`](./docs/12-roadmap.md).

## Desarrollo

Requisitos:

- Node.js 20 o superior
- pnpm 9

Instalar dependencias:

```bash
pnpm install
```

Ejecutar todas las aplicaciones:

```bash
pnpm dev
```

Ejecutar una aplicacion:

```bash
pnpm dev:web
pnpm dev:api
```

Validar el repositorio:

```bash
pnpm lint
pnpm check-types
pnpm build
```

## Documentacion

Antes de implementar o cambiar arquitectura, leer:

- [`AGENTS.md`](./AGENTS.md)
- [`docs/00-product-vision.md`](./docs/00-product-vision.md)
- [`docs/01-architecture.md`](./docs/01-architecture.md)
- [`docs/02-monorepo-structure.md`](./docs/02-monorepo-structure.md)
- [`docs/03-tech-stack.md`](./docs/03-tech-stack.md)
- [`docs/11-ai-workflow.md`](./docs/11-ai-workflow.md)

Los agentes deben consultar tambien `.ai/skills/` y usar el skill relevante para cada tarea. Las reglas del proyecto prevalecen sobre recomendaciones genericas que entren en conflicto con la arquitectura documentada.

## Principios De Contenido

La plataforma no pretende copiar otras wikis de Fallout. El contenido debe ser original, curado, estructurado, buscable, conectado mediante relaciones y respaldado por referencias cuando resulte util.
