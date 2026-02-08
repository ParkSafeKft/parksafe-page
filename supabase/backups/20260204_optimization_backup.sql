-- Backup of functions and policies before security/performance optimizations
-- Date: 2026-02-04

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.find_nearby_repair_stations(user_lat double precision, user_lng double precision, radius_meters double precision DEFAULT 1000, only_available boolean DEFAULT true)
 RETURNS TABLE(id uuid, name text, description text, available boolean, city text, covered boolean, free boolean, picture_url text[], latitude double precision, longitude double precision, distance_meters double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.name,
        rs.description,
        rs.available,
        rs.city,
        rs.covered,
        rs.free,
        rs.picture_url,
        ST_Y(rs.coordinate) as latitude,
        ST_X(rs.coordinate) as longitude,
        ST_Distance(
            rs.coordinate::geography, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters
    FROM "public"."repairStation" rs
    WHERE 
        ST_DWithin(
            rs.coordinate::geography, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
            radius_meters
        )
        AND (NOT only_available OR rs.available = true)
    ORDER BY distance_meters ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_bicycle_service_by_id(marker_id uuid)
 RETURNS TABLE(id uuid, name text, description text, available boolean, city text, phone text, website text, opening_hours text, services text[], rating numeric, price_range text, picture_url text[], latitude double precision, longitude double precision, created_at timestamp with time zone, updated_at timestamp with time zone)
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
        bs.created_at,
        bs.updated_at
    FROM "public"."bicycleService" bs
    WHERE bs.id = marker_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_feedback_stats()
 RETURNS TABLE(total_feedback integer, open_feedback integer, resolved_feedback integer, by_type json, by_category json, by_priority json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'open') as open_count,
            COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count
        FROM public.feedback
    ),
    type_stats AS (
        SELECT json_object_agg(type, count) as types
        FROM (
            SELECT type, COUNT(*) as count
            FROM public.feedback
            GROUP BY type
        ) t
    ),
    category_stats AS (
        SELECT json_object_agg(category, count) as categories
        FROM (
            SELECT category, COUNT(*) as count
            FROM public.feedback
            GROUP BY category
        ) c
    ),
    priority_stats AS (
        SELECT json_object_agg(priority, count) as priorities
        FROM (
            SELECT priority, COUNT(*) as count
            FROM public.feedback
            GROUP BY priority
        ) p
    )
    SELECT 
        stats.total::integer,
        stats.open_count::integer,
        stats.resolved_count::integer,
        COALESCE(type_stats.types, '{}'::json),
        COALESCE(category_stats.categories, '{}'::json),
        COALESCE(priority_stats.priorities, '{}'::json)
    FROM stats, type_stats, category_stats, priority_stats;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_feedback_history(user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(id uuid, type text, category text, title text, description text, priority text, status text, created_at timestamp with time zone, updated_at timestamp with time zone, resolved_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.type,
        f.category,
        f.title,
        f.description,
        f.priority,
        f.status,
        f.created_at,
        f.updated_at,
        f.resolved_at
    FROM public.feedback f
    WHERE f.user_id = user_id
    ORDER BY f.created_at DESC;
END;
$function$;

-- POLICIES (Reconstructed from existing state)

-- Table: public.poi_flags
-- Policy: Authenticated users can create flags
-- CMD: INSERT
-- WITH CHECK: (auth.uid() = user_id)
-- note: currently lacking (select ...) wrapper for performance

-- Table: public.feedback
-- Policy: Authenticated users can view all feedback
-- CMD: SELECT
-- QUAL: (auth.role() = 'authenticated'::text)
-- note: currently lacking (select ...) wrapper for performance

-- Table: public.repairStation
-- Policy: Admins can manage repair stations
-- CMD: ALL
-- QUAL: is_admin()
-- WITH CHECK: is_admin()
-- note: overlaps with "Public read access" for SELECT

-- Policy: Public read access
-- CMD: SELECT
-- QUAL: true
