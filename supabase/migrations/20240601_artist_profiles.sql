-- Create artist_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  background_image_url TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  twitter_handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS artist_profiles_user_id_idx ON artist_profiles(user_id);

-- Enable row level security
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view any profile
DROP POLICY IF EXISTS "Anyone can view artist profiles" ON artist_profiles;
CREATE POLICY "Anyone can view artist profiles"
  ON artist_profiles FOR SELECT
  USING (true);

-- Allow users to update only their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON artist_profiles;
CREATE POLICY "Users can update own profile"
  ON artist_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert only their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON artist_profiles;
CREATE POLICY "Users can insert own profile"
  ON artist_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON artist_profiles;
CREATE POLICY "Users can delete own profile"
  ON artist_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime subscriptions
alter publication supabase_realtime add table artist_profiles;