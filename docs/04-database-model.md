# 04. Database model

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

Fields:

- id
- supabaseUserId
- username
- displayName
- avatarUrl
- role
- createdAt
- updatedAt

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

## Suggested first Prisma milestone

Implement only:

- UserProfile
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
