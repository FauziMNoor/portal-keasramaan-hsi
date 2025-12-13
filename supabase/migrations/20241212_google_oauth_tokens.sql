-- Create table for storing Google OAuth tokens
CREATE TABLE IF NOT EXISTS google_oauth_tokens_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE google_oauth_tokens_keasramaan ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tokens
CREATE POLICY "Users can view own tokens"
  ON google_oauth_tokens_keasramaan
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert own tokens"
  ON google_oauth_tokens_keasramaan
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update own tokens"
  ON google_oauth_tokens_keasramaan
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own tokens
CREATE POLICY "Users can delete own tokens"
  ON google_oauth_tokens_keasramaan
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_google_oauth_tokens_keasramaan_user_id ON google_oauth_tokens_keasramaan(user_id);
