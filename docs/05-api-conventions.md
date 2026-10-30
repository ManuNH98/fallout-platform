# 05. API conventions

## API style

Use REST first.

GraphQL is not part of the initial plan.

## NestJS structure

Recommended structure:

```txt
apps/api/src/
  modules/
    auth/
    users/
    wiki/
    games/
    categories/
    media/
    guides/
    mods/
    builds/
    admin/
    health/
  common/
    decorators/
    filters/
    guards/
    interceptors/
    pipes/
  config/
  main.ts
```

## Module structure

Each domain module should usually include:

```txt
example/
  example.module.ts
  example.controller.ts
  example.service.ts
  dto/
    create-example.dto.ts
    update-example.dto.ts
    example-query.dto.ts
```

## Controller rules

Controllers should:

- define routes
- parse params/query/body
- call services
- return responses

Controllers should not:

- contain business logic
- query Prisma directly
- implement authorization logic manually if a guard/decorator fits better

## Service rules

Services should:

- contain business logic
- call Prisma/database layer
- validate domain rules
- prepare API responses

## Route naming

Use plural resource names.

Examples:

```txt
GET    /games
GET    /games/:slug
POST   /games
PATCH  /games/:id
DELETE /games/:id

GET    /wiki
GET    /wiki/:slug
POST   /wiki
PATCH  /wiki/:id
DELETE /wiki/:id
```

Admin-only endpoints can initially use the same endpoints protected by roles.

If needed later, add `/admin/*`.

## Response format

Initial recommendation: return plain JSON resources.

Example:

```json
{
  "id": "uuid",
  "title": "Hermandad del Acero",
  "slug": "hermandad-del-acero",
  "status": "PUBLISHED"
}
```

For lists:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## Error handling

Use consistent HTTP status codes:

- 400 validation error
- 401 unauthenticated
- 403 forbidden
- 404 not found
- 409 conflict
- 500 unexpected server error

## Auth convention

Protected requests from Next.js should include:

```txt
Authorization: Bearer <supabase_access_token>
```

Contrato API de Phase 5 implementado en tareas 4 y 8 (flujos web pendientes):

1. SupabaseAuthGuard verifica identidad ES256/JWKS; Current confirmado por el
   propietario y JWKS inspeccionado en tarea 4.
2. Carga el perfil existente cuando proceda, sin crearlo durante GET.
3. Adjunta identidad y perfil disponible al contexto de peticion; @CurrentUser
   expone el perfil local, nunca un perfil ficticio derivado del token.
4. RolesGuard comprueba el rol leido de PostgreSQL en esta peticion cuando se
   exige; sin @Roles explicito deniega y no hay jerarquia implicita.

| Endpoint | Contrato |
| --- | --- |
| POST /auth/perfil | Bearer valido, cuerpo vacio; crea o recupera perfil idempotentemente, HTTP 200. Permite identidad valida aun sin perfil. |
| GET /auth/me | Devuelve perfil existente, 404 si falta. Sin token valido, 401. No escribe datos. |
| GET /admin/comprobacion | Exclusivo ADMIN; 200 con mensaje en espanol, 401 sin identidad, 403 sin perfil o con otro rol. Sin panel admin. |

Rol inicial USER. La sincronizacion no acepta supabaseUserId/role del cliente
ni cambia privilegios existentes. Sin perfil, los endpoints por rol deniegan
acceso. Error de proveedor/JWKS/DB: 503 generico, sin permitir acceso ni filtrar
secretos. Health continua publico y no acredita Auth o PostgreSQL.

Tipos JSON compartidos en @repo/types: UserRole, UserProfileResponse y
AdminCheckResponse. Perfil con ocho campos documentados en docs/07, fechas ISO
y campos descriptivos nullables; seleccion explicita sin exponer Prisma ni sesion.
POST acepta sin cuerpo o {}; rechaza campos con 400. POST/GET de perfil y ADMIN
200 llevan Cache-Control: private, no-store; GET sin perfil conserva esa cabecera.
Un upsert con update vacio y recuperacion por P2002 resuelve la concurrencia sin
sobrescribir perfiles. El guard consulta DB en cada llamada privada.

Los claims role=authenticated de Supabase no son los roles de la aplicacion.
JWT secret, refresh tokens y claves privilegiadas no forman parte de este
contrato. Detalles y pruebas en [Phase 5](18-phase-5-auth-foundation.md).

## Roles

Initial roles:

- USER
- ADMIN
- EDITOR
- MODERATOR

Initial permissions:

```txt
Public:
- read published content

USER:
- own profile
- future saved builds/favorites

EDITOR:
- create/edit content drafts

ADMIN:
- full content management
- user management
- media management
```

## Validation

Use DTOs or shared Zod schemas.

Preferred long-term pattern:

- shared schema in `packages/validation`
- frontend uses schema for forms
- backend consumes the same schema when a rule is shared; DTOs must not duplicate shared validation logic

## Pagination

Use page/limit first.

Example query:

```txt
GET /wiki?page=1&limit=20&type=FACTION&status=PUBLISHED
```

## Sorting

Use explicit supported sort values.

Example:

```txt
?sort=title_asc
?sort=created_desc
?sort=updated_desc
```

## Search

Initial search can be simple SQL text search.

Future search may include PostgreSQL full-text search or semantic search.

## API documentation

Add Swagger/OpenAPI after initial modules are stable.

## Health endpoint

Create:

```txt
GET /health
```

Response:

```json
{
  "status": "ok"
}
```
