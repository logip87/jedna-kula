import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import {
  categories,
  rules,
  sources,
  quickHelp,
  findRule,
} from "../../src/features/rules/catalog";
import { questions, newQuiz, quizScore } from "../../src/features/rules/quiz";
import {
  jackOutResult,
  normalize,
  contentVersion,
} from "../../src/features/rules/model";
import { createRepository } from "../../src/storage";
import { emptyState } from "../../src/domain";
describe("official rules catalog", () => {
  it("covers every requested category and quick help scenario with resolvable sources", () => {
    expect(categories).toHaveLength(16);
    expect(quickHelp).toHaveLength(14);
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
    for (const cat of categories.filter((c) => c.id !== "quiz"))
      expect(rules.some((r) => r.category === cat.id)).toBe(true);
    for (const item of quickHelp)
      expect(findRule(item.ruleId)?.verification).toBeUndefined();
    for (const r of rules) {
      const s = sources[r.sourceId];
      expect(s).toBeDefined();
      expect(r.sourceDocument).toBe(s.name);
      expect(r.sourceDate).toBe(s.date);
      expect(r.action.length).toBeGreaterThan(10);
      for (const extra of r.additionalSources ?? []) {
        expect(sources[extra.sourceId]).toBeDefined();
        expect(extra.article).toBeTruthy();
      }
      expect(r.verification || r.sourceArticle).toBeTruthy();
      expect(r.related?.every((id) => findRule(id)) ?? true).toBe(true);
    }
    for (const s of Object.values(sources)) {
      expect(new URL(s.url).hostname).toBe("petanque.pl");
      expect(existsSync(`public/rule-sources/${s.file}`)).toBe(true);
      expect(
        readFileSync(`public/rule-sources/${s.file}`).subarray(0, 4).toString(),
      ).toBe("%PDF");
    }
  });
  it("never grades unverified content and has at least thirty practical questions", () => {
    expect(questions.length).toBeGreaterThanOrEqual(30);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(findRule(q.ruleId)?.verification).toBeUndefined();
      expect(findRule(q.ruleId)).toBeDefined();
      expect(q.correct).toBeLessThan(q.options.length);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.explanation).toBeTruthy();
    }
  });
  it("handles all three dead-jack branches regardless of balls already on the court", () => {
    expect(jackOutResult("both", 4).points).toBe(0);
    expect(jackOutResult("none", 0).points).toBe(0);
    expect(jackOutResult("one", 2).points).toBe(2);
    expect(jackOutResult("one", 6).points).toBe(6);
  });
  it("supports searches without Polish diacritics", () => {
    expect(normalize("Świnka, KÓŁKO i mierzenie")).toBe(
      "swinka, kolko i mierzenie",
    );
  });
  it("saves a shuffled round and computes only answered correct choices", async () => {
    const progress = newQuiz(5);
    expect(progress.ids).toHaveLength(5);
    expect(new Set(progress.ids).size).toBe(5);
    expect(progress.version).toBe(contentVersion);
    expect(quizScore(progress)).toBe(0);
    const q = questions.find((q) => q.id === progress.ids[0])!;
    progress.answers[q.id] = q.correct;
    expect(quizScore(progress)).toBe(1);
    const repo = createRepository("rules-quiz-test");
    await repo.save({ ...emptyState, rulesQuiz: progress });
    expect((await repo.load()).rulesQuiz).toEqual(progress);
  });
});
