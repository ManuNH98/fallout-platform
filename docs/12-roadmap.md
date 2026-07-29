# 12. Roadmap

## Objetivo

Construir la plataforma de forma incremental, manteniendo tareas pequenas, verificables y alineadas con `AGENTS.md` y el resto de la documentacion.

Cada fase debe cerrarse antes de depender de ella desde la siguiente. Una fase se considera terminada solo cuando cumple su definicion de completado y las validaciones indicadas.

## Estado actual

La fase activa es **Phase 0: Repository foundation**.

La base del monorepo ya incluye pnpm workspaces, Turborepo, `apps/web`, `apps/api`, documentacion, configuraciones compartidas y `packages/ui`. Sin embargo, Phase 0 todavia no esta completa porque:

- `packages/db` no es aun un workspace package funcional.
- `packages/types` no es aun un workspace package funcional.
- `packages/validation` no es aun un workspace package funcional.
- Los scripts y versiones de tooling necesitan una ultima alineacion.
- Web y API intentan escuchar actualmente en el puerto `3000`, por lo que `pnpm dev` no puede mantener ambas aplicaciones activas a la vez.
- `pnpm lint` termina, pero actualmente informa una advertencia en `apps/api/src/main.ts`.
- Falta verificar de nuevo `pnpm install`, `pnpm dev`, `pnpm check-types`, `pnpm lint` y `pnpm build` despues de cerrar la configuracion.

## Phase 0: Repository foundation

**Objetivo:** crear una base de monorepo estable y reproducible.

**Tareas:**

- Mantener `apps/web` como aplicacion Next.js.
- Mantener `apps/api` como aplicacion NestJS.
- Configurar pnpm workspaces y Turborepo.
- Completar `packages/db` como workspace package.
- Completar `packages/types` como workspace package.
- Completar `packages/validation` como workspace package.
- Mantener `packages/ui`, `packages/eslint-config` y `packages/typescript-config` como packages compartidos.
- Alinear los scripts `dev`, `build`, `lint`, `check-types`, `test` y `clean` donde corresponda.
- Asignar puertos de desarrollo distintos y documentados para web y API.
- Declarar las dependencias entre workspaces mediante `workspace:*`.
- Alinear las versiones principales de TypeScript y tooling cuando sea necesario.
- Mantener `AGENTS.md`, `docs/`, `.ai/prompts/` y `.ai/skills/` como contexto de trabajo.

**Definicion de completado:**

- Los seis directorios de `packages/` son workspaces reconocidos por pnpm.
- `pnpm install --frozen-lockfile` funciona.
- `pnpm dev` inicia web y API sin errores de configuracion.
- `pnpm lint` termina sin errores ni advertencias conocidas.
- `pnpm check-types` funciona en todos los workspaces aplicables.
- `pnpm build` funciona en las aplicaciones y packages aplicables.
- La estructura real del repositorio coincide con la documentacion.

## Phase 1: Infrastructure and configuration

**Objetivo:** conectar la infraestructura principal.

**Tareas:**

- Crear y configurar el proyecto de Supabase.
- Documentar variables de entorno por aplicacion o package.
- Configurar Supabase Auth.
- Crear el bucket inicial de Supabase Storage.
- Configurar Prisma en `packages/db`.
- Conectar Prisma con Supabase PostgreSQL.
- Crear el schema Prisma inicial.
- Crear el modulo de configuracion de la API.
- Crear `GET /health`.
- Configurar CORS de forma basica.
- Configurar las variables de entorno del frontend.

**Definicion de completado:**

- Web y API arrancan con configuracion validada.
- `GET /health` responde con estado correcto.
- Prisma conecta con PostgreSQL.
- Las variables necesarias estan documentadas sin incluir secretos.

## Phase 2: Auth foundation

**Objetivo:** autenticar usuarios y autorizar acciones desde la API.

**Tareas:**

- Crear los clientes de Supabase para Next.js.
- Crear login, registro y logout.
- Validar Supabase JWT en NestJS.
- Crear el modelo `UserProfile`.
- Crear o sincronizar el perfil local en el primer flujo autenticado.
- Implementar los roles `USER`, `ADMIN`, `EDITOR` y `MODERATOR`.
- Implementar `SupabaseAuthGuard`, `RolesGuard`, `@CurrentUser()` y `@Roles()`.
- Proteger un endpoint inicial para ADMIN.

**Definicion de completado:**

- Un usuario puede registrarse, iniciar y cerrar sesion.
- Next.js puede llamar a NestJS con el access token.
- NestJS identifica al usuario y carga su perfil local.
- Solo ADMIN puede acceder al endpoint administrativo de prueba.

## Phase 3: Core content models

**Objetivo:** implementar el backend inicial de contenido.

**Tareas:**

- Crear los modelos Prisma `Game`, `Category`, `WikiPage`, `WikiPageGame`, `WikiPageCategory`, `WikiRelation`, `Source`, `WikiPageSource` y `MediaAsset`.
- Crear y aplicar migraciones.
- Crear seeds iniciales en espanol para juegos y categorias.
- Crear los modulos API `games`, `categories` y `wiki`.
- Implementar paginacion, filtros y ordenacion iniciales.
- Proteger las operaciones de escritura por rol.

**Definicion de completado:**

- La base de datos contiene juegos y categorias iniciales.
- La API lista juegos y categorias.
- La API permite a ADMIN crear y editar paginas wiki.
- El contenido no publicado no aparece en endpoints publicos.

## Phase 4: Public website foundation

**Objetivo:** construir el shell publico de la plataforma.

**Tareas:**

- Crear el route group publico y su layout.
- Crear homepage, navegacion y footer.
- Crear listado y detalle de wiki.
- Crear listado y detalle de juegos.
- Consumir exclusivamente contenido publicado.
- Anadir metadata SEO basica, slugs limpios e internal links.
- Incluir estados de carga, vacio, error y no encontrado donde proceda.

**Definicion de completado:**

- Las paginas publicas son accesibles en desktop y movil.
- Las paginas wiki publicadas pueden consultarse.
- Los borradores y contenidos archivados no son publicos.
- Las paginas principales tienen metadata SEO basica.

## Phase 5: Admin panel foundation

**Objetivo:** construir la interfaz inicial de administracion.

**Tareas:**

- Crear el route group y layout admin.
- Crear dashboard y navegacion responsive.
- Crear listado, alta y edicion de wiki.
- Crear administracion de juegos y categorias.
- Permitir publicar, archivar y relacionar contenido.
- Proteger rutas en Next.js y operaciones en NestJS.
- Incluir estados de carga, vacio y error.

**Definicion de completado:**

- ADMIN puede gestionar el contenido wiki inicial.
- ADMIN puede publicar y archivar paginas.
- ADMIN puede asignar juegos y categorias.
- Ninguna operacion administrativa depende solo de ocultar elementos en la UI.

## Phase 6: Media

**Objetivo:** soportar imagenes y metadatos de archivos.

**Tareas:**

- Configurar el bucket de Supabase Storage.
- Crear el modulo API de media.
- Crear la interfaz de subida.
- Guardar metadatos en `MediaAsset`.
- Permitir seleccionar una portada para paginas wiki.
- Validar tipo, tamano y permisos de los archivos.

**Definicion de completado:**

- ADMIN puede subir una imagen valida.
- La API registra sus metadatos.
- La imagen puede utilizarse como portada wiki.

## Phase 7: Search and browsing

**Objetivo:** hacer que el contenido sea facil de encontrar y explorar.

**Tareas:**

- Crear busqueda textual inicial.
- Crear filtros por categoria, juego y tipo.
- Implementar paginacion y ordenacion.
- Mejorar internal linking y navegacion relacionada.
- Mantener URLs indexables y estados de filtros claros.

**Definicion de completado:**

- Los usuarios pueden explorar contenido por juego, categoria y tipo.
- La busqueda devuelve resultados utiles.
- Los listados mantienen tiempos de respuesta y UX aceptables.

## Phase 8: Guides and mods

**Objetivo:** ampliar la plataforma mas alla de la wiki.

**Tareas:**

- Crear los modelos `Guide` y `Mod`.
- Crear migraciones y modulos API.
- Crear paginas publicas.
- Crear paginas administrativas.
- Aplicar el mismo flujo de estados, permisos y SEO del contenido wiki.

**Definicion de completado:**

- ADMIN puede publicar guias originales.
- ADMIN puede publicar recomendaciones de mods.
- El contenido publicado puede consultarse desde rutas publicas.

## Phase 9: Builds foundation

**Objetivo:** iniciar la funcionalidad de builds de Fallout 76.

**Tareas:**

- Crear el modelo inicial `Build`.
- Permitir crear y editar borradores autenticados.
- Soportar builds privadas.
- Crear el editor inicial de valores S.P.E.C.I.A.L.
- Crear la pagina de builds propias.

**Definicion de completado:**

- Un usuario autenticado puede crear, guardar y recuperar un build privado.
- La API valida propiedad y permisos.

## Phase 10: Full Fallout 76 planner

**Objetivo:** convertir builds en un planner avanzado.

**Tareas:**

- Modelar e importar perk cards.
- Anadir mutaciones, armas y armaduras.
- Implementar reglas y validaciones de Fallout 76.
- Crear builds publicos y no listados.
- Permitir compartir, explorar y guardar favoritos.

**Definicion de completado:**

- Los usuarios pueden crear, validar, guardar, publicar y explorar builds de Fallout 76.
- Los builds compartidos respetan visibilidad, propiedad y permisos.
