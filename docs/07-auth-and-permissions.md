# 07. Auth and permissions

## Estado y responsabilidades

Phase 5 en curso: identidad JWT, perfil local y guards de roles implementados
en tareas 4 y 8; login/logout web integrados en 2ec4a8c. Registro/confirmacion
implementados en tarea 10 con simulaciones; plantilla remota y pruebas con
usuarios/sesiones reales siguen pendientes. Supabase Auth identifica
usuarios y mantiene passwords, sesiones, access tokens y refresh tokens.
NestJS aplica autorizacion de negocio con perfiles y roles en PostgreSQL.
Desde la decision del 30 de octubre de 2026, la DB de desarrollo sera local;
Supabase Auth sigue remoto y su UUID enlaza UserProfile sin FK a auth.users.
Preparacion L1/L2 validadas; sincronizacion y roles de negocio integrados en 9a2c3ef. [Contrato de entorno](19-local-development-database.md).
Los roles/promociones y datos de desarrollo no se trasladan automaticamente a produccion.
Next.js presenta flujos Auth y llama a Nest mediante Bearer access token.
No se emiten tokens propios ni se gestiona password hashing en la API.

El propietario confirmo ECC (P-256) Current y se inspecciono el JWKS publico
ES256 en tarea 4. Las pruebas de tarea 8 usan tokens sinteticos ES256 y DB
simulada; no acreditan cuentas, sesiones o correos reales.

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
el POST de sincronizacion permite identidad sin perfil. RolesGuard comprueba
el perfil consultado en PostgreSQL por el guard de identidad en esa peticion,
sin cache de roles entre llamadas; sin declaracion @Roles deniega por defecto. @CurrentUser() expone perfil existente y @Roles() declara
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


## Contrato de respuesta implementado en tarea 8

POST /auth/perfil y GET /auth/me devuelven UserProfileResponse de @repo/types:
id, supabaseUserId, username, displayName, avatarUrl, role, createdAt y updatedAt.
Los tres campos descriptivos pueden ser null; fechas ISO 8601 en JSON. No se
incluyen sesion, email, metadata, tokens o campos Prisma futuros. Respuestas
normales y 404 de GET /auth/me llevan Cache-Control: private, no-store.

La sincronizacion acepta ausencia de cuerpo o {} y rechaza campos/arrays con
400. No acepta supabaseUserId o role del cliente. Upsert con update vacio conserva
campos/roles/fecha; ante P2002 recupera la fila ganadora por identidad. Si no puede
recuperarla, responde 503 sanitizado. No reintentar sin limite ni promover ADMIN.
El guard lee perfiles sin crear filas tambien antes del POST; solo su servicio
de sincronizacion puede crearlos. Las respuestas GET y ADMIN nunca crean perfiles.

GET /admin/comprobacion devuelve {"message":"Acceso administrativo autorizado."}
con 200 solo para ADMIN. USER/EDITOR/MODERATOR o perfil ausente: 403. Identidad
invalida: 401; dependencia no disponible: 503. La matriz se verifica en pruebas
simuladas; falta integracion con usuarios reales en la tarea de cierre.


## Login/logout web de tarea 9

/login presenta formulario o estado de sesion verificada con perfil/continuar y
logout. Server Actions validan con loginSchema compartido; solo credenciales a
Supabase y bearer a Nest. getClaims verifica el mismo token obtenido por sesion;
getSession por si solo no autoriza. Exito de Auth con fallo de sincronizacion
conserva sesion y muestra perfil pendiente, con retry o cierre. El GET nunca crea
perfil. Logout usa scope local y cookies SSR escribibles; no afirmar exito si
falla ni revocacion instantanea. Pruebas simuladas y smoke sin credenciales;
integracion con cuentas reales pendiente. Registro/confirmacion siguen en tarea 10.


## Registro y confirmacion implementados en tarea 10

/registro valida email, password minimo 8/maximo 4096 y repeticion igual en
servidor con @repo/validation. signUp se ejecuta en un cliente servidor sin
persistencia/cookies y no crea perfiles ni acepta metadata de autorizacion.
Respuesta condicional identica para cuenta nueva/existente; sin reintentos o
reenvios automaticos. Sesion inesperada del proveedor no se persiste.

/auth/confirmar solo admite TokenHash y type=email, llama verifyOtp con SSR
escribible y redirige a destinos relativos fijos sin query sensible. /login
permite Continuar para sincronizar el perfil. Respuestas privadas/no-store y
no-referrer. Next excluye esta ruta del logger entrante y no registra argumentos
de Server Functions; futuros proxies/analitica tambien deben evitar estas queries.

Plantilla local revisable: apps/web/features/auth/email-templates/confirm-signup.html.
Confirm email y Site URL local reconfirmados por el propietario. No se ha aplicado
la plantilla remota ni creado cuentas/enviado correos. 60 pruebas web simuladas,
checks y smoke HTTP documentados en docs/18; la tarea 10 sigue abierta hasta
revision y prueba real autorizada. No confundir estas simulaciones con entrega
real de correo o verificacion real de enlaces caducados/reutilizados.
