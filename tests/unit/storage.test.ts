import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { createRepository } from "../../src/storage";
import { emptyState } from "../../src/domain";
it("stores and reloads profile, lesson progress and an unfinished session across repository instances", async () => {
  const name = crypto.randomUUID();
  const a = createRepository(name);
  expect(await a.load()).toEqual(emptyState);
  const state = {
    ...emptyState,
    player: {
      id: "p",
      name: "Ola",
      age: 11,
      preferredRole: "strzelec",
      preferredHand: "prawa",
      createdAt: "2026-10-06",
    },
    lessons: ["one"],
    draft: {
      id: "d",
      drillId: "point-basic",
      startedAt: "2026-10-06",
      difficulty: "średni" as const,
      plan: [{ distance: 7, mode: "point" as const }],
      results: [],
      score: 0,
      targetSize: 50,
      boundary: 40,
    },
  };
  await a.save(state);
  expect(await createRepository(name).load()).toEqual(state);
});
