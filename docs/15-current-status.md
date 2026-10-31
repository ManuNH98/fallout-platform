# 15. Current project status

## Objetivo

Proporcionar un punto de entrada breve para retomar el desarrollo sin depender del historial de una conversacion o de una herramienta concreta.

Este documento resume el estado operativo. Las decisiones normativas siguen perteneciendo a `AGENTS.md` y a los documentos especificos de `docs/`.

## Estado actual

Actualizado el 30 de octubre de 2026.

- **Phase 0: Repository foundation** esta completada.
- La parte local de **Phase 1: Infrastructure and configuration** esta preparada.
- Phase 4 verifico Supabase remoto; el acceso Direct falla actualmente y el motor Prisma rechaza TLS del session pooler en este Mac. Desarrollo con PostgreSQL local aprobado el 30 de octubre de 2026; L1/L2 verificadas, UserProfile migrado localmente; Auth/Storage siguen remotos. Contrato vigente en docs/19.
- **Phase 2: Public design with mocks** esta completada.
- **Phase 3: Mock content browsing** esta completada e integrada mediante la PR #6 (merge `4cf28bd`).
- **Phase 4: Supabase real infrastructure** esta completada e integrada en develop mediante la PR #7 (merge `b324cd5`, que incorpora `8222fb4`).
- La fase activa es **Phase 5: Auth foundation**, inicialmente para planificacion y preparacion. El propietario confirmo el merge y autorizo continuar el 23 de octubre de 2026. La rama `feature/Phase-5_auth_foundation` parte de ese merge. Las factorias Supabase web, Proxy SSR, verificador JWT y provider DB de NestJS estan implementados. El provider ha ejecutado SELECT 1 de solo lectura; UserRole/UserProfile y su SQL estan preparados sin aplicacion remota. Registro/login/logout, renovacion explicita, perfiles y permisos probados con cuentas reales; matriz y limites en docs/20. La tarea 7 remota se aplaza: L1/L2 verificadas, migracion local aplicada; tarea 8 integrada en 9a2c3ef; tarea 9 integrada en 2ec4a8c; tarea 10 integrada en 577c4b8; plantilla y una prueba real autorizadas pero bloqueadas por la restriccion de plantillas Free con SMTP incluido. PKCE integrado en 955eebe y revisado. El propietario ha registrado dos cuentas, una confirmada y otra pendiente. Sesion real y un perfil USER verificados; el propietario confirma retorno PKCE sin repetir password. Evidencias de tarea 10 integradas en 457c5a8; tarea 11 lista para revision/commit, Phase 5 pendiente de cierre expreso.

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
- PostgreSQL nativo local para desarrollo; Supabase PostgreSQL para produccion mas adelante. No Supabase local, Docker, root .env o gasto adicional. L1/L2 verificadas, UserProfile migrado localmente; docs/19 define uso diario; L2 integrada en ffee55a.
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
Tras reconectar WARP por el propietario, Direct sigue en timeout; controles publicos
IPv4/IPv6 por TCP:443 pasan. No se demuestra fallo general IPv6 ni se conoce la
causa especifica de Direct. No se ejecuto deploy ni hubo escrituras remotas;
no se cambio red, hosts o TLS.

El propietario confirma Dashboard sin restricciones IP. Session pooler evaluado
como alternativa documentada por Supabase: preflight correcto, pero migrate status
falla y el motor nativo devuelve P1011 (certificado no confiable). Node valida
esa cadena; es consistente con el bloqueo de macOS documentado en Phase 4.
Sin cambios de .env/llavero ni relajacion TLS. No se aplica la migracion.

El propietario confirma tambien ausencia de IPs bloqueadas y que ya probo red
movil sin exito. Direct y destino publico IPv6 usan el mismo tunel WARP (utun6).
No hay workflows Linux existentes. El propietario solo dispone del Mac, usa Safari y exige coste cero. Se descarta
la propuesta de GitHub Actions. Pendiente acordar una tarea para evaluar PostgreSQL
nativo local conservando Auth/Storage remotos gratuitos; antes de instalar o cambiar
entornos hay que revisar y actualizar el contrato de desarrollo. Sin software nuevo,
workflows, credenciales trasladadas o migracion aplicada.

Decision vigente aprobada el 30 de octubre de 2026: PostgreSQL nativo local para
desarrollo. La decision se documento primero en 326ee0e; L1 implementada despues, como
se detalla a continuacion. L2 aplica despues la migracion solo en local, segun la entrega registrada abajo. El
historico anterior conserva propuestas y estados previos.

L1 integrada en 514fdb6: PostgreSQL 17.11 via Homebrew, cluster
exclusivo en packages/db/.local-postgres, solo 127.0.0.1:55432 con SCRAM. Base
fallout_platform_dev, rol fallout_app propietario sin privilegios especiales;
anon/authenticated NOLOGIN preparados. URLs reales API/DB locales y coherentes;
Auth/Storage preservados. Copias sensibles anteriores ignoradas con modo 0600.

Uso: pnpm --filter @repo/db db:local:start|stop|status. No servicio global ni
autoinicio; iniciar manualmente despues de reiniciar. TLS deshabilitado solo en
este loopback; remoto sigue estricto. Homebrew actualizo catalogo y dependencias
necesarias (incluido gettext); detalles en docs/19. Sin cambios al schema/SQL,
web, lockfile JS, WARP/hosts o llavero. Sin migraciones ni tablas de aplicacion.

Validado: SELECT 1 por CLI, runtime y Nest compilado; parada/arranque repetidos,
SCRAM/rechazo de contrasena incorrecta, listener, roles minimos y DB vacia.
Lint/tipos/build de DB/API, Prisma validate/generate, 69 unitarias y 8 e2e pasan.
Unica consulta remota: SHOW server_version con TLS para elegir PostgreSQL 17.11;
sin escrituras remotas. Entrega detallada en docs/19.

L2 aplicada y verificada, pendiente de revision: migrate deploy del SQL aprobado
73791bf solo en 127.0.0.1:55432/fallout_platform_dev. Estado Prisma al dia,
checksum correcto y diff estructural vacio. Columnas, enum/defaults, PK/indice
unico y RLS sin politicas verificados en catalogos. PUBLIC sin grants de tabla;
anon/authenticated sin permisos de tabla/columna, SET ROLE rechaza lectura 42501.
Nest compilado consulta UserProfile por Prisma (0 filas) y cierra correctamente.

DB/API lint/tipos/build y Prisma validate/generate pasan. Sin cambios de codigo,
schema o SQL; no se repiten unitarias/e2e de L1. Sin perfiles ni pruebas de
insercion: constraints/defaults comprobados en catalogos. Sin conexiones remotas,
usuarios, correos, .env o red. Registro completo y limites en docs/19.

L2 integrada en ffee55a. Tarea 8 implementada, pendiente de revision: UsersService
sincroniza por identidad JWT verificada, upsert update vacio y recuperacion P2002
sin sobrescribir roles/campos/fechas. POST /auth/perfil admite cuerpo vacio o {},
GET /auth/me solo lee (404 si falta), GET /admin/comprobacion exige ADMIN (403 sin
perfil u otro rol). @CurrentUser/@Roles y RolesGuard, perfiles actuales por
peticion sin cache de permisos; errores DB sanitizados (503).

UserRole, UserProfileResponse y AdminCheckResponse en @repo/types; dependencia
workspace API, sin librerias externas nuevas. Ocho campos JSON explicitos, fechas
ISO y opcionales nullables; sin tokens, email ni metadata. Respuestas privadas
sin cache; health sigue publico y no consulta DB. Web y schema/SQL intactos.

API lint/tipos/build, types lint/tipos y web tipos correctos. 105 unitarias y 32
e2e pasan; claves/tokens ES256, JWKS y DB simulados. Smoke compilado sin DB/Auth:
health 200, privados sin token 401, cierre correcto. Sin usuarios/perfiles reales,
mutaciones de DB o Supabase, .env, red o datos nuevos. Limites en docs/18.

Siguiente tarea propuesta: 9 de docs/18, login/logout web y sincronizacion del
perfil, despues de revision y autorizacion. No iniciar registro/correos ni primer
ADMIN real implicitamente. El propietario crea y sube los commits.
La tarea 7 remota se aplaza, no se completa. Su verificacion y Data API pasan
a ser requisitos de produccion; no es necesario recuperar Direct para continuar
desarrollo local. WARP no sera dependencia del entorno local; aun sin desinstalar
ni limpiar hosts. Auth y Storage siguen remotos y necesitan Internet.
Validacion de esta entrega: diff y coherencia documental, sin tests/builds de codigo.
El propietario crea y sube los commits. Phase 5 sigue abierta.

## Entrega de tarea 9: login/logout web

Tarea 8 integrada en 9a2c3ef. Tarea 9 implementada y pendiente de revision:
/login dinamico en route group Auth, Server Actions y cookies SSR escribibles,
validacion Zod compartida, verificacion de claims y solicitudes privadas a Nest.
Tras login se sincroniza el perfil; si falla la API, se conserva la sesion y se
ofrece reintentar o cerrar sesion. La lectura inicial no crea perfiles. Logout
usa scope local. Redirects fijos, mensajes en espanol y sin credenciales en el
estado del cliente. Diseno y mocks publicos intactos.

Archivos: apps/web/app/(auth), features/auth, lib/api/private-profile.ts,
script/dependencia web, packages/validation y lockfile. Nueva dependencia
Zod 4.6.7 en validation. Detalle y decisiones en docs/18, convenciones en
docs/06 y docs/07.

Validacion: lint/tipos de web y validation, 47 pruebas web simuladas y build web
correctos. Build requirio ejecucion fuera del sandbox por el puerto interno de
Turbopack. Smoke HTTP del build: login privado/no-store/noindex y paginas
publicas 200; Next aborta Server Actions con Origin ajeno (500 nativo de Next).
Formulario comprobado en Safari de escritorio, sin introducir credenciales.
Sin pruebas con cuentas reales, correos, escrituras de perfiles ni cambios de
DB, Supabase, .env o red. No se repitieron pruebas de API al no modificarla.

Siguiente tarea propuesta: 10, registro y confirmacion de correo, despues de
revision, commit del propietario y autorizacion. Phase 5 sigue abierta; las
pruebas reales de integracion siguen pendientes.

## Entrega de tarea 10: implementacion local de registro/confirmacion

Tarea 9 integrada en 2ec4a8c. El propietario autoriza continuar y reconfirma
Confirm email activado y Site URL http://localhost:3000. Registro y confirmacion
implementados; la tarea 10 sigue abierta por revision, plantilla remota y prueba
real autorizada. No se han creado cuentas, enviado correos o escrito perfiles.

Archivos: nuevas pagina /registro y ruta /auth/confirmar, features/auth (cliente
sin persistencia, logica, accion, formulario, plantilla y tests), schemas
compartidos, next.config.js y docs/AGENTS. Sin nuevas dependencias, .env o cambios
API/DB. Minimo 8 para password de registro; login conserva su contrato anterior.
El registro no escribe cookies ni asume sesion. Confirmacion email TokenHash
con cookies SSR y 303 relativo fijo; perfil mediante Continuar de tarea 9.
Logs Next sin query de confirmacion ni argumentos de Server Functions.

Validacion: web y validation lint/check-types, build web y 60 pruebas simuladas
correctos (13 nuevas). Smoke del build: registro 200, noindex/cache privada,
enlaces invalidos 303 sin cookies, errores espanoles y CSRF abortado por Next;
login y publico 200. Servidor temporal cerrado. No prueba visual nueva ni
integracion real; no se repiten tests API/DB al no modificar esos workspaces.
Detalles, decisiones, artefacto de plantilla y pasos pendientes en docs/18.
El propietario crea/sube el commit. No pasar automaticamente a tarea 11 ni cerrar
Phase 5; primero completar las evidencias de tarea 10 con autorizacion expresa.

## Bloqueo de plantilla en Supabase Free

Tarea 10 integrada en 577c4b8. Propietario autoriza plantilla y un registro/envio
real; aun no realizados. Dashboard inspeccionado en Safari: Confirm sign up
solo permite la plantilla predeterminada con ConfirmationURL y bloquea edicion
sin SMTP propio/Pro. No se cambia de plan ni proveedor; no hay envios ni cuentas.
Preflight local correcto: web/API 200, DB local accesible y cero perfiles.
El propietario debe decidir entre adaptar el contrato a PKCE con SMTP incluido
(cero servicios nuevos, enlace en mismo navegador) o estudiar SMTP gratuito
manteniendo TokenHash. Cualquier adaptacion se documenta y prueba antes de enviar.
Evidencias y fuentes en docs/18. Tarea 10 y Phase 5 siguen abiertas.

## Adaptacion PKCE autorizada e implementada (31 de octubre de 2026)

Se conserva SMTP incluido y plantilla predeterminada. Registro usa SSR con
adaptador filtrado: solo cookie verifier de una hora, sin leer/escribir sesiones.
emailRedirectTo fijo al callback local aprobado. Confirmacion valida code y usa
exchangeCodeForSession; sin TokenHash/verifyOtp alternativo ni fallback implicit.
Requiere abrir el enlace en el mismo navegador/dispositivo con cookies intactas.

Codigo en registration-client.ts, registration.ts, schema compartido, copy de
/registro y tests asociados. Web/validation lint/check-types y build correctos;
62 pruebas web y smoke HTTP correctos. SDK real con fetch simulado verifica
challenge S256, ausencia de sesion prematura, otro navegador denegado, canje,
limpieza de verifier y replay rechazado. No evidencia de cuenta/correo reales.

Sin Dashboard, SMTP/plan, .env, dependencias, API/DB, migraciones o usuarios nuevos.
Cambios documentales del bloqueo anterior preservados. Contrato/evidencias en
docs/18 y convenciones en docs/06/07. Plantilla HTML solo referencia futura.
Pendiente revision/commit antes del unico registro real ya autorizado. No pedir
password/tokens en chat ni repetir autorizacion para el mismo alcance. Tarea 10
y Phase 5 siguen abiertas; tarea 11 requiere revision y autorizacion propias.

## Observacion del registro real (31 de octubre de 2026)

PKCE integrado en 955eebe y validado por el propietario. El propietario registra
dos cuentas por su cuenta, A confirmada y B pendiente de verificar; el agente no
crea/envia otra. Dashboard muestra A con ultimo login y B Waiting for verification.
Safari /login muestra sesion y perfil preparados. DB local: un perfil USER de A,
cero perfiles de B, comprobados mediante consultas parametrizadas READ ONLY.
No se guardan emails/identificadores personales. Sesion y cuentas conservadas.

El propietario confirma expresamente que A se creo desde /registro y que, al
abrir el enlace en ese Safari, llego autenticado sin volver a introducir password.
El recorrido PKCE queda corroborado por el propietario; sesion/perfil son
evidencia directa adicional del agente. B pendiente y sin perfil
no demuestra aun rechazo de login o aislamiento de sesiones. Sin correos nuevos,
logout, renovacion forzada, ADMIN, cambios de codigo o configuracion; sin repetir
tests/build. Evidencias/limites en docs/18. Evidencias de tarea 10 listas para revision. Phase 5 sigue abierta y la tarea 11
requiere autorizacion separada.

## Tarea 11 activa: comprobaciones de sesiones y permisos

Autorizada tras 457c5a8. En curso: logout real observado en Safari y formulario
anonimo persistente al recargar. API sin bearer devuelve 401. Diagnostico local
loopback en puerto 3196 confirma ausencia de sesion, con Origin ajeno denegado
403. No hay cambios de roles, correos, cuentas o configuracion.

Nuevo test SDK real con transporte simulado verifica renovacion de JWT ES256,
uso del bearer nuevo en perfil y logout sin renovacion posterior. Herramienta
manual en apps/web/features/auth/tests/manual-auth-server.mjs permite consultar
estados HTTP reales con cookies de Safari sin mostrar credenciales ni crear
perfiles; no es una ruta de producto ni se despliega. Cerrar al terminar.
63 pruebas web, 105 unitarias y 32 HTTP API; web/API lint/tipos/build correctos.
Pendiente login manual con cuenta confirmada, comprobacion USER/ADMIN real,
renovacion/aislamiento remotos y cierre expreso. ADMIN requiere autorizacion
propia sobre el perfil local confirmado. Detalles y limites en docs/18.

## Tarea 11: permisos y renovacion reales observados

Login real A observado: perfil HTTP 200 y correspondiente a la identidad,
ADMIN 403 con USER. Propietario autoriza ADMIN temporal para ese unico perfil
LOCAL: HTTP 200, restauracion USER y HTTP 403 sin nuevo login; lectura final
confirma un perfil USER, cero ADMIN. Se actualiza updatedAt durante esos cambios;
no promocion permanente ni cambios de Supabase Auth.

Diagnostico temporal anade POST /renovar con Origin exacto, cookie jar por
peticion y Set-Cookie acumulados. Renovacion real observada con access token
nuevo, claims validos, perfil 200 y ADMIN 403; /login conserva sesion. Origin
ajeno/ausente/null se rechaza 403. Referrer-Policy same-origin solo en esta
herramienta permite POST de Safari; callback del producto sigue no-referrer.

Ventana privada Safari preparada en /login, anonima e independiente de sesion
A normal. Pendiente login manual con B sin confirmar y aislamiento completo;
no confirmar/enviar/borrar B sin tarea expresa. Renovacion automatica por Proxy
sigue probada con simulaciones; la real observada es POST explicito del SDK.
Sin emails nuevos ni nuevos usuarios. Tarea 11/Phase 5 abiertas. Detalle docs/18.

## Tarea 11: intento B rechazado y confirmacion B autorizada

Intento de login B sin confirmar en privado rechazado con mensaje generico,
sin sesion ni perfil; A mantiene sesion normal despues de recargar. DB local
sigue con un USER y cero ADMIN; B sin perfil. No se inspecciono el codigo interno
de Auth, por lo que no se distingue solo por UI entre falta de confirmacion y
password incorrecto. No se repiten pruebas ni se muestran secretos.

El propietario tiene el correo existente de B y autoriza su confirmacion para
comprobar aislamiento con dos usuarios autenticados. Debe abrir el enlace en
Safari normal donde registro B; esa ventana pasara a B. Posteriormente se usara
A en privada. Sin reenvio, alta adicional ni confirmacion desde Dashboard.
Diagnostico incluye etiquetas efimeras Cuenta 1/Cuenta 2 y perfil coincide con
sub, sin UUID/email/token; sigue abierto hasta completar pruebas. Pendiente
confirmacion B, su perfil y observacion de ambos contextos. Phase 5 abierta.

## Estado actual de B: confirmada, pendiente login privado

El enlace existente de B devuelve error generico del callback, pero Dashboard
Overview confirma email verificado el 31 de octubre a las 02:16 y sin ultimo
login. No reenviar: el correo ya esta confirmado. A sigue autenticada en normal,
con perfil propio 200 y ADMIN 403; formulario privado preparado para login B.

SDK instalado elimina verifier pendiente al guardar/cerrar sesion. La secuencia
de logout/login/refresh de A pudo borrar el verifier del registro B; no se han
inspeccionado cookies historicas ni causa interna unica. Se documenta el efecto
y se cubre su eliminacion en el test de renovacion SDK. No cambio de producto
ni bypass de confirmacion. Nueva ruta manual: A normal, B login privado con
password; dos perfiles/contextos y aislamiento siguen pendientes. Docs/18.

## Estado final de tarea 11: listo para revision

A normal y B privada autenticadas concurrentemente, cada una con perfil propio
HTTP 200 y ADMIN 403, etiquetas efimeras diferentes. Logout B no cierra A.
Consulta READ ONLY final: 2 perfiles/2 identidades, uno por A/B, 2 USER, 0 ADMIN.
Diagnostico temporal cerrado y puerto 3196 verificado sin servicio. Sesion A
conservada, B cerrada. Sin nuevos correos o cambios de roles despues de restaurar.

Registro/PKCE, login/logout, renovacion real explicita, permisos y aislamiento
verificados con los limites de la matriz consolidada en docs/20. 63 web,
105 unitarias y 32 HTTP API, web/API lint/tipos/build correctos. Tarea 11 entregada
para revision/commit; Phase 5 abierta hasta cierre expreso. No iniciar Phase 6.
Codigo de tarea 11: test SDK real y helper manual aislado; sin cambios de producto,
API, Prisma, .env, manifests, dependencias, mocks o diseno. Docs/07, 12, 18, 19,
20 y AGENTS reconciliados; los apartados anteriores son evidencias cronologicas.

## Inicio recomendado para un chat nuevo

```md
Read AGENTS.md, docs/15-current-status.md, docs/20-phase-5-validation.md and the task-specific documentation before changing code.

Phase 4 is integrated through PR #7 (b324cd5). Phase 5 is active on feature/Phase-5_auth_foundation and awaits owner review/commit of task 11 and explicit phase closure; do not start Phase 6 implicitly. Tasks 8/9/10 were committed in 9a2c3ef, 2ec4a8c and 577c4b8; PKCE adaptation is 955eebe, real registration evidence 457c5a8. Follow docs/18 for chronology and docs/20 for the consolidated evidence and limits.

Development uses native PostgreSQL 17.11 on the Mac, dedicated SCRAM cluster 127.0.0.1:55432/fallout_platform_dev owned by fallout_app. L1/L2 commits are 514fdb6/ffee55a. One schema/history, approved UserProfile migration 20261030000000_add_user_profile; no remote migration. Use pnpm --filter @repo/db db:local:start|stop|status, no global service/autostart. Local loopback sslmode=disable only; remote TLS strict. Supabase Auth/Storage remain remote. No Docker, local Supabase, root .env, paid services or CI setup.

Owner-created test accounts A/B are confirmed; final local DB has exactly two USER profiles, one per identity, zero ADMIN. Real registration/PKCE A is owner-confirmed; login/logout, protected profile reads, explicit SDK refresh accepted by Nest, A/B isolation and temporary authorized ADMIN 403-to-200-to-403 were directly observed. A stays signed in normal Safari; B is signed out in private. The temporary diagnostic localhost:3196 is stopped; its test-only script may be run manually as documented, never deployed. No personal identifiers/tokens in documentation.

Task 11 adds one real-SDK simulated-transport renewal/logout test and a manual loopback diagnostic under apps/web/features/auth/tests/. Validation passed: 63 web, 105 API unit, 32 API HTTP tests, web/API lint/types/build and public HTTP/CORS smoke. Proxy automatic expiry renewal and some invalid/expired/replayed callback cases are simulated, not all reproduced remotely; real refresh was explicit. B email was confirmed despite a failed PKCE return, then normal password login worked; SDK save/remove session clears pending verifiers, so complete each signup before testing other auth flows in that context. No automatic resend or auth bypass.

Never request passwords/tokens in chat; owner enters them in the web. New users/emails, remote config, migration or role promotion need scoped authorization. No permanent ADMIN exists or is authorized. Keep Spanish public design, typed mocks, REST/Nest business authorization, shared types/validation and one Prisma history. Work one task at a time; owner commits/pushes. Before production separately prepare HTTPS origins/redirects, SMTP/delivery, remote DB/TLS/migrations/RLS/ACL/Data API and deployment checks. WARP/hosts/keychain changes were not performed and must not resume implicitly.
```
