"use client";

import { useEffect, useState } from "react";
import { toBungieAssetUrl } from "@/lib/bungie-assets";

interface ManifestItem {
  display_properties: {
    description?: string;
    icon?: string;
    name?: string;
  } | null;
  hash: number;
  item_type: number | null;
  name: string | null;
}

export default function ManifestLabPage() {
  const [query, setQuery] = useState("Rewind Rounds");
  const [results, setResults] = useState<ManifestItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/manifest/items?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Manifest lookup failed");
        }

        setResults(data.results || []);
      } catch (fetchError: any) {
        setResults([]);
        setError(fetchError.message || "Manifest lookup failed");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <main className="hero-section">
      <div className="welcome-card" style={{ textAlign: "left" }}>
        <h2 style={{ color: "#5b99c2" }}>Manifest Lab</h2>
        <p style={{ maxWidth: "none" }}>
          Search the imported Destiny manifest in Supabase by item name. This is the closest
          equivalent to your old SQLite query workflow.
        </p>

        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#0f1113",
            borderRadius: "6px",
            border: "1px solid #222a30",
          }}
        >
          <label
            htmlFor="manifest-search"
            style={{ display: "block", marginBottom: "10px", color: "#8ea0ad" }}
          >
            Search item name
          </label>
          <input
            id="manifest-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rewind Rounds"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#07090b",
              color: "#f3f4f6",
              border: "1px solid #2e3942",
              borderRadius: "4px",
              fontSize: "0.95rem",
            }}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          {loading && <p style={{ color: "#8ea0ad" }}>Searching Supabase manifest...</p>}
          {error && (
            <p style={{ color: "#ef8d8d" }}>
              {error}. If you just set this up, the manifest table may not be imported yet or it
              may need a public `select` policy.
            </p>
          )}

          {!loading && !error && results.length === 0 && (
            <p style={{ color: "#8ea0ad" }}>No manifest items found.</p>
          )}

          <div style={{ display: "grid", gap: "12px" }}>
            {results.map((item) => (
              <div
                key={item.hash}
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                  padding: "14px",
                  background: "#0f1113",
                  border: "1px solid #222a30",
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    width: "54px",
                    height: "54px",
                    background: "#07090b",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {toBungieAssetUrl(item.display_properties?.icon) && (
                    <img
                      src={toBungieAssetUrl(item.display_properties?.icon)!}
                      alt={item.name ?? "Manifest item"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <div>
                  <div style={{ color: "#f3f4f6", fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: "#8ea0ad", fontSize: "0.9rem" }}>Hash: {item.hash}</div>
                  {item.display_properties?.description && (
                    <div style={{ color: "#b7c1c9", fontSize: "0.9rem", marginTop: "4px" }}>
                      {item.display_properties.description}
                    </div>
                  )}
                  {item.display_properties?.icon && (
                    <div
                      style={{
                        color: "#5b99c2",
                        fontSize: "0.8rem",
                        marginTop: "6px",
                        wordBreak: "break-all",
                      }}
                    >
                      {item.display_properties.icon}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
