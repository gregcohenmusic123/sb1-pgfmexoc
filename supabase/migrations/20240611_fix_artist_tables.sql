-- Check if tables exist and create them if they don't

DO $$ 
BEGIN
    -- Create artist_profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'artist_profiles') THEN
        CREATE TABLE public.artist_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            bio TEXT,
            website_url TEXT,
            instagram_handle TEXT,
            twitter_handle TEXT,
            profile_image_url TEXT,
            background_image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
    END IF;

    -- Create artist_tracks table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'artist_tracks') THEN
        CREATE TABLE public.artist_tracks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            audio_url TEXT NOT NULL,
            cover_art_url TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
    END IF;

    -- Create RLS policies for artist_profiles
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'artist_profiles') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view all artist profiles" ON public.artist_profiles;
        DROP POLICY IF EXISTS "Users can update their own artist profile" ON public.artist_profiles;
        DROP POLICY IF EXISTS "Users can insert their own artist profile" ON public.artist_profiles;
        
        -- Create policies
        CREATE POLICY "Users can view all artist profiles"
            ON public.artist_profiles FOR SELECT
            USING (true);
            
        CREATE POLICY "Users can update their own artist profile"
            ON public.artist_profiles FOR UPDATE
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can insert their own artist profile"
            ON public.artist_profiles FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Create RLS policies for artist_tracks
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'artist_tracks') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view all artist tracks" ON public.artist_tracks;
        DROP POLICY IF EXISTS "Artists can insert their own tracks" ON public.artist_tracks;
        DROP POLICY IF EXISTS "Artists can update their own tracks" ON public.artist_tracks;
        
        -- Create policies
        CREATE POLICY "Users can view all artist tracks"
            ON public.artist_tracks FOR SELECT
            USING (true);
            
        CREATE POLICY "Artists can insert their own tracks"
            ON public.artist_tracks FOR INSERT
            WITH CHECK (auth.uid() = artist_id);
            
        CREATE POLICY "Artists can update their own tracks"
            ON public.artist_tracks FOR UPDATE
            USING (auth.uid() = artist_id);
    END IF;

    -- Safely add tables to realtime publication if they're not already members
    -- For artist_profiles
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'artist_profiles') THEN
        BEGIN
            -- Check if the table is already in the publication
            IF NOT EXISTS (
                SELECT 1 FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                AND schemaname = 'public' 
                AND tablename = 'artist_profiles'
            ) THEN
                -- Add to publication only if not already a member
                ALTER PUBLICATION supabase_realtime ADD TABLE public.artist_profiles;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if table is already in publication
            NULL;
        END;
    END IF;

    -- For artist_tracks
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'artist_tracks') THEN
        BEGIN
            -- Check if the table is already in the publication
            IF NOT EXISTS (
                SELECT 1 FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                AND schemaname = 'public' 
                AND tablename = 'artist_tracks'
            ) THEN
                -- Add to publication only if not already a member
                ALTER PUBLICATION supabase_realtime ADD TABLE public.artist_tracks;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if table is already in publication
            NULL;
        END;
    END IF;

    -- Enable RLS on tables
    ALTER TABLE IF EXISTS public.artist_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.artist_tracks ENABLE ROW LEVEL SECURITY;

END $$;