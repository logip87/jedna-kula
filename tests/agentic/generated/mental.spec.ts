// Generated from a reviewed synthetic plan. Do not heal expectations automatically.
import { test, expect } from "@playwright/test";
test(
  "reviewed AI-assisted plan executes the persistence contract",
  { tag: ["@showcase", "@agentic"] },
  async ({ page }) => {
    await page.goto("/lessons/routine");
    await page
      .getByRole("button", { name: "Zaliczone · zapamiętuję", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Zaliczone", exact: true }),
    ).toBeDisabled();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Zaliczone", exact: true }),
    ).toBeDisabled();
    await page.goto("/lessons");
    await expect(
      page.getByText("1 / 31 zaliczonych", { exact: true }),
    ).toBeVisible();
  },
);
