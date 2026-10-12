import { test, expect } from "@playwright/test";
import { beginTraining } from "../support/training";
import { readStoredState } from "../support/indexeddb";
test(
  "delayed commit acknowledgement holds the UI and rejects repeated clicks",
  { tag: ["@showcase", "@resilience"] },
  async ({ page }) => {
    await beginTraining(page);
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
    const result = page.getByRole("button", {
      name: "0–30 cm +3 pkt",
      exact: true,
    });
    await result.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
      button.click();
    });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            !!(window as unknown as { qaCommitHeld?: boolean }).qaCommitHeld,
        ),
      )
      .toBe(true);
    await expect(result).toBeDisabled();
    await expect(page.getByText("Rzut 1 / 6", { exact: true })).toBeVisible();
    await page.evaluate(() =>
      (window as unknown as { qaRelease: () => void }).qaRelease(),
    );
    await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
    const stored = await readStoredState(page);
    expect(stored.draft?.results).toHaveLength(1);
    expect(stored.draft?.score).toBe(3);
    await page.reload();
    await expect(page.getByText("Rzut 2 / 6", { exact: true })).toBeVisible();
  },
);
