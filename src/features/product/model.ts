import { drills } from "../../data";
import {
  progressionThreshold,
  progressionSessions,
  progressionAttempts,
  progressionWindowDays,
} from "./progression";
import {
  percent,
  successfulAttempt,
  type Mode,
  type Session,
  type State,
} from "../../domain";
import {
  comparableSessions,
  conditionKey,
  createRecommendedSession,
  modeNames,
  personalBest,
  recommendation,
  weaknesses,
} from "../coaching/model";
const complete = (s: Session) =>
  !!s.completedAt && s.plan.length > 0 && s.results.length === s.plan.length;
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
      s.kind !== "test" &&
      !s.mastery &&
      !s.challenge,
  );
  const groups = new Map<
    string,
    { mode: Mode; distance: number; hits: number; count: number }
  >();
  for (const s of sessions)
    for (const a of s.results) {
      const key = `${a.mode}:${a.distance}`;
      const group = groups.get(key) ?? {
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
      .sort((a, b) => a.mode.localeCompare(b.mode) || a.distance - b.distance),
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
function easierAcrossDistances(state: State, now: Date, preferredMode: Mode) {
  const maximum =
    (state.player?.audience ?? state.adventure?.config?.audience) === "junior"
      ? 7
      : 10;
  const families = new Map<
    string,
    { mode: Mode; distances: Map<number, Session[]> }
  >();
  for (const s of technicalSessions(state, now)) {
    if (s.kind === "test" || drills.find((d) => d.id === s.drillId)?.test)
      continue;
    for (const variant of new Map(
      s.results.map((a) => [`${a.mode}:${a.distance}`, a]),
    ).values()) {
      if (variant.distance > maximum) continue;
      const key = conditionKey(s, variant.mode, 0);
      const family = families.get(key) ?? {
        mode: variant.mode,
        distances: new Map<number, Session[]>(),
      };
      const sessions = family.distances.get(variant.distance) ?? [];
      sessions.push(s);
      family.distances.set(variant.distance, sessions);
      families.set(key, family);
    }
  }
  const candidates = [...families.entries()].flatMap(([key, family]) => {
    const difficult = [...family.distances.entries()]
      .flatMap(([distance, history]) => {
        const recent = history.slice(-progressionSessions);
        if (
          recent.length < progressionSessions ||
          Date.parse(recent[0].completedAt!) <
            now.getTime() - progressionWindowDays * 86400000
        )
          return [];
        const attempts = recent.map((s) =>
          s.results.filter(
            (a) => a.mode === family.mode && a.distance === distance,
          ),
        );
        if (
          attempts.some(
            (a) =>
              a.length < progressionAttempts ||
              percent(a.filter(successfulAttempt).length, a.length) >= 35,
          )
        )
          return [];
        return [{ distance, recent, attempts: attempts.flat() }];
      })
      .sort((a, b) => a.distance - b.distance);
    if (difficult.length < 2 || difficult[0].distance <= 5) return [];
    const source = difficult[0].recent.at(-1)!;
    const attempts = difficult.flatMap((d) => d.attempts);
    return [
      {
        key,
        mode: family.mode,
        sourceSession: source,
        kind: "easier" as const,
        distance: difficult[0].distance - 1,
        pressure: false,
        rate: percent(
          attempts.filter(successfulAttempt).length,
          attempts.length,
        ),
        reason: `${modeNames[family.mode]}: na dystansach ${difficult.map((d) => `${d.distance} m`).join(", ")} ostatnie serie są nadal bardzo trudne. Spróbuj bliżej i odbuduj powtarzalność.`,
        evidence: `Po ${progressionSessions} ostatnie pełne serie na każdym z ${difficult.length} dystansów, każda poniżej 35% skuteczności. Łącznie ${attempts.length} prób z ostatnich ${progressionWindowDays} dni.`,
        change: `${modeNames[family.mode]}: ${difficult[0].distance} m → ${difficult[0].distance - 1} m. Cel i teren pozostają takie same.`,
      },
    ];
  });
  candidates.sort(
    (a, b) =>
      Number(b.mode === preferredMode) - Number(a.mode === preferredMode) ||
      Date.parse(b.sourceSession.completedAt!) -
        Date.parse(a.sourceSession.completedAt!) ||
      a.key.localeCompare(b.key),
  );
  return candidates[0] ?? null;
}

export function adaptation(state: State, now = new Date()) {
  const r = recommendation(state, now);
  const foundation = easierAcrossDistances(state, now, r.mode);
  if (foundation) return foundation;
  if (!r.session || r.session.kind === "test") return null;
  const group = technicalSessions(state, now)
    .filter(
      (s) =>
        s.results.some((a) => a.mode === r.mode && a.distance === r.distance) &&
        conditionKey(s, r.mode, r.distance) ===
          conditionKey(r.session!, r.mode, r.distance),
    )
    .slice(-progressionSessions);
  const counts = group.map((s) =>
    s.results.filter((a) => a.mode === r.mode && a.distance === r.distance),
  );
  if (
    group.length < progressionSessions ||
    counts.some((a) => a.length < progressionAttempts) ||
    Date.parse(group[0].completedAt!) <
      now.getTime() - progressionWindowDays * 86400000
  )
    return null;
  const rates = counts.map((a) =>
    percent(a.filter(successfulAttempt).length, a.length),
  );
  const kind: "harder" | "easier" | null = rates.every(
    (n) => n >= progressionThreshold(r.distance),
  )
    ? "harder"
    : rates.every((n) => n < 35)
      ? "easier"
      : null;
  if (!kind) return null;
  const max =
    (state.player?.audience ?? state.adventure?.config?.audience) === "junior"
      ? 7
      : 10;
  const distance =
    kind === "harder"
      ? Math.min(max, r.distance + 1)
      : Math.max(5, r.distance - 1);
  if (kind === "easier" && distance === r.distance) return null;
  const pressure = kind === "harder" && distance === r.distance;
  return {
    mode: r.mode,
    sourceSession: r.session,
    kind,
    distance,
    pressure,
    rate: Math.round(rates.reduce((a, b) => a + b, 0) / progressionSessions),
    evidence: `Trzy ostatnie porównywalne serie, minimum 30 prób: ${Math.round(rates.reduce((a, b) => a + b, 0) / progressionSessions)}%.`,
    reason:
      kind === "harder"
        ? "Ten trening robi się dla Ciebie łatwy."
        : "Ten wariant jest obecnie bardzo trudny. Spróbujmy zbudować podstawę.",
    change: pressure
      ? "Ta sama odległość, jedna próba na ustawienie, bez cofania."
      : `${r.distance} m → ${distance} m. Cel i teren pozostają takie same.`,
  };
}
export function acceptedAdaptation(state: State, now = new Date()): Session {
  const proposal = adaptation(state, now);
  if (!proposal) throw new Error("Za mało porównywalnych wyników do zmiany.");
  const s = createRecommendedSession(state, now);
  return {
    ...s,
    drillId: proposal.sourceSession.drillId,
    difficulty: proposal.sourceSession.difficulty,
    targetSize: proposal.sourceSession.targetSize,
    boundary: proposal.sourceSession.boundary,
    surface: proposal.sourceSession.surface,
    plan: Array.from({ length: 20 }, () => ({
      mode: proposal.mode,
      distance: proposal.distance,
    })),
    coach: {
      source: "adaptive",
      adaptation: proposal.kind,
      oneChance: proposal.pressure,
    },
  };
}
export function mentalRecommendation(state: State, now = new Date()) {
  const sessions = technicalSessions(state, now)
    .filter((s) => s.kind !== "test")
    .slice(-5);
  const checked = sessions.filter((s) => typeof s.routineUsed === "boolean");
  if (checked.length === 5 && checked.filter((s) => s.routineUsed).length <= 2)
    return {
      id: "routine",
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
      .slice(-3) ?? [];
  const stressed = sessions.filter(
    (s) =>
      s.stressLevel === "zestresowany" ||
      s.stressLevel === "bardzo zestresowany",
  );
  if (
    (sessions.length === 5 && stressed.length >= 3) ||
    (tension.length === 3 &&
      tension.every((p) => (p.checkin?.before ?? 0) >= 4))
  )
    return {
      id: "tension",
      reason:
        tension.length === 3
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
        s.surface === p.surface &&
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
