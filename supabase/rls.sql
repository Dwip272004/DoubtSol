-- =============================================
-- Row Level Security Policies (Idempotent)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES
-- =============================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- DOUBTS
-- =============================================
DROP POLICY IF EXISTS "Doubts are viewable by everyone" ON doubts;
CREATE POLICY "Doubts are viewable by everyone" ON doubts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can create doubts" ON doubts;
CREATE POLICY "Students can create doubts" ON doubts FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own doubts" ON doubts;
CREATE POLICY "Students can update own doubts" ON doubts FOR UPDATE USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can delete own open doubts" ON doubts;
CREATE POLICY "Students can delete own open doubts" ON doubts FOR DELETE USING (auth.uid() = student_id AND status = 'open');

-- =============================================
-- DOUBT APPLICATIONS
-- =============================================
DROP POLICY IF EXISTS "Applications viewable by doubt owner and applicant" ON doubt_applications;
CREATE POLICY "Applications viewable by doubt owner and applicant" ON doubt_applications
  FOR SELECT USING (
    auth.uid() = tutor_id OR
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id)
  );

DROP POLICY IF EXISTS "Tutors can apply to doubts" ON doubt_applications;
CREATE POLICY "Tutors can apply to doubts" ON doubt_applications FOR INSERT WITH CHECK (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Doubt owner can update application status" ON doubt_applications;
CREATE POLICY "Doubt owner can update application status" ON doubt_applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id)
  );

-- =============================================
-- ANSWERS
-- =============================================
DROP POLICY IF EXISTS "Answers viewable by doubt participants" ON answers;
CREATE POLICY "Answers viewable by doubt participants" ON answers
  FOR SELECT USING (
    auth.uid() = tutor_id OR
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id)
  );

DROP POLICY IF EXISTS "Tutors can create answers" ON answers;
CREATE POLICY "Tutors can create answers" ON answers FOR INSERT WITH CHECK (auth.uid() = tutor_id);

-- =============================================
-- PAYMENTS
-- =============================================
DROP POLICY IF EXISTS "Payments viewable by participants" ON payments;
CREATE POLICY "Payments viewable by participants" ON payments
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Students can create payments" ON payments;
CREATE POLICY "Students can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- =============================================
-- REVIEWS
-- =============================================
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can create reviews" ON reviews;
CREATE POLICY "Students can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = student_id);

-- =============================================
-- MESSAGES
-- =============================================
DROP POLICY IF EXISTS "Messages viewable by doubt participants" ON messages;
CREATE POLICY "Messages viewable by doubt participants" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id) OR
    auth.uid() IN (SELECT accepted_tutor_id FROM doubts WHERE id = doubt_id)
  );

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id) OR
      auth.uid() IN (SELECT accepted_tutor_id FROM doubts WHERE id = doubt_id)
    )
  );

-- =============================================
-- CALL SESSIONS
-- =============================================
DROP POLICY IF EXISTS "Call sessions viewable by doubt participants" ON call_sessions;
CREATE POLICY "Call sessions viewable by doubt participants" ON call_sessions
  FOR SELECT USING (
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id) OR
    auth.uid() IN (SELECT accepted_tutor_id FROM doubts WHERE id = doubt_id)
  );

-- =============================================
-- NOTIFICATIONS
-- =============================================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- REALTIME (Run these only once or in separate block)
-- =============================================
-- These might error if already added, but usually they just skip.
-- To be safe, we wrap them in a DO block if needed, 
-- but most users can just ignore "publication already exists" errors.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'doubts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE doubts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'doubt_applications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE doubt_applications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;
