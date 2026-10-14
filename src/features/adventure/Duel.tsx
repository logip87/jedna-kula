import { ProgressionInfo } from "../product/ProgressionInfo";
import { useState } from "react";
import { Users, Trophy, RotateCcw } from "lucide-react";
import { useApp } from "../../app-context";
import { choices } from "../../domain";
import { addDuelScore, type Duel } from "./model";
import { AdventureBack, AdventureHeading } from "./ui";
const totals = (d: Duel) =>
  [0, 1].map((player) =>
    d.scores
      .filter((s) => s.player === player)
      .reduce((a, b) => a + b.points, 0),
  );
export function DuelTraining() {
  const { state, save, busy } = useApp();
  const [first, setFirst] = useState("Gracz 1");
  const [second, setSecond] = useState("Gracz 2");
  const [kind, setKind] = useState<"versus" | "team">("versus");
  const [mode, setMode] = useState<"point" | "shoot">("point");
  const [distance, setDistance] = useState(6);
  const [rounds, setRounds] = useState(3);
  const [target, setTarget] = useState(12);
  const draft = state.adventure?.duelDraft;
  const history = state.adventure?.duelHistory ?? [];
  const last = history.at(-1);
  const max = rounds * 2 * (mode === "point" ? 3 : 5);
  const start = async () => {
    if (draft) return;
    await save({
      ...state,
      adventure: {
        ...state.adventure,
        duelDraft: {
          id: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
          names: [first.trim(), second.trim()],
          kind,
          mode,
          distance,
          rounds,
          target: Math.min(max, Math.max(1, target)),
          scores: [],
        },
      },
    });
  };
  if (!draft)
    return (
      <div className="adventure-page">
        <AdventureBack />
        <AdventureHeading
          title="We dwoje"
          subtitle="Jeden telefon, dwie osoby. Zmierzcie się albo zagrajcie do wspólnego celu."
        />
        {last && (
          <section className="duel-result">
            <Trophy size={32} />
            <p className="eyebrow">WYZWANIE ZAPISANE</p>
            <h2>
              {last.kind === "team"
                ? totals(last).reduce((a, b) => a + b, 0) >= last.target
                  ? "Wspólny cel osiągnięty!"
                  : "Macie punkt wyjścia na rewanż."
                : totals(last)[0] === totals(last)[1]
                  ? "Remis!"
                  : `Wygrywa ${last.names[totals(last)[0] > totals(last)[1] ? 0 : 1]}`}
            </h2>
            <p>
              {last.names[0]}: {totals(last)[0]} pkt · {last.names[1]}:{" "}
              {totals(last)[1]} pkt
              {last.kind === "team"
                ? ` · wspólnie ${totals(last).reduce((a, b) => a + b, 0)} / ${last.target}`
                : ""}
            </p>
          </section>
        )}
        <section className="card">
          <Users size={28} />
          <h2>Ustaw wyzwanie</h2>
          <div className="two-col">
            <label>
              Pierwsza osoba
              <input
                value={first}
                maxLength={30}
                onChange={(e) => setFirst(e.target.value)}
              />
            </label>
            <label>
              Druga osoba
              <input
                value={second}
                maxLength={30}
                onChange={(e) => setSecond(e.target.value)}
              />
            </label>
          </div>
          <fieldset className="adventure-switch">
            <legend>Jak gracie?</legend>
            <button
              aria-pressed={kind === "versus"}
              onClick={() => setKind("versus")}
            >
              Pojedynek
            </button>
            <button
              aria-pressed={kind === "team"}
              onClick={() => setKind("team")}
            >
              Wspólny cel
            </button>
          </fieldset>
          <label>
            Zadanie
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "point" | "shoot")}
            >
              <option value="point">Puenta</option>
              <option value="shoot">Strzał</option>
            </select>
          </label>
          <div className="two-col">
            <label>
              Dystans
              <select
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
              >
                {[6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n} m
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rundy
              <select
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
              >
                <option value={3}>3 rundy</option>
                <option value={6}>6 rund</option>
              </select>
            </label>
          </div>
          {kind === "team" && (
            <label>
              Wspólny cel punktowy
              <input
                type="number"
                min={1}
                max={max}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </label>
          )}
          <p>
            Każda osoba gra jedną kulę w rundzie. Zbierzcie i ustawcie cel po
            każdym rzucie, aby warunki były porównywalne. To wyzwanie
            treningowe, nie mecz do 13.
          </p>
          <button
            className="primary"
            disabled={
              busy ||
              !first.trim() ||
              !second.trim() ||
              !Number.isFinite(target)
            }
            onClick={start}
          >
            Rozpocznij wyzwanie
          </button>
        </section>
        <details className="rules-notes">
          <summary>Historia wyzwań ({history.length})</summary>
          {history.length ? (
            history
              .slice()
              .reverse()
              .map((d) => (
                <p key={d.id}>
                  {d.names[0]} {totals(d)[0]} : {totals(d)[1]} {d.names[1]} ·{" "}
                  {d.kind === "team" ? "wspólny cel" : "pojedynek"} ·{" "}
                  {d.distance} m
                </p>
              ))
          ) : (
            <p>Pierwsze zakończone wyzwanie pojawi się tutaj.</p>
          )}
        </details>
        <ProgressionInfo fixedPlan="duel" />
      </div>
    );
  const player = draft.scores.length % 2;
  const scores = totals(draft);
  const record = async (points: number) => {
    const next = addDuelScore(draft, points);
    await save({
      ...state,
      adventure: {
        ...state.adventure,
        duelDraft: next.completedAt ? undefined : next,
        duelHistory: next.completedAt ? [...history, next] : history,
      },
    });
  };
  return (
    <div className="adventure-page">
      <AdventureBack />
      <AdventureHeading
        eyebrow={`RUNDA ${Math.floor(draft.scores.length / 2) + 1} / ${draft.rounds}`}
        title={`Teraz: ${draft.names[player]}`}
        subtitle={`${draft.mode === "point" ? "Puenta" : "Strzał"} · ${draft.distance} m · jedna kula, potem zmiana osoby`}
      />
      <progress
        value={draft.scores.length}
        max={draft.rounds * 2}
        aria-label="Postęp wyzwania"
      />
      <div className="duel-scoreboard">
        {draft.names.map((name, i) => (
          <div className={player === i ? "current" : ""} key={i}>
            <small>{name}</small>
            <strong>{scores[i]}</strong>
            <span>pkt</span>
          </div>
        ))}
      </div>
      {draft.kind === "team" && (
        <p>
          Wspólnie: {scores.reduce((a, b) => a + b, 0)} / {draft.target} pkt
        </p>
      )}
      <h2>Jak poszło?</h2>
      <div className="result-grid">
        {choices[draft.mode].map((c) => (
          <button
            className="result-button"
            key={c.label}
            disabled={busy}
            onClick={() => record(c.points)}
          >
            <span>{c.label}</span>
            <b>+{c.points} pkt</b>
          </button>
        ))}
      </div>
      <p className="muted">
        Wynik zapisuje się przed zmianą osoby. Możesz wyjść i wrócić do tej
        samej próby.
      </p>
      {draft.scores.length > 0 && (
        <button
          className="secondary"
          disabled={busy}
          onClick={() =>
            save({
              ...state,
              adventure: {
                ...state.adventure,
                duelDraft: { ...draft, scores: draft.scores.slice(0, -1) },
              },
            })
          }
        >
          <RotateCcw size={18} /> Cofnij ostatni wynik
        </button>
      )}
      <ProgressionInfo fixedPlan="duel" />
    </div>
  );
}
