import {
  choices,
  emptyState,
  makePlan,
  type Session,
  type State,
} from "../../src/domain";
import { drills } from "../../src/data";
export const fixedTime = "2026-10-12T10:00:00.000Z";
export function completedSession(id = "qa-point"): Session {
  const plan = makePlan(
    drills.find((d) => d.id === "point-basic")!,
    7,
    6,
    false,
  );
  const results = plan.map((p, i) => {
    const c = choices.point[i < 3 ? 0 : 1];
    return {
      ...p,
      id: `${id}-${i}`,
      result: c.label,
      points: c.points,
      hit: c.hit,
      carreau: false,
      outside: false,
    };
  });
  return {
    id,
    drillId: "point-basic",
    startedAt: fixedTime,
    completedAt: fixedTime,
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    plan,
    results,
    score: 15,
    routineUsed: true,
  };
}
export const cleanState = (): State => structuredClone(emptyState);
