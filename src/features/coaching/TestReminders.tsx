import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../app-context";
import { drills } from "../../data";
import type { Session } from "../../domain";
import { sessionFromTest, testHits, testReminders } from "./benchmarks";
import { surfaces } from "../adventure/model";

export function TestReminders() {
  const { state, save, busy } = useApp();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  async function start(session: Session) {
    if (state.draft) {
      navigate("/session");
      return;
    }
    if (await save({ ...state, draft: sessionFromTest(session) }))
      navigate("/session");
  }
  return (
    <>
      {testReminders(state, now).map(({ session, days }) => (
        <section
          className="card"
          aria-label={`Przypomnienie: ${drills.find((d) => d.id === session.drillId)?.name}`}
          key={session.id}
        >
          <p className="eyebrow">CZAS NA TEST KONTROLNY</p>
          <h2>{drills.find((d) => d.id === session.drillId)?.name}</h2>
          <p>
            Minęło {days} dni od ostatniego pełnego testu. Ostatnio:{" "}
            {testHits(session)}/20. Sprawdź wynik w tych samych warunkach.
          </p>
          <p>
            Teren:{" "}
            {surfaces.find((s) => s.id === session.surface)?.label ??
              "nieoznaczony"}{" "}
            · 20 rzutów · 6–9 m.
          </p>
          <button
            className="button"
            disabled={busy}
            onClick={() => void start(session)}
          >
            {state.draft ? "Wznów otwartą sesję" : "Zrób test"}
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() =>
              void save({
                ...state,
                dismissedTestReminders: {
                  ...state.dismissedTestReminders,
                  [session.drillId]: session.id,
                },
              })
            }
          >
            Pomiń
          </button>
          <p className="muted small">
            „Pomiń” ukrywa to przypomnienie. Kolejny pełny test rozpocznie nowe
            30 dni.
          </p>
        </section>
      ))}
    </>
  );
}
