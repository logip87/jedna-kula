import { expect, test } from "@playwright/test";

test("@showcase mental lesson is completed and persists", async ({ page }) => {
  await page.goto("/lessons/one");
  await page.getByRole("button", { name: "Zaliczone · zapamiętuję" }).click();
  await expect(page.getByRole("button", { name: "Zaliczone", exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole("button", { name: "Zaliczone", exact: true })).toBeDisabled();
});

test("@showcase body practice resumes and saves progress", async ({ page }) => {
  await page.goto("/coach/practice/physical");
  await page.getByRole("button", { name: "Zacznij moduł", exact: true }).first().click();
  await page.getByRole("button", { name: "Wykonane · następny krok", exact: true }).click();
  await expect(page.getByText(/Około 5 min · krok 2 \/ 6/)).toBeVisible();
  await page.goto("/");
  await page.getByRole("link", { name: "Wznów", exact: true }).click();
  await expect(page.getByText(/krok 2 \/ 6/)).toBeVisible();
});

test("@showcase adventure mission records progress and unlocks the next step", async ({ page }) => {
  await page.goto("/adventure");
  await page.getByRole("button", { name: "Krótka seria", exact: true }).click();
  await page.getByRole("button", { name: "10 treningów", exact: true }).click();
  await page.getByRole("button", { name: "Zapisz wybór ścieżki" }).click();
  await page.goto("/adventure/mission/1");
  await page.getByRole("button", { name: "Rozpocznij serię 6 prób" }).click();
  for (let attempt = 0; attempt < 6; attempt++) {
    await page.getByRole("button", { name: "W lewo", exact: true }).click();
    await page.getByRole("button", { name: "Ponad 100 cm +0 pkt", exact: true }).click();
  }
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(page.getByText("Misja zaliczona!", { exact: true })).toBeVisible();
  await page.goto("/adventure/missions");
  await expect(page.locator(".mission-passport")).toContainText("1 /");
});

test("@showcase tactical decision can be made and is retained", async ({ page }) => {
  await page.goto("/adventure/tactics");
  await page.getByRole("button", { name: "Puentuję bliżej", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Puentuję bliżej", exact: true })).toHaveAttribute("aria-pressed", "true");
});
