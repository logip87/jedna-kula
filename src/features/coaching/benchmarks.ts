import { successfulAttempt, type Session, type State } from "../../domain";
import { comparableSessions } from "./model";

export const testHits = (s: Session) =>
  s.results.filter(successfulAttempt).length;
export const fullTest = (s: Session) =>
  s.kind === "test" &&
  s.benchmarkVersion === 1 &&
  s.plan.length === 20 &&
  s.results.length === 20;
export function testDueDate(s: Session) {
  const date = new Date(s.completedAt!);
  date.setDate(date.getDate() + 30);
  return date;
}
function calendarDay(date: Date) {
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
}
export function testReminders(state: State, now = new Date()) {
  const latest = new Map<string, Session>();
  for (const s of state.sessions
    .filter(
      (s) =>
        fullTest(s) &&
        s.completedAt &&
        Date.parse(s.completedAt) <= now.getTime(),
    )
    .sort((a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!)))
    latest.set(s.drillId, s);
  return [...latest.values()].flatMap((session) => {
    const days = calendarDay(now) - calendarDay(new Date(session.completedAt!));
    return days >= 30 &&
      state.dismissedTestReminders?.[session.drillId] !== session.id
      ? [{ session, days }]
      : [];
  });
}
export function testEvidence(session: Session, history: Session[]) {
  const previous = comparableSessions(session, history).filter(fullTest);
  const last = previous.at(-1);
  const hits = testHits(session);
  const complete = fullTest(session);
  const delta = last ? hits - testHits(last) : null;
  let streak = hits === 20 ? 1 : 0;
  if (streak)
    for (const s of [...previous].reverse()) {
      if (testHits(s) !== 20) break;
      streak++;
    }
  const message = !complete
    ? "Niepełna seria — zapisz ją jako obserwację. Do porównania potrzebny jest pełny test 20 rzutów."
    : !last
      ? `Masz pierwszy punkt odniesienia w tych warunkach. ${hits === 20 ? "Komplet trafień! Następnym celem jest powtórzenie maksimum." : hits === 0 ? "Zacznij od treningu na 6 m — celem kolejnego testu jest pierwsze trafienie." : "Kolejny test pokaże zmianę."}`
      : hits === 20
        ? `Komplet trafień! ${streak > 1 ? `To ${streak}. kolejny pełny test z wynikiem 20/20. Utrzymujesz powtarzalność.` : "Osiągnąłeś maksimum. Następnym celem jest powtórzenie tego wyniku."}`
        : delta! > 0
          ? `O ${delta} trafień więcej niż poprzednio. Sprawdźmy, czy utrzymasz ten wynik w kolejnym teście.`
          : delta! < 0
            ? "Dziś mniej trafień. Jedna seria nie przekreśla postępu — popracuj nad wybranym elementem i sprawdź kolejny pomiar."
            : hits === 0
              ? "Mamy punkt odniesienia. Zacznij od treningu na 6 m — celem kolejnego testu jest pierwsze trafienie."
              : "Wynik utrzymany. Popracuj nad wybranym dystansem — celem kolejnego testu jest jedno trafienie więcej.";
  const distances = [6, 7, 8, 9].map((distance) => ({
    distance,
    hits: session.results.filter(
      (a) => a.distance === distance && successfulAttempt(a),
    ).length,
    attempts: session.results.filter((a) => a.distance === distance).length,
    before: last
      ? last.results.filter(
          (a) => a.distance === distance && successfulAttempt(a),
        ).length
      : null,
  }));
  const weakest = [...distances].sort(
    (a, b) => a.hits - b.hits || a.distance - b.distance,
  )[0].distance;
  return {
    complete,
    hits,
    last,
    delta,
    message,
    distances,
    weakest,
    best: Math.max(hits, ...previous.map(testHits)),
    history: [...previous, ...(complete ? [session] : [])].slice(-5).reverse(),
  };
}
export function sessionFromTest(
  source: Session,
  practice = false,
  now = new Date(),
): Session {
  const mode = source.plan[0].mode;
  const distance = testEvidence(source, []).weakest;
  return {
    id: crypto.randomUUID(),
    drillId: practice
      ? { shoot: "shoot-basic", target: "target", lob: "lob" }[
          mode as "shoot" | "target" | "lob"
        ]
      : source.drillId,
    kind: practice ? "training" : "test",
    benchmarkVersion: practice ? undefined : 1,
    startedAt: now.toISOString(),
    difficulty: source.difficulty,
    targetSize: source.targetSize,
    boundary: source.boundary,
    surface: source.surface,
    trackDirections: source.trackDirections,
    plan: practice
      ? Array.from({ length: 20 }, () => ({ mode, distance }))
      : structuredClone(source.plan),
    results: [],
    score: 0,
  };
}
