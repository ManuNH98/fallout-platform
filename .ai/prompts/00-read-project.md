# Prompt: Read project context

Lee el contexto completo del proyecto antes de tocar código.

## Instrucciones

Lee estos archivos/carpetas:

- `AGENTS.md`
- `docs/`
- `.ai/skills/` si existe
- `package.json`
- `turbo.json`
- `pnpm-workspace.yaml`
- `apps/web/package.json`
- `apps/api/package.json`
- `packages/ui/package.json`

No modifiques ningún archivo.

## Responde con

1. Resumen de la arquitectura.
2. Stack técnico.
3. Responsabilidad de cada app y package.
4. Reglas más importantes de `AGENTS.md`.
5. Roadmap recomendado.
6. Riesgos o incoherencias detectadas.
7. Primeras 5 tareas técnicas recomendadas.

## Restricciones

- No escribas código.
- No propongas cambiar la arquitectura salvo que detectes un problema real.
- No inventes carpetas o herramientas que no existan en el repo.
