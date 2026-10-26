import { describe, expect, it } from "vitest";
import { emptyState, type Session } from "../../src/domain";
import {
  sessionFromTest,
  testEvidence,
  testReminders,
  testDueDate,
} from "../../src/features/coaching/benchmarks";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
function sample(
  id = "one",
  hits = 0,
  day = "2026-09-25",
  mode: "shoot" | "lob" | "target" = "shoot",
): Session {
  const plan = Array.from({ length: 20 }, (_, i) => ({
    mode,
    distance: 6 + Math.floor(i / 5),
  }));
  return {
    id,
    drillId: `test-${mode}`,
    kind: "test",
    benchmarkVersion: 1,
    startedAt: `${day}T10:00:00`,
    completedAt: `${day}T11:00:00`,
    difficulty: "średni",
    targetSize: mode === "target" ? 100 : 50,
    boundary: 40,
    surface: "gravel",
    plan,
    score: hits * (mode === "target" ? 1 : 3),
    results: plan.map((p, i) => ({
      ...p,
      id: `${id}-${i}`,
      result:
        mode === "shoot"
          ? i < hits
            ? "Czyste trafienie"
            : "Pudło"
          : mode === "target"
            ? i < hits
              ? "W celu"
              : "Poza celem"
            : i < hits
              ? "0–30 cm od świnki"
              : "Ponad 100 cm od świnki",
      points: i < hits ? (mode === "target" ? 1 : 3) : 0,
      hit: i < hits,
      carreau: false,
      outside: false,
      ...(mode === "lob" ? { landingHit: i < hits } : {}),
    })),
  };
}
describe("test reminders", () => {
  it("starts on calendar day 30 and remains visible when opening later", () => {
    const state = { ...emptyState, sessions: [sample()] };
    expect(testReminders(state, new Date("2026-10-24T23:59:59"))).toHaveLength(
      0,
    );
    expect(testReminders(state, new Date("2026-10-25T00:00:00"))[0].days).toBe(
      30,
    );
    expect(testReminders(state, new Date("2026-11-02T12:00:00"))[0].days).toBe(
      38,
    );
    expect(testDueDate(sample()).getDate()).toBe(25);
  });
  it("dismisses persistently, resets only for a new full test, and separates skills", () => {
    const one = sample(),
      later = sample("two", 5, "2026-10-01");
    const state = {
      ...emptyState,
      sessions: [one, sample("lob", 5, "2026-09-25", "lob")],
      dismissedTestReminders: { "test-shoot": one.id },
    };
    expect(
      testReminders(state, new Date("2026-10-25T12:00:00")).map(
        (r) => r.session.id,
      ),
    ).toEqual(["lob"]);
    const restored = parseBackup(serializeBackup(state));
    expect(restored.dismissedTestReminders).toEqual(
      state.dismissedTestReminders,
    );
    expect(
      testReminders(
        { ...state, sessions: [one, later] },
        new Date("2026-10-30T12:00:00"),
      ),
    ).toHaveLength(0);
    expect(
      testReminders(
        { ...state, sessions: [one, later] },
        new Date("2026-10-31T12:00:00"),
      )[0].session.id,
    ).toBe("two");
    expect(
      testReminders(
        {
          ...emptyState,
          sessions: [one, { ...later, results: later.results.slice(0, 10) }],
        },
        new Date("2026-10-25T12:00:00"),
      )[0].session.id,
    ).toBe("one");
  });
});
describe("test feedback and follow-up", () => {
  for (const mode of ["shoot", "target", "lob"] as const)
    for (const hits of [0, 20])
      it(`${mode}: repeated ${hits}/20`, () => {
        const history: Session[] = [];
        for (let i = 0; i < 30; i++) {
          const s = sample(
            `${i}`,
            hits,
            `2026-09-${String(i + 1).padStart(2, "0")}`,
            mode,
          );
          const e = testEvidence(s, history);
          expect(e.hits).toBe(hits);
          expect(e.history.length).toBe(Math.min(5, i + 1));
          expect(e.delta).toBe(i ? 0 : null);
          if (i)
            expect(e.message).toContain(
              hits ? "kolejny pełny test" : "pierwsze trafienie",
            );
          history.push(s);
        }
      });
  it("compares the second test and handles improvement, decline and incomplete results", () => {
    const before = sample("first", 5),
      current = sample("second", 7, "2026-09-26");
    expect(testEvidence(current, [before])).toMatchObject({
      delta: 2,
      best: 7,
    });
    expect(
      testEvidence({ ...current, results: current.results.slice(0, 5) }, [
        before,
      ]).complete,
    ).toBe(false);
    expect(
      testEvidence(sample("second", 3, "2026-09-26"), [before]).message,
    ).toContain("Jedna seria");
    expect(
      testEvidence({ ...current, surface: "rough" }, [before]).last,
    ).toBe(before);
  });
  it("uses landing for lob and creates clean sessions retaining conditions", () => {
    const s = sample("lob", 20, "2026-09-25", "lob");
    s.results = s.results.map((a) => ({ ...a, landingHit: false }));
    expect(testEvidence(s, []).hits).toBe(0);
    for (const practice of [false, true]) {
      const next = sessionFromTest(s, practice);
      expect(next.results).toEqual([]);
      expect(next.completedAt).toBeUndefined();
      expect(next.id).not.toBe(s.id);
      expect(next.surface).toBeUndefined();
      expect(next.targetSize).toBe(s.targetSize);
      expect(next.kind).toBe(practice ? "training" : "test");
      expect(next.plan).toEqual(
        practice
          ? Array.from({ length: 20 }, () => ({ mode: "lob", distance: 6 }))
          : s.plan,
      );
    }
  });
});
