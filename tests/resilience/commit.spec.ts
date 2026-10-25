import { test, expect, type Page } from "@playwright/test";
import { beginTraining } from "../support/training";
import { readStoredState } from "../support/indexeddb";

async function holdNextCommit(page: Page) {
  await page.evaluate(() => {
    const original = IDBTransaction.prototype.addEventListener;
    const controls = window as unknown as {
      qaRelease?: () => void;
      qaCommitHeld?: boolean;
    };
    IDBTransaction.prototype.addEventListener = function (
      this: IDBTransaction,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (!listener) return;
      if (type === "complete" && this.mode === "readwrite") {
        const hold: EventListener = (event) => {
          controls.qaCommitHeld = true;
          controls.qaRelease = () => {
            IDBTransaction.prototype.addEventListener = original;
            if (typeof listener === "function") listener.call(this, event);
            else listener?.handleEvent(event);
          };
        };
        return original.call(this, type, hold, options);
      }
      return original.call(this, type, listener, options);
    };
  });
}

async function expectHeldCommit(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => !!(window as unknown as { qaCommitHeld?: boolean }).qaCommitHeld,
      ),
    )
    .toBe(true);
}

async function releaseCommit(page: Page) {
  await page.evaluate(() =>
    (window as unknown as { qaRelease: () => void }).qaRelease(),
  );
}
test(
  "delayed commit acknowledgement holds the UI and rejects repeated clicks",
  { tag: ["@showcase", "@resilience"] },
  async ({ page }) => {
    await beginTraining(page);
    await holdNextCommit(page);
    const result = page.getByRole("button", {
      name: "0–30 cm +3 pkt",
      exact: true,
    });
    await result.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
      button.click();
    });
    await expectHeldCommit(page);
    await expect(result).toBeDisabled();
    await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
    await releaseCommit(page);
    await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
    const stored = await readStoredState(page);
    expect(stored.draft?.results).toHaveLength(1);
    expect(stored.draft?.score).toBe(3);
    await page.reload();
    await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
  },
);

for (const action of ["last throw", "final result"] as const) {
  test(
    `leaving during the delayed ${action} commit preserves the chosen screen and persisted data`,
    { tag: ["@showcase", "@resilience"] },
    async ({ page }) => {
      await beginTraining(page);
      for (let index = 0; index < 5; index++) {
        await expect(
          page.getByText(`Rzut ${index + 1} / 6`, { exact: true }),
        ).toBeVisible();
        await page
          .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
          .click();
      }
      await expect(page.getByText("Rzut 6 / 6", { exact: true })).toBeVisible();
      if (action === "final result") {
        await page
          .getByRole("button", { name: "0–30 cm +3 pkt", exact: true })
          .click();
        await expect(
          page.getByRole("button", { name: "Zapisz wynik", exact: true }),
        ).toBeVisible();
      }
      await holdNextCommit(page);
      await page
        .getByRole("button", {
          name: action === "last throw" ? "0–30 cm +3 pkt" : "Zapisz wynik",
          exact: true,
        })
        .click();
      await expectHeldCommit(page);
      await page
        .getByRole("banner")
        .getByRole("link", { name: "jedna kula", exact: true })
        .click();
      await expect(page).toHaveURL(/\/$/);
      await releaseCommit(page);
      if (action === "last throw") {
        await expect(
          page.getByText(
            "6 z 6 rzutów zapisanych. Twoje ustawienia i wyniki czekają.",
            {
              exact: true,
            },
          ),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Wznów trening", exact: true }),
        ).toBeEnabled();
      } else {
        await expect(
          page.getByRole("button", { name: "ZACZNIJ TRENING", exact: true }),
        ).toBeEnabled();
      }
      await expect(page).toHaveURL(/\/$/);
      await page.reload();
      await expect(page).toHaveURL(/\/$/);
      const stored = await readStoredState(page);
      if (action === "last throw") {
        expect(stored.draft?.results).toHaveLength(6);
        expect(stored.draft?.score).toBe(18);
        expect(stored.sessions).toHaveLength(0);
      } else {
        expect(stored.draft).toBeNull();
        expect(stored.sessions).toHaveLength(1);
        expect(stored.sessions[0].results).toHaveLength(6);
        expect(stored.sessions[0].score).toBe(18);
      }
    },
  );
}
