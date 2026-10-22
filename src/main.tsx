import { ScreenBoundary } from "./ScreenBoundary";
import {
  Start,
  Library,
  Detail,
  Active,
  Summary,
  HistoryPage,
  HistoryDetail,
  LessonDetail,
  ProgressPage,
  Profile,
  More,
  SettingsPage,
  Missing,
  Generator,
  Weaknesses,
  SelfChallenge,
  LessonList,
  Feedback,
  MatchMode,
  BossTests,
  ExtraChallenges,
  Development,
  Week,
  Goals,
  Mastery,
  PracticeLibrary,
  PracticeActive,
  Competition,
  RulesHome,
  RulesCategory,
  RuleDetail,
  QuickHelp,
  RulesQuiz,
  AdventureHome,
  MissionPath,
  MissionDetail,
  NextTraining,
  ErrorMap,
  Tactics,
  PrecisionTraining,
  DuelTraining,
} from "./route-components";
import { BeginnerGuide } from "./BeginnerGuide";
import { Today } from "./features/coaching/Today";
import { attachPendingMentalCue } from "./features/mental/cue";
import { ProfilePrompt } from "./features/profile/ProfilePrompt";
import { recordEvent, transitionEvents } from "./features/product/analytics";
import { awardSituations } from "./features/situations/model";
import { Suspense, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  NavLink,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Home,
  Target,
  ChartNoAxesCombined,
  Ellipsis,
  CircleDot,
  Download,
  WifiOff,
  User,
} from "lucide-react";
import { registerSW } from "virtual:pwa-register";
import { awardAchievements, type State } from "./domain";
import { repository } from "./storage";
import { awardDevelopment } from "./features/development/model";
import "./styles.css";
import { Context } from "./app-context";
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: string;
  }>;
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
      if (!restoring && state) next = attachPendingMentalCue(state, next);
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
            <span className="desktop-label">OD GRANIA DO TRENOWANIA.</span>
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
            <ProfilePrompt key={route.pathname} />
            <ScreenBoundary key={route.pathname}>
              <Suspense fallback={<p role="status">Wczytywanie ekranu…</p>}>
                <Routes>
                  <Route
                    path="/"
                    element={<Today guide={<BeginnerGuide />} />}
                  />
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
              </Suspense>
            </ScreenBoundary>
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
                <span className="bottom-nav-icon" aria-hidden="true">
                  <Icon size={21} strokeWidth={2} />
                </span>
                <span className="bottom-nav-label">{label}</span>
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
