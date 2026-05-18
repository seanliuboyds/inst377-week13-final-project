const BASE_URL = "https://cdn.jsdelivr.net/gh/altbdoor/d2-api-human@data";
const CACHE_BUSTER = Math.floor(Date.now() / 1000 / 86400);
const REVALIDATE_SECONDS = 60 * 60 * 12;

type HumanWeaponTier = "common" | "exotic" | "legendary" | "rare" | "uncommon";

type HumanWeaponType =
  | "auto_rifle"
  | "bow"
  | "fusion_rifle"
  | "grenade_launcher"
  | "hand_cannon"
  | "linear_fusion_rifle"
  | "machinegun"
  | "pulse_rifle"
  | "rocket_launcher"
  | "scout_rifle"
  | "shotgun"
  | "sidearm"
  | "sniper_rifle"
  | "submachinegun"
  | "sword"
  | "trace_rifle";

interface HumanFrame {
  name: string;
  description: string;
  icon: string;
}

interface HumanPerk {
  icon: string;
  description: string;
  id: number;
  name: string;
  stats?: Record<string, number>;
}

interface HumanWeaponLite {
  id: number;
  name: string;
  icon: string;
  weapon_tier: HumanWeaponTier;
  weapon_type: HumanWeaponType;
}

interface HumanWeapon extends HumanWeaponLite {
  screenshot?: string;
  flavor_text?: string;
  ammo_type?: string;
  element_class?: string;
  powercap?: number | null;
  frame?: HumanFrame;
  stats?: Record<string, number>;
  perks?: HumanPerk[][];
}

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  icon: string;
  tier: string;
}

export interface WeaponSocket {
  label: string;
  plugs: Array<{
    name: string;
    icon: string;
    hash: number;
  }>;
}

export interface WeaponDetails {
  name: string;
  category: string;
  icon: string;
  screenshot?: string;
  stats: Array<{
    label: string;
    value: number;
  }>;
  sockets: WeaponSocket[];
}

const SEARCH_LABELS: Record<HumanWeaponType, string> = {
  auto_rifle: "Auto Rifle",
  bow: "Bow",
  fusion_rifle: "Fusion Rifle",
  grenade_launcher: "Grenade Launcher",
  hand_cannon: "Hand Cannon",
  linear_fusion_rifle: "Linear Fusion Rifle",
  machinegun: "Machine Gun",
  pulse_rifle: "Pulse Rifle",
  rocket_launcher: "Rocket Launcher",
  scout_rifle: "Scout Rifle",
  shotgun: "Shotgun",
  sidearm: "Sidearm",
  sniper_rifle: "Sniper Rifle",
  submachinegun: "Submachine Gun",
  sword: "Sword",
  trace_rifle: "Trace Rifle",
};

const SLOT_ONE_LABELS: Partial<Record<HumanWeaponType, string>> = {
  bow: "Bowstring",
  fusion_rifle: "Battery",
  grenade_launcher: "Launcher Barrel",
  linear_fusion_rifle: "Battery",
  rocket_launcher: "Launcher Barrel",
  sword: "Blade",
};

const SLOT_TWO_LABELS: Partial<Record<HumanWeaponType, string>> = {
  bow: "Arrow",
  fusion_rifle: "Battery",
  grenade_launcher: "Magazine",
  linear_fusion_rifle: "Battery",
  rocket_launcher: "Magazine",
  sword: "Guard",
};

const STAT_LABELS: Record<string, string> = {
  aim_assistance: "Aim Assistance",
  airborne_effectiveness: "Airborne Effectiveness",
  blast_radius: "Blast Radius",
  charge_time: "Charge Time",
  draw_time: "Draw Time",
  handling: "Handling",
  impact: "Impact",
  magazine: "Magazine",
  range: "Range",
  reload_speed: "Reload Speed",
  rounds_per_minute: "RPM",
  stability: "Stability",
  velocity: "Velocity",
  zoom: "Zoom",
};

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildCategory(weaponTier: HumanWeaponTier, weaponType: HumanWeaponType) {
  return `${titleCase(weaponTier)} ${SEARCH_LABELS[weaponType]}`;
}

function normalizeText(value: string) {
  return value.toLowerCase();
}

function inferSlotLabel(weaponType: HumanWeaponType, slotIndex: number, perks: HumanPerk[]) {
  if (slotIndex === 0) {
    const combined = perks
      .flatMap((perk) => [perk.name, perk.description])
      .join(" ")
      .toLowerCase();

    if (
      combined.includes("scope") ||
      combined.includes("sight") ||
      combined.includes("optic")
    ) {
      return "Scope";
    }

    return SLOT_ONE_LABELS[weaponType] ?? "Barrel";
  }

  if (slotIndex === 1) {
    return SLOT_TWO_LABELS[weaponType] ?? "Magazine";
  }

  if (slotIndex === 2) {
    return "Trait 1";
  }

  if (slotIndex === 3) {
    return "Trait 2";
  }

  if (slotIndex === 4) {
    return "Origin Trait";
  }

  return `Trait ${slotIndex - 1}`;
}

function stablePerkHash(weaponId: number, slotIndex: number, perkName: string) {
  let hash = `${weaponId}:${slotIndex}:${perkName}`
    .split("")
    .reduce((accumulator, character) => {
      return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
    }, 7);

  if (hash === 0) {
    hash = weaponId + slotIndex + 1;
  }

  return hash;
}

async function fetchHumanJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}?ts=${CACHE_BUSTER}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`d2-api-human request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function searchHumanWeapons(query: string): Promise<SearchResult[]> {
  const normalizedQuery = normalizeText(query.trim());
  if (normalizedQuery.length < 3) {
    return [];
  }

  const weapons = await fetchHumanJson<HumanWeaponLite[]>("/weapons/all_lite.json");

  return weapons
    .filter((weapon) => normalizeText(weapon.name).includes(normalizedQuery))
    .slice(0, 25)
    .map((weapon) => ({
      id: weapon.id.toString(),
      name: weapon.name,
      category: buildCategory(weapon.weapon_tier, weapon.weapon_type),
      icon: `https://www.bungie.net${weapon.icon}`,
      tier: weapon.weapon_tier,
    }));
}

export async function getHumanWeaponDetails(hash: number): Promise<WeaponDetails> {
  const weapon = await fetchHumanJson<HumanWeapon>(`/weapons/id/${hash}.json`);

  const stats = Object.entries(weapon.stats ?? {})
    .filter(([, value]) => typeof value === "number")
    .map(([key, value]) => ({
      label: STAT_LABELS[key] ?? titleCase(key),
      value,
    }));

  const sockets: WeaponSocket[] = [];

  const fixIcon = (icon: string) => {
      if (!icon) return "";
      if (icon.startsWith("http")) return icon;
      return `https://www.bungie.net${icon.startsWith("/") ? "" : "/"}${icon}`;
  };

  if (weapon.frame) {
    sockets.push({
      label: "Intrinsic",
      plugs: [
        {
          name: weapon.frame.name,
          icon: fixIcon(weapon.frame.icon),
          hash: stablePerkHash(weapon.id, -1, weapon.frame.name),
        },
      ],
    });
  }

  (weapon.perks ?? []).forEach((slot, slotIndex) => {
    if (slot.length === 0) {
      return;
    }

    sockets.push({
      label: inferSlotLabel(weapon.weapon_type, slotIndex, slot),
      plugs: slot.map((perk) => ({
          name: perk.name,
          icon: fixIcon(perk.icon),
          hash: perk.id ?? stablePerkHash(weapon.id, slotIndex, perk.name),
        })),
      });
  });

  return {
    name: weapon.name,
    category: buildCategory(weapon.weapon_tier, weapon.weapon_type),
    icon: weapon.icon,
    screenshot: weapon.screenshot ? fixIcon(weapon.screenshot) : undefined,
    stats,
    sockets,
  };
}
