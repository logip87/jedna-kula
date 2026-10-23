import { describe, expect, it } from "vitest";
import { emptyState } from "../../src/domain";
import {
  generateTraining,
  type TrainingFocus,
} from "../../src/features/coaching/model";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";

const now = new Date("2026-10-23T12:00:00Z");
const cases = ([10, 20, 30, 45, 60] as const).flatMap((minutes) =>
  ([6, 10, 20] as const).flatMap((attempts) =>
    (
      [
        "puenta",
        "strzał",
        "lob",
        "przy linii",
        "do celu",
        "wszystko",
        "słabości",
        "presja",
        "lekko",
      ] satisfies TrainingFocus[]
    ).map((focus) => ({ minutes, attempts, focus })),
  ),
);

describe("manual settings in the longer training generator", () => {
  it.each(cases)(
    "keeps $attempts total throws at 8 m in a $minutes-minute $focus plan",
    ({ minutes, attempts, focus }) => {
      const session = generateTraining(emptyState, minutes, focus, now, {
        distance: 8,
        attempts,
      });
      expect(session.plan).toHaveLength(attempts);
      expect(session.plan.every((a) => a.distance === 8)).toBe(true);
      const blocks = session.trainingPlan!.blocks;
      let cursor = 0;
      for (const block of blocks) {
        expect(block.start).toBe(cursor);
        if (block.kind === "throws") {
          expect(block.end).toBeGreaterThan(block.start);
          expect(
            session.plan
              .slice(block.start, block.end)
              .every((a) => a.phase === block.title),
          ).toBe(true);
          expect(block.instruction).toContain("8 m");
        } else expect(block.end).toBe(block.start);
        cursor = block.end;
      }
      expect(cursor).toBe(attempts);
      expect(blocks.reduce((sum, b) => sum + b.minutes, 0)).toBe(minutes);
      expect(() =>
        parseBackup(serializeBackup({ ...emptyState, draft: session })),
      ).not.toThrow();
    },
  );
  it("rejects an unavailable distance or an unsupported total", () => {
    expect(() =>
      generateTraining(emptyState, 60, "lob", now, {
        distance: 10,
        attempts: 20,
      }),
    ).toThrow();
    expect(() =>
      generateTraining(emptyState, 60, "puenta", now, {
        distance: 7.5,
        attempts: 20,
      }),
    ).toThrow();
    expect(() =>
      generateTraining(emptyState, 60, "puenta", now, {
        distance: 8,
        attempts: 30 as 20,
      }),
    ).toThrow();
  });
});
