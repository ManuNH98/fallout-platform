# 15. Current project status

## Objetivo

Proporcionar un punto de entrada breve para retomar el desarrollo sin depender del historial de una conversacion o de una herramienta concreta.

Este documento resume el estado operativo. Las decisiones normativas siguen perteneciendo a `AGENTS.md` y a los documentos especificos de `docs/`.

## Estado actual

Actualizado el 21 de octubre de 2026.

- **Phase 0: Repository foundation** esta completada.
- La parte local de **Phase 1: Infrastructure and configuration** esta preparada.
- La integracion externa con Supabase se retoma en Phase 4; aun no esta verificada.
- **Phase 2: Public design with mocks** esta completada.
- **Phase 3: Mock content browsing** esta completada e integrada mediante la PR #6 (merge `4cf28bd`).
- La fase activa es **Phase 4: Supabase real infrastructure**. Las tareas 1 a 4 estan integradas y la tarea 5 de entorno real esta en curso; queda pendiente la confianza TLS estricta de Prisma CLI en macOS.

## Base completada

- Monorepo con pnpm workspaces y Turborepo.
- Frontend Next.js en `apps/web`, App Router en `apps/web/app/` (sin `src/`), con puerto local `3000`.
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
- Phase 4 prepara infraestructura, Email Auth, URLs y Storage; no implementa login, registro, sesiones, roles ni validacion JWT (Phase 5), modelos de contenido, migraciones ni seeds.
- El frontend sigue usando mocks durante Phase 4, sin cambios de diseno ni llamadas nuevas a la API.
- Se ejecuta una tarea por revision; el propietario crea/sube los commits y autoriza la siguiente. Cada entrega incluye titulo y descripcion de commit en ingles.
- No se utilizara Supabase local ni Docker salvo que se planifique expresamente.
- Next.js, NestJS, Prisma y Supabase mantienen las responsabilidades descritas en `docs/01-architecture.md`.

## Pendientes de Phase 4

Antes de implementar autenticacion o persistencia real se debe:

- Actualizar los contratos de entorno y los ejemplos antes de introducir credenciales reales.
- Crear o verificar el proyecto remoto de Supabase con el propietario.
- Configurar Supabase Auth y el bucket `media` de Storage.
- Crear los archivos `.env` locales a partir de los ejemplos, sin commitear secretos.
- Verificar Prisma CLI con `pnpm --filter @repo/db db:check` (`DIRECT_URL`) y preparar/ejecutar una comprobacion independiente de runtime (`DATABASE_URL`).
- Comprobar arranque de web/API, `GET /health` y navegacion mock. Health por si solo no verifica PostgreSQL.
- Completar las tareas externas de Phase 4 y continuar con Auth en Phase 5.

La guia detallada se mantiene en `docs/14-environment-and-supabase.md`.

## Entrega integrada de Phase 3

La integracion se incorporo mediante la PR #6, merge `4cf28bd`, que contiene
`bca7fc4`. El propietario autorizo iniciar Phase 4 el 21 de octubre de 2026.
El documento de validacion de Phase 3 conserva el estado historico de su entrega;
no representa una revision pendiente actual.

La comprobacion se basa en el historial Git disponible. La consulta directa del
remoto mediante `git ls-remote` fallo por resolucion DNS; no se afirma una
verificacion adicional del estado actual de GitHub.

Entregado:

- Home conectada a los listados y seis categorias enlazadas a sus filtros.
- Listado wiki con busqueda y filtros por juego/categoria, y ocho detalles.
- Listado de juegos y cuatro fichas con articulos wiki asociados.
- Tarjetas, breadcrumbs y enlaces entre modulos; mensajes de no encontrado
  en espanol, incluido el 404 general.
- Correccion de contraste del boton principal y de los colores de enlaces,
  con margen de desplazamiento adaptado a la cabecera movil.
- Mocks y contratos separados de la presentacion, sin integrar API ni Supabase.

Validacion final registrada de Phase 3: `pnpm --filter web lint`, `pnpm --filter web check-types`,
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

## Siguiente tarea

La tarea documental inicial esta integrada en `eb36031`. La tarea 2, integrada en `cb7ca8e`, actualiza
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en el ejemplo web, el helper y Turbo.
El layout raiz de servidor importa el helper para ejecutar la validacion.
Ambas variables Supabase pueden omitirse para trabajar con mocks; configurar
solo URL o solo clave produce un error en espanol. No se comprueba autenticidad
de la clave ni se realizan llamadas externas.

Validacion de tarea 2: `pnpm --filter web lint`, `pnpm --filter web check-types`
y `pnpm --filter web build` correctos. Comprobados siete escenarios aislados
del helper: ausencia, pareja completa, solo URL, solo clave, URL invalida,
valores vacios y rechazo de la clave legacy como sustituto. Tambien se ha
verificado con builds reales de Next: sin Supabase compila; solo URL falla
con el mensaje esperado; URL y publishable key ficticias compilan.
El intento de build dentro del sandbox se detuvo al no avanzar; estas
comprobaciones de build se completaron fuera del sandbox. No se utilizaron
credenciales reales ni se verifico infraestructura externa. No hay cambios
en Prisma que requieran pruebas de conectividad en esta tarea.

La tarea 3, integrada en `36e0b26`, elimina `SUPABASE_JWT_SECRET` del tipo de entorno API, su ejemplo
y Turbo. Los ejemplos de API/DB usan session pooler `5432` sin `pgbouncer=true`;
runtime usa `sslmode=verify-full` y CLI `sslmode=require`, con las diferencias
de certificados y los limites pendientes descritos en la guia. No se declara
verificada la confianza del certificado ni la conectividad remota.

La API valida host y protocolos HTTP(S) o PostgreSQL segun la variable.
Mantiene variables externas opcionales para los mocks y mensajes sin valores
sensibles. No se implementa validacion JWT ni se conecta NestJS a Prisma.

Validacion de tarea 3: lint, check-types y build correctos en `api` y
`@repo/db`; `prisma:validate` y `prisma:generate` correctos sin credenciales.
`pnpm --filter api run test --runInBand` pasa con 16 pruebas y
`pnpm --filter api run test:e2e --runInBand` con 2, incluido `/health`.
Las e2e se completaron fuera del sandbox tras un error `listen EPERM` al
abrir el puerto local. Con pnpm 9 se usa `run test` para pasar `--runInBand`
al script; la forma abreviada `test --runInBand` fue rechazada por pnpm.
No se ejecuto `db:check` ni se hicieron conexiones a Supabase.

La tarea 4 incorpora `pnpm --filter @repo/db db:check:runtime`. Genera y
compila con las dependencias existentes, carga el entorno de DB y comprueba
solo `DATABASE_URL` mediante la factoria Prisma y `SELECT 1 AS ok`. Verifica
el resultado y desconecta antes de anunciar exito. El limite de 10 segundos
incluye conexion, consulta y desconexion; si se supera, fuerza la salida y
el sistema operativo cierra los sockets. Las salidas no imprimen errores del
driver ni credenciales. La politica TLS real sigue pendiente de verificar.

Validacion de tarea 4: lint, check-types, build, `prisma:validate` y
`prisma:generate` correctos en `@repo/db`, mas `git diff --check`. El comando
completo genera/compila y falla como se espera sin `DATABASE_URL`. Nueve
comprobaciones locales cubren ausencia, ausencia de fallback a `DIRECT_URL`,
protocolo invalido, fallo local con cliente Prisma real y, con cliente
simulado en memoria, exito, resultado inesperado, error de consulta,
desconexion y timeouts reales de 10 segundos durante consulta/desconexion.
Se comprobo que las salidas no incluyen la contrasena sintetica. Estas
comprobaciones no verifican Supabase, credenciales reales ni certificados.

La tarea 4 esta integrada en `d19cb94`. En la tarea 5 el propietario ha creado
el proyecto y rellenado los tres archivos locales ignorados. Se comprobo el
formato de la URL publica, el prefijo publishable y la coherencia web/API,
sin exponer valores. La CA descargada desde Supabase esta copiada en un PEM
local ignorado y referenciada por las URLs de servidor.

`db:check:runtime` pasa contra Supabase con `sslmode=verify-full` y CA explicita.
El driver pg confirma TLS cifrado y certificado autorizado. CLI paso inicialmente
con `sslmode=require`; al configurar CA y `sslaccept=strict` falla con P1011.
El verificador nativo de macOS reproduce un rechazo de confianza e informa de
Certificate Transparency no verificado. El propietario autorizo y completo una
regla SSL de usuario limitada al host exacto. Se verifico su alcance, pero no
resolvio el fallo. Se retiro la regla y la CA importada al llavero: la confianza
de usuario coincide con el estado previo guardado. Se conserva el PEM local de
runtime; no se ha desactivado TLS ni modificado el almacen de administrador.
El 2026-10-23 se preparo la URI directa real del propietario en `DIRECT_URL`
con CA y TLS estricto, manteniendo runtime en el pooler. `db:check` falla con
P1001: el endpoint tiene AAAA sin A y TCP IPv6 devuelve `EHOSTUNREACH` desde
esta red. No se ha llegado a negociar TLS ni verificar credenciales en directo.
La URL directa permanece configurada para una prueba con acceso IPv6.
Tras este cambio pasan lint, check-types, build y `db:check:runtime` de
`@repo/db`. No se han modificado codigo, modelos ni configuracion de runtime.

El diagnostico adicional del pooler confirma que CLI lee `sslcert`. La cadena
completa llega a la CA configurada y pg valida hostname, TLS y SELECT 1.
La evaluacion SSL de macOS con cadena completa y CA explicita falla con
`OtherTrustValidityPeriod` y `ServerAuthEKU`: el certificado final tiene 1825
dias de validez y no incluye serverAuth. Los requisitos publicados por Apple
explican esas dos restricciones; no se atribuye el rechazo solo a CT.
Se recomienda consultar al proveedor sobre ese certificado antes de cambiar
la confianza local. Una prueba estricta en Linux del propietario es otra via
pendiente, sin resultado garantizado. Detalles y referencias en la guia de
entorno. Esta iteracion solo modifica documentacion; no repite lint/build
porque no cambia codigo ni configuracion persistente.

Con el entorno real y la CA local, `pnpm lint`, `pnpm check-types` y
`pnpm build` pasan en el monorepo; build se completo fuera del sandbox.
`git diff --check` correcto. No se ejecutaron migraciones ni escrituras remotas.

El propietario ha compartido una respuesta de la IA de soporte, que recomienda
revision humana del certificado; no consta una solucion ni un ticket humano
confirmado. Autoriza documentar el bloqueo y avanzar a tarea 6 (Email/URLs),
independiente de Prisma CLI. Se mantienen TLS estricto y el entorno existente.
La tarea 5 sigue abierta; no se reintenta modificar la confianza del sistema.

Tarea 6 preparada: el propietario confirma el 2026-10-23 Email habilitado con
confirmacion, Site URL `http://localhost:3000` y las reservas exactas
`http://localhost:3000/auth/confirmar` y
`http://localhost:3000/restablecer-contrasena`. Declara que no ha configurado
SMTP propio: se conserva el incluido, limitado a miembros del equipo y con
limites de envio documentados en la guia de entorno. No hay conector Supabase
ni inspeccion remota de esos ajustes; la evidencia es la confirmacion del
propietario. No se han implementado rutas Auth, enviado correos ni probado
entregabilidad. La verificacion funcional corresponde a Phase 5; SMTP propio
se decidira antes de pruebas con destinatarios externos o produccion.

Pendientes actuales:

- Resolver acceso IPv6 para evaluar CLI directo o la confianza estricta de CLI
  en session pooler, y repetir SELECT 1 sin relajar TLS.
- La API aun no consume `@repo/db`; su health solo acredita disponibilidad.
- Bucket `media`: pendiente de la siguiente tarea autorizada.
- La comprobacion final de arranque y navegacion con entorno real sigue pendiente.

Phase 4 permanece abierta hasta verificar todos los criterios del roadmap.

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

Con entorno real, `db:check:runtime` ya pasa. `db:check` paso inicialmente con cifrado; al exigir confianza estricta falla en el pooler de macOS. La URL directa configurada despues falla por alcance IPv6. No se considera cerrada esa verificacion.

## Inicio recomendado para un chat nuevo

```md
Read AGENTS.md, docs/15-current-status.md, docs/12-roadmap.md, and the documents relevant to the task before making changes.

Phase 0 is complete, local Phase 1 is prepared, and Phases 2 and 3 are complete. Phase 3 was merged through PR #6 (4cf28bd). Phase 4 is active: follow docs/14-environment-and-supabase.md, distinguish current code from planned environment updates, and verify remote infrastructure before claiming completion. App Router lives in apps/web/app/ without src/. Keep the Spanish-first public UI and mocks unchanged. Do not implement auth flows, sessions, roles, JWT validation, content models, migrations, or seeds. Execute one owner-authorized task at a time, validate affected workspaces, provide an English commit title and description, and stop for owner review. The owner creates and pushes commits.
```
