# Prompt: Create Prisma database change

## Objetivo

Aplicar el siguiente cambio de base de datos:

`<DESCRIBE_DATABASE_CHANGE_HERE>`

## Contexto obligatorio

Lee:

- `AGENTS.md`
- `docs/04-database-model.md`
- `docs/07-auth-and-permissions.md`
- `.ai/skills/`

## Archivos permitidos

```txt
packages/db/**
```

## Requisitos

- Modificar `packages/db/prisma/schema.prisma`.
- Mantener nombres claros.
- Añadir `createdAt` y `updatedAt` en modelos persistentes.
- Usar enums cuando aplique.
- Añadir relaciones explícitas cuando aplique.
- No crear modelos futuros innecesarios.
- Añadir o actualizar exports si corresponde.

## Restricciones

- No modificar `apps/web`.
- No modificar `apps/api` salvo que se autorice.
- No ejecutar migraciones destructivas.
- No borrar modelos/campos existentes sin indicación expresa.
- No añadir datos seed salvo que se indique.

## Validación

```bash
pnpm --filter @repo/db prisma generate
pnpm check-types
```

## Respuesta esperada

1. Modelos/campos añadidos.
2. Relaciones añadidas.
3. Riesgos de migración.
4. Comandos recomendados para migrar.
