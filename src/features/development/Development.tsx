import { MentalFilters } from "../mental/Filters";
import { mentalCueText } from "../mental/cue";
import {
  mentalLevels,
  mentalLessons,
  type MentalCompetency,
  type MentalLevel,
} from "../mental/catalog";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Target,
  Trophy,
  CalendarDays,
  Wind,
  Activity,
  ArrowRight,
  Check,
} from "lucide-react";
import { useApp } from "../../app-context";
import { localDay } from "../../domain";
import { drills } from "../../data";
import { changeWeeklyGoal, modeNames, weeklyProgress } from "../coaching/model";
import {
  audience,
  chooseChallenge,
  competitionTraining,
  createMastery,
  createMicroGoal,
  createGoalSession,
  createRoutineGoal,
  daysUntilCompetition,
  exerciseProgress,
  goalProgress,
  masteryDrills,
  skillScores,
  weeklyChallenge,
  xpLevel,
} from "./model";
import {
  advancePractice,
  practiceModules,
  practiceSteps,
  startPractice,
  selectPracticeCue,
} from "./practices";
import type { WeeklyChallenge } from "./types";

function PageTitle({ title, caption }: { title: string; caption: string }) {
  return (
    <>
      <Link className="back" to="/">
        ← Dzisiaj
      </Link>
      <div className="page-heading">
        <p className="eyebrow">TWÓJ PROGRES. TWOJA GRA.</p>
        <h1>{title}</h1>
        <p className="muted">{caption}</p>
      </div>
    </>
  );
}
export function Development() {
  const { state } = useApp();
  const scores = skillScores(state);
  const level = xpLevel(state.coaching?.xpEvents);
  return (
    <div className="coach-page">
      <PageTitle
        title="Mój rozwój"
        caption="Umiejętności z wyników. Motywacja z wykonanej pracy."
      />
      <section className="card development-xp">
        <p className="eyebrow">POZIOM AKTYWNOŚCI · {level.name}</p>
        <h2>
          Poziom {level.level} · {level.xp} XP
        </h2>
        <progress
          aria-label="XP do kolejnego poziomu"
          value={level.progress}
          max={level.needed}
        />
        <p>
          {level.needed - level.progress} XP do kolejnego poziomu. XP nie mierzy
          umiejętności.
        </p>
        <details>
          <summary>Za co dostaję XP?</summary>
          <p>
            Pełna seria minimum 6 rzutów: 35 XP, test: 50 XP. Bonus za rekord,
            powrót do priorytetu lub misję. Maksymalnie dwie serie nagradzane
            dziennie. Mental i ciało: po 20 XP, najwyżej raz dziennie dla
            każdego rodzaju. Quiz i nowe lekcje też mają limit. Import i ponowne
            otwarcie wyniku nie dodają XP.
          </p>
        </details>
      </section>
      <section>
        <h2>Skill Tree</h2>
        <p className="muted">
          Każdy obszar rozwija się osobno. Kreska oznacza brak wystarczających
          danych.
        </p>
        <div className="development-skills">
          {scores.map((s) => (
            <article className="card" key={s.id}>
              <div className="development-skill-title">
                <h3>{s.name}</h3>
                <strong>
                  {s.level ?? "—"}
                  <small> / 10</small>
                </strong>
              </div>
              <progress
                aria-label={`Poziom: ${s.name}`}
                value={s.level ?? 0}
                max={10}
              />
              <p>{s.evidence}</p>
              {["point", "shoot", "lob"].includes(s.id) && (
                <Link
                  className="text-link"
                  to={`/training/test-${s.id === "point" ? "target" : s.id}`}
                >
                  Wykonaj test <ArrowRight size={16} />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
      <div className="development-menu">
        {[
          ["/coach/week", "Mój tydzień", CalendarDays],
          ["/coach/goals", "Mikrocele", Target],
          ["/coach/mastery", "Próby mistrzowskie", Trophy],
          ["/coach/practice/mental", "Mental", Wind],
          ["/coach/practice/physical", "Ciało do gry", Activity],
          ["/coach/competition", "Mam zawody", CalendarDays],
          ["/coach/match", "Tryb meczowy", Target],
          ["/coach/boss", "Sprawdziany rozdziałów", Trophy],
          ["/coach/extras", "Wyzwania własne", Target],
        ].map(([path, title, Icon]) => {
          const I = Icon as typeof Target;
          return (
            <Link className="card" key={String(path)} to={String(path)}>
              <I size={24} />
              <h3>{String(title)}</h3>
              <ArrowRight size={19} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
export function Week() {
  const { state, save, busy } = useApp();
  const week = weeklyProgress(state);
  const challenge = weeklyChallenge(state);
  return (
    <div className="coach-page">
      <PageTitle
        title="Mój tydzień"
        caption="Nie musisz trenować codziennie. Ustal rytm, który możesz utrzymać."
      />
      <section className="card config">
        <h2>
          {week.count} / {week.target} sesji w tym tygodniu
        </h2>
        <progress
          aria-label="Sesje w tygodniu"
          value={Math.min(week.count, week.target)}
          max={week.target}
        />
        <p>
          {week.streak} tygodni regularnego treningu. Bieżący nieukończony
          tydzień nie przerywa serii.
        </p>
        {week.perfect && (
          <p className="success">
            <Check size={20} /> Perfect Week — cel tygodnia wykonany.
          </p>
        )}
        <label>
          Cel tygodnia
          <select
            value={week.target}
            disabled={busy}
            onChange={(e) =>
              void save(changeWeeklyGoal(state, Number(e.target.value)))
            }
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} sesji
              </option>
            ))}
          </select>
        </label>
        <p className="muted small">
          Zmieniasz cel bieżącego tygodnia. Cele wcześniejszych tygodni zostają
          zachowane. Liczą się pełne sesje z minimum 6 rzutami.
        </p>
        <div className="development-milestones">
          {[2, 4, 8, 12].map((n) => (
            <span
              key={n}
              className={
                state.awards?.some((a) => a.id === `perfect:${n}`)
                  ? "earned"
                  : ""
              }
            >
              Perfect Week × {n}
            </span>
          ))}
        </div>
      </section>
      <section className="card config">
        <p className="eyebrow">JEDNO WYZWANIE · OPCJONALNE</p>
        <h2>{challenge.title}</h2>
        <p>
          {challenge.count} / {challenge.target}
          {challenge.complete ? " · wykonane" : ""}
        </p>
        <progress
          aria-label="Postęp wyzwania tygodniowego"
          value={Math.min(challenge.count, challenge.target)}
          max={challenge.target}
        />
        <label>
          Wyzwanie tego tygodnia
          <select
            value={challenge.kind}
            disabled={busy}
            onChange={(e) =>
              void save(
                chooseChallenge(
                  state,
                  e.target.value as WeeklyChallenge["kind"],
                ),
              )
            }
          >
            <option value="distances">3 różne dystanse</option>
            <option value="point-hits">100 celnych puent</option>
            <option value="shoot-attempts">
              50 strzałów z {audience(state) === "junior" ? 7 : 8} m
            </option>
            <option value="routine">3 pełne sesje z rutyną</option>
          </select>
        </label>
        <p className="muted small">
          Jedna nagroda za wyzwanie w tygodniu, także gdy zmienisz wybór.
        </p>
        <Link className="button" to="/coach/generator">
          Zaplanuj trening
        </Link>
      </section>
    </div>
  );
}
export function Goals() {
  const { state, save, busy } = useApp();
  const goals = state.coaching?.goals ?? [];
  const navigate = useNavigate();
  const canAdd = createMicroGoal(state) !== state;
  return (
    <div className="coach-page">
      <PageTitle
        title="Mikrocele"
        caption="Mała zmiana, którą sprawdzisz w swoich wynikach."
      />
      <section className="card config">
        <h2>Wybierz następny krok</h2>
        <button
          className="button"
          disabled={busy || !canAdd}
          onClick={() => void save(createMicroGoal(state))}
        >
          Zapisz cel dla słabszego elementu
        </button>
        {!canAdd && (
          <p className="muted">
            Potrzebujemy próbek do rekomendacji albo ten wariant ma już aktywny
            cel.
          </p>
        )}
        <button
          className="secondary"
          disabled={busy || createRoutineGoal(state) === state}
          onClick={() => void save(createRoutineGoal(state))}
        >
          Rutyna w 3 pełnych sesjach
        </button>
      </section>
      {goals.map((g) => {
        const p = goalProgress(state, g);
        return (
          <section className="card" key={g.id}>
            <h2>
              {g.kind === "routine"
                ? "3 pełne sesje z rutyną"
                : `${modeNames[g.mode!]} ${g.distance} m: ${g.baseline}% → ${g.target}%`}
            </h2>
            <p>
              {p.complete
                ? "Cel osiągnięty"
                : p.ready
                  ? `${p.value}${g.kind === "accuracy" ? "%" : ""} / ${g.target}${g.kind === "accuracy" ? "%" : ""}`
                  : `Zbieramy dane: ${p.samples} prób. Potrzeba 20 prób z 2 pełnych sesji po utworzeniu celu.`}
            </p>
            <progress
              aria-label={`Postęp celu ${g.kind === "routine" ? "rutyna" : `${modeNames[g.mode!]} ${g.distance} m`}`}
              value={p.ready ? Math.min(p.value, g.target) : 0}
              max={g.target}
            />
            {g.kind === "accuracy" && (
              <p className="muted">
                Liczą się nowe sesje w tych samych warunkach, w ćwiczeniu{" "}
                {drills.find((d) => d.id === g.drillId)?.name}.
              </p>
            )}
            {g.kind === "accuracy" && createGoalSession(state, g) ? (
              <button
                className="secondary"
                disabled={busy}
                onClick={async () => {
                  if (state.draft) {
                    navigate("/session");
                    return;
                  }
                  const session = createGoalSession(state, g)!;
                  if (await save({ ...state, draft: session }))
                    navigate("/session");
                }}
              >
                Trenuj ten cel w tych samych warunkach
              </button>
            ) : (
              <Link
                className="secondary"
                to={g.drillId ? `/training/${g.drillId}` : "/coach/generator"}
              >
                Trenuj ten cel
              </Link>
            )}
          </section>
        );
      })}
    </div>
  );
}
export function Mastery() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  return (
    <div className="coach-page">
      <PageTitle
        title="Próby mistrzowskie"
        caption="Poznaj → trenuj → utrwal → test → Mastery → Legendary."
      />
      <p className="notice">
        Odblokowanie: dwie pełne serie w tych samych warunkach, razem minimum 20
        prób, każda z minimum 60% trafień. Mastery: 8/10. Legendary: 8/10 na
        losowych dystansach. Jedna próba, bez cofania. W lobie liczy się
        pierwsze lądowanie.
      </p>
      {error && <p role="alert">{error}</p>}
      {masteryDrills.map((id) => {
        const p = exerciseProgress(state, id);
        const d = drills.find((d) => d.id === id)!;
        return (
          <section className="card config" key={id}>
            <p className="eyebrow">{p.stage}</p>
            <h2>{d.name}</h2>
            <div className="development-milestones">
              <span className={p.mastery ? "earned" : ""}>
                Mastery {p.mastery ? "✓" : ""}
              </span>
              <span className={p.legendary ? "earned" : ""}>
                Legendary {p.legendary ? "✓" : ""}
              </span>
            </div>
            <p>
              {p.unlocked
                ? "Masz podstawę do próby mistrzowskiej."
                : "Najpierw utrwal wyniki w zwykłym treningu."}
            </p>
            <Link className="secondary" to={`/training/${id}`}>
              Trenuj i utrwal
            </Link>
            {(["mastery", "legendary"] as const).map((tier) => (
              <button
                className="button"
                key={tier}
                disabled={
                  busy ||
                  !!state.draft ||
                  !p.unlocked ||
                  (tier === "legendary" && !p.mastery)
                }
                onClick={async () => {
                  try {
                    const session = createMastery(state, id, tier);
                    if (await save({ ...state, draft: session }))
                      navigate("/session");
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Nie udało się przygotować próby.",
                    );
                  }
                }}
              >
                {tier === "mastery" ? "Próba Mastery" : "Próba Legendary"}
              </button>
            ))}
          </section>
        );
      })}
      {state.draft && (
        <Link className="button" to="/session">
          Wznów otwartą sesję
        </Link>
      )}
    </div>
  );
}
export function PracticeLibrary({ kind }: { kind: "mental" | "physical" }) {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const [variant, setVariant] = useState<"junior" | "adult">(
    audience(state) === "junior" ? "junior" : "adult",
  );
  const [minutes, setMinutes] = useState<5 | 10>(5);
  const [before, setBefore] = useState(3);
  const [competency, setCompetency] = useState<MentalCompetency | "all">("all");
  const [mentalLevel, setMentalLevel] = useState<MentalLevel | "all">("all");
  const [search] = useSearchParams();
  const selectedLesson = search.get("lesson");
  const last = state.coaching?.practiceHistory
    ?.filter((p) => p.kind === kind)
    .at(-1);
  return (
    <div className="coach-page">
      <PageTitle
        title={kind === "mental" ? "Mental w praktyce" : "Ciało do gry"}
        caption={
          kind === "mental"
            ? "Krótkie zadanie na 2 minuty. Uwaga wraca do następnej kuli."
            : "Krótki moduł ruchowy do pétanque, bez ciężarów i treningu do wyczerpania."
        }
      />
      {last && (
        <p className="success">
          Ostatni moduł zapisany:{" "}
          {practiceModules.find((m) => m.id === last.moduleId)?.title}
          {last.checkin
            ? ` · napięcie ${last.checkin.before} → ${last.checkin.after}/5`
            : ""}
          .
        </p>
      )}
      {kind === "mental" && state.coaching?.pendingMentalCueLessonId && (
        <section className="notice" aria-label="Wskazówka do następnej serii">
          <p>
            Na następną serię: „
            {mentalCueText(state.coaching.pendingMentalCueLessonId)}”
          </p>
          <Link className="button" to="/training">
            Przejdź do treningu technicznego
          </Link>
          <button
            className="secondary"
            disabled={busy}
            onClick={() =>
              void save({
                ...state,
                coaching: {
                  ...state.coaching!,
                  pendingMentalCueLessonId: undefined,
                },
              })
            }
          >
            Usuń wskazówkę
          </button>
        </section>
      )}
      <section className="card config">
        {kind === "physical" ? (
          <>
            <label>
              Wariant
              <select
                value={variant}
                onChange={(e) =>
                  setVariant(e.target.value as "junior" | "adult")
                }
              >
                <option value="junior">Junior</option>
                <option value="adult">Dorosły</option>
              </select>
            </label>
            <fieldset>
              <legend>Mam…</legend>
              <div className="filters">
                {([5, 10] as const).map((n) => (
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
            <p>
              Spokojny, wygodny zakres ruchu. Jeśli pojawia się ból, zakończ
              ćwiczenie. Junior ćwiczy z dorosłym.
            </p>
            <details>
              <summary>Jak wygląda moduł?</summary>
              <p>
                Czas obejmuje instrukcje i spokojne przejścia. W wersji 10 minut
                powtórz sekwencję po odpoczynku. Możesz przerwać moduł bez
                zaliczenia; wróć do niego, gdy będziesz gotowy.
              </p>
            </details>
          </>
        ) : (
          <label>
            Napięcie przed modułem (1–5)
            <select
              value={before}
              onChange={(e) => setBefore(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>
      {state.coaching?.practiceDraft && (
        <Link className="button" to="/coach/practice/session">
          Wznów rozpoczęty moduł
        </Link>
      )}
      {kind === "mental" && (
        <MentalFilters
          competency={competency}
          level={mentalLevel}
          onCompetency={setCompetency}
          onLevel={setMentalLevel}
        />
      )}
      {kind === "mental" && selectedLesson && (
        <p>
          Wybrane ćwiczenie z lekcji.{" "}
          <Link to="/coach/practice/mental">Pokaż wszystkie ćwiczenia</Link>
        </p>
      )}
      <div className="development-skills">
        {practiceModules
          .filter(
            (m) =>
              m.kind === kind &&
              (kind !== "mental" ||
                ((competency === "all" || m.competency === competency) &&
                  (mentalLevel === "all" || m.level === mentalLevel) &&
                  (!selectedLesson || m.lessonId === selectedLesson))),
          )
          .map((m) => (
            <section className="card config" key={m.id}>
              <p className="eyebrow">
                {m.category} ·{" "}
                {kind === "mental"
                  ? `${mentalLevels.find((l) => l.id === m.level)?.name} · 2`
                  : minutes}{" "}
                MIN
              </p>
              <h2>{m.title}</h2>
              <p>{m.description}</p>
              <details>
                <summary>Zobacz ćwiczenia</summary>
                <ol className="coach-blocks">
                  {(variant === "junior"
                    ? (m.juniorSteps ?? m.steps)
                    : m.steps
                  ).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </details>
              <button
                className="button"
                disabled={busy || !!state.coaching?.practiceDraft}
                onClick={async () => {
                  if (
                    await save(
                      startPractice(
                        state,
                        m.id,
                        kind === "mental" ? 2 : minutes,
                        variant,
                        before,
                      ),
                    )
                  )
                    navigate("/coach/practice/session");
                }}
              >
                Zacznij moduł
              </button>
            </section>
          ))}
      </div>
      {kind === "mental" && (
        <Link className="secondary" to="/lessons">
          Lekcje pięciu kompetencji mentalnych
        </Link>
      )}
    </div>
  );
}
export function PracticeActive() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const [after, setAfter] = useState(3);
  const [confirm, setConfirm] = useState(false);
  const draft = state.coaching?.practiceDraft;
  if (!draft)
    return (
      <div className="coach-page">
        <PageTitle
          title="Wybierz moduł"
          caption="Krótki mental lub ruch przed treningiem."
        />
        <Link className="button" to="/coach/practice/mental">
          Mental
        </Link>
        <Link className="secondary" to="/coach/practice/physical">
          Ciało do gry
        </Link>
      </div>
    );
  const module = practiceModules.find((m) => m.id === draft.moduleId)!;
  const steps = practiceSteps(draft);
  const last = draft.step === steps.length - 1;
  return (
    <div className="active coach-guided">
      <p className="eyebrow">
        {draft.minutes} MIN · KROK {draft.step + 1} / {steps.length}
      </p>
      <h1>{module.title}</h1>
      <p className="development-practice-step">{steps[draft.step]}</p>
      {last && draft.kind === "mental" && (
        <label>
          Wskazówka do następnej serii (opcjonalnie)
          <select
            disabled={busy}
            value={draft.cueLessonId ?? ""}
            onChange={(e) =>
              void save(selectPracticeCue(state, e.target.value || undefined))
            }
          >
            <option value="">Bez nowej wskazówki</option>
            {[...new Set([module.lessonId, "routine", "mistake"])].map((id) => {
              const lesson = mentalLessons.find((l) => l.id === id);
              return lesson ? (
                <option key={id} value={id}>
                  {lesson.phrase}
                </option>
              ) : null;
            })}
          </select>
          <span className="muted small">
            Pojawi się przy rzutach w następnym nowym treningu. Testy i wyzwania
            ją zachowają na później.
          </span>
        </label>
      )}
      {last && draft.kind === "mental" && (
        <label>
          Napięcie po module (1–5)
          <select
            value={after}
            onChange={(e) => setAfter(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        className="button"
        disabled={busy}
        onClick={async () => {
          if (
            await save(
              advancePractice(
                state,
                last && draft.kind === "mental" ? after : undefined,
              ),
            )
          ) {
            if (last) navigate(`/coach/practice/${draft.kind}`);
          }
        }}
      >
        {last ? "Zakończ i zapisz moduł" : "Wykonane · następny krok"}
      </button>
      <Link className="secondary" to="/">
        Przerwa · wróć do Dzisiaj
      </Link>
      <button className="secondary" onClick={() => setConfirm(true)}>
        Przerwij moduł
      </button>
      {confirm && (
        <div className="notice">
          <p>
            Przerwany moduł nie zostanie zaliczony. Możesz też wrócić do
            ćwiczenia.
          </p>
          <button
            className="danger"
            disabled={busy}
            onClick={async () => {
              if (
                await save({
                  ...state,
                  coaching: {
                    weeklyGoals: [],
                    ...state.coaching,
                    practiceDraft: undefined,
                  },
                })
              )
                navigate(`/coach/practice/${draft.kind}`);
            }}
          >
            Tak, przerwij moduł
          </button>
          <button className="secondary" onClick={() => setConfirm(false)}>
            Wróć do ćwiczenia
          </button>
        </div>
      )}
    </div>
  );
}
export function Competition() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const [date, setDate] = useState(
    state.coaching?.competition?.date ?? localDay(new Date()),
  );
  const [saved, setSaved] = useState(false);
  const days = daysUntilCompetition(state);
  const session = competitionTraining(state);
  const quick = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    setDate(localDay(d));
    setSaved(false);
  };
  return (
    <div className="coach-page">
      <PageTitle
        title="Mam zawody"
        caption="Przed startem liczy się jakość, rutyna i pewność. Objętość maleje bliżej zawodów."
      />
      <form
        className="card config"
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await save({
              ...state,
              coaching: {
                weeklyGoals: [],
                ...state.coaching,
                competition: { date },
              },
            })
          )
            setSaved(true);
        }}
      >
        <label>
          Data zawodów
          <input
            type="date"
            required
            min={localDay(new Date())}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSaved(false);
            }}
          />
        </label>
        <fieldset>
          <legend>Zawody za…</legend>
          <div className="filters">
            {[1, 3, 7, 14].map((n) => (
              <button type="button" key={n} onClick={() => quick(n)}>
                {n} {n === 1 ? "dzień" : "dni"}
              </button>
            ))}
          </div>
        </fieldset>
        <button className="button" disabled={busy}>
          Zapisz termin zawodów
        </button>
        {saved && (
          <p role="status">
            Termin zapisany. Dzisiaj uwzględni przygotowanie do zawodów.
          </p>
        )}
        {state.coaching?.competition && (
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() =>
              void save({
                ...state,
                coaching: {
                  weeklyGoals: [],
                  ...state.coaching,
                  competition: undefined,
                },
              })
            }
          >
            Usuń termin
          </button>
        )}
      </form>
      {session && (
        <section className="card config">
          <h2>
            {days === 0
              ? "Dzień zawodów"
              : `Do zawodów: ${days} ${days === 1 ? "dzień" : "dni"}`}
          </h2>
          <p>
            {session.trainingPlan!.minutes} min · {session.plan.length} rzutów ·{" "}
            {session.plan[0].distance} m. Znany dystans, stała rutyna, krótki
            reset.
          </p>
          <ol className="coach-blocks">
            {session.trainingPlan!.blocks.map((b, i) => (
              <li key={i}>
                <b>
                  {b.minutes} min · {b.title}
                </b>
                <p>{b.instruction}</p>
              </li>
            ))}
          </ol>
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
              Zacznij przygotowanie
            </button>
          )}
          <Link className="secondary" to="/adventure/tactics">
            Krótka sytuacja meczowa
          </Link>
        </section>
      )}
      {days !== null && days > 14 && (
        <p className="notice">
          Termin jest jeszcze odległy. Kontynuuj zwykły trening; plan
          przygotowania pojawi się 14 dni przed zawodami.
        </p>
      )}
      {days !== null && days < 0 && (
        <p className="notice">Ten termin już minął. Zapisz następne zawody.</p>
      )}
    </div>
  );
}
