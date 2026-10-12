import { describe, it, expect, vi, afterEach } from "vitest";
import {
  emptyState,
  choices,
  type Session,
  type State,
} from "../../src/domain";
import {
  recommendation,
  generateTraining,
  createRecommendedSession,
  selfChallenge,
} from "../../src/features/coaching/model";
import {
  acceptedAdaptation,
  adaptation,
  dailyTraining,
  mentalRecommendation,
  summaryEvidence,
} from "../../src/features/product/model";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import {
  enableMeasurement,
  recordEvent,
  productCounters,
  setEventSink,
  transitionEvents,
  type ProductEvent,
} from "../../src/features/product/analytics";
const now = new Date("2026-10-07T12:00:00Z");
function session(
  rate: number,
  distance = 8,
  id = crypto.randomUUID() as string,
): Session {
  const plan = Array.from({ length: 10 }, () => ({
    mode: "shoot" as const,
    distance,
  }));
  const results = plan.map((p, i) => {
    const c = choices.shoot.find((c) => c.hit === i < rate / 10)!;
    return {
      ...p,
      id: `${id}-${i}`,
      result: c.label,
      points: c.points,
      hit: c.hit,
      carreau: !!c.carreau,
      outside: !!c.outside,
    };
  });
  return {
    id,
    drillId: "shoot-basic",
    difficulty: "średni",
    surface: "gravel",
    targetSize: 50,
    boundary: 40,
    startedAt: "2026-10-06T10:00:00Z",
    completedAt: "2026-10-06T10:30:00Z",
    plan,
    results,
    score: results.reduce((n, a) => n + a.points, 0),
  };
}
const state = (rates: number[], distance = 8): State => ({
  ...emptyState,
  sessions: rates.map((n) => session(n, distance)),
});
afterEach(() => {
  vi.unstubAllGlobals();
  setEventSink(undefined);
});
describe("adaptive coach", () => {
  it("prefers an attainable weakness and is deterministic", () => {
    const s = {
      ...emptyState,
      sessions: [
        ...state([80, 80], 6).sessions,
        ...state([70, 70], 7).sessions,
        ...state([40, 40], 8).sessions,
        ...state([20, 30], 9).sessions,
      ],
    };
    expect(recommendation(s, now).distance).toBe(8);
    expect(recommendation(s, now)).toEqual(recommendation(s, now));
  });
  it("requires three recent comparable series and regular thresholds", () => {
    expect(adaptation(state([20, 20, 20], 5), now)).toBeNull();
    expect(
      acceptedAdaptation(state([100, 100, 100], 10), now).coach?.oneChance,
    ).toBe(true);
    expect(adaptation(state([100, 100]), now)).toBeNull();
    expect(adaptation(state([100, 100, 80]), now)).toBeNull();
    const s = state([100, 90, 100]);
    s.sessions[0].surface = "rough";
    expect(adaptation(s, now)).toBeNull();
    const old = state([100, 100, 100]);
    old.sessions[0].completedAt = "2026-08-01T10:00:00Z";
    expect(adaptation(old, now)).toBeNull();
  });
  it("changes only after explicit acceptance and retains source conditions", () => {
    const s = state([100, 100, 100]);
    const regular = createRecommendedSession(s, now);
    expect(regular.plan[0].distance).toBe(8);
    expect(acceptedAdaptation(s, now).plan[0].distance).toBe(9);
    expect(s.sessions[0].plan[0].distance).toBe(8);
    expect(acceptedAdaptation(state([20, 20, 30]), now).plan[0].distance).toBe(
      7,
    );
    expect(
      acceptedAdaptation(
        {
          ...s,
          player: {
            id: "junior",
            name: "A",
            age: 12,
            preferredRole: "",
            preferredHand: "",
            createdAt: now.toISOString(),
            audience: "junior",
          },
          sessions: state([100, 100, 100], 7).sessions,
        },
        now,
      ).plan[0].distance,
    ).toBe(7);
  });
  it("does not lose the recommended exercise identity", () => {
    const s = state([40, 40]);
    s.sessions.forEach((x) => (x.drillId = "shoot-three"));
    expect(createRecommendedSession(s, now).drillId).toBe("shoot-three");
  });
});
describe("mental and summary", () => {
  it("requires real checkins and adds an existing two minute routine", () => {
    const s = state([60, 60, 60, 60, 60]);
    expect(mentalRecommendation(s, now)).toBeNull();
    s.sessions.forEach((x, i) => (x.routineUsed = i < 2));
    expect(mentalRecommendation(s, now)?.reason).toContain("2 razy");
    expect(dailyTraining(s, now).trainingPlan?.blocks[0].kind).toBe("mental");
    expect(
      parseBackup(serializeBackup({ ...s, draft: dailyTraining(s, now) })).draft
        ?.trainingPlan?.minutes,
    ).toBe(20);
  });
  it("uses tension samples without diagnosing", () => {
    const s = {
      ...emptyState,
      coaching: {
        weeklyGoals: [],
        practiceHistory: Array.from({ length: 3 }, (_, i) => ({
          id: `p${i}`,
          moduleId: "mental-routine",
          kind: "mental" as const,
          audience: "adult" as const,
          minutes: 2 as const,
          startedAt: "2026-10-06T10:00:00Z",
          completedAt: "2026-10-06T10:02:00Z",
          step: 4,
          checkin: { before: 4, after: 3 },
        })),
      },
    };
    expect(mentalRecommendation(s, now)?.id).toBe("tension");
  });
  it("compares only enough full matching series and honors an exact self reference", () => {
    const prior = state([40, 60]);
    const current = session(80);
    expect(summaryEvidence(current, prior).baseline).toBe(50);
    expect(summaryEvidence(current, state([40])).baseline).toBeNull();
    const wrong = {
      ...prior,
      sessions: prior.sessions.map((x) => ({
        ...x,
        surface: "rough" as const,
      })),
    };
    expect(summaryEvidence(current, wrong).baseline).toBeNull();
    const source = prior.sessions.at(-1)!;
    const self = {
      ...current,
      coach: { source: "self" as const, referenceSessionId: source.id },
    };
    expect(summaryEvidence(self, prior).self).toMatchObject({
      before: 6,
      delta: 2,
    });
    expect(selfChallenge(prior)?.coach?.referenceSessionId).toBe(source.id);
  });
});
describe("long plans", () => {
  it("uses distinct purposes rather than multiplying throw volume", () => {
    for (const minutes of [45, 60] as const) {
      const s = generateTraining(emptyState, minutes, "strzał", now);
      expect(s.plan).toHaveLength(51);
      expect(s.trainingPlan?.blocks.map((b) => b.title)).toEqual([
        "Rozgrzewka",
        "Technika",
        "Twój priorytet",
        "Zmiana dystansu",
        "Presja 2/3",
        "Mental reset",
        "Krótki test końcowy",
      ]);
      expect(s.trainingPlan?.blocks.reduce((n, b) => n + b.minutes, 0)).toBe(
        minutes,
      );
      expect(
        parseBackup(serializeBackup({ ...emptyState, draft: s })).draft,
      ).toEqual(s);
    }
  });
});
describe("private product events", () => {
  function storage() {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    });
    return store;
  }
  it("collects nothing by default and only counts allowlisted names after opt-in", () => {
    const store = storage(),
      sink = vi.fn();
    setEventSink(sink);
    recordEvent("app_open");
    expect(store.size).toBe(0);
    expect(sink).not.toHaveBeenCalled();
    enableMeasurement(true);
    recordEvent("app_open");
    recordEvent("profile" as ProductEvent);
    expect(sink).toHaveBeenCalledExactlyOnceWith({ name: "app_open" });
    expect(JSON.stringify(productCounters())).not.toContain("profile");
    enableMeasurement(false);
    expect(productCounters()).toEqual({});
  });
  it("emits successful start/complete once and excludes imports at the caller", () => {
    storage();
    enableMeasurement(true);
    const sink = vi.fn();
    setEventSink(sink);
    const draft = {
      ...createRecommendedSession(emptyState, now),
      plan: session(60).plan,
    };
    transitionEvents(emptyState, { ...emptyState, draft });
    transitionEvents(
      { ...emptyState, draft },
      {
        ...emptyState,
        sessions: [
          {
            ...session(60, draft.plan[0].distance, draft.id),
            coach: draft.coach,
          },
        ],
      },
    );
    expect(sink.mock.calls.map((c) => c[0].name)).toEqual([
      "recommended_training_start",
      "training_complete",
      "recommended_training_complete",
    ]);
  });
  it("storage or sink failures never block the app", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("storage");
      },
    });
    expect(() => recordEvent("app_open")).not.toThrow();
  });
});
