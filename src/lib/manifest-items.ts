import { getSupabasePublic } from "@/lib/supabase-public";

export interface ManifestItemRow {
  display_properties: {
    description?: string;
    icon?: string;
    name?: string;
  } | null;
  icon?: string | null;
  hash: number;
  item_type: number | null;
  item_type_display_name?: string | null;
  json: Record<string, unknown>;
  name: string | null;
  tier_display_name?: string | null;
}

async function getRowsByHashes(
  table: "destiny_inventory_items" | "destiny_sandbox_perks" | "destiny_traits",
  hashes: number[]
) {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from(table)
    .select("hash, name, icon, display_properties, json")
    .in("hash", hashes);

  if (error) {
    throw error;
  }

  return (data ?? []) as ManifestItemRow[];
}

export async function findManifestItemsByName(query: string, limit = 20) {
  const supabase = getSupabasePublic();
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const { data, error } = await supabase
    .from("destiny_inventory_items")
    .select("hash, name, icon, item_type, item_type_display_name, tier_display_name, display_properties, json")
    .ilike("name", `%${trimmedQuery}%`)
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as ManifestItemRow[];
}

export async function getManifestItemByHash(hash: number) {
  const supabase = getSupabasePublic();

  const { data, error } = await supabase
    .from("destiny_inventory_items")
    .select("hash, name, icon, item_type, item_type_display_name, tier_display_name, display_properties, json")
    .eq("hash", hash)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ManifestItemRow | null) ?? null;
}

export async function getManifestItemsByHashes(hashes: number[]) {
  const uniqueHashes = [...new Set(hashes.filter(Number.isFinite))];

  if (uniqueHashes.length === 0) {
    return new Map<number, ManifestItemRow>();
  }

  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("destiny_inventory_items")
    .select("hash, name, icon, item_type, item_type_display_name, tier_display_name, display_properties, json")
    .in("hash", uniqueHashes);

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((item) => [item.hash, item as ManifestItemRow]));
}

export async function getManifestPerkDefinitionsByHashes(hashes: number[]) {
  const uniqueHashes = [...new Set(hashes.filter(Number.isFinite))];

  if (uniqueHashes.length === 0) {
    return new Map<number, ManifestItemRow>();
  }

  const [inventoryRows, sandboxRows, traitRows] = await Promise.all([
    getRowsByHashes("destiny_inventory_items", uniqueHashes),
    getRowsByHashes("destiny_sandbox_perks", uniqueHashes),
    getRowsByHashes("destiny_traits", uniqueHashes),
  ]);

  // Prefer inventory item rows when they exist, then sandbox perks, then traits.
  return new Map(
    [...traitRows, ...sandboxRows, ...inventoryRows].map((item) => [item.hash, item])
  );
}

export async function findManifestWeapons(query: string, limit = 25) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  if (/^\d+$/.test(trimmedQuery)) {
    const item = await getManifestItemByHash(Number(trimmedQuery));
    return item && item.item_type === 3 ? [item] : [];
  }

  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("destiny_inventory_items")
    .select("hash, name, icon, item_type, item_type_display_name, tier_display_name, display_properties, json")
    .eq("item_type", 3)
    .ilike("name", `%${trimmedQuery}%`)
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as ManifestItemRow[];
}
