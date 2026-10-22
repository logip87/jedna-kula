import { CountBeforeChoice } from "../mental/CountBeforeChoice";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../../app-context";
import { localDay } from "../../domain";
import { tacticCases } from "../adventure/data";
import { AdventureHeading } from "../adventure/ui";
import {
  bossChapters,
  bossProgress,
  createBoss,
  createExtraChallenge,
  startMatch,
  chooseMatch,
  advanceMatch,
  matchScore,
} from "./model";
import { TacticBoard, TacticalFeedback } from "./Board";
import type { SessionChallenge } from "./types";
function Back() {
  return (
    <Link className="back" to="/coach/development">
      ← Mój rozwój
    </Link>
  );
}
export function MatchMode() {
  const [params] = useSearchParams();
  const { state, save, busy } = useApp();
  const [own, setOwn] = useState(0),
    [opponent, setOpponent] = useState(0),
    [points, setPoints] = useState("own:1"),
    [confirm, setConfirm] = useState(false);
  const m = state.situations?.matchDraft,
    last = state.situations?.matchHistory?.at(-1);
  const scenario = m
    ? tacticCases.find((c) => c.id === m.scenarios[m.ends.length])
    : undefined;
  const score = m ? matchScore(m) : null;
  return (
    <div className="adventure-page">
      <Back />
      <AdventureHeading
        title="Tryb meczowy"
        subtitle="Policz kule, uwzględnij wynik, porównaj korzyść, ryzyko i alternatywę. Przećwicz sposób analizy przed kolejnym meczem."
      />
      {m && params.has("case") && (
        <p className="notice">
          Kontynuujesz zapisany mecz. Powiązaną sytuację możesz wybrać przy
          kolejnym starcie.
        </p>
      )}
      {!m && (
        <>
          <p className="notice">
            Trening decyzji w singlu: do 6 sytuacji lub 13 punktów. Po analizie
            sam wpisujesz wynik rozgrywki na podstawie ćwiczenia na boisku lub
            swojej symulacji. Aplikacja nie wylicza trafień ani szans wygranej.
          </p>
          <section className="card config">
            <h2>Wynik początkowy</h2>
            <label>
              Twoje punkty
              <select
                value={own}
                onChange={(e) => setOwn(Number(e.target.value))}
              >
                {Array.from({ length: 13 }, (_, n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              Punkty rywala
              <select
                value={opponent}
                onChange={(e) => setOpponent(Number(e.target.value))}
              >
                {Array.from({ length: 13 }, (_, n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                void save(
                  startMatch(
                    state,
                    [own, opponent],
                    params.get("case") ?? undefined,
                  ),
                )
              }
            >
              Zacznij trening meczowy
            </button>
          </section>
        </>
      )}
      {m && scenario && (
        <>
          <div className="tactic-score">
            <b>
              Wynik {score![0]} : {score![1]}
            </b>
            <span>
              Rozgrywka {m.ends.length + 1} / {m.scenarios.length}
            </span>
          </div>
          <p>
            Twoje kule: {scenario.own} · rywala: {scenario.opponent}
          </p>
          <TacticBoard scenario={scenario} />
          <h2>{scenario.title}</h2>
          <p>{scenario.description}</p>
          <h2>{scenario.own === 0 ? "Co obserwujesz?" : "Co grasz?"}</h2>
          <CountBeforeChoice
            key={`${m.id}:${m.ends.length}`}
            own={scenario.own}
            opponent={scenario.opponent}
            enabled={
              params.get("lesson") === "ball-count" &&
              scenario.id === "last" &&
              m.choice === undefined
            }
          >
            <div className="tactic-options">
              {scenario.options.map((o, i) => (
                <button
                  key={o.title}
                  className="secondary"
                  aria-pressed={m.choice === i}
                  disabled={busy || m.choice !== undefined}
                  onClick={() => void save(chooseMatch(state, i))}
                >
                  {o.title}
                </button>
              ))}
            </div>
          </CountBeforeChoice>
          {m.choice !== undefined && (
            <>
              <TacticalFeedback scenario={scenario} choice={m.choice} />
              <section className="card config">
                <h2>Wynik rozgrywki</h2>
                <p>
                  Wpisz końcowe punkty rozgrywki, po zagraniu wszystkich kul. To
                  zadeklarowany wynik, nie ocena decyzji przez aplikację.
                </p>
                <label>
                  Zdobyte punkty
                  <select
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                  >
                    <option value="none:0">0 — rozgrywka anulowana</option>
                    {["own", "opponent"].flatMap((side) =>
                      [1, 2, 3].map((n) => (
                        <option key={`${side}:${n}`} value={`${side}:${n}`}>
                          {side === "own" ? "Ty" : "Rywal"}: {n}
                        </option>
                      )),
                    )}
                  </select>
                </label>
                <button
                  className="button"
                  disabled={busy}
                  onClick={async () => {
                    const [side, n] = points.split(":");
                    if (
                      await save(
                        advanceMatch(
                          state,
                          side === "own" ? Number(n) : 0,
                          side === "opponent" ? Number(n) : 0,
                        ),
                      )
                    )
                      setPoints("own:1");
                  }}
                >
                  Zapisz rozgrywkę
                </button>
              </section>
            </>
          )}
          <Link className="secondary" to="/coach/development">
            Przerwa — postęp jest zapisany
          </Link>
          <button className="secondary" onClick={() => setConfirm(true)}>
            Przerwij trening meczowy
          </button>
          {confirm && (
            <section className="notice">
              <p>Usunąć rozpoczęty szkic? Ukończona historia pozostanie.</p>
              <div className="notice-actions">
                <button
                  className="danger"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      await save({
                        ...state,
                        situations: {
                          ...state.situations,
                          matchDraft: undefined,
                        },
                      })
                    )
                      setConfirm(false);
                  }}
                >
                  Tak, przerwij
                </button>
                <button className="secondary" onClick={() => setConfirm(false)}>
                  Wróć do meczu
                </button>
              </div>
            </section>
          )}
        </>
      )}
      {!m && last && (
        <section className="card">
          <h2>Ostatni trening zapisany</h2>
          <p>
            {last.ends.length} rozgrywek · wynik {matchScore(last).join(" : ")}
            {matchScore(last).some((n) => n >= 13)
              ? " · osiągnięto 13 punktów"
              : " · ukończono zestaw sytuacji"}
            .
          </p>
          <p>Wynik opisuje Twoją symulację, a nie poziom taktyczny.</p>
        </section>
      )}
      <details className="rules-notes">
        <summary>
          Historia treningów meczowych (
          {state.situations?.matchHistory?.length ?? 0})
        </summary>
        {[...(state.situations?.matchHistory ?? [])].reverse().map((m) => (
          <section key={m.id}>
            <h2>
              {new Date(m.completedAt!).toLocaleDateString("pl-PL")} ·{" "}
              {matchScore(m).join(" : ")}
            </h2>
            <ol>
              {m.ends.map((e, i) => {
                const c = tacticCases.find((c) => c.id === e.scenarioId)!;
                return (
                  <li key={i}>
                    {c.title}: {c.options[e.choice]?.title} · punkty{" "}
                    {e.ownPoints}:{e.opponentPoints}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </details>
      <Link className="secondary" to="/adventure/tactics">
        Biblioteka plansz taktycznych
      </Link>
    </div>
  );
}
export function BossTests() {
  const { state, save, busy } = useApp(),
    navigate = useNavigate();
  return (
    <div className="coach-page">
      <Back />
      <AdventureHeading
        title="Sprawdziany rozdziałów"
        subtitle="Każde 5 ukończonych misji otwiera próbę kończącą rozdział."
      />
      <p className="notice">
        10 kul, cel 6 trafień. Wynik zapisujesz po pełnej serii; bez cofania.
        Zaliczenia pozostają zapisane. To dodatkowy sprawdzian — nie blokuje
        wcześniejszej ścieżki misji.
      </p>
      {state.adventure?.config?.audience !== "junior" && (
        <Link className="button" to="/adventure">
          Wybierz plan krótkich serii
        </Link>
      )}
      {bossChapters.map((c, i) => {
        const p = bossProgress(state, i);
        return (
          <section className="card config" key={c.id}>
            <p className="eyebrow">
              ROZDZIAŁ {i + 1} ·{" "}
              {p.passed
                ? "SPRAWDZIAN ZALICZONY ✓"
                : p.unlocked
                  ? "SPRAWDZIAN DOSTĘPNY"
                  : "UKOŃCZ SERIE ROZDZIAŁU"}
            </p>
            <h2>{c.title}</h2>
            <p>
              10 kul · 6 {c.metric} · {p.count}/{p.required} misji.
            </p>
            <p>
              {p.available
                ? "Te same warunki przy każdym podejściu: drobny żwir i średni poziom."
                : "Ten rozdział wymaga dłuższego planu krótkich serii."}
            </p>
            <button
              className="button"
              disabled={busy || !!state.draft || !p.unlocked}
              onClick={async () => {
                if (await save({ ...state, draft: createBoss(state, i) }))
                  navigate("/session");
              }}
            >
              {p.passed
                ? "Powtórz Sprawdzian rozdziału"
                : "Zacznij Sprawdzian rozdziału"}
            </button>
          </section>
        );
      })}
      {state.draft && (
        <Link className="button" to="/session">
          Wznów otwartą sesję
        </Link>
      )}
      <Link className="secondary" to="/adventure/missions">
        Mapa misji
      </Link>
    </div>
  );
}
export function ExtraChallenges() {
  const { state, save, busy } = useApp(),
    navigate = useNavigate();
  const today = localDay(new Date()),
    daily =
      state.situations?.dailyResults?.find((r) => r.day === today) ??
      state.sessions
        .filter(
          (s) =>
            s.completedAt &&
            s.challenge?.kind === "daily" &&
            s.challenge.id === today,
        )
        .map((s) => ({ hit: s.results[0]?.hit, sessionId: s.id }))[0];
  const [error, setError] = useState("");
  const cards: {
    kind: Exclude<SessionChallenge["kind"], "boss">;
    title: string;
    text: string;
  }[] = [
    {
      kind: "daily",
      title: "Jedna kula dnia",
      text: "Jedna próba w kole o średnicy 50 cm. Dystans 8 m, krótka seria 7 m. Bez cofania. Nie zastępuje pełnego treningu i nie daje XP.",
    },
    {
      kind: "ladder",
      title: "Drabinka dystansów",
      text: "10 puent w kole o średnicy 75 cm. Kolejno 6–10 m, krótka seria 6–7 m. Cel: 7/10. Plan pozostaje po odświeżeniu.",
    },
    {
      kind: "pressure",
      title: "Presja 2/3",
      text: "9 strzałów w trzech seriach. W każdej cel 2/3 trafień z usunięciem kuli. Dystans 8 m, krótka seria 7 m. Po błędzie wróć do rutyny.",
    },
  ];
  return (
    <div className="coach-page">
      <Back />
      <AdventureHeading
        title="Wyzwania własne"
        subtitle="Porównuj się ze sobą. Wybierz jedno zadanie, bez presji codziennego treningu."
      />
      {error && <p role="alert">{error}</p>}
      {cards.map((c) => (
        <section className="card config" key={c.kind}>
          <h2>{c.title}</h2>
          <p>{c.text}</p>
          {c.kind === "daily" && daily && (
            <p className="success">
              Kula dnia zapisana: {daily.hit ? "trafienie" : "nietrafiona"}.
              Kolejna próba jutro; odpoczynek jest w porządku.
            </p>
          )}
          {state.awards?.some((a) => a.id === `${c.kind}:${c.kind}`) && (
            <p className="success">Wyzwanie zaliczone ✓</p>
          )}
          <button
            className="button"
            disabled={busy || !!state.draft || (c.kind === "daily" && !!daily)}
            onClick={async () => {
              try {
                if (
                  await save({
                    ...state,
                    draft: createExtraChallenge(state, c.kind),
                  })
                )
                  navigate("/session");
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Nie udało się rozpocząć.",
                );
              }
            }}
          >
            Zacznij: {c.title}
          </button>
        </section>
      ))}
      {state.draft && (
        <Link className="button" to="/session">
          Wznów otwartą sesję
        </Link>
      )}
      <Link className="secondary" to="/coach/challenge">
        Pokonaj siebie w tych samych warunkach
      </Link>
    </div>
  );
}
