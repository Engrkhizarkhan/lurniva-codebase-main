-- AlterTable: a plan task is now either a catalog topic task or a library-chapter task
ALTER TABLE "plan_tasks" ALTER COLUMN "topic_id" DROP NOT NULL;
ALTER TABLE "plan_tasks" ADD COLUMN "library_item_id" BIGINT;
ALTER TABLE "plan_tasks" ADD COLUMN "chapter_id" TEXT;

-- CreateIndex
CREATE INDEX "plan_tasks_library_item_id_idx" ON "plan_tasks"("library_item_id");

-- AddForeignKey
ALTER TABLE "plan_tasks" ADD CONSTRAINT "plan_tasks_library_item_id_fkey" FOREIGN KEY ("library_item_id") REFERENCES "library_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
