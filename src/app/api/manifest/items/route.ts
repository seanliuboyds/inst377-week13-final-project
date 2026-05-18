import { findManifestItemsByName, getManifestItemByHash } from "@/lib/manifest-items";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hashParam = searchParams.get("hash");
  const queryParam = searchParams.get("q");

  try {
    if (hashParam) {
      const hash = Number(hashParam);

      if (!Number.isFinite(hash)) {
        return Response.json({ error: "Invalid hash" });
      }

      const item = await getManifestItemByHash(hash);
      return Response.json({ item });
    }

    if (!queryParam || queryParam.trim().length < 2) {
      return Response.json({ results: [] });
    }

    const results = await findManifestItemsByName(queryParam, 25);
    return Response.json({ results });
  } catch (error: any) {
    console.error("Manifest item lookup failed:", error.message);
    return Response.json({ error: "Manifest lookup failed" });
  }
}
