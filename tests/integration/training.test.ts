import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { createRepository } from "../../src/storage";
import { stats, summarize } from "../../src/domain";
import { completedMentalLessons } from "../../src/features/mental/catalog";
import {
  startPractice,
  advancePractice,
  practiceSteps,
} from "../../src/features/development/practices";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import { cleanState, completedSession } from "../support/data";
it("scored training survives repository restart and feeds history and progress", async () => {
  const name = `qa-${crypto.randomUUID()}`;
  const repo = createRepository(name);
  const session = completedSession();
  await repo.save({ ...cleanState(), sessions: [session] });
  const restored = await createRepository(name).load();
  expect(restored.sessions.map((s) => s.id)).toEqual(["qa-point"]);
  expect(summarize(restored.sessions[0])).toMatchObject({
    points: 15,
    percentage: 83,
    hits: 6,
    misses: 0,
  });
  expect(stats(restored)).toMatchObject({
    count: 1,
    point: 100,
    shoot: 0,
    routine: 100,
  });
});
it("lesson and completed practice persist with check-in and competency progress", async () => {
  const name = `qa-${crypto.randomUUID()}`;
  let state = startPractice(
    { ...cleanState(), lessons: ["routine"] },
    "mental-routine",
    2,
    "adult",
    4,
  );
  const length = practiceSteps(state.coaching!.practiceDraft!).length;
  for (let i = 0; i < length; i++)
    state = advancePractice(state, i === length - 1 ? 2 : undefined);
  await createRepository(name).save(state);
  const restored = await createRepository(name).load();
  expect(completedMentalLessons(restored.lessons)).toBe(1);
  expect(restored.coaching!.practiceDraft).toBeUndefined();
  expect(restored.coaching!.practiceHistory).toHaveLength(1);
  expect(restored.coaching!.practiceHistory![0].checkin).toEqual({
    before: 4,
    after: 2,
  });
});
it("validated import replaces complete state atomically and preserves recovery copy", async () => {
  const name = `qa-${crypto.randomUUID()}`;
  const original = { ...cleanState(), lessons: ["routine"] };
  const imported = {
    ...cleanState(),
    sessions: [completedSession("imported")],
  };
  const repo = createRepository(name);
  await repo.save(original);
  await repo.restore(parseBackup(serializeBackup(imported)));
  const restarted = createRepository(name);
  expect(await restarted.load()).toEqual(imported);
  expect(await restarted.loadRecovery()).toEqual(original);
});
