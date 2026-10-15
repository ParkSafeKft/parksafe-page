import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditAction, AuditTargetType } from "@/lib/adminAuditLog";
import { recordActions } from "./adminRecordModel";

const tables: Record<string, string> = {
  users: "profiles",
  leaderboard: "profiles",
  parking: "parkingSpots",
  services: "bicycleService",
  repair: "repairStation",
  drinking_fountain: "drinkingFountain",
  cities: "cities",
  feedback: "feedback",
  poi_flags: "poi_flags",
  poi_suggestions: "poi_suggestions",
  community_routes: "community_bike_lanes",
};
type Audit = (entry: {
  adminId: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
}) => Promise<void>;
export async function applyRecordAction(
  client: Pick<SupabaseClient, "from" | "rpc">,
  audit: Audit,
  kind: string,
  ids: string[],
  value: string,
  adminId: string,
) {
  if (!adminId || !recordActions(kind).some((option) => option.value === value))
    throw new Error("Érvénytelen művelet.");
  const unique = [...new Set(ids)];
  if (!unique.length || unique.length > 100)
    throw new Error("Válassz ki 1–100 rekordot.");
  if (kind === "users" && value === "banned" && unique.includes(adminId))
    throw new Error("A saját adminhozzáférésed nem tilthatod le.");
  const succeeded: string[] = [],
    failed: string[] = [];
  const mutate = async (id: string) => {
    try {
      let action: AuditAction | undefined,
        targetType: AuditTargetType = "user";
      if (
        kind === "parking_images" ||
        value === "grant_supporter" ||
        value === "revoke_supporter"
      ) {
        const { data, error } =
          kind === "parking_images"
            ? await client.rpc("parking_image_submission_set_status", {
                p_submission_id: id,
                p_new_status: value,
              })
            : await client.rpc("set_supporter_status", {
                p_user_id: id,
                p_is_supporter: value === "grant_supporter",
              });
        if (error || data?.error) throw error || new Error(String(data.error));
        if (kind === "users") action = value as AuditAction;
      } else {
        const payload =
          kind === "leaderboard"
            ? { show_on_regional_leaderboard: value === "visible" }
            : kind === "users"
              ? {
                  banned_at:
                    value === "banned" ? new Date().toISOString() : null,
                }
              : kind === "cities"
                ? { is_active: value === "active" }
                : [
                      "parking",
                      "services",
                      "repair",
                      "drinking_fountain",
                    ].includes(kind)
                  ? { available: value === "available" }
                  : kind === "poi_flags"
                    ? { status: value, reviewed_at: new Date().toISOString() }
                    : { status: value };
        const { data, error } = await client
          .from(tables[kind])
          .update(payload)
          .eq("id", id)
          .select("id")
          .single();
        if (error || !data)
          throw error || new Error("A rekord nem módosítható.");
        if (kind === "leaderboard")
          action =
            value === "visible"
              ? "regional_visibility_on"
              : "regional_visibility_off";
        if (kind === "users")
          action = value === "banned" ? "ban_user" : "unban_user";
        if (kind === "cities") {
          action = "toggle_city_active";
          targetType = "city";
        }
        if (kind === "community_routes") {
          action = `community_route_${value}` as AuditAction;
          targetType = "community_bike_lane";
        }
      }
      if (action) await audit({ adminId, action, targetType, targetId: id });
      succeeded.push(id);
    } catch {
      failed.push(id);
    }
  };
  for (let offset = 0; offset < unique.length; offset += 4)
    await Promise.all(unique.slice(offset, offset + 4).map(mutate));
  return { succeeded, failed };
}
