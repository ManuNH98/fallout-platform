# 04. Database model

## Entorno vigente

PostgreSQL local nativo para desarrollo, Supabase PostgreSQL como destino de
produccion; L1 instalada y validada con PostgreSQL 17.11; migracion L2 pendiente. Un unico
schema e historial Prisma; no duplicar migraciones por entorno. Las diferencias
de roles SQL, RLS y validacion remota se detallan en
[docs/19](19-local-development-database.md). Auth sigue remoto; no crear auth.users
ni relaciones a schemas Supabase en la DB local.

## Principles

The database should support:

- wiki pages
- structured entities
- relationships
- games
- categories
- sources
- media
- users
- roles
- future builds
- future favorites
- future guides/mods

Do not overbuild every future feature immediately, but avoid a schema that blocks them.

## Initial enums

Recommended conceptual enums:

```prisma
enum UserRole {
  USER
  ADMIN
  EDITOR
  MODERATOR
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum WikiPageType {
  CHARACTER
  FACTION
  LOCATION
  QUEST
  ITEM
  WEAPON
  ARMOR
  CREATURE
  PERK
  LORE
  TERMINAL
  NOTE
  HOLOTAPE
  GENERAL
}

enum CanonStatus {
  CANON
  NON_CANON
  CUT_CONTENT
  CREATION_CLUB
  MOD
  UNKNOWN
}
```

## Initial models

### UserProfile

The application profile linked to Supabase Auth user id.

Contrato minimo de Phase 5 (schema y SQL preparados en tarea 6; sin aplicacion local ni remota):

| Campo | Contrato |
| --- | --- |
| id | UUID local, clave primaria |
| supabaseUserId | UUID obligatorio y unico, obtenido de identidad verificada |
| username | String opcional, sin requisito de unicidad ni flujo de eleccion en Phase 5 |
| displayName | String opcional |
| avatarUrl | String opcional; sin flujo de subida ni edicion en esta fase |
| role | UserRole obligatorio, USER por defecto |
| createdAt | Fecha de creacion |
| updatedAt | Fecha de actualizacion |

La API crea o recupera el perfil idempotentemente mediante POST /auth/perfil.
Las lecturas no crean filas. Repetir la sincronizacion no cambia roles ni
sobrescribe campos existentes. No guardar passwords, sesiones ni refresh tokens;
no copiar email sin necesidad ni aceptar roles desde metadata/formularios.
No modificar auth.users ni crear relaciones de contenido o triggers.
Revisar RLS y permisos de Data API en la migracion; el navegador no accede a
esta tabla directamente. La autorizacion de negocio permanece en NestJS.

Secuencia, migracion y pruebas en [el contrato de Phase 5](18-phase-5-auth-foundation.md).

### Game

Represents Fallout games and related media.

Fields:

- id
- title
- slug
- shortName
- description
- releaseDate
- coverImageUrl
- sortOrder
- createdAt
- updatedAt

Examples:

- Fallout
- Fallout 2
- Fallout 3
- Fallout: New Vegas
- Fallout 4
- Fallout 76
- Fallout Tactics
- Fallout Shelter
- Fallout TV Series
- Comics

### Category

Represents content categories.

Fields:

- id
- name
- slug
- description
- parentId
- createdAt
- updatedAt

Examples:

- Personajes
- Facciones
- Localizaciones
- Misiones
- Armas
- Armaduras
- Criaturas
- Perks
- Objetos
- Mods
- Guías
- Builds

### WikiPage

Core wiki content.

Fields:

- id
- title
- slug
- summary
- bodyMarkdown
- type
- status
- canonStatus
- coverImageUrl
- language
- publishedAt
- createdAt
- updatedAt
- authorId
- updatedById

Relations:

- games
- categories
- sources
- related pages
- media

### WikiPageGame

Many-to-many between WikiPage and Game.

Fields:

- wikiPageId
- gameId

### WikiPageCategory

Many-to-many between WikiPage and Category.

Fields:

- wikiPageId
- categoryId

### WikiRelation

Relation between pages.

Fields:

- id
- fromPageId
- toPageId
- relationType
- note
- createdAt

Examples relation types:

- appears_in
- member_of
- enemy_of
- ally_of
- located_in
- related_to
- variant_of
- prerequisite_of

### Source

References and sources.

Fields:

- id
- title
- url
- type
- description
- createdAt
- updatedAt

Possible source types:

- official_site
- game_dialogue
- terminal
- holotape
- quest_log
- tv_series
- comic
- mod_page
- other

### WikiPageSource

Many-to-many between WikiPage and Source.

Fields:

- wikiPageId
- sourceId
- note

### MediaAsset

Stores metadata about files in Supabase Storage.

Fields:

- id
- bucket
- path
- publicUrl
- altText
- caption
- mimeType
- size
- width
- height
- createdAt
- updatedAt
- uploadedById

## Future models

### Guide

For curated guides.

Fields:

- id
- title
- slug
- summary
- bodyMarkdown
- status
- gameId
- authorId
- createdAt
- updatedAt

### Mod

For mod recommendations.

Fields:

- id
- name
- slug
- summary
- descriptionMarkdown
- gameId
- externalUrl
- installationNotes
- compatibilityNotes
- status
- createdAt
- updatedAt

### Build

For Fallout 76 builds.

Fields:

- id
- title
- slug
- description
- ownerId
- gameId
- visibility
- specialJson
- perksJson
- mutationsJson
- weaponsJson
- armorJson
- status
- createdAt
- updatedAt

Early implementation may store build details as JSON while the system is being explored.

Later, normalize perks, mutations, weapons and armor into dedicated tables.

## Hitos Prisma por fase

**Phase 5:** implementar solo UserProfile y UserRole, mediante tareas separadas
de modelo/SQL, aplicacion autorizada y sincronizacion en API. No implementar
todo el modelo conceptual de este documento en una sola entrega.

**Phase 6:** implementar los modelos de contenido:

- Game
- Category
- WikiPage
- WikiPageGame
- WikiPageCategory
- WikiRelation
- Source
- WikiPageSource
- MediaAsset

Then add Guide, Mod and Build when the first wiki/admin flow is stable.
