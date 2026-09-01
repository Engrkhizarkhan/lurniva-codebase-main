-- CreateTable
CREATE TABLE "study_notes" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "source_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_notes_user_id_idx" ON "study_notes"("user_id");

-- CreateIndex
CREATE INDEX "study_notes_user_id_category_id_idx" ON "study_notes"("user_id", "category_id");

-- AddForeignKey
ALTER TABLE "study_notes" ADD CONSTRAINT "study_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Row Level Security — defense-in-depth for the `public` schema, matching
-- study_plans etc.; the app talks to Postgres directly via Prisma (a role
-- that bypasses RLS), so these policies matter only if the Data API is ever
-- turned on for this table.
ALTER TABLE "study_notes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_notes_select" ON "study_notes" FOR SELECT
  TO authenticated
  USING ("user_id" = (select auth.uid())::text);

CREATE POLICY "study_notes_insert" ON "study_notes" FOR INSERT
  TO authenticated
  WITH CHECK ("user_id" = (select auth.uid())::text);

CREATE POLICY "study_notes_delete" ON "study_notes" FOR DELETE
  TO authenticated
  USING ("user_id" = (select auth.uid())::text);
