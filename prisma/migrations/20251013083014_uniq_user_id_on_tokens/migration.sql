/*
  Warnings:

  - You are about to alter the column `user_id` on the `tokens` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[user_id]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tokens" ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_user_id_key" ON "tokens"("user_id");
