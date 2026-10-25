import { test, expect } from "@playwright/test";
import { beginTraining } from "../support/training";
import { fixedTime } from "../support/data";
test.describe(
  "Reviewed visual baselines",
  { tag: ["@showcase", "@visual"] },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date(fixedTime));
      await page.emulateMedia({ reducedMotion: "reduce" });
    });
    test("empty dashboard with deterministic viewport", async ({ page }) => {
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Dzisiaj", exact: true }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot("dashboard.png");
    });
    test("first pointing attempt exposes score controls and routine", async ({
      page,
    }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Później", exact: true }).click();
      await beginTraining(page);
      await expect(page).toHaveScreenshot("active-pointing.png");
    });
  },
);
