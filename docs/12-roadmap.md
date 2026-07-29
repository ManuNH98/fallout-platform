# 12. Roadmap

## Objetivo

Construir la plataforma de forma incremental, manteniendo tareas pequenas, verificables y alineadas con `AGENTS.md` y el resto de la documentacion.

Cada fase debe cerrarse antes de depender de ella desde la siguiente. Una fase se considera terminada solo cuando cumple su definicion de completado y las validaciones indicadas.

## Estado actual

La configuracion local de **Phase 1: Infrastructure and configuration** esta completada. La conexion real con Supabase queda aplazada por decision del propietario mientras el desarrollo inicial de interfaz utiliza datos mock.

**Phase 0 se completo el 29 de julio de 2026.** La base del monorepo incluye pnpm workspaces, Turborepo, `apps/web`, `apps/api`, los seis packages previstos, documentacion y configuraciones compartidas.

La web utiliza el puerto `3000` y la API el `3001` durante desarrollo. Las validaciones de cierre `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm lint`, `pnpm check-types`, `pnpm build` y `pnpm test` funcionan correctamente.

## Phase 0: Repository foundation

**Estado:** completada.

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

**Estado:** configuracion local completada; integracion externa aplazada.

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

**Pendientes externos aplazados:**

- Crear el proyecto remoto de Supabase.
- Configurar Auth y el bucket `media` en Supabase Dashboard.
- Rellenar los archivos `.env` locales con credenciales reales.
- Ejecutar `pnpm --filter @repo/db db:check` contra Supabase PostgreSQL.

Estos pendientes deben completarse antes de implementar autenticacion real, migraciones o persistencia. No bloquean un prototipo visual con datos mock, pero las fases dependientes no se consideraran terminadas hasta integrar la infraestructura real.

## Phase 2: Public design with mocks

**Objetivo:** definir la primera experiencia visual publica sin depender de infraestructura externa.

**Tareas:**

- Crear el route group publico y su layout.
- Definir la direccion visual Fallout/Pip-Boy/wasteland sin perjudicar la legibilidad.
- Crear homepage, navegacion y footer.
- Preparar datos mock tipados para juegos, categorias y contenido wiki destacado.
- Crear componentes base para cards, secciones y estados de contenido.
- Anadir metadata SEO inicial.
- Garantizar comportamiento responsive y accesibilidad basica.

**Definicion de completado:**

- La home y el shell publico funcionan en desktop y movil.
- La interfaz utiliza copy en espanol y datos mock claramente aislados.
- Los componentes base pueden reutilizarse en los listados publicos.
- La pagina tiene metadata, jerarquia semantica y navegacion accesible.

## Phase 3: Mock content browsing

**Objetivo:** construir la navegacion publica principal sobre datos mock.

**Tareas:**

- Crear `/wiki` y `/wiki/[slug]`.
- Crear `/juegos` y `/juegos/[slug]`.
- Crear filtros y busqueda simulados donde aporten valor al prototipo.
- Crear estados de carga, vacio, error y no encontrado.
- Anadir breadcrumbs, slugs limpios e internal links.
- Mantener los mocks desacoplados de los componentes de presentacion.

**Definicion de completado:**

- Los usuarios pueden navegar por wiki y juegos con contenido mock.
- Las rutas de detalle funcionan con slugs.
- Los listados y detalles son responsive, accesibles y SEO-friendly.
- Sustituir los mocks por la API no requiere redisenar las pantallas.

## Phase 4: Supabase real infrastructure

**Objetivo:** activar la infraestructura externa preparada en Phase 1.

**Tareas:**

- Crear el proyecto remoto de Supabase.
- Configurar los archivos `.env` locales y entornos de despliegue.
- Configurar Email en Supabase Auth y las URLs permitidas.
- Crear el bucket `media` en Supabase Storage.
- Configurar las connection strings de runtime y Prisma CLI.
- Ejecutar `pnpm --filter @repo/db db:check`.
- Verificar que web y API arrancan con la configuracion real.

**Definicion de completado:**

- Prisma conecta con Supabase PostgreSQL.
- Web y API disponen de las variables necesarias sin exponer secretos.
- Supabase Auth esta preparado para los flujos de la siguiente fase.
- El bucket `media` existe y no permite escrituras anonimas.

## Phase 5: Auth foundation

**Objetivo:** autenticar usuarios y autorizar acciones desde la API.

**Tareas:**

- Crear los clientes de Supabase para Next.js.
- Crear login, registro y logout.
- Validar Supabase JWT en NestJS.
- Crear el modelo `UserProfile` y su migracion.
- Crear o sincronizar el perfil local en el primer flujo autenticado.
- Implementar los roles `USER`, `ADMIN`, `EDITOR` y `MODERATOR`.
- Implementar `SupabaseAuthGuard`, `RolesGuard`, `@CurrentUser()` y `@Roles()`.
- Proteger un endpoint inicial para ADMIN.

**Definicion de completado:**

- Un usuario puede registrarse, iniciar y cerrar sesion.
- Next.js puede llamar a NestJS con el access token.
- NestJS identifica al usuario y carga su perfil local.
- Solo ADMIN puede acceder al endpoint administrativo de prueba.

## Phase 6: Core content models and API

**Objetivo:** implementar la persistencia y API iniciales de contenido.

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

## Phase 7: Replace mocks with API

**Objetivo:** conectar las pantallas publicas existentes con datos reales sin cambiar su diseno.

**Tareas:**

- Crear el cliente API compartido de `apps/web`.
- Sustituir mocks de juegos, categorias y wiki por endpoints REST.
- Implementar fetching desde Server Components cuando corresponda.
- Conectar loading, empty, error y not-found states a respuestas reales.
- Verificar que solo se muestra contenido publicado.
- Mantener los mocks disponibles exclusivamente para tests o desarrollo aislado si siguen siendo utiles.

**Definicion de completado:**

- Home, wiki y juegos consumen la API real.
- Los mocks ya no son la fuente de datos de produccion.
- Errores de red y recursos inexistentes tienen estados claros.
- El contenido no publicado permanece oculto en rutas publicas.

## Phase 8: Admin panel foundation

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

## Phase 9: Media

**Objetivo:** soportar imagenes y metadatos de archivos.

**Tareas:**

- Crear el modulo API de media.
- Crear la interfaz de subida.
- Guardar metadatos en `MediaAsset`.
- Permitir seleccionar una portada para paginas wiki.
- Validar tipo, tamano y permisos de los archivos.
- Revisar las politicas del bucket `media` con el flujo real.

**Definicion de completado:**

- ADMIN puede subir una imagen valida.
- La API registra sus metadatos.
- La imagen puede utilizarse como portada wiki.

## Phase 10: Search and browsing

**Objetivo:** hacer que el contenido real sea facil de encontrar y explorar.

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

## Phase 11: Guides and mods

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

## Phase 12: Builds foundation

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

## Phase 13: Full Fallout 76 planner

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
