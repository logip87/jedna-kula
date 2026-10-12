import { useState } from "react";
import { useApp } from "../../app-context";
import type { State } from "../../domain";
import { repository } from "../../storage";
import { downloadBackup, parseBackup, serializeBackup } from "./backup";
export function BackupControls() {
  const { state, restore, busy } = useApp();
  const [candidate, setCandidate] = useState<State | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reading, setReading] = useState(false);
  return (
    <section className="card config">
      <h2>Import kopii JSON</h2>
      <p>
        Obsługujemy kopie wersji 2/3/4/5 i wcześniejsze eksporty Jednej Kuli.
        Przed przywróceniem sprawdzamy cały plik.
      </p>
      <label>
        Wybierz kopię
        <input
          type="file"
          accept=".json,application/json"
          disabled={busy || reading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            setCandidate(null);
            setError("");
            setMessage("");
            if (!file) return;
            setReading(true);
            try {
              if (file.size > 10 * 1024 * 1024)
                throw new Error("Kopia przekracza limit 10 MB.");
              setCandidate(parseBackup(await file.text()));
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Nie udało się odczytać pliku.",
              );
            } finally {
              setReading(false);
            }
          }}
        />
      </label>
      {reading && <p role="status">Sprawdzanie kopii…</p>}
      {error && <p role="alert">{error}</p>}
      {candidate && (
        <div className="notice">
          <h3>Przywrócić tę kopię?</h3>
          <p>
            {candidate.sessions.length} sesji · {candidate.lessons.length}{" "}
            lekcji · profil: {candidate.player?.name ?? "brak"}. Kopia zastąpi
            obecny profil, wyniki i szkice, w tym {state.sessions.length}{" "}
            obecnych sesji. Stan sprzed importu zachowamy lokalnie.
          </p>
          <button
            className="danger"
            disabled={busy}
            onClick={async () => {
              if (await restore(candidate)) {
                setCandidate(null);
                setMessage(
                  "Kopia przywrócona. Stan sprzed importu możesz pobrać poniżej.",
                );
              }
            }}
          >
            Tak, zastąp dane kopią
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => setCandidate(null)}
          >
            Anuluj import
          </button>
        </div>
      )}
      {message && <p role="status">{message}</p>}
      <button
        className="secondary"
        disabled={busy}
        onClick={async () => {
          try {
            const backup = await repository.loadRecovery();
            if (backup) {
              downloadBackup(
                serializeBackup(backup),
                "jedna-kula-przed-importem.json",
              );
              setMessage("Pobrano stan sprzed ostatniego importu.");
            } else setMessage("Nie było jeszcze importu na tym urządzeniu.");
          } catch {
            setError("Nie udało się odczytać stanu sprzed importu.");
          }
        }}
      >
        Pobierz stan sprzed importu
      </button>
    </section>
  );
}
