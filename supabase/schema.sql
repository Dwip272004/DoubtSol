-- =============================================
-- Doubt Platform - Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'tutor', 'admin')) DEFAULT 'student',
  bio TEXT,
  avatar_url TEXT,
  subjects TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DOUBTS
-- =============================================
CREATE TABLE doubts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  status TEXT NOT NULL CHECK (status IN ('open', 'accepted', 'solved', 'expired', 'cancelled')) DEFAULT 'open',
  preferred_mode TEXT NOT NULL CHECK (preferred_mode IN ('text', 'call', 'both')) DEFAULT 'both',
  accepted_tutor_id UUID REFERENCES profiles(id),
  tags TEXT[],
  attachment_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DOUBT APPLICATIONS
-- =============================================
CREATE TABLE doubt_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doubt_id, tutor_id)
);

-- =============================================
-- ANSWERS
-- =============================================
CREATE TABLE answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'call_recording')) DEFAULT 'text',
  content TEXT,
  content_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENTS (Escrow)
-- =============================================
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  tutor_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  gateway_signature TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'held', 'released', 'refunded', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  tutor_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doubt_id, student_id)
);

-- =============================================
-- MESSAGES (Realtime Chat)
-- =============================================
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'file', 'system')) DEFAULT 'text',
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CALL SESSIONS
-- =============================================
CREATE TABLE call_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE NOT NULL,
  room_name TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_doubts_student_id ON doubts(student_id);
CREATE INDEX idx_doubts_status ON doubts(status);
CREATE INDEX idx_doubts_subject ON doubts(subject);
CREATE INDEX idx_doubt_applications_doubt_id ON doubt_applications(doubt_id);
CREATE INDEX idx_doubt_applications_tutor_id ON doubt_applications(tutor_id);
CREATE INDEX idx_messages_doubt_id ON messages(doubt_id);
CREATE INDEX idx_payments_doubt_id ON payments(doubt_id);
CREATE INDEX idx_reviews_tutor_id ON reviews(tutor_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_doubts_updated_at BEFORE UPDATE ON doubts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update tutor rating after review
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    rating = (SELECT AVG(rating) FROM reviews WHERE tutor_id = NEW.tutor_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE tutor_id = NEW.tutor_id)
  WHERE id = NEW.tutor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_tutor_rating();
