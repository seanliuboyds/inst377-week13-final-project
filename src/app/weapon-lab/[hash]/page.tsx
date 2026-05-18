"use client";
import { useState, useEffect, use } from "react";
import { toBungieAssetUrl } from "@/lib/bungie-assets";
import "./WeaponLab.css";

interface Perk {
  name: string;
  icon: string;
  hash: number;
}

interface Socket {
  label: string;
  plugs: Perk[];
}

interface Stat {
  label: string;
  value: number;
}

interface WeaponData {
  name: string;
  category: string;
  icon: string;
  screenshot?: string;
  stats: Stat[];
  sockets: Socket[];
}

export default function WeaponPage({ params: paramsPromise }: { params: Promise<{ hash: string }> }) {
  const params = use(paramsPromise);
  const [weapon, setWeapon] = useState<WeaponData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerks, setSelectedPerks] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchWeapon() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching weapon details for:", params.hash);
        const res = await fetch(`/api/weapons/details/${params.hash}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        console.log("Weapon data received:", data);
        setWeapon(data);
        
        // Default to first perk in each socket
        const defaults: Record<number, number> = {};
        data.sockets?.forEach((socket: Socket, idx: number) => {
          if (socket.plugs.length > 0) {
            defaults[idx] = socket.plugs[0].hash;
          }
        });
        setSelectedPerks(defaults);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message || "Failed to load weapon details.");
      } finally {
        setLoading(false);
      }
    }
    fetchWeapon();
  }, [params.hash]);

  const togglePerk = (socketIdx: number, perkHash: number) => {
    setSelectedPerks(prev => ({
      ...prev,
      [socketIdx]: perkHash
    }));
  };

  if (loading) return (
    <div className="weapon-lab-layout">
        <div className="lab-loading">Fetching weapon from database...</div>
    </div>
  );
  
  if (error) return (
    <div className="weapon-lab-layout">
       <div className="lab-error">{error}</div>
    </div>
  );

  if (!weapon) return (
    <div className="weapon-lab-layout">
       <div className="lab-error">Weapon Data Corruption</div>
    </div>
  );

  return (
    <div className="weapon-lab-layout">
      {/* Left Column: Perks and Selection */}
      <div className="lab-left">
        <div className="weapon-identity">
          <div className="identity-header">
             {toBungieAssetUrl(weapon.icon) && (
               <img
                 src={toBungieAssetUrl(weapon.icon)!}
                 alt=""
                 className="weapon-main-icon"
               />
             )}
             <div>
                <h1 className="weapon-title">{weapon.name}</h1>
                <p className="weapon-subtitle">{weapon.category}</p>
             </div>
          </div>
        </div>

        <div className="perk-grid">
          <div className="weapon-showcase" aria-hidden="true">
            {toBungieAssetUrl(weapon.screenshot ?? weapon.icon) && (
              <img
                src={toBungieAssetUrl(weapon.screenshot ?? weapon.icon)!}
                alt=""
                className="weapon-showcase-image"
              />
            )}
          </div>
           {weapon.sockets?.map((socket: Socket, idx: number) => (
             <div key={idx} className="perk-column">
               <div className="perk-column-header">{socket.label}</div>
               <div className="perk-list">
                 {socket.plugs.map((plug: Perk, pIdx: number) => (
                   <div 
                    key={pIdx} 
                    className={`perk-node ${selectedPerks[idx] === plug.hash ? 'selected' : ''}`}
                    title={plug.name}
                    onClick={() => togglePerk(idx, plug.hash)}
                   >
                     {toBungieAssetUrl(plug.icon) && (
                       <img src={toBungieAssetUrl(plug.icon)!} alt={plug.name} />
                     )}
                   </div>
                 ))}
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* Right Column: Stats and Info */}
      <div className="lab-right">
        <div className="stats-panel">
          <div className="stats-header">STATS</div>
          <div className="stats-list">
             {weapon.stats?.map((stat: Stat, idx: number) => (
               <div key={idx} className="stat-row">
                 <div className="stat-label-row">
                   <span className="stat-label">{stat.label}</span>
                   <span className="stat-value-text">{stat.value}</span>
                 </div>
                 <div className="stat-bar-bg">
                   <div className="stat-bar-fill" style={{ width: `${Math.min(100, stat.value)}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
