import { expect, test } from "@playwright/test";
import { fixedTime } from "../support/data";
import { beginTraining } from "../support/training";
import {
  checkNavigation,
  expectNoHorizontalOverflow,
} from "../support/ui-layout";

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 393, height: 873 },
  { width: 412, height: 915 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
test.describe(
  "Responsive navigation geometry",
  { tag: ["@showcase", "@layout"] },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date(fixedTime));
      await page.emulateMedia({ reducedMotion: "reduce" });
    });

    for (const viewport of viewports) {
      test.describe(`${viewport.width} × ${viewport.height}`, () => {
        test.use({
          viewport,
          deviceScaleFactor: 1,
          isMobile: viewport.width <= 430,
          hasTouch: viewport.width <= 820,
        });
        test("all primary tabs keep their geometry and fit the viewport", async ({
          page,
        }) => {
          await page.goto("/");
          await expect(
            page.getByRole("heading", { name: "Dzisiaj", exact: true }),
          ).toBeVisible();
          await checkNavigation(page, viewport.width <= 760);
        });
      });
    }

    test("mobile landscape keeps every tab reachable", async ({ page }) => {
      await page.setViewportSize({ width: 568, height: 320 });
      await page.goto("/");
      await checkNavigation(page, true);
    });

    test("more-page icons stay centered inside their tiles", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto("/more");

      const icon = page
        .locator(".more-links")
        .getByRole("link", { name: "Mecz", exact: true })
        .locator(".icon-box > svg");

      await expect(icon).toHaveCSS("margin-left", "0px");
      await expect(icon).toHaveCSS("margin-right", "0px");
    });

    test("125% zoom on a narrow viewport keeps navigation and content usable", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto("/");
      await page.evaluate(() => {
        document.documentElement.style.zoom = "1.25";
      });
      await checkNavigation(page, true);
    });

    test("active training controls fit the smallest phone and have touch targets", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await beginTraining(page);
      await expect(page.locator(".bottom-nav")).toHaveCount(0);
      await expectNoHorizontalOverflow(page);
      for (const button of await page.locator("main button:visible").all()) {
        const box = await button.boundingBox();
        expect(box!.width, await button.innerText()).toBeGreaterThanOrEqual(44);
        expect(box!.height, await button.innerText()).toBeGreaterThanOrEqual(
          44,
        );
      }
    });
  },
);
