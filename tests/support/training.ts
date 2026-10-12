import { expect, type Page } from "@playwright/test";
export async function beginTraining(page: Page, id = "point-basic") {
  await page.goto(`/training/${id}`);
  await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
  await expect(
    page.getByText(`Rzut 1 / ${id === "pressure" ? 5 : 6}`, { exact: true }),
  ).toBeVisible();
}
export async function finishPointing(page: Page) {
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
}
export async function cachedApp(page: Page) {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
}
