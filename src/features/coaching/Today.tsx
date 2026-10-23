import { TrainingPicker } from "./TrainingPicker";
import { goalStep, trainingGoals } from "../profile/intent";
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
import { ArrowRight, RotateCcw } from "lucide-react";
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
  const startSuggestion = async (adapt = false) => {
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
            {state.player?.name ? `${state.player.name}, ` : ""}wybierz, nad
            czym chcesz dziś popracować.
          </p>
        </div>
      </div>
      {state.draft ? (
        <section className="coach-main">
          <p className="eyebrow">TRENING W TOKU</p>
          <h2>Dokończ rozpoczętą sesję</h2>
          <p>
            {state.draft.results.length} z {state.draft.plan.length} rzutów
            zapisanych. Twoje ustawienia i wyniki czekają.
          </p>
          <button
            className="button cream"
            disabled={busy}
            onClick={() => navigate("/session")}
          >
            Wznów trening <ArrowRight size={22} />
          </button>
        </section>
      ) : (
        <TrainingPicker />
      )}
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
        <details className="rules-notes card">
          <summary>Podpowiedzi do treningu · opcjonalnie</summary>
          <RoutineGuide expanded={false} />
          <h2>
            {competition
              ? "Przed zawodami: jakość i rutyna"
              : "Propozycja na podstawie wyników"}
          </h2>
          <p>
            {competition
              ? `Zawody ${daysUntilCompetition(state) === 0 ? "dzisiaj" : `za ${daysUntilCompetition(state)} dni`}. Krótka seria na znanym dystansie i spokojny reset.`
              : r.reason}
          </p>
          {mental && <p>{mental.reason}</p>}
          <button
            className="secondary"
            disabled={busy}
            onClick={() => void startSuggestion()}
          >
            {competition
              ? "Zacznij trening przed zawodami"
              : "Zacznij proponowany trening"}
          </button>
          <Link className="text-link" to="/coach/generator">
            Ułóż dłuższy trening →
          </Link>
        </details>
      )}
      {proposal && !competition && !state.draft && (
        <section className="notice">
          <p className="eyebrow">OPCJONALNA ZMIANA WARIANTU</p>
          <p>
            <b>{proposal.reason}</b>
          </p>
          <p>
            {proposal.evidence} {proposal.change}
          </p>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => void startSuggestion(true)}
          >
            {proposal.kind === "harder"
              ? "SPRÓBUJ TRUDNIEJ"
              : "ŁATWIEJSZY WARIANT"}
          </button>
          <p className="muted small">
            Możesz przyjąć propozycję lub samodzielnie ustawić dowolny dostępny
            dystans powyżej.
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
          Cel możesz zmienić w <Link to="/profile">profilu</Link>. To
          podpowiedź; rodzaj treningu i dystans wybierasz sam.
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
    </div>
  );
}
