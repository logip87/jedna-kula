import { expect, test } from "@playwright/test";
import { readStoredState } from "../support/indexeddb";

test("product loop uses consistent accuracy and repeats the last training in one click", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  for (let i = 0; i < 6; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 6`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "31–60 cm +2 pkt", exact: true })
      .click();
  }
  await expect(
    page.getByRole("region", { name: "Podsumowanie treningu" }),
  ).toContainText("100% skuteczności");
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.reload();
  const saved = await readStoredState(page);
  expect(saved.sessions).toHaveLength(1);
  expect(saved.draft).toBeNull();

  await page
    .getByRole("navigation", { name: "Nawigacja główna" })
    .getByRole("link", { name: "Postęp", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Następny trening", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".recent-chart")).toContainText("100%");
  await page
    .getByRole("link", { name: "Zobacz historię treningów", exact: true })
    .click();
  await expect(page.locator(".history-list")).toContainText("100%");
  await expect(page.locator(".history-list")).toContainText("6 m");

  await page
    .getByRole("navigation", { name: "Nawigacja główna" })
    .getByRole("link", { name: "Dzisiaj", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Puenta 6 m", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Powtórz ostatni trening:/ }).click();
  await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
  const repeated = await readStoredState(page);
  expect(repeated.draft?.id).not.toBe(saved.sessions[0].id);
  expect(repeated.draft?.plan).toEqual(saved.sessions[0].plan);
  expect(repeated.draft?.results).toEqual([]);
  expect(repeated.sessions).toHaveLength(1);
  await page.getByRole("link", { name: "jedna kula", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Wznów trening", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Powtórz ostatni trening:/ }),
  ).toHaveCount(0);
});
