-- Create artist_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  background_image_url TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  twitter_handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist_tracks table if it doesn't exist
CREATE TABLE IF NOT EXISTS artist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID,
  title VARCHAR(255) NOT NULL,
  price DECIMAL NOT NULL,
  audio_url TEXT NOT NULL,
  cover_art_url TEXT NOT NULL,
  inscription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row-level security
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for artist_profiles
DROP POLICY IF EXISTS "Users can view all artist profiles" ON artist_profiles;
CREATE POLICY "Users can view all artist profiles"
  ON artist_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own artist profile" ON artist_profiles;
CREATE POLICY "Users can update their own artist profile"
  ON artist_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own artist profile" ON artist_profiles;
CREATE POLICY "Users can insert their own artist profile"
  ON artist_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for artist_tracks
DROP POLICY IF EXISTS "Users can view all artist tracks" ON artist_tracks;
CREATE POLICY "Users can view all artist tracks"
  ON artist_tracks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own tracks" ON artist_tracks;
CREATE POLICY "Users can insert their own tracks"
  ON artist_tracks FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

-- Enable realtime for both tables
alter publication supabase_realtime add table artist_profiles;
alter publication supabase_realtime add table artist_tracks;