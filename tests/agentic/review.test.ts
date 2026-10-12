import { it, expect } from "vitest";
import {
  generateReviewedTest,
  planDigest,
  reviewHealerProposal,
  type TestPlan,
  type DemoReview,
} from "../support/agentic-workflow";
import planData from "../fixtures/agentic-plan.json";
it("unreviewed plans and expectation-healing are blocked; product failures remain product issues", () => {
  const plan: TestPlan = structuredClone(planData);
  const pending: DemoReview = {
    kind: "synthetic-human-review",
    status: "pending",
    planDigest: planDigest(plan),
    rationale: "Fixture review, not real approval",
  };
  expect(() => generateReviewedTest(plan, pending)).toThrow("review");
  expect(() =>
    generateReviewedTest(
      { ...plan, expectedCompletedLessons: 0 },
      { ...pending, status: "approved" },
    ),
  ).toThrow("review");
  const changed = { ...plan, expectedCompletedLessons: 0 };
  expect(() =>
    generateReviewedTest(changed, {
      ...pending,
      status: "approved",
      planDigest: planDigest(changed),
    }),
  ).toThrow("product contract");
  const locator = {
    classification: "test-bug" as const,
    evidence: "Trace shows a renamed control, behavior is unchanged.",
    change: "locator-only" as const,
  };
  expect(reviewHealerProposal(locator)).toEqual({
    status: "needs-human-review",
    apply: false,
  });
  expect(reviewHealerProposal(locator, true)).toEqual({
    status: "reviewed-locator-proposal",
    apply: false,
  });
  expect(
    reviewHealerProposal({ ...locator, classification: "product-bug" }, true),
  ).toEqual({ status: "product-issue", apply: false });
  expect(() =>
    reviewHealerProposal({ ...locator, change: "expected-behavior" }, true),
  ).toThrow("product contract");
});
