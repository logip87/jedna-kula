import { cachedApp } from "../support/training";
import { expect, test, type Locator } from "@playwright/test";
import { expectNoHorizontalOverflow as fitsViewport } from "../support/ui-layout";

async function touchTarget(control: Locator) {
  await expect(control).toBeVisible();
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
}

async function enlargeText(container: Locator, factor: number) {
  await container.evaluate((root, multiple) => {
    const elements = Array.from(root.querySelectorAll<HTMLElement>("*"));
    const sizes = elements.map((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    );
    elements.forEach((element, index) => {
      element.style.fontSize = `${sizes[index] * multiple}px`;
    });
  }, factor);
}

test.describe("Narrow screens and touch controls", { tag: "@showcase" }, () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
  });

  test("the longest allowed profile name stays inside the dashboard", async ({
    page,
  }) => {
    const name = "W".repeat(40);
    await page.goto("/profile");
    await page.getByLabel("Jak masz na imię?").fill(name);
    await page.getByRole("button", { name: "Zapisz profil" }).click();
    await expect(page.getByRole("status")).toHaveText("Profil zapisany.");
    await page.goto("/");
    await expect(page.locator(".greeting .muted")).toContainText(name);
    await fitsViewport(page);
  });

  test("long duel names fit the active scoreboard and saved result", async ({
    page,
  }) => {
    const first = "W".repeat(30);
    const second = "A".repeat(30);
    await page.goto("/adventure/duel");
    await page.getByLabel("Pierwsza osoba").fill(first);
    await page.getByLabel("Druga osoba").fill(second);
    await page.getByRole("button", { name: "Rozpocznij wyzwanie" }).click();
    for (let attempt = 0; attempt < 6; attempt++) {
      await expect(
        page.getByRole("heading", {
          name: `Teraz: ${attempt % 2 === 0 ? first : second}`,
          exact: true,
        }),
      ).toBeVisible();
      await fitsViewport(page);
      await page
        .getByRole("button", {
          name: attempt % 2 === 0 ? "0–30 cm +3 pkt" : "Ponad 100 cm +0 pkt",
          exact: true,
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: `Wygrywa ${first}`, exact: true }),
    ).toBeVisible();
    await fitsViewport(page);
    await page.getByText("Historia wyzwań (1)", { exact: true }).click();
    await fitsViewport(page);
  });

  test("installation prompt offers a full size dismiss control", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Dzisiaj", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
    const prompt = page.getByRole("region", { name: "Uzupełnij profil" });
    const later = prompt.getByRole("button", { name: "Później", exact: true });
    await touchTarget(later);
    await later.click();
    await expect(prompt).toHaveCount(0);
  });

  test("offline status and installation keep header actions reachable", async ({
    page,
    context,
  }) => {
    // Offline navigation requires a completed PWA cache, including deferred screens.
    await cachedApp(page);
    await expect(
      page.getByRole("heading", { name: "Dzisiaj", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => {
      const event = new Event("beforeinstallprompt", { cancelable: true });
      Object.assign(event, {
        prompt: async () => {},
        userChoice: Promise.resolve({ outcome: "accepted" }),
      });
      window.dispatchEvent(event);
    });
    await context.setOffline(true);
    await expect(page.locator(".offline")).toBeVisible();
    const install = page.getByRole("button", {
      name: "Zainstaluj aplikację",
      exact: true,
    });
    const profile = page.locator(".avatar");
    for (const enlarged of [false, true]) {
      if (enlarged) await enlargeText(page.locator(".topbar"), 1.5);
      await touchTarget(install);
      await touchTarget(profile);
      await fitsViewport(page);
      const headerControls = await page
        .locator(".topbar")
        .evaluate((header) => {
          return Array.from(
            header.querySelectorAll<HTMLElement>(
              ".mobile-brand, .offline, .install, .avatar",
            ),
          ).map((control) => {
            const { x, y, width, height } = control.getBoundingClientRect();
            return { x, y, width, height };
          });
        });
      for (let index = 0; index < headerControls.length; index++) {
        for (let other = index + 1; other < headerControls.length; other++) {
          const first = headerControls[index];
          const second = headerControls[other];
          const overlapWidth =
            Math.min(first.x + first.width, second.x + second.width) -
            Math.max(first.x, second.x);
          const overlapHeight =
            Math.min(first.y + first.height, second.y + second.height) -
            Math.max(first.y, second.y);
          expect(overlapWidth <= 0 || overlapHeight <= 0).toBe(true);
        }
      }
    }
    await install.click();
    await expect(install).toHaveCount(0);
    await profile.click();
    await expect(page.getByLabel("Jak masz na imię?")).toBeVisible();
  });

  test("match interruption controls are easy to tap and preserve cancellation", async ({
    page,
  }) => {
    await page.goto("/coach/match");
    await page.getByRole("button", { name: "Zacznij trening meczowy" }).click();
    const interrupt = page.getByRole("button", {
      name: "Przerwij trening meczowy",
    });
    await interrupt.click();
    const confirm = page.getByRole("button", {
      name: "Tak, przerwij",
      exact: true,
    });
    const cancel = page.getByRole("button", {
      name: "Wróć do meczu",
      exact: true,
    });
    await touchTarget(confirm);
    await touchTarget(cancel);
    await fitsViewport(page);
    await cancel.click();
    await expect(confirm).toHaveCount(0);
    await expect(page.locator(".tactic-options button").first()).toBeVisible();
    await interrupt.click();
    await confirm.click();
    await expect(
      page.getByRole("button", { name: "Zacznij trening meczowy" }),
    ).toBeVisible();
  });

  test("standalone secondary links retain their full tap area", async ({
    page,
  }) => {
    await page.goto("/training");
    await touchTarget(
      page.getByRole("link", {
        name: "Ułóż trening na 10, 20 lub 30 minut",
        exact: true,
      }),
    );
    await page.goto("/progress");
    await touchTarget(
      page.getByRole("link", { name: "Testy kontrolne", exact: true }),
    );
    await touchTarget(
      page.getByRole("link", {
        name: "Zobacz historię treningów",
        exact: true,
      }),
    );
  });

  test("training detail keeps instructions and setup inside tablet widths", async ({
    page,
  }) => {
    for (const width of [761, 768, 820, 1000, 1001, 1024, 1050]) {
      await page.setViewportSize({ width, height: 1024 });
      await page.goto("/training/point-basic");
      await expect(
        page.getByRole("button", { name: "Zaczynam", exact: true }),
      ).toBeVisible();
      await fitsViewport(page);
      const configuration = await page
        .locator(".detail-layout .config")
        .boundingBox();
      expect(configuration).not.toBeNull();
      expect(configuration!.x + configuration!.width).toBeLessThanOrEqual(
        width,
      );
    }
  });

  test("large metric values stay readable with enlarged text", async ({
    page,
  }) => {
    await page.goto("/progress");
    await expect(page.locator(".metric strong")).toHaveCount(6);
    await page.locator(".metric strong").evaluateAll((values) => {
      // Stress the existing presentation without generating artificial history.
      for (const value of values) value.textContent = "123456789";
    });
    await enlargeText(page.locator("main"), 1.25);
    await fitsViewport(page);
    for (const metric of await page.locator(".metric").all()) {
      const value = metric.locator("strong");
      expect(
        await value.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
    }
  });
});
