import { test, expect } from "@playwright/test";
import { emptyState, type Session } from "../../src/domain";
import { replaceStoredState, readStoredState } from "../support/indexeddb";
const plan = Array.from({ length: 20 }, (_, i) => ({
  mode: "shoot" as const,
  distance: 6 + Math.floor(i / 5),
}));
const s: Session = {
  id: "benchmark",
  drillId: "test-shoot",
  kind: "test",
  benchmarkVersion: 1,
  startedAt: "2026-09-25T10:00:00",
  completedAt: "2026-09-25T11:00:00",
  difficulty: "średni",
  targetSize: 50,
  boundary: 40,
  surface: "rough",
  plan,
  score: 0,
  results: plan.map((p, i) => ({
    ...p,
    id: `a${i}`,
    result: "Pudło",
    points: 0,
    hit: false,
    carreau: false,
    outside: false,
  })),
};
test("reminder appears on day 30, dismissal survives reload and can be scheduled again", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-24T12:00:00"));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  await replaceStoredState(page, { ...emptyState, sessions: [s] });
  await page.reload();
  const reminder = page.getByRole("region", {
    name: "Przypomnienie: Test strzału",
  });
  await expect(reminder).toHaveCount(0);
  await page.clock.setFixedTime(new Date("2026-10-25T12:00:00"));
  await page.reload();
  await expect(reminder).toContainText("Minęło 30 dni");
  await reminder.getByRole("button", { name: "Pomiń", exact: true }).click();
  await expect(reminder).toHaveCount(0);
  await page.reload();
  await expect(reminder).toHaveCount(0);
  expect(
    (await readStoredState(page)).dismissedTestReminders?.["test-shoot"],
  ).toBe(s.id);
  await page.goto("/history/benchmark");
  await page.getByRole("button", { name: "Zaplanuj kolejny test" }).click();
  await expect(page.getByText(/Zaplanowano\./)).toBeVisible();
  await page.goto("/");
  await reminder
    .getByRole("button", { name: "Zrób test", exact: true })
    .click();
  await expect(page.getByText("Rzut 1 / 20", { exact: true })).toBeVisible();
  const draft = (await readStoredState(page)).draft!;
  expect(draft.kind).toBe("test");
  expect(draft.surface).toBe("rough");
  expect(draft.plan).toEqual(plan);
  expect(draft.results).toEqual([]);
});
test("test summary starts focused practice and preserves an existing draft", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  await replaceStoredState(page, { ...emptyState, sessions: [s] });
  await page.goto("/history/benchmark");
  await expect(
    page.getByText("Równy wynik na wszystkich dystansach."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Trenuj ten element" }).click();
  await expect(page.getByText("Rzut 1 / 20", { exact: true })).toBeVisible();
  const draft = (await readStoredState(page)).draft!;
  expect(draft.kind).toBe("training");
  expect(draft.drillId).toBe("shoot-basic");
  expect(draft.surface).toBe("rough");
  expect(draft.plan.every((p) => p.distance === 6)).toBe(true);
  await page.goto("/history/benchmark");
  await page.getByRole("button", { name: "Wznów otwartą sesję" }).click();
  await expect(page.getByText("Rzut 1 / 20", { exact: true })).toBeVisible();
  expect((await readStoredState(page)).draft?.id).toBe(draft.id);
});
