import { describe, expect, it } from "vitest";
import { emptyState, type Session } from "../../src/domain";
import { completedSession } from "../support/data";
import {
  lastRepeatableTraining,
  repeatLastTraining,
} from "../../src/features/coaching/repeat";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";

const now = new Date("2026-10-14T12:00:00Z");

describe("repeat the last training", () => {
  it("returns no action for an empty history and resumes an existing draft", () => {
    expect(repeatLastTraining(emptyState, now)).toBeNull();
    const draft = {
      ...completedSession(),
      completedAt: undefined,
      results: [],
      score: 0,
    };
    expect(repeatLastTraining({ ...emptyState, draft }, now)).toBe(draft);
  });

  it("selects the most recently completed full training by date, excluding tests and challenges", () => {
    const old = {
      ...completedSession("old"),
      completedAt: "2026-10-10T12:00:00Z",
    };
    const latest = completedSession("latest");
    const test = {
      ...completedSession("test"),
      kind: "test" as const,
      completedAt: "2026-10-13T12:00:00Z",
    };
    const mastery: Session = {
      ...test,
      id: "mastery",
      kind: "training",
      mastery: { tier: "mastery", version: 1 },
    };
    const partial = {
      ...test,
      id: "partial",
      kind: "training" as const,
      results: test.results.slice(0, 2),
    };
    const future = {
      ...latest,
      id: "future",
      completedAt: "2026-10-15T12:00:00Z",
    };
    const data = {
      ...emptyState,
      sessions: [latest, partial, old, test, mastery, future],
    };
    expect(lastRepeatableTraining(data, now)?.id).toBe("latest");
  });

  it("keeps court settings and the saved random plan, without old results or assessments", () => {
    const previous: Session = {
      ...completedSession("previous"),
      surface: "rough",
      trackDirections: true,
      stressLevel: "zestresowany",
      recovery: "nie",
      mentalExerciseDone: true,
      missionId: "old-mission",
      coach: {
        source: "self",
        referenceSessionId: "old-reference",
        oneChance: true,
      },
    };
    const data = { ...emptyState, sessions: [previous] };
    const next = repeatLastTraining(data, now)!;
    expect(next.id).not.toBe(previous.id);
    expect(next.plan).toEqual(previous.plan);
    expect(next.plan).not.toBe(previous.plan);
    expect([
      next.drillId,
      next.difficulty,
      next.targetSize,
      next.boundary,
      next.surface,
      next.trackDirections,
    ]).toEqual([
      previous.drillId,
      previous.difficulty,
      previous.targetSize,
      previous.boundary,
      previous.surface,
      previous.trackDirections,
    ]);
    expect(next.results).toEqual([]);
    expect(next.score).toBe(0);
    expect(next.startedAt).toBe(now.toISOString());
    expect(next.coach).toEqual({ source: "manual", oneChance: true });
    for (const field of [
      "completedAt",
      "routineUsed",
      "stressLevel",
      "recovery",
      "mentalExerciseDone",
      "situationChoice",
      "missionId",
    ] as const)
      expect(next[field]).toBeUndefined();
    expect(() =>
      parseBackup(serializeBackup({ ...data, draft: next })),
    ).not.toThrow();
    expect(previous.results).toHaveLength(6);
  });

  it("restarts a guided plan and timed stages from preparation", () => {
    const previous = completedSession("guided");
    previous.trainingPlan = {
      minutes: 10,
      focus: "puenta",
      index: 2,
      blocks: [
        {
          kind: "warmup",
          title: "Rozgrzewka",
          instruction: "Przygotuj się",
          minutes: 2,
          start: 0,
          end: 0,
        },
        {
          kind: "throws",
          title: "Puenta",
          instruction: "Rzuty",
          minutes: 6,
          start: 0,
          end: 6,
        },
        {
          kind: "mental",
          title: "Reset",
          instruction: "Wydech",
          minutes: 2,
          start: 6,
          end: 6,
        },
      ],
    };
    const next = repeatLastTraining(
      { ...emptyState, sessions: [previous] },
      now,
    )!;
    expect(next.trainingPlan?.index).toBe(0);
    expect(next.trainingPlan?.blocks).toEqual(previous.trainingPlan.blocks);
    expect(next.trainingPlan?.blocks).not.toBe(previous.trainingPlan.blocks);
    const timed = {
      ...previous,
      drillId: "complete",
      trainingPlan: undefined,
      timedPhase: 3,
      phaseStartedAt: "2026-10-01T12:00:00Z",
    };
    const repeated = repeatLastTraining(
      { ...emptyState, sessions: [timed] },
      now,
    )!;
    expect(repeated.timedPhase).toBe(0);
    expect(repeated.phaseStartedAt).toBe(now.toISOString());
  });
});
