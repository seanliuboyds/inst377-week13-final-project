export default function AboutPage() {
  return (
    <main className="info-page">
      <section className="info-shell">
        <div className="info-card info-card-wide">
          <p className="info-eyebrow">Overview</p>
          <h1 className="info-title">About MIDA Mega Tool</h1>
          <p className="info-copy">
            MIDA Mega Tool is a Destiny 2 weapon exploration app focused on fast weapon lookup,
            perk browsing, manifest-backed data, and a cleaner path for building roll-comparison
            tools on top of Bungie and Supabase data.
          </p>
          <p className="info-copy">
            The project combines a Next.js frontend, Supabase-hosted manifest tables, and Bungie
            API integrations to make weapon search, customization, and trending discovery feel
            immediate and visual.
          </p>
        </div>

        <div className="info-grid">
          <article className="info-card">
            <h2 className="info-section-title">What It Does</h2>
            <ul className="info-list">
              <li>Searches weapons by name or manifest hash.</li>
              <li>Loads a weapon customization view with perk sockets and stats.</li>
              <li>Uses manifest data for icons, names, and item enrichment.</li>
              <li>Tracks trending weapons based on search-result selections.</li>
            </ul>
          </article>

          <article className="info-card">
            <h2 className="info-section-title">How It Is Built</h2>
            <ul className="info-list">
              <li>Next.js 16 App Router for pages and route handlers.</li>
              <li>Supabase for manifest storage and trending analytics.</li>
              <li>Bungie API plus `d2-api-human` for weapon and perk data.</li>
              <li>Vercel for production deployment.</li>
            </ul>
          </article>
        </div>

        <div className="info-card">
          <h2 className="info-section-title">Project Notes</h2>
          <p className="info-copy">
            This app is still evolving. Some areas are data-heavy and depend on external services,
            so local setup requires both Bungie API credentials and a Supabase project with the
            manifest schema loaded.
          </p>
          <p className="info-footer">Built by Sean Liu - 2026</p>
        </div>
      </section>
    </main>
  );
}
