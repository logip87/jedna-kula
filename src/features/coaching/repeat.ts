import { drills } from "../../data";
import type { Session, State } from "../../domain";

export function lastRepeatableTraining(state: State, now = new Date()) {
  return state.sessions
    .filter((s) => {
      const drill = drills.find((d) => d.id === s.drillId);
      return (
        s.completedAt &&
        Date.parse(s.completedAt) <= now.getTime() &&
        drill &&
        !drill.test &&
        s.kind !== "test" &&
        !s.mastery &&
        !s.challenge &&
        s.plan.length > 0 &&
        s.results.length > 0 &&
        (drill.timed || s.results.length === s.plan.length)
      );
    })
    .sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!))[0];
}

export function repeatLastTraining(
  state: State,
  now = new Date(),
): Session | null {
  if (state.draft) return state.draft;
  const previous = lastRepeatableTraining(state, now);
  if (!previous) return null;
  const drill = drills.find((d) => d.id === previous.drillId)!;
  return {
    id: crypto.randomUUID(),
    drillId: previous.drillId,
    kind: "training",
    coach: { source: "manual", oneChance: previous.coach?.oneChance },
    startedAt: now.toISOString(),
    difficulty: previous.difficulty,
    targetSize: previous.targetSize,
    boundary: previous.boundary,
    surface: previous.surface,
    trackDirections: previous.trackDirections,
    plan: structuredClone(previous.plan),
    results: [],
    score: 0,
    ...(previous.trainingPlan
      ? {
          trainingPlan: { ...structuredClone(previous.trainingPlan), index: 0 },
        }
      : {}),
    ...(drill.timed
      ? { timedPhase: 0, phaseStartedAt: now.toISOString() }
      : {}),
  };
}
