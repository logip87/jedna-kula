import {
  createMicroGoal,
  goalProgress,
} from "../../src/features/development/model";
import { describe, expect, it } from "vitest";
import {
  choices,
  boundaryDistance,
  emptyState,
  type Mode,
  type Session,
  type State,
} from "../../src/domain";
import {
  acceptedAdaptation,
  adaptation,
} from "../../src/features/product/model";
import {
  conditionKey,
  normalizeConditionKey,
  createRecommendedSession,
  drillForMode,
  generateTraining,
  recommendation,
  type TrainingFocus,
} from "../../src/features/coaching/model";

const now = new Date("2026-10-23T12:00:00Z");
const modes: Mode[] = ["point", "shoot", "lob", "boundary", "target"];
const focusForMode: Record<Mode, TrainingFocus> = {
  point: "puenta",
  shoot: "strzał",
  lob: "lob",
  boundary: "słabości",
  target: "słabości",
};
function finish(state: State, session: Session): Session {
  const timestamp = new Date(
    now.getTime() - 3600_000 + state.sessions.length * 60_000,
  ).toISOString();
  const choice = choices[session.plan[0].mode].find((c) => c.hit)!;
  const saved: Session = {
    ...session,
    startedAt: timestamp,
    completedAt: timestamp,
    results: session.plan.map((a, i) => ({
      ...a,
      id: `${session.id}-${i}`,
      result: choice.label,
      points: choice.points,
      hit: true,
      carreau: !!choice.carreau,
      outside: false,
      ...(a.mode === "lob" ? { landingHit: true } : {}),
    })),
    score: choice.points * session.plan.length,
  };
  state.sessions.push(saved);
  return saved;
}
function regular(mode: Mode, distance: number): Session {
  return {
    ...createRecommendedSession(emptyState, now, mode),
    drillId: drillForMode[mode],
    difficulty: "średni",
    surface: "gravel",
    targetSize: 50,
    boundary: mode === "boundary" ? boundaryDistance : 40,
    plan: Array.from({ length: 20 }, () => ({ mode, distance })),
  };
}
function seed(mode: Mode): State {
  const state: State = { ...emptyState, sessions: [] };
  for (let i = 0; i < 3; i++) finish(state, regular(mode, 6));
  return state;
}

describe("progression across training entry points", () => {
  it.each(
    modes.flatMap((mode) =>
      ([20, 30, 45, 60] as const).map((minutes) => ({ mode, minutes })),
    ),
  )(
    "advances $mode through successive supported distances using $minutes-minute plans",
    ({ mode, minutes }) => {
      const state = seed(mode);
      const maximum = mode === "lob" ? 9 : 10;
      for (const distance of [7, 8, 9, 10].filter((d) => d <= maximum)) {
        expect(adaptation(state, now)).toMatchObject({
          mode,
          distance,
          kind: "harder",
        });
        finish(state, acceptedAdaptation(state, now));
        for (let i = 0; i < 2; i++) {
          const next = generateTraining(
            state,
            minutes,
            focusForMode[mode],
            now,
          );
          const priority = next.trainingPlan!.blocks[2];
          expect(next.plan[priority.start]).toMatchObject({ mode, distance });
          finish(state, next);
        }
        expect(recommendation(state, now)).toMatchObject({ mode, distance });
      }
      expect(adaptation(state, now)).toMatchObject({
        distance: maximum,
        pressure: true,
      });
    },
  );

  it.each(modes)(
    "combines regular and 10-minute $mode sessions without crediting too few throws on a new distance",
    (mode) => {
      const state: State = { ...emptyState, sessions: [] };
      for (let i = 0; i < 2; i++) finish(state, regular(mode, 6));
      finish(state, generateTraining(state, 10, focusForMode[mode], now));
      expect(adaptation(state, now)).toMatchObject({ mode, distance: 7 });
      finish(state, acceptedAdaptation(state, now));
      for (let i = 0; i < 3; i++)
        finish(state, generateTraining(state, 10, focusForMode[mode], now));
      // Each 10-minute plan contains only eight throws at 7 m. It must not
      // silently lower the documented minimum of ten per comparable session.
      expect(adaptation(state, now)).toBeNull();
      for (let i = 0; i < 3; i++) finish(state, regular(mode, 7));
      expect(adaptation(state, now)).toMatchObject({ mode, distance: 8 });
    },
  );

  it.each(["wszystko", "puenta", "słabości", "lekko"] as const)(
    "uses the actual pointing conditions rather than the %s focus label",
    (focus) => {
      const state = seed("point");
      const generated = generateTraining(state, 60, focus, now);
      expect(conditionKey(generated, "point", 6)).toBe(
        conditionKey(state.sessions[0], "point", 6),
      );
    },
  );

  it("keeps accepted distances for multiple skills and uses the selected skill's own conditions", () => {
    const point = seed("point");
    finish(point, acceptedAdaptation(point, now));
    const shoot = seed("shoot");
    shoot.sessions = shoot.sessions.map((s) => ({
      ...s,
      surface: "rough",
      targetSize: 30,
    }));
    const state: State = {
      ...emptyState,
      sessions: [...point.sessions, ...shoot.sessions],
    };
    // Construct a second accepted progression independently, then return to
    // both skills in the same history. The later choice must not erase either.
    finish(state, acceptedAdaptation(shoot, now));
    const pointing = generateTraining(state, 60, "puenta", now);
    const shooting = generateTraining(state, 60, "strzał", now);
    expect(pointing.plan[12]).toMatchObject({ mode: "point", distance: 7 });
    expect(shooting.plan[12]).toMatchObject({ mode: "shoot", distance: 7 });
    expect(pointing).toMatchObject({ surface: "gravel", targetSize: 50 });
    expect(shooting).toMatchObject({ surface: "rough", targetSize: 30 });
  });

  it("does not merge tests, targets, terrain, difficulty or drill families", () => {
    const base = regular("point", 7);
    const key = conditionKey(base, "point", 7);
    for (const altered of [
      { ...base, kind: "test" as const },
      { ...base, targetSize: 30 },
      { ...base, surface: "rough" as const },
      { ...base, difficulty: "trudny" as const },
      { ...base, drillId: "point-random" },
    ]) {
      expect(conditionKey(altered, "point", 7)).not.toBe(key);
    }
    expect(conditionKey(base, "shoot", 7)).not.toBe(key);
    expect(conditionKey(base, "point", 8)).not.toBe(key);
  });
  it("respects the exercise ceiling even when older data contains an unsupported accepted distance", () => {
    const state: State = { ...emptyState, sessions: [] };
    for (let i = 0; i < 3; i++) finish(state, regular("lob", 9));
    finish(state, {
      ...regular("lob", 10),
      coach: { source: "adaptive", adaptation: "harder" },
    });
    expect(recommendation(state, now)).toMatchObject({
      mode: "lob",
      distance: 9,
    });
    expect(adaptation(state, now)).toMatchObject({
      distance: 9,
      pressure: true,
    });
    const next = generateTraining(state, 60, "lob", now);
    expect(next.plan.every((a) => a.distance <= 9)).toBe(true);
  });
  it("assigns each technique in a mixed generated plan to the correct exercise, including after a repeat", () => {
    const state = seed("point");
    const mixed = generateTraining(state, 30, "wszystko", now);
    const plainShoot = {
      ...regular("shoot", 6),
      difficulty: mixed.difficulty,
      targetSize: mixed.targetSize,
      boundary: mixed.boundary,
      surface: mixed.surface,
    };
    expect(mixed.drillId).toBe("point-basic");
    expect(mixed.plan.some((a) => a.mode === "shoot")).toBe(true);
    expect(conditionKey(mixed, "shoot", 6)).toBe(
      conditionKey(plainShoot, "shoot", 6),
    );
    expect(
      conditionKey({ ...mixed, coach: { source: "manual" } }, "shoot", 6),
    ).toBe(conditionKey(plainShoot, "shoot", 6));
    for (let i = 0; i < 3; i++) {
      const next = generateTraining(state, 30, "wszystko", now);
      const choice = choices.shoot.find((c) => c.hit)!;
      const saved = finish(state, next);
      saved.results = saved.results.map((a) =>
        a.mode === "shoot"
          ? { ...a, result: choice.label, points: choice.points }
          : a,
      );
    }
    expect(createRecommendedSession(state, now, "shoot")).toMatchObject({
      drillId: "shoot-basic",
      plan: Array.from({ length: 20 }, () => ({ mode: "shoot", distance: 6 })),
    });
    const generated = generateTraining(state, 60, "strzał", now);
    expect(generated.drillId).toBe("shoot-basic");
    expect(generated.plan[12]).toMatchObject({ mode: "shoot", distance: 6 });
  });
  it("keeps existing micro-goal progress and avoids duplicates when a saved key contains the old focus field", () => {
    const state = seed("point");
    for (const s of state.sessions) {
      s.results = s.results.map((a, i) =>
        i < 10 ? a : { ...a, hit: false, points: 0, result: "Ponad 100 cm" },
      );
      s.score = s.results.reduce((sum, a) => sum + a.points, 0);
    }
    const withGoal = createMicroGoal(state, now);
    const goal = withGoal.coaching!.goals![0];
    goal.createdAt = "2026-10-20T10:00:00Z";
    goal.target = 100;
    const canonical = goal.conditionKey!;
    expect(normalizeConditionKey(canonical)).toBe(canonical);
    const legacy = canonical.split(":");
    legacy.splice(5, 0, "puenta");
    goal.conditionKey = legacy.join(":");
    expect(normalizeConditionKey(goal.conditionKey)).toBe(canonical);
    expect(goalProgress(withGoal, goal, now)).toMatchObject({
      value: 50,
      samples: 60,
      ready: true,
      complete: false,
    });
    expect(createMicroGoal(withGoal, now)).toBe(withGoal);
  });
});
