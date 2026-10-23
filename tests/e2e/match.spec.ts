import { expect, test } from "@playwright/test";

for (const size of [1, 2, 3]) {
  test(`match ${size} vs ${size}: points, balls, corrections and recovery`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Nawigacja główna" })
      .getByRole("link", { name: "Mecz", exact: true })
      .click();
    await page
      .getByRole("button", { name: `${size} na ${size}`, exact: true })
      .click();
    const label = size === 1 ? "Zawodnik" : "Drużyna";
    const start = page.getByRole("button", {
      name: "Rozpocznij mecz",
      exact: true,
    });
    await expect(start).toBeDisabled();
    await page.getByLabel(`${label} 1`, { exact: true }).fill("Ola");
    await page.getByLabel(`${label} 2`, { exact: true }).fill("   ");
    await expect(start).toBeDisabled();
    await page.getByLabel(`${label} 2`, { exact: true }).fill("Jan");
    await start.click();
    const board = page.getByRole("region", { name: "Tablica meczu" });
    const score = (name: string) =>
      board.getByLabel(`Wynik: ${name}`, { exact: true });
    const count = size === 1 ? 3 : 6;
    await expect(score("Ola")).toHaveText("0");
    await expect(score("Jan")).toHaveText("0");
    await expect(board.getByRole("button")).toHaveCount(count * 2);
    const ball = board.getByRole("button", {
      name: "Ola: kula 1",
      exact: true,
    });
    await ball.click();
    await expect(ball).toHaveAttribute("aria-pressed", "true");
    await ball.click();
    await expect(ball).toHaveAttribute("aria-pressed", "false");
    await ball.click();
    await page
      .getByRole("button", { name: "Przyznaj punkty", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Liczba punktów", exact: true })
      .selectOption(String(count));
    await page
      .getByRole("button", { name: "Zapisz punkty", exact: true })
      .click();
    await expect(score("Ola")).toHaveText(String(count));
    await page
      .getByRole("button", { name: "Następna rozgrywka", exact: true })
      .click();
    await expect(ball).toHaveAttribute("aria-pressed", "false");
    await expect(score("Ola")).toHaveText(String(count));
    await ball.click();
    await page
      .getByRole("button", { name: "Popraw wynik rozgrywki 1", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Punkty dla", exact: true })
      .selectOption("1");
    await page
      .getByRole("combobox", { name: "Liczba punktów", exact: true })
      .selectOption("2");
    await page
      .getByRole("button", { name: "Zapisz punkty", exact: true })
      .click();
    await expect(score("Ola")).toHaveText("0");
    await expect(score("Jan")).toHaveText("2");
    await expect(ball).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(score("Jan")).toHaveText("2");
    await expect(ball).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("heading", { name: "Rozgrywka 2", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Przyznaj punkty", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Punkty dla", exact: true })
      .selectOption("none");
    await page
      .getByRole("button", { name: "Zapisz punkty", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Następna rozgrywka", exact: true })
      .click();
    await expect(score("Jan")).toHaveText("2");
    await page.getByRole("button", { name: "Nowy mecz", exact: true }).click();
    await page.getByRole("button", { name: "Anuluj", exact: true }).click();
    await expect(score("Jan")).toHaveText("2");
  });
}

test("match scoreboard fits narrow phones with long names", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/match");
  await page.getByRole("button", { name: "3 na 3", exact: true }).click();
  await page
    .getByLabel("Drużyna 1", { exact: true })
    .fill("Bardzo długa nazwa drużyny pétanque");
  await page
    .getByLabel("Drużyna 2", { exact: true })
    .fill("WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW");
  await page
    .getByRole("button", { name: "Rozpocznij mecz", exact: true })
    .click();
  const board = page.getByRole("region", { name: "Tablica meczu" });
  await expect(board).toBeVisible();
  for (const ball of await board.getByRole("button").all()) {
    const bounds = await ball.boundingBox();
    expect(bounds).toBeTruthy();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  await page.screenshot({
    path: "test-results/match-mobile.png",
    fullPage: true,
  });
});
