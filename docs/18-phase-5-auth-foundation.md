# 18. Phase 5: Auth foundation

## Estado y alcance

Contrato y plan de ejecucion del 23 de octubre de 2026. Phase 4 esta integrada
mediante PR #7, merge `b324cd5`; Phase 5 trabaja en
`feature/Phase-5_auth_foundation`. El contrato describe el objetivo; solo las
entregas registradas al final acreditan implementacion parcial.

La tarea 1 fue documental: solo docs/04, docs/05, docs/07, docs/15 y este
documento, sin cambios de codigo, dependencias, entorno, Dashboard, usuarios ni datos. Las
skills locales next-best-practices y nestjs-best-practices orientan el contrato;
prevalecen AGENTS.md y la arquitectura del proyecto. No se adopta el ejemplo
generico de emitir JWT propios: Supabase mantiene identidad y sesiones.

Incluye registro con email/password y confirmacion, login, logout local,
sesiones SSR, verificacion JWT en NestJS, perfil local, cuatro roles y un
endpoint de prueba exclusivo de ADMIN. Las pantallas usan espanol.

Excluye recuperacion de contrasena, OAuth, MFA, edicion de perfil, gestion de
usuarios, panel admin, contenido, CRUD y seeds. La ruta reservada
`/restablecer-contrasena` no obliga a implementarla en esta fase. Se mantienen
el diseno y los mocks publicos; sustituirlos sigue siendo Phase 7.

## Evidencias y decisiones pendientes

- El propietario confirma que `ECC (P-256)` aparece como Current el 30 de
  octubre de 2026. Una consulta GET de solo lectura al JWKS publico confirma
  una clave ES256/EC/P-256. El estado activo es evidencia del propietario; la
  publicacion de la clave es inspeccion del agente. No se han creado usuarios,
  obtenido secretos ni probado access tokens reales para esta comprobacion.
- Email, confirmacion, Site URL `http://localhost:3000` y redirects exactos
  `/auth/confirmar` y `/restablecer-contrasena` estaban preparados por
  confirmacion del propietario. Plantilla SSR y entrega siguen pendientes.
- SMTP incluido: la documentacion consultada limita destinatarios a miembros
  del equipo de la organizacion y permite actualmente 2 mensajes/hora, sin SLA
  y sujeto a cambios. Revisar limites antes del primer envio autorizado.
- Prisma CLI Direct requiere WARP y entrada temporal de hosts; runtime usa
  session pooler. Conservar TLS y las condiciones de docs/14 y docs/17.
- No hay modelos de aplicacion, migraciones ni integracion NestJS/@repo/db.
  Health solo acredita disponibilidad de la API.

## Contrato web y sesiones

Usar @supabase/supabase-js y @supabase/ssr. Mantener las variables publicas
existentes en apps/web/.env.local, sin secretos ni .env raiz. Crear factorias
en `apps/web/lib/supabase/client.ts` y `server.ts`; servidor por peticion,
sin estado de usuario global. El modulo servidor no se importa desde cliente.

SSR utiliza cookies y PKCE del SDK. Usar `await cookies()` y adaptadores
getAll/setAll. Server Components leen cookies; Server Actions y Route Handlers
pueden escribirlas. Next.js 16 usa `apps/web/proxy.ts` junto a app, sin src.
El proxy actualiza cookies de peticion y respuesta; redirecciones conservan
cookies y cabeceras de cache del resultado renovado. Limitar el matcher a
rutas Auth y privadas; home/wiki/juegos y assets mantienen su comportamiento.
No introducir lectura de sesion en el layout publico o raiz.

Usar getClaims para verificar identidad; getUser cuando se necesite estado
actual del usuario en Auth. getSession puede obtener el access token, pero no
acredita identidad. No almacenar respuestas personales ni Set-Cookie en cache
compartida; llamadas privadas a Nest con cache no-store. No serializar refresh
tokens ni sesiones en props o logs. El patron compartido del SDK necesita
cookies accesibles al navegador: no imponer HttpOnly que impida su renovacion.
Conservar atributos seguros, SameSite apropiado y Secure en HTTPS de produccion.

Las paginas publicas siguen funcionando sin variables Supabase; invocar una
factoria Auth sin configuracion completa produce error controlado en espanol.
No hay conexiones Auth durante build ni clientes creados al importar modulos.

| Flujo | Ruta y comportamiento previsto |
| --- | --- |
| Login | `app/(auth)/login/page.tsx`; Server Action valida email/password y llama signInWithPassword. Errores genericos, sin devolver password. |
| Registro | `app/(auth)/registro/page.tsx`; signUp, confirmacion obligatoria y estado revisa tu correo sin asumir sesion. No aceptar role ni supabaseUserId del formulario. |
| Confirmacion | `app/(auth)/auth/confirmar/route.ts`; plantilla con TokenHash, parametro token_hash y tipo email fijo. verifyOtp establece cookies y redirige a /login sin parametros sensibles; si ya existe sesion valida, login ofrece una accion Continuar para sincronizar. |
| Logout | Server Action o POST, signOut con scope local explicito, limpiar sesion y redirigir a /login. GET no cierra sesiones. |

La plantilla propuesta enlaza al origen local aprobado con
`/auth/confirmar?token_hash={{ .TokenHash }}&type=email`. Revisar y aplicar
manualmente solo en la tarea de confirmacion. No usar un destino next libre,
Host sin validar, fragments del flujo implicit ni callback generico inventado.
No implementar exchangeCodeForSession como segundo contrato sin una tarea que
lo necesite; el SDK conserva PKCE, y esta confirmacion usa verifyOtp.

Tratar enlaces ausentes, invalidos, caducados o usados con mensajes espanoles
sin filtrar detalles. No registrar la query de confirmacion ni incluirla en
analitica. Contemplar prefetch de proveedores de correo en la prueba manual.
Validar entradas tambien en servidor, proteger acciones frente a CSRF segun
el mecanismo Next elegido y evitar enumeracion de cuentas. No desactivar
confirmacion para facilitar pruebas.

El logout revoca la renovacion de la sesion elegida; un access token ya emitido
puede seguir siendo valido hasta expirar. No prometer revocacion instantanea
mediante verificacion JWT local ni anadir listas de revocacion en esta fase.

## Identidad y autorizacion API

Contrato ES256, con Current confirmado por el propietario y JWKS inspeccionado: jose con
createRemoteJWKSet y jwtVerify. JWKS en
`SUPABASE_URL/auth/v1/.well-known/jwks.json`, issuer
`SUPABASE_URL/auth/v1`, audiencia authenticated y algoritmo admitido ES256.
Derivar destinos de la URL configurada confiable, nunca del token. No obtener
claves privadas, JWT secret ni claves privilegiadas. No agregar fallback HS256
ni rotar claves automaticamente si la inspeccion contradice el dato del owner;
revisar el contrato antes de implementar.

Exigir firma, exp, sub UUID y claims de sesion de usuario; comprobar nbf cuando
exista. Rechazar anon, service_role, publishable keys, usuarios anonimos y
algoritmos no admitidos. El claim role=authenticated es de Supabase, no ADMIN.
Nunca confiar en role del frontend o user_metadata para permisos.

Mantener un resolvedor JWKS reutilizable, con timeout y cache acotados, recarga
ante kid nuevo y pruebas de rotacion. Considerar los 10 minutos de cache Edge
publicados por Supabase y documentar la ventana de revocacion. Si no se puede
verificar, no autorizar; distinguir token invalido (401) de indisponibilidad de
Auth/JWKS/DB (503) sin exponer errores internos.

SupabaseAuthGuard valida identidad y carga el perfil existente cuando proceda;
POST /auth/perfil permite identidad valida sin perfil. RolesGuard usa el rol
actual de PostgreSQL y deniega perfiles ausentes. @CurrentUser expone el perfil
local solo cuando existe; @Roles declara roles permitidos. No hay jerarquia
implicita que permita EDITOR o MODERATOR entrar en el endpoint ADMIN.

| Endpoint propuesto | Resultado |
| --- | --- |
| POST /auth/perfil | Identidad verificada; cuerpo vacio. Servicio crea o recupera perfil idempotentemente, devuelve perfil con HTTP 200. Solo esta operacion crea perfil. |
| GET /auth/me | Identidad verificada; devuelve perfil existente, 404 si falta. No crea datos durante lectura. |
| GET /admin/comprobacion | Identidad y perfil ADMIN; 200 con mensaje espanol, 401 sin identidad, 403 sin perfil o con otro rol. Sin panel ni operaciones administrativas. |

Tras login o la accion Continuar con sesion valida, Next hace POST /auth/perfil con
Bearer access token; si falla, no presenta el perfil como disponible. Una
sesion Supabase valida no garantiza que la API o la DB esten disponibles.
Ningun refresh token llega a Nest. Next puede comprobar acceso para navegar,
pero cada endpoint privado valida y autoriza tambien llamadas directas.
Los contratos de respuesta viven en packages/types, sin importar Prisma al
frontend. Las reglas de formulario compartidas viven en packages/validation.

## Perfil y persistencia minima

Seguir docs/04: UUID local, supabaseUserId UUID unico, role enum USER por defecto,
createdAt, updatedAt; username, displayName y avatarUrl opcionales. No guardar
password, refresh token ni copiar email innecesariamente. No modificar
schemas gestionados, auth.users ni introducir triggers para sincronizacion.

Upsert por identidad verificada, seguro frente a concurrencia; una repeticion
no cambia role ni campos existentes. No importar roles desde metadata. Primer
ADMIN mediante tarea manual expresamente autorizada sobre un perfil existente,
con identificador confirmado y verificacion posterior; sin seed ni endpoint
publico de promocion. EDITOR y MODERATOR existen, sin funciones posteriores.

Resolver primero consumo real de @repo/db: hoy exporta TypeScript y su build
no emite JS; Nest arranca desde dist. Revisar formato ESM/CommonJS, exportaciones,
generacion Prisma y Jest. Mantener una sola factoria y provider con cierre
ordenado. No mover DB a apps/api ni actualizar versiones sin necesidad.

Crear y revisar el artefacto de migracion separadamente de su aplicacion. No
usar migrate dev contra Supabase como generacion inocua: usa shadow database
y puede aplicar cambios o pedir reset. Preparar SQL sin conexion con Prisma 7,
revisar solo UserProfile/UserRole, RLS y privilegios. La tabla no sera accesible
por Data API al navegador: RLS sin politicas cliente y permisos minimos, sin
trasladar autorizacion de negocio a SQL. Comprobar el acceso del rol runtime.
Aplicar mediante Prisma Migrate solo en una tarea autorizada; sin reset,
db:push, seeds ni manipulacion de storage/auth.

## Secuencia de tareas

Ejecutar en orden, una entrega por revision. La numeracion es propia de este
documento. Cada fila permite ademas actualizar docs/15 y este registro para
resultados reales. Todo archivo no listado queda excluido; pnpm-lock.yaml
solo cambia al modificar dependencias autorizadas. Excluidos comunes: mocks,
diseno publico, secretos, entorno real, contenido, seeds y mutaciones de recursos externos.
Las mutaciones remotas de 7, 10 y 11 requieren autorizacion expresa; las lecturas JWKS/conectividad se acotan en su propia tarea.

| Tarea | Depende de | Archivos permitidos y dependencias | Aceptacion y pruebas |
| --- | --- | --- | --- |
| 1. Contrato documental (esta entrega) | Cierre Phase 4 | docs/04, 05, 07, 15, 18; sin dependencias | Coherencia, fuentes oficiales, diff limpio; sin implementacion. |
| 2. Factorias web | 1 revisada | apps/web/lib/supabase/client.ts y server.ts; lib/env.ts si necesario; manifest web y lockfile; pruebas locales asociadas | Solo @supabase/supabase-js y @supabase/ssr. Configuracion completa/ausente/parcial, adaptadores simulados y aislamiento servidor/cliente; checks web. Sin proxy, rutas ni sesiones reales. |
| 3. Renovacion SSR | 2 | apps/web/proxy.ts, lib/supabase/proxy.ts y pruebas | Cookies renovadas en peticion/respuesta/redirecciones, cache privada, matcher excluye publico; tests simulados de expiracion y errores; checks web. |
| 4. Verificador API | 1, Current confirmado y JWKS inspeccionado | apps/api/src/modules/auth/**, common/guards de identidad, config y pruebas, app.module.ts, manifest API/lockfile; ejemplo/Turbo solo si contrato cambia | jose justificado por JWKS. Tokens sinteticos ES256, exp/iss/aud/sub invalidos, otro algoritmo, kid desconocido, rotacion y timeout; checks y tests API. Sin DB/perfiles. |
| 5. Integracion DB/API | 1 | packages/db configuracion de build/exports y manifests; provider DB y configuracion compilacion/tests API; lockfile | Dependencia @repo/db workspace; consumo desde dist y Jest, generacion/cierre correctos; checks DB/API y prueba de solo lectura cuando se autorice. Sin modelos. |
| 6. Modelo y SQL revisable | 5 | packages/db/prisma/schema.prisma y artefactos de migracion | Solo UserRole/UserProfile; SQL, unicidad, RLS y permisos revisados; validate/generate y checks DB. Sin aplicacion remota. |
| 7. Aplicacion migracion | 6 revisada y autorizacion remota | Migracion aprobada y registro; destino remoto confirmado | Prisma Migrate con SQL aprobado, sin resets; verificar estructura, acceso runtime, rechazo Data API y estado. Sin usuarios ni perfiles de prueba. |
| 8. Sincronizacion y roles | 4, 5, 7 | modules/auth y users API; guards/decorators, modulo endpoint admin de prueba; packages/types; manifests/lockfile si necesario; pruebas | Upsert concurrente, USER por defecto, conservacion de ADMIN, 401/403/404/503 y matriz de roles; tests unitarios/e2e simulados y checks afectados. |
| 9. Login/logout | 3, 8 | apps/web/app/(auth)/login/** y layout Auth; features/auth/**; helper privado API; packages/validation; manifests/lockfile | Zod en package compartido y dependencias workspace justificadas; formularios espanoles, validacion servidor, errores, sincronizacion y logout local; checks web/packages y pruebas simuladas. Sin registros ni envios. |
| 10. Registro/confirmacion | 9; plantilla y destinatario autorizados | app/(auth)/registro/** y auth/confirmar/route.ts; features/auth/**, schemas/tests; plantilla remota solo autorizada | Sin sesion prematura, enlace correcto/invalido/caducado/reutilizado, sin redireccion abierta ni logs sensibles; simulaciones primero, unico registro/envio real autorizado despues. |
| 11. Integracion/cierre | 2 a 10 revisadas | Pruebas Auth y documentacion de estado; operacion ADMIN solo autorizada | Registro-confirmacion-login-renovacion-perfil-API-logout, aislamiento entre usuarios, USER denegado y ADMIN admitido; mocks sin regresion; evidencias con limites y cierre del propietario. |

No instalar dependencias en la tarea 1. No hacen falta bcrypt, Passport ni un
emisor JWT propio. Fijar versiones compatibles cuando se autorice cada tarea;
no instalar latest sin revisar runtime. La web no tiene runner de tests: la
tarea correspondiente concretara un harness minimo con tooling disponible;
cualquier runner nuevo necesita justificarlo antes de ampliar el alcance.

## Pasos manuales del propietario

1. Confirmar que ECC (P-256) es Current en Project Settings > JWT Keys. No
   migrar, rotar, revocar ni compartir secretos. Contrastar despues con JWKS y,
   cuando exista una prueba autorizada, con el header de un token verificado.
2. Antes de tarea 10, revisar Email/confirmacion y Site URL existentes; guardar
   la plantilla TokenHash acordada, con origen y ruta exactos. No cambiar las
   Redirect URLs reservadas ni habilitar recuperacion en esta entrega.
3. Elegir una direccion del equipo para el primer registro; autorizar cuenta
   y envio, comprobar limite disponible y recepcion. No introducir reintentos
   automaticos ni pruebas masivas. No registrar direcciones personales en docs.
4. SMTP propio solo mediante decision posterior antes de destinatarios externos
   o produccion; credenciales se introducen directamente en Dashboard.
5. Revisar y autorizar migracion remota y promocion manual a ADMIN por separado.

## Validacion y cierre

Para cambios exclusivamente documentales: git diff --check, revisar enlaces
relativos, coherencia con roadmap/codigo y distinguir propuestas de evidencias.
La tarea documental 1 no tuvo workspaces afectados para lint/check-types/build.

Para cada implementacion ejecutar solo los grupos afectados:

```bash
pnpm --filter web lint
pnpm --filter web check-types
pnpm --filter web build
pnpm --filter api lint
pnpm --filter api check-types
pnpm --filter api build
pnpm --filter api run test --runInBand
pnpm --filter api run test:e2e --runInBand
pnpm --filter @repo/db lint
pnpm --filter @repo/db check-types
pnpm --filter @repo/db build
pnpm --filter @repo/db prisma:validate
pnpm --filter @repo/db prisma:generate
pnpm --filter @repo/types lint
pnpm --filter @repo/types check-types
pnpm --filter @repo/validation lint
pnpm --filter @repo/validation check-types
git diff --check
```

Types/validation no tienen build propio actualmente. Conectividad, solo cuando
corresponda y se autorice: db:check y db:check:runtime en @repo/db; no sustituyen
pruebas Auth ni aplican schema. Las pruebas unitarias usan claves/JWKS/DB
simulados; pruebas remotas nunca se ejecutan implicitamente desde lint/build.
Comprobar navegacion mock, cache privada, aislamiento de sesiones, CORS y
endpoint directo sin UI. No anunciar rechazo inmediato de access tokens tras
logout: verificar ausencia de sesion/renovacion y documentar su validez residual.

Cierre: registro y confirmacion reales autorizados, login/logout y renovacion
funcionales, llamada Next/Nest con token verificado, perfil unico y rol en DB,
matriz USER/EDITOR/MODERATOR denegada y ADMIN admitido en prueba, sin secretos
publicados y mocks intactos. Checks correctos y limites registrados. Tras cada
entrega resumir archivos, decisiones, TODOs y validacion; titulo y descripcion
de commit en ingles. El propietario crea/sube el commit y autoriza continuar.

## Fuentes oficiales

Consultadas el 23 de octubre de 2026; revisar otra vez APIs/versiones concretas
al implementar. El repositorio usa Next 16.2.0, Nest 11 y Prisma 7.9.1; no se
adoptan APIs de otra version por aparecer en una pagina latest.

- [Clientes SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).
- [SSR, PKCE y cookies](https://supabase.com/docs/guides/auth/server-side/advanced-guide).
- [Firma y rotacion](https://supabase.com/docs/guides/auth/signing-keys) y [verificacion JWT](https://supabase.com/docs/guides/auth/jwts).
- [Plantillas de correo](https://supabase.com/docs/guides/auth/auth-email-templates) y [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
- [Logout y scopes](https://supabase.com/docs/guides/auth/signout).
- [Proxy Next](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) y [cookies](https://nextjs.org/docs/app/api-reference/functions/cookies).
- [Autenticacion Nest](https://docs.nestjs.com/security/authentication), [autorizacion](https://docs.nestjs.com/security/authorization) y [Prisma en Nest](https://docs.nestjs.com/recipes/prisma).
- [Migraciones Prisma 7](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production).


## Entrega de tarea 2: factorias web

Implementada el 23 de octubre de 2026 e integrada por el propietario en `587adfc`.
Se ha aplicado la skill local next-best-practices, en particular cookies
asincronas y aislamiento servidor/cliente. Archivos cambiados: client.ts,
server.ts y tests/factories.test.mjs en apps/web/lib/supabase, apps/web/lib/env.ts,
apps/web/package.json, pnpm-lock.yaml, docs/15 y este registro.

- Dependencias exactas @supabase/ssr 0.10.3 y @supabase/supabase-js 2.108.0.
  Se verificaron metadata npm y codigo instalado: peer compatible y engines
  Node >=20. Las versiones latest consultadas (SSR 0.12.7 con peer >=2.114 y
  supabase-js 2.118.0) requieren Node >=22 en el SDK; no se eleva el minimo
  Node 20.19 del monorepo. La validacion se ejecuto con Node 24.15.0/pnpm 9.0.0;
  compatibilidad declarada no equivale a una ejecucion en Node 20.
- getSupabaseEnvironment exige configuracion solo al invocar Auth y devuelve
  URL/publishable key; importar sin configuracion sigue permitiendo mocks.
  Se conserva el rechazo previo de configuracion parcial y los mensajes sin
  valores sensibles. No se valida autenticidad de claves ni conectividad.
- Client Component usa createBrowserClient, sin cliente creado al importar.
  Servidor usa server-only, await cookies y createServerClient por peticion.
  Lectura por defecto mediante getAll. Actions/Handlers deben usar
  createClient({ writableCookies: true }); setAll preserva opciones, chunks y
  borrados. No se capturan ni silencian errores de escritura. En lectura se
  omite setAll; el SDK advertira si se intenta una operacion que requiera escribir.
- No se llama a Auth ni se cargan sesiones desde las paginas existentes.
  No se modifican layouts, rutas, mocks, API, DB, archivos reales de entorno,
  configuracion remota, red ni llavero. Sin usuarios, correos o migraciones.

Validacion realizada:

| Comprobacion | Resultado |
| --- | --- |
| pnpm --filter web lint | Correcto, sin warnings |
| pnpm --filter web check-types | Correcto |
| pnpm --filter web build con entorno local existente | Correcto |
| Build con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY sobrescritas a vacio en el proceso | Correcto; sin editar .env.local |
| node --experimental-vm-modules --test apps/web/lib/supabase/tests/factories.test.mjs | 6 pruebas correctas, sin conexiones externas |
| Fixture Next temporal fuera del repo: importacion desde Client Component | Rechazo esperado por server-only y next/headers |
| Mismo fixture como Server Component | Build correcto; solo comprueba frontera/importacion, no Auth ni tipos del fixture |
| git diff --check | Correcto |

El build sin Supabase no avanzo dentro del sandbox y se interrumpio; termino
correctamente fuera del sandbox. El fixture de frontera usa webpack y omite
solo su comprobacion de tipos; el proyecto real supera su check-types y build
normales. No se cambia la configuracion del repositorio para esos controles.

El harness usa node:test, VM Modules y TypeScript existentes; sin runner nuevo.
Cubre importacion sin clientes ni cookies, configuracion ausente/parcial/invalida,
argumentos publicos, aislamiento por peticion, cookies de lectura/escritura y
propagacion de errores. VM Modules requiere la bandera experimental indicada.

Limites: no se acredita login, confirmacion, sesion o renovacion real. Proxy,
propagacion de cabeceras de cache y validacion de identidad siguen para tarea 3
y posteriores. Los futuros Route Handlers que escriban sesiones deben asegurar
respuesta privada/no-store y conservar cabeceras correspondientes; esta factoria
adapta cookies, no construye respuestas HTTP. No usarla como proteccion de rutas.

La tarea 3 se autorizo posteriormente y su entrega se registra a continuacion.
El propietario crea y sube los commits.


## Entrega de tarea 3: renovacion SSR mediante Proxy

Implementada el 30 de octubre de 2026 e integrada por el propietario en `e5b3573`.
Archivos permitidos/modificados: apps/web/proxy.ts,
apps/web/lib/supabase/proxy.ts, tests/proxy.test.mjs en esa misma carpeta,
docs/15 y este registro. Sin dependencias nuevas ni cambios en factorias,
layouts, paginas, mocks, API, DB, entorno, Dashboard, red o llavero.

Se aplica next-best-practices (convencion Proxy de Next 16, runtime Node por
defecto y separacion servidor/cliente). Contrastados el 30 de octubre de 2026
[SSR Supabase](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)
y [Proxy Next](https://nextjs.org/docs/app/api-reference/file-conventions/proxy),
ademas del contrato getClaims y setAll del SDK instalado. No se actualizan SDKs.

- Matcher estatico: /login, /registro, /auth/confirmar y /admin/:path*.
  Quedan fuera home, wiki, juegos, assets y recuperacion de contrasena.
  Los route groups no forman parte de las URLs. No se crean paginas Auth/admin.
- createServerClient por peticion, getAll/setAll y getClaims, sin confiar en
  getSession. Al renovar, actualizar cookies de request y reconstruir la
  respuesta Next para propagar Cookie al render servidor. Conservar cookies
  previas entre multiples escrituras, incluidos chunks, opciones y borrados.
- Trasladar cabeceras de cache del SDK. Todas las respuestas del Proxy son
  privadas/no-store, con Expires y Pragma; las respuestas de redireccion/error
  conservan las cookies finales. No copiar cabeceras internas de override de
  request a una redireccion o respuesta de error.
- Sin identidad, /admin redirige 303 a /login en el mismo origen, quitando query
  y sin aceptar un destino next del cliente. Auth/confirmacion pueden continuar
  sin sesion. Una identidad valida permite continuar, pero NO acredita ADMIN:
  los roles y datos privados se autorizaran en NestJS y en sus futuros consumidores.
- Errores Auth 400/401/403 equivalen a identidad no valida. Otros errores,
  excepciones o configuracion ausente producen 503 con mensaje espanol generico,
  sin filtrar detalles del proveedor ni registrar tokens. No conceder acceso
  si no se ha podido verificar. Conservar cookies aunque el error ocurra despues
  de una renovacion o limpieza efectuada por el SDK.

Validaciones ejecutadas:

| Comando/comprobacion | Resultado |
| --- | --- |
| pnpm --filter web lint | Correcto, sin warnings |
| pnpm --filter web check-types | Correcto |
| NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= pnpm --filter web build | Correcto, incluye Proxy y conserva rutas publicas/prerender |
| node --experimental-vm-modules --test apps/web/lib/supabase/tests/*.test.mjs | 16 pruebas correctas: 10 Proxy y las 6 previas de factorias |
| Smoke del build en 127.0.0.1:3218 sin configuracion Supabase | 6 respuestas publicas 200 sin Set-Cookie; 5 respuestas de matcher 503 con private/no-store |
| git diff --check | Correcto |

El intento de build no avanzo en el sandbox y se interrumpio; el mismo comando
termino fuera de el. Variables vacias solo en los procesos de build/arranque,
sin editar .env.local. Se cerro el servidor temporal al terminar. Las seis URLs
publicas fueron /, /wiki, /wiki/mr-house, /juegos, /juegos/fallout-4 y /favicon.ico;
las cinco del matcher fueron /login, /registro, /auth/confirmar, /admin y
/admin/wiki. Se enviaron solo cookies sinteticas, sin credenciales reales.

Pruebas usan node:test/VM/TypeScript existentes, NextRequest/NextResponse reales
y el matcher de Next instalado (utilidad unstable_doesMiddlewareMatch).
Supabase esta simulado: renovacion, limpieza, cookies al render/navegador,
conservacion en redireccion/503, claims invalidos, proveedor no disponible,
configuracion ausente e aislamiento concurrente. El matcher excluye tambien
prefijos parecidos, paths publicos interiores y recursos _next. Sin runner nuevo.

Limitaciones: no hay usuarios/correos nuevos ni sesiones reales probadas; no se
acreditan conectividad Auth, entrega de correo o validacion JWT en NestJS. El
SDK getClaims verifica segun la firma del proyecto; esta tarea no implementa
un verificador JWT propio ni confirma Current/JWKS. No protege por rol un panel
que aun no existe. Login/registro/confirmacion aun no tienen paginas/handlers;
con configuracion completa y sin sesion podran llegar al 404 existente hasta
su implementacion. Sin configuracion, las rutas del matcher devuelven 503;
la navegacion publica sigue disponible con mocks.

La tarea 4 se autorizo despues de esta entrega y de la confirmacion de Current;
su resultado se registra a continuacion. Sin cuentas ni correos como preparacion.
Phase 5 sigue abierta.


## Entrega de tarea 4: identidad JWT en NestJS

Implementada el 30 de octubre de 2026; pendiente de revision del propietario.
Se sigue nestjs-best-practices para guards, inyeccion de dependencias,
excepciones HTTP y simulacion de servicios externos. Sin emitir JWT propios.

### Requisitos previos y fuentes

El propietario confirma Current para ECC P-256. Inspeccion GET del JWKS derivado
de la SUPABASE_URL local de API: una clave ES256, EC, P-256. No se imprimen URL
real, referencia de proyecto, kid ni componentes de clave. Sin Authorization,
API key, cookies o cambios remotos; fetch HTTPS con validacion TLS por defecto.
El intento dentro del sandbox fallo por acceso de red; fuera termino correctamente.
Esto acredita publicacion de clave, no verificacion de un token de usuario.

Contrastados el 30 de octubre de 2026: [verificacion Supabase](https://supabase.com/docs/guides/auth/jwts),
[autenticacion Nest](https://docs.nestjs.com/security/authentication),
[opciones JWKS jose 6.2.14](https://github.com/panva/jose/blob/v6.2.14/docs/jwks/remote/interfaces/RemoteJWKSetOptions.md)
y [runtimes de jose](https://github.com/panva/jose#supported-runtimes).
Dependencia exacta jose 6.2.14; no Passport, emisor JWT ni nuevas claves.

### Archivos y comportamiento

- apps/api/src/modules/auth/: auth.module.ts, jwks-fetch.provider.ts,
  supabase-identity.ts, supabase-jwt.service.ts y sus pruebas unitarias.
- apps/api/src/common/guards/: supabase-auth.guard.ts y sus pruebas.
- apps/api/src/app.module.ts registra/exporta las dependencias mediante AuthModule;
  no registra guard global ni nuevos endpoints de produccion.
- apps/api/src/config/environment.ts y sus pruebas, apps/api/.env.example,
  apps/api/package.json, apps/api/test/jest-e2e.json, test/auth.e2e-spec.ts,
  pnpm-lock.yaml, docs/15 y este documento.

SupabaseJwtService crea un resolvedor JWKS reutilizable y perezoso. Verifica
firma ES256, typ JWT, kid no vacio, issuer del proyecto, audiencia authenticated,
exp y nbf cuando existe; exige iat, sub UUID, session_id UUID y role authenticated.
Rechaza usuarios anonimos y un indicador is_anonymous presente que no sea false.
Ignora roles de user_metadata. Devuelve solo supabaseUserId y sessionId, como
tipo interno de API, sin perfil ni permisos de negocio. Ningun consumidor web
requiere ese tipo aun; los contratos compartidos futuros iran a packages/types.

Guard exige una sola cabecera Bearer compacta, con maximo 16 KiB; rechaza
Authorization duplicada, sintaxis extra y claves API. Borra cualquier identidad
previa antes de verificar y adjunta authIdentity solo despues del exito. No
adjunta un UserProfile ficticio. Los endpoints futuros deben aplicar el guard;
health y endpoints existentes conservan su comportamiento publico.

Errores de token, claims, firma o kid desconocido: 401 generico en espanol.
Error de red, timeout, respuesta/JWKS invalido o configuracion ausente: 503
generico. No incluir excepciones originales, JWTs o credenciales en logs/respuestas.
No conceder acceso ante errores. El endpoint /privado-prueba existe solo dentro
del fixture e2e, sin rutas Auth/perfil/admin prematuras en la API real.

JWKS usa destino fijo derivado del origen configurado, sin seguir jku del token,
sin API keys ni bearer, con redirects manuales (redireccion rechazada), timeout
5 segundos, cache local 10 minutos y cooldown 30 segundos para kid nuevo.
Una clave nueva puede rechazarse durante ese cooldown. Con cache vigente no se
consulta Auth en cada peticion. La cache Edge de Supabase puede sumar otros
10 minutos a la ventana local: no prometer revocacion instantanea. Reiniciar
el proceso elimina cache local, pero no la Edge; rotaciones/revocaciones son
operaciones del propietario fuera de esta tarea.

El contrato de SUPABASE_URL se endurece: origen HTTPS remoto sin userinfo,
ruta, query ni fragmento; HTTP solo en loopback para pruebas. La variable sigue
opcional al arrancar con mocks; verificar identidad sin ella devuelve 503.
WEB_URL y DATABASE_URL conservan sus contratos. Sin JWT secret, API key o nueva
variable; Turbo ya declara SUPABASE_URL en build/dev. El ejemplo actualizado no
modifica los .env reales. No se introduce Supabase local.

jose 6 es ESM. Produccion mantiene la compilacion actual de Nest; require(esm)
esta disponible por defecto en Node ^20.19, ^22.12 o >=23 segun el proveedor.
Validado con Node 24.15.0; no se ha ejecutado en Node 20 y no se cambia engines.
Jest transforma solo la dependencia JS jose mediante ts-jest existente, con
configuracion CommonJS para ese JS. Los tests TS conservan su transformacion y
check-types valida el codigo propio; diagnostics=false se limita a ese transform
JS externo. Sin nuevo runner ni cambio del formato de modulos de produccion.

### Validacion

| Comando/comprobacion | Resultado |
| --- | --- |
| pnpm --filter api lint | Correcto, sin warnings |
| pnpm --filter api check-types | Correcto |
| pnpm --filter api build | Correcto |
| pnpm --filter api run test --runInBand | 61 pruebas correctas en 5 suites |
| pnpm --filter api run test:e2e --runInBand | 8 pruebas correctas en 2 suites |
| Smoke del verificador dist con require de jose ESM | Firma real ES256 y JWKS simulado correctos, sin conexion externa |
| API dist en puerto local temporal 3219 sin SUPABASE_URL/DATABASE_URL | health 200; /privado-prueba y /auth/me 404; proceso cerrado |
| git diff --check | Correcto |

Las e2e fallaron inicialmente con listen EPERM en el sandbox y terminaron fuera
de el. Claves criptograficas y tokens se generan solo en memoria para tests,
con fetch JWKS simulado; no se conecta a Supabase desde las suites. Cubren
manipulacion, firma ajena, algoritmos/tipo/claims invalidos o ausentes, caducidad,
nbf, origen fijo, cache, cooldown, rotacion, retirada de clave, fallos HTTP/JSON/
JWKS/red y timeout real de cinco segundos. Guard cubre cabeceras, limites y
propagacion de errores. E2e comprueba identidad adjunta y respuestas 401/503 sin
secretos, mas regresion del health publico. No se llama a PostgreSQL.

Limites: sin perfiles, roles, persistencia, sesiones o access tokens reales
verificados; sin nuevos usuarios, correos, migraciones o escrituras remotas.
Web, mocks, diseno y paquetes DB/types/validation permanecen intactos. La
confirmacion Current/JWKS antes pendiente en el contrato queda satisfecha con
las dos evidencias descritas, sin afirmar una prueba funcional de usuario.

Siguiente entrega propuesta: tarea 5, consumo real de @repo/db desde NestJS,
tras revision y nueva autorizacion. No comenzar modelos ni migraciones en esa
integracion. El propietario crea/sube el commit; Phase 5 permanece abierta.
