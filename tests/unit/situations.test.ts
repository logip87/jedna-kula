import { describe, it, expect } from "vitest";
import {
  emptyState,
  choices,
  stats,
  type State,
  type Session,
} from "../../src/domain";
import { tacticCases } from "../../src/features/adventure/data";
import { missionKey } from "../../src/features/adventure/model";
import {
  advanceMatch,
  awardSituations,
  bossProgress,
  challengePassed,
  chooseMatch,
  createBoss,
  createExtraChallenge,
  matchScore,
  startMatch,
} from "../../src/features/situations/model";
import {
  parseBackup,
  serializeBackup,
} from "../../src/features/coaching/backup";
import { awardDevelopment } from "../../src/features/development/model";
function junior(length: 10 | 15 | 20 = 20): State {
  const config = { audience: "junior" as const, length };
  return {
    ...emptyState,
    adventure: {
      config,
      missionCompletions: Object.fromEntries(
        Array.from({ length }, (_, i) => [
          missionKey(config, i),
          { sessionId: `old${i}`, completedAt: "2026-10-01T10:00:00Z" },
        ]),
      ),
    },
  };
}
function complete(s: Session, hits: number): Session {
  const results = s.plan.map((p, i) => {
    const c = choices[p.mode].find((c) => c.hit === i < hits)!;
    return {
      ...p,
      id: `a${i}`,
      result: c.label,
      points: c.points,
      hit: c.hit,
      carreau: !!c.carreau,
      outside: !!c.outside,
      ...(p.mode === "lob" ? { landingHit: i < hits } : {}),
    };
  });
  return {
    ...s,
    results,
    score: results.reduce((n, a) => n + a.points, 0),
    completedAt: new Date().toISOString(),
  };
}
describe("P2 matches", () => {
  it("generates six unique persistent scenarios and preserves an existing draft", () => {
    const s = startMatch(emptyState, [10, 11]);
    expect(new Set(s.situations!.matchDraft!.scenarios).size).toBe(6);
    expect(parseBackup(serializeBackup(s))).toEqual(s);
    expect(startMatch(s)).toBe(s);
    expect(() => startMatch(emptyState, [13, 0])).toThrow();
  });
  it("requires a valid decision, keeps the first choice and permits points on only one side", () => {
    const s = startMatch(emptyState);
    expect(() => advanceMatch(s, 1, 0)).toThrow();
    expect(() => chooseMatch(s, 5)).toThrow();
    const chosen = chooseMatch(s, 1);
    expect(chooseMatch(chosen, 2)).toBe(chosen);
    expect(() => advanceMatch(chosen, 1, 1)).toThrow();
    expect(() => advanceMatch(chosen, 4, 0)).toThrow();
    const next = advanceMatch(chosen, 2, 0);
    expect(matchScore(next.situations!.matchDraft!)).toEqual([2, 0]);
    expect(next.situations!.matchDraft!.choice).toBeUndefined();
  });
  it("finishes at thirteen or after six ends and saves decisions", () => {
    const end = advanceMatch(
      chooseMatch(startMatch(emptyState, [12, 8]), 0),
      1,
      0,
    );
    expect(end.situations?.matchDraft).toBeUndefined();
    expect(end.situations?.matchHistory?.[0].completedAt).toBeTruthy();
    let s = startMatch(emptyState);
    for (let i = 0; i < 6; i++) s = advanceMatch(chooseMatch(s, i % 3), 0, 1);
    expect(s.situations!.matchHistory![0].ends).toHaveLength(6);
    expect(parseBackup(serializeBackup(s))).toEqual(s);
  });
  it("rejects duplicate scenarios, inconsistent end scores and forged completion", () => {
    const s = startMatch(emptyState),
      m = s.situations!.matchDraft!;
    expect(() =>
      parseBackup(
        serializeBackup({
          ...s,
          situations: {
            matchDraft: { ...m, scenarios: Array(6).fill("recover") },
          },
        }),
      ),
    ).toThrow();
    const chosen = chooseMatch(s, 1);
    const next = advanceMatch(chosen, 1, 0),
      d = next.situations!.matchDraft!;
    expect(() =>
      parseBackup(
        serializeBackup({
          ...next,
          situations: {
            matchDraft: { ...d, completedAt: new Date().toISOString() },
          },
        }),
      ),
    ).toThrow();
    expect(() =>
      parseBackup(
        serializeBackup({
          ...next,
          situations: {
            matchDraft: { ...d, ends: [{ ...d.ends[0], opponentPoints: 1 }] },
          },
        }),
      ),
    ).toThrow();
  });
});
describe("boss tests", () => {
  it("requires chapter missions in the selected junior path", () => {
    expect(bossProgress(emptyState, 0).unlocked).toBe(false);
    expect(() => createBoss(emptyState, 0)).toThrow();
    expect(bossProgress(junior(10), 2).available).toBe(false);
    expect(bossProgress(junior(), 3).unlocked).toBe(true);
    const s = junior();
    delete s.adventure!.missionCompletions![
      missionKey(s.adventure!.config!, 4)
    ];
    expect(bossProgress(s, 0).unlocked).toBe(false);
  });
  it("uses ten fixed junior throws, stores passed bosses and keeps badges after deletion", () => {
    const state = junior();
    for (let i = 0; i < 4; i++) {
      const draft = createBoss(state, i);
      expect(draft.plan).toHaveLength(10);
      expect(draft.plan.every((a) => a.distance <= 7)).toBe(true);
      const s = complete(draft, 6),
        next = awardSituations(state, { ...state, sessions: [s] });
      expect(challengePassed(s)).toBe(true);
      expect(bossProgress({ ...next, sessions: [] }, i).passed).toBe(true);
      expect(parseBackup(serializeBackup(next))).toEqual(next);
    }
  });
  it("does not pass incomplete or missed bosses and uses lob landing", () => {
    const s = complete(createBoss(junior(), 2), 6);
    s.results.forEach((a) => (a.landingHit = false));
    expect(challengePassed(s)).toBe(false);
    expect(challengePassed(complete(createBoss(junior(), 0), 5))).toBe(false);
    const partial = complete(createBoss(junior(), 0), 6);
    partial.results.pop();
    expect(challengePassed(partial)).toBe(false);
  });
});
describe("own challenges", () => {
  it("retains a daily attempt after deleting history and gives no XP", () => {
    const now = new Date(),
      s = complete(createExtraChallenge(emptyState, "daily", now), 1);
    const next = awardDevelopment(
      emptyState,
      awardSituations(emptyState, { ...emptyState, sessions: [s] }),
      now,
    );
    expect(next.coaching?.xpEvents).toHaveLength(0);
    expect(() =>
      createExtraChallenge({ ...next, sessions: [] }, "daily", now),
    ).toThrow();
    expect(stats(next).count).toBe(0);
    expect(parseBackup(serializeBackup(next))).toEqual(next);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    expect(createExtraChallenge(next, "daily", tomorrow).plan).toHaveLength(1);
  });
  it("requires two hits in every pressure triplet", () => {
    const s = complete(createExtraChallenge(emptyState, "pressure"), 6);
    expect(challengePassed(s)).toBe(false);
    const positions = [0, 1, 3, 4, 6, 7];
    const pass = complete(s, 9);
    pass.results.forEach((a, i) => (a.hit = positions.includes(i)));
    expect(challengePassed(pass)).toBe(true);
  });
  it("keeps junior ladder distances and rejects tampered challenge plans", () => {
    const s = createExtraChallenge(junior(), "ladder");
    expect(s.plan.map((a) => a.distance)).toEqual([
      6, 7, 6, 7, 6, 7, 6, 7, 6, 7,
    ]);
    expect(
      parseBackup(serializeBackup({ ...junior(), draft: s })).draft,
    ).toEqual(s);
    s.plan[0].distance = 10;
    expect(() =>
      parseBackup(serializeBackup({ ...junior(), draft: s })),
    ).toThrow();
  });
  it("supports legacy envelopes and twelve unique boards with alternatives", () => {
    expect(tacticCases).toHaveLength(12);
    expect(new Set(tacticCases.map((c) => c.id)).size).toBe(12);
    expect(
      tacticCases.every(
        (c) => c.options.length === 3 && c.distance && c.surface && c.shotRisk,
      ),
    ).toBe(true);
    for (const version of [2, 3])
      expect(
        parseBackup(
          JSON.stringify({ format: "jedna-kula", version, data: emptyState }),
        ),
      ).toEqual(emptyState);
  });
});
