-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otp_expires" TIMESTAMP(3);
