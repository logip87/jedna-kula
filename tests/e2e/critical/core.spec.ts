import { expect, test } from "@playwright/test";

test(
  "@showcase @smoke player can open the mobile app, start a training, undo, resume and save it",
  async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dzisiaj", exact: true })).toBeVisible();
    await page
      .getByRole("navigation", { name: "Nawigacja główna" })
      .getByRole("link", { name: "Trening", exact: true })
      .click();
    await expect(page).toHaveURL(/\/training/);

    await page.getByRole("link", { name: /Puenta podstawowa/ }).first().click();
    await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
    await page.getByRole("button", { name: "0–30 cm +3 pkt", exact: true }).click();
    await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Zapisano 1 rzut");
    await page.getByRole("button", { name: "Cofnij ostatni rzut", exact: true }).click();
    await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Zapisano 0 rzutów");
    await page.getByRole("button", { name: "0–30 cm +3 pkt", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Zapisano 1 rzut");
    await page.goto("/");
    await page.getByRole("button", { name: "Wznów trening", exact: true }).click();
    await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();

    for (let throwNumber = 2; throwNumber <= 6; throwNumber++)
      await page.getByRole("button", { name: "0–30 cm +3 pkt", exact: true }).click();
    await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
    await expect(page.getByText("ZAPISANY TRENING", { exact: true })).toBeVisible();
    await page.goto("/history");
    await expect(page.getByRole("link", { name: /Puenta podstawowa/ })).toContainText("18 pkt");
  },
);
