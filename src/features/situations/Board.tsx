import type { TacticCase } from "../adventure/data";
export function TacticBoard({ scenario }: { scenario: TacticCase }) {
  const jack = scenario.jack ?? { x: 150, y: 220 };
  return (
    <>
      <svg
        className="tactic-board"
        viewBox="0 0 300 430"
        role="img"
        aria-label={scenario.description}
      >
        <rect
          x="10"
          y="10"
          width="280"
          height="410"
          rx="18"
          fill="#ede4ce"
          stroke="#1d1c18"
          strokeWidth="2"
        />
        <circle
          cx="150"
          cy="370"
          r="22"
          fill="none"
          stroke="#1d1c18"
          strokeWidth="3"
        />
        <circle cx={jack.x} cy={jack.y} r="5" fill="#a84b20" />
        {scenario.id === "terrain" && (
          <rect x="30" y="270" width="240" height="30" fill="#af9a76" />
        )}
        {scenario.balls.map((b, i) => (
          <circle
            key={i}
            cx={b.x}
            cy={b.y}
            r="12"
            fill={b.team === "own" ? "#ede3cf" : "#1d1c18"}
            stroke="#1d1c18"
            strokeWidth="2"
          />
        ))}
        <text x="150" y="407" textAnchor="middle" fontSize="13">
          KÓŁKO
        </text>
      </svg>
      <p className="muted small">
        Widok poglądowy, bez skali. Jasne kule — Twoje, ciemne — rywala,
        pomarańczowa — świnka.
      </p>
      <p className="notice">
        Świnka: {scenario.distance ?? 7} m · teren:{" "}
        {scenario.surface ?? "Drobny żwir"}. Ryzyko strzału:{" "}
        {scenario.shotRisk ?? "zależne od wejścia"}.
      </p>
    </>
  );
}
export function TacticalFeedback({
  scenario,
  choice,
}: {
  scenario: TacticCase;
  choice: number;
}) {
  const option = scenario.options[choice];
  if (!option) return null;
  return (
    <section className="tactic-feedback" role="status">
      <p className="eyebrow">TWÓJ PLAN: {option.title}</p>
      <p>{option.explanation}</p>
      {option.benefit && (
        <p>
          <b>Korzyść:</b> {option.benefit}
        </p>
      )}
      {option.risk && (
        <p>
          <b>Ryzyko:</b> {option.risk}
        </p>
      )}
      <p>
        <b>Alternatywa:</b>{" "}
        {option.alternative ??
          scenario.options[(choice + 1) % scenario.options.length].title}
      </p>
      <p>
        Porównaj warianty ze swoimi wynikami i terenem. Nie ma jednej
        gwarantowanej odpowiedzi dla każdego zawodnika.
      </p>
    </section>
  );
}
