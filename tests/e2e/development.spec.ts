import { test, expect, type Page } from "@playwright/test";
import { emptyState, choices, type Session } from "../../src/domain";

async function restore(page: Page, sessions: Session[]) {
  await page.goto("/settings");
  await page.getByLabel("Wybierz kopię").setInputFiles({
    name: "legacy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ ...emptyState, sessions })),
  });
  await page.getByRole("button", { name: "Tak, zastąp dane kopią" }).click();
  await expect(page.getByRole("status")).toContainText("Kopia przywrócona");
}
function series(id: string): Session {
  const plan = Array.from({ length: 10 }, () => ({
    mode: "shoot" as const,
    distance: 7,
  }));
  const c = choices.shoot.find((c) => c.hit)!;
  return {
    id,
    drillId: "shoot-basic",
    startedAt: "2026-10-01T10:00:00",
    completedAt: "2026-10-01T10:20:00",
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    surface: "gravel",
    plan,
    score: c.points * 10,
    results: plan.map((p, i) => ({
      ...p,
      id: `${id}-${i}`,
      result: c.label,
      points: c.points,
      hit: true,
      carreau: !!c.carreau,
      outside: !!c.outside,
    })),
  };
}
async function finishPractice(page: Page) {
  for (let i = 0; i < 30; i++) {
    const finish = page.getByRole("button", {
      name: "Zakończ i zapisz moduł",
      exact: true,
    });
    if (await finish.count()) {
      await finish.click();
      return;
    }
    const step = await page.locator(".coach-guided .eyebrow").textContent();
    await page
      .getByRole("button", { name: "Wykonane · następny krok", exact: true })
      .click();
    await expect(page.locator(".coach-guided .eyebrow")).not.toHaveText(step!);
  }
  throw new Error("Practice did not finish");
}
test("Mastery keeps one chance after reload, awards the mark and unlocks Legendary", async ({
  page,
}) => {
  await restore(page, [series("one"), series("two")]);
  await page.goto("/coach/mastery");
  const card = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "Strzał podstawowy",
      exact: true,
    }),
  });
  await expect(
    card.getByRole("button", { name: "Próba Legendary", exact: true }),
  ).toBeDisabled();
  await card
    .getByRole("button", { name: "Próba Mastery", exact: true })
    .click();
  for (let i = 0; i < 10; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 10`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cofnij ostatni rzut" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: i < 2 ? "Pudło +0 pkt" : "Czyste trafienie +3 pkt",
        exact: true,
      })
      .click();
    if (i === 3) {
      await expect(
        page.getByText("Rzut 5 / 10", { exact: true }),
      ).toBeVisible();
      await page.reload();
    }
  }
  await expect(
    page.getByRole("heading", { name: "Próba mistrzowska zaliczona!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.goto("/coach/mastery");
  await expect(card.getByText("Mastery ✓", { exact: true })).toBeVisible();
  await card
    .getByRole("button", { name: "Próba Legendary", exact: true })
    .click();
  await expect(page.getByText("Rzut 1 / 10", { exact: true })).toBeVisible();
});
test("mental module resumes offline, saves check-ins and does not farm XP", async ({
  page,
  context,
}) => {
  await page.goto("/coach/practice/mental");
  await page.getByLabel("Napięcie przed modułem (1–5)").selectOption("4");
  await page
    .getByRole("button", { name: "Zacznij moduł", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Wykonane · następny krok", exact: true })
    .click();
  await expect(page.getByText(/KROK 2 \/ 4/)).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/KROK 2 \/ 4/)).toBeVisible();
  await page
    .getByRole("button", { name: "Wykonane · następny krok", exact: true })
    .click();
  await expect(page.getByText(/KROK 3 \/ 4/)).toBeVisible();
  await page
    .getByRole("button", { name: "Wykonane · następny krok", exact: true })
    .click();
  await page.getByLabel("Napięcie po module (1–5)").selectOption("2");
  await page
    .getByRole("button", { name: "Zakończ i zapisz moduł", exact: true })
    .click();
  await expect(page.getByText(/napięcie 4 → 2\/5/)).toBeVisible();
  await context.setOffline(false);
  await page.goto("/coach/development");
  await expect(
    page.getByRole("heading", { name: "Poziom 1 · 20 XP", exact: true }),
  ).toBeVisible();
  await page.goto("/coach/practice/mental");
  await page
    .getByRole("button", { name: "Zacznij moduł", exact: true })
    .nth(1)
    .click();
  await finishPractice(page);
  await page.goto("/coach/development");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Poziom 1 · 20 XP", exact: true }),
  ).toBeVisible();
});
test("physical junior practice saves progress and earns its separate XP", async ({
  page,
}) => {
  await page.goto("/coach/practice/physical");
  await page.getByLabel("Wariant").selectOption("junior");
  await page.getByRole("button", { name: "10 minut", exact: true }).click();
  await page
    .getByRole("button", { name: "Zacznij moduł", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Wykonane · następny krok", exact: true })
    .click();
  await expect(page.getByText(/10 MIN · KROK 2/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/10 MIN · KROK 2/)).toBeVisible();
  await finishPractice(page);
  await expect(page.getByText(/Ostatni moduł zapisany:/)).toBeVisible();
  await page.goto("/coach/development");
  await expect(
    page.getByRole("heading", { name: "Poziom 1 · 20 XP", exact: true }),
  ).toBeVisible();
});
test("competition date persists and Today starts the taper plan", async ({
  page,
}) => {
  await page.goto("/coach/competition");
  await page.getByRole("button", { name: "1 dzień", exact: true }).click();
  await page
    .getByRole("button", { name: "Zapisz termin zawodów", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Termin zapisany");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Do zawodów: 1 dzień", exact: true }),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Przed zawodami: jakość i rutyna",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Gotowe · przejdź do rzutów" })
    .click();
  await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
});
test("development screens fit 320px and pass accessibility checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.setViewportSize({ width: 320, height: 720 });
  for (const path of [
    "/coach/development",
    "/coach/week",
    "/coach/goals",
    "/coach/mastery",
    "/coach/practice/mental",
    "/coach/practice/physical",
    "/coach/competition",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBe(true);
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
    if (path === "/coach/development")
      await page.screenshot({
        path: "test-results/development-320.png",
        fullPage: true,
      });
  }
  await page.goto("/coach/practice/mental");
  await page
    .getByRole("button", { name: "Zacznij moduł", exact: true })
    .first()
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    path: "test-results/practice-320.png",
    fullPage: true,
  });
});
