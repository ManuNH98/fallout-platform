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

Los detalles `/wiki/[slug]` usan `generateStaticParams` para los ocho articulos
mock y `generateMetadata` para titulo, descripcion y Open Graph por articulo.
Los slugs desconocidos pasan por `notFound()` y el estado espanol del segmento
wiki; no se desactiva `dynamicParams`, para conservar ese estado personalizado.

El cuerpo se renderiza en servidor con `react-markdown`, sin HTML embebido,
MDX ni plugins adicionales. Esta dependencia evita mantener un parser propio
o insertar HTML generado mediante `dangerouslySetInnerHTML`. Se admiten
encabezados de nivel 2 y 3, parrafos, enfasis, listas, enlaces, citas y codigo;
el unico `h1` lo proporciona la pagina. Los enlaces internos usan `next/link`.
El componente conserva la normalizacion segura de URLs de la libreria.

Las tarjetas de articulos enlazan a sus detalles tanto en la home como en
el listado y los relacionados. Los juegos de las fichas wiki enlazan a
`/juegos/[slug]`; las categorias mantienen el enlace al listado wiki filtrado.

Las fichas `/juegos/[slug]` son Server Components, con `generateStaticParams`
para los cuatro juegos mock y metadata por juego. Los slugs desconocidos
usan `notFound()` y el estado espanol del segmento juegos. Las tarjetas de
juegos enlazan a esas fichas desde la home y el listado.

`GameDetail` extiende `GameSummary` en `packages/types` con `summary` y
`description`. Los textos de detalle viven en `lib/mocks/game-content.ts`
y se resuelven mediante `getGame` en la feature games. Los articulos
asociados se consultan con `listWikiArticles({ gameSlug })`, reutilizando el
filtrado existente. La ficha muestra esos resumenes y ofrece un enlace a
`/wiki?juego=...`; si no hay articulos, presenta un estado vacio con retorno
a la wiki. Las opciones de filtro usan la coleccion completa de juegos,
independientemente de los destacados de la home.

Las llamadas principales de la home enlazan a los listados publicos y las
categorias usan `/wiki?categoria=...`. Las direcciones desconocidas disponen
de `app/not-found.tsx` en espanol, reutilizando el layout publico.

Los resets de enlaces deben permanecer en la capa base de CSS para no anular
utilidades de color de Tailwind. La cabecera movil ocupa dos filas; el margen
de desplazamiento reserva 9 rem por debajo de 640 px y 6 rem a partir de ese
ancho. Las comprobaciones de integracion estan documentadas en
`docs/16-phase-3-validation.md`.

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


## Auth web implementado en tarea 9

/login usa (auth)/layout.tsx y un Server Component dinamico separado del shell
publico; metadata noindex/nofollow y cache privada por Proxy. Solo formularios
cliente pequenos con useActionState, controles HTML nativos accesibles y Server
Actions. Para este formulario simple no se anaden react-hook-form ni primitivas
UI; no se cambia el diseno publico ni se anaden enlaces hacia rutas sin implementar.

Validacion de login en @repo/validation (Zod 4.6.7), tambien en servidor. Password
sin trim ni echo; errores en espanol y pending/disabled. Acciones de login,
continuar con sesion y logout tienen cookies escribibles explicitamente y
redirects fijos fuera de catch. Logout es POST scope local, nunca GET.

El helper server-only de API usa bearer verificado, no-store, timeout 5 s,
credentials omit y redirect error; no devuelve tokens al cliente. Si login inicia
sesion pero falla el perfil, la pagina ofrece reintentar sincronizacion o cerrar
sesion; GET solo lee. Auth y sesion no se consultan en layouts publicos o raiz.
Contrato completo, estados y limites en docs/18 (entrega tarea 9). Registro y
confirmacion se implementaran por separado, sin envios reales implicitos.


Registro de tarea 10: /registro reutiliza el layout Auth y metadata noindex;
useActionState con password y repeticion sin devolver valores sensibles. Schemas
en @repo/validation, operacion signUp sin persistencia y verifyOtp en Route
Handler /auth/confirmar con SSR escribible, redirects relativos fijos y
no-referrer. Next omite logs de esta ruta y argumentos de Server Functions.
Artefacto de plantilla en features/auth/email-templates; no aplicado a Supabase.
Checks y limitaciones reales en docs/18; no cambios de diseno/mocks publicos.
