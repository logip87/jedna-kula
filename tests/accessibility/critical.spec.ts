import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { beginTraining } from "../support/training";
async function audit(page: import("@playwright/test").Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    result.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    ),
  ).toEqual([]);
}
test.describe("Critical accessibility", { tag: ["@showcase", "@a11y"] }, () => {
  test("dashboard exposes names and skip link moves keyboard focus to main content", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Dzisiaj", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Przejdź do treści", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    await expect(
      page.getByRole("button", { name: "ZACZNIJ TRENING", exact: true }),
    ).toBeVisible();
    await audit(page);
  });
  test("throw results and mental lesson completion have accessible controls and keyboard activation", async ({
    page,
  }) => {
    await beginTraining(page);
    const result = page.getByRole("button", {
      name: "0–30 cm +3 pkt",
      exact: true,
    });
    await result.focus();
    await expect(result).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
    await audit(page);
    await page.goto("/lessons/routine");
    const completion = page.getByRole("button", {
      name: "Zaliczone · zapamiętuję",
      exact: true,
    });
    await completion.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "Zaliczone", exact: true }),
    ).toBeDisabled();
    await audit(page);
  });
});
