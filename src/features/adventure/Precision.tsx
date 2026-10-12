import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crosshair, Trophy, RotateCcw } from "lucide-react";
import { useApp } from "../../app-context";
import {
  precisionPlan,
  precisionScores,
  precisionTime,
  precisionTotal,
  addPrecisionScore,
  type PrecisionRound,
} from "./model";
import { AdventureBack, AdventureHeading, ShotFigure } from "./ui";
const timeLabel = (ms: number) =>
  `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
const figureTitles = [
  "Kula",
  "Kula za świnką",
  "Kula między kulami",
  "Kula za kulą",
  "Świnka",
];
export function PrecisionTraining() {
  const { state, save, busy } = useApp();
  const [timed, setTimed] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const round = state.adventure?.precisionDraft;
  const history = state.adventure?.precisionHistory ?? [];
  const last = history.at(-1);
  const start = async () => {
    if (round) return;
    await save({
      ...state,
      adventure: {
        ...state.adventure,
        precisionDraft: {
          id: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
          scores: [],
          elapsedMs: 0,
          phase: "ready",
          timed,
        },
      },
    });
  };
  const patch = async (value: PrecisionRound) =>
    save({
      ...state,
      adventure: { ...state.adventure, precisionDraft: value },
    });
  const finish = async (value: PrecisionRound) => {
    if (
      await save({
        ...state,
        adventure: {
          ...state.adventure,
          precisionDraft: undefined,
          precisionHistory: [
            ...history,
            {
              ...value,
              shotStartedAt: undefined,
              completedAt: new Date().toISOString(),
            },
          ],
        },
      })
    )
      setConfirm(false);
  };
  if (!round)
    return (
      <div className="adventure-page">
        <AdventureBack />
        <AdventureHeading
          title="20 strzałów"
          subtitle="5 figur × 4 odległości. Zapisuj 0, 1, 3 lub 5 punktów; maksimum 100."
        />
        {last && (
          <section className="precision-result">
            <Trophy size={32} />
            <p className="eyebrow">
              {last.scores.length === 20
                ? "PEŁNA SERIA"
                : "SERIA ZAKOŃCZONA WCZEŚNIEJ"}
            </p>
            <h2>{precisionTotal(last)} / 100 pkt</h2>
            <p>
              {last.scores.length} / 20 strzałów ·{" "}
              {last.timed ? "z zegarem" : "bez zegara"} · czas przygotowania
              rzutów {timeLabel(last.elapsedMs)}
            </p>
            <p>
              Rekord pełnych serii {last.timed ? "z zegarem" : "bez zegara"}:{" "}
              {Math.max(
                0,
                ...history
                  .filter(
                    (h) => h.scores.length === 20 && h.timed === last.timed,
                  )
                  .map(precisionTotal),
              )}{" "}
              pkt
            </p>
            <div className="precision-breakdown">
              {[1, 2, 3, 4, 5].map((f) => (
                <div key={f}>
                  <b>Figura {f}</b>
                  <span>
                    {last.scores
                      .slice((f - 1) * 4, f * 4)
                      .reduce((a, b) => a + b, 0)}{" "}
                    / 20
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="card">
          <Crosshair size={28} />
          <h2>Ustaw tor</h2>
          <p>
            Koło celu: 1 m. Kółka do rzutu: 50 cm. Odległości 6, 7, 8 i 9 m do
            bliższego brzegu koła celu, nie do kuli.
          </p>
          <p>
            Kule celu i przeszkód: 74 mm / 700 g. Sprawdź ustawienie każdej
            figury w przewodniku.
          </p>
          <label className="adventure-checkbox">
            <input
              type="checkbox"
              checked={timed}
              onChange={(e) => setTimed(e.target.checked)}
            />
            Ćwicz z limitem 15 minut
          </label>
          <p className="muted small">
            Bez zegara uczysz się figur. Z zegarem: „Gotowy do strzału”
            uruchamia pomiar przygotowania, „Rzut oddany” go zatrzymuje.
            Zbieranie kul i wpisywanie wyniku nie zużywa tego czasu. To ręczny
            pomiar treningowy.
          </p>
          <button className="primary" disabled={busy} onClick={start}>
            Rozpocznij serię 20 strzałów
          </button>
        </section>
        <details className="rules-notes">
          <summary>Historia strzału precyzyjnego ({history.length})</summary>
          {history.length ? (
            history
              .slice()
              .reverse()
              .map((h) => (
                <p key={h.id}>
                  {new Date(h.startedAt).toLocaleDateString("pl-PL")} ·{" "}
                  {precisionTotal(h)} pkt · {h.scores.length}/20 ·{" "}
                  {h.timed ? "z zegarem" : "bez zegara"}
                </p>
              ))
          ) : (
            <p>Twoja pierwsza seria pojawi się tutaj po zakończeniu.</p>
          )}
        </details>
        <Link className="secondary" to="/rules/category/shooting">
          Figury i oficjalne źródło: MPSP 03.04.2026
        </Link>
      </div>
    );
  const shot = precisionPlan[round.scores.length];
  const elapsed = precisionTime(round, now);
  const expired = round.timed && elapsed >= 15 * 60000;
  return (
    <div className="adventure-page">
      <AdventureBack />
      <AdventureHeading
        eyebrow={`STRZAŁ ${round.scores.length + 1} / 20`}
        title={`Figura ${shot.figure}: ${figureTitles[shot.figure - 1]}`}
        subtitle={`${shot.distance} m do brzegu koła celu · ${precisionTotal(round)} pkt`}
      />
      <progress
        max={20}
        value={round.scores.length}
        aria-label="Postęp serii strzałów"
      />
      <div className="precision-shot">
        <ShotFigure figure={shot.figure} />
        <div>
          <p className="eyebrow">
            {round.timed ? "POZOSTAŁY CZAS" : "CZAS PRZYGOTOWANIA"}
          </p>
          <strong>
            {timeLabel(
              round.timed ? Math.max(0, 15 * 60000 - elapsed) : elapsed,
            )}
          </strong>
          <p>
            {shot.figure === 5
              ? "Świnka 20 cm od bliższej krawędzi."
              : "Kula celu w środku koła."}
          </p>
          <small>Rzut od dołu. Schemat bez skali.</small>
        </div>
      </div>
      {expired && round.phase !== "score" ? (
        <div className="notice" role="status">
          <h2>Limit czasu minął</h2>
          <p>Zakończ tę serię. Zachowasz wszystkie zapisane wyniki.</p>
          <button
            className="primary"
            disabled={busy}
            onClick={() => finish({ ...round, elapsedMs: elapsed })}
          >
            Zapisz serię po czasie
          </button>
        </div>
      ) : round.phase === "ready" ? (
        <button
          className="primary"
          disabled={busy}
          onClick={() =>
            patch({
              ...round,
              phase: "aim",
              shotStartedAt: new Date().toISOString(),
            })
          }
        >
          Gotowy do strzału
        </button>
      ) : round.phase === "aim" ? (
        <button
          className="primary"
          disabled={busy}
          onClick={() => {
            const elapsed = precisionTime(round);
            return patch({
              ...round,
              phase: round.timed && elapsed > 900000 ? "ready" : "score",
              elapsedMs: elapsed,
              shotStartedAt: undefined,
            });
          }}
        >
          Rzut oddany
        </button>
      ) : (
        <>
          <h2>Wynik strzału</h2>
          <p>
            Pierwsze lądowanie musi być całkowicie wewnątrz koła. Za nieważny
            strzał wpisz 0.
          </p>
          <div className="precision-scores">
            {precisionScores(shot.figure).map((points) => (
              <button
                disabled={busy}
                key={points}
                onClick={async () => {
                  const next = addPrecisionScore(round, points);
                  if (next.scores.length === 20) await finish(next);
                  else await patch(next);
                }}
              >
                <strong>{points}</strong>
                <span>pkt</span>
              </button>
            ))}
          </div>
          {shot.figure === 5 ? (
            <p>
              0: chybienie / nieważny. 3: trafiona świnka w kole. 5: świnka poza
              kołem.
            </p>
          ) : (
            <p>
              1: cel pozostaje w kole lub określony kontakt z przeszkodą. 3: cel
              i rzucana kula poza kołem, bez kontaktu z przeszkodą. 5: cel poza,
              rzucana kula w kole, bez kontaktu z przeszkodą. Sprawdź wyjątki
              figur 2–4.
            </p>
          )}
        </>
      )}
      <Link className="secondary" to="/rules/rule/shoot-points">
        Sprawdź punktację i wyjątki
      </Link>
      {round.scores.length > 0 && round.phase === "ready" && (
        <button
          className="secondary"
          disabled={busy}
          onClick={() =>
            patch({
              ...round,
              scores: round.scores.slice(0, -1),
              phase: "score",
            })
          }
        >
          <RotateCcw size={18} /> Popraw ostatni wynik
        </button>
      )}
      <button className="secondary" onClick={() => setConfirm(true)}>
        Zakończ serię wcześniej
      </button>
      {confirm && (
        <section className="notice">
          <p>
            Zapisz częściową serię albo wróć do kolejnego strzału. Częściowa
            seria nie liczy się do rekordu pełnych serii.
          </p>
          <button
            className="secondary"
            disabled={busy}
            onClick={() =>
              finish({ ...round, elapsedMs: precisionTime(round) })
            }
          >
            Zapisz dotychczasowe strzały
          </button>
          <button className="secondary" onClick={() => setConfirm(false)}>
            Strzelam dalej
          </button>
        </section>
      )}
    </div>
  );
}
