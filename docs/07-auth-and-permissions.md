# 07. Auth and permissions

## Estado y responsabilidades

Contrato de Phase 5, pendiente de implementacion. Supabase Auth identifica
usuarios y mantiene passwords, sesiones, access tokens y refresh tokens.
NestJS aplica autorizacion de negocio con perfiles y roles en PostgreSQL.
Desde la decision del 30 de octubre de 2026, la DB de desarrollo sera local;
Supabase Auth sigue remoto y su UUID enlaza UserProfile sin FK a auth.users.
Preparacion aun pendiente; [contrato de entorno](19-local-development-database.md).
Los roles/promociones y datos de desarrollo no se trasladan automaticamente a produccion.
Next.js presenta flujos Auth y llama a Nest mediante Bearer access token.
No se emiten tokens propios ni se gestiona password hashing en la API.

El propietario indica ECC (P-256) en Dashboard, equivalente a ES256. Falta
confirmar que es Current e inspeccionar JWKS antes del verificador; no se
acredita una prueba funcional ni inspeccion remota por el agente.

## Alcance de Phase 5

Registro email/password con confirmacion obligatoria, login, logout local,
sesion SSR y renovacion, perfil local, roles y endpoint ADMIN de prueba.
Recuperacion de contrasena queda fuera de esta fase aunque Supabase la soporte
y /restablecer-contrasena este reservada. OAuth, MFA, edicion de perfil,
gestion de usuarios y panel admin requieren tareas posteriores.

La secuencia y criterios detallados se mantienen en
[18. Phase 5: Auth foundation](18-phase-5-auth-foundation.md).

## Flujo de usuario y cookies

1. Next usa clientes separados de navegador y servidor con @supabase/ssr y
   @supabase/supabase-js; servidor por peticion, cookies y PKCE del SDK.
2. /registro envia signUp y muestra revisa tu correo, sin asumir sesion.
3. /auth/confirmar verifica TokenHash con verifyOtp, guarda cookies y redirige
   a /login; alli una accion Continuar con sesion verificada sincroniza el perfil.
4. /login usa signInWithPassword. Con identidad valida, Next llama al POST
   idempotente /auth/perfil y despues puede consultar GET /auth/me.
5. Nest verifica firma/claims, sincroniza solo en el POST y carga roles de DB.
6. Logout mediante Server Action o POST usa scope local explicito. No GET.

Next 16 usa apps/web/proxy.ts junto a app, sin src. El proxy renueva cookies
en peticion y respuesta, conservandolas en redirecciones. Matcher limitado a
Auth/privadas, sin cambios en mocks ni layout publico. getClaims verifica
identidad; getUser permite consultar estado actualizado. getSession no es
prueba de identidad. Las respuestas de sesion no usan cache compartida.
No imponer HttpOnly incompatible con el cliente navegador del SDK; preservar
atributos seguros y HTTPS en produccion. No usar Auth Helpers antiguos.

El logout impide renovar la sesion elegida, pero un access token emitido puede
seguir valido hasta expirar. No prometer revocacion instantanea mediante JWKS.

## Perfil local y autorizacion

UserProfile y UserRole pertenecen a Phase 5; los modelos de contenido son de
Phase 6. Campos y restricciones en [docs/04](04-database-model.md).

POST /auth/perfil usa exclusivamente la identidad verificada para crear o
recuperar el perfil; role inicial USER. Unicidad por supabaseUserId y pruebas
de concurrencia. No sobrescribir roles o campos durante repeticion; no aceptar
role del formulario ni user_metadata. GET /auth/me no crea filas y responde
404 cuando falta perfil. Error de DB no equivale a perfil ausente.

SupabaseAuthGuard valida identidad y carga el perfil existente cuando procede;
el POST de sincronizacion permite identidad sin perfil. RolesGuard consulta
el rol de aplicacion. @CurrentUser() expone perfil existente y @Roles() declara
los roles permitidos. No confiar en rol Supabase authenticated como rol de
negocio ni en controles visuales. Toda llamada privada directa se valida.

| Rol | Contrato inicial y permisos futuros |
| --- | --- |
| Publico | Mantiene lectura mock; en fases posteriores, contenido publicado. Sin acceso privado. |
| USER | Perfil propio de lectura/sincronizacion en Phase 5; edicion, favoritos y builds despues. |
| EDITOR | Rol disponible; futuros borradores/edicion/media segun permiso. No entra al endpoint ADMIN. |
| MODERATOR | Rol disponible; funciones futuras de moderacion. No entra al endpoint ADMIN. |
| ADMIN | En Phase 5 solo endpoint de comprobacion; gestion de contenido, usuarios y media en fases posteriores. |

GET /admin/comprobacion exige ADMIN: 401 sin identidad, 403 sin perfil o con
otro rol, 200 si autorizado. No implementar panel para demostrarlo. Primer
ADMIN mediante operacion manual separada y autorizada sobre perfil existente;
sin seed, autopromocion ni endpoint publico. El futuro panel comprueba acceso
en Next y siempre mediante Nest antes de servir datos privados.

## Verificacion y seguridad

Para ES256 confirmado, usar jose/JWKS del proyecto con issuer y audiencia
fijados, firma, caducidad, sub y claims de usuario. No admitir algoritmos
inesperados ni fallback automatico HS256. Rechazar anon/service_role y claves
API usadas como access tokens. Mantener cache JWKS acotada, timeout y pruebas
de rotacion; fallo de verificacion nunca concede acceso. 401 para tokens
invalidos y 503 generico para indisponibilidad de dependencias.

No exponer JWT secret, claves privadas, PostgreSQL o claves privilegiadas al
frontend. Esta fundacion no necesita claves privilegiadas. No guardar tokens,
passwords o queries de confirmacion en logs. Validar formularios en servidor,
impedir redirecciones abiertas, evitar enumeracion y proteger acciones frente
a CSRF. Schemas compartidos en packages/validation; tipos en packages/types.

Sin pruebas remotas implicitas: crear cuentas, enviar correos, aplicar
migraciones, cambiar plantillas y promover ADMIN requieren tareas autorizadas.
SMTP incluido solo para miembros del equipo, actualmente 2 mensajes/hora sin
SLA; confirmar limite antes del envio. No desactivar confirmacion ni ampliar
permisos de Storage para probar Auth. Infraestructura y TLS: docs/14 y docs/17.

## Referencias

Las fuentes oficiales y fecha de contraste, tareas, dependencias y pruebas se
mantienen en [el contrato de Phase 5](18-phase-5-auth-foundation.md#fuentes-oficiales).
