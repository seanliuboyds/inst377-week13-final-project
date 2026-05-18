export default function HowToPage() {
  return (
    <main className="info-page">
      <section className="info-shell">
        <div className="info-card info-card-wide">
          <p className="info-eyebrow">Guide</p>
          <h1 className="info-title">How To Use MIDA Mega Tool</h1>
          <p className="info-copy">
            Use the search bar in the header to find a weapon, open its customization page, and
            inspect the available perk columns, large weapon image, and stat panel.
          </p>
        </div>

        <div className="info-grid">
          <article className="info-card">
            <h2 className="info-section-title">1. Search A Weapon</h2>
            <p className="info-copy">
              Click the search bar in the top header and type at least three characters. The app
              will return matching weapons from the current manifest-backed search flow.
            </p>
          </article>

          <article className="info-card">
            <h2 className="info-section-title">2. Open The Weapon Page</h2>
            <p className="info-copy">
              Select a search result to open the weapon lab page. That click also contributes to
              the trending weapon counts used on the homepage.
            </p>
          </article>

          <article className="info-card">
            <h2 className="info-section-title">3. Review Perks</h2>
            <p className="info-copy">
              Each perk column represents a socket or roll category. Click different perk icons to
              inspect the available choices for that weapon.
            </p>
          </article>

          <article className="info-card">
            <h2 className="info-section-title">4. Check Stats</h2>
            <p className="info-copy">
              The right-side stat panel shows the current stat readout returned for the weapon,
              including core values like range, stability, handling, and magazine where available.
            </p>
          </article>
        </div>

        <div className="info-card">
          <h2 className="info-section-title">Extra Pages</h2>
          <ul className="info-list">
            <li>The Manifest page lets you query imported item definitions directly.</li>
            <li>The homepage shows trending weapons based on tracked search selections.</li>
            <li>The About page gives a high-level overview of the project and its stack.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
