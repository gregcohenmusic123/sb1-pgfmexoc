-- Check for any foreign key constraints or triggers that might reference the 'profile' table

DO $$ 
DECLARE
    constraint_rec RECORD;
    trigger_rec RECORD;
BEGIN
    -- Check if there are any foreign key constraints referencing a non-existent 'profile' table
    -- and drop them if they exist
    
    -- For artist_tracks table
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'profile'
        AND tc.table_name = 'artist_tracks'
    ) THEN
        -- Get the constraint name
        FOR constraint_rec IN (
            SELECT tc.constraint_name 
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'profile'
            AND tc.table_name = 'artist_tracks'
        ) LOOP
            EXECUTE 'ALTER TABLE artist_tracks DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name;
        END LOOP;
    END IF;
    
    -- For artist_profiles table
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'profile'
        AND tc.table_name = 'artist_profiles'
    ) THEN
        -- Get the constraint name
        FOR constraint_rec IN (
            SELECT tc.constraint_name 
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'profile'
            AND tc.table_name = 'artist_profiles'
        ) LOOP
            EXECUTE 'ALTER TABLE artist_profiles DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name;
        END LOOP;
    END IF;
    
    -- Check for any triggers that might reference the 'profile' table
    -- This is a simplified approach and might need to be expanded based on your specific setup
    FOR trigger_rec IN (
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE action_statement LIKE '%profile%'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.trigger_name || ' ON ' || trigger_rec.event_object_table;
    END LOOP;
    
EXCEPTION WHEN OTHERS THEN
    -- Log the error but continue
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;