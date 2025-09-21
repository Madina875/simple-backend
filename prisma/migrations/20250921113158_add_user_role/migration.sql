-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('superadmin', 'admin', 'client');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" DEFAULT 'client',
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "hashedRefreshToken" TEXT,
    "is_active" BOOLEAN DEFAULT false,
    "activation_link" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
