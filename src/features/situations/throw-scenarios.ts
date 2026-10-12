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
  },
  {
    id: "opponent-two",
    title: "Przeciwnik ma dwie kule w punkcie",
    description:
      "Dwie kule rywala są bliżej świnki niż Twoja. Masz dwie próby. Oceń, czy usunięcie jednej kuli wystarczy i gdzie jest wejście.",
    options,
  },
  {
    id: "one-left",
    title: "Masz jedną kulę",
    description:
      "Zostaje Ci jedna kula, rywal ma dwie i trzyma punkt. Ustal wykonalny cel tej próby.",
    options,
  },
  {
    id: "opponent-empty",
    title: "Przeciwnik nie ma kul",
    description:
      "Rywal nie ma odpowiedzi, a Ty masz dwie kule i punkt. Wybierz zagranie zwiększające wynik lub zabezpieczające układ.",
    options,
  },
  {
    id: "leading",
    title: "Prowadzisz 12:10",
    description:
      "Rywal ma punkt, obie strony mają po jednej kuli. Oceń możliwość zakończenia meczu i ryzyko oddania kolejnego punktu.",
    options,
  },
  {
    id: "trailing",
    title: "Przegrywasz 4:11",
    description:
      "Rywal ma punkt. Masz dwie kule, rywal jedną. Porównaj kontrolowaną puentę z usunięciem celu, utrzymując zwykłą rutynę.",
    options,
  },
  {
    id: "last-ball",
    title: "Ostatnia kula w menie",
    description:
      "Rywal nie ma kul i trzyma punkt. Masz ostatnią kulę. Wybierz jedno zagranie i wykonaj je bez poprawki.",
    options,
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
