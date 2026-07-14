/*
# Create interview sessions and session questions

1. New Tables
- `interview_sessions`: a single mock-interview run for one user.
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users, defaults to the authenticated user)
  - `role` (text) — target role, e.g. "Software Engineer"
  - `track` (text) — interview type, e.g. "behavioral", "technical"
  - `status` (text) — "in_progress" | "completed"
  - `overall_score` (int, nullable) — 0-100 overall score
  - `content_score` (int, nullable) — 0-100 content/answer quality
  - `delivery_score` (int, nullable) — 0-100 delivery/pacing/structure
  - `composure_score` (int, nullable) — 0-100 composure/confidence
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)
- `session_questions`: individual questions within a session.
  - `id` (uuid, PK)
  - `session_id` (uuid, FK to interview_sessions, cascade delete)
  - `question_text` (text)
  - `question_order` (int) — 1-based order
  - `answer_text` (text, nullable)
  - `time_taken_sec` (int, nullable) — seconds spent on the question
  - `score` (int, nullable) — 0-100 per-question score
  - `feedback` (text, nullable) — generated feedback text
  - `created_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- For session_questions, ownership is verified through the parent session via EXISTS subquery.
- `user_id` on interview_sessions defaults to auth.uid() so client inserts omitting it still succeed.
*/

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  track text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  overall_score int,
  content_score int,
  delivery_score int,
  composure_score int,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON interview_sessions;
CREATE POLICY "select_own_sessions" ON interview_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON interview_sessions;
CREATE POLICY "insert_own_sessions" ON interview_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sessions" ON interview_sessions;
CREATE POLICY "update_own_sessions" ON interview_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON interview_sessions;
CREATE POLICY "delete_own_sessions" ON interview_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS session_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_order int NOT NULL,
  answer_text text,
  time_taken_sec int,
  score int,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_questions" ON session_questions;
CREATE POLICY "select_own_questions" ON session_questions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interview_sessions s WHERE s.id = session_questions.session_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_questions" ON session_questions;
CREATE POLICY "insert_own_questions" ON session_questions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM interview_sessions s WHERE s.id = session_questions.session_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_questions" ON session_questions;
CREATE POLICY "update_own_questions" ON session_questions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interview_sessions s WHERE s.id = session_questions.session_id AND s.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM interview_sessions s WHERE s.id = session_questions.session_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_questions" ON session_questions;
CREATE POLICY "delete_own_questions" ON session_questions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interview_sessions s WHERE s.id = session_questions.session_id AND s.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
