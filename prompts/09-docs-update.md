# Prompt: Update documentation

## Objetivo

Actualizar documentación para reflejar este cambio:

`<DESCRIBE_CHANGE_HERE>`

## Contexto obligatorio

Lee:

- `AGENTS.md`
- `docs/`
- `.ai/skills/`

## Archivos permitidos

```txt
AGENTS.md
docs/**
.ai/**
README.md
```

## Requisitos

- Mantener documentación clara para humanos y agentes IA.
- No duplicar información innecesariamente.
- Si se cambia arquitectura, actualizar:
  - `AGENTS.md`
  - `docs/01-architecture.md`
  - docs específicos afectados
- Si se cambia roadmap, actualizar `docs/12-roadmap.md`.
- Si se añade un nuevo patrón repetible, considerar añadir skill o prompt.

## Restricciones

- No modificar código.
- No cambiar decisiones técnicas sin justificarlo.
- No borrar contexto útil.

## Respuesta esperada

- Archivos modificados.
- Qué se actualizó.
- Qué decisiones quedan documentadas.
