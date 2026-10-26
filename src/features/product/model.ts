import { drills } from "../../data";
import {
  percent,
  successfulAttempt,
  isCompleteSession,
  type Mode,
  type Session,
  type State,
} from "../../domain";
import {
  comparableSessions,
  conditionDrillId,
  conditionKey,
  createRecommendedSession,
  modeNames,
  personalBest,
  recommendation,
  weaknesses,
} from "../coaching/model";
const complete = isCompleteSession;
export const historySessions = (state: State) =>
  state.sessions
    .filter((s) => s.completedAt)
    .sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!));
export function sessionOutcome(session: Session) {
  const hits = session.results.filter(successfulAttempt).length;
  const distances = [
    ...new Set(
      (session.results.length ? session.results : session.plan).map(
        (a) => a.distance,
      ),
    ),
  ].sort((a, b) => a - b);
  return {
    hits,
    rate: percent(hits, session.results.length),
    distances: distances.map((d) => `${d} m`).join(", "),
    metric:
      session.results.length && session.results.every((a) => a.mode === "lob")
        ? "trafień w lądowanie"
        : "trafień",
  };
}
export function comparableBaseline(session: Session, history: Session[]) {
  if (!session.plan.length || session.results.length !== session.plan.length)
    return null;
  const previous = comparableSessions(session, history).slice(-5);
  const attempts = previous.flatMap((s) => s.results);
  return previous.length >= 2 && attempts.length >= 20
    ? percent(attempts.filter(successfulAttempt).length, attempts.length)
    : null;
}
export function progressResults(state: State, now = new Date()) {
  const sessions = historySessions(state).filter(
    (s) =>
      Date.parse(s.completedAt!) <= now.getTime() &&
      complete(s) &&
      s.kind !== "test" &&
      !s.mastery &&
      !s.challenge,
  );
  const groups = new Map<
    string,
    {
      drillId: string;
      mode: Mode;
      distance: number;
      hits: number;
      count: number;
    }
  >();
  for (const s of sessions)
    for (const a of s.results) {
      const drillId = conditionDrillId(s, a.mode);
      const key = `${drillId}:${a.mode}:${a.distance}`;
      const group = groups.get(key) ?? {
        drillId,
        mode: a.mode,
        distance: a.distance,
        hits: 0,
        count: 0,
      };
      group.hits += Number(successfulAttempt(a));
      group.count++;
      groups.set(key, group);
    }
  return {
    recent: sessions.slice(0, 7).reverse(),
    areas: [...groups.entries()]
      .map(([key, group]) => ({
        ...group,
        key,
        rate: percent(group.hits, group.count),
      }))
      .sort(
        (a, b) =>
          a.mode.localeCompare(b.mode) ||
          a.drillId.localeCompare(b.drillId) ||
          a.distance - b.distance,
      ),
  };
}
export const technicalSessions = (state: State, now = new Date()) =>
  state.sessions
    .filter(
      (s) =>
        complete(s) &&
        !s.mastery &&
        !s.challenge &&
        Date.parse(s.completedAt!) <= now.getTime(),
    )
    .sort((a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!));
export type DistanceAdaptation = {
  mode: Mode;
  sourceSession: Session;
  kind: "harder" | "easier";
  distance: number;
  pressure: boolean;
  rate: number;
  evidence: string;
  reason: string;
  change: string;
};
// Kept as a harmless compatibility export for older links and saved UI state.
// Distance changes are no longer proposed by the product.
export function adaptation(
  _state: State,
  _now = new Date(),
): DistanceAdaptation | null {
  return null;
}
export function acceptedAdaptation(_state: State, _now = new Date()): Session {
  throw new Error("Aplikacja nie proponuje już zmiany dystansu.");
}
export function mentalRecommendation(state: State, now = new Date()) {
  const sessions = technicalSessions(state, now)
    .filter((s) => s.kind !== "test")
    .slice(-5);
  const checked = sessions.filter((s) => typeof s.routineUsed === "boolean");
  if (checked.length === 5 && checked.filter((s) => s.routineUsed).length <= 2)
    return {
      id: "routine",
      lessonId: "routine",
      reason: `W ostatnich 5 pełnych treningach użyłeś rutyny ${checked.filter((s) => s.routineUsed).length} razy.`,
      instruction:
        "2 min: wybierz cel i zagranie. Spokojny wydech. Trzy ruchy rzutu bez kuli. Po każdym zanotuj jeden fakt i przygotuj kolejne zadanie.",
    };
  const tension =
    state.coaching?.practiceHistory
      ?.filter(
        (p) =>
          p.kind === "mental" &&
          p.completedAt &&
          Date.parse(p.completedAt) <= now.getTime() &&
          Date.parse(p.completedAt) >= now.getTime() - 14 * 86400000,
      )
      .sort((a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!))
      .slice(-3) ?? [];
  const stressed = sessions.filter(
    (s) =>
      s.stressLevel === "zestresowany" ||
      s.stressLevel === "bardzo zestresowany",
  );
  const highTension =
    tension.length === 3 && tension.every((p) => (p.checkin?.before ?? 0) >= 4);
  if ((sessions.length === 5 && stressed.length >= 3) || highTension)
    return {
      id: "tension",
      lessonId: "mistake",
      reason: highTension
        ? "W trzech ostatnich modułach zaznaczyłeś napięcie 4–5/5."
        : `W ${stressed.length} z 5 treningów zaznaczyłeś większy stres.`,
      instruction:
        "2 min: zauważ napięcie bez oceniania. Jeden spokojny oddech. Rozluźnij chwyt i barki. Nazwij zadanie następnej kuli.",
    };
  const isPressure = (s: Session) =>
    !!drills.find((d) => d.id === s.drillId)?.pressure ||
    s.challenge?.kind === "pressure" ||
    s.trainingPlan?.focus === "presja";
  const pressure = state.sessions
    .filter(
      (s) =>
        complete(s) &&
        s.kind !== "test" &&
        !s.mastery &&
        (!s.challenge || s.challenge.kind === "pressure") &&
        Date.parse(s.completedAt!) <= now.getTime() &&
        Date.parse(s.completedAt!) >= now.getTime() - 30 * 86400000,
    )
    .slice(-12);
  for (const p of pressure.filter(isPressure)) {
    const similar = pressure.filter(
      (s) =>
        s.difficulty === p.difficulty &&
        s.targetSize === p.targetSize &&
        s.boundary === p.boundary &&
        s.plan.every(
          (a) => a.mode === p.plan[0].mode && a.distance === p.plan[0].distance,
        ),
    );
    const under = similar.filter(isPressure),
      regular = similar.filter((s) => !isPressure(s));
    const rate = (g: Session[]) => {
      const a = g.flatMap((s) => s.results);
      return a.length >= 20 && g.length >= 2
        ? percent(a.filter(successfulAttempt).length, a.length)
        : null;
    };
    const a = rate(regular),
      b = rate(under);
    if (a !== null && b !== null && a >= 60 && a - b >= 15)
      return {
        id: "pressure",
        lessonId: "one",
        reason: `Na tym samym dystansie i przy tych samych ustawieniach: ${a}% w zwykłych seriach, ${b}% pod presją. To różnica wyników, nie diagnoza.`,
        instruction:
          "2 min reset: zauważ wynik, zaakceptuj go, spokojny oddech, nazwij następne zadanie. Potem krótka seria z pełną rutyną.",
      };
  }
  return null;
}
export function dailyTraining(state: State, now = new Date()): Session {
  const s = createRecommendedSession(state, now),
    mental = mentalRecommendation(state, now);
  if (!mental) return s;
  return {
    ...s,
    coach: { source: "recommended" },
    trainingPlan: {
      minutes: 20,
      focus: "słabości",
      index: 0,
      blocks: [
        {
          title: "Rutyna przed serią",
          instruction: mental.instruction,
          kind: "mental",
          minutes: 2,
          start: 0,
          end: 0,
        },
        {
          title: "Twój trening",
          instruction:
            "Pełna rutyna przy każdym rzucie. Zapisz wynik, potem wróć do Dzisiaj.",
          kind: "throws",
          minutes: 16,
          start: 0,
          end: s.plan.length,
        },
        {
          title: "Mental reset",
          instruction:
            "Zauważ wynik. Nazwij jedną rzecz, którą zabierzesz do następnej sesji.",
          kind: "mental",
          minutes: 2,
          start: s.plan.length,
          end: s.plan.length,
        },
      ],
    },
  };
}
export function summaryEvidence(session: Session, state: State) {
  const history = state.sessions.filter((s) => s.id !== session.id);
  const { hits, rate } = sessionOutcome(session);
  const baseline = comparableBaseline(session, history);
  const groups = [
    ...new Set(session.results.map((a) => `${a.mode}:${a.distance}`)),
  ]
    .map((key) => {
      const a = session.results.filter(
        (a) => `${a.mode}:${a.distance}` === key,
      );
      return {
        key,
        label: `${modeNames[a[0].mode]} ${a[0].distance} m`,
        samples: a.length,
        rate: percent(a.filter(successfulAttempt).length, a.length),
      };
    })
    .filter((g) => g.samples >= 3)
    .sort((a, b) => b.rate - a.rate || a.key.localeCompare(b.key));
  const reference = history.find(
      (s) => s.id === session.coach?.referenceSessionId,
    ),
    self =
      reference &&
      complete(reference) &&
      comparableSessions(
        {
          ...session,
          completedAt: session.completedAt ?? new Date().toISOString(),
        },
        history,
      ).some((s) => s.id === reference.id)
        ? {
            before: reference.results.filter(successfulAttempt).length,
            delta: hits - reference.results.filter(successfulAttempt).length,
          }
        : null;
  const combined = {
    ...state,
    sessions: [
      ...history,
      {
        ...session,
        completedAt: session.completedAt ?? new Date().toISOString(),
      },
    ],
  };
  return {
    hits,
    rate,
    baseline,
    best: groups[0] ?? null,
    weakest:
      groups.length > 1 && groups.at(-1)!.rate < groups[0].rate
        ? groups.at(-1)!
        : null,
    record: personalBest(session, history),
    self,
    next: recommendation(combined),
  };
}
export function progressEvidence(state: State, now = new Date()) {
  const r = recommendation(state, now);
  if (!r.session)
    return "Po pierwszych porównywalnych sesjach pokażemy, co się zmienia.";
  const w = weaknesses(state, now).find(
    (w) => w.key === conditionKey(r.session!, r.mode, r.distance),
  );
  return w?.trend
    ? `${modeNames[r.mode]} ${r.distance} m: ${w.trend.previous}% → ${w.trend.recent}% (${w.trend.delta > 0 ? "+" : ""}${w.trend.delta} pp).`
    : `Punkt odniesienia: ${modeNames[r.mode]} ${r.distance} m · ${r.rate}% z ${r.count} prób. Na trend potrzeba 5 + 5 porównywalnych sesji.`;
}

export function dashboardEvidence(state: State, now = new Date()) {
  const sessions = historySessions(state).filter(
    (s) =>
      Date.parse(s.completedAt!) <= now.getTime() &&
      s.kind !== "test" &&
      !s.mastery &&
      !s.challenge,
  );
  const areas = weaknesses(state, now)
    .filter((a) => a.session.kind !== "test")
    .sort((a, b) => b.rate - a.rate || a.key.localeCompare(b.key));
  const improving = areas
    .filter((a) => a.trend && a.trend.delta > 0)
    .sort(
      (a, b) => b.trend!.delta - a.trend!.delta || a.key.localeCompare(b.key),
    );
  return {
    recent: sessions.slice(0, 3),
    strongest: areas[0] ?? null,
    weakest:
      areas.length > 1 && areas.at(-1)!.rate < areas[0].rate
        ? areas.at(-1)!
        : null,
    progress: improving[0] ?? null,
  };
}
