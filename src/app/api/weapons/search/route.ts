import { findManifestWeapons } from '@/lib/manifest-items';
import { searchHumanWeapons } from '@/lib/d2-api-human';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase();

  if (!query || query.length < 3) {
    return Response.json({ results: [] });
  }

  try {
    try {
      const manifestResults = await findManifestWeapons(query, 25);
      if (manifestResults.length > 0) {
        return Response.json({
          results: manifestResults.map((item) => ({
            id: item.hash.toString(),
            name: item.name ?? item.display_properties?.name ?? "Unknown Weapon",
            category:
              item.tier_display_name ??
              item.item_type_display_name ??
              "Weapon",
            icon: item.icon
              ? `https://www.bungie.net${item.icon}`
              : item.display_properties?.icon
                ? `https://www.bungie.net${item.display_properties.icon}`
                : "",
            tier: "",
          })),
        });
      }
    } catch (manifestError: unknown) {
      console.warn(
        "Manifest search fallback triggered:",
        manifestError instanceof Error ? manifestError.message : String(manifestError)
      );
    }

    try {
      const results = await searchHumanWeapons(query);
      return Response.json({ results });
    } catch {
      console.warn('d2-api-human search fallback triggered');
    }
    return Response.json({ results: [] });
  } catch (error: unknown) {
    console.error(
      'Bungie Manifest Search Error:',
      error instanceof Error ? error.message : String(error)
    );
    return Response.json({ error: 'Failed to search manifest' });
  }
}
