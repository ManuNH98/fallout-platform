# 09. Wiki content model

## Goal

The wiki is the first major module of the platform.

It should support classic wiki pages, but also structured data, relationships, sources, filters and future search.

## Content style

The wiki should be:

- Spanish-first
- original
- readable
- structured
- SEO-friendly
- connected through internal links
- supported by sources where useful

## Main page types

Initial page types:

```txt
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
```

Future page types may be added.

## Page fields

Recommended fields:

```txt
title
slug
summary
bodyMarkdown
type
status
canonStatus
coverImageUrl
language
publishedAt
createdAt
updatedAt
authorId
updatedById
```

## Slugs

Slugs should be:

- lowercase
- URL-safe
- Spanish-friendly
- unique

Examples:

```txt
hermandad-del-acero
mr-house
new-vegas
servoarmadura-t-60
rifle-laser
```

## Status

Initial statuses:

```txt
DRAFT
PUBLISHED
ARCHIVED
```

## Canon status

Recommended values:

```txt
CANON
NON_CANON
CUT_CONTENT
CREATION_CLUB
MOD
UNKNOWN
```

## Game relations

A page may belong to one or more games.

Examples:

- Supermutante appears in multiple games.
- Mr. House belongs mainly to Fallout: New Vegas.
- Nuka-Cola appears across many games.

Use many-to-many relation between WikiPage and Game.

## Category relations

A page may belong to one or more categories.

Examples:

- Hermandad del Acero -> Facciones
- Rifle láser -> Armas
- Diamond City -> Localizaciones

Use many-to-many relation between WikiPage and Category.

## Public mock browsing contract

Durante Phase 3, `WikiArticleSummary` en `packages/types` incluye
`gameSlugs` y `categorySlugs` como colecciones de slugs. Estas relaciones
permiten filtrar un articulo asociado a varios juegos o categorias sin
interpretar etiquetas como "Varios juegos". Los campos `game` y `category`
se mantienen como etiquetas de presentacion para las tarjetas existentes.

`WikiArticleFilters` comparte la forma normalizada de la consulta:
`query`, `gameSlug` y `categorySlug`; una cadena vacia significa que ese
criterio no esta activo. Los parametros URL y su normalizacion pertenecen
a la feature wiki del frontend. Son contratos de navegacion publica sobre
mocks, no modelos Prisma ni endpoints de API implementados.

`WikiArticleDetail` extiende el resumen con `bodyMarkdown`, `sources` y
`relatedArticles` (resumenes, sin cuerpos anidados). `WikiSourceSummary`
identifica cada fuente mediante `id`, `title` y `reference`.

Los cuerpos originales, referencias y relaciones explicitas se almacenan
en `apps/web/lib/mocks/wiki-content.ts`, separados de los resumenes de
`public-content.ts`. Los mocks relacionan fuentes por identificador y
articulos por slug; la funcion `getWikiArticle` resuelve esas relaciones
antes de entregar los datos a la pagina. Un slug desconocido no devuelve
un articulo de sustitucion.

Las fuentes iniciales son referencias a escenas, conversaciones o elementos
dentro de los juegos, sin URLs ni citas textuales inventadas. Los textos son
fichas breves de muestra, no articulos editoriales completos. Cada cuerpo
empieza con un encabezado de nivel 2; el titulo y el resumen pertenecen a la
cabecera de la pagina. Los enlaces del cuerpo y los relacionados apuntan a
articulos que existen en la coleccion mock.

## Page relationships

Pages should link to other pages through explicit relationships.

Examples:

```txt
Mr. House -> related_to -> New Vegas
Hermandad del Acero -> enemy_of -> Enclave
Vault 111 -> located_in -> Commonwealth
Paladin Danse -> member_of -> Brotherhood of Steel
```

## Sources

Sources should be stored separately from pages.

A page may have many sources.

Source examples:

- official site
- in-game dialogue
- terminal entry
- quest log
- holotape
- TV episode
- comic
- mod page
- other

## Markdown body

Initial content body should be Markdown.

Future enhancements may include:

- MDX
- custom wiki links
- infobox syntax
- automatic internal link suggestions
- rich editor

## Suggested article structure

For a character:

```md
# Nombre

Resumen corto.

## Descripción

## Historia

## Apariciones

## Relaciones

## Curiosidades

## Fuentes
```

For a faction:

```md
# Nombre

Resumen corto.

## Descripción

## Historia

## Ideología

## Miembros conocidos

## Apariciones

## Relaciones

## Fuentes
```

For a weapon:

```md
# Nombre

Resumen corto.

## Descripción

## Estadísticas

## Variantes

## Localización

## Apariciones

## Fuentes
```

## Initial wiki milestone

First implementation should support:

- list published wiki pages
- view published wiki page
- admin list wiki pages
- admin create wiki page
- admin edit wiki page
- admin publish/archive page
- relate page to games
- relate page to categories
