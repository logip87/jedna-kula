import { BeginnerGuide } from "./BeginnerGuide";
import { ResultInsights } from "./features/coaching/ResultInsights";
import { IntentFields } from "./features/profile/TrainingIntent";
import {
  productMessage,
  type PlayingStyle,
  type TrainingGoal,
} from "./features/profile/intent";
import { FieldTaskAction, FieldReflection } from "./features/mental/FieldTask";
import {
  throwScenarios,
  scenarioForThrow,
  decisionReviews,
  reviewDecision,
  type DecisionReview,
} from "./features/situations/throw-scenarios";
import { mentalCueText } from "./features/mental/cue";
import {
  routineSteps,
  mentalCompetencies,
  mentalLevels,
  completedMentalLessons,
  technicalMentalCue,
} from "./features/mental/catalog";
import {
  TrainingSummary,
  MeasurementSettings,
} from "./features/product/Product";
import { challengePassed } from "./features/situations/model";
import React, { useEffect, useRef, useState } from "react";
import { LobSetup } from "./LobSetup";
import { ProgressionInfo } from "./features/product/ProgressionInfo";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  Target,
  BookOpen,
  ChartNoAxesCombined,
  Flame,
  Check,
  Trophy,
  CircleDot,
  Crosshair,
  Wind,
  Shuffle,
  Flag,
  Focus,
  Download,
  History,
  User,
  Settings,
  X,
  RotateCcw,
  Play,
  Sparkles,
  Search,
  Compass,
  Zap,
  Timer,
  MessageSquare,
} from "lucide-react";
import { drills, lessons } from "./data";
import {
  boundaryDistance,
  choices,
  makePlan,
  summarize,
  stats,
  achievements,
  type State,
  type Session,
  type Mode,
  type Difficulty,
} from "./domain";
import {
  masteryHits,
  audience as playerAudience,
} from "./features/development/model";
import { BackupControls } from "./features/coaching/BackupControls";
import { serializeBackup, downloadBackup } from "./features/coaching/backup";
import {
  modeNames,
  recommendation,
  trainingRecommendations,
  weeklyProgress,
} from "./features/coaching/model";
import {
  comparableBaseline,
  dashboardEvidence,
  historySessions,
  progressEvidence,
  progressResults,
  sessionOutcome,
} from "./features/product/model";
import { canUndoLastThrow, undoLastThrow } from "./features/coaching/session";
import { useApp } from "./app-context";
import { DirectionPicker } from "./features/adventure/ui";
import { missionCompleted, type Direction } from "./features/adventure/model";
const date = (s: string) =>
  new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
const iconMap: Record<string, typeof Target> = {
  Puenta: CircleDot,
  Strzał: Crosshair,
  Lob: Wind,
  "Gra przy linii": Flag,
  "Różne odległości": Shuffle,
  Precyzja: Focus,
  "Gra sytuacyjna": Target,
  "Trening mieszany": Shuffle,
};
function CategoryIcon({ category }: { category: string }) {
  const Icon = iconMap[category] ?? Target;
  return <Icon size={24} />;
}
function Heading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children && <p className="muted">{children}</p>}
    </div>
  );
}
function Back({ to = "/training" }: { to?: string }) {
  return (
    <Link className="back" to={to}>
      <ChevronLeft size={18} /> Wróć
    </Link>
  );
}
function Routine() {
  return (
    <div className="routine">
      {routineSteps.map((x, i) => (
        <span key={x}>
          <small>0{i + 1}</small>
          {x}
        </span>
      ))}
    </div>
  );
}
function Boules() {
  return (
    <svg className="boules" viewBox="0 0 400 320" aria-hidden="true">
      <defs>
        <radialGradient id="metal" cx="30%" cy="20%">
          <stop stopColor="#fff0be" />
          <stop offset=".45" stopColor="#d5a32c" />
          <stop offset="1" stopColor="#5b421a" />
        </radialGradient>
      </defs>
      <ellipse
        cx="220"
        cy="262"
        rx="145"
        ry="27"
        fill="#292117"
        opacity=".13"
      />
      <circle
        cx="208"
        cy="160"
        r="135"
        fill="none"
        stroke="#7a603f"
        opacity=".3"
        strokeDasharray="5 9"
      />
      <circle
        cx="208"
        cy="160"
        r="105"
        fill="none"
        stroke="#7a603f"
        opacity=".2"
      />
      <path
        d="M24 210 Q90 64 222 107"
        fill="none"
        stroke="#453828"
        strokeWidth="2"
        strokeDasharray="6 8"
      />
      <path
        d="m208 94 15 13-20 4"
        fill="none"
        stroke="#453828"
        strokeWidth="2"
      />
      <circle cx="270" cy="177" r="76" fill="url(#metal)" />
      <path
        d="M218 122 Q234 198 338 218 M213 132 Q231 211 332 229"
        stroke="#4d4336"
        strokeWidth="5"
        fill="none"
      />
      <circle cx="160" cy="212" r="66" fill="url(#metal)" />
      <path
        d="M100 191 Q173 177 216 245 M96 201 Q169 185 209 255"
        stroke="#4d4336"
        strokeWidth="4"
        fill="none"
      />
      <circle cx="319" cy="267" r="18" fill="#ed7851" />
      <circle cx="313" cy="260" r="4" fill="#ffc49b" />
      <path
        d="M350 86v24m-12-12h24M70 270v16m-8-8h16"
        stroke="#493925"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Start() {
  const { state } = useApp();
  const st = stats(state);
  const last = state.sessions.at(-1);
  const steps = [
    {
      title: "Spróbuj na boisku",
      caption: "Zapisz swój pierwszy trening",
      done: st.count > 0,
      to: "/training/point-basic?level=easy",
      icon: Target,
    },
    {
      title: "Przygotuj koncentrację",
      caption: "Poznaj plan przed rzutem",
      done: state.lessons.includes("one"),
      to: "/lessons/one",
      icon: BookOpen,
    },
    {
      title: "Odkryj drugą rolę",
      caption: "Spróbuj puenty i strzału",
      done:
        st.attempts.some((a) => a.mode === "point") &&
        st.attempts.some((a) => a.mode === "shoot"),
      to: "/training/roles",
      icon: Shuffle,
    },
  ];
  return (
    <>
      <div className="greeting">
        <div>
          <p className="eyebrow">TWÓJ PLAN NA DZIŚ</p>
          <h1>
            Cześć{state.player?.name ? `, ${state.player.name}` : ""}{" "}
            <span className="wave" aria-hidden="true">
              ✦
            </span>
          </h1>
          <p className="muted">
            Od grania do trenowania. Jedno zadanie na dziś.
          </p>
        </div>
        <div className="streak">
          <Flame size={20} />
          <b>{weeklyProgress(state).streak}</b>
          <span>tygodni regularności</span>
        </div>
      </div>
      {state.draft && (
        <Link className="resume-card" to="/session">
          <span className="icon-box">
            <Play />
          </span>
          <span>
            <b>Wracamy na boisko?</b>
            <small>
              Twój trening czeka · {state.draft.results.length} zapisanych
              rzutów
            </small>
          </span>
          <ArrowRight size={23} />
        </Link>
      )}
      <Link className="adventure-start-banner" to="/adventure">
        <Sparkles size={26} />
        <span>
          <b>Twoja przygoda z pétanque</b>
          <small>Plan na 10–20 sesji, dopasowany do tempa treningu</small>
        </span>
        <ArrowRight size={22} />
      </Link>
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">
            <Zap size={14} /> MAŁA SESJA. DOBRY POCZĄTEK.
          </span>
          <h2>
            Od grania
            <br />
            do trenowania<span className="hero-dot">.</span>
          </h2>
          <p>{productMessage}</p>
          <Link
            className="button cream"
            to={state.draft ? "/session" : "/training/point-basic?level=easy"}
          >
            {state.draft ? "Dokończ trening" : "Rozpocznij trening"}{" "}
            <ArrowUpRight size={21} />
          </Link>
          <span className="hero-meta">
            <Timer size={15} /> około 10 min <span>·</span> 6 rzutów{" "}
            <span>·</span> bez presji
          </span>
        </div>
        <div className="hero-art">
          <span className="art-note">
            <Sparkles size={16} /> Jeden cel. Regularna praca.
          </span>
          <Boules />
          <span className="art-sticker">
            PLAN
            <br />I WYKONANIE ↗
          </span>
        </div>
      </section>
      {st.count === 0 && <BeginnerGuide />}
      <div className="section-title">
        <div>
          <p className="eyebrow">TWOJA ROZGRZEWKA</p>
          <h2>Technika + spokojna głowa</h2>
        </div>
        <span className="muted">Mała dawka na dobry dzień</span>
      </div>
      <div className="today-grid">
        <Link to="/training/point-basic" className="card plan-card">
          <div className="plan-top">
            <span className="tag">
              <CircleDot size={16} /> NA BOISKU
            </span>
            <span className="plan-index">01</span>
          </div>
          <h3>
            Bliżej celu.
            <br />
            Kula po kuli.
          </h3>
          <p className="muted">
            Puenta na 7 metrów. Sześć prób, żeby poczuć swój ruch.
          </p>
          <div className="card-footer">
            <span>
              <Timer size={16} /> około 10 min
            </span>
            <span className="round-arrow">
              <ArrowUpRight size={21} />
            </span>
          </div>
        </Link>
        <Link to="/lessons/mistake" className="card plan-card mental-card">
          <div className="plan-top">
            <span className="tag">
              <BookOpen size={16} /> W GŁOWIE
            </span>
            <span className="plan-index">02</span>
          </div>
          <h3>
            Reset po
            <br />
            błędzie.
          </h3>
          <p className="muted">
            Reset i następne zadanie. Naucz się zostawiać pudło za sobą.
          </p>
          <div className="card-footer">
            <span>
              <Timer size={16} /> 2 min czytania
            </span>
            <span className="round-arrow">
              <ArrowUpRight size={21} />
            </span>
          </div>
        </Link>
      </div>
      <div className="section-title">
        <div>
          <p className="eyebrow">ODKRYJ SWOJĄ GRĘ</p>
          <h2>Każda rola ma znaczenie</h2>
        </div>
        <Link to="/training">
          Wszystkie ćwiczenia <ArrowRight size={18} />
        </Link>
      </div>
      <div className="quick-grid">
        {[
          ["Puenta", "Połóż blisko"],
          ["Strzał", "Wybij cel"],
          ["Lob", "Poleć wyżej"],
          ["Trening mieszany", "Spróbuj obu ról"],
        ].map(([c, caption], i) => (
          <Link
            key={c}
            to={`/training?category=${encodeURIComponent(c)}`}
            className={`quick color-${i}`}
          >
            <CategoryIcon category={c} />
            <div>
              <b>{c}</b>
              <small>{caption}</small>
            </div>
            <ChevronRight size={18} />
          </Link>
        ))}
      </div>
      <section className="journey">
        <div className="section-title">
          <div>
            <p className="eyebrow">BEZ POŚPIECHU</p>
            <h2>Trzy kroki na start</h2>
          </div>
          <span className="journey-count">
            {steps.filter((x) => x.done).length} / 3
          </span>
        </div>
        <div className="journey-steps">
          {steps.map(({ title, caption, done, to, icon: Icon }, i) => (
            <Link key={title} to={to} className={done ? "done" : ""}>
              <span className="step-marker">
                {done ? <Check size={20} /> : <Icon size={20} />}
              </span>
              <span>
                <small>
                  KROK {i + 1}
                  {done ? " · GOTOWE" : ""}
                </small>
                <b>{title}</b>
                <p>{caption}</p>
              </span>
              <ChevronRight size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section className="routine-card">
        <div>
          <p className="eyebrow">ZABIERZ TO NA BOISKO</p>
          <h3>Cztery kroki. Każdy rzut.</h3>
        </div>
        <Routine />
      </section>
      <div className="section-title">
        <h2>Ostatni trening</h2>
        <Link to="/history">
          Historia <ArrowRight size={18} />
        </Link>
      </div>
      {last ? (
        <Link className="card history-item" to={`/history/${last.id}`}>
          <div className="icon-box">
            <CategoryIcon
              category={
                drills.find((d) => d.id === last.drillId)?.category ?? "Puenta"
              }
            />
          </div>
          <div>
            <h3>{drills.find((d) => d.id === last.drillId)?.name}</h3>
            <p className="muted">
              {date(last.completedAt!)} · {last.results.length} rzutów
            </p>
          </div>
          <b>{summarize(last).points} pkt</b>
          <ChevronRight size={20} />
        </Link>
      ) : (
        <div className="empty compact">
          <CircleDot size={30} />
          <p>
            Pierwsza kula przed Tobą.
            <br />
            <span className="muted">
              Twój wynik pojawi się tutaj. Po prostu spróbuj.
            </span>
          </p>
        </div>
      )}
    </>
  );
}
export function Library() {
  const { state } = useApp();
  const [group, setGroup] = useState(
    new URLSearchParams(location.search).get("group") ?? "Wszystkie",
  );
  const initial =
    new URLSearchParams(location.search).get("category") ?? "Wszystkie";
  const [filter, setFilter] = useState(initial);
  const [query, setQuery] = useState("");
  const [beginners, setBeginners] = useState(false);
  const categories = ["Wszystkie", ...new Set(drills.map((d) => d.category))];
  const beginnerIds = ["point-basic", "shoot-basic", "target", "lob"];
  const recommendations = trainingRecommendations(state);
  const hasHistory = state.sessions.some(
    (s) => s.completedAt && s.results.length > 0 && s.kind !== "test",
  );
  const primaryRecommendation = recommendations[0];
  const visible = drills.filter(
    (d) =>
      (group === "Wszystkie" ||
        (d.group ??
          (d.pressure
            ? "Presja"
            : d.mixed
              ? "Mix"
              : d.mode === "shoot"
                ? "Strzał"
                : d.mode === "lob"
                  ? "Lob"
                  : "Puenta")) === group) &&
      (filter === "Wszystkie" || d.category === filter) &&
      (!beginners || beginnerIds.includes(d.id)) &&
      `${d.name} ${d.category} ${d.description}`
        .toLocaleLowerCase("pl")
        .includes(query.toLocaleLowerCase("pl")),
  );
  return (
    <>
      <Heading eyebrow="WYJDŹ. SPRÓBUJ. POWTÓRZ." title="Wybierz trening">
        Wybierz jeden element: puentę, strzał lub lądowanie. Zapisz serię i
        powtórz ją w tych samych warunkach, aby sprawdzić postęp.
      </Heading>
      <Link className="secondary" to="/coach/generator">
        Ułóż trening na 10, 20 lub 30 minut
      </Link>
      <label className="coach-library-group">
        Rodzaj treningu
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          {[
            "Wszystkie",
            "Puenta",
            "Strzał",
            "Lob",
            "Presja",
            "Mix",
            "Testy",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <div className="library-start">
        <span className="icon-box">
          <Compass />
        </span>
        <div>
          <b>
            {hasHistory
              ? "Wybierz kolejny trening"
              : "Nie wiesz, od czego zacząć?"}
          </b>
          <p>
            {hasHistory
              ? "Zobacz propozycję opartą na Twoich wynikach albo wybierz dowolne ćwiczenie z biblioteki."
              : "Sześć spokojnych rzutów na 6 metrów to dobry pierwszy krok."}
          </p>
        </div>
        <Link
          className="secondary"
          to={
            hasHistory && primaryRecommendation
              ? `/training/${primaryRecommendation.drillId}`
              : "/training/point-basic?level=easy"
          }
        >
          {hasHistory
            ? primaryRecommendation?.personalized
              ? "Trenuj słabość"
              : "Wybierz trening"
            : "Mój pierwszy trening"}{" "}
          <ArrowRight size={18} />
        </Link>
      </div>
      <section
        className="library-recommendations"
        aria-labelledby="recommended-training"
      >
        <div className="section-title">
          <div>
            <p className="eyebrow">
              {hasHistory ? "NA PODSTAWIE TWOICH WYNIKÓW" : "NA DOBRY POCZĄTEK"}
            </p>
            <h2 id="recommended-training">
              {hasHistory ? "Polecane dla Ciebie" : "Polecane na start"}
            </h2>
          </div>
          <span>Do {recommendations.length} ćwiczeń</span>
        </div>
        <div className="drill-grid recommendation-grid">
          {recommendations.map((item) => {
            const drill = drills.find((d) => d.id === item.drillId)!;
            return (
              <Link
                key={`${item.drillId}:${item.mode}:${item.distance}`}
                className={`card drill-card recommendation-card ${drill.mode === "shoot" ? "shoot-card" : drill.mode === "lob" ? "lob-card" : drill.mixed ? "mixed-card" : ""}`}
                to={`/training/${drill.id}`}
              >
                <div className="drill-top">
                  <div className="icon-box">
                    <CategoryIcon category={drill.category} />
                  </div>
                  <span className="tag">{drill.category}</span>
                </div>
                <h3>{drill.name}</h3>
                <p className="muted">{drill.description}</p>
                <div className="recommendation-why">
                  <b>Dlaczego to widzisz</b>
                  <span>{item.reason}</span>
                  {item.personalized && (
                    <small>
                      {modeNames[item.mode]} {item.distance} m ·{" "}
                      {item.stableRate}% z ostatnich pełnych serii ·{" "}
                      {item.count} prób
                    </small>
                  )}
                </div>
                <div className="card-footer">
                  <span>
                    <Timer size={16} />
                    {drill.minutes} min ·{" "}
                    {drill.random
                      ? "Losowe odległości"
                      : `${drill.distances[0]}–${drill.distances.at(-1)} m`}
                  </span>
                  <span className="round-arrow">
                    <ArrowUpRight size={21} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <div className="section-title library-all-title">
        <div>
          <p className="eyebrow">PEŁNA BIBLIOTEKA</p>
          <h2>Wszystkie ćwiczenia</h2>
        </div>
      </div>
      <div className="library-tools">
        <label className="search-field">
          <Search size={20} />
          <input
            type="search"
            aria-label="Szukaj ćwiczenia"
            placeholder="Na co masz dziś ochotę?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          className={`beginner-filter ${beginners ? "selected" : ""}`}
          aria-pressed={beginners}
          onClick={() => setBeginners(!beginners)}
        >
          <Sparkles size={18} /> Na dobry początek
        </button>
      </div>
      <div className="filters" aria-label="Kategorie treningu">
        {categories.map((c) => (
          <button
            key={c}
            aria-pressed={filter === c}
            className={filter === c ? "selected" : ""}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="result-count" aria-live="polite">
        Wszystkie ćwiczenia: {visible.length}
      </p>
      <div className="drill-grid">
        {visible.map((d) => (
          <Link
            key={d.id}
            className={`card drill-card ${d.mode === "shoot" ? "shoot-card" : d.mode === "lob" ? "lob-card" : d.mixed ? "mixed-card" : ""}`}
            to={`/training/${d.id}`}
          >
            <div className="drill-top">
              <div className="icon-box">
                <CategoryIcon category={d.category} />
              </div>
              <span className="tag">{d.category}</span>
            </div>
            <h2>{d.name}</h2>
            <p className="muted">{d.description}</p>
            <span className="drill-level">
              {beginnerIds.includes(d.id)
                ? "Dobry pierwszy krok"
                : d.mixed
                  ? "Poznaj różne role"
                  : "Odkryj coś nowego"}
            </span>
            <div className="card-footer">
              <span>
                <Timer size={16} />
                {d.minutes} min ·{" "}
                {d.random
                  ? "Losowe odległości"
                  : `${d.distances[0]}–${d.distances.at(-1)} m`}
              </span>
              <span className="round-arrow">
                <ArrowUpRight size={21} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">
          <Search />
          <h2>Poszukamy czegoś innego?</h2>
          <p>Spróbuj innego słowa lub usuń filtry.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setFilter("Wszystkie");
              setBeginners(false);
              setGroup("Wszystkie");
            }}
          >
            Pokaż wszystkie ćwiczenia
          </button>
        </div>
      )}
    </>
  );
}
export function Detail() {
  const { id } = useParams();
  const d = drills.find((d) => d.id === id);
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const easy = new URLSearchParams(location.search).get("level") === "easy";
  const [difficulty, setDifficulty] = useState<Difficulty>(
    d?.test ? "średni" : easy ? "łatwy" : "średni",
  );
  const [distance, setDistance] = useState(easy ? 6 : 7);
  const [all, setAll] = useState(false);
  const [scenarioId, setScenarioId] = useState("all");
  const [targetSize, setTargetSize] = useState(
    d?.test ? (d.mode === "target" ? 100 : 50) : easy ? 100 : 50,
  );
  const boundary =
    d?.mode === "boundary"
      ? boundaryDistance
      : d?.test
        ? 40
        : difficulty === "łatwy"
          ? 60
          : difficulty === "średni"
            ? 40
            : 20;
  const [trackDirections, setTrackDirections] = useState(false);
  if (!d) return <Missing />;
  async function start() {
    if (!d) return;
    const s: Session = {
      id: crypto.randomUUID(),
      drillId: d.id,
      startedAt: new Date().toISOString(),
      difficulty,
      kind: d.test ? "test" : "training",
      benchmarkVersion: d.test ? 1 : undefined,
      plan: makePlan(d, distance, d.attempts, d.sequence ? false : all).map(
        (p) =>
          d.id === "situation" && scenarioId !== "all"
            ? { ...p, situationId: scenarioId }
            : p,
      ),
      results: [],
      score: 0,
      targetSize,
      boundary,
      trackDirections,
      ...(d.timed
        ? { timedPhase: 0, phaseStartedAt: new Date().toISOString() }
        : {}),
    };
    if (!(await save({ ...state, draft: s }))) return;
    navigate("/session");
  }
  return (
    <>
      <Back />
      <Heading eyebrow={d.category.toUpperCase()} title={d.name}>
        {d.description}
      </Heading>
      {d.test && (
        <p className="notice">
          TEST · ustalony plan 20 prób. Wynik pełnej serii porównamy z
          poprzednim testem. Nie można cofać rzutów.
        </p>
      )}
      <div className="detail-layout">
        <details
          className="card instructions"
          open={playerAudience(state) !== "athlete"}
        >
          <summary>Jak ćwiczyć?</summary>
          <p>{d.instructions}</p>
          <div className="cue">„{d.cue}”</div>
          <Routine />
          <details className="scoring-details">
            <summary>Jak liczymy punkty?</summary>
            <ul className="scoring">
              {choices[d.mode].map((c) => (
                <li key={c.label}>
                  <span>{c.label}</span>
                  <b>{c.points} pkt</b>
                </li>
              ))}
            </ul>
            <p className="muted small">
              Puenta: trafienie to kula do 60 cm. Strzał: trafienie to usunięcie
              celu lub carreau. Procent wyniku porównuje punkty z maksymalnym
              możliwym wynikiem.
            </p>
          </details>
        </details>
        <section className="card config">
          <h2>Ustawienia treningu</h2>
          {d.id === "situation" && (
            <label>
              Sytuacja meczowa
              <select
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
              >
                <option value="all">Zestaw sytuacji</option>
                {throwScenarios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="adventure-checkbox">
            <input
              type="checkbox"
              checked={trackDirections}
              onChange={(e) => setTrackDirections(e.target.checked)}
            />
            Zapisuj kierunki do mapy rzutów
          </label>
          <p className="muted small">
            Ustawienia już czekają. Możesz po prostu zacząć lub dopasować je do
            siebie.
          </p>
          <label>
            Poziom
            <select
              value={difficulty}
              disabled={d.test}
              onChange={(e) => {
                const v = e.target.value as Difficulty;
                setDifficulty(v);
                setDistance(v === "łatwy" ? 6 : v === "średni" ? 7 : 9);
                setTargetSize(v === "łatwy" ? 100 : v === "średni" ? 50 : 30);
              }}
            >
              {["łatwy", "średni", "trudny"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <p className="muted small">
            Poziom ustawia proponowaną odległość i wielkość celu. Możesz je
            zmienić.
          </p>
          {!d.random && !d.sequence && (
            <label>
              Odległość
              <select
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
              >
                {d.distances.map((x) => (
                  <option key={x} value={x}>
                    {x} m
                  </option>
                ))}
              </select>
            </label>
          )}
          {!d.random && !d.mixed && !d.sequence && (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={all}
                onChange={(e) => setAll(e.target.checked)}
              />{" "}
              Seria na wszystkich odległościach (
              {d.attempts * d.distances.length} rzutów)
            </label>
          )}
          {d.mode === "target" && (
            <label>
              Średnica celu
              <select
                value={targetSize}
                disabled={d.test}
                onChange={(e) => setTargetSize(Number(e.target.value))}
              >
                {[30, 50, 100].map((x) => (
                  <option key={x} value={x}>
                    {x} cm
                  </option>
                ))}
              </select>
            </label>
          )}
          {d.mode === "boundary" && (
            <p>Świnka zawsze {boundaryDistance} cm od linii.</p>
          )}
          {d.mode === "lob" && (
            <LobSetup
              distance={d.sequence?.[0] ?? (all ? d.distances[0] : distance)}
              obstacle={d.id === "lob-obstacle"}
              isTest={d.test}
            />
          )}
          {state.draft ? (
            <>
              <p className="notice">
                Masz rozpoczęty trening. Dokończ go lub zakończ, zanim zaczniesz
                kolejny.
              </p>
              <Link className="button" to="/session">
                Wróć do treningu <ArrowRight size={20} />
              </Link>
            </>
          ) : (
            <button
              className="button"
              disabled={busy}
              onClick={() => void start()}
            >
              Zaczynam <Play size={19} />
            </button>
          )}
        </section>
      </div>
      <ProgressionInfo
        distances={all || d.sequence ? d.distances : [distance]}
        drillId={d.id}
        isTest={d.test}
      />
    </>
  );
}
function DirectionSection({
  required,
  children,
}: {
  required: boolean;
  children: React.ReactNode;
}) {
  return required ? (
    <>{children}</>
  ) : (
    <details className="scoring-details">
      <summary>Dodaj kierunek błędu · opcjonalnie</summary>
      {children}
    </details>
  );
}
export function Active() {
  const { state, save, busy } = useApp();
  const s = state.draft;
  const navigate = useNavigate();
  const mountedSession = useRef<string | undefined>(undefined);
  useEffect(() => {
    mountedSession.current = s?.id;
    return () => {
      mountedSession.current = undefined;
    };
  }, [s?.id]);
  const isCurrentSession = () =>
    mountedSession.current === s?.id && window.location.pathname === "/session";
  const [landing, setLanding] = useState<boolean | null>(null);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [landingDirection, setLandingDirection] = useState<Direction | null>(
    null,
  );
  const [modeOverride, setModeOverride] = useState<Mode | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!s)
    return (
      <div className="empty">
        <Target />
        <h1>Wybierz swój trening</h1>
        <Link className="button" to="/training">
          Przejdź do ćwiczeń
        </Link>
      </div>
    );
  const d = drills.find((d) => d.id === s.drillId)!;
  const block = s.trainingPlan?.blocks[s.trainingPlan.index];
  if (block && block.kind !== "throws")
    return (
      <div className="active coach-guided">
        <p className="eyebrow">
          ETAP {s.trainingPlan!.index + 1} / {s.trainingPlan!.blocks.length}
        </p>
        <h1>{block.title}</h1>
        <p>
          {block.minutes} min · {block.instruction}
        </p>
        <Routine />
        <button
          className="button"
          disabled={busy}
          onClick={async () => {
            const final =
              s.trainingPlan!.index === s.trainingPlan!.blocks.length - 1;
            if (
              await save({
                ...state,
                draft: {
                  ...s,
                  mentalExerciseDone:
                    block.kind === "mental" || s.mentalExerciseDone,
                  trainingPlan: {
                    ...s.trainingPlan!,
                    index: final
                      ? s.trainingPlan!.index
                      : s.trainingPlan!.index + 1,
                  },
                },
              })
            ) {
              if (final && isCurrentSession()) navigate("/summary");
            }
          }}
        >
          {block.kind === "mental"
            ? s.trainingPlan!.index === s.trainingPlan!.blocks.length - 1
              ? "Zaliczone · podsumuj trening"
              : "Rutyna gotowa · przejdź dalej"
            : "Gotowe · przejdź do rzutów"}
        </button>
        <Link className="secondary" to="/">
          Przerwa · wróć do Dzisiaj
        </Link>
      </div>
    );
  const phase = s.timedPhase ?? 0;
  const timedNames = ["Rozgrzewka", "Puenta", "Strzał", "Ćwiczenie mentalne"];
  const duration = [5, 10, 10, 5][phase] * 60;
  const left = Math.max(
    0,
    duration -
      Math.floor(
        (tick - new Date(s.phaseStartedAt ?? s.startedAt).getTime()) / 1000,
      ),
  );
  const item = d.timed
    ? {
        distance: s.plan[0].distance,
        mode: (phase === 2 ? "shoot" : "point") as Mode,
      }
    : s.plan[s.results.length];
  if (!d.timed && !item) {
    return (
      <div className="empty">
        <Check />
        <h1>Wszystkie rzuty zapisane</h1>
        <Link className="button" to="/summary">
          Zobacz podsumowanie
        </Link>
      </div>
    );
  }
  const situation = d.id === "situation" || item?.phase === "Gra sytuacyjna";
  const scenario = scenarioForThrow(s, s.results.length);
  const middle = item?.role === "MIDDLE";
  const decision =
    s.situationChoice?.index === s.results.length
      ? s.situationChoice.title
      : "";
  const mode =
    (situation ? s.situationChoice?.mode : undefined) ??
    modeOverride ??
    item?.mode ??
    "point";
  const ready =
    (!situation || !!decision) &&
    (!middle || !!modeOverride) &&
    (mode !== "lob" || landing !== null) &&
    (!s.trackDirections ||
      (direction !== null && (mode !== "lob" || landingDirection !== null)));
  async function record(index: number) {
    if (!item) return;
    const c = choices[mode][index];
    const a = {
      ...item,
      mode,
      id: crypto.randomUUID(),
      result: c.label,
      points: c.points,
      hit: c.hit,
      carreau: !!c.carreau,
      outside: !!c.outside,
      ...(mode === "lob" ? { landingHit: landing! } : {}),
      ...(decision ? { decision } : {}),
      ...(direction !== null ? { missDirection: direction } : {}),
      ...(mode === "lob" && landingDirection !== null
        ? { landingDirection }
        : {}),
    };
    const next = {
      ...s!,
      situationChoice: undefined,
      results: [...s!.results, a],
      score: s!.score + c.points,
      ...(block &&
      nextBlockReached() &&
      s!.trainingPlan!.index < s!.trainingPlan!.blocks.length - 1
        ? {
            trainingPlan: {
              ...s!.trainingPlan!,
              index: s!.trainingPlan!.index + 1,
            },
          }
        : {}),
    };
    function nextBlockReached() {
      return s!.results.length + 1 >= block!.end;
    }
    if (!(await save({ ...state, draft: next })) || !isCurrentSession()) return;
    setLanding(null);
    setDirection(null);
    setLandingDirection(null);
    setModeOverride(null);
    if (
      !d.timed &&
      (!s!.trainingPlan ||
        s!.trainingPlan.index === s!.trainingPlan.blocks.length - 1) &&
      next.results.length === next.plan.length
    )
      navigate("/summary");
  }
  async function nextPhase() {
    if (
      !(await save({
        ...state,
        draft: {
          ...s!,
          timedPhase: phase + 1,
          phaseStartedAt: new Date().toISOString(),
        },
      })) ||
      !isCurrentSession()
    )
      return;
    setModeOverride(null);
  }
  return (
    <div className="active-training">
      <div className="session-top">
        <span>{s.missionTitle ?? d.name}</span>
        <button
          aria-label="Zakończ trening"
          className="icon-button"
          onClick={() => setConfirm(true)}
        >
          <X />
        </button>
      </div>
      {block && (
        <p className="notice">
          {block.title} · {block.minutes} min · {block.instruction}
        </p>
      )}
      {s.challenge && (
        <p className="notice">
          {s.challenge.kind === "boss" ? "SPRAWDZIAN" : "WYZWANIE"} · jedna
          próba, bez cofania
          {s.challenge.kind === "pressure"
            ? ` · seria ${Math.min(3, 1 + Math.floor(s.results.length / 3))}/3 · cel 2/3`
            : ""}
        </p>
      )}
      {s.mastery && (
        <p className="notice">
          {s.mastery.tier === "mastery" ? "MASTERY" : "LEGENDARY"} · cel 8/10 ·
          jedna próba, bez cofania
          {d.mode === "lob" ? " · liczy się lądowanie" : ""}
        </p>
      )}
      {s.kind === "test" && (
        <p className="notice">TEST · jedna próba na ustawienie · bez cofania</p>
      )}
      {confirm && (
        <div className="notice">
          <p>Możesz zapisać dotychczasowe rzuty lub wrócić do ćwiczenia.</p>
          {s.results.length > 0 ? (
            <Link className="button" to="/summary">
              Podsumuj trening
            </Link>
          ) : (
            <button
              className="button"
              disabled={busy}
              onClick={async () => {
                if (!(await save({ ...state, draft: null }))) return;
                if (isCurrentSession())
                  navigate(s.missionId ? "/adventure/missions" : "/training");
              }}
            >
              Zakończ bez wyniku
            </button>
          )}
          <button className="secondary" onClick={() => setConfirm(false)}>
            Ćwiczę dalej
          </button>
        </div>
      )}
      {d.timed && (
        <div className="timer">
          <p className="eyebrow">
            ETAP {phase + 1} / 4 · {timedNames[phase]}
          </p>
          <strong>
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </strong>
          <p className="muted">
            {phase === 0
              ? "Poruszaj ramionami i wykonaj kilka swobodnych rzutów."
              : phase === 3
                ? "Ćwicz wydech i cztery kroki rutyny. Po każdym wyobrażonym błędzie zanotuj fakt i ustal kolejne zadanie."
                : "Zapisuj rzuty w swoim tempie."}
          </p>
          {phase < 3 ? (
            <button
              className="secondary"
              disabled={busy}
              onClick={() => void nextPhase()}
            >
              {left ? "Zakończ etap wcześniej" : "Następny etap"}
            </button>
          ) : (
            <button
              className="button"
              disabled={busy || s.results.length === 0}
              onClick={async () => {
                if (
                  !(await save({
                    ...state,
                    draft: { ...s, mentalExerciseDone: true },
                  }))
                )
                  return;
                if (isCurrentSession()) navigate("/summary");
              }}
            >
              Zaliczone · podsumuj trening
            </button>
          )}
        </div>
      )}
      {(!d.timed || phase === 1 || phase === 2) && (
        <>
          <div className="session-progress">
            <span>
              Rzut {s.results.length + 1}
              {!d.timed && ` / ${s.plan.length}`}
            </span>
            <b>{s.score} pkt</b>
          </div>
          {!d.timed && (
            <progress
              aria-label="Postęp treningu"
              value={s.results.length}
              max={s.plan.length}
            />
          )}
          {item.phase && (
            <p className="eyebrow">
              {item.phase} {item.role && `· ${item.role}`}
            </p>
          )}
          <div className="distance">
            <span>Odległość</span>
            <strong>
              {item.distance}
              <small> m</small>
            </strong>
          </div>
          <div className="cue">
            „
            {technicalMentalCue(
              mode,
              s.results.at(-1),
              !!d.pressure ||
                s.challenge?.kind === "pressure" ||
                block?.title.includes("Presja"),
            )}
            ”
          </div>
          {s.results.length > 0 && (
            <p className="muted">
              Następny plan: {technicalMentalCue(mode, undefined, !!d.pressure)}
            </p>
          )}
          {mentalCueText(s.mentalCueLessonId) && (
            <p className="notice" aria-label="Twoja wskazówka mentalna">
              Twój fokus: „{mentalCueText(s.mentalCueLessonId)}”
              <br />
              {lessons.find((l) => l.id === s.mentalCueLessonId)?.exercise}
            </p>
          )}
          {d.mode === "boundary" && <p>Świnka {s.boundary} cm od linii.</p>}
          {d.mode === "target" && (
            <p>Cel: koło o średnicy {s.targetSize} cm.</p>
          )}
          {mode === "lob" && !situation && (
            <LobSetup
              distance={item.distance}
              obstacle={d.id === "lob-obstacle"}
              isTest={s.kind === "test"}
            />
          )}
          {situation && (
            <fieldset>
              <legend>{scenario?.title}. Co robisz?</legend>
              <p>{scenario?.description}</p>
              <p className="muted">
                Ustaw układ na boisku. Wybierz decyzję, wykonaj rzut, potem
                zaznacz wynik.
              </p>
              {(scenario?.options ?? []).map(({ title: text, mode: m }) => (
                <button
                  className={`secondary ${decision === text ? "selected" : ""}`}
                  key={text}
                  disabled={busy}
                  aria-pressed={decision === text}
                  onClick={() =>
                    void save({
                      ...state,
                      draft: {
                        ...s,
                        situationChoice: {
                          index: s.results.length,
                          title: text,
                          mode: m,
                        },
                      },
                    })
                  }
                >
                  {text}
                </button>
              ))}
            </fieldset>
          )}
          {middle && !situation && (
            <fieldset>
              <legend>MIDDLE — wybierz swoje zadanie</legend>
              {(["point", "shoot"] as Mode[]).map((m) => (
                <button
                  className={`secondary ${modeOverride === m ? "selected" : ""}`}
                  key={m}
                  onClick={() => setModeOverride(m)}
                >
                  {m === "point" ? "Puenta" : "Strzał"}
                </button>
              ))}
            </fieldset>
          )}
          {mode === "lob" && (
            <fieldset>
              <legend>Czy kula wylądowała w kole 50 cm?</legend>
              <p className="muted small">
                Oceń pierwszy kontakt z ziemią w zaznaczonym polu o średnicy 50
                cm. Końcową pozycję względem świnki zapiszesz poniżej.
              </p>
              <div className="two-col">
                <button
                  className={`secondary ${landing === true ? "selected" : ""}`}
                  onClick={() => setLanding(true)}
                >
                  Tak, w kole
                </button>
                <button
                  className={`secondary ${landing === false ? "selected" : ""}`}
                  onClick={() => setLanding(false)}
                >
                  Poza kołem
                </button>
              </div>
            </fieldset>
          )}
          {(s.trackDirections || s.kind !== "test") && (
            <DirectionSection required={!!s.trackDirections}>
              {mode === "lob" && (
                <DirectionPicker
                  disabled={busy}
                  value={landingDirection}
                  onChange={setLandingDirection}
                  label="Kierunek pierwszego lądowania"
                />
              )}
              <DirectionPicker
                disabled={busy}
                value={direction}
                onChange={setDirection}
                label={
                  mode === "lob"
                    ? "Kierunek końcowej pozycji"
                    : s.trackDirections
                      ? "Kierunek rzutu"
                      : "Kierunek rzutu · opcjonalnie"
                }
              />
              {direction === null && (
                <p className="muted small">
                  {s.trackDirections
                    ? "Najpierw zaznacz kierunek, potem wybierz wynik."
                    : "Możesz pominąć kierunek i od razu zapisać wynik."}
                </p>
              )}
            </DirectionSection>
          )}
          <p className="save-status" role="status">
            {busy
              ? "Zapisywanie…"
              : `Zapisano ${s.results.length} rzutów na urządzeniu`}
          </p>
          <h2 className="result-title">
            {mode === "lob" ? "Gdzie zatrzymała się kula?" : "Jak poszło?"}
          </h2>
          <div className="result-grid">
            {choices[mode].map((c, i) => (
              <button
                key={c.label}
                disabled={busy || !ready}
                onClick={() => void record(i)}
                className={`result-button ${i === 0 ? "best" : ""}`}
              >
                <span>{c.label}</span>
                <b>
                  +{c.points}
                  <small> pkt</small>
                </b>
              </button>
            ))}
          </div>
          <Routine />
          {s.results.at(-1)?.decision && (
            <DecisionAssessment session={s} index={s.results.length - 1} />
          )}
          {canUndoLastThrow(s) && (
            <button
              className="undo"
              disabled={busy}
              onClick={async () => {
                if (
                  !(await save({ ...state, draft: undoLastThrow(s) })) ||
                  !isCurrentSession()
                )
                  return;
                setLanding(null);
                setDirection(null);
                setLandingDirection(null);
                setModeOverride(null);
              }}
            >
              <RotateCcw size={16} /> Cofnij ostatni rzut
            </button>
          )}
        </>
      )}
      <ProgressionInfo session={s} />
    </div>
  );
}
function DecisionAssessment({
  session,
  index,
}: {
  session: Session;
  index: number;
}) {
  const { state, save, busy } = useApp();
  const current =
    state.draft?.id === session.id
      ? state.draft
      : (state.sessions.find((s) => s.id === session.id) ?? session);
  const attempt = current.results[index];
  return (
    <label className="decision-assessment">
      Rzut {index + 1}: {attempt.decision} · ocena decyzji (opcjonalnie)
      <select
        disabled={busy}
        value={attempt.decisionReview ?? ""}
        onChange={async (e) => {
          const next = reviewDecision(
            current,
            index,
            (e.target.value || undefined) as DecisionReview | undefined,
          );
          await save(
            state.draft?.id === current.id
              ? { ...state, draft: next }
              : {
                  ...state,
                  sessions: state.sessions.map((s) =>
                    s.id === current.id ? next : s,
                  ),
                },
          );
        }}
      >
        <option value="">Bez oceny</option>
        {decisionReviews.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
    </label>
  );
}
function Result({
  session,
  readonly = false,
}: {
  session: Session;
  readonly?: boolean;
}) {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const mountedSession = useRef<string | undefined>(undefined);
  useEffect(() => {
    mountedSession.current = session.id;
    return () => {
      mountedSession.current = undefined;
    };
  }, [session.id]);
  const isCurrentSession = () =>
    mountedSession.current === session.id &&
    window.location.pathname === "/summary";
  const [stress, setStress] = useState(session.stressLevel ?? "normalnie");
  const [routine, setRoutine] = useState<boolean | undefined>(
    session.routineUsed,
  );
  const [recovery, setRecovery] = useState(session.recovery ?? "czasami");
  const [lessonReflection, setLessonReflection] = useState<
    Session["lessonReflection"]
  >(session.lessonReflection);
  const sum = summarize(session);
  const d = drills.find((d) => d.id === session.drillId)!;
  async function finish() {
    const complete = {
      ...session,
      situationChoice: undefined,
      completedAt: new Date().toISOString(),
      stressLevel: stress,
      lessonReflection: lessonReflection || undefined,
      routineUsed: routine,
      recovery,
    };
    if (
      !(await save({
        ...state,
        sessions: [
          ...state.sessions.filter((s) => s.id !== session.id),
          complete,
        ],
        adventure:
          session.missionId &&
          complete.results.length === complete.plan.length &&
          complete.plan.length > 0
            ? {
                ...state.adventure,
                missionCompletions: {
                  ...state.adventure?.missionCompletions,
                  [session.missionId]: state.adventure?.missionCompletions?.[
                    session.missionId
                  ] ?? {
                    sessionId: session.id,
                    completedAt: complete.completedAt,
                  },
                },
              }
            : state.adventure,
        draft: null,
      }))
    )
      return;
    if (isCurrentSession())
      navigate(`/history/${session.id}`, { replace: true });
  }
  return (
    <>
      <Back to="/history" />
      <Heading
        eyebrow={
          readonly
            ? session.kind === "test"
              ? "ZAPISANY TEST"
              : "ZAPISANY TRENING"
            : "DOBRA ROBOTA"
        }
        title={readonly ? d.name : "Kolejny krok za Tobą."}
      >
        {readonly ? date(session.completedAt!) : d.name}
      </Heading>
      {session.missionId && (
        <section className="mission-passport">
          <Flag size={24} />
          <div>
            <b>
              {readonly && missionCompleted(state, session.missionId)
                ? "Misja zaliczona!"
                : session.results.length === session.plan.length
                  ? "Pełna seria gotowa do zaliczenia"
                  : "Niepełna seria — misja pozostaje otwarta"}
            </b>
            <p>
              {readonly
                ? "Zobacz, co odblokowałeś na swojej ścieżce."
                : "Zapisz wynik poniżej. Tylko pełna, zapisana seria zalicza misję."}
            </p>
            <Link className="secondary" to="/adventure/missions">
              Moja ścieżka
            </Link>
          </div>
        </section>
      )}
      {readonly && session.trackDirections && (
        <Link className="secondary" to="/adventure/map">
          Zobacz mapę tego treningu i innych serii
        </Link>
      )}
      <TrainingSummary session={session} />
      {session.results.some((a) => a.decision) && (
        <section className="card">
          <h2>Ocena decyzji po wykonaniu</h2>
          <p>
            Oceń plan niezależnie od celności rzutu. To Twoja obserwacja, bez
            automatycznej oceny taktyki.
          </p>
          {session.results.map(
            (a, i) =>
              a.decision && (
                <DecisionAssessment key={a.id} session={session} index={i} />
              ),
          )}
        </section>
      )}
      {session.challenge && (
        <section className="notice">
          <h2>
            {session.challenge.kind === "daily"
              ? "Kula dnia"
              : session.challenge.kind === "boss"
                ? "Sprawdzian rozdziału"
                : "Wyzwanie własne"}
            :{" "}
            {challengePassed({
              ...session,
              completedAt: session.completedAt ?? new Date().toISOString(),
            })
              ? "cel osiągnięty!"
              : "kolejny krok"}
          </h2>
          <p>
            {session.challenge.kind === "pressure"
              ? "Cel: 2/3 w każdej z trzech serii."
              : `Cel: ${session.challenge.kind === "boss" ? 6 : session.challenge.kind === "ladder" ? 7 : 1}/${session.plan.length}.`}{" "}
            W lobie liczy się pierwsze lądowanie.{" "}
            {readonly ? "Wynik zapisany." : "Zapisz wynik, aby utrwalić próbę."}
          </p>
          <Link
            className="secondary"
            to={
              session.challenge.kind === "boss"
                ? "/coach/boss"
                : "/coach/extras"
            }
          >
            Wróć do wyzwań
          </Link>
        </section>
      )}
      {session.mastery && (
        <section className="notice">
          <h2>
            {session.results.length === 10 && masteryHits(session) >= 8
              ? "Próba mistrzowska zaliczona!"
              : "Próba mistrzowska — kolejny krok"}
          </h2>
          <p>
            {masteryHits(session)}/10{" "}
            {d.mode === "lob" ? "trafień w lądowanie" : "trafień"} · cel 8/10 ·{" "}
            {session.mastery.tier === "mastery" ? "Mastery" : "Legendary"}.{" "}
            {session.results.length !== 10
              ? "Niepełna seria nie odblokowuje oznaczenia."
              : readonly
                ? "Wynik zapisany."
                : "Zapisz wynik, aby utrwalić zaliczenie."}
          </p>
        </section>
      )}
      <details className="product-details">
        <summary>Zobacz szczegóły</summary>
        {session.kind !== "test" && <ResultInsights session={session} />}
        {d.mode === "lob" && (
          <p className="notice">Trafienie w strefę lądowania: {sum.landing}%</p>
        )}
        <div className="card">
          <h2>Odległości</h2>
          {sum.byDistance.map((r) => (
            <div className="stat-row" key={r.distance}>
              <b>{r.distance} m</b>
              <div className="bar">
                <span style={{ width: `${r.score}%` }} />
              </div>
              <span>{r.score}% pkt</span>
            </div>
          ))}
          <p className="muted small">
            {sum.byDistance.length > 1 &&
            new Set(sum.byDistance.map((r) => r.score)).size === 1 ? (
              "Równy wynik punktowy na wszystkich dystansach."
            ) : (
              <>
                Najlepsza: {sum.best?.distance ?? "—"} m · Do ćwiczenia:{" "}
                {sum.weakest?.distance ?? "—"} m.
              </>
            )}{" "}
            Porównanie według procentu punktów.
          </p>
        </div>
        {d.pressure && (
          <div className="notice">
            <h3>
              {sum.hits >= (d.requiredHits ?? 3)
                ? "Wyzwanie zaliczone!"
                : "Jeszcze jedna szansa"}
            </h3>
            <p>
              {sum.hits} / {d.requiredHits ?? 3} wymaganych trafień.
            </p>
            {readonly && (
              <Link className="secondary" to={`/training/${d.id}`}>
                Powtórz serię
              </Link>
            )}
          </div>
        )}
      </details>
      <FieldReflection
        session={session}
        value={lessonReflection}
        onChange={setLessonReflection}
        readonly={readonly}
      />
      {readonly ? (
        <>
          <details className="card">
            <summary>Twoja głowa podczas treningu</summary>
            <p>Samopoczucie: {session.stressLevel}</p>
            <p>
              Rutyna:{" "}
              {session.routineUsed === undefined
                ? "brak odpowiedzi"
                : session.routineUsed
                  ? "tak"
                  : "nie"}
            </p>
            <p>Powrót po błędzie: {session.recovery}</p>
            {session.mentalExerciseDone && <p>Ćwiczenie mentalne: zaliczone</p>}
          </details>
          <details className="card">
            <summary>Wszystkie rzuty ({session.results.length})</summary>
            <ol className="attempts">
              {session.results.map((a) => (
                <li key={a.id}>
                  {a.distance} m · {a.result} · {a.points} pkt
                  {a.decision && ` · ${a.decision}`}
                  {a.situationId &&
                    ` · ${throwScenarios.find((c) => c.id === a.situationId)?.title}`}
                  {a.decisionReview && ` · ocena: ${a.decisionReview}`}
                  {a.mode === "lob" &&
                    ` · lądowanie: ${a.landingHit ? "w kole" : "poza kołem"}`}
                </li>
              ))}
            </ol>
          </details>
          <Link className="button" to="/">
            Zakończ <ArrowRight size={20} />
          </Link>
        </>
      ) : (
        <section className="card config">
          {session.results.length < session.plan.length || d.timed ? (
            <Link className="secondary" to="/session">
              Wróć do treningu
            </Link>
          ) : (
            canUndoLastThrow(session) && (
              <button
                className="secondary"
                disabled={busy}
                onClick={async () => {
                  if (
                    !(await save({
                      ...state,
                      draft: undoLastThrow(session),
                    })) ||
                    !isCurrentSession()
                  )
                    return;
                  navigate("/session");
                }}
              >
                <RotateCcw size={16} /> Popraw ostatni rzut
              </button>
            )
          )}
          <h2>Jak czułeś się podczas treningu?</h2>
          <div className="filters">
            {[
              "spokojnie",
              "normalnie",
              "zestresowany",
              "bardzo zestresowany",
            ].map((x) => (
              <button
                key={x}
                className={stress === x ? "selected" : ""}
                onClick={() => setStress(x)}
              >
                {x}
              </button>
            ))}
          </div>
          <label>
            Po błędzie wracałem do następnej kuli
            <select
              value={recovery}
              onChange={(e) => setRecovery(e.target.value)}
            >
              {["tak", "czasami", "nie"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <p id="routine-help">
            Rutyna to wybór celu, spokojny wydech, rzut i reset: po wyniku
            nazwij jeden fakt i przygotuj następną kulę. Zaznacz poniżej, jeśli
            świadomie stosowałeś te kroki. Brak zaznaczenia nie zmienia punktów.
          </p>
          <label className="checkbox">
            <input
              type="checkbox"
              aria-describedby="routine-help"
              checked={routine ?? false}
              onChange={(e) => setRoutine(e.target.checked)}
            />{" "}
            Używałem rutyny Plan · Oddech · Wykonanie · Reset
          </label>
          <button
            className="button"
            disabled={busy}
            onClick={() => void finish()}
          >
            Zapisz wynik <Check size={20} />
          </button>
        </section>
      )}
      <ProgressionInfo session={session} />
    </>
  );
}
export function Summary() {
  const { state } = useApp();
  return state.draft && state.draft.results.length ? (
    <Result session={state.draft} />
  ) : (
    <Missing />
  );
}
export function HistoryPage() {
  const { state } = useApp();
  const sessions = historySessions(state);
  return (
    <>
      <Heading eyebrow="KAŻDY TRENING SIĘ LICZY" title="Historia treningów">
        Twoje wyniki zapisane na tym urządzeniu.
      </Heading>
      {sessions.length === 0 ? (
        <div className="empty">
          <History />
          <h2>Tu zaczyna się Twoja historia</h2>
          <p>Zrób pierwszy trening i zapisz wynik.</p>
          <Link className="button" to="/training">
            Wybierz trening
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {sessions.map((s) => {
            const outcome = sessionOutcome(s);
            const baseline = comparableBaseline(s, sessions);
            const delta = baseline === null ? null : outcome.rate - baseline;
            return (
              <Link
                key={s.id}
                className="card history-item"
                to={`/history/${s.id}`}
              >
                <div className="icon-box">
                  <CategoryIcon
                    category={drills.find((d) => d.id === s.drillId)!.category}
                  />
                </div>
                <div>
                  <h3>{drills.find((d) => d.id === s.drillId)!.name}</h3>
                  <p className="muted">
                    {date(s.completedAt!)} · {outcome.distances} ·{" "}
                    {s.kind === "test" ? "TEST" : "TRENING"}
                  </p>
                  <p>
                    {outcome.hits}/{s.results.length} {outcome.metric} ·{" "}
                    {outcome.rate}% skuteczności
                  </p>
                  {delta !== null && (
                    <p className="muted small">
                      {delta > 0 ? "+" : ""}
                      {delta} pp względem wcześniejszych porównywalnych sesji (
                      {baseline}%).
                    </p>
                  )}
                </div>
                <b>{s.score} pkt</b>
                <ChevronRight size={20} />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
export function HistoryDetail() {
  const { id } = useParams();
  const { state } = useApp();
  const s = state.sessions.find((s) => s.id === id);
  return s ? <Result session={s} readonly /> : <Missing />;
}
export function LessonDetail() {
  const { id } = useParams();
  const l = lessons.find((l) => l.id === id);
  const { state, save, busy } = useApp();
  if (!l) return <Missing />;
  const done = state.lessons.includes(l.id);
  return (
    <div className="lesson-detail">
      <Back to="/lessons" />
      <Heading
        eyebrow={`${mentalCompetencies.find((c) => c.id === l.competency)?.name} · ${mentalLevels.find((level) => level.id === l.level)?.name} · 2 MINUTY`}
        title={l.title}
      >
        {l.description}
      </Heading>
      <div className="cue big">„{l.matchCue ?? l.phrase}”</div>
      {[
        ["Jedna zasada", l.rule],
        ["Na boisku", l.example],
      ].map(([title, text], i) => (
        <section className="card" key={title}>
          <p className="eyebrow">0{i + 1}</p>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
      <details className="card">
        <summary>Procedura krok po kroku</summary>
        <ol>
          {l.procedure?.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </details>
      <FieldTaskAction lessonId={l.id} />
      {id === "routine" && <Routine />}
      <button
        className="button"
        disabled={done || busy}
        onClick={() =>
          void save({ ...state, lessons: [...state.lessons, l.id] })
        }
      >
        {done ? "Zaliczone" : "Zaliczone · zapamiętuję"} <Check size={20} />
      </button>
      {done && (
        <>
          <Link className="button" to="/lessons">
            Wróć do listy lekcji <ChevronLeft size={20} />
          </Link>
          <p className="muted" role="status">
            Lekcja zaliczona. Możesz na tym zakończyć — ćwiczenie mentalne jest
            opcjonalne.
          </p>
        </>
      )}
      <Link className="secondary" to={`/coach/practice/mental?lesson=${l.id}`}>
        Wykonaj ćwiczenie mentalne
      </Link>
    </div>
  );
}
function Metric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="card metric">
      <strong>
        {value}
        <small>{suffix}</small>
      </strong>
      <span>{label}</span>
    </div>
  );
}
export function ProgressPage() {
  const { state } = useApp();
  const st = stats(state);
  const results = progressResults(state);
  const evidence = dashboardEvidence(state);
  const next = recommendation(state);
  return (
    <>
      <Heading eyebrow="TWÓJ WŁASNY RYTM" title="Twój postęp">
        Sprawdź, co zmienia się w Twoich wynikach i co trenować dalej.
      </Heading>
      {st.count ? (
        <>
          <section className="card">
            <h2>Czy robię postęp?</h2>
            <p>{progressEvidence(state)}</p>
            {evidence.strongest && (
              <p>
                <b>Mocniejszy obszar:</b> {modeNames[evidence.strongest.mode]}{" "}
                {evidence.strongest.distance} m · {evidence.strongest.rate}% ·{" "}
                {evidence.strongest.count} prób.
              </p>
            )}
            {evidence.weakest && (
              <p>
                <b>Do poprawy:</b> {modeNames[evidence.weakest.mode]}{" "}
                {evidence.weakest.distance} m · {evidence.weakest.rate}% ·{" "}
                {evidence.weakest.count} prób.
              </p>
            )}
          </section>
          <section className="card">
            <h2>Następny trening</h2>
            <p>
              <b>
                {modeNames[next.mode]} {next.distance} m.
              </b>{" "}
              {next.reason}
            </p>
            <Link className="button" to="/">
              {state.draft
                ? "Wróć do rozpoczętego treningu"
                : "Przejdź do treningu na dziś"}
              <ArrowRight size={20} />
            </Link>
          </section>
        </>
      ) : (
        <section className="card">
          <h2>Zacznij od pierwszego treningu</h2>
          <p>
            Zapisz pierwszą serię, aby zobaczyć swoją skuteczność. Do oceny
            wariantu potrzebujemy 20 prób z co najmniej 2 sesji w tych samych
            warunkach.
          </p>
          <Link className="button" to="/">
            {state.draft
              ? "Dokończ rozpoczęty trening"
              : "Przejdź do treningu na dziś"}
            <ArrowRight size={20} />
          </Link>
        </section>
      )}
      <p className="notice">
        Statystyki poniżej dotyczą zwykłych treningów. Testy i próby
        mistrzowskie porównujesz osobno w historii i podsumowaniu testu.
      </p>
      <Link className="secondary" to="/training?group=Testy">
        Testy kontrolne
      </Link>
      <div className="metric-grid">
        <Metric label="Treningów" value={st.count} />
        <Metric
          label="Tygodni regularności"
          value={weeklyProgress(state).streak}
        />
        {[
          { label: "Celność puenty", value: st.point, count: st.pointAttempts },
          {
            label: "Celność strzału",
            value: st.shoot,
            count: st.shootAttempts,
          },
          {
            label: "Carreaux / strzały",
            value: st.carreau,
            count: st.shootAttempts,
          },
        ].map((metric) =>
          metric.count ? (
            <Metric
              key={metric.label}
              label={metric.label}
              value={metric.value}
              suffix="%"
            />
          ) : (
            <div className="card metric" key={metric.label}>
              <strong aria-label="Brak prób">—</strong>
              <span>{metric.label}</span>
              <span>Brak prób</span>
            </div>
          ),
        )}
        <Metric
          label="Lekcje mentalne"
          value={completedMentalLessons(state.lessons)}
          suffix={` / ${lessons.length}`}
        />
      </div>
      {results.areas.length > 0 && (
        <section className="card">
          <h2>Skuteczność według rzutu i dystansu</h2>
          <p className="muted small">
            Trafienia / próby. Puenta do 60 cm, strzał z usunięciem celu,
            precyzja w kole, lob: pierwsze lądowanie. To łączne wyniki danego
            rodzaju rzutu; ocenę zmiany powyżej liczymy tylko dla porównywalnych
            sesji.
          </p>
          {[...new Set(results.areas.map((area) => area.mode))].map((mode) => (
            <div key={mode}>
              <h3>{modeNames[mode]}</h3>
              {results.areas
                .filter((area) => area.mode === mode)
                .map((area) => (
                  <div className="stat-row" key={area.key}>
                    <b>{area.distance} m</b>
                    <div className="bar">
                      <span style={{ width: `${area.rate}%` }} />
                    </div>
                    <span>
                      {area.rate}% · {area.hits}/{area.count} prób
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </section>
      )}
      {results.recent.length > 0 && (
        <section className="card">
          <h2>Ostatnie wyniki</h2>
          <div className="recent-chart">
            {results.recent.map((s) => {
              const outcome = sessionOutcome(s);
              return (
                <Link
                  to={`/history/${s.id}`}
                  key={s.id}
                  aria-label={`${drills.find((d) => d.id === s.drillId)!.name}, ${outcome.distances}: ${outcome.hits}/${s.results.length} ${outcome.metric}, ${outcome.rate}% skuteczności`}
                >
                  <b>{outcome.rate}%</b>
                  <div className="chart-column">
                    <span
                      style={{
                        height: `${Math.max(3, outcome.rate)}%`,
                      }}
                    />
                  </div>
                  <small>
                    {new Date(s.completedAt!).toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "numeric",
                    })}
                  </small>
                </Link>
              );
            })}
          </div>
          <p className="muted small">
            Skuteczność z ostatnich 7 treningów. Lob: pierwsze lądowanie. Różne
            ćwiczenia i warunki nie tworzą wspólnego trendu.
          </p>
        </section>
      )}
      <section className="card">
        <h2>Spokojna głowa</h2>
        {st.routine === null ? (
          <p>Brak odpowiedzi o rutynie. Możesz dodać samoocenę po treningu.</p>
        ) : (
          <>
            <p>
              Rutyna w {st.routine}% treningów
              {st.routineResponses < st.count ? " z samooceną" : ""}.
            </p>
            <p className="muted small">
              {st.routineUsed}/{st.routineResponses} odpowiedzi: używałem
              rutyny.
              {st.routineResponses < st.count &&
                ` Brak odpowiedzi w ${st.count - st.routineResponses} treningach.`}
            </p>
          </>
        )}
        <p>Ukończone moduły mentalne: {st.mentalModules}.</p>
        <p>Rutyna/reset w treningu: {st.mental}.</p>
        <Link className="text-link" to="/lessons">
          Przejdź do lekcji <ArrowRight size={16} />
        </Link>
      </section>
      <Link className="secondary" to="/coach/development">
        Skill Tree i mój rozwój
      </Link>
      <div className="section-title">
        <h2>Osiągnięcia treningowe</h2>
      </div>
      <div className="achievement-grid">
        {achievements(state).map((a) => (
          <div
            className={`achievement ${a.unlocked ? "unlocked" : ""}`}
            key={a.name}
          >
            <Trophy size={22} />
            <span>{a.name}</span>
            {a.unlocked && <Check size={17} />}
          </div>
        ))}
      </div>
      <Link className="secondary" to="/history">
        Zobacz historię treningów
      </Link>
    </>
  );
}
export function Profile() {
  const { state, save, busy } = useApp();
  const [name, setName] = useState(state.player?.name ?? "");
  const [age, setAge] = useState(state.player?.age?.toString() ?? "");
  const [group, setGroup] = useState(
    state.player?.audience === "junior" ? "junior" : "adult",
  );
  const [role, setRole] = useState(
    state.player?.preferredRole ?? "wszechstronny",
  );
  const [hand, setHand] = useState(state.player?.preferredHand ?? "prawa");
  const [level, setLevel] = useState<NonNullable<State["player"]>["level"]>(
    state.player?.level ??
      (state.player?.audience === "athlete" ? "advanced" : "beginner"),
  );
  const [style, setStyle] = useState<PlayingStyle | "">(
    state.player?.playingStyle ?? "",
  );
  const [goal, setGoal] = useState<TrainingGoal | "">(
    state.player?.trainingGoal ?? "",
  );
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Back to="/more" />
      <Heading eyebrow="BEZ KONTA. PO SWOJEMU." title="Twój profil">
        Wybierz, jak dziś grasz i nad czym chcesz pracować. Cel pomaga zacząć;
        kolejne propozycje uwzględniają Twoje wyniki. Każde ćwiczenie pozostaje
        dostępne.
      </Heading>
      <form
        className="card config profile-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            !(await save({
              ...state,
              player: {
                playingStyle: style || undefined,
                trainingGoal: goal || undefined,
                id: state.player?.id ?? crypto.randomUUID(),
                name: name.trim(),
                ...(age ? { age: Number(age) } : {}),
                preferredRole: role,
                preferredHand: hand,
                level,
                audience:
                  group === "junior"
                    ? "junior"
                    : level === "beginner" || level === "intermediate"
                      ? "beginner"
                      : "athlete",
                createdAt: state.player?.createdAt ?? new Date().toISOString(),
              },
            }))
          )
            return;
          setSaved(true);
        }}
      >
        <IntentFields
          style={style}
          goal={goal}
          onStyle={setStyle}
          onGoal={setGoal}
        />
        <p className="muted small">
          Grupa i poziom to osobne informacje: junior też może grać na poziomie
          mistrzowskim. Poziom określasz samodzielnie; pomaga dobrać punkt
          wyjścia i nie jest oceną rankingową.
        </p>
        <label>
          Jak masz na imię?
          <input
            required
            maxLength={40}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </label>
        <label>
          Grupa zawodnika
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="adult">Dorosły</option>
            <option value="junior">Junior</option>
          </select>
        </label>
        <label>
          Wiek (opcjonalnie)
          <input
            type="number"
            min={5}
            max={110}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </label>
        <label>
          Poziom gry
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
          >
            <option value="beginner">Początkujący</option>
            <option value="intermediate">Średniozaawansowany</option>
            <option value="advanced">Zaawansowany</option>
            <option value="tournament">Turniejowy / mistrzowski</option>
          </select>
        </label>
        <label>
          Preferowana rola
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="strzelec">Shooter — strzelec</option>
            <option value="puenter">Pointer — puenter</option>
            <option value="middle">Middle</option>
            <option value="wszechstronny">Wszechstronny</option>
          </select>
        </label>
        <label>
          Rzucam ręką
          <select value={hand} onChange={(e) => setHand(e.target.value)}>
            <option value="prawa">Prawą</option>
            <option value="lewa">Lewą</option>
          </select>
        </label>
        <button className="button" disabled={busy || !name.trim()}>
          Zapisz profil <Check size={20} />
        </button>
        {saved && (
          <p role="status" className="success">
            Profil zapisany.
          </p>
        )}
      </form>
    </>
  );
}
export function More() {
  return (
    <>
      <Heading eyebrow="TWOJA APLIKACJA" title="Po swojemu">
        Treningi i postęp zapisujemy na tym urządzeniu.
      </Heading>
      <div className="more-links">
        {[
          [
            "/match",
            Trophy,
            "Mecz",
            "Wynik, kule i rozgrywki · 1 na 1, 2 na 2, 3 na 3",
          ],
          [
            "/profile",
            User,
            "Twój profil",
            "Sposób gry, cel treningu, poziom i rola",
          ],
          [
            "/coach/development",
            Trophy,
            "Mój rozwój",
            "Umiejętności, tydzień, mental i ciało",
          ],
          [
            "/coach/competition",
            Timer,
            "Mam zawody",
            "Krótki plan przed startem",
          ],
          [
            "/start",
            Home,
            "Pierwsze kroki",
            "Podstawy i wprowadzenie do świadomego treningu",
          ],
          [
            "/coach/weaknesses",
            Target,
            "Do poprawy",
            "Priorytety z Twoich wyników",
          ],
          [
            "/coach/challenge",
            Trophy,
            "Pokonaj siebie",
            "Powtórz własny wynik w tych samych warunkach",
          ],
          ["/history", History, "Historia treningów", "Każda zapisana kula"],
          ["/lessons", BookOpen, "Lekcje", "Rutyna i koncentracja"],
          ["/rules", Compass, "Zasady", "Przepisy i quiz"],
          [
            "/progress",
            ChartNoAxesCombined,
            "Postęp",
            "Statystyki i osiągnięcia",
          ],
          [
            "/adventure",
            Sparkles,
            "Przygoda z pétanque",
            "Misje i pięć modułów treningu",
          ],
          [
            "/feedback",
            MessageSquare,
            "Zgłoś pomysł / problem",
            "Napisz, co możemy poprawić",
          ],
          ["/settings", Settings, "Ustawienia", "Dane i działanie offline"],
        ].map(([path, Icon, title, description]) => {
          const I = Icon as typeof User;
          return (
            <Link
              className="card history-item"
              aria-label={String(title)}
              key={String(path)}
              to={String(path)}
            >
              <div className="icon-box">
                <I />
              </div>
              <div>
                <h2>{String(title)}</h2>
                <p className="muted">{String(description)}</p>
              </div>
              <ChevronRight />
            </Link>
          );
        })}
      </div>
      <section className="card">
        <h2>Od grania do trenowania.</h2>
        <p>{productMessage}</p>
        <p>
          Dla ambitnych graczy klubowych, juniorów oraz osób początkujących i
          średniozaawansowanych, które potrzebują planu i regularności. Możesz
          korzystać z aplikacji także jako uzupełnienia pracy z trenerem.
        </p>
      </section>
      <section className="card" aria-labelledby="author-title">
        <h2 id="author-title">Kto tworzy Jedną Kulę?</h2>
        <p>
          Paweł jest twórcą i osobą techniczną stojącą za Jedną Kulą. Jest
          Senior QA Automation Engineerem z ponad 12-letnim doświadczeniem w IT,
          automatyzacji i jakości oprogramowania. Odpowiada za projekt produktu,
          logikę aplikacji, testy i rozwój techniczny.
        </p>
        <p>
          Jego rola w aplikacji jest techniczna i produktowa. Wskazówki
          treningowe są materiałem do samodzielnej pracy; indywidualne uwagi o
          technice warto omówić z trenerem.
        </p>
        <h3>Konsultacje merytoryczne</h3>
        <p>
          To miejsce na potwierdzone konsultacje treści z doświadczonymi
          zawodnikami, trenerami i specjalistami. Nie publikujemy obecnie listy
          potwierdzonych konsultantów.
        </p>
        <p className="muted small">
          Przy każdym podpisie podamy zakres sprawdzonych treści, rolę i datę
          konsultacji: recenzja treści, doradztwo trenerskie, wkład w metodykę
          treningu lub recenzja psychologii sportu. Podpis będzie odpowiadał
          rzeczywistemu wkładowi.
        </p>
      </section>
      <section className="card">
        <h2>Dobierz rolę do zadania drużyny.</h2>
        <p>
          Dobry strzał i dobra puenta pomagają tej samej drużynie. Ćwicz obie
          umiejętności.
        </p>
      </section>
    </>
  );
}
export function SettingsPage() {
  const { state, save, busy } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [persistent, setPersistent] = useState(false);
  return (
    <>
      <Back to="/more" />
      <Heading title="Ustawienia" />
      <section className="card">
        <h2>Trening bez internetu</h2>
        <p>
          Po pierwszym otwarciu gotowej aplikacji możesz trenować offline. Dane
          zostają w tej przeglądarce. Usunięcie danych witryny usuwa też Twój
          postęp.
        </p>
        <button
          className="secondary"
          onClick={async () =>
            setPersistent((await navigator.storage?.persist?.()) ?? false)
          }
        >
          Chroń dane na urządzeniu
        </button>
        {persistent && (
          <p role="status">Przeglądarka przyznała trwałe przechowywanie.</p>
        )}
        <p className="muted small">
          Przyznanie ochrony zależy od przeglądarki.
        </p>
      </section>
      <section className="card">
        <h2>Kopia Twoich danych</h2>
        <p>Pobierz profil, lekcje i wyniki jako plik JSON.</p>
        <button
          className="secondary"
          onClick={() => {
            downloadBackup(serializeBackup(state));
          }}
        >
          Pobierz kopię <Download size={18} />
        </button>
      </section>
      <MeasurementSettings />
      <BackupControls />
      <section className="card">
        <h2>Historia treningów</h2>
        {confirm ? (
          <div role="alert">
            <p>
              Czy usunąć całą historię treningów? Nie można tego cofnąć. Profil
              i lekcje zostaną.
            </p>
            <button
              className="danger"
              disabled={busy}
              onClick={async () => {
                await save({ ...state, sessions: [] });
                setConfirm(false);
              }}
            >
              Tak, usuń historię
            </button>
            <button className="secondary" onClick={() => setConfirm(false)}>
              Anuluj
            </button>
          </div>
        ) : (
          <button className="danger" onClick={() => setConfirm(true)}>
            Usuń historię treningów
          </button>
        )}
      </section>
    </>
  );
}
export function Missing() {
  return (
    <div className="empty">
      <h1>Nie znaleziono tej strony</h1>
      <Link className="button" to="/">
        Wróć na start
      </Link>
    </div>
  );
}
