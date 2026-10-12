import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import {
  choices,
  emptyState,
  makePlan,
  stats,
  type Session,
  type Mode,
} from "../../src/domain";
import { drills } from "../../src/data";
import { createRepository } from "../../src/storage";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import {
  changeWeeklyGoal,
  conditionKey,
  generateTraining,
  personalBest,
  previousBenchmark,
  recommendation,
  selfChallenge,
  trends,
  weaknesses,
  weeklyProgress,
  weekStart,
} from "../../src/features/coaching/model";
const now = new Date("2026-10-07T12:00:00");
function session(
  hits = 4,
  mode: Mode = "shoot",
  distance = 8,
  count = 10,
  day = "2026-10-06",
): Session {
  const options = choices[mode];
  const hit = options.find((c) => c.hit)!;
  const miss = options.find((c) => !c.hit)!;
  const results = Array.from({ length: count }, (_, i) => {
    const c = i < hits ? hit : miss;
    return {
      id: crypto.randomUUID(),
      mode,
      distance,
      result: c.label,
      points: c.points,
      hit: c.hit,
      carreau: !!c.carreau,
      outside: !!c.outside,
    };
  });
  return {
    id: crypto.randomUUID(),
    drillId: mode === "shoot" ? "shoot-basic" : "point-basic",
    startedAt: `${day}T10:00:00`,
    completedAt: `${day}T11:00:00`,
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    surface: "gravel",
    plan: results.map((a) => ({ mode: a.mode, distance: a.distance })),
    results,
    score: results.reduce((n, a) => n + a.points, 0),
  };
}
function benchmark(hits = 10, day = "2026-10-06"): Session {
  const s = session(hits, "shoot", 6, 20, day);
  const drill = drills.find((d) => d.id === "test-shoot")!;
  const plan = makePlan(drill, 7, 20, false);
  return {
    ...s,
    drillId: drill.id,
    kind: "test",
    benchmarkVersion: 1,
    plan,
    results: s.results.map((a, i) => ({ ...a, ...plan[i] })),
  };
}
describe("recommendations and trends", () => {
  it("requires 20 attempts from at least two sessions and excludes tests", () => {
    expect(
      recommendation(
        { ...emptyState, sessions: [session(0, "shoot", 8, 20)] },
        now,
      ).count,
    ).toBe(0);
    expect(
      recommendation({ ...emptyState, sessions: [session(), session(2)] }, now),
    ).toMatchObject({
      mode: "shoot",
      distance: 8,
      count: 20,
      rate: 30,
      target: 37,
    });
    expect(
      weaknesses({ ...emptyState, sessions: [benchmark(), benchmark()] }, now),
    ).toHaveLength(0);
  });
  it("does not combine targets, terrain, exercise, difficulty or junior long distances", () => {
    const s = session();
    for (const other of [
      { ...session(), targetSize: 100 },
      { ...session(), surface: "rough" as const },
      { ...session(), difficulty: "łatwy" as const },
      { ...session(), drillId: "pressure" },
    ])
      expect(
        weaknesses({ ...emptyState, sessions: [s, other] }, now),
      ).toHaveLength(0);
    expect(
      weaknesses(
        {
          ...emptyState,
          sessions: [session(), session()],
          adventure: { config: { audience: "junior", length: 10 } },
        },
        now,
      ),
    ).toHaveLength(0);
  });
  it("requires ten comparable sessions and reports percentage points using pooled attempts", () => {
    const history = Array.from({ length: 10 }, (_, i) =>
      session(i < 5 ? 3 : 6),
    );
    expect(trends(history.slice(1), "shoot", 8)).toBeNull();
    expect(trends(history, "shoot", 8)).toEqual({
      previous: 30,
      recent: 60,
      delta: 30,
      label: "POPRAWIA SIĘ",
    });
    expect(
      trends(
        history.map((s, i) => (i < 5 ? { ...s, targetSize: 100 } : s)),
        "shoot",
        8,
        conditionKey(history[9], "shoot", 8),
      ),
    ).toBeNull();
  });
  it("does not infer a direction from missing or sparse annotations", () => {
    const a = session(0);
    expect(
      weaknesses({ ...emptyState, sessions: [a, session(0)] }, now)[0]
        .direction,
    ).toBeNull();
    const annotate = (s: Session) => ({
      ...s,
      results: s.results.map((x) => ({
        ...x,
        missDirection: "short" as const,
      })),
    });
    expect(
      weaknesses(
        { ...emptyState, sessions: [annotate(a), annotate(session(0))] },
        now,
      )[0].direction,
    ).toMatchObject({ id: "short", rate: 100, count: 20 });
  });
  it("is deterministic and ignores future sessions", () => {
    const state = {
      ...emptyState,
      sessions: [
        session(),
        session(1),
        session(0, "shoot", 9, 20, "2026-10-09"),
      ],
    };
    expect(recommendation(state, now)).toEqual(recommendation(state, now));
    expect(recommendation(state, now).distance).toBe(8);
  });
});
describe("weekly rhythm", () => {
  it("starts Monday across a year boundary", () => {
    expect(weekStart(new Date("2027-01-01T12:00:00"))).toBe("2026-12-28");
  });
  it("does not break the streak during an unfinished current week", () => {
    const state = {
      ...emptyState,
      sessions: [
        session(3, "shoot", 8, 10, "2026-09-28"),
        session(4, "shoot", 8, 10, "2026-10-02"),
        session(),
      ],
    };
    expect(weeklyProgress(state, now)).toMatchObject({
      count: 1,
      target: 2,
      perfect: false,
      streak: 1,
    });
    expect(
      weeklyProgress(
        { ...state, sessions: [...state.sessions, session()] },
        now,
      ),
    ).toMatchObject({ perfect: true, streak: 2 });
  });
  it("preserves old week targets when the user changes the current goal", () => {
    const state = {
      ...emptyState,
      sessions: [
        session(3, "shoot", 8, 10, "2026-09-28"),
        session(4, "shoot", 8, 10, "2026-10-02"),
      ],
    };
    const changed = changeWeeklyGoal(state, 3, now);
    expect(weeklyProgress(changed, now)).toMatchObject({
      target: 3,
      streak: 1,
    });
    expect(() => changeWeeklyGoal(state, 0)).toThrow();
  });
  it("ignores drafts, empty sessions and future completions", () => {
    expect(
      weeklyProgress(
        {
          ...emptyState,
          draft: session(),
          sessions: [
            { ...session(), results: [] },
            session(1, "shoot", 8, 10, "2026-10-08"),
          ],
        },
        now,
      ).count,
    ).toBe(0);
  });
});
describe("plans, records and benchmarks", () => {
  it.each([10, 20, 30] as const)(
    "generates exact %i minute block budgets without counting a training block as a test",
    (minutes) => {
      const s = generateTraining(emptyState, minutes, "strzał", now);
      expect(s.trainingPlan!.blocks.reduce((n, b) => n + b.minutes, 0)).toBe(
        minutes,
      );
      expect(s.kind).toBe("training");
      expect(s.trainingPlan!.blocks[0].kind).toBe("warmup");
      expect(s.trainingPlan!.blocks.at(-1)!.kind).toBe("mental");
      expect(s.plan.every((p) => p.mode === "shoot")).toBe(true);
      expect(
        parseBackup(serializeBackup({ ...emptyState, draft: s })).draft,
      ).toEqual(s);
    },
  );
  it("only recognizes a record for a full comparable series, excludes ties and later history", () => {
    const prior = session(3);
    const current = session(5, "shoot", 8, 10, "2026-10-07");
    expect(personalBest(current, [prior])).toMatchObject({
      hits: 5,
      previous: 3,
    });
    expect(
      personalBest({ ...current, results: current.results.slice(1) }, [prior]),
    ).toBeNull();
    expect(personalBest(current, [{ ...prior, surface: "rough" }])).toBeNull();
    expect(personalBest(current, [{ ...current, id: "other" }])).toBeNull();
    expect(personalBest(prior, [current])).toBeNull();
  });
  it("compares only full standardized tests in matching conditions per distance", () => {
    const before = benchmark(5);
    const after = benchmark(10, "2026-10-07");
    expect(
      previousBenchmark(after, [before])?.find((x) => x.distance === 7),
    ).toEqual({ distance: 7, before: 0, after: 100, delta: 100 });
    expect(
      previousBenchmark(after, [{ ...before, kind: "training" }]),
    ).toBeNull();
    expect(
      previousBenchmark(after, [{ ...before, surface: "rough" }]),
    ).toBeNull();
    expect(
      previousBenchmark({ ...after, results: after.results.slice(1) }, [
        before,
      ]),
    ).toBeNull();
  });
  it("keeps test results separate in training statistics", () => {
    expect(
      stats({ ...emptyState, sessions: [session(0), benchmark(20)] }),
    ).toMatchObject({ count: 1, shoot: 0 });
  });
  it("repeats the users own plan without old mission completion or result state", () => {
    const prior = { ...session(), missionId: "old" };
    const s = selfChallenge({ ...emptyState, sessions: [prior] })!;
    expect(s.plan).toEqual(prior.plan);
    expect(s.id).not.toBe(prior.id);
    expect(s.completedAt).toBeUndefined();
    expect(s.results).toEqual([]);
    expect(s.missionId).toBeUndefined();
  });
});
describe("backup compatibility and safety", () => {
  it("round trips version 2 and preserves legacy exports without rewriting data", () => {
    const state = { ...emptyState, sessions: [session()], lessons: ["one"] };
    expect(parseBackup(serializeBackup(state))).toEqual(state);
    expect(parseBackup(JSON.stringify(state))).toEqual(state);
  });
  it("rejects unsupported versions, malformed structures and inconsistent scoring", () => {
    expect(() => parseBackup("{")).toThrow();
    expect(() =>
      parseBackup(
        JSON.stringify({ format: "jedna-kula", version: 99, data: emptyState }),
      ),
    ).toThrow(/wersja/);
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...emptyState,
          sessions: [{ ...session(), results: "wrong" }],
        }),
      ),
    ).toThrow();
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...emptyState,
          sessions: [{ ...session(), score: 999 }],
        }),
      ),
    ).toThrow();
    expect(() =>
      parseBackup(
        JSON.stringify({ ...emptyState, adventure: { duelDraft: {} } }),
      ),
    ).toThrow();
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...emptyState,
          sessions: [{ ...benchmark(), difficulty: "łatwy" }],
        }),
      ),
    ).toThrow();
  });
  it("rejects out of bounds block cursors and duplicate session ids", () => {
    const s = generateTraining(emptyState, 10, "puenta");
    s.trainingPlan!.index = 9;
    expect(() =>
      parseBackup(JSON.stringify({ ...emptyState, draft: s })),
    ).toThrow();
    const a = session();
    expect(() =>
      parseBackup(JSON.stringify({ ...emptyState, sessions: [a, a] })),
    ).toThrow();
  });
  it("atomically restores data and retains the prior complete state", async () => {
    const name = crypto.randomUUID();
    const repo = createRepository(name);
    const before = {
      ...emptyState,
      sessions: [session()],
      draft: generateTraining(emptyState, 10, "puenta"),
    };
    await repo.save(before);
    await repo.restore({ ...emptyState, lessons: ["one"] });
    const reopened = createRepository(name);
    expect(await reopened.load()).toEqual({ ...emptyState, lessons: ["one"] });
    expect(await reopened.loadRecovery()).toEqual(before);
  });
});

it("compares imported plans by values rather than JSON property order", () => {
  const before = benchmark(5);
  before.plan = before.plan.map((p) => ({
    distance: p.distance,
    mode: p.mode,
  }));
  expect(
    previousBenchmark(benchmark(10, "2026-10-07"), [before])?.find(
      (b) => b.distance === 7,
    )?.delta,
  ).toBe(100);
});
it("detects carreau records even when hit counts tie", () => {
  const prior = session(10);
  prior.results = prior.results.map((a) => ({
    ...a,
    points: 3,
    result: "Czyste trafienie",
    carreau: false,
  }));
  prior.score = 30;
  const after = session(10, "shoot", 8, 10, "2026-10-07");
  expect(
    personalBest(after, [prior])?.records.some((r) => r.label === "Carreaux"),
  ).toBe(true);
});
it("rejects imported test throws that do not follow standardized distances", () => {
  const s = benchmark();
  s.results[0].distance = 10;
  expect(() =>
    parseBackup(serializeBackup({ ...emptyState, sessions: [s] })),
  ).toThrow(/rzuty testu/);
});
it("rolls back both state and recovery when the final import write fails", async () => {
  const repo = createRepository(crypto.randomUUID());
  const before = { ...emptyState, lessons: ["one"] };
  await repo.save(before);
  const original = IDBObjectStore.prototype.put;
  let writes = 0;
  IDBObjectStore.prototype.put = function (
    ...args: Parameters<IDBObjectStore["put"]>
  ) {
    if (++writes === 2) throw new DOMException("Full", "QuotaExceededError");
    return original.apply(this, args);
  };
  try {
    await expect(
      repo.restore({ ...emptyState, lessons: ["routine"] }),
    ).rejects.toThrow();
  } finally {
    IDBObjectStore.prototype.put = original;
  }
  expect(await repo.load()).toEqual(before);
  expect(await repo.loadRecovery()).toBeUndefined();
});
it("keeps first landing error separate from the final boule position", () => {
  const mark = (s: Session) => ({
    ...s,
    drillId: "lob",
    results: s.results.map((a) => ({
      ...a,
      mode: "lob" as const,
      landingHit: false,
      landingDirection: "long" as const,
      missDirection: "short" as const,
    })),
  });
  const r = weaknesses(
    { ...emptyState, sessions: [mark(session(0)), mark(session(0))] },
    now,
  )[0];
  expect(r.direction?.id).toBe("short");
  expect(r.landingDirection?.id).toBe("long");
});
