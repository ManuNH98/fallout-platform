import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasource = process.env.DIRECT_URL
  ? { datasource: { url: process.env.DIRECT_URL } }
  : {};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...datasource,
});
