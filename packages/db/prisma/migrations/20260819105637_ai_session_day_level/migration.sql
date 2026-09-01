-- DropForeignKey
ALTER TABLE "ai_sessions" DROP CONSTRAINT "ai_sessions_plan_task_id_fkey";

-- DropIndex
DROP INDEX "ai_sessions_plan_task_id_idx";

-- AlterTable
ALTER TABLE "ai_sessions" DROP COLUMN "plan_task_id",
ADD COLUMN     "plan_day_id" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "ai_sessions_plan_day_id_idx" ON "ai_sessions"("plan_day_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_sessions_plan_day_id_mode_feature_key" ON "ai_sessions"("plan_day_id", "mode", "feature");

-- AddForeignKey
ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_plan_day_id_fkey" FOREIGN KEY ("plan_day_id") REFERENCES "plan_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
