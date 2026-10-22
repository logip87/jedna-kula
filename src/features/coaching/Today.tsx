import { TrainingIntent } from "../profile/TrainingIntent";
import { goalStep, productMessage, trainingGoals } from "../profile/intent";
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
import {
  competitionTraining,
  daysUntilCompetition,
} from "../development/model";
import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Timer, RotateCcw } from "lucide-react";
import { useApp } from "../../app-context";
import { successfulAttempt } from "../../domain";
import { drills } from "../../data";
import { modeNames, recommendation, weeklyProgress } from "./model";
export function Today({ guide }: { guide?: ReactNode }) {
  const { state, save, busy } = useApp(),
    navigate = useNavigate();
  const r = recommendation(state),
    competition = competitionTraining(state),
    week = weeklyProgress(state),
    proposal = adaptation(state),
    mental = mentalRecommendation(state),
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
            {state.player?.name ? `${state.player.name}, ` : ""}jedno zadanie i
            jasny następny krok.
          </p>
        </div>
      </div>
      {!state.player &&
        !state.sessions.some((session) => session.completedAt) && (
          <section className="card">
            <h2>Od grania do trenowania.</h2>
            <p>{productMessage}</p>
          </section>
        )}
      {!state.draft && <TrainingIntent />}
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
      <section className="card">
        <h2>
          {state.player?.trainingGoal
            ? trainingGoals[state.player.trainingGoal]
            : "Twój kolejny krok"}
        </h2>
        <p>{goalStep(state.player?.trainingGoal).reason}</p>
        <Link
          className="text-link"
          to={goalStep(state.player?.trainingGoal).to}
        >
          {goalStep(state.player?.trainingGoal).title} →
        </Link>
        <p className="muted small">
          Cel możesz zmienić w <Link to="/profile">profilu</Link>. Dzisiejsza
          propozycja techniczna korzysta z porównywalnych wyników, gdy jest ich
          wystarczająco dużo.
        </p>
      </section>
      <div className="coach-links">
        <Link to="/coach/week">Mój tydzień</Link>
        <Link to="/coach/weaknesses">Do poprawy</Link>
        <Link to="/lessons/routine">Rutyna przed rzutem</Link>
        <Link to="/coach/competition">Mam zawody</Link>
      </div>
      <details className="rules-notes">
        <summary>Poznaj pozostałe możliwości</summary>
        <div className="coach-links">
          <Link to="/adventure">Misje i taktyka</Link>
          <Link to="/coach/development">Mój rozwój</Link>
          <Link to="/coach/match">Tryb meczowy</Link>
        </div>
        {guide}
      </details>
      <details className="rules-notes">
        <summary>Zaawansowane warianty i sprawdziany</summary>
        <p>
          Spróbuj, gdy masz już punkt odniesienia z regularnych serii. Wyniki
          porównujesz z własnymi treningami.
        </p>
        <div className="coach-links">
          <Link to="/training?group=Testy">Testy kontrolne</Link>
          <Link to="/coach/mastery">Próby mistrzowskie</Link>
          <Link to="/coach/challenge">Pokonaj siebie</Link>
          <Link to="/coach/generator?focus=presja">Trening z presją</Link>
        </div>
      </details>
      <ProgressionInfo
        session={state.draft ?? competition ?? undefined}
        distances={[r.distance]}
        drillId={r.session?.drillId}
      />
    </div>
  );
}
