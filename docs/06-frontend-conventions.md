# 06. Frontend conventions

## Framework

Use Next.js App Router.

La aplicacion actual mantiene el App Router en `apps/web/app/`. Para nuevas rutas
publicas se utiliza el route group `apps/web/app/(public)/`; el grupo no forma
parte de la URL.

## Language

All user-facing text should be Spanish by default.

## Route groups

Recommended structure:

```txt
apps/web/app/
  (public)/
    page.tsx
    wiki/
    juegos/
    guias/
    mods/
    builds/

  (auth)/
    login/
    registro/

  (admin)/
    admin/
      page.tsx
      wiki/
      juegos/
      categorias/
      guias/
      mods/
      builds/
      media/
      usuarios/
```

## Public routes

Recommended public routes:

```txt
/
 /wiki
 /wiki/[slug]
 /juegos
 /juegos/[slug]
 /guias
 /guias/[slug]
 /mods
 /mods/[slug]
 /builds
 /builds/[slug]
```

Spanish route names are preferred for public sections.

## Admin routes

Recommended admin routes:

```txt
/admin
/admin/wiki
/admin/wiki/nuevo
/admin/wiki/[id]/editar
/admin/juegos
/admin/categorias
/admin/media
/admin/usuarios
/admin/builds
```

## UI stack

Use:

- TailwindCSS
- shadcn/ui
- lucide-react
- react-hook-form
- zod
- sonner
- TanStack Table for admin tables later

Tailwind CSS v4 se integra mediante `@tailwindcss/postcss` y los tokens de tema
se definen en `apps/web/app/globals.css`. La configuracion de shadcn/ui vive en
`apps/web/components.json`; las primitivas se mantienen en
`apps/web/components/ui/` hasta que sean necesarias.

## Component organization

Recommended structure:

```txt
apps/web/
  components/
    layout/
    navigation/
    ui/
  features/
    wiki/
      components/
      hooks/
      lib/
    games/
    auth/
    admin/
    builds/
  lib/
    api/
    supabase/
    utils.ts
```

## shadcn/ui convention

Initially, keep shadcn/ui primitives in `apps/web`.

Do not prematurely move all shadcn components to `packages/ui`.

Use `packages/ui` only for project-level reusable components once needed.

## Data fetching

Public pages:

- prefer server components when possible
- fetch published content
- include metadata for SEO

Interactive pages:

- use client components where needed
- use forms and client state only for actual interactivity

Admin pages:

- protected
- call NestJS API
- handle loading/error states clearly

## API client

Create a small API client under:

```txt
apps/web/lib/api/
```

It should handle:

- base API URL
- Authorization header with Supabase access token
- JSON parsing
- basic error handling

## Supabase client

Use separate clients for browser/server if needed:

```txt
apps/web/lib/supabase/
  client.ts
  server.ts
```

## SEO

Public wiki pages should include:

- title
- description
- canonical URL later
- open graph metadata later
- clean slugs
- internal links

## Styling principles

Visual direction:

- clean
- dark-friendly
- readable
- inspired by terminal/Pip-Boy/wasteland aesthetics without harming usability
- avoid visual clutter
- prioritize content readability

La direccion visual inicial de la web es una terminal editorial del Yermo:
fondos oscuros, texto claro, verde fosforo como acento y detalles industriales
contenidos. El contraste y la legibilidad prevalecen sobre los efectos.

## Public mock data

Los contratos estables compartidos para resumenes publicos viven en
`packages/types`. Las muestras de juegos, categorias y articulos destacados se
aislan en `apps/web/lib/mocks/` y las paginas reciben esos datos mediante
props/lecturas locales. La home usa Server Components y no depende de API,
Supabase ni credenciales externas. Al conectar la API, se conserva la forma de
presentacion y se reemplaza el origen de datos.

El listado `/wiki` recibe `searchParams` de forma asincrona y resuelve la
consulta en el servidor. La feature wiki encapsula las opciones, la
normalizacion de parametros y el filtrado de mocks; los componentes de
presentacion no importan los datos de muestra directamente.

La busqueda y los filtros usan un formulario GET con controles HTML nativos,
sin estado cliente ni dependencias nuevas. Los parametros publicos son `q`,
`juego` y `categoria`. La seleccion se conserva al recargar o compartir la URL;
`/wiki` limpia todos los filtros. El boton aplica la consulta completa.

La busqueda compara titulo y resumen sin distinguir mayusculas ni tildes.
`q` se recorta a 200 caracteres y se eliminan espacios exteriores; al comparar,
los espacios consecutivos se consideran uno. Los slugs desconocidos se ignoran,
los parametros repetidos usan su primer valor y los parametros ajenos al
listado no afectan a los resultados. Los filtros se combinan con AND.

Al consumir parametros de consulta, `/wiki` se renderiza por peticion; la home
permanece estatica. Una consulta sin coincidencias ofrece un estado vacio y
la accion de limpiar filtros, no un error ni un 404.

## Forms

Use:

- react-hook-form
- zod
- shadcn form components

## Error/loading states

Every admin page that fetches data should include:

- loading state
- empty state
- error state
