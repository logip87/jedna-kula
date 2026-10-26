import type { ThrowScenario } from "./throw-scenarios";

export function ScenarioBoard({ scenario }: { scenario: ThrowScenario }) {
  return (
    <figure className="scenario-board">
      <svg viewBox="0 0 300 175" role="img" aria-label={`Układ sytuacji: ${scenario.description}`}>
        <rect x="5" y="5" width="290" height="165" rx="16" fill="#ede3cf" />
        <circle cx="86" cy="54" r="7" fill="#a84b20" />
        <text x="86" y="34" textAnchor="middle">ŚWINKA</text>
        {scenario.layout.balls.map((ball, index) => (
          <g key={`${ball.team}-${index}`}>
            <path d={`M86 54 L${ball.x} ${ball.y}`} stroke="#857969" strokeDasharray="4 4" />
            <circle
              cx={ball.x}
              cy={ball.y}
              r="12"
              fill={ball.team === "own" ? "#fffdf8" : "#1d1c18"}
              stroke="#1d1c18"
              strokeWidth="2"
            />
            <text x={ball.x} y={ball.y + 29} textAnchor="middle">{ball.distance}</text>
          </g>
        ))}
        <text x="18" y="151">Jasne — Twoje kule · ciemne — rywala</text>
      </svg>
      <figcaption>
        Kule do zagrania: Twoje {scenario.layout.ownBallsLeft} · rywala {scenario.layout.opponentBallsLeft}. Etykiety pokazują odległość od świnki.
      </figcaption>
    </figure>
  );
}
