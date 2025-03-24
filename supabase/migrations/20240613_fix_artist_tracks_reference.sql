-- Fix the foreign key constraint in artist_tracks table

DO $$ 
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Drop the existing foreign key constraint if it exists
    FOR constraint_rec IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'artist_tracks'
        AND ccu.table_name = 'profiles'
    ) LOOP
        EXECUTE 'ALTER TABLE artist_tracks DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name;
    END LOOP;
    
    -- Add a new foreign key constraint that references auth.users instead
    ALTER TABLE IF EXISTS artist_tracks
    DROP CONSTRAINT IF EXISTS artist_tracks_artist_id_fkey,
    ADD CONSTRAINT artist_tracks_artist_id_fkey
    FOREIGN KEY (artist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;