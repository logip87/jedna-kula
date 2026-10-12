import { test, expect } from "@playwright/test";

test("five competencies, three levels and practical exercises keep lesson progress offline", async ({
  page,
  context,
}) => {
  await page.goto("/lessons");
  for (const name of [
    "Koncentracja",
    "Reset",
    "Presja",
    "Pewność gry",
    "Zawodnik kompletny",
  ])
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await expect(page.locator(".lesson-card")).toHaveCount(25);
  await page
    .getByLabel("Kompetencja", { exact: true })
    .selectOption("complete");
  await page
    .getByLabel("Poziom mentalny", { exact: true })
    .selectOption("advanced");
  await expect(page.locator(".lesson-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".lesson-card")).toHaveCount(1);
  await page.getByRole("link", { name: /Przygotowanie przed meczem/ }).click();
  await page.getByRole("button", { name: "Zaliczone · zapamiętuję" }).click();
  await expect(
    page.getByRole("button", { name: "Zaliczone", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Zaliczone", exact: true }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Wykonaj ćwiczenie mentalne" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Przygotowanie przed meczem",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Zacznij moduł", exact: true }),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Zacznij moduł", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Wykonane · następny krok", exact: true })
    .click();
  // The next step appears only after save completes; do not reload mid-transaction.
  await expect(page.getByText("2 MIN · KROK 2 / 4", { exact: true })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/KROK 2 \/ 4/)).toBeVisible();
  for (let i = 0; i < 2; i++) {
    await page
      .getByRole("button", { name: "Wykonane · następny krok", exact: true })
      .click();
    await expect(
      page.getByText(`2 MIN · KROK ${i + 3} / 4`, { exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Zakończ i zapisz moduł", exact: true })
    .click();
  await expect(page.getByText(/Ostatni moduł zapisany:/)).toBeVisible();
  await page.goto("/lessons");
  await expect(
    page.getByText("1 / 25 zaliczonych", { exact: true }),
  ).toBeVisible();
});

test("adult and junior profiles use the same features and optional age survives restart", async ({
  page,
}) => {
  await page.goto("/profile");
  await expect(
    page.getByLabel("Wiek (opcjonalnie)", { exact: true }),
  ).toHaveValue("");
  await page.getByLabel("Jak masz na imię?").fill("Gracz klubowy");
  await expect(page.getByLabel("Poziom gry").locator("option")).toHaveCount(4);
  await page.getByLabel("Poziom gry").selectOption("tournament");
  await page.getByLabel("Preferowana rola").selectOption("middle");
  await page.getByRole("button", { name: "Zapisz profil" }).click();
  await expect(page.getByRole("status")).toHaveText("Profil zapisany.");
  await page.reload();
  await expect(
    page.getByLabel("Wiek (opcjonalnie)", { exact: true }),
  ).toHaveValue("");
  await expect(page.getByLabel("Poziom gry")).toHaveValue("tournament");
  await page.getByLabel("Wiek (opcjonalnie)", { exact: true }).fill("11");
  await page.getByRole("button", { name: "Zapisz profil" }).click();
  await expect(page.getByRole("status")).toHaveText("Profil zapisany.");
  await page.goto("/training/shoot-basic");
  await expect(
    page
      .getByRole("combobox", { name: "Odległość", exact: true })
      .locator("option"),
  ).toHaveCount(5);
  await page.goto("/coach/practice/mental");
  await page
    .getByLabel("Poziom mentalny", { exact: true })
    .selectOption("advanced");
  await expect(
    page.getByRole("button", { name: "Zacznij moduł", exact: true }),
  ).toHaveCount(6);
});

test("all match situations support persisted choice, throw and optional independent review", async ({
  page,
}) => {
  await page.goto("/training/situation");
  await expect(
    page.getByLabel("Sytuacja meczowa").locator("option"),
  ).toHaveCount(8);
  await page.getByLabel("Sytuacja meczowa").selectOption("last-ball");
  await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
  await expect(
    page.getByText("Ostatnia kula w menie. Co robisz?", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Strzelam kulę rywala", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Strzelam kulę rywala", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Strzelam kulę rywala", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Pudło +0 pkt", exact: true }).click();
  await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
  await expect(page.locator(".cue")).toHaveText("„Reset i następne zadanie.”");
  await page
    .getByLabel(/Rzut 1:.*ocena decyzji/)
    .selectOption("plan adekwatny");
  await expect(page.getByLabel(/Rzut 1:.*ocena decyzji/)).toHaveValue(
    "plan adekwatny",
  );
  await page.reload();
  await expect(page.getByLabel(/Rzut 1:.*ocena decyzji/)).toHaveValue(
    "plan adekwatny",
  );
  await page
    .getByRole("button", { name: "Zakończ trening", exact: true })
    .click();
  await page.getByRole("link", { name: "Podsumuj trening" }).click();
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel(/Rzut 1:.*ocena decyzji/)).toHaveValue(
    "plan adekwatny",
  );
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Wyniki treningowe" }),
  ).toContainText("Co robisz?");
});

test("mental filters and the four-step routine fit a narrow phone and desktop", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/lessons",
      "/lessons/routine",
      "/coach/practice/mental",
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.goto("/lessons");
    await page.screenshot({
      path: `test-results/mental-${width}.png`,
      fullPage: true,
    });
  }
});
