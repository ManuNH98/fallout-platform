# 19. PostgreSQL local para desarrollo

## Decision y estado

Decision del propietario, 30 de octubre de 2026: desarrollar en el Mac con
PostgreSQL nativo local y coste cero de servicios adicionales. Supabase
PostgreSQL se conserva como destino previsto de produccion. Supabase Auth y
Storage siguen remotos en el plan gratuito, dentro de sus limites; no se crea
Supabase local. Next.js, NestJS, Prisma y los packages existentes se mantienen.

Esta entrega solo documenta el cambio. No se ha instalado PostgreSQL, creado
una base/roles, cambiado .env, aplicado migraciones, configurado CI ni alterado
WARP, hosts, certificados o llavero. La configuracion real anterior sigue
apuntando a Supabase hasta que una tarea posterior la cambie y valide.

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
