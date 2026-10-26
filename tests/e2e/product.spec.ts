import { readStoredState } from "../support/indexeddb";
import { test, expect, type Page } from "@playwright/test";
import {
  emptyState,
  choices,
  type Session,
  type State,
} from "../../src/domain";
function series(hits = 10, id = crypto.randomUUID() as string): Session {
  const plan = Array.from({ length: 10 }, () => ({
    mode: "shoot" as const,
    distance: 8,
  }));
  const results = plan.map((p, i) => {
    const c = choices.shoot.find((c) => c.hit === i < hits)!;
    return {
      ...p,
      id: `${id}${i}`,
      result: c.label,
      points: c.points,
      hit: c.hit,
      carreau: !!c.carreau,
      outside: !!c.outside,
    };
  });
  return {
    id,
    drillId: "shoot-basic",
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    surface: "gravel",
    startedAt: "2026-10-06T10:00:00Z",
    completedAt: "2026-10-06T10:30:00Z",
    plan,
    results,
    score: results.reduce((n, a) => n + a.points, 0),
  };
}
async function restore(page: Page, data: State) {
  await page.goto("/settings");
  await page.getByLabel("Wybierz kopię").setInputFiles({
    name: "legacy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await page
    .getByRole("button", { name: "Tak, zastąp dane kopią", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Kopia przywrócona");
}
test("Today keeps distance selection in the player's control and resumes it", async ({
  page,
}) => {
  await restore(page, {
    ...emptyState,
    sessions: [series(7), series(7), series(7)],
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "SPRÓBUJ TRUDNIEJ", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Strzał", exact: true })
    .click();
  await page.getByLabel("Odległość").selectOption("9");
  await page.getByRole("button", { name: "ZACZNIJ TRENING", exact: true }).click();
  await expect(page.locator(".distance")).toContainText("9 m");
  await page.reload();
  await expect(page.locator(".distance")).toContainText("9 m");
  await page.goto("/");
  await page
    .getByRole("button", { name: "Wznów trening", exact: true })
    .click();
  await expect(page.locator(".distance")).toContainText("9 m");
});
test("self challenge shows the actual change and summary hides details", async ({
  page,
}) => {
  await restore(page, { ...emptyState, sessions: [series(4), series(6)] });
  await page.goto("/coach/challenge");
  await expect(page.getByText(/Cel: 7\/10/)).toBeVisible();
  await page
    .getByRole("button", { name: "Powtórz warunki", exact: true })
    .click();
  for (let i = 0; i < 10; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 10`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: i < 8 ? "Czyste trafienie +3 pkt" : "Pudło +0 pkt",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByText(/\+2 względem poprzedniego wyniku/),
  ).toBeVisible();
  await expect(page.getByText(/50% → teraz 80%/)).toBeVisible();
  await expect(page.locator(".product-details")).not.toHaveAttribute(
    "open",
    "",
  );
  await page.screenshot({
    path: "test-results/product-summary-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Zakończ", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
});
test("mental recommendation leads into a persisted short routine before throws", async ({
  page,
}) => {
  const sessions = Array.from({ length: 5 }, (_, i) => ({
    ...series(6),
    routineUsed: i < 2,
  }));
  await restore(page, { ...emptyState, sessions });
  await page.goto("/");
  await page
    .getByText("Podpowiedzi do treningu · opcjonalnie", { exact: true })
    .click();
  await expect(page.getByText(/użyłeś rutyny 2 razy/)).toBeVisible();
  await page
    .getByRole("button", { name: "Zacznij proponowany trening", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Rutyna przed serią", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Rutyna gotowa · przejdź dalej", exact: true })
    .click();
  await expect(page.getByText("Rzut 1 / 20", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Rzut 1 / 20", { exact: true })).toBeVisible();
});
test("60-minute plan has purpose-specific blocks and a final check without undo", async ({
  page,
}) => {
  await page.goto("/coach/generator");
  await page.getByRole("button", { name: "60 minut", exact: true }).click();
  await page.getByLabel("Chcę trenować").selectOption("strzał");
  await expect(page.getByText(/Kontrola dystansu/).first()).toBeVisible();
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  const finalStart = (
    await readStoredState(page)
  ).draft!.trainingPlan!.blocks.at(-1)!.start;
  await page
    .getByRole("button", { name: "Gotowe · przejdź do rzutów", exact: true })
    .click();
  for (let i = 0; i < finalStart; i++) {
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
  await page
    .getByRole("button", { name: "Rutyna gotowa · przejdź dalej", exact: true })
    .click();
  await expect(
    page.getByText(`Rzut ${finalStart + 1} / 20`, { exact: true }),
  ).toBeVisible();
  await page.reload();
  for (let i = finalStart; i < 20; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 20`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cofnij ostatni rzut" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Czyste trafienie +3 pkt", exact: true })
      .click();
  }
  await expect(
    page.getByRole("region", { name: "Podsumowanie treningu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
});
test("measurement is opt-in, local and contains only counts", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("jedna-kula-product-counters"),
    ),
  ).toBeNull();
  await page.goto("/settings");
  await page.getByLabel("Zbieraj anonimowe dane o użyciu").check();
  await page.goto("/");
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
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
  const counters = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("jedna-kula-product-counters")!),
  );
  const events = Object.values(counters)[0] as Record<string, number>;
  expect(events.manual_training_start).toBe(1);
  expect(events.recommended_training_complete).toBeUndefined();
  expect(events.training_complete).toBe(1);
  expect(JSON.stringify(counters)).not.toMatch(
    /age|score|name|player|sessionId/,
  );
  await page.goto("/settings");
  await page.getByLabel("Zbieraj anonimowe dane o użyciu").uncheck();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("jedna-kula-product-counters"),
    ),
  ).toBeNull();
});
test("athlete instructions are concise and primary navigation fits 320px", async ({
  page,
}) => {
  await restore(page, {
    ...emptyState,
    player: {
      id: "p",
      name: "A",
      age: 30,
      preferredRole: "strzelec",
      preferredHand: "prawa",
      createdAt: "2026-10-01T10:00:00Z",
      audience: "athlete",
    },
  });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/training/shoot-basic");
  await expect(page.locator(".instructions")).not.toHaveAttribute("open", "");
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Tryb meczowy", exact: true }),
  ).toBeHidden();
  await page.getByText("Poznaj pozostałe możliwości", { exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Tryb meczowy", exact: true }),
  ).toBeVisible();
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const path of ["/", "/coach/generator", "/settings"]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await page.goto("/");
  await page.screenshot({
    path: "test-results/product-today-320.png",
    fullPage: true,
  });
});
