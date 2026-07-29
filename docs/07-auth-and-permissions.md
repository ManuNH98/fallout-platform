# 07. Auth and permissions

## Auth provider

Supabase Auth is used as the identity provider.

It handles:

- sign up
- login
- sessions
- access tokens
- refresh tokens
- password recovery
- optional OAuth providers later

## Application authorization

NestJS owns application authorization.

Supabase identifies the user. The application decides what the user can do.

## User flow

```txt
User logs in through Next.js
  -> Supabase Auth creates a session
  -> Next.js stores/reads the session using Supabase helpers
  -> Next.js calls NestJS with Supabase access token
  -> NestJS validates token
  -> NestJS loads local UserProfile by supabaseUserId
  -> NestJS checks role/permissions
```

## Local profile

The application should have its own `UserProfile` table.

Reason:

Supabase Auth user data is identity data. Application data should live in the app database.

UserProfile should include:

- id
- supabaseUserId
- username
- displayName
- avatarUrl
- role
- createdAt
- updatedAt

## Roles

Initial roles:

```txt
USER
ADMIN
EDITOR
MODERATOR
```

## Initial permissions

### Public visitor

Can:

- view published wiki pages
- view published guides
- view published mods
- view public builds later

Cannot:

- create content
- access admin

### USER

Can:

- manage own profile
- save favorites later
- create private builds later

### EDITOR

Can:

- create drafts
- edit content
- upload media if allowed

Cannot:

- manage users
- change system settings

### MODERATOR

Future role.

Can:

- review reports
- moderate comments/submissions later

### ADMIN

Can:

- manage all content
- manage users
- manage media
- publish/unpublish content
- access all admin sections

## Admin access

The admin panel should require:

- valid Supabase session
- local UserProfile with ADMIN or EDITOR role depending on section

Initial admin access can be restricted to ADMIN only.

## API guards

Recommended guards:

```txt
SupabaseAuthGuard
RolesGuard
```

Recommended decorators:

```txt
@CurrentUser()
@Roles('ADMIN')
```

## Security rules

- Do not trust role information from the frontend.
- Do not expose admin-only endpoints without API guard.
- Do not rely only on hidden UI.
- Validate every protected request in NestJS.
- Do not store Supabase service role key in the frontend.
- Service role keys belong only in server environments.
- Prefer httpOnly/session helpers where appropriate.
