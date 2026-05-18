import axios from "axios";
import { getHumanWeaponDetails } from "@/lib/d2-api-human";
import {
  getManifestItemByHash,
  getManifestPerkDefinitionsByHashes,
} from "@/lib/manifest-items";

const API_KEY = process.env.BUNGIE_API_KEY;
const BASE_URL = "https://www.bungie.net/Platform";

const itemDefinitionCache = new Map<number, any>();
const plugSetCache = new Map<number, any>();

const statHashes: Record<string, string> = {
  "1480404414": "Impact",
  "1935470627": "Range",
  "1885944937": "Stability",
  "1157121651": "Handling",
  "2837207746": "Reload Speed",
  "1345609583": "Aim Assistance",
  "3555269338": "Zoom",
  "2714457168": "Airborne Effectiveness",
  "4284893193": "RPM",
  "3871231066": "Magazine",
};

type SocketKind =
  | "intrinsic"
  | "barrel"
  | "scope"
  | "magazine"
  | "trait"
  | "origin"
  | "stock";

const socketKindLabels: Record<Exclude<SocketKind, "trait">, string> = {
  intrinsic: "Intrinsic",
  barrel: "Barrel",
  scope: "Scope",
  magazine: "Magazine",
  origin: "Origin Trait",
  stock: "Stock",
};

function getTextFragments(item: any) {
  return [
    item?.displayProperties?.name,
    item?.displayProperties?.description,
    item?.itemTypeDisplayName,
    item?.plug?.uiPlugLabel,
    item?.plug?.plugCategoryIdentifier,
    ...(item?.traitIds ?? []),
    ...(item?.itemCategoryHashes ?? []).map(String),
  ]
    .filter(Boolean)
    .map((value: string) => value.toLowerCase());
}

function isCosmeticOrUtilityPlug(item: any) {
  const text = getTextFragments(item).join(" ");

  return [
    "shader",
    "memento",
    "ornament",
    "tracker",
    "kill tracker",
    "weapon mod",
    "mod socket",
    "empty mod socket",
    "empty memento socket",
    "empty enhancement socket",
    "loadout",
    "deepsight",
    "enhancement",
    "weapon level boost",
    "artifact",
    "cosmetic",
  ].some((keyword) => text.includes(keyword));
}

function classifySocket(plugs: any[]): SocketKind | null {
  const text = plugs.flatMap(getTextFragments).join(" ");

  if (!text || plugs.every(isCosmeticOrUtilityPlug)) {
    return null;
  }

  if (text.includes("intrinsic") || text.includes("frame")) {
    return "intrinsic";
  }

  if (text.includes("barrel")) {
    return "barrel";
  }

  if (text.includes("scope") || text.includes("sight")) {
    return "scope";
  }

  if (text.includes("magazine") || text.includes("battery")) {
    return "magazine";
  }

  if (text.includes("origin trait")) {
    return "origin";
  }

  if (
    text.includes("stock") ||
    text.includes("grip") ||
    text.includes("guard") ||
    text.includes("haft") ||
    text.includes("blade")
  ) {
    return "stock";
  }

  if (text.includes("trait") || text.includes("perk")) {
    return "trait";
  }

  return null;
}

async function getItemDefinition(hash: number) {
  if (!itemDefinitionCache.has(hash)) {
    const response = await axios.get(
      `${BASE_URL}/Destiny2/Manifest/DestinyInventoryItemDefinition/${hash}/`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );
    itemDefinitionCache.set(hash, response.data.Response);
  }

  return itemDefinitionCache.get(hash);
}

async function getPlugSet(hash: number) {
  if (!plugSetCache.has(hash)) {
    const response = await axios.get(
      `${BASE_URL}/Destiny2/Manifest/DestinyPlugSetDefinition/${hash}/`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );
    plugSetCache.set(hash, response.data.Response);
  }

  return plugSetCache.get(hash);
}

async function getPlugHashesForSocket(
  entry: any,
  options: { includeRandomizedPlugSet: boolean }
) {
  const plugHashes = new Set<number>();

  entry.reusablePlugItems?.forEach((plug: any) => plugHashes.add(plug.plugItemHash));

  const plugSetHashes = [
    entry.reusablePlugSetHash,
    options.includeRandomizedPlugSet ? entry.randomizedPlugSetHash : undefined,
  ].filter(Boolean);

  await Promise.all(
    plugSetHashes.map(async (plugSetHash: number) => {
      try {
        const plugSet = await getPlugSet(plugSetHash);
        plugSet?.reusablePlugItems
          ?.filter((plug: any) => plug.currentlyCanRoll !== false)
          .forEach((plug: any) => plugHashes.add(plug.plugItemHash));
      } catch {
        // Some plug sets are not accessible for every item, so we skip failed lookups.
      }
    })
  );

  if (plugHashes.size === 0 && entry.singleInitialItemHash) {
    plugHashes.add(entry.singleInitialItemHash);
  }

  return [...plugHashes];
}

function buildStats(item: any) {
  const statsMap: Record<string, number> = {};

  if (item.stats?.stats) {
    Object.entries(item.stats.stats).forEach(([sHash, sData]: [string, any]) => {
      if (statHashes[sHash]) {
        statsMap[sHash] = sData.value;
      }
    });
  }

  item.investmentStats?.forEach((stat: any) => {
    const sHash = stat.statTypeHash.toString();
    if (statHashes[sHash]) {
      statsMap[sHash] = stat.value;
    }
  });

  return Object.entries(statsMap).map(([sHash, value]) => ({
    label: statHashes[sHash],
    value,
  }));
}

export async function GET(_request: Request, context: any) {
  try {
    const params = await context.params;
    const hash = Number(params.hash);

    try {
      const humanWeapon = await getHumanWeaponDetails(hash);
      try {
        const perkHashes = humanWeapon.sockets.flatMap((socket) =>
          socket.plugs.map((plug) => plug.hash)
        );
        const manifestItems = await getManifestPerkDefinitionsByHashes(perkHashes);
        const manifestWeapon = await getManifestItemByHash(hash);

        return Response.json({
          ...humanWeapon,
          icon:
            manifestWeapon?.icon ??
            manifestWeapon?.display_properties?.icon ??
            humanWeapon.icon,
          screenshot:
            humanWeapon.screenshot ??
            (typeof manifestWeapon?.json?.screenshot === "string"
              ? manifestWeapon.json.screenshot
              : undefined),
          name:
            manifestWeapon?.name ??
            manifestWeapon?.display_properties?.name ??
            humanWeapon.name,
          category:
            manifestWeapon?.tier_display_name ??
            manifestWeapon?.item_type_display_name ??
            humanWeapon.category,
          sockets: humanWeapon.sockets.map((socket) => ({
            ...socket,
            plugs: socket.plugs.map((plug) => {
              const manifestPlug = manifestItems.get(plug.hash);

              return {
                ...plug,
                name:
                  manifestPlug?.name ??
                  manifestPlug?.display_properties?.name ??
                  plug.name,
                icon:
                  manifestPlug?.icon ??
                  manifestPlug?.display_properties?.icon ??
                  "",
              };
            }),
          })),
        });
      } catch (manifestError: unknown) {
        console.warn(
          `Manifest perk hydration fallback triggered for ${hash}:`,
          manifestError instanceof Error ? manifestError.message : String(manifestError)
        );
        return Response.json(humanWeapon);
      }
    } catch {
      console.warn(`d2-api-human detail fallback triggered for ${hash}`);
    }

    const item = await getItemDefinition(hash);

    const socketsPayload: Array<{ kind: SocketKind; plugs: any[] }> = [];

    for (const entry of item.sockets?.socketEntries ?? []) {
      const seedPlugHashes = [
        ...(entry.reusablePlugItems?.map((plug: any) => plug.plugItemHash) ?? []),
        ...(entry.singleInitialItemHash ? [entry.singleInitialItemHash] : []),
      ];

      const seedPlugDefinitions = (
        await Promise.all(
          [...new Set(seedPlugHashes)].map(async (plugHash) => {
            try {
              return await getItemDefinition(plugHash);
            } catch {
              return null;
            }
          })
        )
      ).filter(Boolean);

      const kind = classifySocket(seedPlugDefinitions);
      if (!kind) {
        continue;
      }

      const includeRandomizedPlugSet = !["barrel", "scope", "magazine"].includes(kind);
      const plugHashes = await getPlugHashesForSocket(entry, { includeRandomizedPlugSet });
      if (plugHashes.length === 0) {
        continue;
      }

      const plugDefinitions = (
        await Promise.all(
          plugHashes.map(async (plugHash) => {
            try {
              return await getItemDefinition(plugHash);
            } catch {
              return null;
            }
          })
        )
      ).filter(Boolean);

      const plugs = plugDefinitions
        .filter((plug) => {
          return (
            plug.hash !== item.hash &&
            plug.displayProperties?.name &&
            plug.displayProperties?.icon &&
            !isCosmeticOrUtilityPlug(plug)
          );
        })
        .map((plug) => ({
          name: plug.displayProperties.name,
          icon: plug.displayProperties.icon,
          hash: plug.hash,
        }));

      if (plugs.length === 0) {
        continue;
      }

      socketsPayload.push({ kind, plugs });
    }

    let traitCount = 0;

    return Response.json({
      name: item.displayProperties.name,
      category: item.itemTypeAndTierDisplayName,
      icon: item.displayProperties.icon,
      screenshot: typeof item.screenshot === "string" ? item.screenshot : item.displayProperties.icon,
      stats: buildStats(item),
      sockets: socketsPayload.map((socket) => ({
        label:
          socket.kind === "trait"
            ? `Trait ${++traitCount}`
            : socketKindLabels[socket.kind],
        plugs: socket.plugs,
      })),
    });
  } catch (err: any) {
    console.error("API Route Error:", err.message);
    return Response.json({ error: "Failed to load weapon details" });
  }
}
