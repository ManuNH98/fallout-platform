# Prompt: Create admin page

## Objetivo

Crear la página de admin:

`<ADMIN_ROUTE_HERE>`

## Contexto obligatorio

Lee:

- `AGENTS.md`
- `docs/06-frontend-conventions.md`
- `docs/08-admin-panel.md`
- `.ai/skills/`

## Archivos permitidos

```txt
apps/web/src/app/(admin)/**
apps/web/src/features/<FEATURE_NAME>/**
apps/web/src/components/**
```

## Requisitos

- Usar Next.js App Router.
- Usar TypeScript.
- Usar textos en español.
- Usar patrones compatibles con shadcn/ui.
- Incluir estados de carga, vacío y error si hay datos.
- Añadir TODO claro si aún no hay integración con API.
- Mantener la página simple y componible.

## Restricciones

- No modificar backend.
- No añadir dependencias salvo que sea imprescindible.
- No mover componentes globales sin necesidad.
- No crear una app admin separada.

## Validación

```bash
pnpm check-types
pnpm lint
```

## Respuesta esperada

- Ruta creada.
- Componentes creados.
- TODOs.
- Resultado de validación.
