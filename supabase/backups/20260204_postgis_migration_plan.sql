-- Backup / Migration Plan for PostGIS
-- Date: 2026-02-04
-- Current State: Extension 'postgis' is in 'public' schema.
-- Goal: Move 'postgis' to 'extensions' schema to improve security and resolve Supabase/PostgREST warnings.

-- PLAN:
-- 1. Create schema 'extensions'
-- 2. Move extension 'postgis' to 'extensions'
-- 3. Update database search_path to include 'extensions'
-- 4. Update specific custom functions to include 'extensions' in their search_path so they can find ST_Distance, etc.

-- Dependencies detected (Functions using PostGIS):
-- - find_nearby_repair_stations
-- - get_bicycle_service_by_id
-- - get_clustered_markers
-- - find_nearby_bicycle_services
-- - get_parking_spot_by_id
-- - find_nearby_parking_spots
-- - get_cluster_details (likely)
-- - get_repair_station_by_id
-- - get_all_parking_spots

-- If this migration fails, the revert strategy is:
-- ALTER EXTENSION postgis SET SCHEMA public;
-- ALTER ROLE postgres SET search_path = "$user", public;
-- Re-run the SET search_path = public commands from previous backups.
