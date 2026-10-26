import { expect, test } from "@playwright/test";
import { emptyState } from "../../src/domain";
import { difficultDistances } from "../support/next-steps";
import { readStoredState, replaceStoredState } from "../support/indexeddb";

test("a mental practice cue survives reload and is consumed by only the next new technical training", async ({
  page,
}) => {
  await page.goto("/coach/practice/mental?lesson=mistake");
  await page
    .getByRole("button", { name: "Zacznij moduł", exact: true })
    .click();
  for (let i = 0; i < 4; i++) {
    await expect(
      page.getByText(`2 MIN · KROK ${i + 1} / 5`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Wykonane · następny krok", exact: true })
      .click();
  }
  await page
    .getByLabel("Wskazówka do następnej serii (opcjonalnie)")
    .selectOption("mistake");
  await expect
    .poll(
      async () =>
        (await readStoredState(page)).coaching?.practiceDraft?.cueLessonId,
    )
    .toBe("mistake");
  await page.reload();
  await expect(
    page.getByLabel("Wskazówka do następnej serii (opcjonalnie)"),
  ).toHaveValue("mistake");
  await page
    .getByRole("button", { name: "Zakończ i zapisz moduł", exact: true })
    .click();
  await expect(
    page.getByRole("region", {
      name: "Wskazówka do następnej serii",
      exact: true,
    }),
  ).toContainText("Ta kula się skończyła. Co jest teraz?");
  await page
    .getByRole("link", {
      name: "Przejdź do treningu technicznego",
      exact: true,
    })
    .click();
  await page
    .locator(".drill-grid:not(.recommendation-grid)")
    .getByRole("link", { name: /^Puenta Puenta podstawowa/ })
    .click();
  await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
  await expect(page.getByLabel("Twoja wskazówka mentalna")).toContainText(
    "Ta kula się skończyła. Co jest teraz?",
  );
  await page.reload();
  await expect(page.getByLabel("Twoja wskazówka mentalna")).toContainText(
    "Ta kula się skończyła. Co jest teraz?",
  );
  await page.screenshot({
    path: "test-results/next-steps-mental-cue.png",
    fullPage: false,
  });
  expect(
    (await readStoredState(page)).coaching?.pendingMentalCueLessonId,
  ).toBeUndefined();
  for (let i = 0; i < 6; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 6`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "31–60 cm +2 pkt", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Zakończ", exact: true }).click();
  await page.getByRole("button", { name: /^Powtórz ostatni trening:/ }).click();
  await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Twoja wskazówka mentalna")).toHaveCount(0);
});

test("the player freely chooses a distance and no longer receives a distance-change CTA", async ({
  page,
}) => {
  await page.goto("/");
  await replaceStoredState(page, {
    ...emptyState,
    sessions: difficultDistances(),
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "ŁATWIEJSZY WARIANT", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Strzał", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Odległość", exact: true })
    .selectOption("9");
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  await expect(page.locator(".session-top")).toContainText("Strzał podstawowy");
  expect((await readStoredState(page)).draft?.plan[0]).toMatchObject({
    mode: "shoot",
    distance: 9,
  });
});
