import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("junior journey unlocks the next mission only after saving; map and recommendations use real results", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/adventure");
  await page.getByRole("button", { name: "Krótka seria", exact: true }).click();
  await page.getByRole("button", { name: "10 treningów", exact: true }).click();
  await page.getByRole("button", { name: "Zapisz wybór ścieżki" }).click();
  await expect(page.locator(".adventure-hero")).toContainText(
    "0 / 10 misji · Krótka seria",
  );
  await page.reload();
  await page.goto("/adventure/mission/2");
  await expect(
    page.getByRole("heading", { name: "Ta misja jeszcze czeka" }),
  ).toBeVisible();
  await page.goto("/adventure/mission/1");
  await page.getByRole("button", { name: "Zaczynam misję" }).click();
  await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ponad 100 cm +0 pkt", exact: true }),
  ).toBeDisabled();
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: "W lewo", exact: true }).click();
    await page
      .getByRole("button", { name: "Ponad 100 cm +0 pkt", exact: true })
      .click();
    if (i === 2) {
      await expect(page.getByText("Rzut 4 / 6", { exact: true })).toBeVisible();
      await page.reload();
      await expect(page.getByText("Rzut 4 / 6", { exact: true })).toBeVisible();
    }
  }
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("Misja zaliczona!", { exact: true }),
  ).toBeVisible();
  await page.goto("/adventure/missions");
  await expect(page.locator(".mission-passport")).toContainText("1 / 10 misji");
  await page.getByRole("link", { name: "Otwórz misję", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Poczuj długość" }),
  ).toBeVisible();
  await page.goto("/adventure/map");
  await expect(
    page.locator(".error-map [data-direction=left] strong"),
  ).toHaveText("6");
  await page
    .getByRole("combobox", { name: "Teren", exact: true })
    .selectOption("rough");
  await expect(
    page.getByRole("heading", { name: "Dodaj pierwszy ślad" }),
  ).toBeVisible();
  await page.goto("/adventure/next");
  await expect(page.getByText(/20 prób z co najmniej 2 sesji/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("tactics persist; precision resumes and follows all twenty figures to 100 points", async ({
  page,
}) => {
  await page.goto("/adventure/tactics");
  await page
    .getByRole("button", { name: "Puentuję bliżej", exact: true })
    .click();
  await expect(page.locator(".tactic-feedback")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Puentuję bliżej", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/adventure/precision");
  await page
    .getByRole("button", { name: "Rozpocznij serię 20 strzałów" })
    .click();
  for (let i = 0; i < 20; i++) {
    await expect(
      page.getByRole("heading", {
        name: new RegExp(`Figura ${Math.floor(i / 4) + 1}:`),
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Gotowy do strzału", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Rzut oddany", exact: true })
      .click();
    if (i === 16)
      await expect(page.locator(".precision-scores button")).toHaveCount(3);
    await page.getByRole("button", { name: "5 pkt", exact: true }).click();
    if (i === 3) {
      await expect(
        page.getByRole("heading", { name: "Figura 2: Kula za świnką" }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Figura 2: Kula za świnką" }),
      ).toBeVisible();
    }
  }
  await expect(
    page.getByRole("heading", { name: "100 / 100 pkt" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "100 / 100 pkt" }),
  ).toBeVisible();
  await expect(
    page.getByText("Historia strzału precyzyjnego (1)"),
  ).toBeVisible();
});
test("cooperative challenge alternates names, survives offline restart, and saves one completed game", async ({
  page,
  context,
}) => {
  await page.goto("/adventure/duel");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByLabel("Pierwsza osoba").fill("Ola");
  await page.getByLabel("Druga osoba").fill("Jan");
  await page.getByRole("button", { name: "Wspólny cel", exact: true }).click();
  await page.getByRole("button", { name: "Rozpocznij wyzwanie" }).click();
  await page
    .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Teraz: Jan" })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Teraz: Jan" })).toBeVisible();
  for (let i = 1; i < 6; i++)
    await page
      .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
      .click();
  await expect(
    page.getByRole("heading", { name: "Wspólny cel osiągnięty!" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Historia wyzwań (1)")).toBeVisible();
  await context.setOffline(false);
});
test("all five modules and journey pass accessibility and layout checks at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of [
    "/adventure",
    "/adventure/missions",
    "/adventure/mission/1",
    "/adventure/next",
    "/adventure/map",
    "/adventure/tactics",
    "/adventure/precision",
    "/adventure/duel",
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
  await page.goto("/adventure");
  await page.screenshot({
    path: "test-results/adventure-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/adventure/missions");
  await page.screenshot({
    path: "test-results/adventure-path-desktop.png",
    fullPage: true,
  });
});

test("precision preparation clock survives reload and expired rounds cannot receive a new score", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-07T12:00:00Z") });
  await page.goto("/adventure/precision");
  await page.getByLabel("Ćwicz z limitem 15 minut").check();
  await page
    .getByRole("button", { name: "Rozpocznij serię 20 strzałów" })
    .click();
  await page
    .getByRole("button", { name: "Gotowy do strzału", exact: true })
    .click();
  await page.clock.fastForward(16 * 60 * 1000);
  await expect(
    page.getByRole("heading", { name: "Limit czasu minął" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Limit czasu minął" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Rzut oddany", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Zapisz serię po czasie" }).click();
  await expect(
    page.getByRole("heading", { name: "0 / 100 pkt" }),
  ).toBeVisible();
});
