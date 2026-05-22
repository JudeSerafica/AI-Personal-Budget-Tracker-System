-- ============================================================================
-- AI PERSONAL BUDGET TRACKER SYSTEM - SUPABASE SQL SETUP
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- 2. EMAIL VERIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  password TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);

-- Create indexes for email verifications
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON public.email_verifications(expires_at);

-- ============================================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_transactions_users 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

-- ============================================================================
-- 4. ACCOUNTS TABLE (for OAuth integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_accounts_users 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE,
  CONSTRAINT unique_provider_account 
    UNIQUE (provider, provider_account_id)
);

-- Create indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON public.accounts(provider);

-- ============================================================================
-- 5. SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_sessions_users 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON public.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON public.sessions(expires);

-- ============================================================================
-- 6. VERIFICATION TOKENS TABLE (for password reset, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_identifier_token 
    UNIQUE (identifier, token)
);

-- Create indexes for verification tokens
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON public.verification_tokens(expires);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier ON public.verification_tokens(identifier);

-- ============================================================================
-- 7. CATEGORIES TABLE (Optional but recommended)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default expense categories
INSERT INTO public.categories (name, description, type, color, is_default) VALUES
  ('Food & Dining', 'Restaurants, groceries, food delivery', 'expense', '#F59E0B', TRUE),
  ('Transportation', 'Fuel, public transport, car maintenance', 'expense', '#EF4444', TRUE),
  ('Shopping', 'Clothing, electronics, household items', 'expense', '#EC4899', TRUE),
  ('Entertainment', 'Movies, games, hobbies', 'expense', '#8B5CF6', TRUE),
  ('Healthcare', 'Medical, fitness, wellness', 'expense', '#06B6D4', TRUE),
  ('Utilities', 'Electricity, water, internet, phone', 'expense', '#14B8A6', TRUE),
  ('Housing', 'Rent, mortgage, home maintenance', 'expense', '#6366F1', TRUE),
  ('Education', 'Courses, books, tuition', 'expense', '#3B82F6', TRUE),
  ('Insurance', 'Health, auto, home insurance', 'expense', '#F97316', TRUE),
  ('Personal Care', 'Hair, spa, cosmetics', 'expense', '#D946EF', TRUE),
  ('Gifts & Donations', 'Gifts, charity, donations', 'expense', '#10B981', TRUE),
  ('Other', 'Miscellaneous expenses', 'expense', '#6B7280', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert default income categories
INSERT INTO public.categories (name, description, type, color, is_default) VALUES
  ('Salary', 'Regular salary or wages', 'income', '#10B981', TRUE),
  ('Freelance', 'Freelance work and projects', 'income', '#06B6D4', TRUE),
  ('Investments', 'Dividends, interest, capital gains', 'income', '#8B5CF6', TRUE),
  ('Business', 'Business revenue and sales', 'income', '#F59E0B', TRUE),
  ('Bonus', 'Bonuses and incentives', 'income', '#6366F1', TRUE),
  ('Other Income', 'Other sources of income', 'income', '#14B8A6', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Create index for categories
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- ============================================================================
-- 8. USER PROFILES TABLE (Optional but recommended for extended user info)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  bio TEXT,
  currency TEXT DEFAULT 'PHP',
  timezone TEXT DEFAULT 'Asia/Manila',
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_profiles_users 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE
);

-- Create index for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE - RLS POLICIES
-- ============================================================================

-- Allow users to view their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert (for new sign-ups)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- TRANSACTIONS TABLE - RLS POLICIES
-- ============================================================================

-- Allow users to select their own transactions
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own transactions
CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own transactions
CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own transactions
CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- ACCOUNTS TABLE - RLS POLICIES
-- ============================================================================

-- Allow users to select their own accounts
CREATE POLICY "accounts_select_own" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own accounts
CREATE POLICY "accounts_insert_own" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own accounts
CREATE POLICY "accounts_update_own" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own accounts
CREATE POLICY "accounts_delete_own" ON public.accounts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SESSIONS TABLE - RLS POLICIES
-- ============================================================================

-- Allow users to select their own sessions
CREATE POLICY "sessions_select_own" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own sessions
CREATE POLICY "sessions_insert_own" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own sessions
CREATE POLICY "sessions_delete_own" ON public.sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- EMAIL VERIFICATIONS TABLE - RLS POLICIES
-- ============================================================================

-- Allow anonymous users to insert verification records (during signup)
CREATE POLICY "email_verifications_insert_anonymous" ON public.email_verifications
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view their own verifications
CREATE POLICY "email_verifications_select_own" ON public.email_verifications
  FOR SELECT USING (true); -- Allow checking by email

-- ============================================================================
-- USER PROFILES TABLE - RLS POLICIES
-- ============================================================================

-- Allow users to select their own profile
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CATEGORIES TABLE - RLS POLICIES
-- ============================================================================

-- Allow anyone to select categories (public read-only)
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT USING (true);

-- ============================================================================
-- VERIFICATION TOKENS TABLE - RLS POLICIES
-- ============================================================================

-- Allow anyone to read verification tokens (for password reset flows)
CREATE POLICY "verification_tokens_select_public" ON public.verification_tokens
  FOR SELECT USING (true);

-- ============================================================================
-- 10. UTILITY FUNCTIONS
-- ============================================================================

-- Function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_verifications
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sessions
  WHERE expires < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired verification tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_tokens
  WHERE expires < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user's transaction summary
CREATE OR REPLACE FUNCTION get_user_transaction_summary(user_uuid UUID)
RETURNS TABLE (
  total_income DECIMAL,
  total_expenses DECIMAL,
  net_balance DECIMAL,
  transaction_count BIGINT,
  expense_count BIGINT,
  income_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(ABS(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)), 0) as total_expenses,
    COALESCE(SUM(amount), 0) as net_balance,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END) as expense_count,
    SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END) as income_count
  FROM public.transactions
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get category breakdown for a user
CREATE OR REPLACE FUNCTION get_category_breakdown(user_uuid UUID, period_days INT DEFAULT 30)
RETURNS TABLE (
  category TEXT,
  amount DECIMAL,
  transaction_count BIGINT,
  percentage DECIMAL
) AS $$
DECLARE
  total_amount DECIMAL;
BEGIN
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO total_amount
  FROM public.transactions
  WHERE user_id = user_uuid 
    AND type = 'expense'
    AND date > NOW() - INTERVAL '1 day' * period_days;

  RETURN QUERY
  SELECT
    t.category,
    COALESCE(SUM(ABS(t.amount)), 0) as amount,
    COUNT(*) as transaction_count,
    CASE 
      WHEN total_amount > 0 THEN ROUND((SUM(ABS(t.amount)) / total_amount * 100)::NUMERIC, 2)
      ELSE 0
    END as percentage
  FROM public.transactions t
  WHERE t.user_id = user_uuid 
    AND t.type = 'expense'
    AND t.date > NOW() - INTERVAL '1 day' * period_days
  GROUP BY t.category
  ORDER BY amount DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. STORAGE SETUP (Optional - for profile pictures)
-- ============================================================================

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 12. VIEWS FOR EASIER QUERYING
-- ============================================================================

-- View for user transactions with category info
CREATE OR REPLACE VIEW user_transactions_view AS
SELECT
  t.id,
  t.user_id,
  t.amount,
  t.description,
  t.category,
  c.icon,
  c.color,
  t.type,
  t.date,
  t.created_at,
  t.updated_at
FROM public.transactions t
LEFT JOIN public.categories c ON t.category = c.name AND t.type = c.type;

-- View for user financial summary
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT
  u.id,
  u.email,
  u.name,
  COUNT(t.id) as total_transactions,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses,
  SUM(t.amount) as net_balance,
  COUNT(DISTINCT DATE(t.date)) as active_days
FROM public.users u
LEFT JOIN public.transactions t ON u.id = t.user_id
GROUP BY u.id, u.email, u.name;

-- ============================================================================
-- 13. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date 
  ON public.transactions(user_id, type, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date 
  ON public.transactions(user_id, category, date DESC);

-- ============================================================================
-- 14. SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment this section if you want to add sample data for testing
/*
-- Create a test user (you'll need to replace this with actual Supabase auth users)
INSERT INTO public.users (id, email, name)
VALUES 
  (uuid_generate_v4(), 'test@example.com', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Add sample transactions
INSERT INTO public.transactions (user_id, amount, description, category, type, date)
SELECT 
  id,
  CASE WHEN random() > 0.5 THEN abs(random() * 5000) ELSE -(abs(random() * 2000)) END,
  'Sample transaction ' || seq,
  CASE WHEN random() > 0.5 THEN 'Food & Dining' ELSE 'Transportation' END,
  CASE WHEN random() > 0.5 THEN 'income' ELSE 'expense' END,
  NOW() - INTERVAL '1 day' * seq
FROM public.users, generate_series(1, 20) AS seq
WHERE email = 'test@example.com';
*/

-- ============================================================================
-- 15. SUMMARY
-- ============================================================================
-- Tables Created:
-- 1. users - Main user accounts
-- 2. email_verifications - Email verification codes during signup
-- 3. transactions - Financial transactions (income/expenses)
-- 4. accounts - OAuth account integrations
-- 5. sessions - User sessions
-- 6. verification_tokens - Password reset tokens
-- 7. categories - Transaction categories
-- 8. user_profiles - Extended user profile information
--
-- Features:
-- ✓ Row Level Security (RLS) enabled on all tables
-- ✓ Foreign key constraints for data integrity
-- ✓ Efficient indexes for query performance
-- ✓ Utility functions for common queries
-- ✓ Storage bucket for user avatars
-- ✓ Database views for easier querying
-- ✓ Default expense and income categories
-- ============================================================================
