import { test, expect } from "@playwright/test";
import { cleanState, completedSession } from "../support/data";
import { readStoredState, replaceStoredState } from "../support/indexeddb";
test.describe(
  "Local application security boundaries",
  { tag: ["@showcase", "@security"] },
  () => {
    test("XSS-like profile name is escaped and never becomes an executable element", async ({
      page,
    }) => {
      const payload = "<img src=x onerror=window.qaXss=1>";
      await page.goto("/profile");
      await page.getByLabel("Jak masz na imię?").fill(payload);
      await page
        .getByRole("button", { name: "Zapisz profil", exact: true })
        .click();
      await expect(page.getByRole("status")).toHaveText("Profil zapisany.");
      await page.goto("/");
      await expect(page.locator(".greeting")).toContainText(payload);
      await expect(page.locator('img[src="x"]')).toHaveCount(0);
      expect(await page.evaluate(() => Object.hasOwn(window, "qaXss"))).toBe(
        false,
      );
    });
    test("corrupted persisted data produces a controlled error without deleting evidence", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Dzisiaj", exact: true }),
      ).toBeVisible();
      const corrupt = {
        ...cleanState(),
        sessions: [{ id: "broken", score: "not-a-number" }],
      };
      await replaceStoredState(page, corrupt);
      await page.reload();
      await expect(page.getByRole("alert")).toContainText(
        "Zapisane dane są uszkodzone. Nie zostały usunięte.",
      );
      expect(errors).toEqual([]);
      expect(await readStoredState(page)).toEqual(corrupt);
    });
    test("forged import score is rejected before replacing profile or history", async ({
      page,
    }) => {
      await page.goto("/profile");
      await page.getByLabel("Jak masz na imię?").fill("Gracz QA");
      await page
        .getByRole("button", { name: "Zapisz profil", exact: true })
        .click();
      await expect(page.getByRole("status")).toHaveText("Profil zapisany.");
      const before = await readStoredState(page);
      const session = { ...completedSession(), score: 999 };
      await page.goto("/settings");
      await page.getByLabel("Wybierz kopię").setInputFiles({
        name: "corrupted.json",
        mimeType: "application/json",
        buffer: Buffer.from(
          JSON.stringify({ ...cleanState(), sessions: [session] }),
        ),
      });
      await expect(page.getByRole("alert")).toContainText("suma punktów");
      await expect(
        page.getByRole("button", {
          name: "Tak, zastąp dane kopią",
          exact: true,
        }),
      ).toHaveCount(0);
      expect(await readStoredState(page)).toEqual(before);
    });
  },
);
