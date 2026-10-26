import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { emptyState, type Session, type Attempt } from "../../src/domain";
import { createRepository } from "../../src/storage";
import {
  missionCompleted,
  missionKey,
  recommendedTraining,
  createPractice,
  errorMap,
  precisionPlan,
  addPrecisionScore,
  precisionTotal,
  precisionTime,
  addDuelScore,
  type PrecisionRound,
  type Duel,
} from "../../src/features/adventure/model";
const attempt = (
  mode: Attempt["mode"],
  distance: number,
  hit: boolean,
): Attempt => ({
  id: crypto.randomUUID(),
  mode,
  distance,
  hit,
  points: hit ? 3 : 0,
  result: hit ? "trafienie" : "pudło",
  carreau: false,
  outside: false,
});
const session = (
  results: Attempt[],
  options: Partial<Session> = {},
): Session => ({
  ...createPractice("point-basic", "point", [6], results.length || 6, {
    surface: "gravel",
  }),
  results,
  completedAt: new Date().toISOString(),
  ...options,
});
describe("adventure progression and personalization", () => {
  it("only a full saved mission unlocks progress and does not count regular or partial sessions", () => {
    const id = missionKey({ audience: "junior", length: 10 }, 0);
    const planned = createPractice("point-basic", "point", [6], 6, {
      surface: "gravel",
      missionId: id,
    });
    expect(
      missionCompleted(
        {
          ...emptyState,
          draft: {
            ...planned,
            results: Array.from({ length: 6 }, () =>
              attempt("point", 6, false),
            ),
          },
        },
        id,
      ),
    ).toBe(false);
    const partial = {
      ...planned,
      completedAt: "2026-10-07",
      results: [attempt("point", 6, true)],
    };
    expect(missionCompleted({ ...emptyState, sessions: [partial] }, id)).toBe(
      false,
    );
    const full = {
      ...planned,
      completedAt: "2026-10-07",
      results: Array.from({ length: 6 }, () => attempt("point", 6, false)),
    };
    expect(missionCompleted({ ...emptyState, sessions: [full] }, id)).toBe(
      true,
    );
    expect(
      missionCompleted(
        { ...emptyState, sessions: [full] },
        missionKey({ audience: "beginner", length: 10 }, 0),
      ),
    ).toBe(false);
    expect(
      missionCompleted(
        { ...emptyState, sessions: [{ ...full, missionId: undefined }] },
        id,
      ),
    ).toBe(false);
    expect(
      missionCompleted(
        {
          ...emptyState,
          adventure: {
            missionCompletions: {
              [id]: { sessionId: full.id, completedAt: "2026-10-07" },
            },
          },
        },
        id,
      ),
    ).toBe(true);
  });
  it("requires twenty samples in two sessions per comparable variant", () => {
    const point = session(
      Array.from({ length: 10 }, () => attempt("point", 6, true)),
    );
    const shoot = session(
      Array.from({ length: 10 }, (_, i) => attempt("shoot", 7, i < 2)),
    );
    const undersampled = session([attempt("point", 9, false)]);
    const r = recommendedTraining({
      ...emptyState,
      sessions: [
        point,
        { ...point, id: "p2" },
        shoot,
        { ...shoot, id: "s2" },
        undersampled,
      ],
    });
    expect(r.mode).toBe("shoot");
    expect(r.distance).toBe(7);
    expect(r.count).toBe(20);
    expect(
      recommendedTraining(
        {
          ...emptyState,
          sessions: [
            session(
              Array.from({ length: 6 }, () => attempt("shoot", 9, false)),
            ),
            point,
          ],
        },
        7,
      ).distance,
    ).toBe(6);
    expect(
      recommendedTraining({ ...emptyState, sessions: [undersampled] }).count,
    ).toBe(0);
    const newer = Array.from({ length: 12 }, () => point);
    expect(
      recommendedTraining({ ...emptyState, sessions: [shoot, ...newer] }).mode,
    ).toBe("point");
  });
  it("keeps landing separate from final position and ignores legacy terrain", () => {
    const a = {
      ...attempt("lob", 7, false),
      missDirection: "left" as const,
      landingDirection: "short" as const,
    };
    const old = attempt("point", 6, false);
    const state = {
      ...emptyState,
      sessions: [
        session([a], { surface: "gravel" }),
        session([old], { surface: "rough" }),
      ],
    };
    expect(errorMap(state, "lob", "7", "gravel").counts.left).toBe(1);
    expect(errorMap(state, "lob", "7", "gravel", true).counts.short).toBe(1);
    expect(errorMap(state, "all", "all", "all").missing).toBe(1);
    expect(errorMap(state, "lob", "7", "rough").total).toBe(1);
  });
  it("persists all new modules without losing existing state", async () => {
    const repo = createRepository(crypto.randomUUID());
    const state = {
      ...emptyState,
      lessons: ["one"],
      adventure: {
        config: { audience: "junior" as const, length: 20 as const },
        tactics: { recover: 1 },
      },
    };
    await repo.save(state);
    expect(await repo.load()).toEqual(state);
  });
});
describe("precision and two-person challenge", () => {
  const base: PrecisionRound = {
    id: "p",
    startedAt: "2026-10-07T10:00:00Z",
    scores: [],
    elapsedMs: 0,
    phase: "score",
    timed: false,
  };
  it("orders twenty shots by figure and distance, scores maximum 100, and rejects 1 point for the jack", () => {
    expect(precisionPlan).toHaveLength(20);
    expect(precisionPlan.slice(0, 5)).toEqual([
      { figure: 1, distance: 6 },
      { figure: 1, distance: 7 },
      { figure: 1, distance: 8 },
      { figure: 1, distance: 9 },
      { figure: 2, distance: 6 },
    ]);
    let round = base;
    for (let i = 0; i < 20; i++)
      round = addPrecisionScore({ ...round, phase: "score" }, 5);
    expect(precisionTotal(round)).toBe(100);
    expect(() => addPrecisionScore({ ...round, phase: "score" }, 5)).toThrow();
    expect(() =>
      addPrecisionScore({ ...base, scores: Array(16).fill(0) }, 1),
    ).toThrow();
    expect(() => addPrecisionScore({ ...base, phase: "aim" }, 3)).toThrow();
  });
  it("resumes preparation time across reload and does not count score entry or waiting; rejects over-time shots", () => {
    const aiming = {
      ...base,
      phase: "aim" as const,
      elapsedMs: 1000,
      shotStartedAt: "2026-10-07T10:00:00Z",
    };
    expect(precisionTime(aiming, Date.parse("2026-10-07T10:00:10Z"))).toBe(
      11000,
    );
    expect(
      precisionTime(
        { ...aiming, phase: "score" },
        Date.parse("2026-10-07T10:10:00Z"),
      ),
    ).toBe(1000);
    expect(() =>
      addPrecisionScore({ ...base, timed: true, elapsedMs: 900001 }, 3),
    ).toThrow();
  });
  it("alternates players, ends after the configured rounds and prevents additional or invalid results", () => {
    let duel: Duel = {
      id: "d",
      startedAt: "2026-10-07",
      names: ["Ola", "Jan"],
      kind: "team",
      mode: "point",
      distance: 6,
      rounds: 3,
      target: 12,
      scores: [],
    };
    expect(() => addDuelScore(duel, 5)).toThrow();
    for (let i = 0; i < 6; i++) duel = addDuelScore(duel, 3);
    expect(duel.scores.map((s) => s.player)).toEqual([0, 1, 0, 1, 0, 1]);
    expect(duel.completedAt).toBeTruthy();
    expect(() => addDuelScore(duel, 3)).toThrow();
  });
});
