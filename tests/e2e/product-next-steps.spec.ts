import { expect, test } from "@playwright/test";
import { emptyState } from "../../src/domain";
import { difficultDistances, nextStepSeries } from "../support/next-steps";
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
  ).toContainText("Reset i następne zadanie.");
  await page
    .getByRole("link", {
      name: "Przejdź do treningu technicznego",
      exact: true,
    })
    .click();
  await page.getByRole("link", { name: /^Puenta Puenta podstawowa/ }).click();
  await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
  await expect(page.getByLabel("Twoja wskazówka mentalna")).toContainText(
    "Reset i następne zadanie.",
  );
  await page.reload();
  await expect(page.getByLabel("Twoja wskazówka mentalna")).toContainText(
    "Reset i następne zadanie.",
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

test("a wider difficulty proposal starts the affected skill only after explicit acceptance", async ({
  page,
}) => {
  await page.goto("/");
  await replaceStoredState(page, {
    ...emptyState,
    sessions: [
      ...difficultDistances(),
      ...[11, 12, 13].map((day) => nextStepSeries("point", 6, 12, day)),
    ],
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Puenta 6 m", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Po 3 ostatnie pełne serie na każdym z 2 dystansów/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  await expect(page.locator(".session-top")).toContainText("Puenta podstawowa");
  expect((await readStoredState(page)).draft?.plan[0]).toMatchObject({
    mode: "point",
    distance: 6,
  });
  // Return to the controlled saved history to exercise the alternative action.
  await page.goto("/");
  const saved = await readStoredState(page);
  await replaceStoredState(page, { ...saved, draft: null });
  await page.reload();
  await page
    .getByRole("button", { name: "ŁATWIEJSZY WARIANT", exact: true })
    .click();
  await expect(page.getByText("Rzut 1 / 20", { exact: true })).toBeVisible();
  await expect(page.locator(".session-top")).toContainText("Strzał podstawowy");
  const draft = (await readStoredState(page)).draft!;
  expect(draft).toMatchObject({
    drillId: "shoot-basic",
    surface: "gravel",
    targetSize: 50,
  });
  expect(draft.plan.every((a) => a.mode === "shoot" && a.distance === 6)).toBe(
    true,
  );
  await page.reload();
  await expect(page.locator(".distance")).toContainText("6 m");
  await page.screenshot({
    path: "test-results/next-steps-easier-training.png",
    fullPage: false,
  });
});
