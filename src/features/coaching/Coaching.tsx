import { ProgressionInfo } from "../product/ProgressionInfo";
import { lastRepeatableTraining, repeatLastTraining } from "./repeat";
import { RoutineGuide } from "../mental/RoutineGuide";
import {
  dashboardEvidence,
  acceptedAdaptation,
  adaptation,
  dailyTraining,
  mentalRecommendation,
  progressEvidence,
} from "../product/model";
import { audience } from "../development/model";
import {
  competitionTraining,
  daysUntilCompetition,
} from "../development/model";
import { useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Timer, Trophy, RotateCcw } from "lucide-react";
import { useApp } from "../../app-context";
import { type Session, successfulAttempt } from "../../domain";
import { drills } from "../../data";
import { surfaces } from "../adventure/model";
import {
  conditionKey,
  createRecommendedSession,
  generateTraining,
  modeNames,
  personalBest,
  previousBenchmark,
  recommendation,
  selfChallenge,
  trends,
  weaknesses,
  weeklyProgress,
  type TrainingFocus,
} from "./model";

export function Today({ guide }: { guide?: ReactNode }) {
  const { state, save, busy } = useApp(),
    navigate = useNavigate();
  const r = recommendation(state),
    competition = competitionTraining(state),
    week = weeklyProgress(state),
    proposal = adaptation(state),
    mental = mentalRecommendation(state),
    athlete = audience(state) === "athlete",
    dashboard = dashboardEvidence(state),
    lastTraining = lastRepeatableTraining(state);
  const start = async (adapt = false) => {
    if (state.draft) {
      navigate("/session");
      return;
    }
    const session = adapt
      ? acceptedAdaptation(state)
      : (competition ?? dailyTraining(state));
    if (await save({ ...state, draft: session })) navigate("/session");
  };
  const repeat = async () => {
    const session = repeatLastTraining(state);
    if (session && (await save({ ...state, draft: session })))
      navigate("/session");
  };
  return (
    <div className="coach-page product-today">
      <div className="greeting">
        <div>
          <p className="eyebrow">TWÓJ TRENING I WYNIKI</p>
          <h1>Dzisiaj</h1>
          <p className="muted">
            {state.player ? `${state.player.name}, ` : ""}jedno zadanie i jasny
            następny krok.
          </p>
        </div>
      </div>
      <section className="coach-main">
        <p className="eyebrow">TWÓJ TRENING NA DZIŚ</p>
        <h2>
          {state.draft
            ? "Dokończ rozpoczętą sesję"
            : competition
              ? "Przed zawodami: jakość i rutyna"
              : `${modeNames[r.mode]} ${r.distance} m`}
        </h2>
        <p>
          {state.draft
            ? `${state.draft.results.length} rzutów zapisanych. Wróć do swojej sesji.`
            : competition
              ? `Zawody ${daysUntilCompetition(state) === 0 ? "dzisiaj" : `za ${daysUntilCompetition(state)} dni`}. Krótka seria na znanym dystansie i spokojny reset.`
              : r.reason}
        </p>
        {!state.draft && (
          <>
            <span className="coach-meta">
              <Timer size={17} /> około{" "}
              {competition?.trainingPlan?.minutes ??
                (mental ? 20 : r.count ? 15 : 10)}{" "}
              min · {competition?.plan.length ?? (r.count ? 20 : 6)} prób
            </span>
            {!competition && r.target !== null && (
              <p className="coach-goal">
                Cel: {r.rate}% → {r.target}% w tych samych warunkach.
              </p>
            )}
            {mental && !competition && (
              <p className="coach-goal">
                {mental.reason} Zaczniemy od 2 minut rutyny.
                <Link className="text-link" to={`/lessons/${mental.lessonId}`}>
                  Krótka lekcja do tego zadania
                </Link>
              </p>
            )}
          </>
        )}
        {!state.draft && (
          <a className="coach-light-link" href="#routine-guide">
            Jak przygotować głowę do rzutu? ↓
          </a>
        )}
        <button
          className="button cream"
          disabled={busy}
          onClick={() => void start()}
        >
          {state.draft ? "Wznów trening" : "ZACZNIJ TRENING"}
          <ArrowRight size={22} />
        </button>
        <Link className="coach-light-link" to="/coach/generator">
          Zmień czas lub rodzaj treningu →
        </Link>
      </section>
      {!state.draft && lastTraining && (
        <button
          className="secondary"
          disabled={busy}
          onClick={() => void repeat()}
        >
          <RotateCcw size={18} /> Powtórz ostatni trening:{" "}
          {drills.find((d) => d.id === lastTraining.drillId)?.name}
        </button>
      )}
      {!state.draft && (
        <RoutineGuide
          expanded={
            !state.lessons.includes("routine") &&
            !state.sessions.some((s) => s.routineUsed === true)
          }
        />
      )}
      {proposal && !competition && !state.draft && (
        <section className="notice">
          <p>
            <b>{proposal.reason}</b>
          </p>
          <p>
            {proposal.evidence} {proposal.change}
          </p>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => void start(true)}
          >
            {proposal.kind === "harder"
              ? "SPRÓBUJ TRUDNIEJ"
              : "ŁATWIEJSZY WARIANT"}
          </button>
          <p className="muted small">
            Zmiana tylko po Twoim wyborze. Zwykły start zachowuje dotychczasowe
            warunki.
          </p>
        </section>
      )}
      <section className="card">
        <h2>Czy robię postęp?</h2>
        <p>{progressEvidence(state)}</p>
        <p>
          <b>
            {week.count} / {week.target}
          </b>{" "}
          treningi w tym tygodniu · {week.streak} tygodni regularności
          {week.perfect ? " · Perfect Week" : ""}.
        </p>
        <Link className="text-link" to="/progress">
          Mój postęp →
        </Link>
      </section>
      <section
        className="card dashboard-evidence"
        aria-label="Wyniki treningowe"
      >
        <h2>Ostatni trening</h2>
        {dashboard.recent.length ? (
          <>
            <Link
              className="text-link"
              to={`/history/${dashboard.recent[0].id}`}
            >
              {drills.find((d) => d.id === dashboard.recent[0].drillId)?.name} ·{" "}
              {new Date(dashboard.recent[0].completedAt!).toLocaleDateString(
                "pl-PL",
              )}
            </Link>
            <h3>Ostatnie wyniki</h3>
            <ul>
              {dashboard.recent.map((s) => (
                <li key={s.id}>
                  <Link to={`/history/${s.id}`}>
                    {drills.find((d) => d.id === s.drillId)?.name}
                  </Link>{" "}
                  ·{" "}
                  {s.results.length
                    ? Math.round(
                        (s.results.filter(successfulAttempt).length /
                          s.results.length) *
                          100,
                      )
                    : 0}
                  % skuteczności · {s.results.length} prób
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Zapisz trening, aby zobaczyć wyniki.</p>
        )}
        <h3>Mocniejszy obszar</h3>
        <p>
          {dashboard.strongest
            ? `${modeNames[dashboard.strongest.mode]} ${dashboard.strongest.distance} m: ${dashboard.strongest.rate}% · ${dashboard.strongest.count} prób`
            : "Potrzeba 20 prób z dwóch sesji w tych samych warunkach."}
        </p>
        <h3>Do poprawy</h3>
        <p>
          {dashboard.weakest
            ? `${modeNames[dashboard.weakest.mode]} ${dashboard.weakest.distance} m: ${dashboard.weakest.rate}% · ${dashboard.weakest.count} prób`
            : "Po treningu drugiego wariantu porównamy obszary."}
        </p>
        <h3>Największy progres</h3>
        <p>
          {dashboard.progress
            ? `${modeNames[dashboard.progress.mode]} ${dashboard.progress.distance} m: +${dashboard.progress.trend!.delta} pp`
            : "Trend wymaga 5 + 5 porównywalnych sesji; pokażemy tylko rzeczywistą poprawę."}
        </p>
      </section>
      <section className="card product-optional">
        <p className="eyebrow">KRÓTKIE ZADANIE · OPCJONALNE</p>
        <h2>Jedna kula dnia</h2>
        <p>Jedna próba, bez XP i bez presji codziennego treningu.</p>
        <Link className="secondary" to="/coach/extras">
          Wybierz krótkie zadanie
        </Link>
      </section>
      {athlete ? (
        <div className="coach-links">
          <Link to="/training?group=Testy">Testy kontrolne</Link>
          <Link to="/coach/competition">Mam zawody</Link>
          <Link to="/coach/generator?focus=presja">Presja</Link>
          <Link to="/coach/match">Tryb meczowy</Link>
        </div>
      ) : (
        <details className="rules-notes">
          <summary>Poznaj pozostałe możliwości</summary>
          <div className="coach-links">
            <Link to="/adventure">Misje i taktyka</Link>
            <Link to="/coach/development">Mój rozwój</Link>
            <Link to="/coach/weaknesses">Do poprawy</Link>
            <Link to="/coach/challenge">Pokonaj siebie</Link>
            <Link to="/coach/week">Mój tydzień</Link>
            <Link to="/training?group=Testy">Testy kontrolne</Link>
          </div>
          {guide}
        </details>
      )}
      <ProgressionInfo
        session={state.draft ?? competition ?? undefined}
        distances={[r.distance]}
        drillId={r.session?.drillId}
      />
    </div>
  );
}

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
            {r.session.difficulty} ·{" "}
            {surfaces.find((s) => s.id === r.session.surface)?.label ??
              "teren nieoznaczony"}
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
                boundary: r.session.boundary,
                surface: r.session.surface,
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
  const [focus, setFocus] = useState<TrainingFocus>(
    search.get("focus") === "presja" ? "presja" : "słabości",
  );
  const session = generateTraining(state, minutes, focus);
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
      </section>
      <section className="card">
        <h2>Plan na {minutes} minut</h2>
        <p className="muted">
          Czasy są orientacyjne. Zapisujemy każdą kulę i etap.
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
          <Link className="button" to="/session">
            Wznów rozpoczęty trening
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
            ZACZNIJ TRENING <ArrowRight />
          </button>
        )}
      </section>
      <ProgressionInfo session={session} />
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
  const hits = previous?.results.filter((a) => a.hit).length ?? 0;
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
            <p>
              Teren:{" "}
              {surfaces.find((s) => s.id === session.surface)?.label ??
                "nieoznaczony"}{" "}
              · {session.kind === "test" ? "test" : "trening"}
            </p>
            <p className="muted">
              Ustaw teren i cel jak poprzednio. Wynik porównamy po pełnej serii.
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
            <Link className="button" to="/training?group=Testy">
              Wybierz test kontrolny
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
export function ResultInsights({ session }: { session: Session }) {
  const { state } = useApp();
  const record = personalBest(session, state.sessions);
  const benchmark = previousBenchmark(session, state.sessions);
  const eligible = state.sessions.filter(
    (s) =>
      s.id !== session.id &&
      s.kind !== "test" &&
      s.completedAt &&
      s.completedAt <= (session.completedAt ?? session.startedAt),
  );
  const groups = [
    ...new Map(
      session.results.map((a) => [`${a.mode}:${a.distance}`, a]),
    ).values(),
  ];
  const combined = {
    ...state,
    sessions: [
      ...state.sessions.filter((s) => s.id !== session.id),
      {
        ...session,
        completedAt: session.completedAt ?? new Date().toISOString(),
      },
    ],
  };
  const r = recommendation(combined);
  return (
    <section className="card coach-insights">
      <h2>Co mówi ten wynik?</h2>
      {record && (
        <div className="success">
          <Trophy size={20} />
          <div>
            <b>Personal Best</b>
            {record.records.map((r) => (
              <p key={r.label}>
                {r.label}: {r.previous} → {r.value}
              </p>
            ))}
          </div>
        </div>
      )}
      {session.kind === "test" && (
        <>
          <p>
            Test ·{" "}
            {session.results.length === session.plan.length
              ? "pełny benchmark"
              : "niepełna seria — nie jest benchmarkiem"}
          </p>
          {benchmark ? (
            benchmark.map((b) => (
              <p key={b.distance}>
                {b.distance} m: {b.before}% → {b.after}% ·{" "}
                {b.delta > 0 ? "+" : ""}
                {b.delta} pp
              </p>
            ))
          ) : (
            <p>
              Pierwszy pełny test w tych warunkach wyznaczy punkt odniesienia.
            </p>
          )}
        </>
      )}
      {session.kind !== "test" &&
        groups.map((a) => {
          const t = trends(
            [...eligible, session],
            a.mode,
            a.distance,
            conditionKey(session, a.mode, a.distance),
          );
          return (
            <p key={`${a.mode}:${a.distance}`}>
              {modeNames[a.mode]} {a.distance} m ·{" "}
              {t
                ? `${t.label}: ${t.previous}% → ${t.recent}% (${t.delta > 0 ? "+" : ""}${t.delta} pp)`
                : "Za mało danych na trend: potrzeba 5 + 5 sesji w tych samych warunkach."}
            </p>
          );
        })}
      <p>
        <b>Następny krok:</b> {modeNames[r.mode]} {r.distance} m. {r.reason}
      </p>
      <Link className="secondary" to="/coach/generator">
        Ułóż kolejny trening <ArrowRight size={17} />
      </Link>
    </section>
  );
}
