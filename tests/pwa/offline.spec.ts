import { test, expect } from "@playwright/test";
import { beginTraining, cachedApp, finishPointing } from "../support/training";
test.describe(
  "PWA production contracts",
  { tag: ["@showcase", "@pwa"] },
  () => {
    test("installed worker caches shell and manifest supports installable offline navigation", async ({
      page,
      context,
    }) => {
      await cachedApp(page);
      const response = await page.request.get("/manifest.webmanifest");
      expect(response.ok()).toBe(true);
      const manifest = await response.json();
      expect(manifest).toMatchObject({
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "pl",
      });
      for (const icon of manifest.icons)
        expect(
          (await page.request.get(`/${icon.src.replace(/^\//, "")}`)).ok(),
        ).toBe(true);
      expect(
        await page.evaluate(async () => {
          const cacheNames = await caches.keys();
          const keys = (
            await Promise.all(
              cacheNames.map(async (name) => (await caches.open(name)).keys()),
            )
          ).flat();
          return keys.some(
            (key) => new URL(key.url).pathname === "/index.html",
          );
        }),
      ).toBe(true);
      await context.setOffline(true);
      await page.goto("/lessons/routine");
      await expect(
        page.getByRole("heading", { name: "Rutyna przed rzutem", exact: true }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Rutyna przed rzutem", exact: true }),
      ).toBeVisible();
    });
    test("full session records real throws and saves history with all networking disabled", async ({
      page,
      context,
    }) => {
      await cachedApp(page);
      await context.setOffline(true);
      await beginTraining(page);
      await finishPointing(page);
      await page.goto("/history");
      await expect(
        page.getByRole("link", { name: /Puenta podstawowa/ }),
      ).toContainText("18 pkt");
    });
    test("offline draft and result survive a new page in the same persistent browser context", async ({
      page,
      context,
    }) => {
      await cachedApp(page);
      await beginTraining(page);
      await page
        .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
        .click();
      await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
      await context.setOffline(true);
      await page.close();
      const reopened = await context.newPage();
      await reopened.goto("/session");
      await expect(
        reopened.getByText("Rzut 2 / 6", { exact: true }),
      ).toBeVisible();
      await reopened
        .getByRole("button", { name: "Zakończ trening", exact: true })
        .click();
      await reopened
        .getByRole("link", { name: "Podsumuj trening", exact: true })
        .click();
      await reopened
        .getByRole("button", { name: "Zapisz wynik", exact: true })
        .click();
      await expect(
        reopened.getByText("ZAPISANY TRENING", { exact: true }),
      ).toBeVisible();
      await reopened.close();
      const history = await context.newPage();
      await history.goto("/history");
      await expect(
        history.getByRole("link", { name: /Puenta podstawowa/ }),
      ).toContainText("3 pkt");
    });
  },
);
