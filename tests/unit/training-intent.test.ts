import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { emptyState, type State } from "../../src/domain";
import { createRepository } from "../../src/storage";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import {
  createRecommendedSession,
  recommendation,
} from "../../src/features/coaching/model";
import { goalStep, trainingGoals } from "../../src/features/profile/intent";

const player = {
  id: "club-player",
  name: "Ola",
  preferredRole: "middle",
  preferredHand: "lewa",
  createdAt: "2026-10-06",
  audience: "athlete" as const,
  level: "tournament" as const,
};
it("round trips optional intent through backup and IndexedDB without losing legacy profile data", async () => {
  const legacy: State = {
    ...structuredClone(emptyState),
    player,
    lessons: ["one"],
  };
  expect(parseBackup(serializeBackup(legacy))).toEqual(legacy);
  const state: State = {
    ...legacy,
    player: { ...player, playingStyle: "club", trainingGoal: "shoot" },
  };
  expect(parseBackup(serializeBackup(state))).toEqual(state);
  const repository = createRepository(crypto.randomUUID());
  await repository.save(state);
  expect(await repository.load()).toEqual(state);
  for (const field of ["playingStyle", "trainingGoal"]) {
    const invalid = {
      ...state,
      player: { ...player, [field]: "invented" },
    };
    expect(() => parseBackup(serializeBackup(invalid))).toThrow();
  }
});
it("uses the chosen technical goal for the first series and evidence once available", () => {
  const state: State = {
    ...structuredClone(emptyState),
    player: { ...player, trainingGoal: "shoot" },
  };
  const now = new Date("2026-10-22T12:00:00Z");
  expect(recommendation(state, now)).toMatchObject({
    mode: "shoot",
    count: 0,
    rate: null,
  });
  expect(createRecommendedSession(state, now)).toMatchObject({
    drillId: "shoot-basic",
    plan: Array(6).fill({ mode: "shoot", distance: 6 }),
  });
  const baseline = createRecommendedSession(emptyState, now);
  state.sessions = [0, 1].map((index) => ({
    ...baseline,
    id: `point-${index}`,
    completedAt: "2026-10-21T12:00:00Z",
    plan: Array(10).fill({ mode: "point" as const, distance: 6 }),
    results: Array.from({ length: 10 }, (_, i) => ({
      id: `${index}-${i}`,
      mode: "point" as const,
      distance: 6,
      result: "Ponad 100 cm",
      hit: false,
      points: 0,
      carreau: false,
      outside: false,
    })),
  }));
  expect(recommendation(state, now)).toMatchObject({
    mode: "point",
    count: 20,
    rate: 0,
  });
  expect(createRecommendedSession(state, now).drillId).toBe("point-basic");
});
it("gives nontechnical goals an actionable educational or planning step", () => {
  expect(goalStep("decisions").to).toBe("/adventure/tactics");
  expect(goalStep("pressure").to).toBe("/lessons/routine");
  expect(goalStep("competition").to).toBe("/coach/competition");
  expect(goalStep("regularity").to).toBe("/coach/week");
  for (const goal of Object.keys(
    trainingGoals,
  ) as (keyof typeof trainingGoals)[]) {
    expect(goalStep(goal).to).toMatch(/^\//);
  }
});
