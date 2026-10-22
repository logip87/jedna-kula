import { describe, it, expect } from "vitest";
import {
  choices,
  makePlan,
  summarize,
  stats,
  streak,
  achievements,
  emptyState,
  type Session,
} from "../../src/domain";
import { drills, lessons } from "../../src/data";
const session = (completedAt = "2026-10-06T12:00:00"): Session => ({
  id: "1",
  drillId: "point-basic",
  startedAt: completedAt,
  completedAt,
  difficulty: "średni",
  targetSize: 50,
  boundary: 40,
  plan: [],
  score: 8,
  results: [
    {
      id: "a",
      distance: 7,
      mode: "point",
      result: "0–30 cm",
      points: 3,
      hit: true,
      carreau: false,
      outside: false,
    },
    {
      id: "b",
      distance: 7,
      mode: "shoot",
      result: "Carreau",
      points: 5,
      hit: true,
      carreau: true,
      outside: false,
    },
    {
      id: "c",
      distance: 8,
      mode: "shoot",
      result: "Pudło",
      points: 0,
      hit: false,
      carreau: false,
      outside: false,
    },
  ],
});
describe("scoring and progress", () => {
  it("uses distinct shooting and pointing scales", () => {
    expect(choices.shoot.map((c) => c.points)).toEqual([5, 3, 1, 0]);
    expect(choices.point.map((c) => c.points)).toEqual([3, 2, 1, 0]);
    expect(choices.boundary.at(-1)?.outside).toBe(true);
  });
  it("normalizes mixed results to the possible score", () => {
    const r = summarize(session());
    expect(r.points).toBe(8);
    expect(r.percentage).toBe(62);
    expect(r.hits).toBe(2);
    expect(r.misses).toBe(1);
    expect(r.carreaux).toBe(1);
    expect(r.best?.distance).toBe(7);
    expect(r.weakest?.distance).toBe(8);
  });
  it("calculates accuracy separately for each role", () => {
    const r = stats({ ...emptyState, sessions: [session()] });
    expect(r.point).toBe(100);
    expect(r.shoot).toBe(50);
    expect(r.carreau).toBe(50);
  });
  it("handles an empty history without NaN", () => {
    expect(stats(emptyState).point).toBe(0);
    expect(summarize({ ...session(), results: [] }).percentage).toBe(0);
  });
  it("counts local consecutive dates and tolerates duplicates and yesterday", () => {
    const now = new Date("2026-10-06T18:00:00");
    expect(
      streak(
        [
          session("2026-10-05T12:00:00"),
          session("2026-10-04T12:00:00"),
          session("2026-10-05T13:00:00"),
        ],
        now,
      ),
    ).toBe(2);
    expect(streak([session("2026-10-03T12:00:00")], now)).toBe(0);
  });
  it("unlocks achievements from real saved results", () => {
    const r = achievements({
      ...emptyState,
      sessions: [session()],
      lessons: lessons.map((l) => l.id),
    });
    expect(r.find((a) => a.name === "Wszechstronny zawodnik")?.unlocked).toBe(
      true,
    );
    expect(r.find((a) => a.name === "5 carreaux")?.unlocked).toBe(false);
    expect(r.find((a) => a.name === "Spokojna głowa")?.unlocked).toBe(true);
  });
});
describe("training plans", () => {
  it("supports six attempts per each selected distance", () => {
    const plan = makePlan(drills[0], 7, 6, true);
    expect(plan).toHaveLength(30);
    expect(plan.filter((x) => x.distance === 8)).toHaveLength(6);
  });
  it("never repeats a random distance, even with a fixed random source", () => {
    const plan = makePlan(
      drills.find((d) => d.id === "shoot-random")!,
      7,
      10,
      false,
      () => 0,
    );
    expect(plan).toHaveLength(10);
    expect(
      plan.every((p, i) => i === 0 || p.distance !== plan[i - 1].distance),
    ).toBe(true);
  });
  it("makes all four mixed rounds", () => {
    const plan = makePlan(
      drills.find((d) => d.id === "roles")!,
      7,
      12,
      false,
      () => 0.1,
    );
    expect(new Set(plan.map((x) => x.phase)).size).toBe(4);
    expect(plan[0].mode).toBe("point");
    expect(plan[3].mode).toBe("shoot");
  });
  it("contains complete lessons across the five competencies", () => {
    expect(lessons).toHaveLength(31);
    expect(
      lessons.every(
        (l) => l.description && l.rule && l.example && l.exercise && l.phrase,
      ),
    ).toBe(true);
  });
});

it("keeps earned achievements and their first unlock date", async () => {
  const { awardAchievements } = await import("../../src/domain");
  const earned = awardAchievements(
    { ...emptyState, sessions: [session()] },
    "2026-10-06",
  );
  const later = awardAchievements({ ...earned, sessions: [] }, "2026-10-07");
  expect(
    later.awards?.find((a) => a.name === "Pierwszy trening")?.unlockedAt,
  ).toBe("2026-10-06");
  expect(
    achievements(later).find((a) => a.name === "Pierwszy trening")?.unlocked,
  ).toBe(true);
});
