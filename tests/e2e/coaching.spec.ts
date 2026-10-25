import { readStoredState } from "../support/indexeddb";
import { test, expect, type Page } from "@playwright/test";
import { emptyState, type Session } from "../../src/domain";
const benchmark = (hits = 5): Session => {
  const plan = Array.from({ length: 20 }, (_, i) => ({
    mode: "shoot" as const,
    distance: 6 + Math.floor(i / 5),
  }));
  const results = plan.map((p, i) => ({
    ...p,
    id: `a${i}`,
    result: i < hits ? "Czyste trafienie" : "Pudło",
    points: i < hits ? 3 : 0,
    hit: i < hits,
    carreau: false,
    outside: false,
  }));
  return {
    id: "before",
    drillId: "test-shoot",
    kind: "test",
    benchmarkVersion: 1,
    startedAt: "2026-10-06T10:00:00",
    completedAt: "2026-10-06T11:00:00",
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    surface: "gravel",
    score: hits * 3,
    plan,
    results,
  };
};
async function upload(page: Page, data: unknown) {
  await page.getByLabel("Wybierz kopię").setInputFiles({
    name: "kopia.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
}
test("Today starts directly, preserves the draft and works offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  await page
    .getByText("Podpowiedzi do treningu · opcjonalnie", { exact: true })
    .click();
  await page
    .getByText("Plan → Oddech → Wykonanie → Reset", { exact: true })
    .click();
  const introduction = page.getByRole("region", {
    name: "Wprowadzenie do rutyny",
  });
  await expect(introduction.getByText(/nazwij jeden fakt/)).toBeVisible();
  await expect(introduction.getByRole("link")).toHaveAttribute(
    "href",
    "/lessons/routine",
  );
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
    .click();
  await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Wznów trening", exact: true })
    .click();
  await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
});
test("generated blocks resume, undo crosses block boundaries and mental completion is saved", async ({
  page,
}) => {
  await page.goto("/coach/generator");
  await page.getByRole("button", { name: "10 minut", exact: true }).click();
  await page.getByLabel("Chcę trenować").selectOption("strzał");
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  const firstEnd = (await readStoredState(page)).draft!.trainingPlan!.blocks[1]
    .end;
  await expect(
    page.getByRole("heading", { name: "Rozgrzewka", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Gotowe · przejdź do rzutów" })
    .click();
  for (let i = 0; i < firstEnd; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 20`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Czyste trafienie +3 pkt", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Cofnij ostatni rzut" }).click();
  await expect(
    page.getByText(`Rzut ${firstEnd} / 20`, { exact: true }),
  ).toBeVisible();
  await page.reload();
  for (let i = firstEnd - 1; i < 20; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 20`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Czyste trafienie +3 pkt", exact: true })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Mental reset", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Zaliczone · podsumuj trening" })
    .click();
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await page.getByText("Twoja głowa podczas treningu", { exact: true }).click();
  await expect(page.getByText("Ćwiczenie mentalne: zaliczone")).toBeVisible();
});
test("standardized test compares to an imported benchmark and self challenge keeps the plan", async ({
  page,
}) => {
  await page.goto("/settings");
  await upload(page, { ...emptyState, sessions: [benchmark()] });
  await page.getByRole("button", { name: "Tak, zastąp dane kopią" }).click();
  await expect(page.getByRole("status")).toContainText("Kopia przywrócona");
  await page.goto("/training/test-shoot?level=easy");
  await expect(
    page.getByRole("combobox", { name: "Poziom", exact: true }),
  ).toHaveValue("średni");
  await expect(
    page.getByRole("combobox", { name: "Poziom", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
  for (let i = 0; i < 20; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 20`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Czyste trafienie +3 pkt", exact: true })
      .click();
    if (i === 0)
      await expect(
        page.getByRole("button", { name: "Cofnij ostatni rzut" }),
      ).toHaveCount(0);
  }
  await expect(page.getByText("7 m: 0/5 → 5/5 trafień · 100%")).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Podsumowanie testu" })
      .getByText(/Rekord w tych warunkach: 20\/20/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(page.getByText("ZAPISANY TEST", { exact: true })).toBeVisible();
  await page.goto("/coach/challenge");
  await expect(
    page.getByRole("heading", { name: "Poprzednio: 20/20" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Powtórz warunki" }).click();
  await expect(page.getByText("Rzut 1 / 20", { exact: true })).toBeVisible();
});
test("invalid and cancelled imports leave data intact; a failed restore permits retry", async ({
  page,
}) => {
  await page.goto("/settings");
  await upload(page, { ...emptyState, sessions: [benchmark()] });
  await page.getByRole("button", { name: "Anuluj import" }).click();
  await page.goto("/history");
  await expect(page.getByRole("link", { name: /Test strzału/ })).toHaveCount(0);
  await page.goto("/settings");
  await upload(page, {
    ...emptyState,
    sessions: [{ ...benchmark(), score: 999 }],
  });
  await expect(page.getByRole("alert")).toContainText("suma punktów");
  await upload(page, { ...emptyState, sessions: [benchmark()] });
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    (window as unknown as { restoreStorage: () => void }).restoreStorage =
      () => {
        IDBObjectStore.prototype.put = original;
      };
    IDBObjectStore.prototype.put = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Tak, zastąp dane kopią" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Nie udało się zapisać danych",
  );
  await expect(
    page.getByRole("button", { name: "Tak, zastąp dane kopią" }),
  ).toBeVisible();
  await page.evaluate(() =>
    (window as unknown as { restoreStorage: () => void }).restoreStorage(),
  );
  await page.getByRole("button", { name: "Tak, zastąp dane kopią" }).click();
  await expect(page.getByRole("status")).toContainText("Kopia przywrócona");
  await page.reload();
  await page.goto("/history");
  await expect(page.getByRole("link", { name: /Test strzału/ })).toBeVisible();
});
test("new screens fit narrow phones and pass WCAG checks", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.setViewportSize({ width: 320, height: 720 });
  for (const path of [
    "/",
    "/coach/generator",
    "/coach/weaknesses",
    "/coach/challenge",
    "/training/test-target",
    "/settings",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBe(true);
    if (path === "/" || path === "/coach/generator")
      await page.screenshot({
        path:
          path === "/"
            ? "test-results/today-320.png"
            : "test-results/generator-320.png",
        fullPage: true,
      });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
  }
});
