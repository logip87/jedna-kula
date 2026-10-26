import { CountBeforeChoice } from "../mental/CountBeforeChoice";
import { TacticBoard, TacticalFeedback } from "../situations/Board";
import { useState } from "react";
import { LobSetup } from "../../LobSetup";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Map,
  Compass,
  Crosshair,
  Users,
  Target,
  Sparkles,
  Trophy,
  Flag,
} from "lucide-react";
import { useApp } from "../../app-context";
import { lessons } from "../../data";
import { missions, tacticCases } from "./data";
import {
  defaultConfig,
  missionKey,
  missionCompleted,
  recommendedTraining,
  createPractice,
  errorMap,
  directions,
} from "./model";
import { AdventureBack, AdventureHeading } from "./ui";
export function AdventureHome() {
  const { state, save, busy } = useApp();
  const config = state.adventure?.config ?? defaultConfig;
  const completed = missions
    .slice(0, config.length)
    .filter((_, i) => missionCompleted(state, missionKey(config, i))).length;
  const [audience, setAudience] = useState(config.audience);
  const [length, setLength] = useState(config.length);
  const nextMission = missions
    .slice(0, config.length)
    .findIndex((_, i) => !missionCompleted(state, missionKey(config, i)));
  const nextMissionIndex = nextMission === -1 ? config.length - 1 : nextMission;
  const nextMissionData = missions[nextMissionIndex];
  const recommendation = recommendedTraining(
    state,
    config.audience === "junior" ? 7 : 10,
  );
  const hasPersonalRecommendation = recommendation.personalized;
  const modules = [
    {
      to: "next",
      title: "Mój następny trening",
      description: "Jedno zadanie dopasowane do wyników.",
      icon: Target,
    },
    {
      to: "tactics",
      title: "Co zagrasz?",
      description: "Plansza, kule i decyzja z konsekwencjami.",
      icon: Compass,
    },
    {
      to: "map",
      title: "Mapa moich rzutów",
      description: "Zobacz, gdzie uciekają Twoje kule.",
      icon: Map,
    },
    {
      to: "precision",
      title: "20 strzałów",
      description: "Pełna seria pięciu figur MPSP.",
      icon: Crosshair,
    },
    {
      to: "duel",
      title: "We dwoje",
      description: "Pojedynek albo wspólny cel na jednym telefonie.",
      icon: Users,
    },
  ];
  return (
    <div className="adventure-page">
      <AdventureHeading
        title="Plan treningowy"
        subtitle="Jeden następny krok na teraz. Pozostałe treningi wybierasz po swojemu."
      />
      <section className="adventure-hero adventure-now">
        <span className="eyebrow">NA TERAZ</span>
        <h2>
          {hasPersonalRecommendation
            ? `${recommendation.mode === "shoot" ? "Strzał" : recommendation.mode === "lob" ? "Lob" : "Puenta"} na ${recommendation.distance} m`
            : nextMissionData.title}
        </h2>
        <p>
          {hasPersonalRecommendation
            ? recommendation.reason
            : "Pierwsze treningi pomogą zbudować bazę do późniejszych rekomendacji."}
        </p>
        <Link
          className="primary"
          to={
            hasPersonalRecommendation
              ? "/adventure/next"
              : `/adventure/mission/${nextMissionIndex + 1}`
          }
        >
          {hasPersonalRecommendation ? "Rozpocznij trening" : "Zobacz zadanie"}
          <ArrowRight size={20} />
        </Link>
        <Link className="text-link" to="/adventure/missions">
          Wybierz coś innego
        </Link>
      </section>
      <section className="adventure-path-status">
        <div>
          <b>Twoja ścieżka</b>
          <p>
            {completed} / {config.length} misji ·{" "}
            {config.audience === "junior"
              ? "Krótka seria"
              : "Standardowa seria"}
          </p>
        </div>
        <progress
          value={completed}
          max={config.length}
          aria-label="Postęp ścieżki"
        />
        <Link className="secondary" to="/adventure/missions">
          Zobacz ścieżkę
        </Link>
      </section>
      <section className="adventure-explainer card">
        <h2>Misje i rekomendacje</h2>
        <p>
          Misje budują podstawy i prowadzą przez uporządkowaną ścieżkę.
          Rekomendacje korzystają z Twoich zapisanych wyników i podpowiadają,
          nad czym warto pracować.
        </p>
        <p className="muted small">
          Rekomendacje korzystają ze zwykłych zapisanych serii. Sprawdzian, gra
          we dwoje i scenariusze taktyczne mają własną historię.
        </p>
      </section>
      <details className="rules-notes" open={!state.adventure?.config}>
        <summary>Wybierz swoją ścieżkę</summary>
        <p>
          Krótka seria: 6 prób i większe cele — dobry początek dla juniora lub
          osoby uczącej się podstaw. Standardowa seria: 12 prób — na regularny
          trening gracza klubowego. Wybierasz objętość, niezależnie od wieku i
          kategorii zawodów.
        </p>
        <fieldset className="adventure-switch">
          <legend>Objętość treningu</legend>
          {(["junior", "beginner"] as const).map((a) => (
            <button
              key={a}
              aria-pressed={audience === a}
              onClick={() => setAudience(a)}
            >
              {a === "junior" ? "Krótka seria" : "Standardowa seria"}
            </button>
          ))}
        </fieldset>
        <fieldset className="adventure-switch">
          <legend>Długość planu</legend>
          {([10, 15, 20] as const).map((n) => (
            <button
              key={n}
              aria-pressed={length === n}
              onClick={() => setLength(n)}
            >
              {n} treningów
            </button>
          ))}
        </fieldset>
        <button
          className="primary"
          disabled={busy}
          onClick={() =>
            save({
              ...state,
              adventure: { ...state.adventure, config: { audience, length } },
            })
          }
        >
          Zapisz wybór ścieżki
        </button>
        <p className="muted small">
          Treningi i postęp wcześniejszych ścieżek zostają zapisane. Misję
          zalicza pełna, zapisana seria — nie wymagamy określonej liczby
          trafień.
        </p>
      </details>
      <details className="rules-notes">
        <summary>Dodatkowe sprawdziany</summary>
        <p>
          Opcjonalny krok po regularnych seriach. Nie jest potrzebny, aby
          kontynuować misje.
        </p>
        <Link className="secondary" to="/coach/boss">
          Sprawdziany rozdziałów
        </Link>
      </details>
      <Link className="secondary" to="/coach/match">
        Tryb meczowy
      </Link>
      <h2>Inne sposoby treningu</h2>
      <div className="adventure-modules">
        {modules.map((m, i) => (
          <Link
            className={`adventure-module module-${i}`}
            key={m.to}
            to={`/adventure/${m.to}`}
          >
            <m.icon size={27} />
            <small>0{i + 1}</small>
            <h3>{m.title}</h3>
            <p>{m.description}</p>
            <ArrowRight size={20} />
          </Link>
        ))}
      </div>
      <p className="muted small">
        Autorska ścieżka treningowa. Ćwicz w swoim tempie; zapis nie jest
        oficjalnym egzaminem ani kategorią sportową.
      </p>
    </div>
  );
}
export function MissionPath() {
  const { state } = useApp();
  const config = state.adventure?.config ?? defaultConfig;
  const finished = missions
    .slice(0, config.length)
    .map((_, i) => missionCompleted(state, missionKey(config, i)));
  const next = finished.indexOf(false);
  const count = finished.filter(Boolean).length;
  const currentIndex = next === -1 ? config.length - 1 : next;
  const current = missions[currentIndex];
  const upcoming = missions.slice(currentIndex + 1, currentIndex + 4);
  return (
    <div className="adventure-page">
      <AdventureBack />
      <AdventureHeading
        title="Moja ścieżka"
        subtitle={`${config.audience === "junior" ? "Krótka seria" : "Standardowa seria"} · ${config.length} treningów. Każda misja to jedna zapisana sesja.`}
      />
      <div className="mission-passport">
        <Trophy size={30} />
        <div>
          <b>
            {count} / {config.length} misji
          </b>
          <p>
            {count === config.length
              ? "Przygoda ukończona! Możesz wracać do ulubionych misji."
              : "Nie musisz trafić każdej kuli. Wystarczy wykonać pełną serię."}
          </p>
        </div>
      </div>
      {state.draft && (
        <Link className="resume-card" to="/session">
          Wznów rozpoczęty trening <ArrowRight />
        </Link>
      )}
      {config.audience === "junior" && (
        <Link className="button" to="/coach/boss">
          Sprawdzian rozdziałus — sprawdź rozdziały
        </Link>
      )}
      <section className="mission-current">
        <p className="eyebrow">AKTUALNA MISJA</p>
        <h2>{current.title}</h2>
        <p>
          {current.goal.replace(
            "6 prób",
            config.audience === "junior" ? "6 prób" : "12 prób",
          )}
        </p>
        <p className="muted">
          Po co to robisz? Budujesz podstawy i zapisujesz dane do porównania
          kolejnych treningów.
        </p>
        <Link className="primary" to={`/adventure/mission/${currentIndex + 1}`}>
          Zobacz zadanie <ArrowRight size={18} />
        </Link>
      </section>
      {upcoming.length > 0 && (
        <section className="mission-upcoming">
          <h2>Następne</h2>
          {upcoming.map((mission, offset) => (
            <div key={mission.title}>
              <b>
                {currentIndex + offset + 2}. {mission.title}
              </b>
              <span>{config.audience === "junior" ? "6" : "12"} prób</span>
            </div>
          ))}
        </section>
      )}
      <details className="mission-all">
        <summary>
          Cała ścieżka ({count} / {config.length})
        </summary>
        <ol className="mission-path">
          {missions.slice(0, config.length).map((m, i) => {
            const unlocked = finished[i] || i === next;
            return (
              <li
                key={i}
                className={
                  finished[i] ? "done" : unlocked ? "current" : "locked"
                }
              >
                <span className="mission-node">
                  {finished[i] ? (
                    <Check size={22} />
                  ) : unlocked ? (
                    i + 1
                  ) : (
                    <LockKeyhole size={18} />
                  )}
                </span>
                <div>
                  <small>
                    ETAP {Math.floor(i / 5) + 1} · MISJA {i + 1}
                  </small>
                  <h2>{m.title}</h2>
                  <p>
                    {config.audience === "junior" ? "6" : "12"} prób · około{" "}
                    {config.audience === "junior" ? "10" : "20"} min
                  </p>
                  {unlocked && (
                    <Link
                      className="secondary"
                      to={`/adventure/mission/${i + 1}`}
                    >
                      {finished[i] ? "Zagraj ponownie" : "Zobacz zadanie"}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </details>
      <Link className="secondary" to="/adventure">
        Zmień ścieżkę lub wybierz moduł
      </Link>
    </div>
  );
}
export function MissionDetail() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const { number } = useParams();
  const index = Number(number) - 1;
  const config = state.adventure?.config ?? defaultConfig;
  if (!Number.isInteger(index) || index < 0 || index >= config.length)
    return (
      <>
        <AdventureBack />
        <h1>Nie znaleziono misji</h1>
      </>
    );
  const id = missionKey(config, index);
  const original = missions[index];
  const recommendation = recommendedTraining(
    state,
    config.audience === "junior" ? 7 : 10,
  );
  const mission =
    index === 17
      ? {
          ...original,
          mode: recommendation.mode,
          distances: [recommendation.distance],
          drillId:
            recommendation.mode === "shoot"
              ? "shoot-basic"
              : recommendation.mode === "lob"
                ? "lob"
                : "point-basic",
        }
      : original;
  const unlocked =
    index === 0 ||
    missionCompleted(state, id) ||
    missions
      .slice(0, index)
      .every((_, i) => missionCompleted(state, missionKey(config, i)));
  if (!unlocked)
    return (
      <>
        <AdventureBack />
        <h1>Ta misja jeszcze czeka</h1>
        <p>Najpierw ukończ wcześniejsze misje.</p>
        <Link className="primary" to="/adventure/missions">
          Wróć na ścieżkę
        </Link>
      </>
    );
  const distances = mission.distances.map((d) =>
    config.audience === "junior" ? Math.min(d, 7) : d,
  );
  const attempts = config.audience === "junior" ? 6 : 12;
  const begin = async () => {
    if (state.draft) return;
    const session = createPractice(
      mission.drillId,
      mission.mode,
      distances,
      attempts,
      {
        missionId: id,
        targetSize: config.audience === "junior" ? 100 : 50,
      },
    );
    session.missionTitle = mission.title;
    session.missionCue = mission.cue;
    if (index === 14 || index === 19)
      session.plan = session.plan.map((p, i) => ({
        ...p,
        mode: i < attempts / 2 ? "point" : "shoot",
        phase: i < attempts / 2 ? "Puenta" : "Strzał",
      }));
    if (await save({ ...state, draft: session })) navigate("/session");
  };
  return (
    <div className="adventure-page">
      <Link className="back" to="/adventure/missions">
        ← Moja ścieżka
      </Link>
      <AdventureHeading
        eyebrow={`MISJA ${index + 1} / ${config.length}`}
        title={mission.title}
        subtitle={`${attempts} prób · ${[...new Set(distances)].join(" i ")} m · około ${config.audience === "junior" ? 10 : 20} min`}
      />
      <section className="mission-brief">
        <Flag size={28} />
        <h2>Twoje zadanie</h2>
        <p>
          {index === 17
            ? recommendation.reason
            : mission.goal.replace("6 prób", `${attempts} prób`)}
        </p>
        {config.audience === "junior" && (
          <p>
            W Twojej wersji: {attempts} prób na{" "}
            {[...new Set(distances)].join(" i ")} m
            {mission.mode === "target" ? ", cel 100 cm" : ""}. Dystanse na
            ekranie mają pierwszeństwo przed opisem wariantu podstawowego.
          </p>
        )}
        <p>
          <b>Przygotuj:</b> kółko, miarkę, świnkę, kule i miejsce do ćwiczenia.
        </p>
        <p className="cue">„{mission.cue}”</p>
        <p>
          <b>Po co to robisz?</b> Budujesz powtarzalność i dane, które pomogą
          porównać kolejne treningi.
        </p>
      </section>
      <div className="card">
        <h2>Przed pierwszym rzutem</h2>
        <p>
          Rozruszaj się i wykonaj kilka swobodnych prób. Zaznacz kierunek każdej
          kuli — mapa pomoże wybrać następne zadanie.
        </p>
        {mission.mode === "lob" && (
          <LobSetup
            distance={distances[0]}
            obstacle={mission.drillId === "lob-obstacle"}
          />
        )}
        {mission.scenario && (
          <Link
            className="secondary"
            to={`/adventure/tactics?case=${mission.scenario}`}
          >
            Przygotuj decyzję na planszy
          </Link>
        )}
        {mission.lesson && (
          <Link className="secondary" to={`/lessons/${mission.lesson}`}>
            {lessons.find((l) => l.id === mission.lesson)?.title} · lekcja
            mentalna
          </Link>
        )}
      </div>
      <p className="muted">
        Misja zaliczona po zapisaniu wszystkich {attempts} prób. Pudła też są
        częścią nauki.
      </p>
      {state.draft ? (
        <Link className="primary" to="/session">
          Wznów otwarty trening
        </Link>
      ) : (
        <button className="primary" disabled={busy} onClick={begin}>
          Rozpocznij serię {attempts} prób <ArrowRight size={20} />
        </button>
      )}
      <Link
        className="secondary"
        to={`/training/${mission.drillId}?level=easy`}
      >
        Zobacz pełny opis ćwiczenia
      </Link>
    </div>
  );
}
export function NextTraining() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const r = recommendedTraining(
    state,
    state.adventure?.config?.audience === "junior" ? 7 : 10,
  );
  const [duration, setDuration] = useState(10);
  const modeName =
    r.mode === "shoot" ? "Strzał" : r.mode === "lob" ? "Lob" : "Puenta";
  const start = async () => {
    if (state.draft) return;
    const id =
      r.mode === "shoot"
        ? "shoot-basic"
        : r.mode === "lob"
          ? "lob"
          : "point-basic";
    const session = createPractice(
      id,
      r.mode,
      [r.distance],
      duration === 10 ? 6 : duration === 20 ? 12 : 18,
      {},
    );
    session.coach = { source: "recommended" };
    if (await save({ ...state, draft: session })) navigate("/session");
  };
  return (
    <div className="adventure-page">
      <AdventureBack />
      <AdventureHeading
        title={
          r.personalized ? "Mój następny trening" : "Pierwszy trening bazowy"
        }
        subtitle={
          r.personalized
            ? "Jedna propozycja z zapisanych wyników. Możesz ćwiczyć w swoim tempie."
            : "Zaczynamy od prostego wariantu, zanim rekomendacje zaczną korzystać z historii."
        }
      />
      <section className="recommendation-card">
        <Sparkles size={30} />
        <p className="eyebrow">
          {r.personalized ? "NA TERAZ" : "WARIANT STARTOWY"}
        </p>
        <h2>
          {modeName} na {r.distance} m
        </h2>
        {r.personalized ? (
          <>
            <div className="data-status">
              <b>Mamy wystarczające dane</b>
              <span>
                {Math.round((r.rate ?? 0) * 100)}% z {r.count} porównywalnych
                prób.
              </span>
            </div>
            <p>{r.reason}</p>
            {r.rotationReason && <p className="muted">{r.rotationReason}</p>}
            <details className="recommendation-why">
              <summary>Dlaczego to polecamy?</summary>
              <p>
                Porównujemy tylko zwykłe, zapisane serie tego samego rodzaju i
                dystansu. To jeden z ważniejszych obszarów do pracy w Twoich
                ostatnich wynikach.
              </p>
            </details>
          </>
        ) : (
          <>
            <p>
              Jeszcze nie korzystamy z Twojej historii. Zapisz kilka serii, aby
              rekomendacje zaczęły uwzględniać wyniki.
            </p>
            <div className="data-status">
              <b>Budujemy bazę</b>
              <span>
                {Math.min(r.count, 20)} / 20 prób · {Math.min(r.sessions, 2)} /
                2 sesji
              </span>
              <small>
                Obserwujemy {modeName.toLowerCase()} na {r.distance} m.
              </small>
            </div>
          </>
        )}
        <p className="muted">
          Trafienie oznacza tę samą rzecz co w statystykach treningu. Nie
          porównujemy różnych dystansów na podstawie pojedynczego rzutu.
        </p>
      </section>
      <fieldset className="adventure-switch">
        <legend>Ile masz czasu?</legend>
        {[10, 20, 30].map((n) => (
          <button
            aria-pressed={duration === n}
            key={n}
            onClick={() => setDuration(n)}
          >
            {n} min
          </button>
        ))}
      </fieldset>
      <p>
        {duration === 10 ? 6 : duration === 20 ? 12 : 18} prób, plus
        przygotowanie i krótki przegląd wyników. Czas jest orientacyjny.
      </p>
      {state.draft ? (
        <Link className="primary" to="/session">
          Wznów otwarty trening
        </Link>
      ) : (
        <button className="primary" disabled={busy} onClick={start}>
          Rozpocznij trening
        </button>
      )}
      <Link className="secondary" to="/adventure/map">
        Zobacz mapę moich rzutów
      </Link>
    </div>
  );
}
export function ErrorMap() {
  const { state } = useApp();
  const [mode, setMode] = useState("all");
  const [distance, setDistance] = useState("all");
  const [landing, setLanding] = useState(false);
  const map = errorMap(state, mode, distance, landing);
  const allDirections = errorMap(state, "all", "all", false);
  const minimumMapSample = 6;
  return (
    <div className="adventure-page">
      <AdventureBack />
      <AdventureHeading
        title="Mapa moich rzutów"
        subtitle="Kierunki z zapisanych treningów. Lądowanie i koniec lotu to dwa różne pomiary."
      />
      {allDirections.total < minimumMapSample ? (
        <section className="map-empty card">
          <Map size={30} />
          <h2>Zobacz, gdzie uciekają kule</h2>
          <p>
            Zapisz kierunek kilku prób, a pokażemy najczęstszy wzorzec.
            Potrzebujemy minimum {minimumMapSample} oznaczonych prób.
          </p>
          <Link className="primary" to="/adventure/next">
            Zapisz pierwsze próby
          </Link>
        </section>
      ) : (
        <>
          <div className="map-filters">
            <label>
              Rodzaj
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="all">Wszystkie</option>
                <option value="point">Puenta</option>
                <option value="shoot">Strzał</option>
                <option value="lob">Lob</option>
                <option value="target">Do celu</option>
                <option value="boundary">Przy linii</option>
              </select>
            </label>
            <label>
              Dystans
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              >
                <option value="all">Wszystkie</option>
                {[6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} m
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset className="adventure-switch">
            <legend>Co pokazujemy?</legend>
            <button aria-pressed={!landing} onClick={() => setLanding(false)}>
              Końcową pozycję
            </button>
            <button aria-pressed={landing} onClick={() => setLanding(true)}>
              Lądowanie lobu
            </button>
          </fieldset>
          <div className="error-map" aria-label="Rozkład kierunków">
            {directions.map((d) => (
              <div
                key={d.id}
                data-direction={d.id}
                className={map.dominant?.id === d.id ? "dominant" : ""}
              >
                <span aria-hidden="true">{d.symbol}</span>
                <strong>{map.counts[d.id]}</strong>
                <b>{d.label}</b>
                <small>
                  {map.total
                    ? Math.round((map.counts[d.id] / map.total) * 100)
                    : 0}
                  %
                </small>
              </div>
            ))}
          </div>
          <p className="muted">
            Zaznaczone kierunki: {map.total}. Próby bez tego pomiaru:{" "}
            {map.missing}. To kierunki wskazane przez Ciebie, nie pomiar
            odległości kamerą.
          </p>
          <section className="recommendation-card">
            <h2>
              {map.dominant
                ? `Najczęstszy błąd: ${map.dominant.label.toLowerCase()}`
                : "Najwięcej informacji daje porównanie kolejnych serii"}
            </h2>
            <p>
              {map.dominant
                ? `W tym wyborze zapisano ${map.counts[map.dominant.id]} takich prób. Powtórz serię na tym samym dystansie, zmieniając tylko jeden element przygotowania.`
                : "Nie zapisano odchylenia od celu. Kontynuuj serię, żeby zebrać więcej danych."}
            </p>
            <Link className="secondary" to="/adventure/next">
              Wybierz następny trening
            </Link>
          </section>
        </>
      )}
      <Link className="secondary" to="/progress">
        Wszystkie statystyki treningów
      </Link>
    </div>
  );
}
export function Tactics() {
  const { state, save, busy } = useApp();
  const initial = new URLSearchParams(location.search).get("case");
  const [selected, setSelected] = useState(
    tacticCases.find((c) => c.id === initial)?.id ?? tacticCases[0].id,
  );
  const scenario = tacticCases.find((c) => c.id === selected)!;
  const answer = state.adventure?.tactics?.[scenario.id];
  return (
    <div className="adventure-page">
      <AdventureBack />
      <AdventureHeading
        title="Co zagrasz?"
        subtitle="Poznaj warianty. Decyzja zależy także od terenu i Twoich umiejętności."
      />
      <p className="tactic-intro">
        <b>
          Twój wybór zostanie zapisany, a następnie zobaczysz zalety, ryzyko i
          alternatywę.
        </b>{" "}
        To ćwiczenie decyzji, nie ocena skuteczności rzutu.
      </p>
      <label>
        Sytuacja
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {tacticCases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <div className="tactic-score">
        <b>Wynik {scenario.score}</b>
        <span>
          Twoje kule: {scenario.own} · rywala: {scenario.opponent}
        </span>
      </div>
      <TacticBoard scenario={scenario} />
      <h2>{scenario.title}</h2>
      <p>{scenario.description}</p>
      <CountBeforeChoice
        key={scenario.id}
        own={scenario.own}
        opponent={scenario.opponent}
        enabled={
          new URLSearchParams(location.search).get("lesson") === "ball-count" &&
          scenario.id === "last"
        }
      >
        <div className="tactic-options">
          {scenario.options.map((o, i) => (
            <button
              className="secondary"
              aria-pressed={answer === i}
              disabled={busy}
              key={o.title}
              onClick={() =>
                save({
                  ...state,
                  adventure: {
                    ...state.adventure,
                    tactics: { ...state.adventure?.tactics, [scenario.id]: i },
                  },
                })
              }
            >
              {o.title}
            </button>
          ))}
        </div>
      </CountBeforeChoice>
      {answer !== undefined && (
        <>
          <TacticalFeedback scenario={scenario} choice={answer} />
          <Link
            className="secondary"
            to={
              scenario.id === "last"
                ? "/rules/rule/jack-out"
                : "/rules/rule/turn"
            }
          >
            Przepis związany z sytuacją
          </Link>
        </>
      )}
      <Link className="button" to="/coach/match">
        Zagraj trening meczowy
      </Link>
      <p className="muted small">
        Wykonane scenariusze decyzyjne:{" "}
        {Object.keys(state.adventure?.tactics ?? {}).length} /{" "}
        {tacticCases.length}
      </p>
    </div>
  );
}
