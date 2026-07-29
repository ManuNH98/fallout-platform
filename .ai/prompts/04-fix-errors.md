# Prompt: Fix errors

Hay errores después de ejecutar:

```bash
<COMMAND_HERE>
```

Errores:

```txt
<PASTE_ERROR_HERE>
```

## Contexto obligatorio

Lee:

- `AGENTS.md`
- `docs/`
- `.ai/skills/`

## Tarea

Corrige únicamente los errores indicados.

## Archivos permitidos

```txt
<ALLOWED_FILES_OR_FOLDERS>
```

## Restricciones

- No refactorices código no relacionado.
- No cambies arquitectura.
- No añadas dependencias salvo que sea imprescindible.
- No modifiques documentación salvo que el error esté causado por documentación incorrecta.
- Mantén el cambio mínimo.

## Validación

Al terminar, ejecuta o indica:

```bash
<COMMAND_HERE>
pnpm check-types
pnpm lint
```

## Respuesta esperada

1. Causa del error.
2. Archivos modificados.
3. Solución aplicada.
4. Resultado de validación.
