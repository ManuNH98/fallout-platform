# Prompt: Implement Supabase auth flow

## Objetivo

Implementar o modificar el flujo de autenticación:

`<DESCRIBE_AUTH_TASK_HERE>`

## Contexto obligatorio

Lee:

- `AGENTS.md`
- `docs/07-auth-and-permissions.md`
- `docs/06-frontend-conventions.md`
- `docs/05-api-conventions.md`
- `.ai/skills/`

## Archivos permitidos

```txt
apps/web/src/app/(auth)/**
apps/web/src/lib/supabase/**
apps/web/src/features/auth/**
apps/api/src/modules/auth/**
apps/api/src/common/guards/**
```

## Requisitos

- Usar Supabase Auth como identity provider.
- No exponer service role keys al frontend.
- Next.js debe obtener sesión/token de Supabase.
- NestJS debe validar tokens para endpoints protegidos.
- Roles de aplicación deben venir de la DB/app, no del frontend.
- Textos visibles en español.

## Restricciones

- No implementar auth propia con password en NestJS.
- No guardar secretos en código.
- No confiar en roles enviados por el cliente.
- No modificar modelos Prisma salvo que se autorice.

## Validación

```bash
pnpm check-types
pnpm lint
pnpm build
```

## Respuesta esperada

1. Flujo implementado.
2. Archivos modificados.
3. Variables de entorno necesarias.
4. Riesgos de seguridad.
5. Resultado de validación.
