import process from "node:process";
import { config } from "dotenv";
import { createPrismaClient } from "../src/client.js";

async function main(): Promise<void> {
  config({ quiet: true });

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL es obligatoria para comprobar el runtime.");
    process.exitCode = 1;
    return;
  }

  try {
    const url = new URL(connectionString);

    if (!url.hostname || !["postgresql:", "postgres:"].includes(url.protocol)) {
      throw new Error();
    }
  } catch {
    console.error("DATABASE_URL debe ser una URL PostgreSQL con host valido.");
    process.exitCode = 1;
    return;
  }

  // Incluye conexion, consulta y desconexion; la salida forzada cierra los sockets.
  const timeout = setTimeout(() => {
    console.error("La comprobacion de runtime supero el limite de 10 segundos.");
    process.exit(1);
  }, 10_000);

  try {
    const client = createPrismaClient(connectionString);

    try {
      const rows = await client.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;

      if (rows.length !== 1 || rows[0]?.ok !== 1) {
        throw new Error();
      }
    } finally {
      await client.$disconnect();
    }

    console.info("Conexion PostgreSQL de runtime verificada: SELECT 1 correcto.");
  } catch {
    console.error(
      "No se pudo verificar PostgreSQL de runtime. Revisa DATABASE_URL, red y TLS.",
    );
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}

// No imprimir errores del driver: pueden contener credenciales o rutas locales.
void main().catch(() => {
  console.error("No se pudo preparar la comprobacion de runtime.");
  process.exitCode = 1;
});
