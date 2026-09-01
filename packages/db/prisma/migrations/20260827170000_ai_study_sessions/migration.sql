-- AlterTable: an AI session is now either day-anchored or a standalone AI Study session
ALTER TABLE "ai_sessions" ALTER COLUMN "plan_day_id" DROP NOT NULL;
ALTER TABLE "ai_sessions" ADD COLUMN "title" TEXT;
ALTER TABLE "ai_sessions" ADD COLUMN "last_message_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ai_sessions_user_id_last_message_at_idx" ON "ai_sessions"("user_id", "last_message_at");
