import {
  localDay,
  percent,
  successfulAttempt,
  type Mode,
  type Session,
  type State,
} from "../../domain";

export const modeNames: Record<Mode, string> = {
  point: "Puenta",
  shoot: "Strzał",
  lob: "Lob",
  boundary: "Puenta przy linii",
  target: "Cel",
};
export const drillForMode: Record<Mode, string> = {
  point: "point-basic",
  shoot: "shoot-basic",
  lob: "lob",
  boundary: "boundary",
  target: "target",
};
export function weekStart(date: Date) {
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return localDay(monday);
}
function previousWeek(week: string) {
  const date = new Date(`${week}T12:00:00`);
  date.setDate(date.getDate() - 7);
  return weekStart(date);
}
export function weeklyProgress(state: State, now = new Date()) {
  const week = weekStart(now);
  const counts = new Map<string, number>();
  for (const s of state.sessions) {
    if (
      !s.completedAt ||
      s.results.length < 6 ||
      (s.results.length !== s.plan.length &&
        !(s.timedPhase === 3 && s.mentalExerciseDone)) ||
      new Date(s.completedAt) > now
    )
      continue;
    const key = weekStart(new Date(s.completedAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const goals = [...(state.coaching?.weeklyGoals ?? [])].sort((a, b) =>
    a.week.localeCompare(b.week),
  );
  const goalAt = (key: string) =>
    goals.filter((g) => g.week <= key).at(-1)?.sessions ?? 2;
  const target = goalAt(week);
  const count = counts.get(week) ?? 0;
  const perfect = count >= target;
  let cursor = perfect ? week : previousWeek(week);
  let streak = 0;
  while ((counts.get(cursor) ?? 0) >= goalAt(cursor)) {
    streak++;
    cursor = previousWeek(cursor);
  }
  return { week, count, target, perfect, streak };
}
export function changeWeeklyGoal(
  state: State,
  target: number,
  now = new Date(),
): State {
  if (!Number.isInteger(target) || target < 1 || target > 7)
    throw new Error("Wybierz 1–7 sesji.");
  const week = weekStart(now);
  return {
    ...state,
    coaching: {
      ...state.coaching,
      weeklyGoals: [
        ...(state.coaching?.weeklyGoals ?? []).filter((g) => g.week !== week),
        { week, sessions: target },
      ],
    },
  };
}
// Keep conditions separate: different targets, terrain or difficulty are not comparable.
export function conditionKey(s: Session, mode: Mode, distance: number) {
  return [
    s.drillId,
    s.kind ?? "training",
    s.mastery?.tier ?? "regular",
    s.challenge?.kind ?? "practice",
    s.challenge?.kind === "boss" ? s.challenge.id : null,
    s.trainingPlan?.focus ?? "practice",
    mode,
    distance,
    s.difficulty,
    s.targetSize,
    s.boundary,
    s.surface ?? "unknown",
  ].join(":");
}
const evidenceSessions = (state: State) =>
  state.sessions
    .filter(
      (s) =>
        s.completedAt &&
        s.results.length &&
        !s.mastery &&
        !s.challenge &&
        (s.kind !== "test" ||
          (s.results.length === s.plan.length && s.benchmarkVersion === 1)),
    )
    .sort(
      (a, b) =>
        new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime(),
    );
export function trends(
  sessions: Session[],
  mode: Mode,
  distance: number,
  key?: string,
  now = new Date(),
) {
  const matching = sessions
    .filter(
      (s) =>
        s.completedAt &&
        Date.parse(s.completedAt) <= now.getTime() &&
        s.results.some((a) => a.mode === mode && a.distance === distance) &&
        (!key || conditionKey(s, mode, distance) === key),
    )
    .sort((a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!));
  if (matching.length < 10) return null;
  const rate = (group: Session[]) => {
    const attempts = group.flatMap((s) =>
      s.results.filter((a) => a.mode === mode && a.distance === distance),
    );
    return {
      count: attempts.length,
      value: percent(
        attempts.filter(successfulAttempt).length,
        attempts.length,
      ),
    };
  };
  const recent = rate(matching.slice(-5));
  const previous = rate(matching.slice(-10, -5));
  if (recent.count < 20 || previous.count < 20) return null;
  const delta = recent.value - previous.value;
  return {
    recent: recent.value,
    previous: previous.value,
    delta,
    label: delta > 5 ? "POPRAWIA SIĘ" : delta < -5 ? "DO POPRAWY" : "STABILNIE",
  };
}
export function weaknesses(state: State, now = new Date()) {
  const sessions = evidenceSessions(state).filter(
    (s) => new Date(s.completedAt!) <= now,
  );
  const groups = new Map<
    string,
    { session: Session; mode: Mode; distance: number; sessions: Session[] }
  >();
  for (const s of sessions)
    for (const a of s.results) {
      if (!["point", "target", "boundary", "shoot", "lob"].includes(a.mode))
        continue;
      if (
        (state.player?.audience ?? state.adventure?.config?.audience) ===
          "junior" &&
        a.distance > 7
      )
        continue;
      const key = conditionKey(s, a.mode, a.distance);
      const g = groups.get(key) ?? {
        session: s,
        mode: a.mode,
        distance: a.distance,
        sessions: [],
      };
      if (!g.sessions.some((x) => x.id === s.id)) g.sessions.push(s);
      g.session = s;
      groups.set(key, g);
    }
  return [...groups.entries()]
    .flatMap(([key, g]) => {
      // Keep the recent sample for each set of comparable conditions. Training
      // another skill must not erase evidence for a neglected one.
      g.sessions = g.sessions.slice(-12);
      const attempts = g.sessions.flatMap((s) =>
        s.results.filter((a) => a.mode === g.mode && a.distance === g.distance),
      );
      if (attempts.length < 20 || g.sessions.length < 2) return [];
      const rate = percent(
        attempts.filter(successfulAttempt).length,
        attempts.length,
      );
      const trend = trends(sessions, g.mode, g.distance, key, now);
      // Rank by the current series rather than one unusually bad day or a
      // long-term average. The displayed rate remains the actual pooled rate.
      const recentRates = g.sessions
        .slice(-5)
        .map((s) => {
          const a = s.results.filter(
            (a) => a.mode === g.mode && a.distance === g.distance,
          );
          return percent(a.filter(successfulAttempt).length, a.length);
        })
        .sort((a, b) => a - b);
      const middle = Math.floor(recentRates.length / 2);
      const currentRate =
        recentRates.length >= 3
          ? recentRates.length % 2
            ? recentRates[middle]
            : (recentRates[middle - 1] + recentRates[middle]) / 2
          : rate;
      const age = Math.max(
        0,
        (now.getTime() - new Date(g.session.completedAt!).getTime()) / 86400000,
      );
      const confidence = Math.min(1, attempts.length / 40);
      const recency = Math.max(0.25, 1 / (1 + age / 30));
      const lackOfPractice = 1 + Math.min(age / 14, 1);
      const importance =
        state.player?.preferredRole ===
        (g.mode === "shoot" ? "strzelec" : "puenter")
          ? 1.15
          : 1;
      const priority =
        (1 -
          currentRate / 100 +
          (trend && trend.delta < -5 && currentRate < trend.previous - 5
            ? 0.1
            : 0)) *
        confidence *
        recency *
        importance *
        lackOfPractice *
        (currentRate < 35 ? 0.25 : currentRate <= 75 ? 1.3 : 0.8);
      const misses = attempts.filter(
        (a) => !a.hit && a.missDirection && a.missDirection !== "center",
      );
      const directions = ["short", "long", "left", "right"] as const;
      const dominant = [...directions].sort(
        (a, b) =>
          misses.filter((x) => x.missDirection === b).length -
          misses.filter((x) => x.missDirection === a).length,
      )[0];
      const landingMisses = attempts.filter(
        (a) =>
          a.mode === "lob" &&
          a.landingHit === false &&
          a.landingDirection &&
          a.landingDirection !== "center",
      );
      const landingDominant = [...directions].sort(
        (a, b) =>
          landingMisses.filter((x) => x.landingDirection === b).length -
          landingMisses.filter((x) => x.landingDirection === a).length,
      )[0];
      const landingCount = landingMisses.filter(
        (a) => a.landingDirection === landingDominant,
      ).length;
      const directionCount = misses.filter(
        (a) => a.missDirection === dominant,
      ).length;
      return [
        {
          ...g,
          key,
          count: attempts.length,
          rate,
          trend,
          priority,
          landingDirection:
            landingMisses.length >= 10 &&
            landingCount / landingMisses.length >= 0.4
              ? {
                  id: landingDominant,
                  rate: percent(landingCount, landingMisses.length),
                  count: landingMisses.length,
                }
              : null,
          direction:
            misses.length >= 10 && directionCount / misses.length >= 0.4
              ? {
                  id: dominant,
                  rate: percent(directionCount, misses.length),
                  count: misses.length,
                }
              : null,
        },
      ];
    })
    .sort((a, b) => b.priority - a.priority || a.key.localeCompare(b.key));
}
export function recommendation(
  state: State,
  now = new Date(),
  maximumDistance = 10,
) {
  const weak = weaknesses(state, now).filter(
    (r) => r.distance <= maximumDistance,
  )[0];
  if (!weak) {
    const hasHistory = evidenceSessions(state).some(
      (s) => Date.parse(s.completedAt!) <= now.getTime(),
    );
    return {
      mode: "point" as Mode,
      distance: 6,
      count: 0,
      rate: null,
      target: null,
      session: null,
      reason: `${hasHistory ? "Zbieramy punkt odniesienia. Powtórz spokojną puentę na 6 m." : "Zacznij od spokojnej puenty na 6 m."} Do oceny wariantu potrzebujemy 20 prób z co najmniej 2 sesji w tych samych warunkach.`,
    };
  }
  const afterBreak =
    now.getTime() - Date.parse(weak.session.completedAt!) >= 30 * 86400000;
  const explanation =
    weak.trend && weak.trend.delta > 5
      ? `Ostatnie porównywalne serie: ${weak.trend.recent}%. Utrwal widoczną poprawę.`
      : weak.rate < 35
        ? "Budujemy podstawę; ten wariant jest jeszcze bardzo trudny."
        : weak.rate > 75
          ? "Utrwal powtarzalność na znanym dystansie."
          : "To priorytet w zakresie trudnym, ale osiągalnym.";
  return {
    ...weak,
    target: Math.min(100, (weak.trend?.recent ?? weak.rate) + 7),
    reason: `${weak.rate}% skuteczności na ${weak.distance} m (${weak.count} prób z ${weak.sessions.length} sesji w tych samych warunkach). ${afterBreak ? "Dawno nie trenowałeś tego wariantu. Wróć do znanych warunków. " : ""}${explanation}${weak.direction ? ` W ${weak.direction.rate}% oznaczonych nietrafionych prób dominują ${weak.direction.id === "short" ? "rzuty za krótkie" : weak.direction.id === "long" ? "rzuty za długie" : weak.direction.id === "left" ? "pudła w lewo" : "pudła w prawo"}.` : ""}`,
  };
}
export function createRecommendedSession(
  state: State,
  now = new Date(),
): Session {
  const r = recommendation(state, now);
  return {
    id: crypto.randomUUID(),
    drillId:
      r.session?.kind !== "test"
        ? (r.session?.drillId ?? drillForMode[r.mode])
        : drillForMode[r.mode],
    kind: "training",
    coach: { source: "recommended" },
    startedAt: now.toISOString(),
    difficulty: r.session?.difficulty ?? "łatwy",
    targetSize: r.session?.targetSize ?? 100,
    boundary: r.session?.boundary ?? 60,
    surface: r.session?.surface,
    plan: Array.from({ length: r.count ? 20 : 6 }, () => ({
      mode: r.mode,
      distance: r.distance,
    })),
    situationChoice: undefined,
    results: [],
    score: 0,
  };
}
export function personalBest(session: Session, history: Session[]) {
  if (!session.plan.length || session.results.length !== session.plan.length)
    return null;
  const previous = comparableSessions(session, history);
  if (session.challenge?.kind === "daily") return null;
  const hitCount = (s: Session) => s.results.filter(successfulAttempt).length;
  const longest = (s: Session) => {
    let run = 0,
      best = 0;
    for (const a of s.results) {
      run = successfulAttempt(a) ? run + 1 : 0;
      best = Math.max(best, run);
    }
    return best;
  };
  const metrics = [
    {
      label:
        session.kind === "test"
          ? "Najlepszy pełny test"
          : "Skuteczność pełnej serii",
      value: (s: Session) => percent(hitCount(s), s.results.length),
    },
    {
      label: "Carreaux",
      value: (s: Session) => s.results.filter((a) => a.carreau).length,
    },
    { label: "Seria kolejnych trafień", value: longest },
    {
      label: "Trafienia pierwszego lądowania",
      value: (s: Session) => s.results.filter((a) => a.landingHit).length,
    },
  ];
  const distanceRecords =
    session.kind === "test" || session.mastery || session.challenge
      ? []
      : [
          ...new Set(
            session.results
              .filter((a) =>
                ["point", "target", "boundary", "shoot"].includes(a.mode),
              )
              .map((a) => `${a.mode}:${a.distance}`),
          ),
        ].flatMap((key) => {
          const attempts = session.results.filter(
            (a) => `${a.mode}:${a.distance}` === key,
          );
          if (attempts.length < 10) return [];
          const mode = attempts[0].mode,
            distance = attempts[0].distance;
          const prior = history
            .filter(
              (s) =>
                s.id !== session.id &&
                s.completedAt &&
                Date.parse(s.completedAt) <=
                  Date.parse(session.completedAt ?? session.startedAt) &&
                s.results.length === s.plan.length &&
                conditionKey(s, mode, distance) ===
                  conditionKey(session, mode, distance),
            )
            .map((s) =>
              s.results.filter(
                (a) => a.mode === mode && a.distance === distance,
              ),
            )
            .filter((a) => a.length >= 10);
          if (!prior.length) return [];
          const value = percent(
              attempts.filter(successfulAttempt).length,
              attempts.length,
            ),
            before = Math.max(
              ...prior.map((a) =>
                percent(a.filter(successfulAttempt).length, a.length),
              ),
            );
          return value > before
            ? [
                {
                  label: `${modeNames[mode]} ${distance} m · skuteczność (%)`,
                  value,
                  previous: before,
                },
              ]
            : [];
        });
  const records = [
    ...distanceRecords,
    ...(!previous.length
      ? []
      : metrics
          .filter(
            (m) =>
              session.kind === "test" ||
              m.label !== "Skuteczność pełnej serii" ||
              !distanceRecords.length,
          )
          .flatMap((m) => {
            const value = m.value(session),
              before = Math.max(...previous.map(m.value));
            return value > before
              ? [{ label: m.label, value, previous: before }]
              : [];
          })),
  ];
  return records.length
    ? {
        hits: hitCount(session),
        previous: previous.length ? Math.max(...previous.map(hitCount)) : 0,
        attempts: session.results.length,
        records,
      }
    : null;
}

export type TrainingFocus =
  "wszystko" | "puenta" | "strzał" | "lob" | "słabości" | "presja" | "lekko";
export function generateTraining(
  state: State,
  minutes: 10 | 20 | 30 | 45 | 60,
  focus: TrainingFocus,
  now = new Date(),
): Session {
  if (minutes >= 45)
    return generateLongTraining(state, minutes as 45 | 60, focus, now);
  const base = createRecommendedSession(state, now);
  const r = recommendation(state, now);
  const mode: Mode =
    focus === "strzał" || focus === "presja"
      ? "shoot"
      : focus === "lob"
        ? "lob"
        : focus === "puenta" || focus === "lekko"
          ? "point"
          : r.mode;
  const distance = focus === "lekko" ? 6 : r.mode === mode ? r.distance : 7;
  const budgets =
    minutes === 10
      ? [2, 3, 3, 1, 1]
      : minutes === 20
        ? [3, 6, 6, 3, 2]
        : [4, 9, 9, 6, 2];
  const blocks: NonNullable<Session["trainingPlan"]>["blocks"] = [];
  const plan: Session["plan"] = [];
  const add = (
    title: string,
    instruction: string,
    kind: "warmup" | "throws" | "mental",
    duration: number,
    selectedMode = mode,
    selectedDistance = distance,
  ) => {
    const start = plan.length;
    if (kind === "throws")
      for (let i = 0; i < duration * 2; i++)
        plan.push({
          mode: selectedMode,
          distance: selectedDistance,
          phase: title,
        });
    blocks.push({
      title,
      instruction,
      kind,
      minutes: duration,
      start,
      end: plan.length,
    });
  };
  add(
    "Rozgrzewka",
    "Spokojny ruch barków i nadgarstków, kilka ruchów ręki bez kuli. Przygotuj koło i cel.",
    "warmup",
    budgets[0],
  );
  add(
    "Technika",
    "Pełna rutyna przed każdą kulą. Szukaj powtarzalnego ruchu.",
    "throws",
    budgets[1],
    focus === "wszystko" ? "point" : mode,
    Math.max(6, distance - 1),
  );
  add(
    focus === "wszystko" || focus === "słabości"
      ? "Twój priorytet"
      : "Utrwal ruch",
    r.mode === mode && r.count
      ? r.reason
      : "Ta sama odległość. Skup się na jakości wykonania.",
    "throws",
    budgets[2],
  );
  add(
    focus === "lekko" ? "Spokojna seria" : "Jedna próba",
    focus === "lekko"
      ? "Bez presji wyniku. Zrób rutynę przy każdym rzucie."
      : "Jeden rzut na ustawienie. Cel: 2 trafienia z każdej trójki. Po błędzie jeden oddech i następne zadanie.",
    "throws",
    budgets[3],
    focus === "wszystko" ? "shoot" : mode,
  );
  add(
    "Mental reset",
    "Zauważ wynik, zaakceptuj go. Trzy spokojne oddechy. Nazwij jedną rzecz do kolejnego treningu.",
    "mental",
    budgets[4],
  );
  return {
    ...base,
    difficulty: r.mode === mode ? base.difficulty : "średni",
    targetSize: r.mode === mode ? base.targetSize : 50,
    boundary: r.mode === mode ? base.boundary : 40,
    surface: r.mode === mode ? base.surface : "gravel",
    drillId: drillForMode[mode],
    plan,
    trackDirections: false,
    coach: { source: "generator" },
    trainingPlan: { minutes, focus, blocks, index: 0 },
  };
}
export function comparableSessions(session: Session, history: Session[]) {
  const key = (s: Session) =>
    JSON.stringify([
      s.drillId,
      s.kind ?? "training",
      s.benchmarkVersion,
      s.mastery?.tier ?? "regular",
      s.challenge?.kind ?? "practice",
      s.challenge?.kind === "boss" ? s.challenge.id : null,
      s.difficulty,
      s.targetSize,
      s.boundary,
      s.surface ?? "unknown",
      s.plan.map((p) => [p.mode, p.distance, p.role ?? null, p.phase ?? null]),
    ]);
  return history
    .filter(
      (s) =>
        s.id !== session.id &&
        s.completedAt &&
        new Date(s.completedAt).getTime() <=
          new Date(session.completedAt ?? session.startedAt).getTime() &&
        s.results.length === s.plan.length &&
        s.plan.length > 0 &&
        key(s) === key(session),
    )
    .sort(
      (a, b) =>
        new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime(),
    );
}
export function previousBenchmark(session: Session, history: Session[]) {
  if (session.kind !== "test" || session.results.length !== session.plan.length)
    return null;
  const previous = comparableSessions(session, history).at(-1);
  if (!previous) return null;
  return [...new Set(session.plan.map((a) => a.distance))].map((distance) => {
    const rate = (s: Session) => {
      const a = s.results.filter((a) => a.distance === distance);
      return percent(a.filter(successfulAttempt).length, a.length);
    };
    const before = rate(previous),
      after = rate(session);
    return { distance, before, after, delta: after - before };
  });
}
export function selfChallenge(state: State): Session | null {
  const previous = [...state.sessions]
    .filter(
      (s) =>
        s.completedAt &&
        s.plan.length > 0 &&
        s.results.length === s.plan.length &&
        !s.trainingPlan &&
        !s.challenge &&
        !s.mastery,
    )
    .sort(
      (a, b) =>
        new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime(),
    )
    .at(-1);
  if (!previous) return null;
  return {
    ...previous,
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    completedAt: undefined,
    situationChoice: undefined,
    score: 0,
    results: [],
    lessonReflection: undefined,
    routineUsed: undefined,
    mentalExerciseDone: undefined,
    stressLevel: undefined,
    recovery: undefined,
    missionId: undefined,
    missionTitle: undefined,
    missionCue: undefined,
    coach: { source: "self", referenceSessionId: previous.id },
  };
}

function generateLongTraining(
  state: State,
  minutes: 45 | 60,
  focus: TrainingFocus,
  now: Date,
): Session {
  const base = createRecommendedSession(state, now),
    r = recommendation(state, now);
  const mode: Mode =
    focus === "strzał" || focus === "presja"
      ? "shoot"
      : focus === "lob"
        ? "lob"
        : focus === "puenta" || focus === "lekko"
          ? "point"
          : r.mode;
  const distance = r.mode === mode ? r.distance : 7,
    max =
      (state.player?.audience ?? state.adventure?.config?.audience) === "junior"
        ? 7
        : 10;
  const blocks: NonNullable<Session["trainingPlan"]>["blocks"] = [],
    plan: Session["plan"] = [];
  const durations =
    minutes === 45 ? [5, 8, 9, 7, 6, 2, 8] : [6, 12, 12, 10, 8, 2, 10];
  const add = (
    title: string,
    instruction: string,
    kind: "warmup" | "throws" | "mental",
    index: number,
    count = 0,
    distances = [distance],
  ) => {
    const start = plan.length;
    for (let i = 0; i < count; i++)
      plan.push({
        mode,
        distance: distances[i % distances.length],
        phase: title,
      });
    blocks.push({
      title,
      instruction,
      kind,
      minutes: durations[index],
      start,
      end: plan.length,
    });
  };
  add(
    "Rozgrzewka",
    "Ruch barków i nadgarstków. Przygotuj cel, kilka ruchów bez kuli.",
    "warmup",
    0,
  );
  add(
    "Technika",
    "Pełna rutyna, spokojne zbieranie kul i sprawdzenie toru. Między trójkami odpocznij.",
    "throws",
    1,
    12,
    [Math.max(6, distance - 1)],
  );
  add(
    "Twój priorytet",
    r.mode === mode && r.count
      ? r.reason
      : "Utrwal jeden ruch przy tych samych warunkach.",
    "throws",
    2,
    12,
  );
  add(
    "Zmiana dystansu",
    "Przenieś cel zgodnie z ekranem. Nazwij nową siłę rzutu przed każdą próbą.",
    "throws",
    3,
    12,
    [Math.max(6, distance - 1), Math.min(max, distance + 1)],
  );
  add(
    focus === "lekko" ? "Spokojna seria" : "Presja 2/3",
    focus === "lekko"
      ? "Skup się na rutynie, bez celu wyniku."
      : "Trzy trójki. Cel: dwa trafienia z każdej trójki. Jeden oddech po błędzie.",
    "throws",
    4,
    9,
  );
  add(
    "Mental reset",
    "Zauważ wynik, zaakceptuj, spokojny oddech, nazwij następne zadanie.",
    "mental",
    5,
  );
  add(
    "Krótki test końcowy",
    "Sześć rzutów na tym samym dystansie. Jedna próba bez cofania. To sprawdzian tego planu, osobny od standaryzowanego benchmarku 20 rzutów.",
    "throws",
    6,
    6,
  );
  return {
    ...base,
    drillId: drillForMode[mode],
    plan,
    trackDirections: false,
    coach: { source: "generator" },
    trainingPlan: { minutes, focus, blocks, index: 0 },
  };
}
