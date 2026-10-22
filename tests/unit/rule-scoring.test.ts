import { expect, it } from "vitest";
import { questions } from "../../src/features/rules/quiz";
import {
  correctRuleAnswers,
  ruleAnswerKey,
} from "../../src/features/rules/answer-key";
import {
  awardDevelopment,
  skillScores,
} from "../../src/features/development/model";
import { emptyState } from "../../src/domain";

it("uses the same canonical scoring key for every quiz question and ignores unknown answers", () => {
  expect(questions.map((q) => q.id).sort()).toEqual(
    Object.keys(ruleAnswerKey).sort(),
  );
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  for (const q of questions) {
    expect(q.correct).toBe(ruleAnswerKey[q.id]);
    expect(q.options[q.correct]).toBeTruthy();
    expect(correctRuleAnswers({ [q.id]: q.correct })).toBe(1);
    expect(
      correctRuleAnswers({ [q.id]: (q.correct + 1) % q.options.length }),
    ).toBe(0);
  }
  expect(correctRuleAnswers({ unknown: 0 })).toBe(0);
  expect(correctRuleAnswers({})).toBe(0);
});
it("preserves progress and the single existing XP award when the third answer becomes correct", () => {
  const answers = Object.fromEntries(
    questions.slice(0, 3).map((q) => [q.id, q.correct]),
  );
  const next = {
    ...emptyState,
    rulesQuiz: {
      version: "1",
      ids: Object.keys(answers),
      answers,
      currentIndex: 2,
      startedAt: "2026-10-22T10:00:00Z",
    },
  };
  expect(skillScores(next).find((s) => s.id === "tactics")?.samples).toBe(3);
  const awarded = awardDevelopment(emptyState, next);
  expect(
    awarded.coaching?.xpEvents?.filter((e) => e.kind === "quiz"),
  ).toHaveLength(1);
  expect(awardDevelopment(awarded, awarded).coaching?.xpEvents).toEqual(
    awarded.coaching?.xpEvents,
  );
});
