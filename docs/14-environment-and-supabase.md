# 14. Environment and Supabase

## Objetivo y alcance

Preparar y verificar Supabase remoto en Phase 4, manteniendo las responsabilidades de `docs/01-architecture.md`. El frontend conserva los mocks y el diseno publico. No crear `.env` en la raiz del monorepo: cada aplicacion/package mantiene su entorno.

No introducir Docker, Supabase local ni dependencias sin justificar. Login, registro, sesiones, roles y validacion JWT corresponden a Phase 5. No anadir modelos, migraciones, seeds ni sustituir mocks en Phase 4.

## Estado comprobado de Phase 4

Revision del 21 de octubre de 2026. Las tareas 1 a 4 estan integradas. El propietario ha creado el proyecto y rellenado el entorno local en la tarea 5, todavia en curso. Runtime conecta con TLS verificado; la validacion estricta de certificados de Prisma CLI en macOS sigue pendiente.

- Web: App Router en `apps/web/app/`, sin `src/`, puerto `3000`. `next.config.js` valida la URL de API. El layout raiz importa `apps/web/lib/env.ts`, por lo que la validacion publica tambien se ejecuta al cargar el layout de servidor, incluido el build.
- API: puerto `3001`, ConfigModule, validacion de protocolos/host y CORS con `WEB_URL`. Las variables externas son opcionales. No consume `@repo/db`.
- `GET /health` devuelve `{"status":"ok"}`: acredita disponibilidad de API, no conectividad con PostgreSQL, Auth o Storage.
- DB: Prisma/client/adapter-pg `7.9.1`, schema sin modelos y factoria `createPrismaClient(connectionString)` preparada.
- Prisma CLI carga dotenv en `packages/db` y usa `DIRECT_URL` mediante `datasource.url` en `prisma.config.ts`. Sin ella se permite validar/generar localmente.
- `db:check` ejecuta `prisma/check-connection.sql`, que contiene solo `SELECT 1;`, por la URL de CLI. `db:check:runtime` comprueba `DATABASE_URL` mediante la factoria Prisma existente y `SELECT 1 AS ok`; runtime ya ha pasado contra Supabase; CLI paso con cifrado, pero falla al exigir confianza estricta en macOS.
- Los archivos `apps/web/.env.local`, `apps/api/.env` y `packages/db/.env` existen localmente y estan ignorados por Git. El certificado CA local en `packages/db/.certs/prod-ca-2021.pem` tambien esta ignorado; no se versionan valores ni credenciales.

## Diferencias entre codigo y configuracion objetivo

Los contratos y ejemplos publicos/de servidor estan actualizados. La tabla distingue la preparacion local de las verificaciones externas pendientes.

| Area | Contrato actual | Objetivo de Phase 4 |
| --- | --- | --- |
| Web | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en ejemplo/helper/Turbo; helper importado desde el layout raiz | Entorno real rellenado; formato y coherencia local comprobados, sin ejecutar Auth |
| API | Sin `SUPABASE_JWT_SECRET` en ejemplo, tipo ni Turbo; URLs opcionales con protocolos y host validados | Implementado en tarea 3; registrar sistema de firma remoto antes de Phase 5 |
| PostgreSQL | Session pooler `5432`; CA descargada por el propietario y configurada localmente | Runtime verificado; confianza estricta de CLI en macOS pendiente |
| Verificacion | `db:check` por `DIRECT_URL` y `db:check:runtime` por `DATABASE_URL` | SELECT 1 de runtime correcto; CLI con `sslaccept=strict` falla por confianza TLS |

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

El ejemplo de `DIRECT_URL` usa `sslmode=require`, que Prisma CLI documenta para exigir TLS. La documentacion de su conector PostgreSQL enumera `sslcert` para el certificado de servidor, mientras pg utiliza `sslrootcert` para la CA: no copiar opciones entre ambos caminos sin verificarlas. La configuracion de confianza y la comprobacion de identidad del servidor siguen pendientes del endpoint real. `require` por si solo no acredita que se haya verificado esa identidad.

### Verificacion real de tarea 5: macOS

El propietario descargo la CA desde Supabase Dashboard. Se verifico que es una CA vigente y se copio como PEM a un archivo local ignorado. Las dos URLs de runtime usan `sslmode=verify-full` y `sslrootcert` con ruta absoluta al PEM. `db:check:runtime` pasa contra Supabase y una comprobacion con el mismo driver pg confirma conexion cifrada y certificado autorizado.

Para CLI se configuro `sslmode=require`, `sslcert` con la CA y `sslaccept=strict`. El primer SELECT 1 con solo `require` habia pasado, pero el modo estricto falla con P1011 (certificado no confiable). Anadir tambien `sslrootcert` o cambiar la codificacion de la ruta en pruebas temporales no lo resolvio. El verificador nativo de macOS, con la CA explicita, devuelve `CSSMERR_TP_NOT_TRUSTED` e informa que Certificate Transparency no esta verificado. Se ha reproducido el rechazo nativo; no se declara resuelta su causa ni se atribuye a credenciales incorrectas.

Las URLs de runtime y CLI apuntan al mismo endpoint, usuario y base; no se publican sus valores. No se ha debilitado TLS ni instalado confianza en llaveros. Una posible siguiente accion es evaluar una regla de confianza de usuario restringida a SSL y al host del pooler; requiere autorizacion explicita porque modifica la confianza del sistema fuera del repositorio. Su eficacia aun no esta comprobada. Hasta resolverlo y repetir CLI, la tarea 5 y Phase 4 permanecen abiertas.

Referencia de los parametros del motor nativo: [parser de conexiones de Prisma](https://github.com/prisma/prisma-engines/blob/main/quaint/src/connector/postgres/url.rs) y [carga de la CA y modo estricto](https://github.com/prisma/prisma-engines/blob/main/quaint/src/connector/postgres/native/mod.rs). Las opciones del driver pg y del motor nativo se comprueban por separado.

Referencias adicionales: [TLS de node-postgres](https://node-postgres.com/features/ssl) y [conector PostgreSQL de Prisma](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql).

Mantener Prisma 7: URL de CLI en `prisma.config.ts`, carga explicita de entorno y adapter en runtime. No reintroducir `directUrl` en el schema ni exigir credenciales para generar el cliente sin conexion.

Referencias: [Supabase con Prisma](https://supabase.com/docs/guides/database/prisma), [conexiones y SSL](https://supabase.com/docs/guides/database/connecting-to-postgres), [Prisma y PgBouncer](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/pgbouncer), [configuracion Prisma 7](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference) y [certificados en Prisma 7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).

## Pasos del propietario en Supabase Dashboard

Estos pasos se ejecutan en tareas posteriores, tras revisar la preparacion local.

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

## Secuencia y revisiones

| Tarea | Depende de | Entrega |
| --- | --- | --- |
| 1. Documentacion | Plan autorizado | Esta guia, AGENTS, roadmap y estado; sin cambios de codigo ni Dashboard |
| 2. Entorno publico | 1 revisada | Integrado en `cb7ca8e`: publishable key y validacion desde el layout, sin cambios visuales |
| 3. Entorno servidor | 1; ejecutar tras 2 | Integrado en `36e0b26`: ejemplos API/DB, protocolos/host validados, pruebas y TLS documentado, sin requisito de JWT secret |
| 4. Prueba runtime | 3 | Integrado en `d19cb94`: `db:check:runtime`, consulta fija, limite de 10 segundos, cierre y salida sin secretos |
| 5. Proyecto y entorno real | 2, 3, 4 | En curso: proyecto creado por el propietario y entorno rellenado; runtime correcto, CLI estricto pendiente en macOS |
| 6. Email y URLs | 5 | Configuracion y limites para Phase 5, sin implementar autenticacion |
| 7. Storage | 5 | Bucket/politicas revisados; rechazo de escritura anonima comprobado |
| 8. Verificacion final | 1 a 7 | Conexiones, arranque, health y mocks comprobados; registro antes del cierre |

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

Phase 4 solo puede cerrarse tras registrar estas evidencias sin secretos:

- [ ] Proyecto operativo y configuracion por consumidor, sin `.env` raiz ni secretos versionados/publicos.
- [ ] Contratos de entorno y ejemplos alineados; ausencia de Supabase permitida para desarrollo mock.
- [ ] CLI y runtime conectan con pruebas de solo lectura independientes y TLS verificado.
- [ ] Email, confirmacion, URLs exactas y limites de correo preparados para Phase 5.
- [ ] `media` existe con visibilidad documentada y sin escrituras anonimas; politicas y rechazo comprobados.
- [ ] Web/API arrancan con configuracion real; `/health` devuelve HTTP 200 y `{"status":"ok"}`.
- [ ] Home, wiki, juegos y detalles conservan mocks y diseno.
- [ ] Validaciones, limites y estado de despliegue registrados en la futura `docs/17-phase-4-validation.md`; roadmap/estado actualizados tras revision del propietario.

## Vigencia

Recomendaciones contrastadas con las fuentes oficiales enlazadas el 21 de octubre de 2026. Volver a contrastar opciones concretas si cambia el servicio, la version instalada o el entorno antes de configurar recursos. Los ejemplos genericos no sustituyen las cadenas y opciones del proyecto real.
