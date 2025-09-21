/*
  Warnings:

  - Added the required column `confirm_password` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "confirm_password" TEXT NOT NULL;
