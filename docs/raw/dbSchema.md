```sql
-- Subjects (e.g., Physics, Maths)
CREATE TABLE IF NOT EXISTS subjects (
  id          bigserial PRIMARY KEY,
  user_id     bigint,                    -- NULL if global catalog; otherwise REFERENCES users(id)
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Topics under a subject (e.g., Calculus, Gravity)
CREATE TABLE IF NOT EXISTS topics (
  id          bigserial PRIMARY KEY,
  subject_id  bigint NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name        text NOT NULL,
  code        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Subtopics under a topic (e.g., Integrals, Newton's Laws)
CREATE TABLE IF NOT EXISTS subtopics (
  id          bigserial PRIMARY KEY,
  topic_id    bigint NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name        text NOT NULL,
  code        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. Study Plans
-- ----------------------------------------------------------------------------

-- A study plan created by a user (e.g., "JEE 2026 Physics + Maths – 60 days")
CREATE TABLE study_plans (
  id              bigserial PRIMARY KEY,
  user_id         bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            text NOT NULL,                     -- e.g. "JEE 2026 – 60 days"
  start_date      date NOT NULL,                     -- planned start date
  end_date        date NOT NULL,                     -- planned end date
  duration_days   int NOT NULL,                      -- total days including rest
  status          text NOT NULL DEFAULT 'active',    -- active, completed, paused, cancelled
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_plans_user ON study_plans(user_id);

-- ----------------------------------------------------------------------------
-- 3. Plan Days (including rest days)
-- ----------------------------------------------------------------------------

-- Each row represents one day in a study plan (Day 1, Day 2, ...).
-- Supports:
--   - Rest days (is_rest_day = true)
--   - Reordering (day_number)
--   - Rescheduling (scheduled_date)
--   - Status tracking (pending, in_progress, completed, skipped)
CREATE TABLE plan_days (
  id              bigserial PRIMARY KEY,
  plan_id         bigint NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  day_number      int NOT NULL,                    -- logical order: 1, 2, 3, ...
  scheduled_date  date NOT NULL,                   -- actual calendar date for this day
  is_rest_day     boolean NOT NULL DEFAULT false,  -- true for rest days (no tasks)
  notes           text,                            -- optional user notes for the day
  status          text NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (plan_id, day_number)
);

CREATE INDEX idx_plan_days_plan ON plan_days(plan_id);
-- Optional: if you need fast "today's tasks for user" queries, consider denormalizing user_id here.

-- ----------------------------------------------------------------------------
-- 4. Plan Tasks (topics/subtopics assigned to a day)
-- ----------------------------------------------------------------------------

-- Each row represents one study task for a given day:
--   - Topic (required)
--   - Subtopic (optional)
--   - Order within the day (order_index)
--   - Status (pending, in_progress, completed, skipped)
CREATE TABLE plan_tasks (
  id              bigserial PRIMARY KEY,
  plan_day_id     bigint NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
  topic_id        bigint NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  subtopic_id     bigint REFERENCES subtopics(id) ON DELETE SET NULL,
  title           text,                            -- optional override title for this task
  order_index     int NOT NULL DEFAULT 0,          -- ordering of tasks within the day
  status          text NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped
  started_at      timestamptz,                     -- when student started this task
  completed_at    timestamptz,                     -- when student marked as completed
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_plan_tasks_day ON plan_tasks(plan_day_id);
CREATE INDEX idx_plan_tasks_topic ON plan_tasks(topic_id);

-- ----------------------------------------------------------------------------
-- 5. AI Sessions (per task, per mode/feature)
-- ----------------------------------------------------------------------------

-- Each time a student interacts with AI for a specific task, an AI session is created.
-- Modes:
--   - 'learning'    → features: ask_ai, revision, summary, last_minute, explain
--   - 'assessment'  → features: mcq_quiz, mock_exam, flashcard, short_questions
--
-- A session groups related messages (conversation thread) for a specific feature.
CREATE TABLE ai_sessions (
  id              bigserial PRIMARY KEY,
  plan_task_id    bigint NOT NULL REFERENCES plan_tasks(id) ON DELETE CASCADE,
  user_id         bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode            text NOT NULL,                   -- 'learning' | 'assessment'
  feature         text NOT NULL,                   -- e.g. 'ask_ai', 'revision', 'summary', 'last_minute', 'explain',
                                                   --      'mcq_quiz', 'mock_exam', 'flashcard', 'short_questions'
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,                     -- set when session is closed/abandoned
  metadata        jsonb NOT NULL DEFAULT '{}',     -- optional: model, temperature, tokens, etc.
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_sessions_task ON ai_sessions(plan_task_id);
CREATE INDEX idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX idx_ai_sessions_mode_feature ON ai_sessions(mode, feature);

-- ----------------------------------------------------------------------------
-- 6. AI Messages (user queries and AI responses)
-- ----------------------------------------------------------------------------

-- Each message in an AI session (chat-like history).
-- Supports:
--   - Plain text conversations (content)
--   - Structured content (content_json) for MCQs, flashcards, mock tests, etc.
--
-- Roles:
--   - 'user'      → student's query/prompt
--   - 'assistant' → AI's response
--   - 'system'    → optional system messages (e.g., context, instructions)
CREATE TABLE ai_messages (
  id              bigserial PRIMARY KEY,
  session_id      bigint NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role            text NOT NULL,                   -- 'user' | 'assistant' | 'system'
  content         text NOT NULL,                   -- main text of the message
  content_json    jsonb,                           -- optional structured payload (MCQs, flashcards, etc.)
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_messages_session ON ai_messages(session_id);

-- Optional GIN index if you need to query inside content_json (e.g., find all MCQ sets)
-- CREATE INDEX idx_ai_messages_content_json ON ai_messages USING GIN (content_json);

-- ----------------------------------------------------------------------------
-- 7. Optional: Assessment Attempts and Answers (for analytics)
-- ----------------------------------------------------------------------------

-- One row per attempt at an assessment-type session (MCQ quiz, mock exam, etc.).
-- Linked to an ai_session; stores high-level attempt info (score, duration, etc.).
CREATE TABLE ai_assessment_attempts (
  id              bigserial PRIMARY KEY,
  session_id      bigint NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,                     -- when student finished the attempt
  score           numeric,                         -- optional: 0–100 or raw score
  metadata        jsonb NOT NULL DEFAULT '{}',     -- optional: time_spent, difficulty, etc.
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_attempts_session ON ai_assessment_attempts(session_id);

-- One row per question answered in an assessment attempt.
-- Works with structured content_json in ai_messages (e.g., questions[].id).
CREATE TABLE ai_assessment_answers (
  id                  bigserial PRIMARY KEY,
  attempt_id          bigint NOT NULL REFERENCES ai_assessment_attempts(id) ON DELETE CASCADE,
  question_id         text NOT NULL,               -- matches id in content_json.questions[].id
  selected_option_idx int,                         -- for MCQs: index of selected option (0-based)
  is_correct          boolean,                     -- true if answer is correct
  response_text       text,                        -- for short questions: student's text answer
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_answers_attempt ON ai_assessment_answers(attempt_id);
```
