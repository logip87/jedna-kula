import { test, expect } from "@playwright/test";

test("feedback menu sends only entered fields and prevents duplicate submissions", async ({
  page,
}) => {
  const submissions: Record<string, unknown>[] = [];
  let release = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/feedback.php", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { csrf: "test-csrf" } });
    } else {
      submissions.push(route.request().postDataJSON());
      await pending;
      await route.fulfill({ json: { ok: true } });
    }
  });
  await page.goto("/more");
  await page
    .getByRole("link", { name: "Zgłoś pomysł / problem", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Zgłoś pomysł / problem", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Rodzaj zgłoszenia").selectOption("problem");
  await page
    .getByLabel("Twoje zgłoszenie", { exact: true })
    .fill("Po wznowieniu treningu nie widzę ostatniego rzutu.");
  await page.getByLabel("Twój e-mail (opcjonalnie)").fill("reply@example.com");
  await page.getByRole("button", { name: "Wyślij", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Wysyłanie…", exact: true }),
  ).toBeDisabled();
  await page
    .locator("form")
    .evaluate((form) => (form as HTMLFormElement).requestSubmit());
  await expect.poll(() => submissions.length).toBe(1);
  release();
  await expect(page.getByRole("status")).toContainText(
    "Serwer przyjął wiadomość do wysyłki na p.logasz@gmail.com",
  );
  expect(submissions).toEqual([
    {
      kind: "problem",
      message: "Po wznowieniu treningu nie widzę ostatniego rzutu.",
      email: "reply@example.com",
      website: "",
      csrf: "test-csrf",
    },
  ]);
  await page.getByRole("button", { name: "Dodaj kolejne zgłoszenie" }).click();
  await expect(
    page.getByLabel("Twoje zgłoszenie", { exact: true }),
  ).toHaveValue("");
});

test("feedback validates, retains content on errors and allows retry without email", async ({
  page,
}) => {
  let posted = 0;
  await page.route("**/api/feedback.php", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { csrf: "test-csrf" } });
    posted++;
    await route.fulfill(
      posted === 1
        ? { status: 503, json: { error: "Serwer nie mógł wysłać wiadomości." } }
        : { json: { ok: true } },
    );
  });
  await page.goto("/feedback");
  await page.getByRole("button", { name: "Wyślij", exact: true }).click();
  expect(posted).toBe(0);
  await page
    .getByLabel("Twoje zgłoszenie", { exact: true })
    .fill("Proponuję dodać przycisk zmiany koloru kuli.");
  await page.getByLabel("Twój e-mail (opcjonalnie)").fill("błędny-adres");
  await page.getByRole("button", { name: "Wyślij", exact: true }).click();
  expect(posted).toBe(0);
  await page.getByLabel("Twój e-mail (opcjonalnie)").fill("");
  await page.getByRole("button", { name: "Wyślij", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Serwer nie mógł wysłać wiadomości.",
  );
  await expect(
    page.getByLabel("Twoje zgłoszenie", { exact: true }),
  ).toHaveValue("Proponuję dodać przycisk zmiany koloru kuli.");
  await page.getByRole("button", { name: "Wyślij", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Dziękujemy za zgłoszenie!",
  );
  expect(posted).toBe(2);
});

test("feedback remains accessible at 320px and does not lose an offline message", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/feedback");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByLabel("Twoje zgłoszenie", { exact: true })
    .fill("Pomysł zapisany bez połączenia z internetem.");
  await context.setOffline(true);
  await page.getByRole("button", { name: "Wyślij", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("potrzebujesz internetu");
  await expect(
    page.getByLabel("Twoje zgłoszenie", { exact: true }),
  ).toHaveValue("Pomysł zapisany bez połączenia z internetem.");
});
