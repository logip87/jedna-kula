import type { Mode, Session } from "../../domain";
export const decisionReviews = [
  "plan adekwatny",
  "zmienię decyzję",
  "trudno ocenić",
] as const;
export type DecisionReview = (typeof decisionReviews)[number];
export interface ThrowScenario {
  id: string;
  title: string;
  description: string;
  options: { title: string; mode: Mode }[];
  layout: {
    ownBallsLeft: number;
    opponentBallsLeft: number;
    balls: { team: "own" | "opponent"; distance: string; x: number; y: number }[];
  };
}
const options: ThrowScenario["options"] = [
  { title: "Puentuję lepiej", mode: "point" },
  { title: "Strzelam kulę rywala", mode: "shoot" },
  { title: "Chronię własną kulę", mode: "point" },
];
export const throwScenarios: ThrowScenario[] = [
  {
    id: "opponent-point",
    title: "Przeciwnik ma punkt",
    description:
      "Kula rywala stoi 40 cm od świnki. Masz dwie kule, rywal jedną. Ustaw układ, porównaj ryzyko i wybierz zagranie.",
    options,
    layout: {
      ownBallsLeft: 2,
      opponentBallsLeft: 1,
      balls: [
        { team: "opponent", distance: "40 cm", x: 112, y: 88 },
        { team: "own", distance: "1,2 m", x: 232, y: 130 },
      ],
    },
  },
  {
    id: "opponent-two",
    title: "Przeciwnik ma dwie kule w punkcie",
    description:
      "Dwie kule rywala są bliżej świnki niż Twoja. Masz dwie próby. Oceń, czy usunięcie jednej kuli wystarczy i gdzie jest wejście.",
    options,
    layout: {
      ownBallsLeft: 2,
      opponentBallsLeft: 0,
      balls: [
        { team: "opponent", distance: "35 cm", x: 125, y: 84 },
        { team: "opponent", distance: "70 cm", x: 190, y: 103 },
        { team: "own", distance: "1,3 m", x: 238, y: 135 },
      ],
    },
  },
  {
    id: "one-left",
    title: "Masz jedną kulę",
    description:
      "Zostaje Ci jedna kula, rywal ma dwie i trzyma punkt. Ustal wykonalny cel tej próby.",
    options,
    layout: {
      ownBallsLeft: 1,
      opponentBallsLeft: 2,
      balls: [
        { team: "opponent", distance: "45 cm", x: 116, y: 92 },
        { team: "own", distance: "95 cm", x: 218, y: 124 },
      ],
    },
  },
  {
    id: "opponent-empty",
    title: "Przeciwnik nie ma kul",
    description:
      "Rywal nie ma odpowiedzi, a Ty masz dwie kule i punkt. Wybierz zagranie zwiększające wynik lub zabezpieczające układ.",
    options,
    layout: {
      ownBallsLeft: 2,
      opponentBallsLeft: 0,
      balls: [
        { team: "own", distance: "30 cm", x: 128, y: 88 },
        { team: "opponent", distance: "1,1 m", x: 236, y: 126 },
      ],
    },
  },
  {
    id: "leading",
    title: "Prowadzisz 12:10",
    description:
      "Rywal ma punkt, obie strony mają po jednej kuli. Oceń możliwość zakończenia meczu i ryzyko oddania kolejnego punktu.",
    options,
    layout: {
      ownBallsLeft: 1,
      opponentBallsLeft: 1,
      balls: [
        { team: "opponent", distance: "50 cm", x: 118, y: 94 },
        { team: "own", distance: "80 cm", x: 198, y: 114 },
      ],
    },
  },
  {
    id: "trailing",
    title: "Przegrywasz 4:11",
    description:
      "Rywal ma punkt. Masz dwie kule, rywal jedną. Porównaj kontrolowaną puentę z usunięciem celu, utrzymując zwykłą rutynę.",
    options,
    layout: {
      ownBallsLeft: 2,
      opponentBallsLeft: 1,
      balls: [
        { team: "opponent", distance: "55 cm", x: 117, y: 98 },
        { team: "own", distance: "1,4 m", x: 244, y: 135 },
      ],
    },
  },
  {
    id: "last-ball",
    title: "Ostatnia kula w menie",
    description:
      "Rywal nie ma kul i trzyma punkt. Masz ostatnią kulę. Wybierz jedno zagranie i wykonaj je bez poprawki.",
    options,
    layout: {
      ownBallsLeft: 1,
      opponentBallsLeft: 0,
      balls: [{ team: "opponent", distance: "40 cm", x: 112, y: 88 }],
    },
  },
];
export function scenarioForThrow(session: Session, index: number) {
  const item = session.plan[index];
  if (session.drillId !== "situation" && item?.phase !== "Gra sytuacyjna")
    return undefined;
  return (
    throwScenarios.find((c) => c.id === item?.situationId) ??
    throwScenarios[index % throwScenarios.length]
  );
}
export function reviewDecision(
  session: Session,
  index: number,
  review?: DecisionReview,
): Session {
  if (
    !session.results[index]?.decision ||
    (review !== undefined && !decisionReviews.includes(review))
  )
    throw new Error("Najpierw zapisz rzut z decyzją.");
  return {
    ...session,
    results: session.results.map((a, i) =>
      i === index ? { ...a, decisionReview: review } : a,
    ),
  };
}
