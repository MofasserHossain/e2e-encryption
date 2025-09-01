/*
  Warnings:

  - Added the required column `nonce` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privateKey` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "nonce" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "privateKey" TEXT NOT NULL,
ADD COLUMN     "publicKey" TEXT NOT NULL;
