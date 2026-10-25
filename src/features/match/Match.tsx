import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pencil, RotateCcw, Trophy } from "lucide-react";

type Pair = [number, number];
type Game = {
  size: number;
  names: [string, string];
  ends: (Pair | null)[];
};
const storageKey = "jedna-kula-match-v1";
const ballCount = (size: number) => (size === 1 ? 3 : 6);
function readGame(): Game | null {
  try {
    const game = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      !game ||
      ![1, 2, 3].includes(game.size) ||
      !Array.isArray(game.names) ||
      game.names.length !== 2 ||
      !game.names.every(
        (name: unknown) => typeof name === "string" && name.trim(),
      ) ||
      !Array.isArray(game.ends) ||
      !game.ends.length ||
      !game.ends.every((end: unknown, index: number) =>
        end === null
          ? index === game.ends.length - 1
          : Array.isArray(end) &&
            end.length === 2 &&
            end.every(
              (n: unknown) =>
                typeof n === "number" &&
                Number.isInteger(n) &&
                n >= 0 &&
                n <= ballCount(game.size),
            ) &&
            (end[0] === 0 || end[1] === 0),
      )
    )
      return null;
    // Older versions kept the scored end open until “next” was pressed.
    return {
      size: game.size,
      names: game.names,
      ends: game.ends.at(-1) === null ? game.ends : [...game.ends, null],
    };
  } catch {
    return null;
  }
}

export function Match() {
  const [game, setGame] = useState<Game | null>(readGame);
  const [size, setSize] = useState(1);
  const [names, setNames] = useState<[string, string]>(["", ""]);
  const [editing, setEditing] = useState<number | null>(null);
  const [reset, setReset] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const boardHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (editing !== null) boardHeading.current?.focus();
  }, [editing]);
  useEffect(() => {
    try {
      if (game) localStorage.setItem(storageKey, JSON.stringify(game));
      else localStorage.removeItem(storageKey);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [game]);

  function record(result: Pair) {
    setGame((previous) => {
      if (!previous) return previous;
      if (editing !== null)
        return {
          ...previous,
          ends: previous.ends.map((end, index) =>
            index === editing ? result : end,
          ),
        };
      return {
        ...previous,
        ends: [...previous.ends.slice(0, -1), result, null],
      };
    });
    setEditing(null);
  }
  const totals = game?.ends.reduce<Pair>(
    (sum, end) => [sum[0] + (end?.[0] || 0), sum[1] + (end?.[1] || 0)],
    [0, 0],
  ) ?? [0, 0];

  return (
    <div className="match-page">
      <div className="page-heading">
        <p className="eyebrow">NA BOISKU</p>
        <h1>Mecz</h1>
        <p className="muted">
          Po rozdaniu dotknij liczby zdobytych punktów. Skup się na grze.
        </p>
      </div>
      {storageError && (
        <p className="notice" role="alert">
          Nie udało się zapisać meczu na urządzeniu. Pozostaw tę stronę otwartą,
          aby zachować wynik.
        </p>
      )}
      {!game ? (
        <form
          className="card config match-setup"
          onSubmit={(event) => {
            event.preventDefault();
            if (!names.every((name) => name.trim())) return;
            setGame({
              size,
              names: [names[0].trim(), names[1].trim()],
              ends: [null],
            });
          }}
        >
          <fieldset className="match-formats">
            <legend>Liczba graczy</legend>
            <div>
              {[1, 2, 3].map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={size === value}
                  onClick={() => setSize(value)}
                >
                  {value} na {value}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="muted">
            {size === 1
              ? "Po 3 kule na zawodnika."
              : `Po 6 kul na drużynę · ${size === 2 ? "3" : "2"} kule na zawodnika.`}
          </p>
          {[0, 1].map((side) => (
            <label key={side}>
              {size === 1 ? `Zawodnik ${side + 1}` : `Drużyna ${side + 1}`}
              <input
                required
                maxLength={80}
                value={names[side]}
                placeholder={
                  size === 1 ? "Imię i nazwisko lub ksywka" : "Nazwa drużyny"
                }
                onChange={(event) =>
                  setNames((previous) =>
                    side === 0
                      ? [event.target.value, previous[1]]
                      : [previous[0], event.target.value],
                  )
                }
              />
            </label>
          ))}
          <button
            className="button"
            disabled={!names.every((name) => name.trim())}
          >
            Rozpocznij mecz <ArrowRight size={20} />
          </button>
        </form>
      ) : (
        <>
          <div className="match-meta">
            <span className="pill">
              <Trophy size={16} /> {game.size} na {game.size}
            </span>
            <b>Rozdanie {editing !== null ? editing + 1 : game.ends.length}</b>
          </div>
          <h2 ref={boardHeading} tabIndex={-1} className="match-entry-heading">
            {editing !== null
              ? `Popraw wynik rozdania ${editing + 1}`
              : "Ile punktów po rozdaniu?"}
          </h2>
          <p className="muted match-hint">
            {editing !== null
              ? "Dotknij poprawnej liczby punktów pod zwycięzcą rozdania."
              : "Dotknij liczby pod zwycięzcą rozdania. Wynik zapisze się od razu."}
          </p>
          <section className="card match-board" aria-label="Tablica meczu">
            {game.names.map((name, side) => (
              <div className="match-side" key={side}>
                <p className="eyebrow">
                  {game.size === 1 ? "ZAWODNIK" : "DRUŻYNA"} {side + 1}
                </p>
                <h2>{name}</h2>
                <div
                  className="match-score"
                  aria-label={`Wynik: ${name}`}
                  aria-live="polite"
                >
                  {totals[side]}
                </div>
                <p className="match-ball-count">Punkty za rozdanie</p>
                <div className="match-balls">
                  {Array.from({ length: ballCount(game.size) }, (_, index) => (
                    <button
                      type="button"
                      key={index}
                      aria-label={`${name}: ${index + 1} ${index === 0 ? "punkt" : index < 4 ? "punkty" : "punktów"}`}
                      onClick={() =>
                        record(side === 0 ? [index + 1, 0] : [0, index + 1])
                      }
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <span className="match-colon" aria-hidden="true">
              :
            </span>
          </section>
          <div className="match-actions">
            <button className="secondary" onClick={() => record([0, 0])}>
              Rozdanie bez punktów
            </button>
            {editing !== null ? (
              <button className="text-button" onClick={() => setEditing(null)}>
                Anuluj poprawianie
              </button>
            ) : game.ends.length > 1 ? (
              <button
                className="text-button"
                onClick={() =>
                  setGame(
                    (previous) =>
                      previous && {
                        ...previous,
                        ends: [...previous.ends.slice(0, -2), null],
                      },
                  )
                }
              >
                <RotateCcw size={16} /> Cofnij ostatnie rozdanie
              </button>
            ) : null}
          </div>
          {game.ends.length > 1 && editing === null && (
            <p className="muted" role="status">
              Ostatnie rozdanie:{" "}
              {game.ends.at(-2)![0] === 0 && game.ends.at(-2)![1] === 0
                ? "bez punktów"
                : `${game.names[game.ends.at(-2)![0] > 0 ? 0 : 1]} +${game.ends.at(-2)![0] || game.ends.at(-2)![1]}`}
              .
            </p>
          )}
          {game.ends.length > 1 && (
            <section className="card config" aria-label="Historia rozdań">
              <h2>Historia rozdań</h2>
              {game.ends.slice(0, -1).map((end, index) => (
                <div className="match-history" key={index}>
                  <span>
                    Rozdanie {index + 1} <b>{end!.join(":")}</b>
                  </span>
                  <button
                    className="secondary"
                    aria-label={`Popraw wynik rozdania ${index + 1}`}
                    onClick={() => setEditing(index)}
                  >
                    <Pencil size={16} /> Popraw
                  </button>
                </div>
              ))}
            </section>
          )}
          {reset ? (
            <section className="card config" aria-label="Nowy mecz">
              <p>Rozpocząć nowy mecz? Bieżący wynik zostanie usunięty.</p>
              <button
                className="button"
                onClick={() => {
                  setGame(null);
                  setEditing(null);
                  setReset(false);
                }}
              >
                Rozpocznij nowy mecz
              </button>
              <button className="secondary" onClick={() => setReset(false)}>
                Anuluj
              </button>
            </section>
          ) : (
            <button className="secondary" onClick={() => setReset(true)}>
              Nowy mecz
            </button>
          )}
        </>
      )}
    </div>
  );
}
