-- Backup Part 5
-- Date: 2026-02-04
-- For functions: get_zoom_level, get_user_profile_safe, update_updated_at_column, is_admin

CREATE OR REPLACE FUNCTION public.get_user_profile_safe(user_id uuid)
 RETURNS TABLE(id uuid, email text, username text, full_name text, avatar_url text, phone text, bio text, website text, location text, created_at timestamp with time zone, updated_at timestamp with time zone, email_confirmed_at timestamp with time zone, last_sign_in_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- First ensure the profile exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = user_id) THEN
        -- Create profile if it doesn't exist
        INSERT INTO public.profiles (id, username, full_name, avatar_url)
        SELECT 
            u.id,
            u.raw_user_meta_data->>'username',
            u.raw_user_meta_data->>'full_name',
            u.raw_user_meta_data->>'avatar_url'
        FROM auth.users u
        WHERE u.id = user_id;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        u.email::text,  -- Cast varchar to text
        p.username,
        p.full_name,
        p.avatar_url,
        p.phone,
        p.bio,
        p.website,
        p.location,
        p.created_at,
        p.updated_at,
        u.email_confirmed_at,
        u.last_sign_in_at
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE p.id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_zoom_level(latitude_delta double precision)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Convert latitude delta to zoom level (inverse of frontend calculation)
    IF latitude_delta > 0.2 THEN RETURN 8;   -- Very zoomed out
    ELSIF latitude_delta > 0.1 THEN RETURN 10;  -- Zoomed out
    ELSIF latitude_delta > 0.05 THEN RETURN 12; -- Medium zoom
    ELSIF latitude_delta > 0.02 THEN RETURN 14; -- Close zoom
    ELSIF latitude_delta > 0.015 THEN RETURN 15; -- Very close zoom
    ELSIF latitude_delta > 0.01 THEN RETURN 16; -- Very zoomed in
    ELSIF latitude_delta > 0.007 THEN RETURN 17; -- Extremely close
    ELSIF latitude_delta > 0.005 THEN RETURN 18; -- Super close
    ELSIF latitude_delta > 0.003 THEN RETURN 19; -- Maximum zoom
    ELSE RETURN 20; -- Extreme zoom
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;
