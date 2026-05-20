# Prompt: Create NestJS API module

## Objetivo

Crear el módulo de API:

`<MODULE_NAME>`

## Contexto obligatorio

Lee:

- `AGENTS.md`
- `docs/05-api-conventions.md`
- `docs/04-database-model.md`
- `.ai/skills/`

## Archivos permitidos

```txt
apps/api/src/modules/<MODULE_NAME>/**
apps/api/src/app.module.ts
```

## Requisitos

- Crear `<MODULE_NAME>.module.ts`.
- Crear `<MODULE_NAME>.controller.ts`.
- Crear `<MODULE_NAME>.service.ts`.
- Crear carpeta `dto/`.
- Crear DTOs básicos de create/update/query si aplica.
- Usar rutas REST.
- Mantener controllers finos.
- Mantener lógica en services.
- No consultar Prisma directamente desde controller.
- Registrar el módulo en `app.module.ts`.
- Añadir TODOs claros si todavía no existe integración real con Prisma.

## Restricciones

- No modificar frontend.
- No modificar Prisma salvo que se indique explícitamente.
- No añadir dependencias.
- No implementar auth si esta tarea no lo pide.

## Validación

```bash
pnpm check-types
pnpm lint
```

## Respuesta esperada

- Endpoints creados.
- Archivos modificados.
- TODOs.
- Resultado de validación.
