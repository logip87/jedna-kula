import { describe, expect, it } from "vitest";
import { emptyState, type Session } from "../../src/domain";
import {
  createSelectedTraining,
  trainingChoices,
  trainingSelection,
} from "../../src/features/coaching/selection";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";

function completed(
  drillId: "point-basic" | "shoot-basic",
  distance: number,
  attempts: 6 | 10 | 20,
  day: number,
): Session {
  const session = createSelectedTraining(
    { ...trainingSelection(emptyState, drillId), distance, attempts },
    new Date(`2026-10-${day}T10:00:00Z`),
  );
  return {
    ...session,
    completedAt: session.startedAt,
    results: session.plan.map((a, i) => ({
      ...a,
      id: `${i}`,
      result: "Pudło",
      points: 0,
      hit: false,
      carreau: false,
      outside: false,
    })),
  };
}

describe("player-selected training", () => {
  it("starts freely at every offered distance and series length without history", () => {
    for (const choice of trainingChoices)
      for (const attempts of [6, 10, 20] as const) {
        const session = createSelectedTraining({
          ...trainingSelection(emptyState, choice.id),
          distance: 8,
          attempts,
        });
        expect(session.plan).toHaveLength(attempts);
        expect(session.plan.every((a) => a.distance === 8)).toBe(true);
        expect(session.coach?.source).toBe("manual");
        expect(session.results).toEqual([]);
        expect(() =>
          parseBackup(serializeBackup({ ...emptyState, draft: session })),
        ).not.toThrow();
      }
  });
  it("remembers each skill's latest saved setup chronologically, even after poor results", () => {
    const point = completed("point-basic", 8, 10, 11);
    const shoot = completed("shoot-basic", 9, 20, 12);
    const state = { ...emptyState, sessions: [shoot, point] };
    expect(trainingSelection(state)).toMatchObject({
      drillId: "shoot-basic",
      distance: 9,
      attempts: 20,
    });
    expect(trainingSelection(state, "point-basic")).toMatchObject({
      distance: 8,
      attempts: 10,
    });
    expect(trainingSelection(state, "lob")).toMatchObject({
      distance: 6,
      attempts: 6,
    });
  });
  it("does not take settings from tests, partial series, challenges, future or mixed sessions", () => {
    const valid = completed("point-basic", 8, 10, 11);
    const other = completed("point-basic", 9, 20, 12);
    const state = {
      ...emptyState,
      sessions: [
        valid,
        { ...other, id: "test", kind: "test" as const },
        { ...other, id: "partial", results: other.results.slice(0, 1) },
        {
          ...other,
          id: "mastery",
          mastery: { tier: "mastery" as const, version: 1 as const },
        },
        { ...other, id: "future", completedAt: "2099-01-01T10:00:00Z" },
        {
          ...other,
          id: "mixed",
          plan: other.plan.map((a, i) => ({ ...a, distance: i % 2 ? 6 : 9 })),
        },
      ],
    };
    expect(trainingSelection(state)).toMatchObject({
      distance: 8,
      attempts: 10,
    });
  });
});
