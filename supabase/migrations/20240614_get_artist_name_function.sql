-- Create a function to get artist name from any relevant table
CREATE OR REPLACE FUNCTION get_artist_name_by_id(artist_id UUID)
RETURNS TABLE (name TEXT) AS $$
BEGIN
  -- First try profiles table
  RETURN QUERY
  SELECT p.name FROM profiles p WHERE p.id = artist_id
  UNION ALL
  -- Then try artist_profiles table
  SELECT ap.name FROM artist_profiles ap WHERE ap.user_id = artist_id OR ap.id = artist_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for profiles if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END
$$;