import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { emptyState } from "../../src/domain";
import { createRepository } from "../../src/storage";
import { createRecommendedSession } from "../../src/features/coaching/model";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import {
  advancePractice,
  selectPracticeCue,
  startPractice,
} from "../../src/features/development/practices";
import { attachPendingMentalCue } from "../../src/features/mental/cue";
import { acceptedAdaptation } from "../../src/features/product/model";
import { difficultDistances } from "../support/next-steps";

it("preserves the cue through practice restart, backup and the next technical draft", async () => {
  const name = `cue-${crypto.randomUUID()}`;
  const repo = createRepository(name);
  let state = selectPracticeCue(
    startPractice(emptyState, "mental-reset", 2, "adult"),
    "mistake",
  );
  await repo.save(state);
  state = await createRepository(name).load();
  expect(state.coaching?.practiceDraft?.cueLessonId).toBe("mistake");
  while (state.coaching?.practiceDraft) state = advancePractice(state, 3);
  state = parseBackup(serializeBackup(state));
  expect(state.coaching?.pendingMentalCueLessonId).toBe("mistake");
  const next = attachPendingMentalCue(state, {
    ...state,
    draft: createRecommendedSession(state),
  });
  await repo.save(next);
  const reopened = await createRepository(name).load();
  expect(reopened.draft?.mentalCueLessonId).toBe("mistake");
  expect(reopened.coaching?.pendingMentalCueLessonId).toBeUndefined();
  expect(parseBackup(serializeBackup(reopened))).toEqual(reopened);
});

it("rejects forged cue identifiers before replacing stored data", async () => {
  const repo = createRepository(`cue-invalid-${crypto.randomUUID()}`);
  await repo.save(emptyState);
  const corrupted = {
    ...emptyState,
    coaching: { weeklyGoals: [], pendingMentalCueLessonId: "forged" },
  };
  expect(() => parseBackup(JSON.stringify(corrupted))).toThrow();
  expect(await repo.load()).toEqual(emptyState);
});

it.skip("stores an accepted easier variant with its actual exercise conditions", async () => {
  const now = new Date("2026-10-14T12:00:00Z");
  const state = { ...emptyState, sessions: difficultDistances() };
  const next = { ...state, draft: acceptedAdaptation(state, now) };
  const repo = createRepository(`easier-${crypto.randomUUID()}`);
  await repo.save(parseBackup(serializeBackup(next)));
  expect((await repo.load()).draft).toMatchObject({
    drillId: "shoot-basic",
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    surface: "gravel",
    plan: Array.from({ length: 20 }, () => ({ mode: "shoot", distance: 6 })),
  });
});
