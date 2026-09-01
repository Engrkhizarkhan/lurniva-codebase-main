-- CreateTable
CREATE TABLE "subjects" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" BIGSERIAL NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtopics" (
    "id" BIGSERIAL NOT NULL,
    "topic_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subtopics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plans" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "study_hours_per_day" DECIMAL(4,1) NOT NULL,
    "draft_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_days" (
    "id" BIGSERIAL NOT NULL,
    "plan_id" BIGINT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "is_rest_day" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_tasks" (
    "id" BIGSERIAL NOT NULL,
    "plan_day_id" BIGINT NOT NULL,
    "topic_id" BIGINT NOT NULL,
    "subtopic_id" BIGINT,
    "title" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_sessions" (
    "id" BIGSERIAL NOT NULL,
    "plan_task_id" BIGINT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_assessment_attempts" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "score" DECIMAL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_assessment_answers" (
    "id" BIGSERIAL NOT NULL,
    "attempt_id" BIGINT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_idx" INTEGER,
    "is_correct" BOOLEAN,
    "response_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_assessment_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_plans_user_id_idx" ON "study_plans"("user_id");

-- CreateIndex
CREATE INDEX "plan_days_plan_id_idx" ON "plan_days"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_days_plan_id_day_number_key" ON "plan_days"("plan_id", "day_number");

-- CreateIndex
CREATE INDEX "plan_tasks_plan_day_id_idx" ON "plan_tasks"("plan_day_id");

-- CreateIndex
CREATE INDEX "plan_tasks_topic_id_idx" ON "plan_tasks"("topic_id");

-- CreateIndex
CREATE INDEX "ai_sessions_plan_task_id_idx" ON "ai_sessions"("plan_task_id");

-- CreateIndex
CREATE INDEX "ai_sessions_user_id_idx" ON "ai_sessions"("user_id");

-- CreateIndex
CREATE INDEX "ai_sessions_mode_feature_idx" ON "ai_sessions"("mode", "feature");

-- CreateIndex
CREATE INDEX "ai_messages_session_id_idx" ON "ai_messages"("session_id");

-- CreateIndex
CREATE INDEX "ai_assessment_attempts_session_id_idx" ON "ai_assessment_attempts"("session_id");

-- CreateIndex
CREATE INDEX "ai_assessment_answers_attempt_id_idx" ON "ai_assessment_answers"("attempt_id");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_days" ADD CONSTRAINT "plan_days_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_tasks" ADD CONSTRAINT "plan_tasks_plan_day_id_fkey" FOREIGN KEY ("plan_day_id") REFERENCES "plan_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_tasks" ADD CONSTRAINT "plan_tasks_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_tasks" ADD CONSTRAINT "plan_tasks_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_plan_task_id_fkey" FOREIGN KEY ("plan_task_id") REFERENCES "plan_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ai_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assessment_attempts" ADD CONSTRAINT "ai_assessment_attempts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ai_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assessment_answers" ADD CONSTRAINT "ai_assessment_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "ai_assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The app talks to Postgres directly via Prisma (a role that bypasses RLS),
-- so these policies are defense-in-depth for the `public` schema in case the
-- Supabase Data API is ever turned on for these tables. auth.uid() is a uuid;
-- user_id columns here are text (they mirror public.users.id), hence the
-- ::text casts. auth.uid() is wrapped in `(select ...)` so Postgres evaluates
-- it once per statement instead of once per row.
-- ---------------------------------------------------------------------------

ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subtopics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_days" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_assessment_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_assessment_answers" ENABLE ROW LEVEL SECURITY;

-- Catalog: global rows (user_id IS NULL) plus the caller's own rows are
-- readable; no client-side writes (writes go through the service role only).

CREATE POLICY "subjects_select" ON "subjects" FOR SELECT
  TO authenticated
  USING ("user_id" IS NULL OR "user_id" = (select auth.uid())::text);

CREATE POLICY "topics_select" ON "topics" FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "subjects" s
    WHERE s."id" = "topics"."subject_id"
      AND (s."user_id" IS NULL OR s."user_id" = (select auth.uid())::text)
  ));

CREATE POLICY "subtopics_select" ON "subtopics" FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "topics" t
    JOIN "subjects" s ON s."id" = t."subject_id"
    WHERE t."id" = "subtopics"."topic_id"
      AND (s."user_id" IS NULL OR s."user_id" = (select auth.uid())::text)
  ));

-- Study plans: owner-only.

CREATE POLICY "study_plans_select" ON "study_plans" FOR SELECT
  TO authenticated
  USING ("user_id" = (select auth.uid())::text);

CREATE POLICY "study_plans_insert" ON "study_plans" FOR INSERT
  TO authenticated
  WITH CHECK ("user_id" = (select auth.uid())::text);

CREATE POLICY "study_plans_update" ON "study_plans" FOR UPDATE
  TO authenticated
  USING ("user_id" = (select auth.uid())::text)
  WITH CHECK ("user_id" = (select auth.uid())::text);

CREATE POLICY "study_plans_delete" ON "study_plans" FOR DELETE
  TO authenticated
  USING ("user_id" = (select auth.uid())::text);

-- Plan days: owner-only via the parent study_plans row.

CREATE POLICY "plan_days_select" ON "plan_days" FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "study_plans" sp
    WHERE sp."id" = "plan_days"."plan_id" AND sp."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "plan_days_insert" ON "plan_days" FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM "study_plans" sp
    WHERE sp."id" = "plan_days"."plan_id" AND sp."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "plan_days_update" ON "plan_days" FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "study_plans" sp
    WHERE sp."id" = "plan_days"."plan_id" AND sp."user_id" = (select auth.uid())::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "study_plans" sp
    WHERE sp."id" = "plan_days"."plan_id" AND sp."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "plan_days_delete" ON "plan_days" FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "study_plans" sp
    WHERE sp."id" = "plan_days"."plan_id" AND sp."user_id" = (select auth.uid())::text
  ));

-- Plan tasks: owner-only via plan_days -> study_plans.

CREATE POLICY "plan_tasks_select" ON "plan_tasks" FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "plan_days" pd
    JOIN "study_plans" sp ON sp."id" = pd."plan_id"
    WHERE pd."id" = "plan_tasks"."plan_day_id" AND sp."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "plan_tasks_insert" ON "plan_tasks" FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM "plan_days" pd
    JOIN "study_plans" sp ON sp."id" = pd."plan_id"
    WHERE pd."id" = "plan_tasks"."plan_day_id" AND sp."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "plan_tasks_update" ON "plan_tasks" FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "plan_days" pd
    JOIN "study_plans" sp ON sp."id" = pd."plan_id"
    WHERE pd."id" = "plan_tasks"."plan_day_id" AND sp."user_id" = (select auth.uid())::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "plan_days" pd
    JOIN "study_plans" sp ON sp."id" = pd."plan_id"
    WHERE pd."id" = "plan_tasks"."plan_day_id" AND sp."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "plan_tasks_delete" ON "plan_tasks" FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "plan_days" pd
    JOIN "study_plans" sp ON sp."id" = pd."plan_id"
    WHERE pd."id" = "plan_tasks"."plan_day_id" AND sp."user_id" = (select auth.uid())::text
  ));

-- AI sessions: owner-only.

CREATE POLICY "ai_sessions_select" ON "ai_sessions" FOR SELECT
  TO authenticated
  USING ("user_id" = (select auth.uid())::text);

CREATE POLICY "ai_sessions_insert" ON "ai_sessions" FOR INSERT
  TO authenticated
  WITH CHECK ("user_id" = (select auth.uid())::text);

CREATE POLICY "ai_sessions_update" ON "ai_sessions" FOR UPDATE
  TO authenticated
  USING ("user_id" = (select auth.uid())::text)
  WITH CHECK ("user_id" = (select auth.uid())::text);

CREATE POLICY "ai_sessions_delete" ON "ai_sessions" FOR DELETE
  TO authenticated
  USING ("user_id" = (select auth.uid())::text);

-- AI messages: owner-only via ai_sessions.

CREATE POLICY "ai_messages_select" ON "ai_messages" FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "ai_sessions" s
    WHERE s."id" = "ai_messages"."session_id" AND s."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "ai_messages_insert" ON "ai_messages" FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM "ai_sessions" s
    WHERE s."id" = "ai_messages"."session_id" AND s."user_id" = (select auth.uid())::text
  ));

-- AI assessment attempts: owner-only via ai_sessions.

CREATE POLICY "ai_assessment_attempts_select" ON "ai_assessment_attempts" FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "ai_sessions" s
    WHERE s."id" = "ai_assessment_attempts"."session_id" AND s."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "ai_assessment_attempts_insert" ON "ai_assessment_attempts" FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM "ai_sessions" s
    WHERE s."id" = "ai_assessment_attempts"."session_id" AND s."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "ai_assessment_attempts_update" ON "ai_assessment_attempts" FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "ai_sessions" s
    WHERE s."id" = "ai_assessment_attempts"."session_id" AND s."user_id" = (select auth.uid())::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "ai_sessions" s
    WHERE s."id" = "ai_assessment_attempts"."session_id" AND s."user_id" = (select auth.uid())::text
  ));

-- AI assessment answers: owner-only via ai_assessment_attempts -> ai_sessions.

CREATE POLICY "ai_assessment_answers_select" ON "ai_assessment_answers" FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "ai_assessment_attempts" a
    JOIN "ai_sessions" s ON s."id" = a."session_id"
    WHERE a."id" = "ai_assessment_answers"."attempt_id" AND s."user_id" = (select auth.uid())::text
  ));

CREATE POLICY "ai_assessment_answers_insert" ON "ai_assessment_answers" FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM "ai_assessment_attempts" a
    JOIN "ai_sessions" s ON s."id" = a."session_id"
    WHERE a."id" = "ai_assessment_answers"."attempt_id" AND s."user_id" = (select auth.uid())::text
  ));
