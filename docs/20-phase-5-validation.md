# 20. Phase 5: evidencias de validacion

Fecha: 31 de octubre de 2026. Rama: feature/Phase-5_auth_foundation.
Estado: Phase 5 cerrada por autorizacion expresa del propietario el 31 de octubre
de 2026, tras revisar y subir b3aeb6d. PR de la rama abierta segun el propietario;
merge en develop aun pendiente de confirmar.
No se inicia Phase 6 ni se acreditan despliegue o PostgreSQL remoto.

## Entorno y alcance

Next.js y NestJS locales; PostgreSQL nativo dedicado en 127.0.0.1:55432,
fallout_platform_dev. Supabase Auth remoto con ECC P-256/ES256; plantilla
predeterminada y SMTP incluido, sin cambiar plan o proveedor. PKCE integrado
en 955eebe, evidencias previas de registro integradas en 457c5a8. Las dos
cuentas de prueba fueron creadas por el propietario; aqui se denominan A/B.
No se guardan emails, UUID, passwords, codigos, cookies o tokens personales.

## Matriz de evidencias

| Criterio | Resultado y fuente | Limite |
| --- | --- | --- |
| Registro y confirmacion PKCE A | Propietario confirma /registro, recepcion del correo y acceso desde enlace en el mismo Safari sin repetir password; agente observa sesion/perfil | El click/canje original no fue observado directamente |
| Confirmacion B | Dashboard Overview muestra email confirmado; login con password realizado por propietario y sesion observada | Retorno PKCE B dio error; no se reenviaron correos |
| Login y perfil | Ambas sesiones verificadas; /auth/me 200 y profileMatchesSubject=true | Identidad/token comprobados por SDK y Nest; no exportados |
| Unicidad de perfiles | Consulta parametrizada READ ONLY: 2 perfiles, 2 identidades, uno por A/B, ambos USER | Datos locales de prueba; no se trasladan implicitamente a produccion |
| Sin identidad | /auth/me y /admin/comprobacion 401 directos sin bearer | CORS no sustituye autenticacion |
| USER denegado | /admin/comprobacion 403 para A y B | EDITOR/MODERATOR se cubren con matriz simulada de API |
| ADMIN permitido y revocado | A local USER 403, ADMIN temporal autorizado 200, restaurado USER 403 sin login nuevo | Final: 0 ADMIN; no promocion permanente |
| Renovacion real | POST protegido llama refreshSession; token cambiado, claims validos, Nest acepta perfil 200 y mantiene ADMIN 403; app conserva sesion al recargar | Renovacion automatica de Proxy por expiracion probada con simulaciones; la real observada fue explicita |
| Logout local | A logout/recarga anonima y login posterior; B logout queda anonimo | Access token emitido puede ser valido hasta expirar; no se promete revocacion JWT inmediata |
| Aislamiento | Contextos concurrentes A=Cuenta 1 normal, B=Cuenta 2 privada, cada perfil coincide con su sub; B logout no cierra A, que mantiene perfil 200/ADMIN 403 | Diagnostico usado dentro de la misma pestana privada del login |
| Login B antes de confirmar | Mensaje generico observado, sin sesion/perfil; A conservada | UI no revela codigo interno: no distingue password erroneo de email pendiente |
| Errores PKCE | Ausente/invalido/caducado/reutilizado y otro navegador cubiertos con simulaciones; error real B no expone codigo sensible | No se reproducen todos los errores contra Supabase remoto |
| CORS | Preflight 204 con Allow-Origin fijo localhost:3000; origen ajeno no coincide; GET privado sigue 401 sin bearer | No equivale a autorizacion de negocio |
| Publico | /, /wiki y /juegos 200; diseno y mocks sin cambios | Sin sustitucion por API ni CRUD |

## Pruebas y archivos de la entrega

- 63 pruebas web, incluidas SDK real con transporte simulado, ES256, renovacion,
  uso del bearer nuevo, logout y eliminacion de verifier pendiente.
- 105 unitarias y 32 HTTP API correctas. Matriz de roles y aislamiento simulado
  pasan; DB/JWKS sinteticos en estas suites, separados de las evidencias reales.
- Web/API lint, check-types y build correctos. El build web necesita ejecutar
  fuera del sandbox por el puerto interno de Turbopack; no se cambia networking.
- Helper manual en apps/web/features/auth/tests/manual-auth-server.mjs, aislado
  del producto: loopback, Host/Origin estrictos, cache privada, CSP, clientes por
  peticion y etiquetas efimeras sin identificadores. GET solo consulta perfil y
  permisos; POST /renovar renueva sesion con el SDK. Sin nuevos endpoints Next,
  claves privilegiadas o dependencias. Proceso cerrado y puerto 3196 comprobado
  con conexion rechazada; pestaña temporal normal cerrada. Apps/DB siguen activas.
- Test modificado: apps/web/features/auth/tests/auth.test.mjs. Codigo de producto,
  API, schema/migraciones, Proxy, manifests, lockfile y .env intactos en tarea 11.
- Documentacion reconciliada: AGENTS, docs/07, 12, 15, 18, 19 y este registro.
  git diff --check correcto. El propietario crea/sube los commits.

## Incidencia del registro B y estado final

B se confirmo en Auth pero no obtuvo sesion desde el enlace. El SDK instalado
elimina code-verifier al guardar/cerrar sesion; logout/login/refresh de A entre
registro B y su enlace pudieron eliminar ese verifier. No se capturo el error
interno ni se atribuye una causa unica. Se uso login normal tras comprobar la
confirmacion, sin bypass del SDK, reenvios, nueva cuenta o cambio de plantilla.
Para futuras pruebas, completar cada registro PKCE antes de logout/login de
otra cuenta en ese mismo contexto; preservar el comportamiento seguro del SDK.

Estado final observado: 2 perfiles USER, 0 ADMIN; A autenticada en Safari normal,
B cerrada en privada. No nuevas migraciones, configuracion remota, correos del
agente, servicios, costes, CI o cambios WARP/hosts/certificados. Evidencia
cronologica y autorizaciones en docs/18.

El propietario revisa la entrega, sube b3aeb6d y autoriza expresamente el cierre
con los limites de esta matriz. Se cierra el alcance local acordado de Phase 5;
no se inicia Phase 6 ni se presupone merge/despliegue. Este cierre es solo
documental: diff y enlaces revisados, sin repetir tests/build o mutar servicios.
Antes de produccion:
origen HTTPS/redirects, SMTP/entrega, infraestructura remota, migraciones,
RLS/ACL/Data API y entorno desplegado requieren tareas separadas.
