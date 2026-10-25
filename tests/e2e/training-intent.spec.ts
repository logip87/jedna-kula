import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { emptyState } from "../../src/domain";
import { readStoredState, replaceStoredState } from "../support/indexeddb";
import { nextStepSeries } from "../support/next-steps";

test("home lets the player train at 8 m despite poor 6 m results and remembers the saved setup", async ({
  page,
}) => {
  await page.goto("/");
  await replaceStoredState(page, {
    ...emptyState,
    sessions: [11, 12, 13].map((day) => nextStepSeries("point", 6, 0, day)),
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Co dziś trenujesz?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Dopasuj trening", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Odległość", exact: true })
    .selectOption("8");
  await page
    .getByRole("combobox", { name: "Liczba rzutów", exact: true })
    .selectOption("6");
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  await expect(page.locator(".distance")).toContainText("8 m");
  expect((await readStoredState(page)).draft?.plan).toEqual(
    Array.from({ length: 6 }, () => ({ mode: "point", distance: 8 })),
  );
  for (let i = 0; i < 6; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 6`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Zakończ", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Odległość", exact: true }),
  ).toHaveValue("8");
  await expect(
    page.getByRole("combobox", { name: "Liczba rzutów", exact: true }),
  ).toHaveValue("6");
  const saved = (await readStoredState(page)).sessions.at(-1)!;
  expect(saved.results).toHaveLength(6);
  expect(
    saved.results.every((a) => a.mode === "point" && a.distance === 8),
  ).toBe(true);
  await page.getByRole("button", { name: "Strzał", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Odległość", exact: true }),
  ).toHaveValue("6");
  await page.getByRole("button", { name: "Puenta", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Odległość", exact: true }),
  ).toHaveValue("8");
});

for (const [title, mode, count] of [
  ["Puenta", "point", 6],
  ["Strzał", "shoot", 10],
  ["Lob", "lob", 20],
  ["Przy linii", "boundary", 10],
] as const) {
  test(`home starts ${title} at the chosen distance with ${count} throws and resumes after reload`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: title, exact: true }).click();
    await page
      .getByRole("combobox", { name: "Odległość", exact: true })
      .selectOption("8");
    await page
      .getByRole("combobox", { name: "Liczba rzutów", exact: true })
      .selectOption(String(count));
    if (mode === "boundary" || mode === "lob") {
      await page
        .getByText("Ustawienie ćwiczenia i sposób zapisu", { exact: true })
        .click();
      if (mode === "boundary") {
        await expect(
          page.getByText("Ustaw świnkę 20 cm od linii.", { exact: false }),
        ).toBeVisible();
        await expect(page.getByLabel("Odległość świnki od linii")).toHaveCount(
          0,
        );
      }
    }
    if (mode === "lob")
      await expect(
        page.getByRole("region", { name: "Ustawienie do loba" }),
      ).toContainText("7 m");
    await page
      .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
      .click();
    await expect(
      page.getByText(`Rzut 1 / ${count}`, { exact: true }),
    ).toBeVisible();
    await page.reload();
    const draft = (await readStoredState(page)).draft!;
    expect(draft.plan).toEqual(
      Array.from({ length: count }, () => ({ mode, distance: 8 })),
    );
    expect(draft.coach?.source).toBe("manual");
    if (mode === "boundary") expect(draft.boundary).toBe(20);
    await page.goto("/");
    await expect(
      page.getByRole("region", { name: "Wybór treningu" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Wznów trening", exact: true })
      .click();
    await expect(
      page.getByText(`Rzut 1 / ${count}`, { exact: true }),
    ).toBeVisible();
  });
}

test("tactics and mental practice have their own direct entries", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Taktyka", exact: true }).click();
  await expect(page).toHaveURL(/\/adventure\/tactics/);
  await page.goto("/");
  await page
    .getByRole("link", { name: "Trening mentalny", exact: true })
    .click();
  await expect(page).toHaveURL(/\/coach\/practice\/mental/);
});

test("boundary drill keeps the jack at 20 cm at every difficulty", async ({
  page,
}) => {
  for (const difficulty of ["łatwy", "średni", "trudny"]) {
    await page.goto("/training/boundary");
    await page
      .getByRole("combobox", { name: "Poziom", exact: true })
      .selectOption(difficulty);
    await expect(
      page.getByText("Świnka zawsze 20 cm od linii.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Świnka od linii", { exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
    await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
    expect((await readStoredState(page)).draft?.boundary).toBe(20);
    await replaceStoredState(page, emptyState);
  }
});

test("home choice fits mobile and desktop and passes accessibility checks", async ({
  page,
}) => {
  for (const [width, height] of [
    [320, 740],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "ZACZNIJ TRENING", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({
      path: test.info().outputPath(`training-choice-${width}.png`),
      fullPage: false,
    });
  }
});
