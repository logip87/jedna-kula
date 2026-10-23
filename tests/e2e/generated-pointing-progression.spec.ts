import { expect, test, type Page } from "@playwright/test";
import { readStoredState, replaceStoredState } from "../support/indexeddb";
import { emptyState, type Mode } from "../../src/domain";
import { drillForMode } from "../../src/features/coaching/model";
import { nextStepSeries } from "../support/next-steps";

async function finishPerfectTraining(page: Page) {
  const draft = (await readStoredState(page)).draft!;
  if (draft.trainingPlan) {
    await page
      .getByRole("button", { name: "Gotowe · przejdź do rzutów", exact: true })
      .click();
  }
  for (let i = 0; i < draft.plan.length; i++) {
    if (
      draft.trainingPlan?.blocks.some(
        (b) => b.kind === "mental" && b.start === i && b.end === i,
      )
    ) {
      await expect(
        page.getByRole("heading", { name: "Mental reset", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: "Rutyna gotowa · przejdź dalej",
          exact: true,
        })
        .click();
    }
    await expect(
      page.getByText(`Rzut ${i + 1} / ${draft.plan.length}`, { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".distance")).toContainText(
      `${draft.plan[i].distance} m`,
    );
    const mode = draft.plan[i].mode;
    if (mode === "lob")
      await page
        .getByRole("button", { name: "Tak, w kole", exact: true })
        .click();
    const result =
      mode === "shoot"
        ? "Czyste trafienie +3 pkt"
        : mode === "target"
          ? "W celu +1 pkt"
          : mode === "lob"
            ? "0–30 cm od świnki +3 pkt"
            : "0–30 cm +3 pkt";
    await page.getByRole("button", { name: result, exact: true }).click();
  }
  await expect(
    page.getByRole("region", { name: "Podsumowanie treningu" }),
  ).toContainText("100% skuteczności");
  await page.getByRole("button", { name: "Zapisz wynik", exact: true }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Zakończ", exact: true }).click();
  return draft.plan.reduce<Record<number, number>>((counts, a) => {
    counts[a.distance] = (counts[a.distance] ?? 0) + 1;
    return counts;
  }, {});
}

async function startLongTrainingFromHome(page: Page, focus: string) {
  await page
    .getByText("Podpowiedzi do treningu · opcjonalnie", { exact: true })
    .click();
  await page
    .getByRole("link", { name: "Ułóż dłuższy trening →", exact: true })
    .click();
  await page.getByRole("button", { name: "60 minut", exact: true }).click();
  await page.getByLabel("Chcę trenować").selectOption(focus);
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
}

for (const [mode, focus] of [
  ["point", "puenta"],
  ["shoot", "strzał"],
  ["lob", "lob"],
  ["boundary", "słabości"],
  ["target", "słabości"],
] as const satisfies readonly (readonly [Mode, string])[]) {
  test(`100% long ${mode} sessions advance through 6 → 7 → 8 m`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    await page.goto("/");
    const seeded = mode === "boundary" || mode === "target";
    if (seeded) {
      await replaceStoredState(page, {
        ...emptyState,
        sessions: [11, 12].map((day) => ({
          ...nextStepSeries(mode, 6, 20, day),
          drillId: drillForMode[mode],
        })),
      });
      await page.reload();
    }
    const observations: unknown[] = [];
    for (let i = 0; i < 3; i++) {
      await startLongTrainingFromHome(page, focus);
      const counts = await finishPerfectTraining(page);
      expect(counts).toEqual({ 6: 20 });
      observations.push({ session: i + 1, counts, hits: 20, rate: 100 });
      if (i < 2 && !seeded)
        await expect(
          page.getByRole("button", { name: "SPRÓBUJ TRUDNIEJ", exact: true }),
        ).toHaveCount(0);
    }
    await expect(
      page.locator(".notice").filter({
        has: page.getByRole("button", {
          name: "SPRÓBUJ TRUDNIEJ",
          exact: true,
        }),
      }),
    ).toContainText("6 m → 7 m");
    await page
      .getByRole("button", { name: "SPRÓBUJ TRUDNIEJ", exact: true })
      .click();
    expect(await finishPerfectTraining(page)).toEqual({ 7: 20 });
    for (let i = 0; i < 3; i++) {
      await startLongTrainingFromHome(page, focus);
      const counts = await finishPerfectTraining(page);
      expect(counts).toEqual({ 7: 20 });
      observations.push({ session: i + 4, counts, hits: 20, rate: 100 });
    }
    await page.reload();
    await expect(
      page.locator(".notice").filter({
        has: page.getByRole("button", {
          name: "SPRÓBUJ TRUDNIEJ",
          exact: true,
        }),
      }),
    ).toContainText("7 m → 8 m");
    await page
      .getByRole("button", { name: "SPRÓBUJ TRUDNIEJ", exact: true })
      .click();
    expect(await finishPerfectTraining(page)).toEqual({ 8: 20 });
    const state = await readStoredState(page);
    expect(state.sessions).toHaveLength(seeded ? 10 : 8);
    expect(state.sessions.every((s) => s.results.every((a) => a.hit))).toBe(
      true,
    );
    await testInfo.attach("observed-progression", {
      body: JSON.stringify(observations, null, 2),
      contentType: "application/json",
    });
    await page.screenshot({
      path: testInfo.outputPath("after-advancing-to-8m.png"),
      fullPage: true,
    });
    await startLongTrainingFromHome(page, focus);
    const next = (await readStoredState(page)).draft!;
    expect(next.plan[next.trainingPlan!.blocks[2].start]).toMatchObject({
      mode,
      distance: 8,
    });
  });
}
