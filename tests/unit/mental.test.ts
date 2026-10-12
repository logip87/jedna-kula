import { describe, it, expect } from "vitest";
import {
  emptyState,
  makePlan,
  choices,
  achievements,
  type State,
  type Session,
} from "../../src/domain";
import { drills } from "../../src/data";
import {
  mentalCompetencies,
  mentalLevels,
  mentalLessons,
  completedMentalLessons,
  technicalMentalCue,
  routineSteps,
} from "../../src/features/mental/catalog";
import {
  practiceModules,
  startPractice,
  advancePractice,
  practiceSteps,
} from "../../src/features/development/practices";
import { audience } from "../../src/features/development/model";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import {
  throwScenarios,
  scenarioForThrow,
  reviewDecision,
} from "../../src/features/situations/throw-scenarios";
import { dashboardEvidence } from "../../src/features/product/model";
const legacyLessons = [
  "one",
  "goal",
  "stress",
  "mistake",
  "good",
  "name",
  "score",
  "trust",
  "roles",
  "routine",
];
const oldModuleLengths: Record<string, number> = {
  "mental-routine": 4,
  "mental-reset": 5,
  "mental-pressure": 4,
  "mental-visual": 4,
  "mental-tension": 4,
  "mental-focus": 4,
  "mental-confidence": 4,
  "mental-next": 4,
  "mental-match": 4,
  "mental-rising": 4,
};
function session(
  mode: "point" | "shoot" = "point",
  distance = 7,
  hits = 8,
  day = 1,
): Session {
  const plan = Array.from({ length: 10 }, () => ({ mode, distance }));
  const results = plan.map((p, i) => {
    const c = choices[mode].find((c) => c.hit === i < hits)!;
    return {
      ...p,
      id: crypto.randomUUID(),
      result: c.label,
      points: c.points,
      hit: c.hit,
      carreau: !!c.carreau,
      outside: !!c.outside,
    };
  });
  return {
    id: crypto.randomUUID(),
    drillId: mode === "shoot" ? "shoot-basic" : "point-basic",
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    startedAt: `2026-10-${String(day).padStart(2, "0")}T10:00:00Z`,
    completedAt: `2026-10-${String(day).padStart(2, "0")}T10:10:00Z`,
    plan,
    results,
    score: results.reduce((n, a) => n + a.points, 0),
  };
}
describe("own mental training system", () => {
  it("has five competencies with all three levels and a complete practical module per lesson", () => {
    expect(mentalCompetencies.map((c) => c.name)).toEqual([
      "Koncentracja",
      "Reset",
      "Presja",
      "Pewność gry",
      "Zawodnik kompletny",
    ]);
    expect(routineSteps).toEqual(["Plan", "Oddech", "Wykonanie", "Reset"]);
    expect(new Set(mentalLessons.map((l) => l.id)).size).toBe(
      mentalLessons.length,
    );
    for (const c of mentalCompetencies) {
      const lessons = mentalLessons.filter((l) => l.competency === c.id);
      expect(lessons).toHaveLength(5);
      expect(new Set(lessons.map((l) => l.level))).toEqual(
        new Set(mentalLevels.map((l) => l.id)),
      );
    }
    for (const l of mentalLessons) {
      const module = practiceModules.find((m) => m.lessonId === l.id)!;
      expect(module.competency).toBe(l.competency);
      expect(module.level).toBe(l.level);
      let state = startPractice(emptyState, module.id, 2, "adult", 4);
      const steps = practiceSteps(state.coaching!.practiceDraft!);
      for (let i = 0; i < steps.length; i++)
        state = advancePractice(state, i === steps.length - 1 ? 2 : undefined);
      expect(parseBackup(serializeBackup(state))).toEqual(state);
      expect(state.coaching!.practiceHistory![0].checkin).toEqual({
        before: 4,
        after: 2,
      });
    }
  });
  it("does not contain the replaced source-specific slogans", () => {
    const content = JSON.stringify([mentalLessons, practiceModules, drills]);
    for (const phrase of [
      "Tylko ta kula",
      "Nowa kula, nowa szansa",
      "Gram sytuację, nie nazwisko",
      "Mam zadanie, nie etykietę",
      "Zobacz. Wybierz. Rzuć. Puść.",
    ])
      expect(content).not.toContain(phrase);
  });
  it("keeps earlier completions without granting completion of the expanded program", () => {
    expect(completedMentalLessons([...legacyLessons, "one", "unknown"])).toBe(
      10,
    );
    expect(
      achievements({ ...emptyState, lessons: legacyLessons }).find(
        (a) => a.name === "Spokojna głowa",
      )?.unlocked,
    ).toBe(false);
    for (const version of [2, 3, 4, 5, 6]) {
      const state = { ...emptyState, lessons: legacyLessons };
      expect(
        parseBackup(
          JSON.stringify({ format: "jedna-kula", version, data: state }),
        ),
      ).toEqual(state);
    }
  });
  it("resumes every legacy module at its saved step and imports completed history", () => {
    for (const [id, count] of Object.entries(oldModuleLengths)) {
      let state = startPractice({ ...emptyState }, id, 2, "adult", 3);
      expect(practiceSteps(state.coaching!.practiceDraft!)).toHaveLength(count);
      state = advancePractice(state);
      const restored = parseBackup(
        JSON.stringify({ format: "jedna-kula", version: 5, data: state }),
      );
      expect(restored.coaching!.practiceDraft!.step).toBe(1);
      for (let i = 1; i < count; i++)
        state = advancePractice(state, i === count - 1 ? 3 : undefined);
      expect(parseBackup(serializeBackup(state))).toEqual(state);
    }
  });
  it("accepts optional age, validates level and never selects features from age", () => {
    const player = {
      id: "p",
      name: "Gracz",
      preferredRole: "middle",
      preferredHand: "lewa",
      createdAt: "2026-10-01T10:00:00Z",
      level: "tournament" as const,
    };
    const state: State = { ...emptyState, player };
    expect(parseBackup(serializeBackup(state))).toEqual(state);
    expect(audience(state)).toBe("athlete");
    expect(audience({ ...state, player: { ...player, age: 11 } })).toBe(
      audience({ ...state, player: { ...player, age: 45 } }),
    );
    for (const level of [
      "beginner",
      "intermediate",
      "advanced",
      "tournament",
    ] as const)
      expect(
        parseBackup(serializeBackup({ ...state, player: { ...player, level } }))
          .player?.level,
      ).toBe(level);
    expect(() =>
      parseBackup(
        serializeBackup({
          ...state,
          player: { ...player, level: "bad" as typeof player.level },
        }),
      ),
    ).toThrow();
  });
  it("links mental cues to each mode, pressure and the previous result including lob landing", () => {
    expect(technicalMentalCue("point")).toContain("miejsce lądowania");
    expect(technicalMentalCue("shoot", undefined, true)).toBe(
      "Ustal cel. Oddech. Rzut.",
    );
    expect(technicalMentalCue("lob")).toContain("wysokość");
    const miss = { ...session().results[0], hit: false };
    expect(technicalMentalCue("point", miss)).toBe("Reset i następne zadanie.");
    expect(technicalMentalCue("point", { ...miss, hit: true })).toBe(
      "Zachowaj tę samą rutynę.",
    );
    expect(
      technicalMentalCue("lob", {
        ...miss,
        mode: "lob",
        hit: true,
        landingHit: false,
      }),
    ).toBe("Reset i następne zadanie.");
  });
});
describe("situations and dashboard evidence", () => {
  it("stores scenarios, decisions and optional reviews without interpreting tactic quality", () => {
    const drill = drills.find((d) => d.id === "situation")!;
    const plan = makePlan(drill, 7, 7, false);
    expect(plan.map((p) => p.situationId)).toEqual(
      throwScenarios.map((c) => c.id),
    );
    let s = {
      ...session(),
      drillId: "situation",
      plan,
      results: [],
      score: 0,
    } as Session;
    expect(scenarioForThrow(s, 6)?.id).toBe("last-ball");
    s = {
      ...s,
      results: [
        { ...session().results[0], ...plan[0], decision: "Puentuję lepiej" },
      ],
    };
    s.score = s.results[0].points;
    const reviewed = reviewDecision(s, 0, "zmienię decyzję");
    expect(reviewed.results[0].hit).toBe(s.results[0].hit);
    expect(
      parseBackup(serializeBackup({ ...emptyState, draft: reviewed })).draft,
    ).toEqual(reviewed);
    expect(
      reviewDecision(reviewed, 0).results[0].decisionReview,
    ).toBeUndefined();
    expect(() =>
      reviewDecision({ ...s, results: [] }, 0, "plan adekwatny"),
    ).toThrow();
    const pending = {
      ...s,
      situationChoice: {
        index: 1,
        title: "Strzelam kulę rywala",
        mode: "shoot" as const,
      },
    };
    expect(
      parseBackup(serializeBackup({ ...emptyState, draft: pending })).draft
        ?.situationChoice,
    ).toEqual(pending.situationChoice);
  });
  it("keeps empty statistics honest and compares only sufficiently sampled conditions", () => {
    expect(dashboardEvidence(emptyState).strongest).toBeNull();
    const recent = session("shoot", 8, 6, 10);
    const sessions = [
      session("point", 7, 8),
      session("point", 7, 8),
      recent,
      session("shoot", 8, 6, 2),
    ];
    const result = dashboardEvidence(
      { ...emptyState, sessions },
      new Date("2026-10-12"),
    );
    expect(result.recent[0].id).toBe(recent.id);
    expect(result.strongest?.rate).toBe(80);
    expect(result.weakest?.rate).toBe(60);
    expect(result.progress).toBeNull();
    const improving = Array.from({ length: 10 }, (_, i) =>
      session("point", 7, i < 5 ? 4 : 8, i + 1),
    );
    expect(
      dashboardEvidence(
        { ...emptyState, sessions: improving },
        new Date("2026-10-12"),
      ).progress?.trend?.delta,
    ).toBe(40);
  });
});
