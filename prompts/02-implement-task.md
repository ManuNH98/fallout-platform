# Prompt: Implement a scoped task

## Objetivo

`<DESCRIBE_EXACT_TASK_HERE>`

## Contexto obligatorio

Lee antes de implementar:

- `AGENTS.md`
- `docs/`
- `.ai/skills/`

## Skills a usar

Usa estas skills si aplican:

- `<SKILL_NAME_1>`
- `<SKILL_NAME_2>`

## Archivos permitidos

Puedes modificar únicamente:

```txt
<ALLOWED_PATH_1>
<ALLOWED_PATH_2>
```

## Archivos prohibidos

No modifiques:

```txt
<FORBIDDEN_PATH_1>
<FORBIDDEN_PATH_2>
```

## Requisitos

- `<REQUIREMENT_1>`
- `<REQUIREMENT_2>`
- `<REQUIREMENT_3>`

## Restricciones

- No cambies la arquitectura.
- No añadas dependencias nuevas salvo que sea imprescindible y lo expliques.
- No modifiques archivos no relacionados.
- No hardcodees secretos.
- No dupliques tipos si deben estar en `packages/types`.
- No dupliques validaciones si deben estar en `packages/validation`.
- El texto visible para usuarios debe estar en español.
- Sigue los patrones existentes del repo.

## Validación

Al terminar, ejecuta o indica el resultado esperado de:

```bash
pnpm lint
pnpm check-types
pnpm build
```

## Respuesta esperada

Resume:

1. Archivos modificados.
2. Qué se implementó.
3. Decisiones tomadas.
4. TODOs pendientes.
5. Resultado de validación.
