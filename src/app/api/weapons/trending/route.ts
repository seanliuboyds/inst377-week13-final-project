import { getTopTrendingWeapons, incrementTrendingWeaponSearch } from "@/lib/weapon-search-trending";

interface TrackWeaponPayload {
  category?: string;
  hash?: number;
  icon?: string;
  name?: string;
}

export async function GET() {
  try {
    const results = await getTopTrendingWeapons(7);
    return Response.json({ results });
  } catch (error: unknown) {
    console.error(
      "Trending weapons lookup failed:",
      error instanceof Error ? error.message : String(error)
    );
    return Response.json({ results: [] });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TrackWeaponPayload;
    const hash = Number(payload.hash);
    const name = payload.name?.trim();

    if (!Number.isFinite(hash) || !name) {
      return Response.json({ error: "Invalid weapon payload" });
    }

    await incrementTrendingWeaponSearch({
      weaponCategory: payload.category ?? null,
      weaponHash: hash,
      weaponIcon: payload.icon ?? null,
      weaponName: name,
    });

    return Response.json({ ok: true });
  } catch (error: unknown) {
    console.error(
      "Trending weapon increment failed:",
      error instanceof Error ? error.message : String(error)
    );
    return Response.json({ error: "Failed to track weapon search" });
  }
}
