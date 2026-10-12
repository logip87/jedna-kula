import type { Page } from "@playwright/test";
import type { State } from "../../src/domain";
export async function readStoredState(page: Page): Promise<State> {
  return page.evaluate(
    () =>
      new Promise<State>((resolve, reject) => {
        const open = indexedDB.open("jedna-kula", 1);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const transaction = db.transaction("state", "readonly");
          const request = transaction.objectStore("state").get("local");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
          transaction.oncomplete = () => db.close();
        };
      }),
  );
}
export async function replaceStoredState(page: Page, value: unknown) {
  await page.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("jedna-kula", 1);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const transaction = db.transaction("state", "readwrite");
          transaction.objectStore("state").put(value, "local");
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onabort = () => reject(transaction.error);
        };
      }),
    value,
  );
}
