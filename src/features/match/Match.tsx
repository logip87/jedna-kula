import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleDot, Pencil, Trophy } from "lucide-react";

type Pair = [number, number];
type Game = {
  size: number;
  names: [string, string];
  ends: (Pair | null)[];
  used: [boolean[], boolean[]];
};
const storageKey = "jedna-kula-match-v1";
const ballCount = (size: number) => (size === 1 ? 3 : 6);
const freshBalls = (size: number): Game["used"] => [
  Array<boolean>(ballCount(size)).fill(false),
  Array<boolean>(ballCount(size)).fill(false),
];
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
      ) ||
      !Array.isArray(game.used) ||
      game.used.length !== 2 ||
      !game.used.every(
        (side: unknown) =>
          Array.isArray(side) &&
          side.length === ballCount(game.size) &&
          side.every((b) => typeof b === "boolean"),
      )
    )
      return null;
    return game as Game;
  } catch {
    return null;
  }
}

export function Match() {
  const [game, setGame] = useState<Game | null>(readGame);
  const [size, setSize] = useState(1);
  const [names, setNames] = useState<[string, string]>(["", ""]);
  const [editing, setEditing] = useState<number | null>(null);
  const [winner, setWinner] = useState("0");
  const [points, setPoints] = useState("1");
  const [reset, setReset] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const editor = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (editing !== null) editor.current?.querySelector("select")?.focus();
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

  function edit(index: number) {
    const end = game?.ends[index];
    setWinner(end ? (end[0] ? "0" : end[1] ? "1" : "none") : "0");
    setPoints(String(end ? end[0] || end[1] || 1 : 1));
    setEditing(index);
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
        <p className="muted">Wynik i kule pod ręką. Skup się na grze.</p>
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
              used: freshBalls(size),
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
            <b>Rozgrywka {game.ends.length}</b>
          </div>
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
                <p className="match-ball-count">
                  Dostępne kule:{" "}
                  <b>
                    {game.used[side].filter((used) => !used).length}/
                    {ballCount(game.size)}
                  </b>
                </p>
                <div className="match-balls">
                  {game.used[side].map((used, index) => (
                    <button
                      type="button"
                      key={index}
                      aria-label={`${name}: kula ${index + 1}`}
                      aria-pressed={used}
                      title={
                        used ? "Przywróć kulę" : "Oznacz kulę jako wykorzystaną"
                      }
                      onClick={() =>
                        setGame(
                          (previous) =>
                            previous && {
                              ...previous,
                              used: previous.used.map((balls, team) =>
                                team === side
                                  ? balls.map((ball, i) =>
                                      i === index ? !ball : ball,
                                    )
                                  : balls,
                              ) as Game["used"],
                            },
                        )
                      }
                    >
                      <CircleDot aria-hidden="true" size={30} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <span className="match-colon" aria-hidden="true">
              :
            </span>
          </section>
          <p className="muted match-hint">
            Dotknij kulki, aby oznaczyć rzut. Dotknij ponownie, aby go cofnąć.
          </p>
          <section className="card config" aria-label="Punkty rozgrywki">
            <h2>Rozgrywka {game.ends.length}</h2>
            {game.ends.at(-1) === null ? (
              <button
                className="button"
                onClick={() => edit(game.ends.length - 1)}
              >
                Przyznaj punkty
              </button>
            ) : (
              <>
                <p>Punkty zapisane: {game.ends.at(-1)!.join(":")}</p>
                <button
                  className="secondary"
                  onClick={() => edit(game.ends.length - 1)}
                >
                  <Pencil size={16} /> Popraw wynik rozgrywki
                </button>
              </>
            )}
            <button
              className="button"
              disabled={game.ends.at(-1) === null || editing !== null}
              onClick={() =>
                setGame({
                  ...game,
                  ends: [...game.ends, null],
                  used: freshBalls(game.size),
                })
              }
            >
              Następna rozgrywka <ArrowRight size={20} />
            </button>
            {game.ends.at(-1) === null && (
              <p className="muted">
                Najpierw zapisz punkty lub wybierz rozgrywkę bez punktów.
              </p>
            )}
          </section>
          {editing !== null && (
            <form
              className="card config"
              aria-label="Edycja punktów"
              ref={editor}
              onSubmit={(event) => {
                event.preventDefault();
                const result: Pair =
                  winner === "none"
                    ? [0, 0]
                    : winner === "0"
                      ? [Number(points), 0]
                      : [0, Number(points)];
                setGame({
                  ...game,
                  ends: game.ends.map((end, index) =>
                    index === editing ? result : end,
                  ),
                });
                setEditing(null);
              }}
            >
              <h2>Punkty · rozgrywka {editing + 1}</h2>
              <label>
                Punkty dla
                <select
                  value={winner}
                  onChange={(event) => setWinner(event.target.value)}
                >
                  {game.names.map((name, index) => (
                    <option key={index} value={index}>
                      {name}
                    </option>
                  ))}
                  <option value="none">Rozgrywka bez punktów</option>
                </select>
              </label>
              {winner !== "none" && (
                <label>
                  Liczba punktów
                  <select
                    value={points}
                    onChange={(event) => setPoints(event.target.value)}
                  >
                    {Array.from({ length: ballCount(game.size) }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button className="button">Zapisz punkty</button>
              <button
                type="button"
                className="secondary"
                onClick={() => setEditing(null)}
              >
                Anuluj
              </button>
            </form>
          )}
          {game.ends.length > 1 && (
            <section className="card config" aria-label="Historia rozgrywek">
              <h2>Historia rozgrywek</h2>
              {game.ends.slice(0, -1).map((end, index) => (
                <div className="match-history" key={index}>
                  <span>
                    Rozgrywka {index + 1} <b>{end!.join(":")}</b>
                  </span>
                  <button
                    className="secondary"
                    aria-label={`Popraw wynik rozgrywki ${index + 1}`}
                    onClick={() => edit(index)}
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
