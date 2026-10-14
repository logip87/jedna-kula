import { describe, expect, it } from "vitest";
import { emptyState, type Session, type State } from "../../src/domain";
import {
  adaptation,
  acceptedAdaptation,
} from "../../src/features/product/model";
import {
  createRecommendedSession,
  recommendation,
} from "../../src/features/coaching/model";
import {
  attachPendingMentalCue,
  mentalCueText,
} from "../../src/features/mental/cue";
import {
  advancePractice,
  practiceSteps,
  selectPracticeCue,
  startPractice,
} from "../../src/features/development/practices";
import { difficultDistances, nextStepSeries } from "../support/next-steps";

const now = new Date("2026-10-14T12:00:00Z");
const data = (sessions = difficultDistances()): State => ({
  ...emptyState,
  sessions,
});
const withCue = (): State => ({
  ...emptyState,
  coaching: { weeklyGoals: [], pendingMentalCueLessonId: "mistake" },
});

describe("an attainable alternative across difficult distances", () => {
  it("requires at least ten throws per series and strictly less than 35% at every distance", () => {
    const boundary = difficultDistances().map((s) =>
      nextStepSeries("shoot", s.plan[0].distance, 7),
    );
    expect(adaptation(data(boundary), now)).toBeNull();
    const short = difficultDistances().map((s) => ({
      ...s,
      plan: s.plan.slice(0, 6),
      results: s.results.slice(0, 6),
    }));
    expect(adaptation(data(short), now)).toBeNull();
  });
  it("offers a closer series with a reason after three difficult full series at each distance", () => {
    const state = data();
    expect(adaptation(state, now)).toMatchObject({
      kind: "easier",
      mode: "shoot",
      distance: 6,
      pressure: false,
    });
    expect(adaptation(state, now)?.reason).toContain("7 m, 8 m");
    expect(adaptation(state, now)?.evidence).toContain("120 prób");
    expect(createRecommendedSession(state, now).plan[0].distance).toBe(7);
    const accepted = acceptedAdaptation(state, now);
    expect(accepted.plan).toHaveLength(20);
    expect(
      accepted.plan.every((a) => a.distance === 6 && a.mode === "shoot"),
    ).toBe(true);
    expect(accepted).toMatchObject({
      drillId: "shoot-basic",
      surface: "gravel",
      targetSize: 50,
      boundary: 40,
      coach: { source: "adaptive", adaptation: "easier" },
    });
    expect(state.sessions[0].plan[0].distance).toBe(7);
  });

  it("uses the affected skill even when the daily recommendation is another category", () => {
    const state = data([
      ...difficultDistances(),
      ...[11, 12, 13].map((day) => nextStepSeries("point", 6, 12, day)),
    ]);
    expect(recommendation(state, now).mode).toBe("point");
    expect(acceptedAdaptation(state, now)).toMatchObject({
      drillId: "shoot-basic",
      plan: expect.arrayContaining([{ mode: "shoot", distance: 6 }]),
    });
  });

  it("does not combine different conditions or use sparse, stale, partial, test or future evidence", () => {
    const variants: Session[][] = [
      difficultDistances().map((s) => ({
        ...s,
        surface: s.plan[0].distance === 7 ? "gravel" : "rough",
      })),
      difficultDistances().filter((s) => s.completedAt!.includes("13T")),
      difficultDistances().map((s) => ({
        ...s,
        completedAt: "2026-08-01T10:30:00Z",
      })),
      difficultDistances().map((s) => ({
        ...s,
        results: s.results.slice(0, 10),
      })),
      difficultDistances().map((s) => ({
        ...s,
        kind: "test",
        benchmarkVersion: 1,
      })),
      difficultDistances().map((s) => ({
        ...s,
        completedAt: "2026-10-15T10:30:00Z",
      })),
    ];
    for (const sessions of variants) {
      // Single-distance adaptation can remain valid, but not multi-distance evidence.
      expect(adaptation(data(sessions), now)?.evidence ?? "").not.toContain(
        "na każdym",
      );
    }
  });

  it("ignores a one-off slump and withdraws the wider proposal after a recovery", () => {
    const oneBadDay = [7, 8].flatMap((distance) => [
      nextStepSeries("shoot", distance, 16, 11),
      nextStepSeries("shoot", distance, 16, 12),
      nextStepSeries("shoot", distance, 0, 13),
    ]);
    expect(adaptation(data(oneBadDay), now)?.kind).not.toBe("easier");
    const recovering = [
      ...difficultDistances(),
      nextStepSeries("shoot", 7, 10, 14),
    ];
    expect(adaptation(data(recovering), now)?.evidence ?? "").not.toContain(
      "na każdym",
    );
  });

  it("measures lob landings and never proposes a known difficult lower limit", () => {
    const lob = difficultDistances().map((s) => ({
      ...s,
      drillId: "lob",
      plan: s.plan.map((a) => ({ ...a, mode: "lob" as const })),
      results: s.results.map((a, i) => ({
        ...a,
        mode: "lob" as const,
        hit: true,
        landingHit: i < 4,
      })),
    }));
    expect(adaptation(data(lob), now)).toMatchObject({
      kind: "easier",
      mode: "lob",
      distance: 6,
    });
    const low = difficultDistances().map((s) => ({
      ...s,
      plan: s.plan.map((a) => ({ ...a, distance: a.distance - 2 })),
      results: s.results.map((a) => ({ ...a, distance: a.distance - 2 })),
    }));
    expect(adaptation(data(low), now)?.evidence ?? "").not.toContain(
      "na każdym",
    );
    expect(adaptation(data(low), now)?.distance ?? 5).toBeGreaterThanOrEqual(5);
  });

  it("keeps single-distance progression working when other distances are interleaved", () => {
    const sessions = [11, 12, 13].flatMap((day) => [
      nextStepSeries("shoot", 8, 14, day),
      nextStepSeries("shoot", 9, 20, day),
    ]);
    const state = data(sessions);
    expect(recommendation(state, now).distance).toBe(8);
    expect(adaptation(state, now)).toMatchObject({
      kind: "harder",
      distance: 9,
    });
  });
});

describe("a chosen mental cue in the next technical series", () => {
  it("records a selected cue only when mental practice is completed", () => {
    let state = startPractice(emptyState, "mental-reset", 2, "adult", 3);
    state = selectPracticeCue(state, "mistake");
    expect(state.coaching?.pendingMentalCueLessonId).toBeUndefined();
    while (state.coaching?.practiceDraft) state = advancePractice(state, 3);
    expect(state.coaching?.practiceHistory?.[0].cueLessonId).toBe("mistake");
    expect(state.coaching?.pendingMentalCueLessonId).toBe("mistake");
    expect(mentalCueText("mistake")).toBe("Reset i następne zadanie.");
    expect(() =>
      selectPracticeCue(
        startPractice(emptyState, "mental-reset", 2, "adult"),
        "unknown",
      ),
    ).toThrow();
  });

  it("attaches and consumes the pending cue in one state change and preserves drafts on resume", () => {
    const previous = withCue();
    const draft = createRecommendedSession(previous, now);
    const next = attachPendingMentalCue(previous, { ...previous, draft });
    expect(next.draft?.mentalCueLessonId).toBe("mistake");
    expect(next.coaching?.pendingMentalCueLessonId).toBeUndefined();
    expect(previous.coaching?.pendingMentalCueLessonId).toBe("mistake");
    const resumed = {
      ...next,
      coaching: { weeklyGoals: [], pendingMentalCueLessonId: "routine" },
    };
    expect(attachPendingMentalCue(resumed, resumed)).toBe(resumed);
    const later = attachPendingMentalCue(next, {
      ...next,
      draft: { ...draft, id: "later", mentalCueLessonId: "mistake" },
    });
    expect(later.draft?.mentalCueLessonId).toBeUndefined();
  });

  it.each<Partial<Session>>([
    { kind: "test" },
    { mastery: { tier: "mastery", version: 1 } },
    { challenge: { kind: "boss", id: "boss-1", version: 1 } },
    { drillId: "test-shoot" },
  ])(
    "keeps the cue for later when starting a protected session: %j",
    (variant) => {
      const previous = withCue();
      const next = attachPendingMentalCue(previous, {
        ...previous,
        draft: { ...createRecommendedSession(previous, now), ...variant },
      });
      expect(next.coaching?.pendingMentalCueLessonId).toBe("mistake");
      expect(next.draft?.mentalCueLessonId).toBeUndefined();
    },
  );

  it("keeps selection optional and does not attach a cue to physical practice", () => {
    let state = startPractice(emptyState, "mental-routine", 2, "adult");
    for (
      let i = 0, length = practiceSteps(state.coaching!.practiceDraft!).length;
      i < length;
      i++
    )
      state = advancePractice(state, 3);
    expect(state.coaching?.pendingMentalCueLessonId).toBeUndefined();
    const physical = startPractice(emptyState, "physical-mobility", 5, "adult");
    expect(selectPracticeCue(physical, "routine")).toBe(physical);
  });
});
