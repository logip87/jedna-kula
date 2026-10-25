import { expect, test } from "@playwright/test";
import { fixedTime } from "../support/data";
import { beginTraining } from "../support/training";

test.describe(
  "Reviewed mobile layout baselines",
  { tag: ["@showcase", "@visual"] },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date(fixedTime));
      await page.emulateMedia({ reducedMotion: "reduce" });
    });

    test("home at the smallest supported phone", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Dzisiaj", exact: true }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot("home-mobile-320.png", {
        fullPage: false,
      });
    });

    test("active pointing training on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");
      await page.getByRole("button", { name: "Później", exact: true }).click();
      await beginTraining(page);
      await expect(page).toHaveScreenshot("active-training-mobile-390.png", {
        fullPage: false,
      });
    });

    for (const width of [320, 390]) {
      test(`bottom navigation with every active tab at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto("/");
        const navigation = page.locator(".bottom-nav");
        for (const [index, label] of [
          "Dzisiaj",
          "Trening",
          "Mecz",
          "Postęp",
          "Więcej",
        ].entries()) {
          const link = navigation.getByRole("link", {
            name: label,
            exact: true,
          });
          await link.click();
          await expect(link).toHaveAttribute("aria-current", "page");
          await expect(navigation).toHaveScreenshot(
            `bottom-nav-${width}-active-${index + 1}.png`,
          );
        }
      });
    }
  },
);
