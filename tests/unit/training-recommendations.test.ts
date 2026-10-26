import { describe, expect, it } from "vitest";
import { choices, emptyState, type Mode, type Session } from "../../src/domain";
import {
  preferredTrainingFocus,
  recommendation,
  trainingRecommendations,
} from "../../src/features/coaching/model";

const now = new Date("2026-10-26T12:00:00Z");

function series(
  mode: Mode,
  distance: number,
  rate: number,
  day: string,
  attempts = 20,
): Session {
  const hits = Math.round((rate / 100) * attempts);
  const results = Array.from({ length: attempts }, (_, index) => {
    const choice = choices[mode].find((item) => item.hit === index < hits)!;
    return {
      id: `${mode}-${distance}-${day}-${index}`,
      mode,
      distance,
      result: choice.label,
      points: choice.points,
      hit: choice.hit,
      carreau: !!choice.carreau,
      outside: !!choice.outside,
    };
  });
  return {
    id: `${mode}-${distance}-${day}`,
    drillId:
      mode === "shoot" ? "shoot-basic" : mode === "lob" ? "lob" : "point-basic",
    startedAt: `${day}T10:00:00Z`,
    completedAt: `${day}T10:30:00Z`,
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    plan: results.map(({ mode: planMode, distance: planDistance }) => ({
      mode: planMode,
      distance: planDistance,
    })),
    results,
    score: results.reduce((sum, result) => sum + result.points, 0),
  };
}

describe("recommendation shelf", () => {
  it("offers honest starter cards to a new player", () => {
    const cards = trainingRecommendations(emptyState, now);
    expect(cards).toHaveLength(3);
    expect(cards.every((card) => !card.personalized)).toBe(true);
    expect(cards[0]).toMatchObject({
      drillId: "point-basic",
      reason: "Dobry trening na początek.",
    });
  });

  it("keeps a shooter's first suggestions and generated plan on shooting", () => {
    const state = {
      ...emptyState,
      player: {
        id: "shooter",
        name: "",
        preferredRole: "strzelec",
        preferredHand: "prawa",
        createdAt: "2026-10-01",
      },
    };
    expect(trainingRecommendations(state, now)[0]).toMatchObject({
      drillId: "shoot-basic",
      mode: "shoot",
    });
    expect(recommendation(state, now)).toMatchObject({ mode: "shoot" });
    expect(preferredTrainingFocus(state)).toBe("strzał");
  });

  it("uses the existing weakness evidence for a shooting recommendation", () => {
    const cards = trainingRecommendations(
      {
        ...emptyState,
        sessions: [
          series("shoot", 8, 35, "2026-10-20"),
          series("shoot", 8, 35, "2026-10-22"),
        ],
      },
      now,
    );
    expect(cards[0]).toMatchObject({
      drillId: "shoot-basic",
      mode: "shoot",
      distance: 8,
      personalized: true,
      reason: "To obecnie Twój słabszy element.",
    });
  });

  it("respects junior limits and never turns distance into the next level", () => {
    const state = {
      ...emptyState,
      player: {
        id: "junior",
        name: "Maja",
        preferredRole: "strzelec",
        preferredHand: "prawa",
        createdAt: "2026-10-01",
        audience: "junior" as const,
      },
      sessions: [
        series("shoot", 8, 10, "2026-10-20"),
        series("shoot", 8, 10, "2026-10-21"),
        series("shoot", 6, 40, "2026-10-22"),
        series("shoot", 6, 40, "2026-10-23"),
      ],
    };
    const cards = trainingRecommendations(state, now);
    expect(cards.every((card) => card.distance <= 7)).toBe(true);
    expect(cards[0]).toMatchObject({ mode: "shoot", distance: 6 });

    const strongAtSix = {
      ...state,
      sessions: [
        series("shoot", 6, 95, "2026-10-20"),
        series("shoot", 6, 95, "2026-10-22"),
        series("shoot", 6, 95, "2026-10-24"),
      ],
    };
    expect(trainingRecommendations(strongAtSix, now)[0]).toMatchObject({
      distance: 6,
    });
  });

  it("uses the resistant session measure in the headline after one bad series", () => {
    const state = {
      ...emptyState,
      sessions: [
        series("point", 6, 95, "2026-10-20"),
        series("point", 6, 95, "2026-10-22"),
        series("point", 6, 0, "2026-10-24"),
      ],
    };
    const main = recommendation(state, now);
    expect(main).toMatchObject({ rate: 63, stableRate: 95 });
    expect(main.reason).toContain(
      "Stabilny poziom z ostatnich pełnych serii: 95%",
    );
  });

  it("puts a similarly important, long-untrained area ahead of a recent one", () => {
    const cards = trainingRecommendations(
      {
        ...emptyState,
        sessions: [
          series("shoot", 8, 55, "2026-10-01"),
          series("shoot", 8, 55, "2026-10-02"),
          series("point", 8, 55, "2026-10-24"),
          series("point", 8, 55, "2026-10-25"),
        ],
      },
      now,
    );
    expect(cards[0]).toMatchObject({ mode: "shoot", distance: 8 });
  });
});
