# Prompt: Pre-commit review

Revisa el estado del repo antes de hacer commit.

## Contexto

Sigue:

- `AGENTS.md`
- `docs/`
- `.ai/skills/`

## Tarea

Analiza los cambios actuales y dime si están listos para commit.

## Revisa

1. Cambios fuera de alcance.
2. Archivos generados que no deberían commitearse.
3. Secretos o `.env`.
4. Problemas de arquitectura.
5. Problemas de tipos/lint.
6. Documentación necesaria.
7. Mensaje de commit recomendado.

## Responde con

- Estado: listo / no listo.
- Bloqueantes.
- Recomendaciones.
- Comandos a ejecutar.
- Mensaje de commit sugerido.

## Restricciones

- No modifiques archivos.
