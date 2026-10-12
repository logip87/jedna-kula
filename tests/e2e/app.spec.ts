import { test, expect, type Page } from "@playwright/test";
async function begin(page: Page, id = "point-basic") {
  await page.goto(`/training/${id}`);
  await page.getByRole("button", { name: "Zaczynam", exact: true }).click();
}
test(
  "pointing result reaches history and progress after restart",
  { tag: ["@showcase", "@smoke", "@e2e"] },
  async ({ page }) => {
    await begin(page);
    for (let i = 0; i < 6; i++) {
      await expect(
        page.getByText(`Rzut ${i + 1} / 6`, { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: i < 3 ? "0–30 cm +3 pkt" : "31–60 cm +2 pkt",
          exact: true,
        })
        .click();
      if (i === 2) {
        await expect(
          page.getByText("Rzut 4 / 6", { exact: true }),
        ).toBeVisible();
        await page.reload();
      }
    }
    await page.getByLabel("Używałem rutyny").check();
    await page
      .getByRole("button", { name: "Zapisz wynik", exact: true })
      .click();
    await expect(
      page.getByText("ZAPISANY TRENING", { exact: true }),
    ).toBeVisible();
    await page.goto("/history");
    await expect(
      page.getByRole("link", { name: /Puenta podstawowa/ }),
    ).toContainText("15 pkt");
    await page.reload();
    await expect(
      page.getByRole("link", { name: /Puenta podstawowa/ }),
    ).toContainText("15 pkt");
    await page.goto("/progress");
    await expect(page.getByText("Rutyna w 100% treningów.")).toBeVisible();
    await expect(
      page.getByText("Celność puenty", { exact: true }),
    ).toBeVisible();
  },
);
test(
  "mental completion persists independently from technical sessions",
  { tag: ["@showcase", "@e2e"] },
  async ({ page }) => {
    await page.goto("/lessons/one");
    await page.getByRole("button", { name: "Zaliczone · zapamiętuję" }).click();
    await expect(
      page.getByRole("button", { name: "Zaliczone", exact: true }),
    ).toBeDisabled();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Zaliczone", exact: true }),
    ).toBeDisabled();
    await page.goto("/lessons");
    await expect(
      page.getByText("1 / 25 zaliczonych", { exact: true }),
    ).toBeVisible();
  },
);
test(
  "profile level, role and hand persist without a required age",
  { tag: ["@showcase", "@e2e"] },
  async ({ page, context }) => {
    await page.goto("/profile");
    await page.getByLabel("Jak masz na imię?").fill("Ola");
    await page.getByLabel("Poziom gry").selectOption("tournament");
    await page.getByLabel("Preferowana rola").selectOption("middle");
    await page.getByLabel("Rzucam ręką").selectOption("lewa");
    await page.getByRole("button", { name: "Zapisz profil" }).click();
    await expect(page.getByRole("status")).toHaveText("Profil zapisany.");
    await page.close();
    const reopened = await context.newPage();
    await reopened.goto("/profile");
    await expect(reopened.getByLabel("Jak masz na imię?")).toHaveValue("Ola");
    await expect(reopened.getByLabel("Poziom gry")).toHaveValue("tournament");
    await expect(reopened.getByLabel("Preferowana rola")).toHaveValue("middle");
    await expect(reopened.getByLabel("Rzucam ręką")).toHaveValue("lewa");
    await expect(reopened.getByLabel("Wiek (opcjonalnie)")).toHaveValue("");
  },
);
test(
  "pressure shooting counts removals but not touches",
  { tag: ["@showcase", "@e2e"] },
  async ({ page }) => {
    await begin(page, "pressure");
    for (let i = 0; i < 5; i++) {
      await expect(
        page.getByText(`Rzut ${i + 1} / 5`, { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: i < 3 ? "Czyste trafienie +3 pkt" : "Dotknięcie +1 pkt",
          exact: true,
        })
        .click();
    }
    await page.getByText("Zobacz szczegóły", { exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Wyzwanie zaliczone!" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Zapisz wynik" }).click();
    await expect(
      page.getByText("ZAPISANY TRENING", { exact: true }),
    ).toBeVisible();
    await page.getByText("Zobacz szczegóły", { exact: true }).click();
    await expect(
      page.getByText("3 / 3 wymaganych trafień.", { exact: true }),
    ).toBeVisible();
  },
);
test("lob and situational decisions use the engine", async ({ page }) => {
  await begin(page, "lob");
  await expect(
    page.getByRole("button", { name: "0–30 cm od świnki +3 pkt", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Tak, w kole" }).click();
  await page
    .getByRole("button", { name: "0–30 cm od świnki +3 pkt", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Zakończ trening", exact: true })
    .click();
  await page.getByRole("link", { name: "Podsumuj trening" }).click();
  await page.getByText("Zobacz szczegóły", { exact: true }).click();
  await expect(
    page.getByText("Trafienie w strefę lądowania: 100%"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zapisz wynik" }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await begin(page, "situation");
  await expect(
    page.getByRole("button", { name: "0–30 cm +3 pkt", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Strzelam kulę rywala" }).click();
  await page
    .getByRole("button", { name: "Czyste trafienie +3 pkt", exact: true })
    .click();
  await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
});
test("offline shell, lessons, session saving and history after browser page restart", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  await begin(page);
  for (let i = 0; i < 6; i++) {
    await expect(
      page.getByText(`Rzut ${i + 1} / 6`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Zapisz wynik" }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.goto("/lessons/routine");
  await page.getByRole("button", { name: "Zaliczone · zapamiętuję" }).click();
  await expect(
    page.getByRole("button", { name: "Zaliczone", exact: true }),
  ).toBeDisabled();
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto("/history");
  await expect(
    reopened.getByRole("link", { name: /Puenta podstawowa/ }),
  ).toContainText("18 pkt");
  await reopened.goto("/lessons/routine");
  await expect(
    reopened.getByRole("button", { name: "Zaliczone", exact: true }),
  ).toBeDisabled();
});
test("cancel deletion keeps history and navigation remains usable on mobile", async ({
  page,
}) => {
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Usuń historię treningów", exact: true })
    .click();
  await page.getByRole("button", { name: "Anuluj", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tak, usuń historię" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Więcej", exact: true }).click();
  await page.getByRole("link", { name: "Lekcje", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Trening mentalny" }),
  ).toBeVisible();
});

test(
  "a storage failure keeps the attempt open and permits retry",
  { tag: ["@showcase", "@resilience"] },
  async ({ page }) => {
    await begin(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.evaluate(() => {
      const original = IDBObjectStore.prototype.put;
      (window as unknown as { restoreStorage: () => void }).restoreStorage =
        () => {
          IDBObjectStore.prototype.put = original;
        };
      IDBObjectStore.prototype.put = () => {
        throw new DOMException("No space", "QuotaExceededError");
      };
    });
    await page
      .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Nie udało się zapisać danych",
    );
    await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
    await page.evaluate(() =>
      (window as unknown as { restoreStorage: () => void }).restoreStorage(),
    );
    await page
      .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
      .click();
    await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  },
);

test("timed mixed training saves technical and mental stages", async ({
  page,
}) => {
  await begin(page, "complete");
  await expect(page.getByText("ETAP 1 / 4 · Rozgrzewka")).toBeVisible();
  await page.getByRole("button", { name: "Zakończ etap wcześniej" }).click();
  await page
    .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
    .click();
  await page.getByRole("button", { name: "Zakończ etap wcześniej" }).click();
  await page
    .getByRole("button", { name: "Czyste trafienie +3 pkt", exact: true })
    .click();
  await page.getByRole("button", { name: "Zakończ etap wcześniej" }).click();
  await page
    .getByRole("button", { name: "Zaliczone · podsumuj trening" })
    .click();
  await page.getByRole("button", { name: "Zapisz wynik" }).click();
  await expect(
    page.getByText("ZAPISANY TRENING", { exact: true }),
  ).toBeVisible();
  await page.getByText("Twoja głowa podczas treningu", { exact: true }).click();
  await expect(page.getByText("Ćwiczenie mentalne: zaliczone")).toBeVisible();
  await expect(
    page.getByText("100% skuteczności", { exact: true }),
  ).toBeVisible();
});

test("PWA metadata and mobile and desktop layouts", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dzisiaj", exact: true }),
  ).toBeVisible();
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.lang).toBe("pl");
  for (const icon of manifest.icons) {
    expect((await page.request.get(icon.src)).ok()).toBe(true);
  }
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  for (const path of [
    "/training",
    "/lessons",
    "/progress",
    "/more",
    "/profile",
    "/settings",
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("beginner guide starts at six metres and library filters help discovery", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByText("Poznaj pozostałe możliwości", { exact: true }).click();
  await page.getByText("Pierwszy raz z pétanque?", { exact: true }).click();
  await expect(
    page.getByText("01 · Poznaj cel", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Mój pierwszy trening", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Poziom", exact: true }),
  ).toHaveValue("łatwy");
  await expect(
    page.getByRole("combobox", { name: "Odległość", exact: true }),
  ).toHaveValue("6");
  await page.goto("/training");
  await page
    .getByRole("button", { name: "Na dobry początek", exact: true })
    .click();
  await expect(
    page.getByText("Ćwiczenia dla Ciebie: 4", { exact: true }),
  ).toBeVisible();
  await page.getByRole("searchbox", { name: "Szukaj ćwiczenia" }).fill("lob");
  await expect(
    page.getByText("Ćwiczenia dla Ciebie: 1", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Lob podstawowy/ }),
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Szukaj ćwiczenia" })
    .fill("nieistniejące");
  await page.getByRole("button", { name: "Pokaż wszystkie ćwiczenia" }).click();
  await expect(
    page.getByText("Ćwiczenia dla Ciebie: 30", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await page.getByText("Poznaj pozostałe możliwości", { exact: true }).click();
  await page.getByText("Pierwszy raz z pétanque?", { exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("essential screens pass automated WCAG checks", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const path of [
    "/",
    "/training",
    "/training/point-basic?level=easy",
    "/lessons",
    "/lessons/one",
    "/progress",
    "/profile",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
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
  }
  await begin(page);
  const active = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    active.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
