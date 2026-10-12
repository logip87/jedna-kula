import { readFile, writeFile } from "node:fs/promises";
import { format } from "prettier";
import {
  generateReviewedTest,
  type TestPlan,
  type DemoReview,
} from "../tests/support/agentic-workflow.ts";
const plan = JSON.parse(
  await readFile("tests/fixtures/agentic-plan.json", "utf8"),
) as TestPlan;
const review = JSON.parse(
  await readFile("tests/fixtures/agentic-review.json", "utf8"),
) as DemoReview;
const source = await format(generateReviewedTest(plan, review), {
  parser: "typescript",
});
const target = "tests/agentic/generated/mental.spec.ts";
if (process.argv.includes("--check")) {
  if ((await readFile(target, "utf8")) !== source)
    throw new Error(
      "Generated test differs from the reviewed plan. Regenerate and review the diff.",
    );
  process.stdout.write("Reviewed generated artifact matches its plan.\n");
} else {
  await writeFile(target, source);
  process.stdout.write(
    `Candidate written to ${target}; human PR review is still required.\n`,
  );
}
