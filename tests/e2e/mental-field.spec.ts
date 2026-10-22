import { test, expect } from "@playwright/test";
import { readStoredState, replaceStoredState } from "../support/indexeddb";

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 1000 },
]) {
  test(`lesson to field task and reflection persists offline at ${viewport.width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/lessons");
    await expect(
      page.getByRole("link", { name: "Otwórz temat" }),
    ).toBeVisible();
    await expect(page.locator(".lesson-card").first()).not.toBeVisible();
    await page.goto("/lessons/one");
    await page
      .getByRole("button", { name: "Wybierz zadanie na boisko", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Zadanie wybrane do następnego treningu",
      }),
    ).toBeDisabled();
    await page.reload();
    await expect(
      page.getByRole("button", {
        name: "Zadanie wybrane do następnego treningu",
      }),
    ).toBeDisabled();
    await page.goto("/training/point-basic");
    await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
    await expect(page.getByLabel("Twoja wskazówka mentalna")).toContainText(
      "Przez następne 10 rzutów",
    );
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBe(true);
    await context.setOffline(true);
    await page.reload();
    for (let i = 0; i < 6; i++) {
      await expect(
        page.getByText(`Rzut ${i + 1} / 6`, { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
        .click();
    }
    await page
      .getByRole("combobox", { name: "Refleksja (opcjonalnie)", exact: true })
      .selectOption("repeat");
    await page
      .getByRole("button", { name: "Zapisz wynik", exact: true })
      .click();
    await expect(
      page.getByText("ZAPISANY TRENING", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Refleksja po zadaniu")).toContainText(
      "Chcę powtórzyć",
    );
    const stored = await readStoredState(page);
    expect(stored.lessons).toEqual([]); // Practice does not forge historical reading progress.
    expect(stored.sessions[0].mentalCueLessonId).toBe("one");
    expect(stored.sessions[0].lessonReflection).toBe("repeat");
    await page
      .getByRole("button", { name: "Powtórz zadanie w kolejnym treningu" })
      .click();
    await expect
      .poll(
        async () =>
          (await readStoredState(page)).coaching?.pendingMentalCueLessonId,
      )
      .toBe("one");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/mental-field-${viewport.width}.png`,
      fullPage: true,
    });
  });
}

test("counting lesson links the shared scenario and requires both counts before choosing", async ({
  page,
}) => {
  await page.goto("/lessons/ball-count");
  await page
    .getByRole("link", { name: "Przeanalizuj powiązaną sytuację", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Jedna kula na decyzję", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Strzelam najbliższą kulę", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Nasze pozostałe kule").fill("2");
  await page.getByLabel("Pozostałe kule rywala").fill("0");
  await expect(
    page.getByRole("button", { name: "Strzelam najbliższą kulę", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Nasze pozostałe kule").fill("1");
  await page
    .getByRole("button", { name: "Strzelam najbliższą kulę", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "TWÓJ PLAN:" }),
  ).toBeVisible();
  await page.goto("/lessons/ball-count");
  await page
    .getByRole("link", { name: "Ćwicz tę decyzję w trybie meczowym" })
    .click();
  await page
    .getByRole("button", { name: "Zacznij trening meczowy", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Jedna kula na decyzję", exact: true }),
  ).toBeVisible();
});

test("all historical lesson routes and completions remain valid after upgrading", async ({
  page,
}) => {
  await page.goto("/lessons");
  const ids = [
    "routine",
    "one",
    "goal",
    "focus-return",
    "focus-endurance",
    "mistake",
    "good",
    "reset-analysis",
    "reset-chain",
    "reset-energy",
    "stress",
    "score",
    "pressure-trailing",
    "name",
    "pressure-last",
    "trust",
    "confidence-technique",
    "confidence-series",
    "confidence-dialogue",
    "confidence-flow",
    "roles",
    "complete-decision",
    "complete-team",
    "complete-communication",
    "complete-preparation",
  ];
  await replaceStoredState(page, {
    ...((await readStoredState(page)) ?? {
      player: null,
      sessions: [],
      draft: null,
      lessons: [],
    }),
    lessons: ids,
  });
  await page.reload();
  await expect(
    page.getByText("25 / 31 zaliczonych", { exact: true }),
  ).toBeVisible();
  for (const id of ids) {
    await page.goto(`/lessons/${id}`);
    await expect(
      page.getByRole("button", { name: "Zaliczone", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "Wybierz zadanie na boisko",
        exact: true,
      }),
    ).toBeVisible();
  }
});

test.describe("desktop mental module", () => {
  test.use({
    viewport: { width: 1440, height: 1000 },
    isMobile: false,
    hasTouch: false,
  });
  test("library disclosure and field task controls work on desktop", async ({
    page,
  }) => {
    await page.goto("/lessons");
    await page.screenshot({
      path: "test-results/mental-library-desktop.png",
      fullPage: true,
    });
    await page
      .getByText("Pełna biblioteka · 31 lekcji", { exact: true })
      .click();
    await page
      .getByLabel("Kompetencja", { exact: true })
      .selectOption("complete");
    await expect(page.locator(".lesson-card")).toHaveCount(10);
    await page
      .locator(".lesson-card")
      .filter({ hasText: "Cena ryzyka" })
      .click();
    await expect(
      page.getByRole("link", { name: "Ćwicz tę decyzję w trybie meczowym" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Wybierz zadanie na boisko", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Zadanie wybrane do następnego treningu",
      }),
    ).toBeDisabled();
    await page.getByText("Procedura krok po kroku", { exact: true }).click();
    await expect(page.locator(".lesson-detail details li")).toHaveCount(4);
    await page.screenshot({
      path: "test-results/mental-lesson-desktop.png",
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
});
