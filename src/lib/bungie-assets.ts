export function toBungieAssetUrl(assetPath?: string | null) {
  if (!assetPath) {
    return null;
  }

  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  if (assetPath.startsWith("/")) {
    return `https://www.bungie.net${assetPath}`;
  }

  return null;
}
