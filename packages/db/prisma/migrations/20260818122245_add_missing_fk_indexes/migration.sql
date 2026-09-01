-- CreateIndex
CREATE INDEX "subjects_user_id_idx" ON "subjects"("user_id");

-- CreateIndex
CREATE INDEX "topics_subject_id_idx" ON "topics"("subject_id");

-- CreateIndex
CREATE INDEX "subtopics_topic_id_idx" ON "subtopics"("topic_id");

-- CreateIndex
CREATE INDEX "plan_tasks_subtopic_id_idx" ON "plan_tasks"("subtopic_id");
