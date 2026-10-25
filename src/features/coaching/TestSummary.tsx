import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../app-context";
import type { Session } from "../../domain";
import {
  fullTest,
  testEvidence,
  testHits,
  testDueDate,
  sessionFromTest,
} from "./benchmarks";
import { modeNames } from "./model";
import { surfaces } from "../adventure/model";

export function TestSummary({ session }: { session: Session }) {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const [planned, setPlanned] = useState(false);
  const e = testEvidence(session, state.sessions);
  async function practice() {
    if (state.draft) {
      navigate("/session");
      return;
    }
    if (await save({ ...state, draft: sessionFromTest(session, true) }))
      navigate("/session");
  }
  async function plan() {
    const dismissed = { ...state.dismissedTestReminders };
    delete dismissed[session.drillId];
    if (await save({ ...state, dismissedTestReminders: dismissed }))
      setPlanned(true);
  }
  const latest = state.sessions
    .filter(
      (s) => s.drillId === session.drillId && s.completedAt && fullTest(s),
    )
    .sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!))[0];
  return (
    <section className="product-summary" aria-label="Podsumowanie testu">
      <div className="summary-hero">
        <p className="eyebrow">
          TEST ·{" "}
          {session.plan[0]?.mode === "lob" ? "PIERWSZE LĄDOWANIE" : "TRAFIENIA"}
        </p>
        <strong>
          {e.hits} / {session.results.length}
        </strong>
        <p>
          {session.results.length
            ? Math.round((e.hits / session.results.length) * 100)
            : 0}
          % skuteczności
        </p>
      </div>
      <p role="status">{e.message}</p>
      {e.complete && (
        <section className="card">
          <h2>Zmiana i rekord</h2>
          <p>
            {e.last
              ? `Poprzednio ${testHits(e.last)}/20 → teraz ${e.hits}/20 (${e.delta! > 0 ? "+" : ""}${e.delta} trafień).`
              : "Pierwszy pełny test w tych warunkach."}
          </p>
          <p>
            Rekord w tych warunkach: {e.best}/20
            {!session.completedAt ? " · po zapisaniu wyniku" : ""}.
          </p>
        </section>
      )}
      <section className="card">
        <h2>Wyniki na dystansach</h2>
        {e.distances
          .filter((d) => d.attempts)
          .map((d) => (
            <p key={d.distance}>
              <b>{d.distance} m:</b>{" "}
              {e.complete && d.before !== null ? `${d.before}/5 → ` : ""}
              {d.hits}/{d.attempts} trafień ·{" "}
              {Math.round((d.hits / d.attempts) * 100)}%
            </p>
          ))}
        {e.complete && new Set(e.distances.map((d) => d.hits)).size === 1 && (
          <p>Równy wynik na wszystkich dystansach.</p>
        )}
        <p className="muted small">
          Jeden rzut na dystansie zmienia wynik o 20 punktów procentowych.
          Pojedyncza seria nie przesądza o trwałym postępie.
        </p>
      </section>
      {!!e.history.length && (
        <section className="card">
          <h2>Ostatnie porównywalne testy · do 5 prób</h2>
          <ul>
            {e.history.map((s) => (
              <li key={s.id}>
                {s.completedAt ? (
                  <Link to={`/history/${s.id}`}>
                    {new Date(s.completedAt).toLocaleDateString("pl-PL")}
                  </Link>
                ) : (
                  "Bieżący · do zapisania"
                )}{" "}
                · {testHits(s)}/20
              </li>
            ))}
          </ul>
        </section>
      )}
      {e.complete && (
        <section className="card">
          <h2>Kolejny krok</h2>
          <p>
            {modeNames[session.plan[0].mode]} na {e.weakest} m · 20 rzutów.{" "}
            {e.hits === 20
              ? "Utrwal pełną skuteczność w osobnym treningu."
              : "Popracuj nad tym elementem przed kolejnym pomiarem."}
          </p>
          <p>
            Teren:{" "}
            {surfaces.find((s) => s.id === session.surface)?.label ??
              "nieoznaczony"}
            . Zachowamy ustawienia celu i terenu.
          </p>
          {!session.completedAt ? (
            <p>
              Zapisz wynik poniżej, aby rozpocząć trening. Przypomnienie o
              teście pojawi się na stronie głównej po 30 dniach od zapisu.
            </p>
          ) : (
            <>
              <button
                className="button"
                disabled={busy}
                onClick={() => void practice()}
              >
                {state.draft ? "Wznów otwartą sesję" : "Trenuj ten element"}
              </button>
              {latest?.id === session.id && (
                <>
                  <button
                    className="secondary"
                    disabled={busy || planned}
                    onClick={() => void plan()}
                  >
                    Zaplanuj kolejny test
                  </button>
                  <p role="status">
                    {planned ? "Zaplanowano. " : ""}Przypomnienie w aplikacji:{" "}
                    {testDueDate(session).toLocaleDateString("pl-PL")} · 30 dni
                    po teście. Bez powiadomień poza aplikacją.
                  </p>
                </>
              )}
            </>
          )}
        </section>
      )}
    </section>
  );
}
