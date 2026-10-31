# 19. PostgreSQL local para desarrollo

## Decision y estado

Decision del propietario, 30 de octubre de 2026: desarrollar en el Mac con
PostgreSQL nativo local y coste cero de servicios adicionales. Supabase
PostgreSQL se conserva como destino previsto de produccion. Supabase Auth y
Storage siguen remotos en el plan gratuito, dentro de sus limites; no se crea
Supabase local. Next.js, NestJS, Prisma y los packages existentes se mantienen.

Estado actual: L1 integrada en 514fdb6; L2 aplicada y verificada en PostgreSQL
17.11 local, integrada en ffee55a. UserProfile/UserRole existen; L2 verifico cero
perfiles entonces. Validacion real de Auth actual: dos perfiles USER, cero ADMIN.
Tarea 8 integrada en 9a2c3ef y tarea 9 en 2ec4a8c. Tarea 10 registro/confirmacion
integrada en 577c4b8 y adaptacion PKCE en 955eebe, con evidencias en 457c5a8.
Tarea 11 revisada/subida en b3aeb6d: dos perfiles propios, renovacion/login/logout y
permisos verificados; ADMIN temporal autorizado y restaurado, sin ADMIN
permanente. Phase 5 cerrada expresamente por el propietario el 31 de octubre
de 2026; PR pendiente de merge confirmado. Plantilla predeterminada sin cambios;
matriz/limites aceptados en docs/20. Migracion remota aplazada;
Auth/Storage siguen remotos. Sin CI ni cambios a WARP, hosts, certificados o
llavero. Resultados y uso diario al final.
La decision inicial se documento en 326ee0e antes de implementar esta entrega.

## Motivo y antecedentes

En Phase 4, Direct con WARP y una entrada temporal de hosts paso las pruebas;
se conservan esas evidencias en docs/17. En Phase 5, Direct:5432 agota timeout,
incluso tras reconectar WARP y reiniciar. Node conecta por session pooler con
TLS autorizado, pero el motor Prisma nativo de macOS rechaza su certificado
(P1011), consistente con el diagnostico previo de docs/14. No esta determinada
la causa del timeout Direct. El propietario confirma ausencia de restricciones
y bloqueos IP en Dashboard y que probar otra red no resolvio el problema.

No se deduce incompatibilidad general del stack con macOS. El entorno local
permite continuar sin depender de resolver ahora la conexion DB remota. No se
contratan complementos, runners ni servicios. GitHub Actions queda sin preparar
y sin ejecutar; su posible uso futuro requiere tarea y control de coste propios.

## Responsabilidades por entorno

| Componente | Desarrollo objetivo | Produccion prevista |
| --- | --- | --- |
| Web Next.js | Mac, localhost:3000 | Hosting por decidir |
| API NestJS | Mac, localhost:3001 | Hosting por decidir |
| PostgreSQL de aplicacion | Servidor nativo en loopback del Mac | Supabase PostgreSQL |
| Prisma CLI y runtime | Base local dedicada, mismo destino | Credenciales y conexiones propias del entorno remoto |
| Identidad y sesiones | Supabase Auth remoto | Supabase Auth; proyecto/configuracion a confirmar |
| Imagenes y archivos | Supabase Storage remoto, con permisos vigentes | Supabase Storage, configuracion a validar |

El desarrollo no sera completamente offline: Auth, JWKS, correo y Storage
siguen necesitando Internet. No instalar auth.users ni emular servicios Supabase
en PostgreSQL local. UserProfile almacena el UUID de identidad verificada sin
FK a auth.users. NestJS sigue siendo responsable de autorizacion y roles.
Los datos locales no se sincronizan automaticamente con Supabase. La promocion
de roles y las identidades deben verificarse por entorno; un ADMIN local no
acredita un ADMIN de produccion. No copiar perfiles o contenido de pruebas al
desplegar. La migracion de datos, si llegara a ser necesaria, sera otra tarea.

## Contrato de entorno y migraciones

- Sin Docker, Supabase local ni .env raiz. Conservar entornos por app/package.
- apps/api/.env: DATABASE_URL apuntara a la DB local. SUPABASE_URL seguira
  apuntando al proveedor remoto de identidad.
- packages/db/.env: DATABASE_URL para runtime y DIRECT_URL para Prisma CLI
  apuntaran a esa misma DB local, identificada antes de cualquier escritura.
- apps/web/.env.local: API local y URL/clave publica Supabase existentes;
  no incluir contrasenas de PostgreSQL ni claves privilegiadas.
- Definir nombre de DB, puerto y rol dedicados; escuchar solo en loopback,
  autenticar por credenciales y no cambiar servicios o bases ajenos. Verificar
  version PostgreSQL compatible con el destino remoto antes de elegirla.
- Documentar la politica de transporte local en la tarea de preparacion. La
  conexion remota conserva TLS estricto y CA/hostname verificados. No usar
  NODE_TLS_REJECT_UNAUTHORIZED=0 ni desactivar verificaciones globalmente.
- Un unico schema e historial Prisma en packages/db. Conservar sin cambios la
  migracion 20261030000000_add_user_profile del commit 73791bf; no crear una
  variante local, baseline ficticio, reset o db:push para sortear errores.
- Esa migracion habilita RLS y revoca privilegios a PUBLIC, anon y authenticated.
  PostgreSQL generico no crea esos roles Supabase: preparar roles SQL locales
  anon/authenticated NOLOGIN, sin privilegios especiales, en una tarea explicita.
  No representan cuentas Auth ni roles de aplicacion USER/ADMIN/EDITOR/MODERATOR.
- Revisar el propietario de tabla y rol de Nest: RLS sin FORCE permite acceso
  del owner; no conceder superusuario/BYPASSRLS por comodidad. La eleccion de
  roles y permisos minimos se concretara y verificara antes de migrar.
- Migracion local y aplicacion remota son operaciones distintas, cada una con
  preflight del destino. La autorizacion remota previa no obliga a continuarla
  ahora: queda aplazada por esta decision. No usar URLs remotas como fallback.

## Secuencia de continuacion

Ejecutar una tarea por revision; el propietario hace los commits y autoriza la
siguiente. Este documento no ejecuta ni autoriza implicitamente los comandos.

| Paso | Alcance propuesto | Aceptacion |
| --- | --- | --- |
| L1. Preparar PostgreSQL nativo | Version compatible; instalacion local via Homebrew u opcion nativa revisada; base/roles dedicados; ejemplos/entorno por package y API; guia de arranque/parada. Sin migrar. | Inventario previo, loopback, autenticacion, URLs coherentes, SELECT 1 CLI/runtime y provider Nest; sin cambios a Supabase o servicios ajenos. |
| L2. Aplicar migracion local | Preflight y migrate deploy del SQL aprobado; provision local de roles contemplada en L1. Sin perfiles/usuarios de prueba. | Estado/checksum Prisma, columnas/defaults/enum/unique, RLS, cero politicas cliente, privilegios efectivos anon/authenticated y acceso runtime Nest; sin datos creados. |
| L3. Continuar Phase 5 | Tarea 8 de docs/18 despues de L1/L2 revisadas; despues tareas Auth restantes por separado. | Sincronizacion, roles, formularios y pruebas de integracion local con identidad remota; usuarios/correos reales solo autorizados expresamente. |
| R. Preparar produccion mas adelante | Nueva tarea: elegir entorno de ejecucion, destino DB/identidad, revisar coste, secretos, TLS y despliegue. | Preflight remoto, aplicar historial aprobado y verificar RLS/ACL/Data API, runtime desplegado, flujos Auth y Storage. |

Concretar archivos permitidos de L1 antes de implementar; ejemplos de entorno,
configuracion/scripts DB estrictamente necesarios y documentacion. Excluidos:
contenido, CRUD, seeds, mocks/diseno publico, cambios de JWT/roles de negocio,
servicios remotos y cambios de red/llavero. L1 no incluye desinstalar WARP.

No validar permisos de Supabase Data API usando solo PostgreSQL local: puede
verificarse SQL por SET ROLE y consultas de privilegios, pero el rechazo HTTP
de Data API requiere el entorno remoto. No afirmar aislamiento o flujo completo
hasta que se haya probado en su entorno correspondiente.

## WARP y entrada temporal de hosts

El entorno objetivo local no depende de WARP. Auth y Storage usan HTTPS normal;
no necesitan el tunel IPv6 usado para Direct. El propietario puede desactivarlo.
No se ha desinstalado ni se ha retirado la entrada de hosts. Tras validar L1/L2,
una tarea separada podra revisar y limpiar con el propietario exclusivamente
la entrada temporal y los restos documentados, preservando otros ajustes. No
asumir que desinstalar WARP elimina hosts ni que helpers en /private/tmp sobrevivan
al reinicio. No modificar red o llavero automaticamente.

## Criterios de cierre y futura produccion

Phase 5 continua abierta. Sus criterios de Auth/roles se verificaran en el
entorno de desarrollo acordado, con L1/L2 como prerequisitos y cierre expreso
del propietario. La tarea 7 remota queda aplazada, sin marcarla completada ni
usar exito local como evidencia remota. No se exige reparar Direct desde este
Mac para continuar desarrollo; la validacion remota pasa a ser requisito previo
a produccion, aunque se complete Phase 5 localmente.

Una CI Linux o un equipo Windows/Linux pueden evaluarse despues; no garantizan
por si solos conectividad ni TLS. El despliegue debe aplicar las migraciones,
configurar secretos/URLs y validar acceso de API, RLS/ACL/Data API, Auth/correo,
Storage y datos iniciales autorizados. No basta con subir el codigo. El Mac no
tendra que acceder a la DB remota si el entorno de despliegue puede hacerlo.


## L1: alcance autorizado para preparacion

El propietario autoriza continuar con L1 tras el commit documental 326ee0e.
Archivos permitidos: packages/db/.gitignore, package.json, .env.example y
scripts/local-postgres.mjs; apps/api/.env.example; entornos reales ignorados de
DB/API y estado local ignorado .local-postgres; AGENTS.md y docs/14, 15, 18, 19
para registrar resultados; README y docs/01, 03, 04, 07, 12 para actualizar
marcadores de estado relacionados. Instalacion Homebrew de PostgreSQL 17 y cluster
exclusivo del proyecto autorizados en esta tarea; no servicio global/autoinicio.
No cambios en schema/migracion, web, Auth, dependencias JS, red o Supabase.

## Resultado de L1: preparado, sin migraciones

Entrega del 30 de octubre de 2026, pendiente de revision del propietario.
Se verifico por SHOW server_version remoto (solo lectura, TLS autorizado) que
Supabase usa PostgreSQL 17.11. Se instalo postgresql@17 17.11_1 con Homebrew.
El catalogo antiguo no reconocia la formula: se actualizo Homebrew/catalogo,
sin brew upgrade general. Homebrew instalo las dependencias necesarias y
actualizo gettext de 0.22.4 a 1.0 como dependencia. No hay nuevas dependencias
JavaScript ni cambio del lockfile del monorepo.

### Estado local y acceso

- Cluster exclusivo: packages/db/.local-postgres/data, ignorado por Git; version
  17.11, UTF-8, locale en_US.UTF-8 y checksums de datos activados.
- Escucha solo 127.0.0.1:55432. Sockets Unix en .local-postgres/socket con permisos
  0700. Sin listener LAN/IPv6 ni autoinicio; no se uso brew services start.
- Base fallout_platform_dev y schema public propiedad de fallout_app. LOGIN con
  contrasena aleatoria local, sin SUPERUSER, CREATEDB, CREATEROLE, REPLICATION ni
  BYPASSRLS. Puede migrar y usar sus propias tablas; RLS sin FORCE permite al
  owner operar, y Nest conserva la autorizacion de negocio.
- anon/authenticated son roles SQL NOLOGIN y sin privilegios especiales. No
  crear identidades Auth ni confundirlos con los roles USER/ADMIN del modelo.
- fallout_local_admin administra exclusivamente este cluster; no usarlo en las
  URLs de API/Prisma. Las reglas pg_hba solo admiten al administrador y al rol
  de aplicacion en su DB por loopback, con scram-sha-256 y sin trust. Acceso
  PUBLIC revocado sobre la DB y schema public.
- Transporte sin TLS solo en este loopback local (sslmode=disable, ssl=off en
  este cluster). SCRAM verifica contrasenas, no cifra el trafico de aplicacion.
  No reutilizar esa configuracion en redes/remoto. TLS remoto sigue estricto;
  no se modifican verificaciones globales, CA, llavero o WARP.

Homebrew creo tambien su cluster predeterminado en /opt/homebrew/var/postgresql@17
como parte de postinstall. No esta arrancado ni se usa; no ejecutar brew services
start postgresql@17 para iniciar el cluster del proyecto. No se modificaron otros
servicios. Los comandos siguientes controlan solo el cluster dedicado.

### Uso diario desde la raiz del repositorio

```bash
pnpm --filter @repo/db db:local:start
pnpm --filter @repo/db db:local:status
pnpm dev
```

Para detener la DB al terminar:

```bash
pnpm --filter @repo/db db:local:stop
```

Start/stop son idempotentes. Despues de reiniciar el Mac hay que ejecutar start;
no se instalo LaunchAgent/autoinicio. No se necesita WARP para esta DB local.
Los scripts usan Homebrew postgresql@17 y un cluster ya preparado; no instalan,
inicializan, modifican URLs ni ejecutan migraciones. Status devuelve un mensaje
activo/detenido; si falta PG_VERSION o no es 17, rechaza la operacion. No usar
estos scripts con un cluster distinto ni cambiar su directorio de datos.

### Entorno real y copias privadas

DATABASE_URL de API y DATABASE_URL/DIRECT_URL de packages/db apuntan a la misma
DB/rol local. URL, clave publica, bucket y configuracion Auth de Supabase se
conservan; apps/web/.env.local no cambio. Ejemplos publicos usan PASSWORD como
placeholder; las contrasenas reales aleatorias solo estan en archivos ignorados.

Antes del cambio se guardaron copias exactas del entorno anterior en
packages/db/.local-postgres/previous-env/api.env y db.env, con modo 0600. Son
copias sensibles: no versionar, publicar ni restaurar automaticamente. La
contrasena del administrador esta en .local-postgres/admin-password (0600);
los .env reales tambien tienen modo 0600 y el directorio local modo 0700.
No copiar credenciales aqui. Nunca usar esos backups como fallback remoto.

El cluster, logs, sockets y copias de entorno no estan en Git y no se recrean
con pnpm install o con los scripts start/stop. No borrar .local-postgres ni
usar git clean -fdx sin revisar/preservar primero datos y copias. Para preparar
otro checkout/equipo, repetir una tarea L1 revisada: instalar major compatible,
initdb con SCRAM y administrador separado, configurar loopback/puerto, crear
roles/base/schema y generar nuevas credenciales locales. No copiar el directorio
de datos de un servidor activo. No se anade provision automatico en esta entrega.

### Validaciones ejecutadas

| Comprobacion | Resultado |
| --- | --- |
| Version remota y local | 17.11 ambas; remoto solo SHOW server_version |
| Lint, check-types y build DB/API | Correcto |
| Prisma validate/generate | Correcto |
| pnpm --filter @repo/db db:check | SELECT 1 correcto por Prisma CLI local |
| pnpm --filter @repo/db db:check:runtime | SELECT 1 correcto por factoria/adapter local |
| Provider Nest compilado | SELECT 1, identidad local, reutilizacion y cierre correctos |
| Stop/start repetidos y status | Correcto; cluster queda activo |
| HBA y roles | Sin trust; SCRAM; contrasena incorrecta rechazada con 28P01; roles sin privilegios especiales |
| Listener efectivo | Solo 127.0.0.1:55432 |
| Destino y entorno | URLs iguales; resto de variables API/DB identicas a sus copias previas |
| Estado DB | Public sin tablas, sin UserProfile, UserRole ni _prisma_migrations |
| Pruebas API existentes | 69 unitarias (6 suites), 8 e2e (2 suites) correctas; DB simulada en tests |
| Secretos y diff | Archivos locales ignorados, permisos 0600; git diff --check correcto |

Las pruebas con sockets se ejecutaron con permiso fuera del sandbox. Runtime
Node 24.15.0; no se repiten con Node 20. No se modifico web ni se probaron usuarios,
sesiones o correos reales. No hubo escrituras remotas: solo provision local de
cluster/base/roles. Schema y migracion aprobados siguen intactos.

La siguiente tarea es L2, aplicar el SQL aprobado exclusivamente a la base local
tras revision y autorizacion. L1 no acredita constraints de UserProfile, RLS de
esa tabla, roles de negocio ni Supabase Data API. WARP/hosts quedan intactos;
limpieza eventual separada. Phase 5 permanece abierta.


## Resultado de L2: migracion local aplicada y verificada

El propietario autoriza continuar tras 514fdb6 (L1). Alcance: aplicar solo
20261030000000_add_user_profile al cluster local y actualizar estos registros,
AGENTS.md, README y los marcadores de estado en docs/01, 03, 04, 07, 12, 14, 15,
18. Sin cambios de codigo, schema, SQL aprobado, dependencias o entorno.

### Preflight y aplicacion

- Arbol Git limpio al comenzar; una unica migracion, SQL identico byte a byte
  al commit aprobado 73791bf. El comentario inicial sobre aplicacion remota se
  conserva por integridad; la tarea L2 de este contrato autoriza su uso local.
- DATABASE_URL de API/DB y DIRECT_URL de CLI iguales; hostname exactamente
  127.0.0.1, puerto 55432, DB fallout_platform_dev y usuario fallout_app. Se
  validaron tambien identidad DB real y listener loopback, sin fallback remoto.
- Roles SQL locales presentes, sin SUPERUSER/CREATEDB/CREATEROLE/BYPASSRLS;
  anon/authenticated NOLOGIN; schema public accesible al propietario fallout_app.
- Antes de aplicar: public sin tablas; UserProfile, UserRole e historial ausentes.
  migrate status devuelve exit 1 por la unica migracion pendiente (esperado).
- prisma migrate deploy aplica el SQL aprobado, exit 0. No migrate dev, shadow
  database, reset, baseline, db:push ni alteracion manual del esquema.

### Verificacion realizada

| Comprobacion | Resultado |
| --- | --- |
| migrate status despues | Exit 0, esquema al dia |
| migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script --exit-code | Exit 0, diff estructural vacio; no verifica RLS/ACL |
| Historial Prisma | Una migracion finalizada, sin rollback, un paso aplicado; checksum SHA-256 identico al SQL versionado |
| Columnas | Ocho campos previstos, UUIDs, nullable solo username/displayName/avatarUrl y timestamptz(3) |
| Defaults y enum | USER; createdAt CURRENT_TIMESTAMP; enum USER/ADMIN/EDITOR/MODERATOR en orden |
| Identificador y fecha actualizacion | id/updatedAt sin default SQL; siguen administrados por Prisma como define el schema |
| Constraints | PK id; indice unico supabaseUserId valido, inmediato, una columna y sin predicado |
| RLS | Activo, sin FORCE; owner fallout_app; cero politicas cliente |
| Permisos efectivos | PUBLIC sin grants de tabla; anon/authenticated sin SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER/MAINTAIN ni privilegios de columna |
| Simulacion SQL | SET LOCAL ROLE anon/authenticated y SELECT LIMIT 0 rechazados con 42501 en transacciones read only, luego rollback |
| Nest compilado / Prisma real | findMany de UserProfile consultando los ocho campos devuelve 0 filas; identidad local, cliente compartido y cierre correctos |
| Herramientas | Prisma validate/generate; lint, check-types y build de DB/API correctos |
| Diff | SQL, schema, web y lockfile intactos; git diff --check correcto |

La unicidad/defaults se verifican en catalogos, sin intentar insertar duplicados
ni crear perfiles de prueba. El control SET ROLE puede ser rechazado por USAGE
de schema ademas de permisos de tabla; estos ultimos se comprobaron por separado
con has_table_privilege y has_any_column_privilege. No se concedieron permisos
para hacer la prueba. No se probaron endpoints ni Supabase Data API; no existe
PostgREST en este cluster local. Tampoco se acredita autorizacion de negocio.

No se crean usuarios Auth, perfiles, sesiones, correos, seeds o contenido. Las
unicas escrituras son el DDL de la migracion y su historial Prisma local. Sin
consultas/escrituras remotas, cambios de .env, WARP, hosts, certificados o llavero.
Pruebas de verificacion temporales fuera del repo con salida sanitizada; consultas
y CLI locales fuera del sandbox. Node 24.15.0. No se repiten unitarias/e2e ya
aprobadas en L1, pues no cambia codigo; se verifica el modelo real desde Nest.

L2 queda terminada, pendiente de revision. La tarea 7 remota sigue aplazada hasta
preproduccion. Siguiente tarea propuesta: tarea 8 de docs/18, sincronizacion
idempotente y permisos en Nest, con sus pruebas propias y autorizacion separada.
No se inicia esa implementacion en esta entrega. El propietario crea/sube el
commit; Phase 5 sigue abierta.


## Continuacion tras L2

L2 integrada en ffee55a. La tarea 8 implementa sincronizacion y autorizacion en
Nest con DB/JWKS simulados en pruebas, sin crear perfiles reales ni cambiar el
cluster. No modifica la preparacion local ni aplica otro SQL. Contratos,
resultados y limitaciones en la entrega de tarea 8 de docs/18, integrada en
9a2c3ef. Tarea 9 implementa login/logout web y reintento de sincronizacion,
verificados con SDK/API simulados, sin usuarios ni escrituras reales de DB.
Tarea 9 integrada en 2ec4a8c. Tarea 10 registro/confirmacion implementada con
simulaciones y sin escrituras reales; pendiente de revision, plantilla y registro
real autorizado. No exige otra migracion. Phase 5 sigue abierta.
