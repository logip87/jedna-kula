import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleDot,
  Crosshair,
  MoveUpRight,
  PanelLeft,
  Brain,
  Route,
} from "lucide-react";
import { useApp } from "../../app-context";
import { drills } from "../../data";
import type { Surface } from "../adventure/model";
import {
  createSelectedTraining,
  seriesLengths,
  trainingChoices,
  trainingSelection,
  type SeriesLength,
  type TrainingChoice,
  type TrainingSelection,
} from "./selection";
import { modeNames } from "./model";
import { surfaces } from "../adventure/model";
import { LobSetup } from "../../LobSetup";

const icons = [CircleDot, Crosshair, MoveUpRight, PanelLeft];

export function TrainingPicker() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const [selection, setSelection] = useState(() => trainingSelection(state));
  const [otherSelections, setOtherSelections] = useState<
    Partial<Record<TrainingChoice, TrainingSelection>>
  >({});
  const choose = (drillId: TrainingChoice) => {
    if (drillId === selection.drillId) return;
    setOtherSelections({ ...otherSelections, [selection.drillId]: selection });
    setSelection(otherSelections[drillId] ?? trainingSelection(state, drillId));
  };
  const drill = drills.find((d) => d.id === selection.drillId)!;
  return (
    <section className="card training-picker" aria-label="Wybór treningu">
      <p className="eyebrow">WYBIERZ TRENING</p>
      <h2>Co dziś trenujesz?</h2>
      <div
        className="training-choice-grid"
        role="group"
        aria-label="Rodzaj treningu"
      >
        {trainingChoices.map((choice, index) => {
          const Icon = icons[index];
          return (
            <button
              key={choice.id}
              type="button"
              className="training-choice"
              aria-label={choice.title}
              aria-pressed={selection.drillId === choice.id}
              onClick={() => choose(choice.id)}
            >
              <Icon size={24} aria-hidden="true" />
              <span>
                <b>{choice.title}</b>
                <small>{choice.description}</small>
              </span>
            </button>
          );
        })}
        <Link
          className="training-choice"
          to="/adventure/tactics"
          aria-label="Taktyka"
        >
          <Route size={24} aria-hidden="true" />
          <span>
            <b>Taktyka</b>
            <small>Decyzje w sytuacjach meczowych.</small>
          </span>
        </Link>
        <Link
          className="training-choice"
          to="/coach/practice/mental"
          aria-label="Trening mentalny"
        >
          <Brain size={24} aria-hidden="true" />
          <span>
            <b>Trening mentalny</b>
            <small>Rutyna, koncentracja i praca z presją.</small>
          </span>
        </Link>
      </div>
      <form
        className="training-setup"
        onSubmit={async (e) => {
          e.preventDefault();
          if (state.draft) {
            navigate("/session");
            return;
          }
          if (
            await save({ ...state, draft: createSelectedTraining(selection) })
          )
            navigate("/session");
        }}
      >
        <h3>
          {modeNames[drill.mode]} {selection.distance} m
        </h3>
        <div className="training-fields">
          <label>
            Odległość
            <select
              value={selection.distance}
              onChange={(e) =>
                setSelection({ ...selection, distance: Number(e.target.value) })
              }
            >
              {drill.distances.map((distance) => (
                <option key={distance} value={distance}>
                  {distance} m
                </option>
              ))}
            </select>
          </label>
          <label>
            Liczba rzutów
            <select
              value={selection.attempts}
              onChange={(e) =>
                setSelection({
                  ...selection,
                  attempts: Number(e.target.value) as SeriesLength,
                })
              }
            >
              {seriesLengths.map((count) => (
                <option key={count} value={count}>
                  {count} rzutów
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="button" disabled={busy}>
          ZACZNIJ TRENING <ArrowRight size={22} aria-hidden="true" />
        </button>
        <p className="muted small">
          Po zapisie zapamiętamy ustawienia tego ćwiczenia.
        </p>
        <details className="rules-notes" key={selection.drillId}>
          <summary>Ustawienie ćwiczenia i sposób zapisu</summary>
          <p className="muted">
            {drill.mode === "lob"
              ? "Oceń miejsce pierwszego lądowania, a potem końcową odległość kuli od świnki."
              : drill.mode === "shoot"
                ? "Ustaw kulę do strzału i zapisuj rezultat każdej próby."
                : drill.mode === "boundary"
                  ? `Ustaw świnkę ${selection.boundary} cm od linii. Kula za linią daje 0 punktów; pozostałe oceń według odległości od świnki.`
                  : "Ustaw świnkę i zmierz odległość każdej zagranej kuli. Celuj w 30 cm."}
          </p>
          {drill.mode === "lob" && <LobSetup distance={selection.distance} />}
          <div className="training-fields">
            <label>
              Nawierzchnia
              <select
                value={selection.surface ?? ""}
                onChange={(e) =>
                  setSelection({
                    ...selection,
                    surface: (e.target.value || undefined) as
                      Surface | undefined,
                  })
                }
              >
                <option value="">Nieokreślona</option>
                {surfaces.map((surface) => (
                  <option key={surface.id} value={surface.id}>
                    {surface.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={selection.trackDirections}
              onChange={(e) =>
                setSelection({
                  ...selection,
                  trackDirections: e.target.checked,
                })
              }
            />
            Zapisuj kierunek nietrafionych rzutów
          </label>
          <p className="muted small">
            Wyniki porównujemy na tym samym dystansie i w tych samych warunkach.
          </p>
        </details>
      </form>
    </section>
  );
}
