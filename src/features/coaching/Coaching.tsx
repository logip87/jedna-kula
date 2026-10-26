import { boundaryDistance, successfulAttempt } from "../../domain";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Trophy, RotateCcw } from "lucide-react";
import { useApp } from "../../app-context";
import { seriesLengths, type SeriesLength } from "./selection";
import {
  createRecommendedSession,
  generateTraining,
  modeNames,
  preferredTrainingFocus,
  selfChallenge,
  weaknesses,
  type TrainingFocus,
  trainingPlanDistances,
} from "./model";
export function Weaknesses() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const entries = weaknesses(state);
  return (
    <div className="coach-page">
      <Link className="back" to="/">
        ← Dzisiaj
      </Link>
      <div className="page-heading">
        <p className="eyebrow">Z WYNIKÓW DO DZIAŁANIA</p>
        <h1>Do poprawy</h1>
        <p className="muted">
          Minimum 20 prób w 2 sesjach. Porównujemy takie same warunki.
        </p>
      </div>
      {!entries.length && (
        <div className="card">
          <h2>Najpierw zbierzmy dane</h2>
          <p>
            Pojedyncza seria nie określa Twoich umiejętności. Powtórz trening w
            tych samych warunkach.
          </p>
          <Link className="button" to="/">
            Dzisiejsza propozycja
          </Link>
        </div>
      )}
      {entries.map((r, i) => (
        <section className="card" key={r.key}>
          <p className="eyebrow">PRIORYTET {i + 1}</p>
          <h2>
            {modeNames[r.mode]} {r.distance} m · {r.rate}%
          </h2>
          <p>
            {r.count} prób · {r.sessions.length} sesji ·{" "}
            {r.session.kind === "test" ? "testy kontrolne" : "treningi"} ·{" "}
            {r.session.difficulty}
          </p>
          <p>
            {r.trend
              ? `${r.trend.label}: ${r.trend.previous}% → ${r.trend.recent}% (${r.trend.delta > 0 ? "+" : ""}${r.trend.delta} pp)`
              : "Na trend potrzebujemy 10 porównywalnych sesji."}
          </p>
          {r.direction && (
            <p>
              {r.direction.rate}% oznaczonych pudeł:{" "}
              {
                {
                  short: "za krótko",
                  long: "za długo",
                  left: "w lewo",
                  right: "w prawo",
                }[r.direction.id]
              }{" "}
              ({r.direction.count} pudeł z kierunkiem).
            </p>
          )}
          {r.landingDirection && (
            <p>
              Pierwsze lądowanie: {r.landingDirection.rate}% oznaczonych
              nietrafionych lądowań{" "}
              {
                {
                  short: "za krótko",
                  long: "za długo",
                  left: "w lewo",
                  right: "w prawo",
                }[r.landingDirection.id]
              }{" "}
              ({r.landingDirection.count} prób). W kolejnej serii wybierz jeden
              stały punkt pierwszego kontaktu.
            </p>
          )}
          <button
            className="button"
            disabled={busy || !!state.draft}
            onClick={async () => {
              const session = {
                ...createRecommendedSession(state),
                drillId:
                  r.mode === "shoot"
                    ? "shoot-basic"
                    : r.mode === "lob"
                      ? "lob"
                      : "point-basic",
                difficulty: r.session.difficulty,
                targetSize: r.session.targetSize,
                boundary:
                  r.mode === "boundary" ? boundaryDistance : r.session.boundary,
                plan: Array.from({ length: 20 }, () => ({
                  mode: r.mode,
                  distance: r.distance,
                })),
              };
              if (await save({ ...state, draft: session }))
                navigate("/session");
            }}
          >
            Trenuj ten element
          </button>
        </section>
      ))}
      {state.draft && (
        <Link className="button" to="/session">
          Wznów otwartą sesję
        </Link>
      )}
      <Link className="secondary" to="/adventure/map">
        Mapa kierunków i pierwszego lądowania
      </Link>
    </div>
  );
}
export function Generator() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState<10 | 20 | 30 | 45 | 60>(20);
  const [search] = useSearchParams();
  const previous = state.sessions
    .filter(
      (s) =>
        s.completedAt &&
        Date.parse(s.completedAt) <= Date.now() &&
        s.kind !== "test" &&
        !s.mastery &&
        !s.challenge &&
        s.plan.length &&
        s.results.length === s.plan.length,
    )
    .sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!))[0];
  const [distance, setDistance] = useState(previous?.plan[0].distance ?? 6);
  const [attempts, setAttempts] = useState<SeriesLength>(
    seriesLengths.includes(previous?.plan.length as SeriesLength)
      ? (previous!.plan.length as SeriesLength)
      : 20,
  );
  const [focus, setFocus] = useState<TrainingFocus>(
    search.get("focus") === "presja"
      ? "presja"
      : ((
          [
            "wszystko",
            "puenta",
            "strzał",
            "lob",
            "przy linii",
            "do celu",
            "słabości",
            "presja",
            "lekko",
          ] as const
        ).find((f) => f === previous?.trainingPlan?.focus) ??
          (previous?.plan[0]
            ? (
                {
                  point: "puenta",
                  shoot: "strzał",
                  lob: "lob",
                  boundary: "przy linii",
                  target: "do celu",
                } as const
              )[previous.plan[0].mode]
            : preferredTrainingFocus(state))),
  );
  const distances = trainingPlanDistances(
    generateTraining(state, minutes, focus),
  );
  const selectedDistance = distances.includes(distance)
    ? distance
    : distances.at(-1)!;
  const session = generateTraining(state, minutes, focus, new Date(), {
    distance: selectedDistance,
    attempts,
  });
  return (
    <div className="coach-page">
      <Link className="back" to="/">
        ← Dzisiaj
      </Link>
      <div className="page-heading">
        <p className="eyebrow">TWÓJ CZAS. TWÓJ PLAN.</p>
        <h1>Generator treningu</h1>
      </div>
      <section className="card config">
        <fieldset>
          <legend>Mam…</legend>
          <div className="filters">
            {([10, 20, 30, 45, 60] as const).map((n) => (
              <button
                key={n}
                aria-pressed={n === minutes}
                className={n === minutes ? "selected" : ""}
                onClick={() => setMinutes(n)}
              >
                {n} minut
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          Chcę trenować
          <select
            value={focus}
            onChange={(e) => setFocus(e.target.value as TrainingFocus)}
          >
            {(
              [
                "wszystko",
                "puenta",
                "strzał",
                "lob",
                "przy linii",
                "do celu",
                "słabości",
                "presja",
                "lekko",
              ] as const
            ).map((x) => (
              <option value={x} key={x}>
                {x === "słabości"
                  ? "moje słabości"
                  : x === "lekko"
                    ? "lekko / regeneracyjnie"
                    : x}
              </option>
            ))}
          </select>
        </label>
        <div className="training-fields">
          <label>
            Odległość
            <select
              value={selectedDistance}
              onChange={(e) => setDistance(Number(e.target.value))}
            >
              {distances.map((d) => (
                <option key={d} value={d}>
                  {d} m
                </option>
              ))}
            </select>
          </label>
          <label>
            Łączna liczba rzutów
            <select
              value={attempts}
              onChange={(e) =>
                setAttempts(Number(e.target.value) as SeriesLength)
              }
            >
              {seriesLengths.map((n) => (
                <option key={n} value={n}>
                  {n} rzutów
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="muted small">
          Liczba rzutów dotyczy całego planu. Etapy dzielą wybraną pulę; we
          wszystkich rzucasz na {selectedDistance} m.
        </p>
      </section>
      <section className="card">
        <h2>Plan na {minutes} minut</h2>
        <p className="muted">
          {attempts} rzutów · {selectedDistance} m. Czasy etapów są orientacyjne
          i obejmują przygotowanie oraz odpoczynek.
        </p>
        <ol className="coach-blocks">
          {session.trainingPlan!.blocks.map((b, i) => (
            <li key={i}>
              <b>
                {b.minutes} min · {b.title}
              </b>
              <p>{b.instruction}</p>
              {b.kind === "throws" && (
                <span>
                  {b.end - b.start} prób ·{" "}
                  {modeNames[session.plan[b.start].mode]} ·{" "}
                  {session.plan[b.start].distance} m
                </span>
              )}
            </li>
          ))}
        </ol>
        {state.draft ? (
          <div className="notice">
            <p>
              Masz już rozpoczęty trening: {state.draft.results.length} z{" "}
              {state.draft.plan.length} rzutów zapisanych. Powyższe ustawienia
              dotyczą nowego planu, który możesz zacząć po zakończeniu
              bieżącego.
            </p>
            <Link className="button" to="/session">
              Wznów rozpoczęty trening
            </Link>
          </div>
        ) : (
          <button
            className="button"
            disabled={busy}
            onClick={async () => {
              if (await save({ ...state, draft: session }))
                navigate("/session");
            }}
          >
            ZACZNIJ TRENING <ArrowRight />
          </button>
        )}
      </section>
    </div>
  );
}
export function SelfChallenge() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const session = selfChallenge(state);
  const previous = session
    ? (state.sessions.find((s) => s.id === session.coach?.referenceSessionId) ??
      null)
    : null;
  const hits = previous?.results.filter(successfulAttempt).length ?? 0;
  return (
    <div className="coach-page">
      <Link className="back" to="/">
        ← Dzisiaj
      </Link>
      <div className="page-heading">
        <p className="eyebrow">TWÓJ WŁASNY PUNKT ODNIESIENIA</p>
        <h1>Pokonaj siebie</h1>
      </div>
      <section className="card">
        <Trophy size={28} />
        {session && previous ? (
          <>
            <h2>
              Poprzednio: {hits}/{previous.results.length}
            </h2>
            <p>
              {hits < previous.results.length
                ? `Cel: ${hits + 1}/${previous.results.length} trafień.`
                : "Pełna skuteczność. Spróbuj ją utrzymać."}{" "}
              Powtarzasz ten sam plan, dystanse, cel i poziom.
            </p>
            <p className="muted">
              Ustaw cel jak poprzednio. Wynik porównamy po pełnej serii.
            </p>
            {state.draft ? (
              <Link className="button" to="/session">
                Wznów otwartą sesję
              </Link>
            ) : (
              <button
                className="button"
                disabled={busy}
                onClick={async () => {
                  if (await save({ ...state, draft: session }))
                    navigate("/session");
                }}
              >
                Powtórz warunki <RotateCcw size={20} />
              </button>
            )}
          </>
        ) : (
          <>
            <h2>Pierwszy wynik przed Tobą</h2>
            <p>
              Zapisz pełną serię. Będzie punktem odniesienia do kolejnej próby.
            </p>
            <Link className="button" to="/training?category=Testy">
              Wybierz test kontrolny
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
export { Today } from "./Today";
export { ResultInsights } from "./ResultInsights";
