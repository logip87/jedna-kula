import { expect, test, type BrowserContext } from "@playwright/test";

async function installedApp(context: BrowserContext) {
  await context.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const result = original(query);
      if (query === "(display-mode: standalone)")
        Object.defineProperty(result, "matches", { value: true });
      return result;
    };
  });
}

test("installed app shows profile prompt once even when skipped, reopened or caches updated", async ({
  page,
  context,
}) => {
  await installedApp(context);
  await page.goto("/");
  const prompt = page.getByRole("region", { name: "Uzupełnij profil" });
  await expect(prompt).toBeVisible();
  // No acknowledgement or completed profile is required to remember the display.
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  await expect(prompt).toHaveCount(0);
  await page.evaluate(async () => {
    for (const name of await caches.keys()) await caches.delete(name);
  });
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto("/");
  await expect(
    reopened.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  await expect(
    reopened.getByRole("region", { name: "Uzupełnij profil" }),
  ).toHaveCount(0);
  await reopened.evaluate(() =>
    window.dispatchEvent(new Event("appinstalled")),
  );
  await expect(
    reopened.getByRole("region", { name: "Uzupełnij profil" }),
  ).toHaveCount(0);
});

test("installation offers profile with working actions only once", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  const prompt = page.getByRole("region", { name: "Uzupełnij profil" });
  await expect(prompt).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(prompt).toBeVisible();
  await prompt.getByRole("link", { name: "Uzupełnij", exact: true }).click();
  await expect(page.getByLabel("Jak masz na imię?")).toBeVisible();
  await page.goto("/");
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(prompt).toHaveCount(0);
});

test("existing profile is not prompted after installation", async ({
  page,
  context,
}) => {
  await page.goto("/profile");
  await page.getByLabel("Jak masz na imię?").fill("Ola");
  await page.getByRole("button", { name: "Zapisz profil" }).click();
  await expect(page.getByRole("status")).toHaveText("Profil zapisany.");
  await installedApp(context);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Uzupełnij profil" }),
  ).toHaveCount(0);
});
