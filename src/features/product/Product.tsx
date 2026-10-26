import { TestSummary } from "../coaching/TestSummary";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../app-context";
import type { Session } from "../../domain";
import { summaryEvidence } from "./model";
import {
  enableMeasurement,
  measurementChoiceMade,
  measurementEnabled,
  productCounters,
  recordEvent,
  trackEvent,
} from "./analytics";
export function AnalyticsConsent() {
  const [visible, setVisible] = useState(() => !measurementChoiceMade());
  if (!visible) return null;
  return (
    <section className="notice" aria-label="Anonimowa analityka beta">
      <p>
        Podczas testów zbieramy anonimowe informacje o użyciu aplikacji, aby
        poprawiać jej działanie. Nie zbieramy wyników treningowych ani danych
        osobowych.
      </p>
      <button className="secondary" onClick={() => { enableMeasurement(true); trackEvent("app_open"); setVisible(false); }}>
        Pomóż anonimowo
      </button>
      <button className="text-link" onClick={() => { enableMeasurement(false); setVisible(false); }}>
        Nie teraz
      </button>
    </section>
  );
}
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
      <h2>Anonimowy pomiar użycia w becie</h2>
      <p>
        Opcjonalne, anonimowe zdarzenia o otwarciach i użyciu modułów. Bez
        imienia, wieku, profilu, wyników, historii, e-maila, lokalizacji i
        fingerprintingu. Losowy identyfikator służy wyłącznie do odróżniania
        anonimowej instalacji; zdarzenia wysyłamy do Jednej Kuli po odzyskaniu
        sieci.
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
        Zbieraj anonimowe dane o użyciu
      </label>
      <p className="muted small">
        Wyłączenie usuwa lokalną kolejkę i liczniki. Nie są częścią kopii
        treningów.
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
