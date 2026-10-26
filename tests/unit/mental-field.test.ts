import { describe, expect, it } from "vitest";
import { emptyState, type Session, type State } from "../../src/domain";
import { mentalLessons } from "../../src/features/mental/catalog";
import { tacticCases } from "../../src/features/adventure/data";
import {
  selectFieldTask,
  attachPendingMentalCue,
} from "../../src/features/mental/cue";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import { mentalRecommendation } from "../../src/features/product/model";
import {
  awardDevelopment,
  skillScores,
} from "../../src/features/development/model";
import { startMatch } from "../../src/features/situations/model";
import { completedSession } from "../support/data";
const now = new Date("2026-10-22T12:00:00Z");

describe("lessons transfer into existing training and progress", () => {
  it("provides distinct practical content and valid shared scenario references", () => {
    expect(mentalLessons).toHaveLength(31);
    expect(new Set(mentalLessons.map((l) => l.id)).size).toBe(31);
    expect(new Set(mentalLessons.map((l) => l.exercise)).size).toBe(31);
    for (const l of mentalLessons) {
      expect(l.durationMinutes).toBeGreaterThanOrEqual(1);
      expect(l.durationMinutes).toBeLessThanOrEqual(3);
      expect(l.procedure?.length).toBeGreaterThanOrEqual(2);
      expect(l.reflection).toBeTruthy();
      expect(l.tags?.length).toBeGreaterThan(0);
      if (l.scenarioId)
        expect(tacticCases.some((c) => c.id === l.scenarioId)).toBe(true);
    }
  });
  it("preserves all 25 legacy completions and XP in every supported backup version", () => {
    const lessons = mentalLessons.slice(0, 25).map((l) => l.id);
    const legacy: State = {
      ...emptyState,
      lessons,
      coaching: {
        weeklyGoals: [],
        xpEvents: [
          {
            id: "lesson:routine",
            kind: "lesson",
            points: 10,
            earnedAt: now.toISOString(),
          },
        ],
      },
    };
    for (const version of [2, 3, 4, 5, 6]) {
      const restored = parseBackup(
        JSON.stringify({ format: "jedna-kula", version, data: legacy }),
      );
      expect(restored).toEqual(legacy);
      expect(restored.sessions).toHaveLength(0);
    }
  });
  it("does not grant completion or XP when selecting or repeating a field task", () => {
    const chosen = selectFieldTask(emptyState, "risk");
    expect(chosen.lessons).toEqual([]);
    expect(chosen.coaching?.pendingMentalCueLessonId).toBe("risk");
    expect(
      awardDevelopment(emptyState, chosen, now).coaching?.xpEvents,
    ).toEqual([]);
    expect(() => selectFieldTask(emptyState, "forged")).toThrow();
  });
  it("consumes a task once, preserves resumed work, and excludes benchmark tests", () => {
    const chosen = selectFieldTask(emptyState, "ball-count");
    const draft: Session = {
      ...completedSession(),
      completedAt: undefined,
      results: [],
      score: 0,
    };
    const test = attachPendingMentalCue(chosen, {
      ...chosen,
      draft: { ...draft, kind: "test" },
    });
    expect(test.coaching?.pendingMentalCueLessonId).toBe("ball-count");
    const attached = attachPendingMentalCue(chosen, { ...chosen, draft });
    expect(attached.draft?.mentalCueLessonId).toBe("ball-count");
    expect(attached.coaching?.pendingMentalCueLessonId).toBeUndefined();
    const changed = selectFieldTask(attached, "anger");
    expect(attachPendingMentalCue(changed, changed)).toBe(changed);
    expect(changed.draft?.mentalCueLessonId).toBe("ball-count");
    expect(parseBackup(serializeBackup(changed))).toEqual(changed);
  });
  it("round trips optional reflections and distinguishes application from reading", () => {
    const s = {
      ...completedSession(),
      mentalCueLessonId: "risk",
      lessonReflection: "applied" as const,
    };
    const state = { ...emptyState, lessons: ["risk"], sessions: [s] };
    expect(parseBackup(serializeBackup(state))).toEqual(state);
    expect(
      skillScores(state, now).find((x) => x.id === "tactics")?.evidence,
    ).toContain("pełnych treningach: 1");
    expect(
      skillScores({ ...state, sessions: [] }, now).find(
        (x) => x.id === "tactics",
      )?.evidence,
    ).toContain("pełnych treningach: 0");
    expect(() =>
      parseBackup(
        serializeBackup({
          ...state,
          sessions: [
            { ...s, lessonReflection: "forged" as Session["lessonReflection"] },
          ],
        }),
      ),
    ).toThrow();
  });
  it("starts the linked existing scenario first, without replacing an unfinished match", () => {
    const state = startMatch(emptyState, [12, 12], "last");
    expect(state.situations?.matchDraft?.scenarios[0]).toBe("last");
    expect(new Set(state.situations?.matchDraft?.scenarios).size).toBe(6);
    expect(startMatch(state, [2, 2], "terrain")).toBe(state);
  });
});

describe("contextual lesson evidence thresholds", () => {
  const series = (id: string, hits: number, pressure = false): Session => {
    const s = completedSession(id);
    const plan = Array.from({ length: 10 }, () => ({
      mode: "shoot" as const,
      distance: 7,
    }));
    return {
      ...s,
      drillId: pressure ? "pressure" : "shoot-basic",
      plan,
      routineUsed: undefined,
      results: plan.map((p, i) => ({
        ...p,
        id: `${id}-${i}`,
        result: i < hits ? "Trafienie i wybicie" : "Pudło",
        hit: i < hits,
        points: i < hits ? 3 : 0,
        carreau: false,
        outside: false,
      })),
    };
  };
  it("offers no diagnosis for empty data, single series, or tactical choices alone", () => {
    for (const state of [
      emptyState,
      { ...emptyState, sessions: [series("p", 1, true)] },
      { ...emptyState, adventure: { tactics: { last: 0, recover: 1 } } },
    ])
      expect(mentalRecommendation(state, now)).toBeNull();
  });
  it("requires five routine observations before suggesting the routine lesson", () => {
    const sessions = Array.from({ length: 5 }, (_, i) => ({
      ...series(String(i), 8),
      routineUsed: false,
    }));
    expect(
      mentalRecommendation(
        { ...emptyState, sessions: sessions.slice(0, 4) },
        now,
      ),
    ).toBeNull();
    expect(
      mentalRecommendation({ ...emptyState, sessions }, now)?.lessonId,
    ).toBe("routine");
  });
  it("requires two comparable series and twenty throws on each side of pressure comparison", () => {
    const sessions = [
      series("a", 9),
      series("b", 9),
      series("c", 4, true),
      series("d", 4, true),
    ];
    expect(
      mentalRecommendation(
        { ...emptyState, sessions: sessions.slice(0, 3) },
        now,
      ),
    ).toBeNull();
    expect(
      mentalRecommendation({ ...emptyState, sessions }, now)?.lessonId,
    ).toBe("one");
    sessions[3] = { ...sessions[3], surface: "rough" };
    expect(mentalRecommendation({ ...emptyState, sessions }, now)?.lessonId).toBe(
      "one",
    );
  });
});

it("links repeated high tension to reset and describes only the observations actually present", () => {
  const practiceHistory = Array.from({ length: 3 }, (_, i) => ({
    id: `check-${i}`,
    moduleId: "mental-routine",
    kind: "mental" as const,
    audience: "adult" as const,
    minutes: 2 as const,
    step: 4,
    startedAt: `2026-10-${18 + i}T10:00:00Z`,
    completedAt: `2026-10-${18 + i}T10:02:00Z`,
    checkin: { before: 4, after: 3 },
  }));
  const state = {
    ...emptyState,
    coaching: { weeklyGoals: [], practiceHistory },
  };
  expect(
    mentalRecommendation(
      {
        ...state,
        coaching: {
          ...state.coaching,
          practiceHistory: practiceHistory.slice(0, 2),
        },
      },
      now,
    ),
  ).toBeNull();
  expect(mentalRecommendation(state, now)?.lessonId).toBe("mistake");
  const stressed = {
    ...state,
    sessions: Array.from({ length: 5 }, (_, i) => ({
      ...completedSession(`stress-${i}`),
      stressLevel: "zestresowany",
    })),
  };
  stressed.coaching.practiceHistory = practiceHistory.map((p) => ({
    ...p,
    checkin: { before: 2, after: 2 },
  }));
  expect(mentalRecommendation(stressed, now)?.reason).toBe(
    "W 5 z 5 treningów zaznaczyłeś większy stres.",
  );
});
