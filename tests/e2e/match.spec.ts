import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const size of [1, 2, 3]) {
  test(`match ${size} vs ${size}: one tap scores an end, corrections and recovery`, async ({
    page,
  }) => {
    await page.goto("/match");
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
    const points = (name: string, count: number) =>
      board.getByRole("button", {
        name: `${name}: ${count} ${count === 1 ? "punkt" : count < 5 ? "punkty" : "punktów"}`,
        exact: true,
      });
    const count = size === 1 ? 3 : 6;
    await expect(score("Ola")).toHaveText("0");
    await expect(score("Jan")).toHaveText("0");
    await expect(board.getByRole("button")).toHaveCount(count * 2);
    // Each number immediately records one whole end, without a separate save/next step.
    await points("Ola", count).click();
    await expect(score("Ola")).toHaveText(String(count));
    await expect(page.getByText("Rozdanie 2", { exact: true })).toBeVisible();
    await points("Jan", 2).click();
    await expect(score("Jan")).toHaveText("2");
    await expect(page.getByText("Rozdanie 3", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Popraw wynik rozdania 1", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Popraw wynik rozdania 1",
        exact: true,
      }),
    ).toBeFocused();
    await points("Jan", 1).click();
    await expect(score("Ola")).toHaveText("0");
    await expect(score("Jan")).toHaveText("3");
    await expect(page.getByText("Rozdanie 3", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Popraw wynik rozdania 1", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Anuluj poprawianie", exact: true })
      .click();
    await expect(score("Jan")).toHaveText("3");
    await page.reload();
    await expect(score("Jan")).toHaveText("3");
    await expect(page.getByText("Rozdanie 3", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Rozdanie bez punktów", exact: true })
      .click();
    await expect(page.getByText("Rozdanie 4", { exact: true })).toBeVisible();
    await expect(score("Jan")).toHaveText("3");
    const undo = page.getByRole("button", {
      name: "Cofnij ostatnie rozdanie",
      exact: true,
    });
    await undo.click();
    await expect(page.getByText("Rozdanie 3", { exact: true })).toBeVisible();
    await undo.click();
    await expect(score("Jan")).toHaveText("1");
    await undo.click();
    await expect(score("Jan")).toHaveText("0");
    await expect(undo).toHaveCount(0);
    await expect(page.getByText("Rozdanie 1", { exact: true })).toBeVisible();
    await points("Ola", 1).click();
    await page.getByRole("button", { name: "Nowy mecz", exact: true }).click();
    await page.getByRole("button", { name: "Anuluj", exact: true }).click();
    await expect(score("Ola")).toHaveText("1");
    await page.getByRole("button", { name: "Nowy mecz", exact: true }).click();
    await page
      .getByRole("button", { name: "Rozpocznij nowy mecz", exact: true })
      .click();
    await expect(start).toBeVisible();
    await page.reload();
    await expect(start).toBeVisible();
  });
}

for (const ends of [[[2, 0]], [[2, 0], null]]) {
  test(`legacy match keeps its score and starts the next end: ${JSON.stringify(ends)}`, async ({
    page,
  }) => {
    await page.goto("/match");
    await page.evaluate((ends) => {
      localStorage.setItem(
        "jedna-kula-match-v1",
        JSON.stringify({
          size: 1,
          names: ["Ola", "Jan"],
          ends,
          used: [
            [true, false, false],
            [false, false, false],
          ],
        }),
      );
    }, ends);
    await page.reload();
    await expect(page.getByLabel("Wynik: Ola", { exact: true })).toHaveText(
      "2",
    );
    await expect(page.getByText("Rozdanie 2", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Jan: 3 punkty", exact: true })
      .click();
    await expect(page.getByLabel("Wynik: Jan", { exact: true })).toHaveText(
      "3",
    );
    await page.reload();
    await expect(page.getByLabel("Wynik: Ola", { exact: true })).toHaveText(
      "2",
    );
    await expect(page.getByLabel("Wynik: Jan", { exact: true })).toHaveText(
      "3",
    );
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
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: "test-results/match-mobile.png",
    fullPage: true,
  });
});
