-- =============================================
-- Row Level Security Policies
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

-- =============================================
-- PROFILES
-- =============================================
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- DOUBTS
-- =============================================
CREATE POLICY "Doubts are viewable by everyone" ON doubts FOR SELECT USING (true);
CREATE POLICY "Students can create doubts" ON doubts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own doubts" ON doubts FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Students can delete own open doubts" ON doubts FOR DELETE USING (auth.uid() = student_id AND status = 'open');

-- =============================================
-- DOUBT APPLICATIONS
-- =============================================
CREATE POLICY "Applications viewable by doubt owner and applicant" ON doubt_applications
  FOR SELECT USING (
    auth.uid() = tutor_id OR
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id)
  );
CREATE POLICY "Tutors can apply to doubts" ON doubt_applications FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Doubt owner can update application status" ON doubt_applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id)
  );

-- =============================================
-- ANSWERS
-- =============================================
CREATE POLICY "Answers viewable by doubt participants" ON answers
  FOR SELECT USING (
    auth.uid() = tutor_id OR
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id)
  );
CREATE POLICY "Tutors can create answers" ON answers FOR INSERT WITH CHECK (auth.uid() = tutor_id);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE POLICY "Payments viewable by participants" ON payments
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);
CREATE POLICY "Students can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- =============================================
-- REVIEWS
-- =============================================
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Students can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = student_id);

-- =============================================
-- MESSAGES
-- =============================================
CREATE POLICY "Messages viewable by doubt participants" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id) OR
    auth.uid() IN (SELECT accepted_tutor_id FROM doubts WHERE id = doubt_id)
  );
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
CREATE POLICY "Call sessions viewable by doubt participants" ON call_sessions
  FOR SELECT USING (
    auth.uid() IN (SELECT student_id FROM doubts WHERE id = doubt_id) OR
    auth.uid() IN (SELECT accepted_tutor_id FROM doubts WHERE id = doubt_id)
  );

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE doubts;
ALTER PUBLICATION supabase_realtime ADD TABLE doubt_applications;
