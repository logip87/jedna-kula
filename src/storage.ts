import { parseBackup } from "./features/coaching/backup";
import { openDB, type DBSchema } from "idb";
import { emptyState, type State } from "./domain";
interface AppDB extends DBSchema {
  state: { key: string; value: State };
}
export interface Repository {
  load(): Promise<State>;
  save(state: State): Promise<void>;
  restore(state: State): Promise<void>;
  loadRecovery(): Promise<State | undefined>;
}
export const createRepository = (name = "jedna-kula"): Repository => {
  const db = openDB<AppDB>(name, 1, {
    upgrade(db) {
      db.createObjectStore("state");
    },
  });
  return {
    async load() {
      const stored = await (await db).get("state", "local");
      if (stored === undefined) return structuredClone(emptyState);
      try {
        parseBackup(JSON.stringify(stored));
      } catch {
        throw new Error(
          "Zapisane dane są uszkodzone. Nie zostały usunięte. Zachowaj dane witryny i skontaktuj się z pomocą w sprawie odzyskania kopii.",
        );
      }
      return stored;
    },
    async save(state) {
      await (await db).put("state", structuredClone(state), "local");
    },
    async restore(state) {
      const tx = (await db).transaction("state", "readwrite");
      try {
        const previous = await tx.store.get("local");
        if (previous) await tx.store.put(previous, "before-import");
        await tx.store.put(structuredClone(state), "local");
        await tx.done;
      } catch (error) {
        try {
          tx.abort();
        } catch {
          /* The transaction may already be aborted. */
        }
        await tx.done.catch(() => undefined);
        throw error;
      }
    },
    async loadRecovery() {
      return (await db).get("state", "before-import");
    },
  };
};
export const repository = createRepository();
