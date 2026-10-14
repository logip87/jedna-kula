import { choices, type Mode, type Session } from "../../src/domain";

export function nextStepSeries(
  mode: Mode,
  distance: number,
  hits = 4,
  day = 13,
): Session {
  const id = crypto.randomUUID();
  const plan = Array.from({ length: 20 }, () => ({ mode, distance }));
  const results = plan.map((p, i) => {
    const choice = choices[mode].find((c) => c.hit === i < hits)!;
    return {
      ...p,
      id: `${id}-${i}`,
      result: choice.label,
      points: choice.points,
      hit: choice.hit,
      carreau: !!choice.carreau,
      outside: !!choice.outside,
      ...(mode === "lob" ? { landingHit: i < hits } : {}),
    };
  });
  return {
    id,
    drillId:
      mode === "shoot" ? "shoot-basic" : mode === "lob" ? "lob" : "point-basic",
    kind: "training",
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    surface: "gravel",
    startedAt: `2026-10-${String(day).padStart(2, "0")}T10:00:00Z`,
    completedAt: `2026-10-${String(day).padStart(2, "0")}T10:30:00Z`,
    plan,
    results,
    score: results.reduce((sum, a) => sum + a.points, 0),
  };
}

export const difficultDistances = () =>
  [7, 8].flatMap((distance) =>
    [11, 12, 13].map((day) => nextStepSeries("shoot", distance, 4, day)),
  );
