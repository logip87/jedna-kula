import { test, expect } from "@playwright/test";
import { emptyState } from "../../src/domain";
import { missionKey } from "../../src/features/adventure/model";
test("match decisions resume offline and thirteen points saves a complete history", async ({
  page,
  context,
}) => {
  await page.goto("/coach/match");
  await page
    .getByRole("combobox", { name: "Twoje punkty", exact: true })
    .selectOption("12");
  await page
    .getByRole("combobox", { name: "Punkty rywala", exact: true })
    .selectOption("10");
  await page
    .getByRole("button", { name: "Zacznij trening meczowy", exact: true })
    .click();
  await expect(page.getByText("Wynik 12 : 10", { exact: true })).toBeVisible();
  await page.locator(".tactic-options button").first().click();
  await expect(
    page.getByRole("heading", { name: "Wynik rozgrywki", exact: true }),
  ).toBeVisible();
  const decision = await page
    .locator(".tactic-feedback .eyebrow")
    .textContent();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".tactic-feedback .eyebrow")).toHaveText(decision!);
  await expect(page.locator(".tactic-options button").first()).toBeDisabled();
  await page
    .getByRole("button", { name: "Zapisz rozgrywkę", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Ostatni trening zapisany",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/wynik 13 : 10/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/wynik 13 : 10/)).toBeVisible();
});
test("junior chapter boss uses one chance and retains its completion", async ({
  page,
}) => {
  const config = { audience: "junior" as const, length: 10 as const };
  const data = {
    ...emptyState,
    adventure: {
      config,
      missionCompletions: Object.fromEntries(
        Array.from({ length: 5 }, (_, i) => [
          missionKey(config, i),
          { sessionId: `before${i}`, completedAt: "2026-10-01T10:00:00Z" },
        ]),
      ),
    },
  };
  await page.goto("/settings");
  await page.getByLabel("Wybierz kopię").setInputFiles({
    name: "old.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await page
    .getByRole("button", { name: "Tak, zastąp dane kopią", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Kopia przywrócona");
  await page.goto("/coach/boss");
  await expect(
    page
      .getByRole("button", {
        name: "Zacznij Sprawdzian rozdziału",
        exact: true,
      })
      .nth(1),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Zacznij Sprawdzian rozdziału", exact: true })
    .first()
    .click();
  for (let i = 0; i < 10; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 10`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cofnij ostatni rzut" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: i < 6 ? "W celu +1 pkt" : "Poza celem +0 pkt",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Sprawdzian rozdziału: cel osiągnięty!",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.goto("/coach/boss");
  await expect(page.getByText(/SPRAWDZIAN ZALICZONY ✓/)).toBeVisible();
});
test("daily one-ball challenge persists and cannot be repeated or reward XP", async ({
  page,
}) => {
  await page.goto("/coach/extras");
  await page
    .getByRole("button", { name: "Zacznij: Jedna kula dnia", exact: true })
    .click();
  await expect(page.getByText("Rzut 1 / 1", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "W celu +1 pkt", exact: true })
    .click();
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.goto("/coach/extras");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Zacznij: Jedna kula dnia", exact: true }),
  ).toBeDisabled();
  await page.goto("/coach/development");
  await expect(
    page.getByRole("heading", { name: "Poziom 1 · 0 XP", exact: true }),
  ).toBeVisible();
});
test("all twelve tactic boards and P2 screens fit phones and pass WCAG checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.setViewportSize({ width: 320, height: 720 });
  for (const path of [
    "/coach/match",
    "/coach/boss",
    "/coach/extras",
    "/adventure/tactics",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      path,
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
      path,
    ).toEqual([]);
  }
  await expect(page.getByLabel("Sytuacja").locator("option")).toHaveCount(12);
  for (const id of await page
    .getByLabel("Sytuacja")
    .locator("option")
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLOptionElement).value))) {
    await page.getByLabel("Sytuacja").selectOption(id);
    await page.locator(".tactic-options button").first().click();
    await expect(page.locator(".tactic-feedback")).toContainText(
      "Alternatywa:",
    );
    await expect(page.locator(".tactic-feedback")).toContainText("TWÓJ PLAN");
  }
  await page.screenshot({
    path: "test-results/p2-tactics-320.png",
    fullPage: true,
  });
  await page.goto("/coach/match");
  await page
    .getByRole("button", { name: "Zacznij trening meczowy", exact: true })
    .click();
  await expect(page.locator(".tactic-options")).toBeVisible();
  await page.locator(".tactic-options button").first().click();
  await expect(
    page.getByRole("heading", { name: "Wynik rozgrywki", exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    path: "test-results/p2-match-320.png",
    fullPage: true,
  });
});
