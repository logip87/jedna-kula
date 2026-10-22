import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("quick start works without name or ranking, persists and starts the chosen drill", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Od grania do trenowania." }),
  ).toBeVisible();
  await page.getByLabel("Jak dziś grasz?").selectOption("club");
  await page.getByLabel("Co chcesz osiągnąć?").selectOption("shoot");
  await page
    .getByRole("button", { name: "Dopasuj trening", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Strzał 6 m", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Strzał 6 m", exact: true }),
  ).toBeVisible();
  await page.goto("/profile");
  await expect(page.getByLabel("Jak dziś grasz?")).toHaveValue("club");
  await expect(page.getByLabel("Co chcesz osiągnąć?")).toHaveValue("shoot");
  await page.getByLabel("Jak masz na imię?").fill("Ola");
  await page.getByRole("button", { name: "Zapisz profil" }).click();
  await expect(page.getByText("Profil zapisany.")).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Strzał 6 m", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ZACZNIJ TRENING", exact: true })
    .click();
  await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Czyste trafienie/ }),
  ).toBeVisible();
});

test("skip keeps training accessible and the goal can be set later in profile", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Później — przejdź do treningu" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Dopasuj trening", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "ZACZNIJ TRENING", exact: true }),
  ).toBeEnabled();
  await page.goto("/profile");
  await page.getByLabel("Jak masz na imię?").fill("Ola");
  await page.getByLabel("Co chcesz osiągnąć?").selectOption("decisions");
  await page.getByRole("button", { name: "Zapisz profil" }).click();
  await expect(page.getByText("Profil zapisany.")).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Przećwicz decyzję meczową →" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Przećwicz decyzję meczową →" }).click();
  await expect(page).toHaveURL(/\/adventure\/tactics/);
});

test("mobile onboarding fits, stays accessible and keeps advanced tools collapsed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByLabel("Jak dziś grasz?").selectOption("focused");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect(
    page.getByRole("link", { name: "Testy kontrolne", exact: true }),
  ).toBeHidden();
  await page
    .getByText("Zaawansowane warianty i sprawdziany", { exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Testy kontrolne", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("onboarding-mobile.png"),
    fullPage: true,
  });
  await page.goto("/more");
  await expect(
    page.getByRole("heading", { name: "Konsultacje merytoryczne" }),
  ).toBeVisible();
  await expect(page.getByText(/Senior QA Automation Engineerem/)).toBeVisible();
});
