import {
  throwScenarios,
  scenarioForThrow,
  decisionReviews,
  reviewDecision,
  type DecisionReview,
} from "./features/situations/throw-scenarios";
import { LessonList } from "./features/mental/Lessons";
import {
  routineSteps,
  mentalCompetencies,
  mentalLevels,
  completedMentalLessons,
  technicalMentalCue,
} from "./features/mental/catalog";
import { Feedback } from "./features/feedback/Feedback";
import {
  TrainingSummary,
  MeasurementSettings,
} from "./features/product/Product";
import { recordEvent, transitionEvents } from "./features/product/analytics";
import {
  MatchMode,
  BossTests,
  ExtraChallenges,
} from "./features/situations/Situations";
import { awardSituations, challengePassed } from "./features/situations/model";
import React, { useEffect, useRef, useState } from "react";
import { DistanceChange } from "./DistanceChange";
import { ProgressionInfo } from "./features/product/ProgressionInfo";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  NavLink,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  Target,
  BookOpen,
  ChartNoAxesCombined,
  Ellipsis,
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
  WifiOff,
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
import { registerSW } from "virtual:pwa-register";
import { drills, lessons } from "./data";
import {
  choices,
  awardAchievements,
  makePlan,
  summarize,
  stats,
  achievements,
  percent,
  type State,
  type Session,
  type Mode,
  type Difficulty,
} from "./domain";
import { repository } from "./storage";
import {
  Development,
  Week,
  Goals,
  Mastery,
  PracticeLibrary,
  PracticeActive,
  Competition,
} from "./features/development/Development";
import {
  awardDevelopment,
  masteryHits,
  audience as playerAudience,
} from "./features/development/model";
import { BackupControls } from "./features/coaching/BackupControls";
import { serializeBackup, downloadBackup } from "./features/coaching/backup";
import {
  Today,
  Generator,
  Weaknesses,
  SelfChallenge,
  ResultInsights,
} from "./features/coaching/Coaching";
import { weeklyProgress } from "./features/coaching/model";
import "./styles.css";
import { Context, useApp } from "./app-context";
import {
  RulesHome,
  RulesCategory,
  RuleDetail,
  QuickHelp,
  RulesQuiz,
} from "./features/rules/Rules";
import {
  AdventureHome,
  MissionPath,
  MissionDetail,
  NextTraining,
  ErrorMap,
  Tactics,
} from "./features/adventure/Adventure";
import { PrecisionTraining } from "./features/adventure/Precision";
import { DuelTraining } from "./features/adventure/Duel";
import { DirectionPicker } from "./features/adventure/ui";
import {
  missionCompleted,
  surfaces,
  type Direction,
  type Surface,
} from "./features/adventure/model";
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
function BeginnerGuide() {
  return (
    <details className="beginner-guide">
      <summary>
        <span className="guide-icon">
          <Compass size={24} />
        </span>
        <span>
          <b>Pierwszy raz z pétanque?</b>
          <small>Trzy proste rzeczy i możesz zaczynać.</small>
        </span>
        <span className="guide-toggle">
          <ChevronRight size={21} />
        </span>
      </summary>
      <div className="guide-body">
        <svg
          viewBox="0 0 480 170"
          role="img"
          aria-label="Rzucasz z koła w stronę małej świnki. Celem puenty jest zatrzymanie kuli blisko niej."
        >
          <rect x="10" y="10" width="460" height="145" rx="20" fill="#eee9df" />
          <circle
            cx="70"
            cy="84"
            r="32"
            fill="none"
            stroke="#6d6d65"
            strokeWidth="3"
          />
          <path
            d="M110 84h175"
            stroke="#a48551"
            strokeWidth="2"
            strokeDasharray="5 7"
          />
          <path
            d="m273 77 12 7-12 7"
            stroke="#a48551"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="338"
            cy="84"
            r="31"
            stroke="#a48551"
            strokeDasharray="4 5"
            fill="none"
          />
          <circle cx="328" cy="90" r="13" fill="#6d6355" />
          <circle cx="350" cy="77" r="7" fill="#c55732" />
          <text x="45" y="140" fill="#564d42" fontSize="15">
            Koło
          </text>
          <text x="300" y="140" fill="#564d42" fontSize="15">
            Kula + świnka
          </text>
        </svg>
        <div className="guide-steps">
          <div>
            <b>01 · Poznaj cel</b>
            <p>
              Świnka to mała kulka. W puencie chcesz położyć swoją kulę jak
              najbliżej niej.
            </p>
          </div>
          <div>
            <b>02 · Spróbuj 6 razy</b>
            <p>
              Stań w kole, wybierz cel i rzuć. Po każdym rzucie zaznacz wynik w
              aplikacji.
            </p>
          </div>
          <div>
            <b>03 · Daj sobie czas</b>
            <p>
              Pudła też uczą. Strzał to wybicie kuli rywala, a carreau — gdy
              Twoja zostaje w jej miejscu.
            </p>
          </div>
        </div>
        <Link className="button" to="/training/point-basic?level=easy">
          Mój pierwszy trening <ArrowRight size={20} />
        </Link>
      </div>
    </details>
  );
}
function Start() {
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
            Cześć{state.player ? `, ${state.player.name}` : ""}{" "}
            <span className="wave" aria-hidden="true">
              ✦
            </span>
          </h1>
          <p className="muted">Gotowość przychodzi z pierwszym rzutem.</p>
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
            Twoja gra.
            <br />
            Twoje tempo<span className="hero-dot">.</span>
          </h2>
          <p>
            Nie potrzebujesz doświadczenia.
            <br />
            Weź kule. Zrób pierwszy krok.
          </p>
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
            <Sparkles size={16} /> Każdy kiedyś zaczynał.
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
      {!state.player && (
        <Link to="/profile" className="onboarding">
          <User size={22} />
          <span>
            <b>Jak się do Ciebie zwracać?</b> Dodaj imię, jeśli masz ochotę.
          </span>
          <ArrowRight size={19} />
        </Link>
      )}
    </>
  );
}
function Library() {
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
        Dziś blisko celu, jutro pewny strzał. Wszystko w Twoim tempie.
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
          <b>Nie wiesz, od czego zacząć?</b>
          <p>Sześć spokojnych rzutów na 6 metrów to dobry pierwszy krok.</p>
        </div>
        <Link className="secondary" to="/training/point-basic?level=easy">
          Mój pierwszy trening <ArrowRight size={18} />
        </Link>
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
        Ćwiczenia dla Ciebie: {visible.length}
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
function Detail() {
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
  const [boundary, setBoundary] = useState(d?.test ? 40 : easy ? 60 : 40);
  const [trackDirections, setTrackDirections] = useState(false);
  const [surface, setSurface] = useState<Surface>("gravel");
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
      surface,
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
          poprzednim testem na tym samym terenie. Nie można cofać rzutów.
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
          {(trackDirections || d.test) && (
            <label>
              Teren treningu
              <select
                value={surface}
                onChange={(e) => setSurface(e.target.value as Surface)}
              >
                {surfaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          )}
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
                setBoundary(v === "łatwy" ? 60 : v === "średni" ? 40 : 20);
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
            <label>
              Świnka od linii
              <select
                value={boundary}
                onChange={(e) => setBoundary(Number(e.target.value))}
              >
                {[20, 40, 60].map((x) => (
                  <option key={x} value={x}>
                    {x} cm
                  </option>
                ))}
              </select>
            </label>
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
function Active() {
  const { state, save, busy } = useApp();
  const s = state.draft;
  const navigate = useNavigate();

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
              if (final) navigate("/summary");
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
    if (!(await save({ ...state, draft: next }))) return;
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
    await save({
      ...state,
      draft: {
        ...s!,
        timedPhase: phase + 1,
        phaseStartedAt: new Date().toISOString(),
      },
    });
    setModeOverride(null);
  }
  return (
    <div className="active">
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
                navigate("/summary");
              }}
            >
              Zaliczone · podsumuj trening
            </button>
          )}
        </div>
      )}
      {(!d.timed || phase === 1 || phase === 2) && (
        <>
          <DistanceChange distance={item.distance} />
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
          {d.mode === "boundary" && <p>Świnka {s.boundary} cm od linii.</p>}
          {d.mode === "target" && (
            <p>Cel: koło o średnicy {s.targetSize} cm.</p>
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
          {s.results.length > 0 &&
            s.kind !== "test" &&
            !s.mastery &&
            !s.challenge &&
            !s.coach?.oneChance &&
            block?.title !== "Krótki test końcowy" && (
              <button
                className="undo"
                disabled={busy}
                onClick={async () => {
                  const results = s.results.slice(0, -1);
                  await save({
                    ...state,
                    draft: {
                      ...s,
                      situationChoice: undefined,
                      results,
                      ...(s.trainingPlan
                        ? {
                            trainingPlan: {
                              ...s.trainingPlan,
                              index: s.trainingPlan.blocks.findIndex(
                                (b) =>
                                  b.kind === "throws" &&
                                  results.length >= b.start &&
                                  results.length < b.end,
                              ),
                            },
                          }
                        : {}),
                      score: results.reduce((n, a) => n + a.points, 0),
                    },
                  });
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
  const [stress, setStress] = useState(session.stressLevel ?? "normalnie");
  const [routine, setRoutine] = useState<boolean | undefined>(
    session.routineUsed,
  );
  const [recovery, setRecovery] = useState(session.recovery ?? "czasami");
  const sum = summarize(session);
  const d = drills.find((d) => d.id === session.drillId)!;
  async function finish() {
    const complete = {
      ...session,
      situationChoice: undefined,
      completedAt: new Date().toISOString(),
      stressLevel: stress,
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
        <ResultInsights session={session} />
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
            Najlepsza: {sum.best?.distance ?? "—"} m · Do ćwiczenia:{" "}
            {sum.weakest?.distance ?? "—"} m. Porównanie według procentu
            punktów.
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
      {readonly ? (
        <>
          <details className="card">
            <summary>Twoja głowa podczas treningu</summary>
            <p>Samopoczucie: {session.stressLevel}</p>
            <p>Rutyna: {session.routineUsed ? "tak" : "nie"}</p>
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
function Summary() {
  const { state } = useApp();
  return state.draft && state.draft.results.length ? (
    <Result session={state.draft} />
  ) : (
    <Missing />
  );
}
function HistoryPage() {
  const { state } = useApp();
  return (
    <>
      <Heading eyebrow="KAŻDY TRENING SIĘ LICZY" title="Historia treningów">
        Twoje wyniki zapisane na tym urządzeniu.
      </Heading>
      {state.sessions.length === 0 ? (
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
          {[...state.sessions].reverse().map((s) => (
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
                  {date(s.completedAt!)} · {s.results.length} rzutów ·{" "}
                  {summarize(s).percentage}% pkt ·{" "}
                  {s.kind === "test" ? "TEST" : "TRENING"}
                </p>
              </div>
              <b>{s.score} pkt</b>
              <ChevronRight size={20} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
function HistoryDetail() {
  const { id } = useParams();
  const { state } = useApp();
  const s = state.sessions.find((s) => s.id === id);
  return s ? <Result session={s} readonly /> : <Missing />;
}
function LessonDetail() {
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
      <div className="cue big">„{l.phrase}”</div>
      {[
        ["Jedna zasada", l.rule],
        ["Na boisku", l.example],
        ["Spróbuj dziś", l.exercise],
      ].map(([title, text], i) => (
        <section className="card" key={title}>
          <p className="eyebrow">0{i + 1}</p>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
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
      <Link className="secondary" to={`/coach/practice/mental?lesson=${l.id}`}>
        Wykonaj ćwiczenie mentalne
      </Link>
      <Link className="secondary" to="/training">
        Wypróbuj na treningu
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
function ProgressPage() {
  const { state } = useApp();
  const st = stats(state);
  const distance = Array.from(new Set(st.attempts.map((a) => a.distance))).sort(
    (a, b) => a - b,
  );
  return (
    <>
      <Heading eyebrow="TWÓJ WŁASNY RYTM" title="Rośniesz z każdą kulą.">
        Porównuj się ze sobą. Każda próba to doświadczenie.
      </Heading>
      <Link className="button" to="/coach/development">
        Skill Tree i mój rozwój
      </Link>
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
        <Metric label="Celność puenty" value={st.point} suffix="%" />
        <Metric label="Celność strzału" value={st.shoot} suffix="%" />
        <Metric label="Carreaux / strzały" value={st.carreau} suffix="%" />
        <Metric
          label="Lekcje mentalne"
          value={completedMentalLessons(state.lessons)}
          suffix={` / ${lessons.length}`}
        />
      </div>
      {!st.count && (
        <p className="notice">
          Statystyki pojawią się po pierwszym zapisanym treningu.
        </p>
      )}
      <section className="card">
        <h2>Celność na odległościach</h2>
        <p className="muted small">
          Trafienia / próby. Puenta do 60 cm, strzał z usunięciem celu, precyzja
          w kole. Wyniki wszystkich typów rzutów łącznie.
        </p>
        {distance.map((d) => {
          const a = st.attempts.filter((x) => x.distance === d);
          const n = percent(a.filter((x) => x.hit).length, a.length);
          return (
            <div className="stat-row" key={d}>
              <b>{d} m</b>
              <div className="bar">
                <span style={{ width: `${n}%` }} />
              </div>
              <span>
                {n}% · {a.length} prób
              </span>
            </div>
          );
        })}
      </section>
      <section className="card">
        <h2>Ostatnie wyniki</h2>
        <div className="recent-chart">
          {state.sessions
            .filter((s) => s.kind !== "test" && !s.mastery && !s.challenge)
            .slice(-7)
            .map((s) => (
              <Link
                to={`/history/${s.id}`}
                key={s.id}
                aria-label={`${drills.find((d) => d.id === s.drillId)!.name}: ${summarize(s).percentage}%`}
              >
                <b>{summarize(s).percentage}%</b>
                <div className="chart-column">
                  <span
                    style={{
                      height: `${Math.max(3, summarize(s).percentage)}%`,
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
            ))}
        </div>
        <p className="muted small">
          Procent możliwych punktów z ostatnich 7 sesji.
        </p>
      </section>
      <section className="card">
        <h2>Spokojna głowa</h2>
        <p>Rutyna w {st.routine}% treningów.</p>
        <p>Zaliczone ćwiczenia mentalne: {st.mental}.</p>
        <Link className="text-link" to="/lessons">
          Przejdź do lekcji <ArrowRight size={16} />
        </Link>
      </section>
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
function Profile() {
  const { state, save, busy } = useApp();
  const [name, setName] = useState(state.player?.name ?? "");
  const [age, setAge] = useState(state.player?.age?.toString() ?? "");
  const [role, setRole] = useState(
    state.player?.preferredRole ?? "wszechstronny",
  );
  const [hand, setHand] = useState(state.player?.preferredHand ?? "prawa");
  const [level, setLevel] = useState<NonNullable<State["player"]>["level"]>(
    state.player?.level ??
      (state.player?.audience === "athlete" ? "advanced" : "beginner"),
  );
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Back to="/more" />
      <Heading eyebrow="BEZ KONTA. PO SWOJEMU." title="Twój profil">
        Każde ćwiczenie jest dostępne niezależnie od wieku i preferowanej roli.
      </Heading>
      <form
        className="card config profile-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            !(await save({
              ...state,
              player: {
                id: state.player?.id ?? crypto.randomUUID(),
                name: name.trim(),
                ...(age ? { age: Number(age) } : {}),
                preferredRole: role,
                preferredHand: hand,
                level,
                audience:
                  level === "beginner" || level === "intermediate"
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
            <option value="tournament">Turniejowy</option>
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
function More() {
  return (
    <>
      <Heading eyebrow="TWOJA APLIKACJA" title="Po swojemu">
        Treningi i postęp zapisujemy na tym urządzeniu.
      </Heading>
      <div className="more-links">
        {[
          ["/profile", User, "Twój profil", "Nazwa, poziom gry, rola i ręka"],
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
            "Przewodnik i dotychczasowy ekran startowy",
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
        <h2>Dobierz rolę do zadania drużyny.</h2>
        <p>
          Dobry strzał i dobra puenta pomagają tej samej drużynie. Ćwicz obie
          umiejętności.
        </p>
      </section>
    </>
  );
}
function SettingsPage() {
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
function Missing() {
  return (
    <div className="empty">
      <h1>Nie znaleziono tej strony</h1>
      <Link className="button" to="/">
        Wróć na start
      </Link>
    </div>
  );
}
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
function App() {
  const route = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const event =
      route.pathname === "/"
        ? "today_view"
        : route.pathname === "/summary"
          ? "summary_view"
          : route.pathname === "/coach/weaknesses"
            ? "weakness_view"
            : route.pathname === "/coach/week"
              ? "weekly_challenge_view"
              : null;
    if (event) recordEvent(event);
  }, [route.pathname]);
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(!navigator.onLine);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [update, setUpdate] = useState<
    ((reload?: boolean) => Promise<void>) | null
  >(null);
  useEffect(() => {
    recordEvent("app_open");
    repository
      .load()
      .then(setState)
      .catch((error: unknown) =>
        setError(
          error instanceof Error
            ? error.message
            : "Nie udało się otworzyć danych. Sprawdź uprawnienia pamięci i odśwież aplikację.",
        ),
      );
    const on = () => setOffline(!navigator.onLine);
    const prompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    const installed = () => setInstall(null);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("appinstalled", installed);
    const updater: (reload?: boolean) => Promise<void> = registerSW({
      onNeedRefresh: () => {
        if (updater) setUpdate(() => updater!);
      },
    });
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  async function save(next: State, restoring = false) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    try {
      const awarded = awardAchievements(
        restoring
          ? next
          : awardDevelopment(state!, awardSituations(state!, next)),
      );
      if (restoring) await repository.restore(awarded);
      else await repository.save(awarded);
      if (!restoring && state) transitionEvents(state, awarded);
      setState(awarded);
      setError("");
      return true;
    } catch {
      setError(
        "Nie udało się zapisać danych. Zwolnij miejsce i spróbuj ponownie. Twoja praca pozostaje otwarta; spróbuj zapisać ponownie.",
      );
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!state)
    return (
      <div className="loading" role={error ? "alert" : "status"}>
        <CircleDot size={40} />
        <h1>Jedna kula</h1>
        <p>{error || "Przygotowujemy Twój trening…"}</p>
      </div>
    );
  const nav = [
    ["/", Home, "Dzisiaj"],
    ["/training", Target, "Trening"],
    ["/progress", ChartNoAxesCombined, "Postęp"],
    ["/more", Ellipsis, "Więcej"],
  ] as const;
  const activeSession = route.pathname === "/session";
  return (
    <Context.Provider
      value={{ state, save, restore: (next) => save(next, true), busy }}
    >
      <div className="app-shell">
        <a className="skip-link" href="#main-content">
          Przejdź do treści
        </a>
        <aside className="sidebar">
          <Link className="brand" to="/">
            <div className="brand-mark">
              <CircleDot size={26} />
            </div>
            <span>
              jedna kula<small>TRENING PÉTANQUE</small>
            </span>
          </Link>
          <nav>
            {nav.map(([path, Icon, label]) => (
              <NavLink key={path} end={path === "/"} to={path}>
                <Icon size={21} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <p>
              Nie musisz być idealny.
              <br />
              <b>Wystarczy kolejna kula.</b>
            </p>
            <div className="local-indicator">
              <span /> Twoje dane są na urządzeniu
            </div>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <Link className="brand mobile-brand" to="/">
              <CircleDot size={23} />
              <b>jedna kula</b>
            </Link>
            <span className="desktop-label">TWÓJ TRENING. TWÓJ POSTĘP.</span>
            <div className="header-actions">
              {offline && (
                <span className="offline">
                  <WifiOff size={16} /> Offline
                </span>
              )}
              {install && (
                <button
                  className="install"
                  onClick={async () => {
                    await install.prompt();
                    if ((await install.userChoice).outcome === "accepted")
                      setInstall(null);
                  }}
                >
                  <Download size={16} /> Zainstaluj aplikację
                </button>
              )}
              <Link className="avatar" aria-label="Twój profil" to="/profile">
                {state.player?.name.charAt(0).toUpperCase() || (
                  <User size={19} />
                )}
              </Link>
            </div>
          </header>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          {update && !state.draft && (
            <div className="notice">
              Nowa wersja jest gotowa.{" "}
              <button className="secondary" onClick={() => void update(true)}>
                Odśwież aplikację
              </button>
            </div>
          )}
          <main id="main-content" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<Today guide={<BeginnerGuide />} />} />
              <Route path="/start" element={<Start />} />
              <Route path="/coach/match" element={<MatchMode />} />
              <Route path="/coach/boss" element={<BossTests />} />
              <Route path="/coach/extras" element={<ExtraChallenges />} />
              <Route path="/coach/development" element={<Development />} />
              <Route path="/coach/week" element={<Week />} />
              <Route path="/coach/goals" element={<Goals />} />
              <Route path="/coach/mastery" element={<Mastery />} />
              <Route
                path="/coach/practice/mental"
                element={<PracticeLibrary kind="mental" />}
              />
              <Route
                path="/coach/practice/physical"
                element={<PracticeLibrary kind="physical" />}
              />
              <Route
                path="/coach/practice/session"
                element={<PracticeActive />}
              />
              <Route path="/coach/competition" element={<Competition />} />
              <Route path="/coach/generator" element={<Generator />} />
              <Route path="/coach/weaknesses" element={<Weaknesses />} />
              <Route path="/coach/challenge" element={<SelfChallenge />} />
              <Route path="/training" element={<Library />} />
              <Route path="/training/:id" element={<Detail />} />
              <Route path="/session" element={<Active />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/lessons" element={<LessonList />} />
              <Route path="/lessons/:id" element={<LessonDetail />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<HistoryDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/more" element={<More />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/adventure" element={<AdventureHome />} />
              <Route path="/adventure/missions" element={<MissionPath />} />
              <Route
                path="/adventure/mission/:number"
                element={<MissionDetail />}
              />
              <Route path="/adventure/next" element={<NextTraining />} />
              <Route path="/adventure/map" element={<ErrorMap />} />
              <Route path="/adventure/tactics" element={<Tactics />} />
              <Route
                path="/adventure/precision"
                element={<PrecisionTraining />}
              />
              <Route path="/adventure/duel" element={<DuelTraining />} />
              <Route path="/rules" element={<RulesHome />} />
              <Route path="/rules/quick" element={<QuickHelp />} />
              <Route path="/rules/quiz" element={<RulesQuiz />} />
              <Route
                path="/rules/category/:category"
                element={<RulesCategory />}
              />
              <Route path="/rules/rule/:id" element={<RuleDetail />} />
              <Route path="*" element={<Missing />} />
            </Routes>
          </main>
          <footer className="desktop-footer">
            Plan. Oddech. Wykonanie. Reset.{" "}
            <span>Jedna kula · lokalnie, bez konta</span>
          </footer>
        </div>
        {!activeSession && (
          <nav className="bottom-nav" aria-label="Nawigacja główna">
            {nav.map(([path, Icon, label]) => (
              <NavLink key={path} end={path === "/"} to={path}>
                <Icon size={21} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </Context.Provider>
  );
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
