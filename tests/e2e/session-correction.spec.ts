import { expect, test } from "@playwright/test";
import { beginTraining } from "../support/training";
import { readStoredState } from "../support/indexeddb";

test("a draft can resume from its summary and correct its final throw before saving", async ({
  page,
}) => {
  await beginTraining(page);
  for (let index = 0; index < 6; index++) {
    await expect(
      page.getByText(`Rzut ${index + 1} / 6`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
      .click();
    if (index === 1) {
      await page
        .getByRole("button", { name: "Zakończ trening", exact: true })
        .click();
      await page
        .getByRole("link", { name: "Podsumuj trening", exact: true })
        .click();
      await page
        .getByRole("link", { name: "Wróć do treningu", exact: true })
        .click();
    }
  }
  await page
    .getByRole("button", { name: "Popraw ostatni rzut", exact: true })
    .click();
  await expect(page.getByText("Rzut 6 / 6", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Rzut 6 / 6", { exact: true })).toBeVisible();
  const corrected = await readStoredState(page);
  expect(corrected.draft?.results).toHaveLength(5);
  expect(corrected.draft?.score).toBe(15);
  await page
    .getByRole("button", { name: "Ponad 100 cm +0 pkt", exact: true })
    .click();
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.reload();
  const saved = await readStoredState(page);
  expect(saved.draft).toBeNull();
  expect(saved.sessions).toHaveLength(1);
  expect(saved.sessions[0].results).toHaveLength(6);
  expect(saved.sessions[0].score).toBe(15);
  expect(saved.sessions[0].results.at(-1)?.points).toBe(0);
});

test("undo keeps pending lob choices after a failed save and clears them after a successful save", async ({
  page,
}) => {
  await page.goto("/training/lob");
  await page.getByLabel("Zapisuj kierunki do mapy rzutów").check();
  await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
  const landingDirection = page.getByRole("group", {
    name: "Kierunek pierwszego lądowania",
    exact: true,
  });
  const finalDirection = page.getByRole("group", {
    name: "Kierunek końcowej pozycji",
    exact: true,
  });
  const result = page.getByRole("button", {
    name: "0–30 cm od świnki +3 pkt",
    exact: true,
  });
  await page.getByRole("button", { name: "Tak, w kole", exact: true }).click();
  await landingDirection.getByRole("button", { name: "Na celu" }).click();
  await finalDirection.getByRole("button", { name: "Na celu" }).click();
  await result.click();
  await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Poza kołem", exact: true }).click();
  await landingDirection.getByRole("button", { name: "Za krótko" }).click();
  await finalDirection.getByRole("button", { name: "Za długo" }).click();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    (window as unknown as { restoreStorage: () => void }).restoreStorage =
      () => {
        IDBObjectStore.prototype.put = original;
      };
    IDBObjectStore.prototype.put = () => {
      throw new DOMException("No space", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Cofnij ostatni rzut", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Nie udało się zapisać danych",
  );
  await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
  await expect(
    landingDirection.getByRole("button", { name: "Za krótko" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(result).toBeEnabled();
  await page.evaluate(() =>
    (window as unknown as { restoreStorage: () => void }).restoreStorage(),
  );
  await page
    .getByRole("button", { name: "Cofnij ostatni rzut", exact: true })
    .click();
  await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
  await expect(
    landingDirection.getByRole("button", { name: "Za krótko" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    finalDirection.getByRole("button", { name: "Za długo" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(result).toBeDisabled();
  await page.getByRole("button", { name: "Tak, w kole", exact: true }).click();
  await expect(result).toBeDisabled();
  await landingDirection.getByRole("button", { name: "Na celu" }).click();
  await finalDirection.getByRole("button", { name: "Na celu" }).click();
  await result.click();
  const stored = await readStoredState(page);
  expect(stored.draft?.results).toHaveLength(1);
  expect(stored.draft?.results[0]).toMatchObject({
    landingHit: true,
    landingDirection: "center",
    missDirection: "center",
  });
});
