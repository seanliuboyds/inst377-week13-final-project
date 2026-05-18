import Link from 'next/link';
import { toBungieAssetUrl } from '@/lib/bungie-assets';
import { getTopTrendingWeapons } from '@/lib/weapon-search-trending';

export const dynamic = 'force-dynamic';

const fallbackTrendingWeapons = [
  { name: "Exalted Truth (Adept)", type: "Hand Cannon" },
  { name: "Redrix's Estoc", type: "Pulse Rifle" },
  { name: "Exalted Truth", type: "Hand Cannon" },
  { name: "Joxer's Longsword", type: "Pulse Rifle" },
  { name: "Warlord's Spear", type: "Trace Rifle" },
  { name: "Unloved", type: "Hand Cannon" },
  { name: "Boondoggle Mk. 55", type: "Submachine Gun" }
];

export default async function HomePage() {
  let trendingWeapons = fallbackTrendingWeapons.map((weapon, index) => ({
    category: weapon.type,
    hash: `fallback-${index}`,
    icon: null as string | null,
    name: weapon.name,
  }));

  try {
    const supabaseTrendingWeapons = await getTopTrendingWeapons(7);
    if (supabaseTrendingWeapons.length > 0) {
      trendingWeapons = supabaseTrendingWeapons.map((weapon) => ({
        category: weapon.weapon_category ?? "Weapon",
        hash: weapon.weapon_hash.toString(),
        icon: weapon.weapon_icon,
        name: weapon.weapon_name,
      }));
    }
  } catch (error) {
    console.warn("Falling back to static trending weapons:", error);
  }

  return (
    <main className="home-layout">
      <div className="trending-section">
        <p className="branding-eyebrow">Destiny 2 // Year 7 // Season 26</p>
        <h1 className="hero-title">Heresy</h1>
        
        <h2 className="trending-header">Trending Weekly</h2>
        
        <ul className="weapon-list">
          {trendingWeapons.map((weapon) => (
            <li key={weapon.hash}>
              <Link
                href={weapon.hash.startsWith("fallback-") ? "/weapon-lab" : `/weapon-lab/${weapon.hash}`}
                className="weapon-item-link"
              >
                <div className="weapon-icon-container">
                  {toBungieAssetUrl(weapon.icon) ? (
                    <img
                      src={toBungieAssetUrl(weapon.icon)!}
                      alt={weapon.name}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div style={{width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #222)'}}></div>
                  )}
                </div>
                <div className="weapon-text-stack">
                  <span className="weapon-name">{weapon.name}</span>
                  <span className="weapon-category">{weapon.category}</span>
                </div>
                <span className="hover-arrow">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
