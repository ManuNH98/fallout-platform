# 16. Validacion de Phase 3

Fecha: 21 de octubre de 2026.

Estado: integracion implementada y validada tecnicamente; pendiente de revision
final del propietario. Phase 3 permanece abierta hasta esa revision.

## Cambios de integracion

- Las llamadas principales de la home abren `/juegos` y `/wiki`.
- Las seis categorias enlazan a `/wiki?categoria=...`.
- Las secciones de destacados permiten abrir sus listados completos.
- Las tarjetas, breadcrumbs, relacionados y fichas conectan wiki y juegos.
- Las direcciones desconocidas tienen un 404 general en espanol con el shell publico.
- El reset de enlaces se aplica en la capa base de CSS para que los colores
  de Tailwind prevalezcan, incluido el texto oscuro del boton verde principal.
- El desplazamiento reserva 9 rem en movil para la cabecera de dos filas y
  6 rem a partir de 640 px.

## Validacion automatica

Comandos completados correctamente:

```bash
pnpm --filter web lint
pnpm --filter web check-types
pnpm --filter web build
git diff --check
```

No se han modificado tipos compartidos, dependencias, backend, Prisma ni Supabase
en esta tarea.

Un recorrido HTTP del build de produccion ha comprobado 25 URLs alcanzables
desde la home, incluidos los ocho detalles wiki, cuatro detalles de juegos,
seis filtros de categoria y cuatro filtros de juego:

- Ningun enlace interno roto.
- Titulos propios en los doce detalles y descripcion/Open Graph presentes.
- Idioma espanol, un `main` y un `h1` en el contenido resuelto de cada pagina.
- Sin identificadores duplicados en el contenido resuelto.
- Los tres estados de no encontrado incluyen `noindex`.

El analisis del HTML diferencia el fallback de carga del contenido resuelto
cuando Next.js envia ambos en una respuesta de streaming.

## Estados controlados

Se renderizaron los componentes reales con sustituciones de datos en memoria,
sin editar los mocks del repositorio ni incorporar parametros de simulacion
a las rutas publicas:

| Caso | Resultado |
| --- | --- |
| Coleccion wiki vacia | Mensaje de archivo vacio y retorno al inicio |
| Coleccion de juegos vacia | Mensaje de juegos no disponibles y retorno |
| Juego sin articulos asociados | Estado vacio y enlace a la wiki |
| Busqueda sin coincidencias | Mensaje, filtros aplicados y accion de limpiar |
| Carga de wiki y juegos | `aria-busy`, mensaje `role="status"` y esqueletos decorativos |
| Error de wiki y juegos | Mensaje, retorno al inicio y callback de reintento invocado |
| Slug wiki inexistente | Articulo no encontrado en espanol |
| Slug de juego inexistente | Juego no encontrado en espanol |
| Direccion general inexistente | Pagina no encontrada en espanol |

Los errores se verifican mediante renderizado controlado y conexion de `reset`;
no se simulan fallos de una API real, que sigue aplazada.

## Revision en navegador

- Vistas de home, listado wiki, articulo, listado de juegos y ficha de juego
  a 320 px; sin desbordamiento horizontal visible en las vistas revisadas.
- Listado wiki adicional a 375 y 768 px y vistas de escritorio a 1265 px.
- Formulario y tarjetas se distribuyen por columnas segun el ancho disponible.
- Tab hace visible el enlace para saltar al contenido; Enter lo activa y el
  siguiente Tab entra en el contenido sin recorrer de nuevo la cabecera.
- El campo de busqueda muestra el foco y permite enviar una consulta con Enter.
- Comprobados enlaces entre juego, articulo, wiki filtrada, categorias y home.
- Comprobado el mensaje de carga en una navegacion real y el 404 general.

La revision cubre accesibilidad basica y teclado; no constituye una auditoria
completa con lectores de pantalla.

## Limites observados

En el build local, los slugs wiki/juegos inexistentes muestran su estado de
no encontrado y `noindex`, pero la respuesta de streaming ya iniciada tiene
HTTP 200. El 404 general devuelve HTTP 404. Este comportamiento queda registrado
para revisar el tratamiento HTTP al conectar la API; no se oculta mediante
un articulo o juego de sustitucion.

El contenido sigue siendo mock y las referencias son muestras breves dentro
de los juegos. Canonicals con dominio de produccion, persistencia y fallos de
red reales corresponden a las siguientes integraciones.
