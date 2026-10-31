import { execFileSync, spawnSync } from "node:child_process";
import console from "node:console";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const state = fileURLToPath(new URL("../.local-postgres/", import.meta.url));
const data = join(state, "data");
const action = process.argv[2];

if (!["start", "stop", "status"].includes(action)) {
  console.error("Uso: local-postgres.mjs start|stop|status");
  process.exitCode = 1;
} else {
  try {
    // Solo controla el cluster dedicado ya preparado; nunca instala ni migra.
    if (readFileSync(join(data, "PG_VERSION"), "utf8").trim() !== "17") {
      throw new Error("Version local inesperada.");
    }
    const prefix = execFileSync("brew", ["--prefix", "postgresql@17"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const binary = join(prefix, "bin", "pg_ctl");
    const status = spawnSync(binary, ["-D", data, "status"], {
      stdio: "ignore",
    });
    if (status.error || ![0, 3].includes(status.status)) {
      throw new Error("No se pudo consultar el cluster.");
    }
    if (action === "status") {
      console.info(
        status.status === 0
          ? "PostgreSQL local activo."
          : "PostgreSQL local detenido.",
      );
    } else if (action === "start" && status.status === 0) {
      console.info("PostgreSQL local ya esta activo.");
    } else if (action === "stop" && status.status === 3) {
      console.info("PostgreSQL local ya esta detenido.");
    } else {
      const options =
        action === "start"
          ? ["-l", join(state, "postgres.log")]
          : ["-m", "fast"];
      const result = spawnSync(
        binary,
        ["-D", data, "-w", "-t", "15", ...options, action],
        {
          stdio: "inherit",
          timeout: 20_000,
        },
      );
      if (result.status !== 0)
        throw new Error("Fallo al controlar el cluster.");
    }
  } catch {
    console.error(
      "No se pudo controlar PostgreSQL local. Revisa la preparacion L1 de docs/19 y el log local.",
    );
    process.exitCode = 1;
  }
}
