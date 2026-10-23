import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readStoredState } from "../support/indexeddb";

for (const [focus, mode, count] of [
  ["puenta", "point", 6],
  ["strzał", "shoot", 10],
  ["lob", "lob", 20],
  ["przy linii", "boundary", 10],
  ["do celu", "target", 6],
] as const) {
  test(`longer ${focus} training uses the selected 8 m and ${count} total throws`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByText("Podpowiedzi do treningu · opcjonalnie", { exact: true })
      .click();
    await page
      .getByRole("link", { name: "Ułóż dłuższy trening →", exact: true })
      .click();
    await page.getByRole("button", { name: "60 minut", exact: true }).click();
    await page.getByLabel("Chcę trenować").selectOption(focus);
    await page
      .getByRole("combobox", { name: "Odległość", exact: true })
      .selectOption("8");
    const length = page.getByRole("combobox", {
      name: "Łączna liczba rzutów",
      exact: true,
    });
    expect(await length.locator("option").allTextContents()).toEqual([
      "6 rzutów",
      "10 rzutów",
      "20 rzutów",
    ]);
    await length.selectOption(String(count));
    await expect(
      page.getByText("Kiedy kolejny poziom?", { exact: true }),
    ).toHaveCount(0);
    await expect(page.locator(".coach-blocks")).not.toContainText(
      "Zmiana dystansu",
    );
    await page
      .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Gotowe · przejdź do rzutów", exact: true })
      .click();
    await expect(
      page.getByText(`Rzut 1 / ${count}`, { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".distance")).toContainText("8 m");
    await expect(
      page.getByRole("region", { name: "Zasady awansu" }),
    ).toHaveCount(0);
    await page.reload();
    const draft = (await readStoredState(page)).draft!;
    expect(draft.plan).toHaveLength(count);
    expect(draft.plan.every((a) => a.mode === mode && a.distance === 8)).toBe(
      true,
    );
  });
}

test("generator settings stay usable and accessible on a small phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/coach/generator");
  await expect(
    page.getByRole("combobox", { name: "Odległość", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: test.info().outputPath("generator-manual-settings.png"),
    fullPage: true,
  });
});
