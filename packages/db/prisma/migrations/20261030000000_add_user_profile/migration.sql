-- Creacion y proteccion atomicas; aplicar solo en la tarea remota autorizada.
BEGIN;
SET LOCAL search_path = "public";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'EDITOR', 'MODERATOR');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "supabaseUserId" UUID NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_supabaseUserId_key" ON "UserProfile"("supabaseUserId");

-- Prisma no representa RLS ni ACL: conservar este bloque en futuras migraciones.
-- Sin politicas cliente. NestJS conserva la autorizacion de negocio.
ALTER TABLE "public"."UserProfile" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE "public"."UserProfile" FROM PUBLIC, anon, authenticated;

COMMIT;
