import { drills } from "../../data";
import type { Session, State } from "../../domain";

export const trainingChoices = [
  {
    id: "point-basic",
    title: "Puenta",
    description: "Kontrola długości i bliskość świnki.",
  },
  {
    id: "shoot-basic",
    title: "Strzał",
    description: "Trafienie, usunięcie kuli i carreau.",
  },
  {
    id: "lob",
    title: "Lob",
    description: "Miejsce lądowania i końcowa pozycja.",
  },
  {
    id: "boundary",
    title: "Przy linii",
    description: "Bezpieczny kierunek i kontrola długości.",
  },
] as const;
export type TrainingChoice = (typeof trainingChoices)[number]["id"];
export const seriesLengths = [6, 10, 20] as const;
export type SeriesLength = (typeof seriesLengths)[number];
export type TrainingSelection = Pick<
  Session,
  "difficulty" | "targetSize" | "boundary" | "surface" | "trackDirections"
> & {
  drillId: TrainingChoice;
  distance: number;
  attempts: SeriesLength;
};

export function lastSelectedTraining(
  state: State,
  drillId?: TrainingChoice,
  now = new Date(),
) {
  return state.sessions
    .filter(
      (s) =>
        trainingChoices.some((choice) => choice.id === s.drillId) &&
        (!drillId || s.drillId === drillId) &&
        s.completedAt &&
        Date.parse(s.completedAt) <= now.getTime() &&
        s.kind !== "test" &&
        !s.mastery &&
        !s.challenge &&
        !s.trainingPlan &&
        s.plan.length > 0 &&
        s.results.length === s.plan.length &&
        s.plan.every(
          (a) => a.mode === s.plan[0].mode && a.distance === s.plan[0].distance,
        ),
    )
    .sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!))[0];
}

export function trainingSelection(
  state: State,
  drillId?: TrainingChoice,
): TrainingSelection {
  const previous = lastSelectedTraining(state, drillId);
  const selected =
    drillId ??
    (previous?.drillId as TrainingChoice | undefined) ??
    "point-basic";
  const drill = drills.find((d) => d.id === selected)!;
  return {
    drillId: selected,
    distance:
      previous && drill.distances.includes(previous.plan[0].distance)
        ? previous.plan[0].distance
        : 6,
    attempts: seriesLengths.includes(previous?.plan.length as SeriesLength)
      ? (previous!.plan.length as SeriesLength)
      : 6,
    difficulty: previous?.difficulty ?? "łatwy",
    targetSize: previous?.targetSize ?? 100,
    boundary: previous?.boundary ?? 60,
    surface: previous ? previous.surface : "gravel",
    trackDirections: previous?.trackDirections ?? false,
  };
}

export function createSelectedTraining(
  selection: TrainingSelection,
  now = new Date(),
): Session {
  const drill = drills.find((d) => d.id === selection.drillId);
  if (
    !drill ||
    !trainingChoices.some((choice) => choice.id === drill.id) ||
    !drill.distances.includes(selection.distance) ||
    !seriesLengths.includes(selection.attempts)
  ) {
    throw new Error("Wybierz rodzaj treningu, dystans i liczbę rzutów.");
  }
  return {
    id: crypto.randomUUID(),
    drillId: drill.id,
    kind: "training",
    coach: { source: "manual" },
    startedAt: now.toISOString(),
    difficulty: selection.difficulty,
    targetSize: selection.targetSize,
    boundary: selection.boundary,
    surface: selection.surface,
    trackDirections: selection.trackDirections,
    plan: Array.from({ length: selection.attempts }, () => ({
      mode: drill.mode,
      distance: selection.distance,
    })),
    results: [],
    score: 0,
  };
}
