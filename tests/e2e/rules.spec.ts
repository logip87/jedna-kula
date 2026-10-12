import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("main navigation, search, quick help and jack decision at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByRole("link", { name: "Więcej", exact: true }).click();
  await page.getByRole("link", { name: "Zasady", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Zasady gry", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".rules-category")).toHaveCount(16);
  await page.getByLabel("Znajdź zasadę").fill("świnka na aucie?");
  await expect(
    page.getByRole("link", { name: /Świnka wypadła na aut/ }),
  ).toBeVisible();
  await page.getByLabel("Znajdź zasadę").fill("65 mm");
  await page.getByRole("link", { name: /Wyjątek: kule 65 mm/ }).click();
  await expect(page.getByText(/Sam wiek dziecka/)).toBeVisible();
  await page.goto("/rules/quick");
  await expect(page.locator(".quick-help-grid a")).toHaveCount(14);
  await page.getByRole("link", { name: /świnka wypada na aut/ }).click();
  await page.getByRole("button", { name: "Tylko jednej", exact: true }).click();
  await page.getByLabel("Ile kul ma ta drużyna?").selectOption("4");
  await expect(page.locator(".jack-result")).toContainText("4 pkt");
  await page.getByRole("button", { name: "Żadnej", exact: true }).click();
  await expect(page.locator(".jack-result")).toContainText("0 pkt");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/rules-jack-mobile.png",
    fullPage: true,
  });
});
test("quiz persists answer and feedback after reload and completes a round", async ({
  page,
}) => {
  await page.goto("/rules/quiz");
  await page.getByRole("button", { name: "Szybka runda · 5 pytań" }).click();
  await page.locator(".quiz-options button").first().click();
  await expect(page.locator(".quiz-feedback")).toBeVisible();
  const question = await page.locator(".quiz-question").textContent();
  await page.reload();
  await expect(page.locator(".quiz-question")).toHaveText(question!);
  await expect(page.locator(".quiz-feedback")).toBeVisible();
  await expect(page.locator(".quiz-options button").first()).toBeDisabled();
  for (let i = 0; i < 5; i++) {
    if (i > 0) await page.locator(".quiz-options button").first().click();
    await page
      .getByRole("button", {
        name: i === 4 ? "Zobacz wynik" : "Następne pytanie",
      })
      .click();
  }
  await expect(page.getByText("RUNDA ZAKOŃCZONA")).toBeVisible();
  await expect(page.locator(".quiz-review")).toHaveCount(5);
  await page.reload();
  await expect(page.getByText("RUNDA ZAKOŃCZONA")).toBeVisible();
});
test("rules, sources and quiz work offline; all catalog screens fit and pass axe", async ({
  page,
  context,
}) => {
  await page.goto("/rules");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  for (const route of [
    "/rules",
    "/rules/category/out",
    "/rules/category/shooting",
    "/rules/rule/junior-boules",
    "/rules/quick",
    "/rules/quiz",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  const status = await page.evaluate(async () => {
    const response = await fetch("/rule-sources/MPStrzal.pdf");
    return {
      status: response.status,
      header: new TextDecoder().decode(
        (await response.arrayBuffer()).slice(0, 4),
      ),
    };
  });
  expect(status).toEqual({ status: 200, header: "%PDF" });
  await page.getByRole("button", { name: "Szybka runda · 5 pytań" }).click();
  await page.locator(".quiz-options button").first().click();
  await expect(page.locator(".quiz-feedback")).toBeVisible();
  await page.reload();
  await expect(page.locator(".quiz-feedback")).toBeVisible();
  await context.setOffline(false);
});
