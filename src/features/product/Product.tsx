import { TestSummary } from "../coaching/TestSummary";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../app-context";
import type { Session } from "../../domain";
import { summaryEvidence } from "./model";
import {
  enableMeasurement,
  measurementEnabled,
  productCounters,
  recordEvent,
} from "./analytics";
export function TrainingSummary({ session }: { session: Session }) {
  return session.kind === "test" ? (
    <TestSummary session={session} />
  ) : (
    <PracticeSummary session={session} />
  );
}
function PracticeSummary({ session }: { session: Session }) {
  const { state } = useApp(),
    e = summaryEvidence(session, state);
  useEffect(() => {
    if (e.record) recordEvent("personal_best_view");
  }, [session.id, !!e.record]);
  return (
    <section className="product-summary" aria-label="Podsumowanie treningu">
      <div className="summary-hero">
        <p className="eyebrow">
          WYNIK ·{" "}
          {session.results.some((a) => a.mode === "lob")
            ? "LOB: PIERWSZE LĄDOWANIE"
            : "TRAFIENIA"}
        </p>
        <strong>
          {e.hits} / {session.results.length}
        </strong>
        <p>{e.rate}% skuteczności</p>
      </div>
      <div className="product-summary-grid">
        <section className="card">
          <h2>Zmiana</h2>
          {session.results.length === session.plan.length &&
          e.baseline !== null ? (
            <p>
              Poprzednie porównywalne treningi: {e.baseline}% → teraz {e.rate}%
              ·{" "}
              <b>
                {e.rate - e.baseline > 0 ? "+" : ""}
                {e.rate - e.baseline} pp
              </b>
            </p>
          ) : (
            <p>
              {session.results.length !== session.plan.length
                ? "Niepełna seria — nie porównujemy jej z pełnymi wynikami."
                : "Potrzebujemy 20 prób z 2 wcześniejszych pełnych sesji w tych samych warunkach."}
            </p>
          )}
        </section>
        {e.best && (
          <section className="card">
            <h2>Najlepiej</h2>
            <p>
              {e.best.label} · {e.best.rate}% · {e.best.samples} prób
            </p>
            {e.weakest && (
              <>
                <h3>Do poprawy</h3>
                <p>
                  {e.weakest.label} · {e.weakest.rate}% · {e.weakest.samples}{" "}
                  prób
                </p>
              </>
            )}
          </section>
        )}
      </div>
      {e.self && session.results.length === session.plan.length && (
        <section className="notice">
          <h2>Pokonaj siebie</h2>
          <p>
            Poprzednio: {e.self.before}/{session.results.length} · teraz{" "}
            {e.hits}/{session.results.length} ·{" "}
            <b>
              {e.self.delta > 0 ? "+" : ""}
              {e.self.delta} względem poprzedniego wyniku.
            </b>
          </p>
        </section>
      )}
      {e.record && (
        <section className="success">
          <b>Personal Best</b>
          <span>
            {e.record.records[0].label}: {e.record.records[0].previous} →{" "}
            {e.record.records[0].value}. Szczegóły poniżej.
          </span>
        </section>
      )}
    </section>
  );
}
export function MeasurementSettings() {
  const [enabled, setEnabled] = useState(measurementEnabled),
    [show, setShow] = useState(false);
  const counts = productCounters();
  return (
    <section className="card config">
      <h2>Pomiar użycia — tylko na tym urządzeniu</h2>
      <p>
        Opcjonalne liczniki otwarć i użycia modułów. Bez imienia, wieku,
        profilu, wyników, historii, identyfikatora użytkownika i
        fingerprintingu. Nic nie wysyłamy na serwer.
      </p>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            enableMeasurement(e.target.checked);
            setEnabled(e.target.checked);
          }}
        />
        Zbieraj lokalne liczniki użycia
      </label>
      <p className="muted small">
        Wyłączenie usuwa liczniki. Zachowujemy najwyżej 90 dni; nie są częścią
        kopii treningów.
      </p>
      <button className="secondary" onClick={() => setShow(!show)}>
        Pokaż lokalne liczniki
      </button>
      {show && (
        <pre className="product-counters">
          {JSON.stringify(counts, null, 2)}
        </pre>
      )}
      <Link className="secondary" to="/">
        Wróć do treningu
      </Link>
    </section>
  );
}
