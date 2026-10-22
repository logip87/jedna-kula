import { test, expect } from "@playwright/test";
import { cachedApp } from "../support/training";

test.describe("foreground startup", () => {
  test.use({ serviceWorkers: "block" });
  test("starts within the JS budget and loads secondary screens on demand", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Dzisiaj", exact: true }),
    ).toBeVisible();
    const resources = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((r) => r.name.endsWith(".js"))
        .map((r) => ({
          name: r.name,
          bytes: (r as PerformanceResourceTiming).encodedBodySize,
        })),
    );
    expect(resources.reduce((sum, r) => sum + r.bytes, 0)).toBeLessThan(
      475_000,
    );
    expect(
      resources.some((r) => /\/(Rules|Adventure|screens)-/.test(r.name)),
    ).toBe(false);
    await page.getByRole("link", { name: "Więcej", exact: true }).click();
    await page.getByRole("link", { name: "Zasady", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Zasady gry", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .some((r) => /\/Rules-/.test(r.name)),
      ),
    ).toBe(true);
  });
  test("a failed screen download keeps navigation usable and can recover", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Dzisiaj", exact: true }),
    ).toBeVisible();
    const chunk = /\/assets\/screens-.*\.js$/;
    await page.route(chunk, (route) => route.abort());
    await page.getByRole("link", { name: "Twój profil", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText(
      "Nie udało się otworzyć ekranu",
    );
    await expect(
      page.getByRole("navigation", { name: "Nawigacja główna" }),
    ).toBeVisible();
    await page.unroute(chunk);
    await page
      .getByRole("button", { name: "Spróbuj ponownie", exact: true })
      .click();
    await expect(page.getByLabel("Jak masz na imię?")).toBeVisible();
  });
});

test(
  "all deferred modules can be opened for the first time offline after caching only Today",
  { tag: ["@showcase", "@pwa"] },
  async ({ page, context }) => {
    await cachedApp(page);
    await context.setOffline(true);
    const screens = [
      ["/rules/quiz", "Quiz z zasad"],
      ["/training", "Wybierz trening"],
      ["/lessons", "Trening mentalny"],
      ["/adventure", "Plan treningowy"],
      ["/adventure/precision", "20 strzałów"],
      ["/adventure/duel", "We dwoje"],
      ["/coach/match", "Tryb meczowy"],
      ["/coach/development", "Mój rozwój"],
      ["/coach/generator", "Generator treningu"],
      ["/feedback", "Zgłoś pomysł / problem"],
    ];
    for (const [path, heading] of screens) {
      const freshPage = await context.newPage();
      await freshPage.goto(path);
      await expect(
        freshPage.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
      await freshPage.close();
    }
  },
);
