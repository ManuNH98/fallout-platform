# 15. Current project status

## Objetivo

Proporcionar un punto de entrada breve para retomar el desarrollo sin depender del historial de una conversacion o de una herramienta concreta.

Este documento resume el estado operativo. Las decisiones normativas siguen perteneciendo a `AGENTS.md` y a los documentos especificos de `docs/`.

## Estado actual

Actualizado el 30 de octubre de 2026.

- **Phase 0: Repository foundation** esta completada.
- La parte local de **Phase 1: Infrastructure and configuration** esta preparada.
- Supabase remoto tiene runtime, Prisma CLI y Storage verificados con los requisitos locales documentados; Email/URLs preparados por confirmacion del propietario.
- **Phase 2: Public design with mocks** esta completada.
- **Phase 3: Mock content browsing** esta completada e integrada mediante la PR #6 (merge `4cf28bd`).
- **Phase 4: Supabase real infrastructure** esta completada e integrada en develop mediante la PR #7 (merge `b324cd5`, que incorpora `8222fb4`).
- La fase activa es **Phase 5: Auth foundation**, inicialmente para planificacion y preparacion. El propietario confirmo el merge y autorizo continuar el 23 de octubre de 2026. La rama `feature/Phase-5_auth_foundation` parte de ese merge. Las factorias Supabase web, Proxy SSR, verificador JWT y provider DB de NestJS estan implementados. El provider ha ejecutado SELECT 1 de solo lectura; UserRole/UserProfile y su SQL estan preparados sin aplicacion remota. Todavia no hay flujos Auth ni sesiones/access tokens reales verificados.

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
- Phase 4 preparo infraestructura, Email Auth, URLs y Storage; su cierre no acredita login, registro, sesiones, roles ni validacion JWT. Esos flujos, UserProfile y su migracion corresponden a tareas autorizadas de Phase 5; el contenido persistente sigue reservado a Phase 6.
- El frontend conserva los mocks y el diseno durante Phase 5; no se sustituyen por llamadas de contenido a la API.
- Se ejecuta una tarea por revision; el propietario crea/sube los commits y autoriza la siguiente. Cada entrega incluye titulo y descripcion de commit en ingles.
- No se utilizara Supabase local ni Docker salvo que se planifique expresamente.
- Next.js, NestJS, Prisma y Supabase mantienen las responsabilidades descritas en `docs/01-architecture.md`.

## Cierre e integracion de Phase 4

Contratos de entorno, proyecto remoto, archivos locales, preparacion Email/URLs,
Storage privado, checks de CLI/runtime y arranque/navegacion mock tienen las
evidencias registradas en `docs/17-phase-4-validation.md`. Email/URLs se basan en
confirmacion del propietario; no se han probado flujos Auth ni entrega de correo.

El propietario confirmo la integracion de la PR #7 y el inicio de Phase 5.
El historial Git y las referencias locales develop/origin/develop situan el
merge en `b324cd5`; la rama de Phase 5 parte de el. No se atribuye a este
cierre documental una nueva consulta al remoto ni una nueva verificacion de
infraestructura. Los requisitos locales WARP/hosts de CLI Direct permanecen
vigentes; runtime usa session pooler. Health por si solo no verifica PostgreSQL;
las dos comprobaciones SQL son independientes. No hay despliegue remoto
operativo verificado.

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

## Historial de preparacion y validacion de Phase 4

Los estados pendientes siguientes describen cada entrega en su momento. El
resultado posterior y el cierre vigente se recogen arriba y en docs/17; no
representan bloqueos actuales de Phase 4.

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

Tarea 7 verificada el 2026-10-23 tras la creacion del bucket por el propietario.
La inspeccion remota con pg y TLS autorizado confirma `media` privado, RLS
activo y cero politicas en `storage.objects`, incluidas las generales.
Una unica subida sin sesion, con publishable key en `apikey` y sin upsert,
fue rechazada por RLS: HTTP 400 con statusCode 403 en el cuerpo. La consulta
de solo lectura del nombre UUID exacto confirma ausencia del objeto antes y
despues del intento. Sin archivos creados, limpieza ni cambios de permisos.
No se anadieron dependencias ni codigo; validacion documental con
`git diff --check`, sin repetir lint/tipos/build por ser solo documentacion.
Procedimiento y evidencias en la guia de entorno. En ese momento CLI seguia pendiente.

Resultado posterior de CLI (2026-10-23): el propietario activa WARP y autoriza
una entrada temporal unica en /etc/hosts, que aplica con el helper y sudo desde
su terminal. Se verifica copia previa integra y resto del archivo intacto.
macOS ya resuelve Direct; `db:check` y `db:check:runtime` terminan con codigo 0.
CLI conserva hostname, CA y sslaccept=strict. Controles negativos sin CA y con
IPv6 literal en lugar del hostname fallan con P1011. No se relaja TLS.
Lint, check-types y build de @repo/db pasan tras esta comprobacion.

WARP debe seguir activo para CLI Direct; la entrada temporal debe actualizarse
si cambia la IPv6 del proyecto. No se han cambiado .env, codigo ni llaveros.
Los helpers/copia estan fuera del repositorio. Detalles y retirada de la
entrada en la guia de entorno y el registro de validacion.

Situacion al terminar la validacion, antes del cierre posterior:

- La API aun no consume `@repo/db`; su health solo acredita disponibilidad. Esta limitacion sigue vigente para Phase 5.
- La revision y el registro de cierre de Phase 4 estaban pendientes; quedaron resueltos tras la PR #7 y la confirmacion del propietario. Se conservan los requisitos locales WARP/hosts.

Validacion de aplicaciones realizada el 2026-10-23: lint, check-types y build
forzados en el monorepo; 16 pruebas unitarias y 2 e2e de API correctas; Prisma
validate y runtime correctos. CLI dio P1001 inicialmente; la repeticion posterior
con WARP y hosts pasa, como se detalla arriba.
Home y health responden en los servidores preexistentes de 3000/3001. Un
arranque independiente del build en 3100/3101 tambien funciona, tras regenerar
dist de API eliminado por un intento de dev que fallo por puerto ocupado.
No se detuvieron los procesos del propietario; los temporales se cerraron.

El recorrido HTTP cubre 25 URLs sin enlaces internos rotos y los estados de
busqueda vacia y no encontrado. Navegacion interactiva comprobada en navegador;
frontend conserva mocks y diseno. No hay cambios de codigo ni archivos .env del repositorio.
Registro completo de comandos, puertos, revision de assets y limitaciones en
`docs/17-phase-4-validation.md`. La revision de cierre pendiente en aquella entrega quedo superada tras la PR #7 y la autorizacion del propietario para avanzar a Phase 5.

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

Con entorno real, `db:check:runtime` y `db:check` pasan con TLS verificado. Los fallos anteriores del pooler y de Direct sin WARP/hosts quedan registrados como historico; no son la configuracion CLI verificada actual.

## Siguiente tarea de Phase 5

Contrato y secuencia en [docs/18](18-phase-5-auth-foundation.md), con docs/04,
docs/05 y docs/07 alineados. Tarea 2 integrada en `587adfc`:
factorias client.ts/server.ts y pruebas locales en apps/web/lib/supabase,
helper getSupabaseEnvironment, dependencias exactas @supabase/ssr 0.10.3 y
@supabase/supabase-js 2.108.0, y lockfile actualizado. Se mantiene Node >=20.19;
las versiones latest consultadas requieren Node >=22 en el SDK.

Servidor por peticion, server-only y cookies asincronas: lectura por defecto,
escritura explicita mediante writableCookies para Actions/Handlers, sin
silenciar errores. Esa entrega no incorporo rutas ni Proxy y conservo mocks/diseno.
Lint, check-types y build de web correctos; tambien build con ambas variables
Supabase vacias sin editar el entorno local (completado fuera del sandbox).
Seis pruebas aisladas correctas con node:test/VM Modules/TypeScript existentes.
Fixture Next temporal confirma frontera servidor/cliente. Evidencias y limites
en docs/18; no acredita Auth ni sesiones reales.

El propietario confirma ECC (P-256) como Current el 30 de octubre de 2026.
Una consulta GET al JWKS publico confirma ES256/EC/P-256. Estado activo por
confirmacion del propietario y clave publicada por inspeccion del agente;
no se han verificado access tokens de usuarios reales.
Plantilla de confirmacion y destinatario del equipo pendientes antes de enviar
correos; las rutas reservadas siguen sin implementar y el SMTP incluido no tiene
entrega verificada. No cambia API, DB, entorno real ni recursos externos.

Tarea 3 integrada en `e5b3573`:
apps/web/proxy.ts, lib/supabase/proxy.ts y tests/proxy.test.mjs. Matcher solo
/login, /registro, /auth/confirmar y /admin/:path*. getClaims verifica identidad;
cookies renovadas llegan a peticion y respuesta, incluidas redirecciones y
errores, con cache privada/no-store. Admin sin identidad redirige a /login;
fallo de Auth o configuracion ausente produce 503 generico. El Proxy no decide
roles ni sustituye la autorizacion futura de NestJS. Sin dependencias nuevas.

Validacion de tarea 3: lint, check-types y build web correctos; 16 pruebas
locales (10 Proxy y 6 factorias). El build con variables Supabase vacias se
completo fuera del sandbox tras detener un intento sin avance. Smoke local:
seis rutas publicas/assets con 200 sin cookies Auth; cinco rutas del matcher
con 503 privado al no configurar Supabase. El servidor temporal fue cerrado.
No se verifican sesiones ni renovaciones reales. Detalles en docs/18.

Tarea 4 integrada en `5a20708`: AuthModule, SupabaseJwtService y
SupabaseAuthGuard verifican ES256/JWKS con issuer/audiencia, claims de usuario
y sesion, caducidad y nbf. Identidad interna sin perfiles/roles. Timeout 5 s,
cache 10 min y cooldown 30 s; token invalido 401, proveedor no disponible 503.
Sin guard global ni nuevos endpoints de produccion; health sigue publico.

jose 6.2.14 fijado, Jest adaptado con ts-jest existente y origen SUPABASE_URL
restringido a HTTPS sin credenciales/ruta/query/fragmento (HTTP solo loopback
para pruebas). No cambia entorno real ni se agrega JWT secret/API key.
Lint, check-types, build, 61 unitarias y 8 e2e correctos. E2e fuera del sandbox
tras EPERM al abrir puertos. Smoke de codigo compilado y arranque sin Supabase
correctos. Validado en Node 24.15.0; condiciones ESM/runtime y limites en docs/18.
Sin DB, migraciones, usuarios, correos ni cambios web. Solo la inspeccion JWKS
fue remota y de lectura; las pruebas usan claves/tokens y transporte simulados.

Tarea 5 integrada en 6a4e187: @repo/db emite ESM y declaraciones
en dist; API depende del workspace y lo importa de forma dinamica desde un
provider perezoso. DatabaseService comparte la creacion/cliente, reintenta fallos
sanitizados y desconecta al cerrar Nest, incluyendo SIGTERM. Health sigue publico
y no consulta DB. Sin modelos, schema cambiado ni migraciones.

Configs Turbo de API/DB ordenan el build de DB antes de dev/check-types de API;
los comandos filtrados directos requieren construir DB primero. Sin nuevas
librerias externas ni cambios de formato global. Lint, tipos y build de DB/API,
Prisma validate/generate, 69 unitarias y 8 e2e correctos. Turbo check-types forzado
pasa con URLs de DB vacias en el proceso. Jest verifica el artefacto ESM real
mediante un proceso Node con sockets bloqueados. Detalles y comandos en docs/18.

API dist arranca sin DB/Supabase y cierra por SIGTERM; el provider compilado
comparte cliente y pasa SELECT 1 por runtime/session pooler, manteniendo
verify-full y CA del entorno. Consulta de solo lectura y cierre correctos; no
se cambian .env, TLS, red o llavero ni se repiten comprobaciones CLI Direct.

Tarea 6 integrada en 73791bf: UserRole y UserProfile en Prisma,
con UUIDs, supabaseUserId unico, role USER por defecto y fechas timestamptz(3).
SQL generado offline, con transaccion, RLS sin politicas cliente y revocacion de
privilegios de PUBLIC/anon/authenticated limitada a UserProfile. Sin cambios en
auth.users, relaciones de contenido, triggers, seeds ni escrituras remotas.

Prisma format/validate/generate, lint/tipos/build DB y API, 69 unitarias y 8 e2e
correctos. El SQL estructural coincide con migrate diff de Prisma 7.9.1; RLS/ACL
son adiciones manuales revisadas, aun sin ejecutar. Detalles en docs/18.

Tarea 7 autorizada e iniciada, bloqueada antes de aplicar: preflight por session
pooler correcto, mismo proyecto, runtime postgres con BYPASSRLS/CREATE, sin tablas
en public ni UserProfile/UserRole/historial de migraciones. TLS cliente validado.
Prisma migrate status falla por Direct; TCP:5432 agota timeout aunque WARP figura
conectado en modo trafico/DNS y hosts coincide con AAAA actual. Causa sin determinar.
No se ejecuto deploy ni hubo escrituras remotas; no se cambio red, hosts o TLS.

Siguiente paso: propietario revisa acceso Direct; despues repetir preflight,
aplicar el SQL aprobado y verificar estructura, permisos efectivos, acceso Nest,
rechazo Data API y estado. La tarea 7 sigue incompleta; no iniciar tarea 8.
Diagnostico y limites en docs/18.
El propietario crea y sube los commits. Phase 5 sigue abierta.

## Inicio recomendado para un chat nuevo

```md
Read AGENTS.md, docs/15-current-status.md, docs/12-roadmap.md, and the documents relevant to the task before making changes.

Phase 0 and local Phase 1 are complete; the external infrastructure deferred from Phase 1 was verified in Phase 4. Phases 2 and 3 are complete; Phase 3 was merged through PR #6 (4cf28bd). Phase 4 is complete and merged into develop through PR #7 (b324cd5). The owner authorized progression to Phase 5: Auth foundation on feature/Phase-5_auth_foundation. Follow docs/07-auth-and-permissions.md, docs/12-roadmap.md, docs/18-phase-5-auth-foundation.md and docs/14-environment-and-supabase.md; preserve the evidence and limitations in docs/17-phase-4-validation.md. CLI Direct requires WARP and a temporary hosts entry on this Mac; runtime uses the session pooler. This documentary closure is not a new infrastructure check. Supabase browser/server factories, SSR Proxy, NestJS ES256/JWKS verification and lazy @repo/db integration are implemented; see tasks 2 to 6 in docs/18. UserRole/UserProfile and offline migration SQL are prepared but have not been applied; task 7 was explicitly authorized but is blocked: Direct TCP port 5432 times out despite connected WARP and matching hosts/AAAA; session-pooler preflight passed. No deploy or remote writes occurred. Restore Direct access and repeat preflight before applying; do not change networking automatically. Build DB before direct filtered API commands, or use Turbo to resolve dependencies. A read-only SELECT 1 through the compiled Nest provider passed; health still reports availability only. Current ECC P-256 is owner-confirmed and public JWKS was inspected. Auth flows, profile synchronization and business role enforcement remain unimplemented. Real sessions/access tokens, database structure and RLS/ACL remain unverified remotely. App Router lives in apps/web/app/ without src/. Keep the Spanish-first public UI and mocks unchanged. Implement Auth, UserProfile and roles only through scoped owner-authorized tasks. Do not introduce content models, CRUD or seeds. Applying migrations, creating users, sending emails or changing remote configuration requires an expressly authorized task. Do not change networking or keychain settings automatically. Execute one task at a time, validate affected workspaces, provide an English commit title and description, and stop for owner review. The owner creates and pushes commits.
```
