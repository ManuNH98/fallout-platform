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

NestJS should:

1. validate the Supabase JWT
2. load or create the local `UserProfile`
3. attach the app user to the request
4. check role when required

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
- backend uses schema for request validation or mirrors it in DTOs

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
