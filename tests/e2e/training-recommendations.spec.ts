import { expect, test } from "@playwright/test";
import { choices, emptyState, type Session } from "../../src/domain";
import { replaceStoredState } from "../support/indexeddb";

function shootingSeries(day: string, hits = 7): Session {
  const plan = Array.from({ length: 10 }, () => ({
    mode: "shoot" as const,
    distance: 8,
  }));
  const results = plan.map((attempt, index) => {
    const choice = choices.shoot.find((item) => item.hit === index < hits)!;
    return {
      ...attempt,
      id: `${day}-${index}`,
      result: choice.label,
      points: choice.points,
      hit: choice.hit,
      carreau: !!choice.carreau,
      outside: !!choice.outside,
    };
  });
  return {
    id: day,
    drillId: "shoot-basic",
    startedAt: `${day}T10:00:00Z`,
    completedAt: `${day}T10:30:00Z`,
    difficulty: "średni",
    targetSize: 50,
    boundary: 40,
    plan,
    results,
    score: results.reduce((sum, result) => sum + result.points, 0),
  };
}

test("training library separates a starter shelf from the full catalogue", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-26T12:00:00Z"));
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/training");
  await expect(
    page.getByRole("heading", { name: "Polecane na start", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Dobry trening na początek.").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Mój pierwszy trening/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Wszystkie ćwiczenia", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("training library and generator use the player's shooter preference", async ({
  page,
}) => {
  await page.goto("/");
  await replaceStoredState(page, {
    ...emptyState,
    player: {
      id: "shooter",
      name: "",
      preferredRole: "strzelec",
      preferredHand: "prawa",
      createdAt: "2026-10-01T10:00:00Z",
    },
  });
  await page.goto("/training");
  await expect(
    page.getByRole("combobox", { name: "Rodzaj treningu" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: /Mój pierwszy trening/ }).click();
  await expect(
    page.getByRole("heading", { name: "Strzał podstawowy", exact: true }),
  ).toBeVisible();
  await page.goto("/coach/generator");
  await expect(page.getByLabel("Chcę trenować")).toHaveValue("strzał");
});

test("training library explains a data-based recommendation and keeps manual choice", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-26T12:00:00Z"));
  await page.goto("/");
  await replaceStoredState(page, {
    ...emptyState,
    sessions: [shootingSeries("2026-10-24"), shootingSeries("2026-10-25")],
  });
  await page.goto("/training");
  await expect(
    page.getByRole("heading", { name: "Polecane dla Ciebie", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Dlaczego to widzisz").first()).toBeVisible();
  await expect(
    page.getByText("To obecnie Twój słabszy element.").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Trenuj słabość/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Puenta podstawowa" }).last().click();
  await expect(
    page.getByRole("heading", { name: "Puenta podstawowa", exact: true }),
  ).toBeVisible();
});
