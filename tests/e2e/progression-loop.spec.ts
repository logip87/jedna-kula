import { expect, test, type Page } from "@playwright/test";
import { readStoredState } from "../support/indexeddb";

async function completePerfectTraining(page: Page, distance: number) {
  await expect(page.locator(".distance")).toContainText(`${distance} m`);
  const draft = (await readStoredState(page)).draft!;
  expect(
    draft.plan.every((a) => a.mode === "point" && a.distance === distance),
  ).toBe(true);
  for (let i = 0; i < draft.plan.length; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / ${draft.plan.length}`, { exact: true }),
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
}

test("15 home starts keep 6 m until the harder proposal is accepted", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Liczba rzutów", exact: true })
    .selectOption("10");
  for (let i = 0; i < 15; i++) {
    await expect(
      page.getByRole("heading", { name: "Puenta 6 m", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
      .click();
    await completePerfectTraining(page, 6);
    expect((await readStoredState(page)).sessions).toHaveLength(i + 1);
    const proposal = page.locator(".notice").filter({
      has: page.getByRole("button", {
        name: "SPRÓBUJ TRUDNIEJ",
        exact: true,
      }),
    });
    if (i >= 2) await expect(proposal).toContainText("6 m → 7 m");
    else await expect(proposal).toHaveCount(0);
  }
  await page.reload();
  await expect(page.locator(".notice")).toContainText("6 m → 7 m");
  await page.screenshot({
    path: test.info().outputPath("after-15-home-trainings.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "SPRÓBUJ TRUDNIEJ", exact: true })
    .click();
  await completePerfectTraining(page, 7);
  await expect(
    page.getByRole("heading", { name: "Puenta 7 m", exact: true }),
  ).toBeVisible();
  await page.reload();
  for (let i = 0; i < 2; i++) {
    await expect(
      page.getByRole("button", { name: "SPRÓBUJ TRUDNIEJ", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
      .click();
    await completePerfectTraining(page, 7);
  }
  await expect(page.locator(".notice")).toContainText("7 m → 8 m");
  await page
    .getByRole("button", { name: "SPRÓBUJ TRUDNIEJ", exact: true })
    .click();
  await completePerfectTraining(page, 8);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Puenta 8 m", exact: true }),
  ).toBeVisible();
});
