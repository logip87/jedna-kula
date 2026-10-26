import { describe, expect, it } from "vitest";
import {
  choices,
  emptyState,
  stats,
  successfulAttempt,
  summarize,
  type Mode,
  type Session,
} from "../../src/domain";
import {
  comparableBaseline,
  dashboardEvidence,
  historySessions,
  progressEvidence,
  progressResults,
  sessionOutcome,
  summaryEvidence,
} from "../../src/features/product/model";
import {
  conditionKey,
  recommendation,
  trends,
  weaknesses,
} from "../../src/features/coaching/model";
import { goalProgress } from "../../src/features/development/model";

const now = new Date("2026-10-14T12:00:00Z");
function series(
  mode: Mode = "point",
  hits = 6,
  count = 6,
  day = 1,
  distance = 8,
): Session {
  const id = crypto.randomUUID();
  const hit =
    mode === "point" ? choices.point[1] : choices[mode].find((c) => c.hit)!;
  const miss = choices[mode].find((c) => !c.hit)!;
  const results = Array.from({ length: count }, (_, i) => {
    const choice = i < hits ? hit : miss;
    return {
      id: `${id}-${i}`,
      mode,
      distance,
      result: choice.label,
      points: choice.points,
      hit: choice.hit,
      carreau: !!choice.carreau,
      outside: !!choice.outside,
      ...(mode === "lob" ? { landingHit: i < hits } : {}),
    };
  });
  const timestamp = `2026-10-${String(day).padStart(2, "0")}T10:00:00Z`;
  return {
    id,
    drillId:
      mode === "shoot" ? "shoot-basic" : mode === "lob" ? "lob" : "point-basic",
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    surface: "gravel",
    startedAt: timestamp,
    completedAt: timestamp,
    plan: results.map((a) => ({ mode: a.mode, distance: a.distance })),
    results,
    score: results.reduce((sum, a) => sum + a.points, 0),
  };
}

describe("consistent result evidence", () => {
  it("keeps six successful 31–60 cm throws at 100% accuracy and 67% points", () => {
    const session = series();
    expect(summarize(session).percentage).toBe(67);
    expect(sessionOutcome(session)).toMatchObject({
      hits: 6,
      rate: 100,
      distances: "8 m",
    });
    expect(summaryEvidence(session, emptyState).rate).toBe(100);
    expect(
      progressResults({ ...emptyState, sessions: [session] }, now).areas[0]
        .rate,
    ).toBe(100);
  });

  it("uses first landing for lob despite opposite final positions", () => {
    const session = series("lob", 6, 10);
    session.results = session.results.map((a) => ({
      ...a,
      hit: !a.landingHit,
    }));
    expect(session.results.filter(successfulAttempt)).toHaveLength(6);
    expect(sessionOutcome(session)).toMatchObject({
      rate: 60,
      metric: "trafień w lądowanie",
    });
    expect(summaryEvidence(session, emptyState).rate).toBe(60);
    expect(
      successfulAttempt({ ...session.results[0], landingHit: undefined }),
    ).toBe(false);
  });

  it("excludes two incomplete 10/20 perfect series from all technical evidence", () => {
    const partial = (day: number) => {
      const full = series("point", 20, 20, day);
      return { ...full, results: full.results.slice(0, 10) };
    };
    const sessions = [partial(1), partial(2)];
    const state = { ...emptyState, sessions };
    expect(recommendation(state, now)).toMatchObject({ count: 0, rate: null });
    expect(weaknesses(state, now)).toEqual([]);
    expect(progressResults(state, now).areas).toEqual([]);
    expect(trends(sessions, "point", 8, undefined, now)).toBeNull();
  });

  it("uses lob first landings for micro-goal progress even when final positions miss", () => {
    const sessions = [series("lob", 8, 10, 1), series("lob", 8, 10, 2)].map(
      (s) => ({ ...s, results: s.results.map((a) => ({ ...a, hit: false })) }),
    );
    const source = sessions[0];
    const goal = {
      id: "lob-goal",
      kind: "accuracy" as const,
      createdAt: "2026-10-01T00:00:00Z",
      baseline: 80,
      target: 80,
      mode: "lob" as const,
      distance: 8,
      conditionKey: conditionKey(source, "lob", 8),
    };
    expect(goalProgress({ ...emptyState, sessions }, goal, now)).toMatchObject({
      value: 80,
      complete: true,
    });
  });

  it("separates pointing, shooting and lob at the same distance", () => {
    const sessions = [
      series("point", 6, 6),
      series("shoot", 3, 6),
      series("lob", 0, 6),
    ];
    const result = progressResults({ ...emptyState, sessions }, now);
    expect(result.areas.map((a) => [a.mode, a.distance, a.rate])).toEqual([
      ["lob", 8, 0],
      ["point", 8, 100],
      ["shoot", 8, 50],
    ]);
    expect(result.areas.some((a) => a.mode === "target")).toBe(false);
    expect(progressResults(emptyState, now).areas).toEqual([]);
  });

  it("keeps technical pointing variants separate in detailed progress", () => {
    const basic = series("point", 6, 6);
    const crouching = {
      ...series("point", 0, 6, 2),
      drillId: "point-crouching",
    };
    const areas = progressResults(
      { ...emptyState, sessions: [basic, crouching] },
      now,
    ).areas;
    expect(areas).toMatchObject([
      { drillId: "point-basic", mode: "point", distance: 8, rate: 100 },
      { drillId: "point-crouching", mode: "point", distance: 8, rate: 0 },
    ]);
  });

  it("orders by completion date without changing stored order and excludes future/test results from progress", () => {
    const older = series("point", 6, 6, 1);
    const newer = series("point", 3, 6, 12);
    const future = series("shoot", 6, 6, 15);
    const test = { ...series("shoot", 6, 6, 10), kind: "test" as const };
    const state = { ...emptyState, sessions: [newer, test, future, older] };
    expect(historySessions(state).map((s) => s.id)).toEqual([
      future.id,
      newer.id,
      test.id,
      older.id,
    ]);
    expect(state.sessions[0].id).toBe(newer.id);
    expect(progressResults(state, now).recent.map((s) => s.id)).toEqual([
      older.id,
      newer.id,
    ]);
    expect(progressResults(state, now).areas).toHaveLength(1);
  });

  it("compares only full earlier sessions with enough attempts in matching conditions", () => {
    const current = series("shoot", 8, 10, 12);
    const first = series("shoot", 4, 10, 1);
    const second = series("shoot", 6, 10, 2);
    expect(comparableBaseline(current, [first])).toBeNull();
    expect(comparableBaseline(current, [first, second])).toBe(50);
    expect(
      comparableBaseline(current, [first, { ...second, surface: "rough" }]),
    ).toBe(50);
    expect(
      comparableBaseline(current, [first, series("shoot", 10, 10, 13)]),
    ).toBeNull();
    expect(
      comparableBaseline(current, [
        first,
        { ...second, results: second.results.slice(0, 9) },
      ]),
    ).toBeNull();
    expect(
      comparableBaseline({ ...current, results: current.results.slice(0, 9) }, [
        first,
        second,
      ]),
    ).toBeNull();
  });

  it("does not describe an equally successful area as weaker", () => {
    const point = series("point", 3, 3);
    const shoot = series("shoot", 3, 3);
    const mixed = {
      ...point,
      plan: [...point.plan, ...shoot.plan],
      results: [...point.results, ...shoot.results],
    };
    expect(summaryEvidence(mixed, emptyState).weakest).toBeNull();
    mixed.results[5] = { ...mixed.results[5], hit: false };
    expect(summaryEvidence(mixed, emptyState).weakest?.label).toBe(
      "Strzał 8 m",
    );
    expect(
      dashboardEvidence(
        {
          ...emptyState,
          sessions: [
            series("point", 10, 10),
            series("point", 10, 10),
            series("shoot", 10, 10),
            series("shoot", 10, 10),
          ],
        },
        now,
      ).weakest,
    ).toBeNull();
  });

  it("shows a baseline before there is enough comparable history for a trend", () => {
    const state = {
      ...emptyState,
      sessions: [series("shoot", 4, 10), series("shoot", 6, 10)],
    };
    expect(progressEvidence(state, now)).toContain("Punkt odniesienia");
    expect(progressEvidence(state, now)).toContain(
      "5 + 5 porównywalnych sesji",
    );
    expect(progressEvidence(emptyState, now)).toContain(
      "Po pierwszych porównywalnych sesjach",
    );
  });
});

describe("routine check-in evidence", () => {
  it("keeps completed mental modules separate from resets in technical sessions", () => {
    const practice = {
      id: "mental-reset",
      moduleId: "mental-reset",
      kind: "mental" as const,
      audience: "adult" as const,
      minutes: 2 as const,
      startedAt: "2026-10-01T10:00:00Z",
      completedAt: "2026-10-01T10:02:00Z",
      step: 4,
    };
    const result = stats({
      ...emptyState,
      sessions: [{ ...series(), mentalExerciseDone: true }],
      coaching: {
        weeklyGoals: [],
        practiceHistory: [
          practice,
          { ...practice, id: "physical", kind: "physical" },
          { ...practice, id: "unfinished", completedAt: undefined },
        ],
        practiceDraft: { ...practice, id: "draft", completedAt: undefined },
      },
    });
    expect(result).toMatchObject({ mentalModules: 1, mental: 1 });
    expect(stats(emptyState).mentalModules).toBe(0);
  });

  it("counts only explicit answers and preserves unknown rather than reporting zero use", () => {
    const state = {
      ...emptyState,
      sessions: [
        { ...series(), routineUsed: true },
        { ...series(), routineUsed: false },
        series(),
      ],
    };
    expect(stats(state)).toMatchObject({
      routine: 50,
      routineUsed: 1,
      routineResponses: 2,
    });
    expect(stats({ ...emptyState, sessions: [series()] })).toMatchObject({
      routine: null,
      routineResponses: 0,
    });
    expect(stats(emptyState).routine).toBeNull();
    expect(
      stats({ ...emptyState, sessions: [{ ...series(), routineUsed: false }] })
        .routine,
    ).toBe(0);
  });
});
