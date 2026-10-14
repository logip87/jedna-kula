import { devices, expect, test } from "@playwright/test";
import { fixedTime } from "../support/data";
import {
  geometry,
  expectEqualBottomNavigation,
  expectNoHorizontalOverflow,
  checkNavigation,
} from "../support/ui-layout";

test.use({
  ...devices["iPhone 13"],
  browserName: "webkit",
  deviceScaleFactor: 1,
  viewport: { width: 390, height: 844 },
});

test.describe(
  "iPhone safe-area simulation",
  { tag: ["@showcase", "@layout"] },
  () => {
    test("top, bottom and asymmetric side insets leave controls clear", async ({
      page,
    }) => {
      await page.clock.setFixedTime(new Date(fixedTime));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      const navigation = page.locator(".bottom-nav");
      await expect(navigation).toBeVisible();
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
        "content",
        /viewport-fit=cover/,
      );
      const initial = await geometry(navigation);
      const initialTopbar = await page.locator(".topbar").boundingBox();
      const initialContentPadding = await page
        .locator("main")
        .evaluate((main) => parseFloat(getComputedStyle(main).paddingBottom));

      // WebKit's device emulation reports zero env() insets. Replace only the
      // browser-provided values in the application's own stylesheet, preserving
      // its layout rules. This exercises simulated insets, not physical hardware.
      const insetStyles = await page.evaluate(() =>
        [...document.styleSheets]
          .flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText))
          .join("\n"),
      );
      expect(insetStyles).toContain("env(safe-area-inset-bottom");
      expect(insetStyles).toContain("env(safe-area-inset-top");
      await page.addStyleTag({
        content: `:root {
        --test-safe-top: 44px;
        --test-safe-right: 24px;
        --test-safe-bottom: 32px;
        --test-safe-left: 0px;
      }\n${insetStyles.replace(
        /env\(\s*safe-area-inset-(top|right|bottom|left)(?:\s*,\s*[^)]*)?\s*\)/g,
        "var(--test-safe-$1, 0px)",
      )}`,
      });

      const insetNavigation = await geometry(navigation);
      expectEqualBottomNavigation(insetNavigation);
      expect(insetNavigation.box.height).toBeCloseTo(
        initial.box.height + 32,
        2,
      );
      expect(insetNavigation.box.y + insetNavigation.box.height).toBeCloseTo(
        844,
        2,
      );
      expect(insetNavigation.paddingLeft).toBe(24);
      expect(insetNavigation.paddingRight).toBe(24);
      insetNavigation.items.forEach((item, index) => {
        expect(item.box.height).toBe(initial.items[index].box.height);
        expect(item.icon.width).toBe(initial.items[index].icon.width);
      });
      const bottomPadding = await navigation.evaluate((nav) =>
        parseFloat(getComputedStyle(nav).paddingBottom),
      );
      expect(bottomPadding).toBeGreaterThanOrEqual(32);
      const lastItem = insetNavigation.items.at(-1)!.box;
      expect(lastItem.y + lastItem.height).toBeLessThanOrEqual(844 - 32);
      const topbar = await page.locator(".topbar").boundingBox();
      expect(topbar!.height).toBeCloseTo(initialTopbar!.height + 44, 2);
      const brand = await page.locator(".mobile-brand").boundingBox();
      expect(brand!.y).toBeGreaterThanOrEqual(44);
      expect(brand!.x + brand!.width).toBeLessThanOrEqual(390 - 24);
      const contentPadding = await page
        .locator("main")
        .evaluate((main) => parseFloat(getComputedStyle(main).paddingBottom));
      expect(contentPadding).toBeCloseTo(initialContentPadding + 32, 2);
      await expectNoHorizontalOverflow(page);
      await checkNavigation(page, true);
    });
  },
);
