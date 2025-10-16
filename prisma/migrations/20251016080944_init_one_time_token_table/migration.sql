-- CreateEnum
CREATE TYPE "TokenPurpose" AS ENUM ('REGISTER', 'FORGOT_PASSWORD');

-- CreateTable
CREATE TABLE "one_time_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purpose" "TokenPurpose" NOT NULL,
    "token_hash" BYTEA NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "one_time_tokens_user_id_purpose_expires_at_idx" ON "one_time_tokens"("user_id", "purpose", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "one_time_tokens_purpose_token_hash_key" ON "one_time_tokens"("purpose", "token_hash");
