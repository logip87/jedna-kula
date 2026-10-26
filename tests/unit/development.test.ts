import { describe, it, expect, vi, afterEach } from "vitest";
import {
  choices,
  emptyState,
  makePlan,
  type State,
  type Session,
  type Mode,
} from "../../src/domain";
import { drills } from "../../src/data";
import {
  awardDevelopment,
  audience,
  chooseChallenge,
  competitionTraining,
  createGoalSession,
  createMastery,
  createMicroGoal,
  createRoutineGoal,
  daysUntilCompetition,
  exerciseProgress,
  goalProgress,
  masteryHits,
  skillScores,
  weeklyChallenge,
  xpLevel,
} from "../../src/features/development/model";
import {
  advancePractice,
  practiceModules,
  practiceSteps,
  startPractice,
} from "../../src/features/development/practices";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import {
  changeWeeklyGoal,
  weeklyProgress,
} from "../../src/features/coaching/model";
const now = new Date("2026-10-07T12:00:00");
function session(
  hits = 6,
  count = 10,
  mode: Mode = "shoot",
  date = "2026-10-06T10:00:00",
): Session {
  const plan = Array.from({ length: count }, () => ({ mode, distance: 7 }));
  const results = plan.map((p, i) => {
    const c = choices[mode].find((c) => c.hit === i < hits)!;
    return {
      ...p,
      id: crypto.randomUUID(),
      result: c.label,
      points: c.points,
      hit: c.hit,
      carreau: !!c.carreau,
      outside: !!c.outside,
    };
  });
  return {
    id: crypto.randomUUID(),
    drillId:
      mode === "shoot" ? "shoot-basic" : mode === "lob" ? "lob" : "point-basic",
    startedAt: date,
    completedAt: date,
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    surface: "gravel",
    plan,
    results,
    score: results.reduce((n, a) => n + a.points, 0),
  };
}
function benchmark(
  hits = 12,
  mode: Mode = "shoot",
  date = "2026-10-06T10:00:00",
): Session {
  const s = session(hits, 20, mode, date);
  const drill = drills.find((d) => d.id === `test-${mode}`)!;
  const plan = makePlan(drill, 7, 20, false);
  return {
    ...s,
    drillId: drill.id,
    kind: "test",
    benchmarkVersion: 1,
    targetSize: mode === "target" ? 100 : 50,
    plan,
    results: s.results.map((a, i) => ({
      ...a,
      ...plan[i],
      ...(mode === "lob" ? { landingHit: i < hits } : {}),
    })),
  };
}
afterEach(() => vi.useRealTimers());
describe("skills and motivation", () => {
  it("requires two full comparable benchmarks for technical levels and never uses XP", () => {
    const a = benchmark();
    expect(
      skillScores({ ...emptyState, sessions: [a] }, now).find(
        (s) => s.id === "shoot",
      )?.level,
    ).toBeNull();
    const state = { ...emptyState, sessions: [a, benchmark()] };
    expect(skillScores(state, now).find((s) => s.id === "shoot")).toMatchObject(
      { rate: 60, level: 7, samples: 40 },
    );
    const withXP = {
      ...state,
      coaching: {
        weeklyGoals: [],
        xpEvents: [
          {
            id: "x",
            kind: "week" as const,
            points: 10000,
            earnedAt: now.toISOString(),
          },
        ],
      },
    };
    expect(skillScores(withXP, now)).toEqual(skillScores(state, now));
  });
  it("does not merge different targets or incomplete tests", () => {
    const s = benchmark();
    for (const other of [
      { ...benchmark(), targetSize: 100 },
      { ...benchmark(), results: s.results.slice(0, 19) },
    ])
      expect(
        skillScores({ ...emptyState, sessions: [s, other] }, now).find(
          (s) => s.id === "shoot",
        )?.level,
      ).toBeNull();
  });
  it("uses first landing for lob and ignores missing routine checkins", () => {
    const state = {
      ...emptyState,
      sessions: [
        benchmark(16, "lob"),
        benchmark(16, "lob"),
        ...Array.from({ length: 5 }, () => session()),
      ],
    };
    expect(skillScores(state, now).find((s) => s.id === "lob")).toMatchObject({
      rate: 80,
      level: 9,
    });
    expect(
      skillScores(state, now).find((s) => s.id === "mental")?.level,
    ).toBeNull();
  });
  it("awards new full sessions once, caps rewards at two per day and excludes one-ball or partial attempts", () => {
    let state: State = emptyState;
    for (let i = 0; i < 3; i++) {
      const next = { ...state, sessions: [...state.sessions, session(3)] };
      state = awardDevelopment(state, next, now);
    }
    const events = state.coaching!.xpEvents!.filter(
      (e) => e.kind === "session",
    );
    expect(events).toHaveLength(2);
    const xp = xpLevel(state.coaching?.xpEvents).xp;
    expect(
      xpLevel(awardDevelopment(state, state, now).coaching?.xpEvents).xp,
    ).toBe(xp);
    for (const s of [
      session(1, 1),
      { ...session(), results: session().results.slice(0, 4) },
    ])
      expect(
        awardDevelopment(
          emptyState,
          { ...emptyState, sessions: [s] },
          now,
        ).coaching?.xpEvents?.filter((e) => e.kind === "session"),
      ).toHaveLength(0);
  });
  it("uses increasing XP thresholds without changing skill scores", () => {
    expect(xpLevel()).toMatchObject({ level: 1, progress: 0, needed: 100 });
    expect(
      xpLevel([
        { id: "a", kind: "session", earnedAt: now.toISOString(), points: 100 },
      ]),
    ).toMatchObject({ level: 2, progress: 0, needed: 200 });
  });
});
describe("week and goals", () => {
  it("tracks challenge from real current-week attempts and rewards only once even after changing the challenge", () => {
    const s = session(10, 10, "point");
    s.results = s.results.map((a, i) => ({ ...a, distance: 6 + (i % 3) }));
    let state = awardDevelopment(
      emptyState,
      { ...emptyState, sessions: [s] },
      now,
    );
    expect(weeklyChallenge(state, now)).toMatchObject({
      complete: true,
      count: 3,
    });
    expect(
      state.coaching!.xpEvents!.filter((e) => e.kind === "challenge"),
    ).toHaveLength(1);
    state = awardDevelopment(
      state,
      chooseChallenge(state, "routine", now),
      now,
    );
    state = awardDevelopment(
      state,
      chooseChallenge(state, "distances", now),
      now,
    );
    expect(
      state.coaching!.xpEvents!.filter((e) => e.kind === "challenge"),
    ).toHaveLength(1);
  });
  it("keeps the distance chosen for a junior challenge stable", () => {
    const junior: State = {
      ...emptyState,
      player: {
        id: "p",
        name: "Ola",
        age: 12,
        audience: "junior",
        preferredRole: "strzelec",
        preferredHand: "prawa",
        createdAt: now.toISOString(),
      },
    };
    const state = chooseChallenge(junior, "shoot-attempts", now);
    expect(weeklyChallenge(state, now).distance).toBe(7);
    expect(audience(junior)).toBe("junior");
    for (const level of [
      "beginner",
      "intermediate",
      "advanced",
      "tournament",
    ] as const) {
      const withLevel = { ...junior, player: { ...junior.player!, level } };
      expect(audience(withLevel)).toBe("junior");
      expect(parseBackup(serializeBackup(withLevel)).player).toMatchObject({
        audience: "junior",
        level,
      });
    }
  });
  it("does not count one-ball challenges or partial series toward Perfect Week", () => {
    const partial = { ...session(), results: session().results.slice(0, 4) };
    expect(
      weeklyProgress({ ...emptyState, sessions: [partial, session(1, 1)] }, now)
        .count,
    ).toBe(0);
  });
  it("keeps weekly milestones after a break and awards the week once", () => {
    let state: State = {
      ...emptyState,
      sessions: [
        session(6, 10, "shoot", "2026-09-28T10:00:00"),
        session(6, 10, "shoot", "2026-09-29T10:00:00"),
        session(),
        session(),
      ],
    };
    state = awardDevelopment(emptyState, state, now);
    expect(state.awards?.some((a) => a.id === "perfect:2")).toBe(true);
    const later = awardDevelopment(
      state,
      state,
      new Date("2026-11-07T12:00:00"),
    );
    expect(later.awards?.some((a) => a.id === "perfect:2")).toBe(true);
    expect(
      state.coaching!.xpEvents!.filter((e) => e.kind === "week"),
    ).toHaveLength(1);
  });
  it("creates one active accuracy goal and measures only later matching sessions", () => {
    const old = { ...emptyState, sessions: [session(3), session(3)] };
    const state = createMicroGoal(old, now);
    const goal = state.coaching!.goals![0];
    expect(goal).toMatchObject({ baseline: 30, target: 37, distance: 7 });
    expect(createMicroGoal(state, now)).toBe(state);
    expect(goalProgress(state, goal, now).ready).toBe(false);
    const newer = {
      ...state,
      sessions: [
        ...state.sessions,
        session(5, 10, "shoot", "2026-10-07T12:30:00"),
        session(5, 10, "shoot", "2026-10-07T13:00:00"),
      ],
    };
    expect(
      goalProgress(newer, goal, new Date("2026-10-07T14:00:00")),
    ).toMatchObject({ complete: true, value: 50, samples: 20 });
    const draft = createGoalSession(state, goal)!;
    expect(draft.plan).toEqual(old.sessions[1].plan);
    expect(draft.results).toEqual([]);
    expect(draft.completedAt).toBeUndefined();
  });
  it("does not count an old routine or partial session for a new routine goal", () => {
    const base = createRoutineGoal(emptyState, now);
    const goal = base.coaching!.goals![0];
    expect(
      goalProgress(
        { ...base, sessions: [{ ...session(), routineUsed: true }] },
        goal,
        now,
      ).value,
    ).toBe(0);
  });
  it("does not rewrite past weekly targets", () => {
    const s = {
      ...emptyState,
      sessions: [
        session(6, 10, "shoot", "2026-09-28T10:00:00"),
        session(6, 10, "shoot", "2026-09-29T10:00:00"),
      ],
    };
    expect(weeklyProgress(changeWeeklyGoal(s, 4, now), now).streak).toBe(1);
  });
});
describe("mastery progression", () => {
  it("requires two good comparable full sessions", () => {
    expect(
      exerciseProgress({ ...emptyState, sessions: [session()] }, "shoot-basic")
        .unlocked,
    ).toBe(false);
    expect(
      exerciseProgress(
        {
          ...emptyState,
          sessions: [session(), { ...session(), targetSize: 100 }],
        },
        "shoot-basic",
      ).unlocked,
    ).toBe(false);
    expect(
      exerciseProgress(
        { ...emptyState, sessions: [session(), session(5)] },
        "shoot-basic",
      ).unlocked,
    ).toBe(false);
    expect(
      exerciseProgress(
        { ...emptyState, sessions: [session(), session()] },
        "shoot-basic",
      ).unlocked,
    ).toBe(true);
  });
  it("never unlocks Legendary before Mastery and stores a fixed random plan", () => {
    const state = { ...emptyState, sessions: [session(), session()] };
    expect(() => createMastery(state, "shoot-basic", "legendary")).toThrow();
    const draft = createMastery(state, "shoot-basic", "mastery");
    expect(draft.plan).toHaveLength(10);
    expect(draft.plan.every((a) => a.distance === 7)).toBe(true);
    const pass = {
      ...draft,
      ...session(8),
      id: draft.id,
      mastery: draft.mastery,
    };
    const earned = awardDevelopment(
      state,
      { ...state, sessions: [...state.sessions, pass] },
      now,
    );
    expect(earned.awards?.some((a) => a.id === "mastery:shoot-basic")).toBe(
      true,
    );
    const legendary = createMastery(
      earned,
      "shoot-basic",
      "legendary",
      () => 0,
    );
    expect(
      legendary.plan.every(
        (a, i) => i === 0 || a.distance !== legendary.plan[i - 1].distance,
      ),
    ).toBe(true);
    expect(
      parseBackup(serializeBackup({ ...earned, draft: legendary })).draft?.plan,
    ).toEqual(legendary.plan);
  });
  it("does not award failed or incomplete mastery and preserves earned markings after history deletion", () => {
    const state = { ...emptyState, sessions: [session(), session()] };
    const draft = createMastery(state, "shoot-basic", "mastery");
    const failed = { ...session(7), mastery: draft.mastery };
    expect(
      awardDevelopment(
        state,
        { ...state, sessions: [...state.sessions, failed] },
        now,
      ).awards?.some((a) => a.id === "mastery:shoot-basic"),
    ).toBe(false);
    const pass = { ...session(8), mastery: draft.mastery };
    const earned = awardDevelopment(
      state,
      { ...state, sessions: [...state.sessions, pass] },
      now,
    );
    expect(
      exerciseProgress({ ...earned, sessions: [] }, "shoot-basic").mastery,
    ).toBe(true);
  });
});
describe("practice and competition", () => {
  it("saves every mental step and a before/after checkin once", () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    let state = startPractice(emptyState, "mental-routine", 2, "adult", 4);
    const steps = practiceSteps(state.coaching!.practiceDraft!);
    for (let i = 0; i < steps.length; i++)
      state = advancePractice(state, i === steps.length - 1 ? 2 : undefined);
    expect(state.coaching!.practiceDraft).toBeUndefined();
    expect(state.coaching!.practiceHistory![0].checkin).toEqual({
      before: 4,
      after: 2,
    });
    expect(advancePractice(state)).toBe(state);
    expect(parseBackup(serializeBackup(state))).toEqual(state);
  });
  it("offers junior/adult 5/10 minute physical variants for all five modules", () => {
    for (const m of practiceModules.filter((m) => m.kind === "physical"))
      for (const variant of ["junior", "adult"] as const)
        for (const minutes of [5, 10] as const) {
          const state = startPractice(emptyState, m.id, minutes, variant);
          const draft = state.coaching!.practiceDraft!;
          expect(practiceSteps(draft).length).toBe(
            minutes === 5 ? m.steps.length : m.steps.length * 2 + 1,
          );
          expect(parseBackup(serializeBackup(state))).toEqual(state);
        }
  });
  it("caps repeated modules separately for mental and physical XP", () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    let state: State = emptyState;
    for (const id of [
      "mental-routine",
      "mental-reset",
      "physical-mobility",
      "physical-legs",
    ]) {
      let next = startPractice(
        state,
        id,
        id.startsWith("mental") ? 2 : 5,
        "adult",
      );
      while (next.coaching?.practiceDraft)
        next = advancePractice(
          next,
          next.coaching.practiceDraft.kind === "mental" ? 3 : undefined,
        );
      state = awardDevelopment(state, next, now);
    }
    expect(
      state.coaching!.xpEvents!.filter((e) => e.kind === "mental"),
    ).toHaveLength(1);
    expect(
      state.coaching!.xpEvents!.filter((e) => e.kind === "physical"),
    ).toHaveLength(1);
  });
  it("tapers volume toward competition and ignores old or distant dates", () => {
    const plan = (date: string) =>
      competitionTraining(
        { ...emptyState, coaching: { weeklyGoals: [], competition: { date } } },
        now,
      );
    expect(plan("2026-10-21")!.plan.length).toBe(30);
    expect(plan("2026-10-14")!.plan.length).toBe(20);
    expect(plan("2026-10-10")!.plan.length).toBe(12);
    expect(plan("2026-10-08")!.plan.length).toBe(6);
    expect(plan("2026-10-07")!.plan.length).toBe(6);
    expect(plan("2026-10-06")).toBeNull();
    expect(plan("2026-11-01")).toBeNull();
    expect(
      parseBackup(serializeBackup({ ...emptyState, draft: plan("2026-10-08") }))
        .draft?.trainingPlan?.focus,
    ).toBe("zawody");
  });
  it("uses calendar days across a DST boundary", () => {
    expect(
      daysUntilCompetition(
        {
          ...emptyState,
          coaching: { weeklyGoals: [], competition: { date: "2026-10-26" } },
        },
        new Date("2026-10-24T12:00:00"),
      ),
    ).toBe(2);
  });
  it("retains version 2 copies and rejects malformed progression or practice data", () => {
    expect(
      parseBackup(
        JSON.stringify({ format: "jedna-kula", version: 2, data: emptyState }),
      ),
    ).toEqual(emptyState);
    expect(() =>
      parseBackup(
        serializeBackup({
          ...emptyState,
          coaching: {
            weeklyGoals: [],
            xpEvents: [
              {
                id: "x",
                kind: "session",
                points: -5,
                earnedAt: now.toISOString(),
              },
            ],
          },
        }),
      ),
    ).toThrow();
    const state = startPractice(emptyState, "mental-routine", 2, "adult");
    state.coaching!.practiceDraft!.step = 99;
    expect(() => parseBackup(serializeBackup(state))).toThrow();
  });
});

describe("lob mastery evidence", () => {
  it("uses first landing rather than the final position for mastery and eligibility", () => {
    const a = session(10, 10, "lob"),
      b = session(10, 10, "lob");
    a.results.forEach((r) => {
      r.landingHit = false;
    });
    b.results.forEach((r) => {
      r.landingHit = false;
    });
    expect(masteryHits(a)).toBe(0);
    expect(
      exerciseProgress({ ...emptyState, sessions: [a, b] }, "lob").unlocked,
    ).toBe(false);
    a.results.forEach((r, i) => {
      r.landingHit = i < 8;
    });
    b.results.forEach((r, i) => {
      r.landingHit = i < 8;
    });
    expect(
      exerciseProgress({ ...emptyState, sessions: [a, b] }, "lob").unlocked,
    ).toBe(true);
    const trial = {
      ...a,
      id: "trial",
      mastery: { tier: "mastery" as const, version: 1 as const },
    };
    const earned = awardDevelopment(
      emptyState,
      { ...emptyState, sessions: [trial] },
      now,
    );
    expect(earned.awards?.some((x) => x.id === "mastery:lob")).toBe(true);
  });
});
