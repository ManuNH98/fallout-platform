# 10. Builds module

## Purpose

The builds module will allow users to create, save, share and explore builds, especially for Fallout 76.

This module may become one of the platform's strongest differentiators.

## Do not overbuild immediately

The system should be designed early, but implemented gradually.

Initial priority remains:

1. platform foundation
2. wiki
3. admin
4. auth
5. content CRUD

Builds can start once the foundation is stable.

## Long-term features

- Fallout 76 S.P.E.C.I.A.L. planner
- Perk cards
- Legendary perks
- Mutations
- Weapons
- Armor
- Power armor
- Legendary effects
- Playstyle tags
- Public/private builds
- Saved builds
- Build sharing
- Build ratings later
- Build guides
- Build comments later

## Initial build model

Early version can use JSON fields for flexible experimentation.

Recommended conceptual fields:

```txt
id
title
slug
description
ownerId
gameId
visibility
specialJson
perksJson
mutationsJson
weaponsJson
armorJson
tagsJson
status
createdAt
updatedAt
```

## Visibility

Recommended visibility values:

```txt
PRIVATE
PUBLIC
UNLISTED
```

## Status

Recommended status values:

```txt
DRAFT
PUBLISHED
ARCHIVED
```

## S.P.E.C.I.A.L.

Fallout 76 uses:

```txt
Strength
Perception
Endurance
Charisma
Intelligence
Agility
Luck
```

In Spanish UI:

```txt
Fuerza
Percepción
Resistencia
Carisma
Inteligencia
Agilidad
Suerte
```

The internal data can use English keys for stability:

```json
{
  "strength": 15,
  "perception": 3,
  "endurance": 5,
  "charisma": 4,
  "intelligence": 8,
  "agility": 10,
  "luck": 11
}
```

## Perk cards

Do not model all perk cards manually until the build planner is prioritized.

When implemented, recommended future models:

```txt
PerkCard
PerkRank
BuildPerk
LegendaryPerk
Mutation
Weapon
Armor
LegendaryEffect
BuildTag
```

## First implementation idea

The first build feature can be simple:

- authenticated users can create a build draft
- set title and description
- set S.P.E.C.I.A.L. values
- save as private
- admin/user can view own builds

No need for full perk card validation in the first build milestone.

## Later implementation

Once core build flow works:

- import/seed perk cards
- add card picker
- validate card costs
- add level requirement rules
- add mutations
- add weapons/armor
- publish builds publicly
