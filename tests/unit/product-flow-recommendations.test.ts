import { describe, expect, it } from "vitest";
import { choices, emptyState, type Mode, type Session } from "../../src/domain";
import {
  conditionKey,
  recommendation,
  trends,
  weaknesses,
} from "../../src/features/coaching/model";

const now = new Date("2026-10-14T12:00:00Z");
function series(
  rate: number,
  distance = 6,
  mode: Mode = "point",
  day = "2026-10-13",
  attempts = 20,
): Session {
  const id = crypto.randomUUID();
  const results = Array.from({ length: attempts }, (_, i) => {
    const option = choices[mode].find(
      (c) => c.hit === i < Math.round((rate * attempts) / 100),
    )!;
    return {
      id: `${id}-${i}`,
      mode,
      distance,
      result: option.label,
      points: option.points,
      hit: option.hit,
      carreau: !!option.carreau,
      outside: !!option.outside,
    };
  });
  return {
    id,
    drillId:
      mode === "point" ? "point-basic" : mode === "lob" ? "lob" : "shoot-basic",
    startedAt: `${day}T10:00:00Z`,
    completedAt: `${day}T10:30:00Z`,
    difficulty: "średni",
    surface: "gravel",
    targetSize: 50,
    boundary: 40,
    plan: results.map(({ mode, distance }) => ({ mode, distance })),
    results,
    score: results.reduce((sum, a) => sum + a.points, 0),
  };
}
const state = (sessions: Session[]) => ({ ...emptyState, sessions });
const repeat = (rate: number, distance: number, count = 3) =>
  Array.from({ length: count }, () => series(rate, distance));

describe("recommendations in a returning player's training loop", () => {
  it("keeps the safe start while acknowledging existing short series", () => {
    expect(recommendation(state([]), now).reason).toContain("Zacznij");
    for (const count of [1, 3]) {
      const r = recommendation(
        state(
          Array.from({ length: count }, () =>
            series(100, 6, "point", undefined, 6),
          ),
        ),
        now,
      );
      expect(r).toMatchObject({ mode: "point", distance: 6, count: 0 });
      expect(r.reason).toContain("Zbieramy punkt odniesienia");
    }
  });

  it.each([
    [[85, 72, 48], 8],
    [[90, 88, 82, 61], 9],
  ])("chooses the attainable priority for %j", (rates, expected) => {
    const sessions = rates.flatMap((rate, i) =>
      Array.from({ length: 3 }, () =>
        series(rate, i + 6, "point", undefined, 100),
      ),
    );
    expect(recommendation(state(sessions), now).distance).toBe(expected);
  });

  it("resists one bad day, preserves real averages and responds to repeated decline", () => {
    const baseline = [...repeat(90, 6), ...repeat(70, 7)];
    expect(recommendation(state(baseline), now).distance).toBe(7);
    const outlier = [...baseline, series(0, 6)];
    expect(recommendation(state(outlier), now).distance).toBe(7);
    expect(
      weaknesses(state(outlier), now).find((w) => w.distance === 6),
    ).toMatchObject({
      rate: 68,
      count: 80,
    });
    expect(
      recommendation(state([...outlier, ...repeat(40, 6)]), now).distance,
    ).toBe(6);
  });

  it("does not mistake one outlier for an established negative trend", () => {
    const sessions = [...repeat(90, 6, 10), ...repeat(80, 7), series(0, 6)];
    expect(recommendation(state(sessions), now).distance).toBe(7);
  });

  it("retains a neglected category when another category exceeds twelve sessions", () => {
    const old = [
      series(55, 8, "shoot", "2026-09-10"),
      series(55, 8, "shoot", "2026-09-11"),
    ];
    const r = recommendation(state([...old, ...repeat(85, 6, 13)]), now);
    expect(r).toMatchObject({
      mode: "shoot",
      distance: 8,
      rate: 55,
      count: 40,
    });
    expect(r.reason).toContain("Dawno nie trenowałeś");
  });

  it("limits evidence to twelve series per condition without combining other targets", () => {
    const sessions = [series(0), ...repeat(80, 6, 12)];
    const other = repeat(0, 6).map((s) => ({ ...s, targetSize: 100 }));
    const areas = weaknesses(state([...sessions, ...other]), now);
    expect(areas.find((w) => w.session.targetSize === 50)).toMatchObject({
      rate: 80,
      count: 240,
    });
    expect(areas).toHaveLength(2);
  });

  it("sets a useful goal from the current trend while keeping the pooled percentage", () => {
    const sessions = [...repeat(30, 8, 5), ...repeat(90, 8, 5)];
    const r = recommendation(state(sessions), now);
    expect(r).toMatchObject({ rate: 60, count: 200, target: 97 });
    expect(r.reason).toContain("Ostatnie porównywalne serie: 90%");
    expect(r.reason).toContain("poprawę");
  });

  it("ranks an improving area by its current series instead of its early poor results", () => {
    const sessions = [
      ...repeat(30, 8, 5),
      ...repeat(90, 8, 5),
      ...repeat(70, 7),
    ];
    expect(recommendation(state(sessions), now).distance).toBe(7);
  });

  it("measures lob progress by first landing independently of final position", () => {
    const sessions = Array.from({ length: 10 }, (_, i) => {
      const s = series(50, 8, "lob");
      return {
        ...s,
        results: s.results.map((a, index) => ({
          ...a,
          landingHit: index < (i < 5 ? 4 : 16),
        })),
      };
    });
    const r = recommendation(state(sessions), now);
    expect(r).toMatchObject({
      rate: 50,
      target: 87,
      trend: { previous: 20, recent: 80, delta: 60, label: "POPRAWIA SIĘ" },
    });
  });

  it("sorts trend evidence chronologically and excludes future results", () => {
    const sessions = Array.from({ length: 10 }, (_, i) =>
      series(
        i < 5 ? 30 : 90,
        8,
        "point",
        `2026-10-${String(i + 1).padStart(2, "0")}`,
      ),
    );
    const future = repeat(0, 8, 3).map((s) => ({
      ...s,
      completedAt: "2026-10-15T10:30:00Z",
    }));
    const history = [...sessions, ...future].reverse();
    expect(
      trends(history, "point", 8, conditionKey(sessions[0], "point", 8), now),
    ).toMatchObject({ previous: 30, recent: 90, delta: 60 });
    expect(recommendation(state(history), now)).toMatchObject({
      rate: 60,
      count: 200,
      trend: { recent: 90 },
    });
  });
});
