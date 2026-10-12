import { createHash } from "node:crypto";
export interface TestPlan {
  id: string;
  source: string;
  risk: string;
  route: string;
  expectedCompletedLessons: number;
  steps: string[];
}
export interface DemoReview {
  kind: "synthetic-human-review";
  status: "approved" | "pending";
  planDigest: string;
  rationale: string;
}
export const planDigest = (plan: TestPlan) =>
  createHash("sha256").update(JSON.stringify(plan)).digest("hex");
export function generateReviewedTest(plan: TestPlan, review: DemoReview) {
  if (
    review.kind !== "synthetic-human-review" ||
    review.status !== "approved" ||
    review.planDigest !== planDigest(plan) ||
    !review.rationale.trim()
  )
    throw new Error("Plan needs a matching review before generation.");
  if (
    plan.id !== "mental-completion" ||
    plan.route !== "/lessons/routine" ||
    plan.expectedCompletedLessons !== 1
  )
    throw new Error("Proposed behavior differs from the product contract.");
  return `// Generated from a reviewed synthetic plan. Do not heal expectations automatically.
import { test, expect } from '@playwright/test';
test('reviewed AI-assisted plan executes the persistence contract', { tag: ['@showcase', '@agentic'] }, async ({ page }) => {
  await page.goto(${JSON.stringify(plan.route)});
  await page.getByRole('button', { name: 'Zaliczone · zapamiętuję', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Zaliczone', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Zaliczone', exact: true })).toBeDisabled();
  await page.goto('/lessons');
  await expect(page.getByText('${plan.expectedCompletedLessons} / 25 zaliczonych', { exact: true })).toBeVisible();
});
`;
}
export interface HealerProposal {
  classification: "test-bug" | "product-bug" | "unclear";
  evidence: string;
  change: "locator-only" | "expected-behavior";
}
export function reviewHealerProposal(
  proposal: HealerProposal,
  approvedByHuman = false,
) {
  if (!proposal.evidence.trim()) throw new Error("Evidence is required.");
  if (proposal.change === "expected-behavior")
    throw new Error("Healer cannot change the product contract.");
  if (proposal.classification === "product-bug")
    return { status: "product-issue", apply: false } as const;
  if (proposal.classification === "unclear" || !approvedByHuman)
    return { status: "needs-human-review", apply: false } as const;
  // This returns a decision only; it cannot write files, relax assertions or skip a test.
  return { status: "reviewed-locator-proposal", apply: false } as const;
}
