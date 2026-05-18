import { getSupabasePublic } from "@/lib/supabase-public";

export interface TrendingWeaponRow {
  weapon_category: string | null;
  weapon_hash: number;
  weapon_icon: string | null;
  weapon_name: string;
  search_count: number;
}

export async function getTopTrendingWeapons(limit = 7) {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("weapon_search_trending")
    .select("weapon_hash, weapon_name, weapon_category, weapon_icon, search_count")
    .order("search_count", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as TrendingWeaponRow[];
}

export async function incrementTrendingWeaponSearch(input: {
  weaponCategory?: string | null;
  weaponHash: number;
  weaponIcon?: string | null;
  weaponName: string;
}) {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase.rpc("increment_weapon_search_trending", {
    input_weapon_category: input.weaponCategory ?? null,
    input_weapon_hash: input.weaponHash,
    input_weapon_icon: input.weaponIcon ?? null,
    input_weapon_name: input.weaponName,
  });

  if (error) {
    throw error;
  }

  return data;
}
