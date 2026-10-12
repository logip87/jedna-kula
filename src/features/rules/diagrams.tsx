export function BoundaryDiagrams() {
  return (
    <div className="boundary-grid">
      {[
        { x: 45, label: "Ważna", caption: "Cała po stronie gry" },
        {
          x: 100,
          label: "Na linii — ważna",
          caption: "Nie przekroczyła w całości",
        },
        { x: 119, label: "Jeszcze ważna", caption: "Fragment nadal nad linią" },
        { x: 145, label: "Aut", caption: "Całkowicie poza linią" },
      ].map((item) => (
        <figure key={item.label}>
          <svg viewBox="0 0 200 125" role="img" aria-label={item.caption}>
            <rect width="100" height="125" fill="#efbb32" />
            <rect x="100" width="100" height="125" fill="#ffe3d5" />
            <path d="M100 8V117" stroke="#1d1c18" strokeWidth="3" />
            <circle
              cx={item.x}
              cy="60"
              r="22"
              fill="#1d1c18"
              stroke="white"
              strokeWidth="3"
            />
            <text x="30" y="111" fontSize="12">
              GRA
            </text>
            <text x="143" y="111" fontSize="12">
              AUT
            </text>
          </svg>
          <figcaption>
            <b>{item.label}</b>
            <small>{item.caption}</small>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
export function ShootingDiagrams() {
  const figures = [
    { title: "1. Kula", description: "Cel w środku koła.", kind: 1 },
    {
      title: "2. Kula za świnką",
      description: "Przeszkoda przed celem, odstęp 10 cm.",
      kind: 2,
    },
    {
      title: "3. Kula między kulami",
      description: "Po 3 cm odstępu od każdej przeszkody.",
      kind: 3,
    },
    {
      title: "4. Kula za kulą",
      description: "Przeszkoda przed celem, odstęp 10 cm.",
      kind: 4,
    },
    {
      title: "5. Świnka",
      description: "Cel 20 cm od bliższej krawędzi koła.",
      kind: 5,
    },
  ];
  return (
    <>
      <figure className="shoot-track">
        <svg
          viewBox="0 0 620 180"
          role="img"
          aria-label="Tor: cztery kółka do rzutu 50 cm, 6, 7, 8 i 9 metrów od bliższej krawędzi koła celu o średnicy 1 metr"
        >
          <path d="M25 85H515" stroke="#857969" strokeDasharray="5 5" />
          {[9, 8, 7, 6].map((n, i) => (
            <g key={n}>
              <circle
                cx={45 + i * 85}
                cy="85"
                r="24"
                fill="#ede3cf"
                stroke="#1d1c18"
                strokeWidth="2"
              />
              <text x={45 + i * 85} y="135" textAnchor="middle" fontSize="17">
                {n} m
              </text>
            </g>
          ))}
          <circle
            cx="540"
            cy="85"
            r="49"
            fill="#efbb32"
            stroke="#1d1c18"
            strokeWidth="3"
          />
          <circle cx="540" cy="85" r="8" fill="#1d1c18" />
          <text x="540" y="157" textAnchor="middle" fontSize="16">
            cel: Ø 1 m
          </text>
          <text x="170" y="30" textAnchor="middle" fontSize="16">
            kółka do rzutu: Ø 50 cm
          </text>
        </svg>
        <figcaption>
          Dystans do brzegu koła celu. Rysunek poglądowy, bez skali.
        </figcaption>
      </figure>
      <div className="figure-grid">
        {figures.map((f) => (
          <figure key={f.kind}>
            <svg
              viewBox="0 0 180 205"
              role="img"
              aria-label={`${f.title}. ${f.description} Rzut od dołu.`}
            >
              <circle
                cx="90"
                cy="85"
                r="70"
                fill="#efbb32"
                stroke="#1d1c18"
                strokeWidth="2"
              />
              {f.kind !== 5 && (
                <circle
                  cx="90"
                  cy="85"
                  r="12"
                  fill="white"
                  stroke="#1d1c18"
                  strokeWidth="2"
                />
              )}
              {f.kind === 2 && <circle cx="90" cy="119" r="5" fill="#a84b20" />}
              {f.kind === 3 && (
                <>
                  <circle cx="55" cy="85" r="12" fill="#1d1c18" />
                  <circle cx="125" cy="85" r="12" fill="#1d1c18" />
                </>
              )}
              {f.kind === 4 && (
                <circle cx="90" cy="127" r="12" fill="#1d1c18" />
              )}
              {f.kind === 5 && <circle cx="90" cy="127" r="5" fill="#a84b20" />}
              <path
                d="M90 193V170m-5 7 5-7 5 7"
                fill="none"
                stroke="#1d1c18"
                strokeWidth="3"
              />
            </svg>
            <figcaption>
              <b>{f.title}</b>
              <small>{f.description}</small>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="muted">
        Biała = kula celu, ciemna = przeszkoda, mała pomarańczowa = świnka.
        Figury widziane z góry; rzut od dołu. Diagramy poglądowe, bez skali.
      </p>
    </>
  );
}
