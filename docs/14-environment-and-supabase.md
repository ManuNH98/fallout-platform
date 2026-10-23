# 14. Environment and Supabase

## Objetivo y alcance

Preparar y verificar Supabase remoto en Phase 4, manteniendo las responsabilidades de `docs/01-architecture.md`. El frontend conserva los mocks y el diseno publico. No crear `.env` en la raiz del monorepo: cada aplicacion/package mantiene su entorno.

No introducir Docker, Supabase local ni dependencias sin justificar. Login, registro, sesiones, roles y validacion JWT corresponden a Phase 5. No anadir modelos, migraciones, seeds ni sustituir mocks en Phase 4.

## Estado comprobado de Phase 4

Revision del 23 de octubre de 2026. Runtime y CLI conectan con TLS verificado. CLI usa Direct en macOS con WARP activo y una entrada temporal del hostname en /etc/hosts aplicada por el propietario. Email/URLs preparados por confirmacion y Storage verificado. El registro docs/17-phase-4-validation.md detalla las evidencias y la dependencia local de WARP/hosts. Phase 4 esta completada e integrada en develop por la PR #7 (merge `b324cd5`); el propietario confirmo el merge y autorizo Phase 5 el 23 de octubre de 2026. Este cierre reutiliza las evidencias existentes, sin repetir verificaciones de infraestructura.

- Web: App Router en `apps/web/app/`, sin `src/`, puerto `3000`. `next.config.js` valida la URL de API. El layout raiz importa `apps/web/lib/env.ts`, por lo que la validacion publica tambien se ejecuta al cargar el layout de servidor, incluido el build.
- API: puerto `3001`, ConfigModule, validacion de protocolos/host y CORS con `WEB_URL`. Las variables externas son opcionales. No consume `@repo/db`.
- `GET /health` devuelve `{"status":"ok"}`: acredita disponibilidad de API, no conectividad con PostgreSQL, Auth o Storage.
- DB: Prisma/client/adapter-pg `7.9.1`, schema sin modelos y factoria `createPrismaClient(connectionString)` preparada.
- Prisma CLI carga dotenv en `packages/db` y usa `DIRECT_URL` mediante `datasource.url` en `prisma.config.ts`. Sin ella se permite validar/generar localmente.
- `db:check` ejecuta `prisma/check-connection.sql`, que contiene solo `SELECT 1;`, por la URL de CLI. `db:check:runtime` comprueba `DATABASE_URL` mediante la factoria Prisma existente y `SELECT 1 AS ok`; ambos pasan con TLS verificado, CLI por Direct con WARP/hosts y runtime por session pooler.
- Los archivos `apps/web/.env.local`, `apps/api/.env` y `packages/db/.env` existen localmente y estan ignorados por Git. El certificado CA local en `packages/db/.certs/prod-ca-2021.pem` tambien esta ignorado; no se versionan valores ni credenciales.

## Diferencias entre codigo y configuracion objetivo

Los contratos y ejemplos publicos/de servidor estan actualizados. La tabla resume la preparacion y verificacion de Phase 4; el algoritmo de firma real sigue pendiente de identificar antes de implementar la validacion JWT de Phase 5.

| Area | Contrato actual | Objetivo de Phase 4 |
| --- | --- | --- |
| Web | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en ejemplo/helper/Turbo; helper importado desde el layout raiz | Entorno real rellenado; formato y coherencia local comprobados, sin ejecutar Auth |
| API | Sin `SUPABASE_JWT_SECRET` en ejemplo, tipo ni Turbo; URLs opcionales con protocolos y host validados | Implementado en tarea 3; registrar sistema de firma remoto antes de implementar el verificador JWT de Phase 5 |
| PostgreSQL | Session pooler para runtime; Direct para CLI; CA configurada localmente | Ambos verificados; CLI depende de WARP y entrada temporal de hosts en macOS |
| Verificacion | `db:check` por `DIRECT_URL` y `db:check:runtime` por `DATABASE_URL` | Ambos correctos; CLI rechaza CA ausente e identidad incorrecta en controles negativos |

Supabase recomienda publishable keys (`sb_publishable_...`) para componentes publicos; `anon` y `service_role` son legacy. No hace falta obtener una secret key para esta fase. Referencia: [API keys](https://supabase.com/docs/guides/getting-started/api-keys).

Para un proyecto nuevo se recomienda firma asimetrica. Registrar algoritmo y endpoint publico JWKS derivado de la URL del proyecto; no exportar claves privadas ni copiar el JWT secret. NestJS validara los tokens en Phase 5. No rotar claves de un proyecto existente sin revisar su impacto. Referencia: [Signing keys](https://supabase.com/docs/guides/auth/signing-keys).

## Reparto de variables locales

Requisitos: Node.js 20.19 o superior, pnpm 9 y acceso del propietario al Dashboard. Rellenar los archivos en la tarea 5, tras preparar la comprobacion de runtime y revisar el proyecto con el propietario.

| Destino | Variables objetivo | Uso |
| --- | --- | --- |
| `apps/web/.env.local` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | API local `http://localhost:3001`, URL del proyecto y clave publica; sin cliente Auth todavia |
| `apps/api/.env` | `NODE_ENV`, `PORT`, `WEB_URL`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_STORAGE_BUCKET` | Desarrollo, `3001`, `http://localhost:3000`, conexion runtime y bucket `media` |
| `packages/db/.env` | `DATABASE_URL`, `DIRECT_URL` | Comprobacion runtime y acceso de Prisma CLI respectivamente |

El contrato web usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y exporta `supabasePublishableKey` desde `webEnvironment`. No admite el nombre legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` como alternativa. URL y clave se configuran juntas: ambas ausentes (o vacias) permiten los mocks; solo una presente produce un error en espanol. La validacion comprueba presencia conjunta y sintaxis de URL, no autenticidad ni permisos de la clave. No realiza llamadas a Supabase ni crea sesiones.

Las referencias `process.env.NEXT_PUBLIC_*` son estaticas para que Next pueda incorporarlas durante el build. Cambiar valores publicos requiere reconstruir el despliegue. Referencia: [variables de entorno de Next.js](https://nextjs.org/docs/app/guides/environment-variables).

La API acepta `http:`/`https:` para `WEB_URL` y `SUPABASE_URL`, y `postgresql:`/`postgres:` para `DATABASE_URL`, siempre con host. Los valores ausentes o vacios permiten trabajar con mocks; `WEB_URL` usa el valor local por defecto. Los errores identifican la variable sin incluir su valor. No se exige JWT secret ni se valida JWT. La validacion comprueba sintaxis y protocolo, no credenciales, certificado ni conectividad.

La presencia de `DATABASE_URL` en la API no implica que NestJS ya use Prisma. Los procesos no cargan automaticamente el entorno de otros workspaces. Next carga `.env.local`, Nest carga su `.env` mediante ConfigModule y Prisma CLI usa dotenv dentro de DB. Turbo declara disponibilidad/hash de variables, pero no carga esos archivos.

Las variables `NEXT_PUBLIC_*` pueden incorporarse al bundle publico. Nunca incluir credenciales PostgreSQL, JWT secrets, claves privadas ni claves privilegiadas en ellas, en `next.config.js.env` ni en props enviadas al navegador. No pegar secretos en chat ni registrarlos en logs, capturas, comandos compartidos o commits.

## Conexiones y TLS

Copiar las cadenas reales desde **Connect** en el Dashboard; no construir hosts a partir de ejemplos antiguos ni asumir que basta con cambiar el puerto. Codificar los caracteres reservados de la contrasena como componente de URI, sin codificar toda la cadena.

| Uso | Opcion inicial | Alternativa y condicion |
| --- | --- | --- |
| Runtime NestJS persistente | Supavisor session pooler `5432` para IPv4 | Directa si la red alcanza el endpoint ofrecido por el proyecto |
| Prisma CLI (`DIRECT_URL`) | Session pooler `5432` o directa accesible | No transaction pooler para el camino de migraciones futuro |
| Futuro runtime serverless/autoescalado | Evaluar transaction pooler `6543` | Verificar prepared statements, limites y adapter antes de adoptarlo |

`DIRECT_URL` es el nombre del contrato de CLI; puede contener session pooling. Ambas variables pueden apuntar al mismo endpoint si sirve para los dos usos, pero cada camino se comprueba por separado.

No anadir `pgbouncer=true` a session/direct. Supabase lo documenta para Prisma con transaction pooling; Prisma distingue capacidades/versiones de PgBouncer. Este repositorio usa `PrismaPg`: si se elige transaction, verificar el comportamiento del adapter instalado antes de copiar parametros de otro motor.

Exigir transporte cifrado. `sslmode=require` exige cifrado, pero no garantiza por si solo la identidad del servidor. Preparar verificacion de certificado/CA para el endpoint elegido y comprobar las opciones admitidas por CLI y `pg` por separado. Si hace falta la CA del proyecto, el propietario la obtiene en Database Settings y se configura en driver/entorno. No resolver errores desactivando TLS o usando `rejectUnauthorized: false` automaticamente.

Los ejemplos de runtime API/DB usan `sslmode=verify-full`, admitido por la version instalada de `pg-connection-string` (2.14.0) y consumido por `PrismaPg`; si la CA no es de confianza, configurar `sslrootcert` con su ruta local real. No introducir una ruta ficticia activa en el ejemplo. No combinar parametros SSL de la URI con un objeto `ssl` sin revisar su precedencia en pg.

El ejemplo de `DIRECT_URL` usa `sslmode=require`, que Prisma CLI documenta para exigir TLS. La documentacion de su conector PostgreSQL enumera `sslcert` para el certificado de servidor, mientras pg utiliza `sslrootcert` para la CA: no copiar opciones entre ambos caminos sin verificarlas. El entorno real de CLI anade CA en `sslcert` y `sslaccept=strict`; la conexion Direct y sus controles negativos se han verificado con los requisitos locales descritos abajo. `require` por si solo no acredita que se haya verificado esa identidad.

### Verificacion real de tarea 5: macOS

Los intentos siguientes son el historico del bloqueo. Los estados abiertos o pendientes de esas entregas no representan el cierre actual. El resultado vigente es CLI Direct correcto con WARP y hosts, descrito en la subseccion final y en docs/17-phase-4-validation.md.

El propietario descargo la CA desde Supabase Dashboard. Se verifico que es una CA vigente y se copio como PEM a un archivo local ignorado. Las dos URLs de runtime usan `sslmode=verify-full` y `sslrootcert` con ruta absoluta al PEM. `db:check:runtime` pasa contra Supabase y una comprobacion con el mismo driver pg confirma conexion cifrada y certificado autorizado.

Para CLI se configuro `sslmode=require`, `sslcert` con la CA y `sslaccept=strict`. El primer SELECT 1 con solo `require` habia pasado, pero el modo estricto falla con P1011 (certificado no confiable). Anadir tambien `sslrootcert` o cambiar la codificacion de la ruta en pruebas temporales no lo resolvio. El verificador nativo de macOS, con la CA explicita, devuelve `CSSMERR_TP_NOT_TRUSTED` e informa que Certificate Transparency no esta verificado. Se ha reproducido el rechazo nativo; no se declara resuelta su causa ni se atribuye a credenciales incorrectas.

Durante la prueba inicial las URLs de runtime y CLI apuntaban al mismo endpoint, usuario y base; no se publican sus valores. El propietario autorizo una regla SSL de usuario limitada al host exacto del pooler. Tras un primer timeout, completo la autorizacion desde su terminal con el helper preparado. Se verifico una unica regla `sslServer` para el host, sin errores permitidos y sin alterar las demas reglas. macOS omite `kSecTrustSettingsResult` cuando usa `trustRoot` por defecto; el helper se corrigio para admitir esa representacion documentada por Apple.

La regla no resolvio P1011 de Prisma CLI ni el rechazo del verificador nativo. Se retiro la regla y la CA que se habia importado al llavero; la exportacion posterior coincide con la copia anterior al intento. No queda confianza adicional instalada. Se conserva el PEM local ignorado y la configuracion de runtime que funciona con CA explicita. La copia previa y el helper temporal no se versionan.

El 2026-10-23 el propietario copio la conexion directa real a `DIRECT_URL`. Se mantuvo `DATABASE_URL` en el session pooler y se preparo CLI con `sslmode=require`, CA en `sslcert`, `sslaccept=strict` y `connect_timeout=10`. La referencia de proyecto coincide con la del pooler. `pnpm --filter @repo/db db:check` falla con P1001: DNS devuelve AAAA, no A (`ENODATA`), y la conexion TCP IPv6 devuelve `EHOSTUNREACH`. El endpoint existe, pero no es alcanzable desde esta red; la prueba no llega a TLS ni valida sus credenciales o certificado.

Tarea 5 sigue abierta. La conexion directa requiere una red con acceso IPv6 antes de poder evaluar TLS; la alternativa session pooler sigue teniendo pendiente el rechazo de confianza de CLI. No ampliar la confianza del sistema, relajar TLS ni contratar un complemento de pago como parte de esta comprobacion. `DIRECT_URL` conserva el endpoint directo para la prueba pendiente; no se declara operativo.

#### Diagnostico adicional del pooler (2026-10-23)

Se reviso el codigo del motor instalado de Prisma 7.9.1, revision `e922089b7d7502aff4249d5da3420f6fa55fc6ad`: `sslcert` carga una CA adicional y `sslaccept=strict` mantiene activa la validacion nativa. Dos pruebas con `DIRECT_URL` sobrescrita solo en el proceso, sin editar el entorno local, confirman que CLI lee el archivo: CA real produce P1011 por confianza; ruta inexistente produce P1011 por archivo no encontrado. No se ejecuto ninguna migracion.

Se obtuvo la cadena completa mediante una conexion pg autorizada. Sus tres certificados encadenan criptograficamente hasta la CA configurada; el nombre del servidor coincide y los certificados estan dentro de sus fechas. Una evaluacion `SecTrust` de macOS con politica SSL, hostname, cadena completa y CA explicita, sin cambios de llavero, falla con codigo -67901. Los detalles del certificado final incluyen `OtherTrustValidityPeriod` y `ServerAuthEKU`. Ese certificado tiene 1825 dias de validez, fue emitido despues de julio de 2019 y no incluye el EKU `serverAuth`. Apple documenta un limite de 825 dias y ese EKU para certificados TLS emitidos desde esa fecha. El diagnostico apunta a requisitos de la politica TLS nativa; el aviso previo de Certificate Transparency no basta para explicar el rechazo.

Runtime sigue pasando SELECT 1 con TLS autorizado. Esto no acredita CLI: usa otro verificador. La siguiente via recomendada es que el propietario consulte a Supabase sobre el certificado servido por el pooler y esos dos motivos de rechazo. Como alternativa, puede evaluarse CLI con TLS estricto en un equipo Linux disponible del propietario; no se ha probado ni se garantiza su resultado. No crear servicios externos, instalar dependencias ni trasladar secretos para esta alternativa sin una tarea acordada. La opcion directa sigue requiriendo IPv6 y su certificado aun no se ha evaluado.

Referencias: [requisitos TLS de Apple](https://support.apple.com/en-au/103769), [carga de CA y validacion en el motor instalado](https://github.com/prisma/prisma-engines/blob/e922089b7d7502aff4249d5da3420f6fa55fc6ad/quaint/src/connector/postgres/native/mod.rs#L839) y [parametros del motor instalado](https://github.com/prisma/prisma-engines/blob/e922089b7d7502aff4249d5da3420f6fa55fc6ad/quaint/src/connector/postgres/url.rs#L272).

#### Seguimiento y continuacion autorizada

El propietario compartio la respuesta de la IA de soporte de Supabase: no confirma el perfil del certificado y recomienda escalar a soporte humano para revisar el certificado servido. No equivale a una confirmacion del proveedor ni acredita un ticket abierto o una solucion. La recomendacion generica sobre `sslrootcert` en libpq no sustituye la configuracion ya comprobada del motor nativo de Prisma.

Por indicacion del propietario se deja este bloqueo documentado y se avanza a la tarea 6. No se repiten cambios de llavero ni se relaja TLS. Criterio para resolverlo: `pnpm --filter @repo/db db:check` termina correctamente con TLS y certificado/hostname verificados por CLI; despues se repite `db:check:runtime`. Mientras tanto la tarea 5 y Phase 4 permanecen abiertas. No se ha enviado ningun mensaje al proveedor desde el agente.

Referencia del valor implicito de confianza: [SecTrustSettingsCopyTrustSettings de Apple](https://developer.apple.com/documentation/security/sectrustsettingscopytrustsettings(_:_:_:)).

#### Resultado vigente: Direct con WARP y entrada temporal de hosts

WARP instalado y activado por el propietario proporciona acceso IPv6 a Direct. Persistia ENOTFOUND en el resolvedor de macOS aunque la consulta AAAA directa funcionaba; vaciar cache no lo resolvio. El propietario autorizo y aplico con sudo una unica entrada del hostname Direct a su IPv6 en /etc/hosts. Se verifico que los demas hosts siguen intactos y que la copia previa es integra. No se publican IP, hostname real ni credenciales; los helpers y copia quedan fuera del repositorio, en /private/tmp.

Tras el cambio macOS resuelve el host y pasan `db:check` y `db:check:runtime`. CLI conserva hostname, `sslmode=require`, `sslcert` y `sslaccept=strict`. Sin CA adicional y con hostname sustituido por IPv6 literal, dos controles negativos solo en memoria fallan con P1011. El certificado Direct observado incluye serverAuth y tiene 730 dias de validez. No se cambiaron .env, llaveros, politicas remotas ni codigo. Lint, check-types y build de @repo/db pasan.

Mantener WARP activo al usar Direct y revisar la entrada si cambia la IPv6 del proyecto. Es una solucion local temporal, no una reparacion general del DNS ni una garantia al cambiar de red. No sustituir la URI por una IP ni relajar TLS. El helper `/private/tmp/fallout-direct-hosts.py` admite `--rollback` con sudo y retira solo su entrada; conservar antes la copia y el registro de su ubicacion si se limpian temporales. Al retirarla puede volver el fallo DNS. Estos requisitos operativos se conservan como limitaciones del cierre de Phase 4 confirmado por el propietario; no se ha reparado de forma general el DNS de macOS.

Referencia de los parametros del motor nativo: [parser de conexiones de Prisma](https://github.com/prisma/prisma-engines/blob/main/quaint/src/connector/postgres/url.rs) y [carga de la CA y modo estricto](https://github.com/prisma/prisma-engines/blob/main/quaint/src/connector/postgres/native/mod.rs). Las opciones del driver pg y del motor nativo se comprueban por separado.

Referencias adicionales: [TLS de node-postgres](https://node-postgres.com/features/ssl) y [conector PostgreSQL de Prisma](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql).

Mantener Prisma 7: URL de CLI en `prisma.config.ts`, carga explicita de entorno y adapter en runtime. No reintroducir `directUrl` en el schema ni exigir credenciales para generar el cliente sin conexion.

Referencias: [Supabase con Prisma](https://supabase.com/docs/guides/database/prisma), [conexiones y SSL](https://supabase.com/docs/guides/database/connecting-to-postgres), [Prisma y PgBouncer](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/pgbouncer), [configuracion Prisma 7](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference) y [certificados en Prisma 7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).

## Pasos del propietario en Supabase Dashboard

Esta lista conserva los pasos previstos para Phase 4; sus resultados se registran en las tareas siguientes y en docs/17-phase-4-validation.md. No es una instruccion para repetir cambios remotos tras el cierre. Las plantillas y flujos Auth pendientes se revisaran en tareas autorizadas de Phase 5.

1. Seleccionar proyecto existente o crear uno. El propietario decide organizacion, region y plan y guarda la contrasena PostgreSQL en su gestor. Verificar que esta operativo; no crear recursos duplicados.
2. Obtener Project URL y publishable key desde Connect/API Keys e introducirlas directamente en el archivo local correspondiente. No obtener claves privilegiadas sin consumidor previsto.
3. Obtener cadenas session/direct para los dos caminos; revisar SSL, certificado y restricciones de red. Introducir credenciales directamente en los archivos locales y registrar solo decisiones no sensibles.
4. En Authentication, verificar Email habilitado y mantener confirmacion de correo. En URL Configuration, usar Site URL `http://localhost:3000` para desarrollo.
5. Acordar las rutas de Phase 5 antes de registrar redirecciones exactas. Candidatas: `http://localhost:3000/auth/confirmar` y `http://localhost:3000/restablecer-contrasena`. Son propuestas sin implementar: no usar comodines amplios ni dominios inventados. Revisar plantillas cuando se implementen los flujos.
6. Registrar si las primeras pruebas de Phase 5 se limitaran a direcciones del equipo. El SMTP incluido restringe destinatarios y tiene limites; no es un servicio de produccion. SMTP propio requiere decision y credenciales del propietario antes de probar con otros destinatarios. No crear usuarios ni enviar correos en Phase 4.
7. Crear o verificar `media`, inicialmente privado. Revisar todas las politicas aplicables a `storage.objects`, incluidas las generales, para que no permitan escrituras anonimas (`INSERT`, `UPDATE`, `DELETE`). No crear permisos genericos de subida para `authenticated` ni implementar el flujo de media. La futura lectura publica requiere decidir que assets alojara.

Storage deniega subidas sin politicas que las permitan. La lectura publica de un bucket no autoriza escrituras. Ademas de revisar politicas, comprobar de forma controlada que una subida sin sesion es rechazada y no crea objetos; no usar credenciales privilegiadas en esa prueba.

Referencias: [redirecciones](https://supabase.com/docs/guides/auth/redirect-urls), [Email Auth](https://supabase.com/docs/guides/auth/passwords), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals) y [acceso a Storage](https://supabase.com/docs/guides/storage/security/access-control).

No hay un destino de despliegue operativo verificado para esta fase. Registrar la limitacion; no crear hosting ni declarar configuradas variables remotas. Si se identifica un despliegue existente, configurarlo requiere una tarea acotada y URLs reales del propietario.

## Tarea 6: preparacion de Email y URLs

Las tareas 6 y 7 conservan el estado historico de sus entregas, cuando CLI estaba pendiente. El resultado posterior de CLI y el cierre vigente se recogen arriba y en docs/17-phase-4-validation.md.

Iniciada el 2026-10-23 por autorizacion del propietario, con la comprobacion CLI de tarea 5 pendiente. Esta configuracion de Auth se revisa en Dashboard y no requiere la conexion de Prisma CLI. No hay conector Supabase disponible en esta sesion: el propietario realiza los cambios y confirma su estado; no se declara inspeccion remota por el agente.

Archivos permitidos en esta entrega documental: `docs/12-roadmap.md`, este documento y `docs/15-current-status.md`. Excluidos: codigo de apps/packages, archivos de entorno, schema, migraciones, seeds y registro historico de Phase 3. Se revisaron las skills locales: ninguna corresponde a esta tarea documental y de Dashboard, sin implementacion de Auth.

Preparacion de desarrollo confirmada por el propietario el 2026-10-23, tras indicar que guardo los ajustes y que no ha configurado SMTP propio. Es evidencia declarada por el propietario, no inspeccion remota ni prueba de envio:

| Ajuste | Valor objetivo | Estado |
| --- | --- | --- |
| Authentication > proveedores > Email | Email habilitado y confirmacion de correo activada | Confirmado por el propietario |
| Authentication > URL Configuration > Site URL | `http://localhost:3000` | Confirmado por el propietario |
| Redirect URLs | `http://localhost:3000/auth/confirmar` | Reserva para Phase 5 confirmada por el propietario |
| Redirect URLs | `http://localhost:3000/restablecer-contrasena` | Reserva para Phase 5 confirmada por el propietario |
| Correo | SMTP incluido; sin configuracion propia | Declarado por el propietario; sin prueba de entrega |

Las dos rutas no existen en `apps/web/app/`: registrarlas solo reserva destinos permitidos. No acredita un flujo funcional; Phase 5 revisara PKCE, plantillas, confirmacion y recuperacion antes de enviar correos. No crear rutas, usuarios o sesiones, probar registros ni modificar plantillas en esta tarea. Evitar comodines y no registrar dominios de produccion sin despliegue real.

Se conserva el SMTP incluido para la preparacion de desarrollo. Las futuras pruebas de Phase 5 quedan limitadas a direcciones de miembros del equipo: la documentacion consultada indica actualmente 2 mensajes por hora, sujeto a cambios y sin SLA. No se han enviado correos ni acreditado entregabilidad. SMTP propio se decide antes de pruebas con destinatarios externos o produccion; no se contrata ni configura en esta tarea. Referencia: [SMTP de Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

Criterio de aceptacion de preparacion cumplido por confirmacion del propietario: Email, confirmacion, Site URL, las dos entradas exactas de redireccion y el tipo de SMTP registrados. Tarea 6 preparada, sin afirmar verificacion funcional o inspeccion directa; los flujos y entregas siguen pendientes de Phase 5. La preparacion se contrasto con [Email Auth](https://supabase.com/docs/guides/auth/passwords), [redirecciones](https://supabase.com/docs/guides/auth/redirect-urls) y SMTP el 2026-10-23. La tarea 5 y Phase 4 siguen abiertas.

## Tarea 7: bucket media y rechazo anonimo

Iniciada por autorizacion del propietario el 2026-10-23, manteniendo abierta la verificacion CLI de tarea 5. Storage no depende de resolver ese camino de Prisma. Se revisaron las skills locales: ninguna corresponde a esta preparacion de Dashboard y comprobacion de infraestructura sin implementar media. Archivos permitidos: esta guia y `docs/15-current-status.md`; excluidos: codigo, entorno, modelos, migraciones, seeds y diseno publico. Sin nuevas dependencias.

Inspeccion remota de solo lectura realizada por el agente mediante pg, con el `DATABASE_URL` existente y TLS autorizado, dentro de `BEGIN READ ONLY` y `ROLLBACK`: `media` no existe en `storage.buckets`, RLS esta activado en `storage.objects` y `pg_policies` no contiene politicas para esa tabla. No se consultaron objetos ni se modificaron recursos. No confundir esta inspeccion por pg con la verificacion pendiente de Prisma CLI.

El propietario confirmo la creacion de `media` privado en Dashboard. La inspeccion posterior del agente confirma que existe, tiene `public=false`, RLS sigue activo y no hay politicas en `storage.objects`, incluidas las generales. No se anadieron politicas ni permisos para `anon` o `authenticated`. No se configura aun el flujo de subida ni la lectura publica.

Tras confirmar la creacion, repetir la inspeccion de bucket, RLS y todas las politicas de `storage.objects`, incluidas las generales. Si siguen sin permitir escrituras anonimas, realizar una unica subida controlada sin sesion, usando solo la publishable key local y un nombre unico, sin upsert ni credenciales privilegiadas. Exigir rechazo por permisos/RLS: un error de red, clave invalida o bucket inexistente no acredita este criterio. Comprobar despues mediante consulta de solo lectura que no se creo ese objeto. Si se acepta inesperadamente, detener las pruebas y registrar el incidente y la limpieza pendiente, sin ampliar permisos ni borrar otros objetos.

Criterios de aceptacion comprobados el 2026-10-23: `media` existe y es privado, RLS activo y cero politicas en `storage.objects` (sin concesiones anonimas de INSERT/UPDATE/DELETE). Se realizo una unica peticion POST al endpoint Storage de objetos, con un nombre UUID nuevo bajo `phase-4-verification/`, contenido de texto inocuo, `x-upsert=false` y solo la publishable key del entorno local en `apikey`; sin Authorization, cookies, sesion ni claves privilegiadas en la solicitud. Se verifico previamente que URL publica y conexion PostgreSQL pertenecen al mismo proyecto, sin publicar valores.

La respuesta fue HTTP 400 con `statusCode=403` en el cuerpo y mensaje de violacion de row-level security. No se trata de un fallo de red, JWT o bucket inexistente. Una consulta parametrizada de solo lectura a `storage.objects` confirma cero filas para el bucket y nombre exactos antes y despues del intento. No se creo el objeto ni fue necesaria limpieza. La conexion pg usada solo para inspeccion tenia TLS autorizado; no intervino en la solicitud de subida ni eludio RLS. Tarea 7 verificada; Phase 4 sigue abierta por CLI y validacion final.

Ejecucion puntual con Node, fetch y pg ya disponibles, sin SDK nuevo ni script persistente. No cambia codigo de apps/packages: no hay workspaces afectados para lint/check-types/build, ni motivo para repetir la prueba Prisma que no interviene en Storage. Validacion documental: `git diff --check`. Referencias de la prueba: [publishable key sin sesion corresponde a anon](https://supabase.com/docs/guides/getting-started/api-keys) y [errores de Storage](https://supabase.com/docs/guides/storage/debugging/error-codes).

Referencias contrastadas el 2026-10-23: [crear buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets), [buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals) y [control de acceso](https://supabase.com/docs/guides/storage/security/access-control). Storage deniega subidas sin politicas RLS que las permitan; no copiar las politicas permisivas de los ejemplos para esta fase.

## Secuencia y revisiones

| Tarea | Depende de | Entrega |
| --- | --- | --- |
| 1. Documentacion | Plan autorizado | Esta guia, AGENTS, roadmap y estado; sin cambios de codigo ni Dashboard |
| 2. Entorno publico | 1 revisada | Integrado en `cb7ca8e`: publishable key y validacion desde el layout, sin cambios visuales |
| 3. Entorno servidor | 1; ejecutar tras 2 | Integrado en `36e0b26`: ejemplos API/DB, protocolos/host validados, pruebas y TLS documentado, sin requisito de JWT secret |
| 4. Prueba runtime | 3 | Integrado en `d19cb94`: `db:check:runtime`, consulta fija, limite de 10 segundos, cierre y salida sin secretos |
| 5. Proyecto y entorno real | 2, 3, 4 | Runtime y CLI verificados; Direct depende de WARP/hosts en macOS; cierre confirmado por el propietario tras PR #7 |
| 6. Email y URLs | Proyecto y entorno de 5 preparados; excepcion autorizada para avanzar con CLI pendiente | Preparada por confirmacion del propietario: Email, URLs exactas y SMTP incluido; sin implementar ni probar autenticacion |
| 7. Storage | Proyecto/entorno de 5 preparados; continuacion autorizada con CLI pendiente | Verificada: media privado, RLS activo, cero politicas, subida anonima rechazada por RLS y objeto ausente |
| 8. Verificacion final | 1 a 7 | Aplicaciones, health, mocks y conectividad comprobados; registro en docs/17-phase-4-validation.md; fase cerrada tras PR #7 y autorizacion de continuar con Phase 5 |

Antes de cada tarea confirmar sus archivos permitidos/excluidos. En la tarea 1 solo se modifican `AGENTS.md`, `docs/12-roadmap.md`, este documento y `docs/15-current-status.md`. No modificar el registro historico `docs/16-phase-3-validation.md`.

Tras cada implementacion ejecutar lint, check-types y build de los workspaces afectados y pruebas de Prisma/conectividad aplicables. Resumir archivos, decisiones, limitaciones y documentacion; proporcionar titulo y descripcion de commit en ingles. Detenerse para revision: el propietario crea/sube el commit y autoriza la siguiente tarea. Para cambios exclusivamente documentales no hay workspaces afectados: validar diff y coherencia con codigo/fuentes, sin presentar pruebas historicas como nuevas.

## Comandos y cierre

Sin credenciales se pueden ejecutar estos comandos existentes:

```bash
pnpm --filter @repo/db prisma:validate
pnpm --filter @repo/db prisma:generate
```

Con `DIRECT_URL` configurada, el comando existente siguiente ejecuta exclusivamente `SELECT 1` por Prisma CLI:

```bash
pnpm --filter @repo/db db:check
```

El comando independiente de runtime ya esta disponible:

```bash
pnpm --filter @repo/db db:check:runtime
```

Genera el cliente y compila `scripts/check-runtime.ts` con el TypeScript existente antes de ejecutar JavaScript en `dist/runtime-check/` (ignorado por Git). No requiere nuevas dependencias ni soporte TypeScript nativo de Node; conserva el minimo Node 20.19. `tsconfig.json` incluye los scripts para que los checks habituales tambien los revisen. No cambia la factoria compartida ni la configuracion de Prisma CLI.

El script carga silenciosamente `packages/db/.env` al ejecutarse desde el package mediante pnpm. Solo usa `DATABASE_URL`, sin fallback a `DIRECT_URL`. Rechaza ausencia, protocolo ajeno a PostgreSQL o falta de host antes de conectar. La factoria `createPrismaClient` ejecuta la consulta fija `SELECT 1 AS ok`, verifica una unica fila con `ok = 1` y llama a `$disconnect()` en `finally` antes de anunciar exito. No necesita modelos ni accede a tablas.

El limite fijo de 10 segundos abarca conexion, consulta y desconexion, despues de generar/compilar. Si se supera, fuerza salida con codigo 1 y el sistema operativo cierra los sockets; no se promete desconexion ordenada en ese caso. Los demas fallos tambien devuelven codigo 1 con mensajes genericos, sin imprimir excepciones del driver, URIs ni credenciales. Exito devuelve codigo 0. El script respeta las opciones TLS de la URL; no valida por si mismo la politica TLS ni acredita la identidad del servidor solo por completar SELECT 1.

Referencia: [consultas raw de Prisma](https://www.prisma.io/docs/orm/v7/prisma-client/using-raw-sql/raw-queries). La prueba local de codigo/control de errores no sustituye la ejecucion contra Supabase con TLS configurado.

Validacion final prevista tras preparar el entorno real:

```bash
pnpm lint
pnpm check-types
pnpm build
pnpm --filter api run test --runInBand
pnpm --filter api run test:e2e --runInBand
pnpm dev
```

Con los servidores activos, desde otra terminal:

```bash
curl --fail --silent --show-error http://localhost:3001/health
git check-ignore apps/web/.env.local apps/api/.env packages/db/.env
git diff --check
```

No ejecutar `db:migrate`, `db:deploy`, `db:push`, seeds ni DDL como comprobacion de conexion. La primera migracion se planificara con el primer modelo persistente.

Phase 4 cerrada tras PR #7 y confirmacion del propietario el 23 de octubre de 2026. Checklist basado en las evidencias existentes, sin nuevas pruebas en esta actualizacion documental:

- [x] Proyecto operativo y configuracion por consumidor, sin `.env` raiz ni secretos versionados/publicos; alcance de revision en docs/17-phase-4-validation.md.
- [x] Contratos de entorno y ejemplos alineados; ausencia de Supabase permitida para desarrollo mock.
- [x] CLI y runtime conectan con pruebas de solo lectura independientes y TLS verificado; CLI requiere WARP/hosts local.
- [x] Email, confirmacion, URLs exactas y limites de correo preparados para Phase 5 por confirmacion del propietario.
- [x] `media` existe con visibilidad documentada y sin escrituras anonimas; politicas y rechazo comprobados.
- [x] Web/API arrancan con configuracion real; `/health` devuelve HTTP 200 y `{"status":"ok"}`; puertos y limites en docs/17-phase-4-validation.md.
- [x] Home, wiki, juegos y detalles conservan mocks y diseno.
- [x] Registro disponible en `docs/17-phase-4-validation.md`, incluido CLI verificado y requisitos WARP/hosts; cierre documentado tras merge `b324cd5` y autorizacion del propietario para continuar con Phase 5.

## Vigencia

Recomendaciones contrastadas con las fuentes oficiales enlazadas el 21 de octubre de 2026. Volver a contrastar opciones concretas si cambia el servicio, la version instalada o el entorno antes de configurar recursos. Los ejemplos genericos no sustituyen las cadenas y opciones del proyecto real.
