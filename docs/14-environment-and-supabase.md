# 14. Environment and Supabase

## Objetivo

Documentar la configuracion local y externa necesaria para conectar Next.js, NestJS, Prisma y Supabase sin compartir secretos entre aplicaciones.

No se debe crear un archivo `.env` en la raiz del monorepo. Cada aplicacion o package mantiene solo las variables que consume.

## Estado actual

La configuracion de codigo, ejemplos de entorno, Prisma, CORS y health endpoint esta preparada. La creacion y conexion del proyecto Supabase real se ha aplazado para permitir que el primer desarrollo visual avance con datos mock.

No se instalara Supabase local ni se introducira Docker mientras esa alternativa no se planifique expresamente. Antes de implementar autenticacion o persistencia real se retomaran los pasos de este documento.

## Requisitos

- Node.js 20.19 o superior.
- pnpm 9.
- Un proyecto de Supabase.
- Acceso al Dashboard de Supabase para obtener credenciales y configurar Auth y Storage.

## Web

Crear `apps/web/.env.local` a partir de `apps/web/.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-supabase-anon-key
```

Estas variables forman parte del bundle publico. Nunca se debe colocar aqui el service role key, el JWT secret ni credenciales de PostgreSQL.

## API

Crear `apps/api/.env` a partir de `apps/api/.env.example`:

```bash
NODE_ENV=development
PORT=3001
WEB_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_JWT_SECRET=replace-with-supabase-jwt-secret
SUPABASE_STORAGE_BUCKET=media
```

`DATABASE_URL` usa el transaction pooler de Supavisor para las conexiones de runtime. Las variables sensibles de la API deben existir solo en entornos de servidor.

## Prisma CLI

Crear `packages/db/.env` a partir de `packages/db/.env.example`:

```bash
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres"
```

Prisma Client usa `DATABASE_URL` en runtime. Prisma CLI y las migraciones usan `DIRECT_URL` para evitar ejecutar migraciones mediante el transaction pooler.

Comandos disponibles:

```bash
pnpm --filter @repo/db prisma:validate
pnpm --filter @repo/db prisma:generate
pnpm --filter @repo/db db:check
pnpm --filter @repo/db db:migrate
pnpm --filter @repo/db db:deploy
pnpm --filter @repo/db db:studio
```

## Supabase Project

Pasos que debe realizar el propietario en Supabase Dashboard:

1. Crear el proyecto y guardar de forma segura la contrasena de PostgreSQL.
2. Copiar Project URL y anon key desde Project Settings > API.
3. Copiar el JWT secret para uso exclusivo de la API durante Phase 2.
4. Copiar las connection strings de transaction pooler y session pooler desde Database Settings.
5. Mantener habilitado Email en Authentication > Providers para el flujo inicial.
6. Configurar Site URL como `http://localhost:3000` durante desarrollo.
7. Anadir las URLs de redireccion necesarias para login y recuperacion cuando se implementen en Phase 2.
8. Crear un bucket llamado `media` en Storage.
9. Permitir lectura publica del bucket solo si los assets publicados deben servirse directamente.
10. No permitir escrituras anonimas; las subidas se autorizaran mediante el flujo de la API.

## Seguridad

- No commitear archivos `.env` ni secretos.
- No exponer `SUPABASE_JWT_SECRET` ni service role keys al frontend.
- No confiar en roles enviados por el frontend.
- NestJS validara los JWT y aplicara autorizacion en Phase 2.
- Los cambios del schema de aplicacion se realizaran mediante Prisma.
- Las reglas de Storage se mantendran simples y se documentaran cuando se implemente el modulo de media.

## Verificacion

Sin credenciales externas se puede validar schema y generacion:

```bash
pnpm --filter @repo/db prisma:validate
pnpm --filter @repo/db prisma:generate
```

Con `DIRECT_URL` configurada, el siguiente comando ejecuta `SELECT 1` sin modificar datos y verifica el acceso efectivo a Supabase PostgreSQL:

```bash
pnpm --filter @repo/db db:check
```

La primera migracion se creara cuando se anada el primer modelo persistente.
