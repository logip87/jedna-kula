import { Link } from "react-router-dom";
import { ArrowRight, Trophy } from "lucide-react";
import { useApp } from "../../app-context";
import { type Session } from "../../domain";
import {
  conditionKey,
  modeNames,
  personalBest,
  previousBenchmark,
  recommendation,
  trends,
} from "./model";
export function ResultInsights({ session }: { session: Session }) {
  const { state } = useApp();
  const record = personalBest(session, state.sessions);
  const benchmark = previousBenchmark(session, state.sessions);
  const eligible = state.sessions.filter(
    (s) =>
      s.id !== session.id &&
      s.kind !== "test" &&
      s.completedAt &&
      s.completedAt <= (session.completedAt ?? session.startedAt),
  );
  const groups = [
    ...new Map(
      session.results.map((a) => [`${a.mode}:${a.distance}`, a]),
    ).values(),
  ];
  const combined = {
    ...state,
    sessions: [
      ...state.sessions.filter((s) => s.id !== session.id),
      {
        ...session,
        completedAt: session.completedAt ?? new Date().toISOString(),
      },
    ],
  };
  const r = recommendation(combined);
  return (
    <section className="card coach-insights">
      <h2>Co mówi ten wynik?</h2>
      {record && (
        <div className="success">
          <Trophy size={20} />
          <div>
            <b>Personal Best</b>
            {record.records.map((r) => (
              <p key={r.label}>
                {r.label}: {r.previous} → {r.value}
              </p>
            ))}
          </div>
        </div>
      )}
      {session.kind === "test" && (
        <>
          <p>
            Test ·{" "}
            {session.results.length === session.plan.length
              ? "pełny benchmark"
              : "niepełna seria — nie jest benchmarkiem"}
          </p>
          {benchmark ? (
            benchmark.map((b) => (
              <p key={b.distance}>
                {b.distance} m: {b.before}% → {b.after}% ·{" "}
                {b.delta > 0 ? "+" : ""}
                {b.delta} pp
              </p>
            ))
          ) : (
            <p>
              Pierwszy pełny test w tych warunkach wyznaczy punkt odniesienia.
            </p>
          )}
        </>
      )}
      {session.kind !== "test" &&
        groups.map((a) => {
          const t = trends(
            [...eligible, session],
            a.mode,
            a.distance,
            conditionKey(session, a.mode, a.distance),
          );
          return (
            <p key={`${a.mode}:${a.distance}`}>
              {modeNames[a.mode]} {a.distance} m ·{" "}
              {t
                ? `${t.label}: ${t.previous}% → ${t.recent}% (${t.delta > 0 ? "+" : ""}${t.delta} pp)`
                : "Za mało danych na trend: potrzeba 5 + 5 sesji w tych samych warunkach."}
            </p>
          );
        })}
      <p>
        <b>Następny krok:</b> {modeNames[r.mode]} {r.distance} m. {r.reason}
      </p>
      <Link className="secondary" to="/coach/generator">
        Ułóż kolejny trening <ArrowRight size={17} />
      </Link>
    </section>
  );
}
