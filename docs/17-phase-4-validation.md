# 17. Validacion de Phase 4

Fecha: 23 de octubre de 2026.

Estado: aplicaciones, runtime y Prisma CLI verificados; **Phase 4 sigue abierta
para revision del propietario**. CLI funciona en macOS mediante Direct con
WARP activo y una entrada temporal de su hostname en /etc/hosts. La revision
debe incluir esta dependencia local. No se inicia Phase 5 en esta entrega.

## Alcance

Entrega de verificacion, sin cambios de codigo, dependencias del repositorio,
diseno o archivos .env. El seguimiento incorpora WARP instalado por el
propietario y una entrada temporal de sistema aplicada por el con sudo.
Archivos permitidos del repositorio: este registro y docs/12, docs/14 y docs/15.
Excluidos apps/packages, schema, migraciones, seeds y el registro historico de
Phase 3. Se revisaron las skills locales; no se aplica una guia de implementacion
porque solo se ejecutan checks existentes y se registra la evidencia.

## Checks ejecutados en esta entrega

| Comando | Resultado |
| --- | --- |
| `pnpm lint --force` | Correcto en el monorepo |
| `pnpm check-types --force` | Correcto en el monorepo |
| `pnpm build --force` | Correcto en el monorepo |
| `pnpm --filter api run test --runInBand` | 16 pruebas correctas |
| `pnpm --filter api run test:e2e --runInBand` | 2 pruebas correctas |
| `pnpm --filter @repo/db prisma:validate` | Correcto |
| `pnpm --filter @repo/db db:check:runtime` | Correcto contra Supabase |
| `pnpm --filter @repo/db db:check` | Correcto en Direct con WARP y entrada temporal de hosts; antes fallaba con P1001 |
| `git diff --check` | Correcto |

`--force` solicita la ejecucion de las tareas de Turbo sin reutilizar su cache.
Runtime usa session pooler con `sslmode=verify-full` y CA explicita. En esta
entrega no se relaja TLS ni se ejecutan migraciones, seeds o escrituras remotas.
Los fallos iniciales de CLI quedan como historico: sin WARP no habia salida
IPv6; el pooler falla la politica TLS nativa de macOS. El camino verificado
actual es Direct. Diagnostico y seguimiento en docs/14-environment-and-supabase.md.

## CLI Direct: resultado con WARP y DNS local

El propietario ha instalado WARP gratuito y activado Trafico y DNS (HTTPS).
Las pruebas TCP a Supabase Direct y un control publico pasan por IPv6. La
consulta DNS AAAA directa encuentra el host, pero el resolvedor nativo de
macOS seguia devolviendo ENOTFOUND; vaciar la cache local no lo resolvio.
Una conexion pg a la IPv6 resuelta explicitamente, conservando el hostname
original en TLS, paso SELECT 1 con CA y hostname verificados. El certificado
Direct observado tiene serverAuth y 730 dias de validez.

Tras autorizacion explicita, se preparo un diff de una unica entrada temporal
en /etc/hosts, sin publicar IP ni referencia del proyecto. El intento automatico
no tenia autenticacion sudo y no modifico el archivo. El propietario ejecuto
el helper desde su terminal. La verificacion posterior confirma que el archivo
es exactamente la copia previa mas esa entrada; no cambiaron los demas hosts.
La copia y helpers estan en /private/tmp y no se versionan.

Con esa entrada, macOS resuelve IPv6 y `pnpm --filter @repo/db db:check` termina
con codigo 0. Conserva la URI original del hostname Direct, CA en sslcert,
sslmode=require y sslaccept=strict. `db:check:runtime` tambien termina con 0.
Controles negativos con DIRECT_URL sobrescrita solo en el proceso: quitar la
CA adicional y usar la IPv6 literal (no incluida en el certificado) producen
P1011 por confianza. Esto acredita rechazo por CA y por identidad incorrecta;
no se desactivo TLS ni se modificaron los .env para las pruebas.

Tras estas comprobaciones pasan lint, check-types y build de @repo/db. Los
checks completos de aplicaciones listados arriba son de la validacion previa;
no se repiten en esta iteracion documental sin cambios de codigo de apps.

Limite operativo: WARP debe estar activo para alcanzar Direct y la entrada
temporal debe seguir apuntando a la IPv6 vigente. No es una reparacion general
del DNS de macOS. Si Supabase cambia la IP, detener la prueba, resolver de
nuevo el host y revisar la entrada con el propietario; no sustituir el hostname
por una IP en la URI ni relajar TLS. El helper temporal admite --rollback para
retirar solo su entrada; si se retira sin resolver el DNS, CLI puede volver a
fallar. Conservar el registro de la copia antes de limpiar los temporales.

## Arranque y health

Habia servidores preexistentes escuchando en 3000/3001. La home devuelve HTTP
200 y `GET http://localhost:3001/health` devuelve HTTP 200 y `{"status":"ok"}`.
No se detuvieron esos procesos ni se les atribuye un arranque nuevo.

El intento de `pnpm dev` de esta entrega fallo con EADDRINUSE en 3000. El grupo
de procesos creado para ese intento se detuvo. Nest watch habia eliminado dist
antes de cerrarse; por ello un primer `start:prod` fallo por ausencia de main.
Se repitio `pnpm --filter api build`, confirmando que genera dist/main.js, y el
arranque posterior funciono. No se modificaron scripts ni configuracion.

Se verifico un arranque independiente del build recien generado:

```bash
pnpm --filter web exec next start --port 3100
PORT=3101 WEB_URL=http://localhost:3100 pnpm --filter api start:prod
```

Son overrides temporales solo de puertos/origen local para evitar interferir
con los servidores existentes. Los valores Supabase se cargan de los archivos
locales de cada consumidor. El build web conserva NEXT_PUBLIC_API_URL de su
entorno de build, dirigido a 3001; no se ha probado una integracion web/API ni
cambiado ese contrato: la web no realiza llamadas de contenido a la API.
`GET http://localhost:3101/health` devuelve HTTP 200 y `{"status":"ok"}`.
Health solo acredita disponibilidad de Nest, no PostgreSQL, Auth o Storage.
Al terminar se detuvieron los procesos temporales de 3100/3101.

## Navegacion y mocks

Recorrido HTTP del build en 3100: 25 URLs alcanzables desde la home, con HTTP
200, idioma es y titulo HTML presente. Incluye home, listados, ocho detalles
wiki, cuatro detalles de juegos, seis filtros de categoria y cuatro de juego.
No se encontraron enlaces internos rotos en ese conjunto.

La busqueda sin coincidencias muestra su estado vacio. Los slugs wiki/juegos
inexistentes muestran no encontrado y noindex, con HTTP 200 por streaming;
el 404 general devuelve HTTP 404 y noindex. Es el limite ya registrado en
Phase 3, sin cambiar su comportamiento como parte de infraestructura.

Recorrido en navegador: home a wiki; busqueda House produce un resultado;
Robert House abre su detalle; el enlace de juego abre Fallout: New Vegas y
desde alli la wiki filtrada muestra cinco articulos. Se observo el estado de
carga y despues el contenido resuelto. Se reviso la home visualmente; no se
repite la auditoria responsive/accesibilidad de Phase 3 en esta entrega.

Revision de fuentes: home y helpers wiki/juegos siguen importando mocks
tipados; no hay sustitucion por llamadas a la API o Supabase. El diff web
desde el merge de Phase 3 solo incluye el ejemplo de entorno, el helper de
entorno y su importacion en layout; no cambia contenido, estilos o componentes.

## Entorno y limites

Los tres archivos reales de entorno y la CA local estan ignorados por Git;
no hay .env raiz ni archivos reales de entorno versionados. Se revisaron los
18 archivos de .next/static del build buscando las URIs y contrasenas de
servidor presentes en los entornos API/DB, sin coincidencias. No constituye
una auditoria exhaustiva de seguridad ni imprime valores sensibles.

Email/confirmacion y URLs exactas: preparados segun confirmacion del propietario;
SMTP incluido, sin entregabilidad ni flujos Auth probados. Storage: media
privado, RLS activo y cero politicas; subida anonima rechazada y objeto ausente,
verificados en la tarea anterior. No se repitio esa subida en esta entrega.
Detalles y fuentes de cada comprobacion en docs/14-environment-and-supabase.md.

No hay despliegue remoto operativo verificado ni variables de hosting revisadas;
esta validacion es local contra Supabase remoto. No se ha creado hosting.

## Pendiente para cerrar

El bloqueo de conexion CLI queda superado bajo los requisitos locales
documentados. Falta la revision del propietario, incluida la aceptacion del
uso de WARP y la entrada temporal de hosts, y registrar el cierre autorizado.
Hasta entonces Phase 4 no esta marcada completada. Si cambia esa configuracion,
repetir ambas comprobaciones de conectividad y los checks afectados.
