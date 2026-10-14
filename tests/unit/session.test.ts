import { describe, expect, it } from "vitest";
import { choices, emptyState, type Session } from "../../src/domain";
import { generateTraining } from "../../src/features/coaching/model";
import {
  canUndoLastThrow,
  undoLastThrow,
} from "../../src/features/coaching/session";
import { completedSession } from "../support/data";

const draft = (): Session => ({
  ...completedSession(),
  completedAt: undefined,
});
function fill(session: Session, count = session.plan.length): Session {
  const results = session.plan.slice(0, count).map((item, index) => {
    const choice = choices[item.mode][0];
    return {
      ...item,
      id: String(index),
      result: choice.label,
      points: choice.points,
      hit: choice.hit,
      carreau: !!choice.carreau,
      outside: !!choice.outside,
    };
  });
  return {
    ...session,
    results,
    score: results.reduce((sum, result) => sum + result.points, 0),
  };
}

describe("correcting a draft throw", () => {
  it("removes the final result, recalculates score and clears the pending decision", () => {
    const session = {
      ...draft(),
      situationChoice: { index: 6, title: "Puenta", mode: "point" as const },
    };
    const next = undoLastThrow(session);
    expect(canUndoLastThrow(session)).toBe(true);
    expect(next.results).toEqual(session.results.slice(0, -1));
    expect(next.score).toBe(13);
    expect(next.situationChoice).toBeUndefined();
    expect(session.results).toHaveLength(6);
    expect(session.score).toBe(15);
  });

  it.each<Partial<Session>>([
    { results: [] },
    { completedAt: "2026-10-12T10:00:00.000Z" },
    { kind: "test" },
    { mastery: { tier: "mastery", version: 1 } },
    { challenge: { kind: "boss", id: "boss-1", version: 1 } },
    { coach: { source: "self", oneChance: true } },
  ])(
    "preserves a session whose correction is restricted: %j",
    (restriction) => {
      const session = { ...draft(), ...restriction };
      expect(canUndoLastThrow(session)).toBe(false);
      expect(undoLastThrow(session)).toBe(session);
    },
  );

  it("returns to the previous generated throw block across a boundary", () => {
    const session = generateTraining(emptyState, 10, "strzał");
    const firstBlock = session.trainingPlan!.blocks[1];
    const current = fill(
      {
        ...session,
        trainingPlan: { ...session.trainingPlan!, index: 2 },
      },
      firstBlock.end,
    );
    const next = undoLastThrow(current);
    expect(next.trainingPlan?.index).toBe(1);
    expect(next.results).toHaveLength(firstBlock.end - 1);
    expect(next.score).toBe((firstBlock.end - 1) * 5);
  });

  it("keeps the final generated test protected in its block and after completion", () => {
    const session = generateTraining(emptyState, 45, "strzał");
    const finalIndex = session.trainingPlan!.blocks.length - 1;
    const current = fill({
      ...session,
      trainingPlan: { ...session.trainingPlan!, index: finalIndex },
    });
    expect(canUndoLastThrow(current)).toBe(false);
    expect(
      canUndoLastThrow({
        ...current,
        trainingPlan: { ...current.trainingPlan!, index: 5 },
      }),
    ).toBe(false);
    const beforeTest = fill(
      current,
      current.trainingPlan!.blocks[finalIndex].start,
    );
    expect(canUndoLastThrow(beforeTest)).toBe(false);
  });
});
