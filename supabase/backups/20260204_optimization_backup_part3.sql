-- Backup Part 3
-- Date: 2026-02-04
-- For functions: find_nearby_bicycle_services, get_parking_spot_by_id, update_user_profile, submit_feedback (if exists)
-- For policies on: poi_flags

-- FUNCTIONS

CREATE OR REPLACE FUNCTION public.find_nearby_bicycle_services(user_lat double precision, user_lng double precision, radius_meters double precision DEFAULT 1000, only_available boolean DEFAULT true)
 RETURNS TABLE(id uuid, name text, description text, available boolean, city text, phone text, website text, opening_hours text, services text[], rating numeric, price_range text, picture_url text[], latitude double precision, longitude double precision, distance_meters double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        bs.id,
        bs.name,
        bs.description,
        bs.available,
        bs.city,
        bs.phone,
        bs.website,
        bs.opening_hours,
        bs.services,
        bs.rating,
        bs.price_range,
        bs.picture_url,
        ST_Y(bs.coordinate) as latitude,
        ST_X(bs.coordinate) as longitude,
        ST_Distance(
            bs.coordinate::geography, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters
    FROM "public"."bicycleService" bs
    WHERE 
        ST_DWithin(
            bs.coordinate::geography, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
            radius_meters
        )
        AND (NOT only_available OR bs.available = true)
    ORDER BY distance_meters ASC, bs.rating DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_profile(user_id uuid, new_username text DEFAULT NULL::text, new_full_name text DEFAULT NULL::text, new_avatar_url text DEFAULT NULL::text, new_phone text DEFAULT NULL::text, new_bio text DEFAULT NULL::text, new_website text DEFAULT NULL::text, new_location text DEFAULT NULL::text, new_dob date DEFAULT NULL::date)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result json;
BEGIN
    -- Check if user exists and has permission
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND id = auth.uid()) THEN
        RETURN json_build_object('error', 'Unauthorized or user not found');
    END IF;

    -- Update profile with only non-null values
    UPDATE public.profiles 
    SET 
        username = COALESCE(new_username, username),
        full_name = COALESCE(new_full_name, full_name),
        avatar_url = COALESCE(new_avatar_url, avatar_url),
        phone = COALESCE(new_phone, phone),
        bio = COALESCE(new_bio, bio),
        website = COALESCE(new_website, website),
        location = COALESCE(new_location, location),
        dob = COALESCE(new_dob, dob),
        updated_at = now()
    WHERE id = user_id;

    -- Return updated profile
    SELECT json_build_object(
        'id', p.id,
        'username', p.username,
        'full_name', p.full_name,
        'avatar_url', p.avatar_url,
        'phone', p.phone,
        'bio', p.bio,
        'website', p.website,
        'location', p.location,
        'dob', p.dob,
        'updated_at', p.updated_at
    ) INTO result
    FROM public.profiles p
    WHERE p.id = user_id;

    RETURN result;
END;
$function$;

-- POLICIES (poi_flags)
-- Admins can read all flags: is_admin()
-- Users can read own flags: (auth.uid() = user_id)
