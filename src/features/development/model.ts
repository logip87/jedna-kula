import { mentalLessons } from "../mental/catalog";
import { drills } from "../../data";
import {
  localDay,
  percent,
  type Session,
  type State,
  type Mode,
} from "../../domain";
import {
  conditionKey,
  personalBest,
  recommendation,
  weekStart,
  weeklyProgress,
} from "../coaching/model";
import { questions } from "../rules/quiz";
import type {
  SkillScore,
  TrainingGoal,
  WeeklyChallenge,
  XPEvent,
} from "./types";

export function audience(state: State) {
  if (state.player?.level)
    return ["advanced", "tournament"].includes(state.player.level)
      ? "athlete"
      : "beginner";
  return (
    state.player?.audience ??
    (state.adventure?.config?.audience === "junior" ? "junior" : "beginner")
  );
}
export const fullSession = (s: Session) =>
  !!s.completedAt && s.plan.length > 0 && s.results.length === s.plan.length;
const eligible = (state: State, now: Date) =>
  state.sessions.filter(
    (s) => fullSession(s) && new Date(s.completedAt!) <= now,
  );
export function skillScores(state: State, now = new Date()): SkillScore[] {
  const names = { point: "Puenta", shoot: "Strzał", lob: "Lob" };
  const technical = (["point", "shoot", "lob"] as const).map((id) => {
    const groups = new Map<string, Session[]>();
    for (const s of eligible(state, now).filter(
      (s) =>
        s.kind === "test" &&
        s.benchmarkVersion === 1 &&
        s.plan.every((a) =>
          id === "point" ? a.mode === "target" : a.mode === id,
        ),
    )) {
      const key = [
        s.drillId,
        s.benchmarkVersion,
        s.difficulty,
        s.targetSize,
        s.boundary,
        s.surface ?? "unknown",
      ].join(":");
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    const candidates = [...groups.values()]
      .filter((g) => g.length >= 2)
      .map((g) =>
        g
          .sort(
            (a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!),
          )
          .slice(-2),
      )
      .sort(
        (a, b) =>
          Date.parse(b.at(-1)!.completedAt!) -
          Date.parse(a.at(-1)!.completedAt!),
      );
    const group = candidates[0],
      attempts = group?.flatMap((s) => s.results) ?? [];
    const rate =
      attempts.length >= 40
        ? percent(
            attempts.filter((a) => (id === "lob" ? a.landingHit : a.hit))
              .length,
            attempts.length,
          )
        : null;
    return {
      id,
      name: names[id],
      level: rate === null ? null : Math.min(10, 1 + Math.floor(rate / 10)),
      rate,
      samples: attempts.length,
      evidence:
        rate === null
          ? "Wykonaj 2 pełne testy w tych samych warunkach."
          : `${rate}% · 2 ostatnie porównywalne testy (${attempts.length} prób)${id === "lob" ? " · pierwsze lądowanie" : ""}.`,
    };
  });
  const sessions = eligible(state, now),
    routine = sessions.filter((s) => s.routineUsed).length;
  const checkins = sessions.filter((s) => typeof s.routineUsed === "boolean");
  const routineRate =
    checkins.length >= 5 ? percent(routine, checkins.length) : null;
  const correct = questions.filter(
    (q) => state.rulesQuiz?.answers[q.id] === q.correct,
  ).length;
  const situations = Object.keys(state.adventure?.tactics ?? {}).length;
  const week = weeklyProgress(state, now);
  const appliedLessons = (tag: "mental" | "tactical") =>
    sessions.filter(
      (s) =>
        s.lessonReflection === "applied" &&
        mentalLessons.some(
          (l) => l.id === s.mentalCueLessonId && l.tags?.includes(tag),
        ),
    ).length;
  const lessonEvidence = (tag: "mental" | "tactical") =>
    ` Potwierdzone zastosowania w pełnych treningach: ${appliedLessons(tag)} (samoocena).`;
  return [
    ...technical,
    {
      id: "tactics",
      name: "Taktyka",
      level:
        correct + situations
          ? Math.min(6, 1 + Math.floor((correct + situations) / 6))
          : null,
      rate: null,
      samples: correct + situations,
      evidence: `${correct} poprawnych odpowiedzi zasad · ${situations} przeanalizowanych sytuacji. Poziom wiedzy; decyzji sytuacyjnych nie oceniamy jako jednoznacznie dobrych.${lessonEvidence("tactical")}`,
    },
    {
      id: "mental",
      name: "Mental",
      level:
        routineRate === null
          ? null
          : Math.min(10, 1 + Math.floor(routineRate / 10)),
      rate: routineRate,
      samples: checkins.length,
      evidence:
        (routineRate === null
          ? "Zapisz samoocenę rutyny w co najmniej 5 pełnych sesjach."
          : `Rutyna w ${routineRate}% z ${checkins.length} pełnych sesji. To regularność procesu, nie ocena odporności psychicznej.`) +
        lessonEvidence("mental"),
    },
    {
      id: "regularity",
      name: "Regularność",
      level: week.streak ? Math.min(10, 1 + Math.floor(week.streak / 2)) : null,
      rate: null,
      samples: week.streak,
      evidence: `${week.streak} ukończonych tygodni w serii · cel ${week.target} sesji tygodniowo.`,
    },
  ];
}
export function xpLevel(events: XPEvent[] = []) {
  const xp = events.reduce((n, e) => n + e.points, 0);
  let level = 1;
  while (xp >= 100 * ((level * (level + 1)) / 2) && level < 1000) level++;
  const lower = 100 * (((level - 1) * level) / 2),
    upper = 100 * ((level * (level + 1)) / 2);
  return {
    xp,
    level,
    progress: xp - lower,
    needed: upper - lower,
    name:
      level >= 10
        ? "Doświadczenie w grze"
        : level >= 5
          ? "Własny rytm"
          : level >= 3
            ? "Solidna baza"
            : "Pierwsze kroki",
  };
}
export function weeklyChallenge(state: State, now = new Date()) {
  const week = weekStart(now);
  const configured = state.coaching?.weeklyChallenges?.find(
    (c) => c.week === week,
  );
  const challenge: WeeklyChallenge = configured ?? {
    week,
    kind: "distances",
    target: 3,
  };
  const sessions = state.sessions.filter(
    (s) =>
      s.completedAt &&
      Date.parse(s.completedAt) <= now.getTime() &&
      weekStart(new Date(s.completedAt)) === week,
  );
  const attempts = sessions.flatMap((s) => s.results);
  const count =
    challenge.kind === "point-hits"
      ? attempts.filter(
          (a) => ["point", "target", "boundary"].includes(a.mode) && a.hit,
        ).length
      : challenge.kind === "shoot-attempts"
        ? attempts.filter(
            (a) => a.mode === "shoot" && a.distance === challenge.distance,
          ).length
        : challenge.kind === "routine"
          ? sessions.filter((s) => fullSession(s) && s.routineUsed).length
          : new Set(attempts.map((a) => a.distance)).size;
  const title =
    challenge.kind === "point-hits"
      ? `${challenge.target} celnych puent`
      : challenge.kind === "shoot-attempts"
        ? `${challenge.target} strzałów z ${challenge.distance} m`
        : challenge.kind === "routine"
          ? `${challenge.target} sesje z pełną rutyną`
          : `${challenge.target} różne dystanse`;
  return { ...challenge, count, title, complete: count >= challenge.target };
}
export function chooseChallenge(
  state: State,
  kind: WeeklyChallenge["kind"],
  now = new Date(),
): State {
  const week = weekStart(now);
  const challenge: WeeklyChallenge = {
    week,
    kind,
    target: kind === "point-hits" ? 100 : kind === "shoot-attempts" ? 50 : 3,
    ...(kind === "shoot-attempts"
      ? { distance: audience(state) === "junior" ? 7 : 8 }
      : {}),
  };
  return {
    ...state,
    coaching: {
      weeklyGoals: [],
      ...state.coaching,
      weeklyChallenges: [
        ...(state.coaching?.weeklyChallenges ?? []).filter(
          (c) => c.week !== week,
        ),
        challenge,
      ],
    },
  };
}
export function goalProgress(
  state: State,
  goal: TrainingGoal,
  now = new Date(),
) {
  const sessions = eligible(state, now).filter(
    (s) => Date.parse(s.completedAt!) >= Date.parse(goal.createdAt),
  );
  if (goal.kind === "routine") {
    const count = sessions.filter((s) => s.routineUsed).length;
    return {
      value: count,
      samples: count,
      ready: true,
      complete: count >= goal.target,
    };
  }
  const matching = sessions.filter(
    (s) => conditionKey(s, goal.mode!, goal.distance!) === goal.conditionKey,
  );
  const attempts = matching
    .slice(-5)
    .flatMap((s) =>
      s.results.filter(
        (a) => a.mode === goal.mode && a.distance === goal.distance,
      ),
    );
  const ready = matching.length >= 2 && attempts.length >= 20;
  const value = ready
    ? percent(attempts.filter((a) => a.hit).length, attempts.length)
    : 0;
  return {
    value,
    samples: attempts.length,
    ready,
    complete: ready && value >= goal.target,
  };
}
export function createMicroGoal(state: State, now = new Date()): State {
  const r = recommendation(state, now);
  if (!r.count || !r.session || r.target === null || r.rate === null)
    return state;
  const goal: TrainingGoal = {
    id: crypto.randomUUID(),
    sourceSessionId: r.session.id,
    kind: "accuracy",
    createdAt: now.toISOString(),
    baseline: r.rate,
    target: r.target,
    mode: r.mode,
    distance: r.distance,
    conditionKey: conditionKey(r.session, r.mode, r.distance),
    drillId: r.session.drillId,
    difficulty: r.session.difficulty,
    targetSize: r.session.targetSize,
    boundary: r.session.boundary,
    surface: r.session.surface,
  };
  if (
    state.coaching?.goals?.some(
      (g) =>
        g.kind === "accuracy" &&
        g.conditionKey === goal.conditionKey &&
        !goalProgress(state, g, now).complete,
    )
  )
    return state;
  return {
    ...state,
    coaching: {
      weeklyGoals: [],
      ...state.coaching,
      goals: [...(state.coaching?.goals ?? []), goal],
    },
  };
}
export function createRoutineGoal(state: State, now = new Date()): State {
  if (
    state.coaching?.goals?.some(
      (g) => g.kind === "routine" && !goalProgress(state, g, now).complete,
    )
  )
    return state;
  return {
    ...state,
    coaching: {
      weeklyGoals: [],
      ...state.coaching,
      goals: [
        ...(state.coaching?.goals ?? []),
        {
          id: crypto.randomUUID(),
          kind: "routine",
          createdAt: now.toISOString(),
          target: 3,
          baseline: 0,
        },
      ],
    },
  };
}
export function awardDevelopment(
  previous: State,
  next: State,
  now = new Date(),
): State {
  const events = [...(next.coaching?.xpEvents ?? [])];
  const awards = [...(next.awards ?? [])];
  const add = (
    id: string,
    kind: XPEvent["kind"],
    points: number,
    earnedAt: string,
    max: number,
  ) => {
    if (
      events.some((e) => e.id === id) ||
      events.filter(
        (e) =>
          e.kind === kind &&
          localDay(new Date(e.earnedAt)) === localDay(new Date(earnedAt)),
      ).length >= max
    )
      return;
    events.push({ id, kind, points, earnedAt });
  };
  for (const s of next.sessions.filter(
    (s) =>
      fullSession(s) &&
      !previous.sessions.some((p) => p.id === s.id && p.completedAt),
  )) {
    if (Date.parse(s.completedAt!) > now.getTime() || s.results.length < 6)
      continue;
    const record = personalBest(s, previous.sessions);
    const weak = recommendation(previous, new Date(s.startedAt));
    add(
      `session:${s.id}`,
      "session",
      (s.kind === "test" ? 50 : 35) +
        (record ? 15 : 0) +
        (weak.count &&
        s.plan.some((a) => a.mode === weak.mode && a.distance === weak.distance)
          ? 10
          : 0) +
        (s.missionId ? 10 : 0),
      s.completedAt!,
      2,
    );
    if (s.mastery && s.results.length === 10 && masteryHits(s) >= 8) {
      const id = `${s.mastery.tier}:${s.drillId}`;
      if (!awards.some((a) => a.id === id))
        awards.push({
          id,
          name: `${s.mastery.tier === "mastery" ? "Mastery" : "Legendary"} · ${drills.find((d) => d.id === s.drillId)?.name ?? "ćwiczenie"}`,
          description: "8/10 w pełnej próbie jednej szansy.",
          unlockedAt: s.completedAt!,
          sourceSessionId: s.id,
        });
    }
  }
  for (const p of next.coaching?.practiceHistory ?? []) {
    if (
      !p.completedAt ||
      previous.coaching?.practiceHistory?.some((x) => x.id === p.id) ||
      Date.parse(p.completedAt) > now.getTime()
    )
      continue;
    add(`practice:${p.id}`, p.kind, 20, p.completedAt, 1);
  }
  for (const lesson of next.lessons.filter(
    (id) => !previous.lessons.includes(id),
  ))
    add(`lesson:${lesson}`, "lesson", 10, now.toISOString(), 1);
  const quiz = next.rulesQuiz;
  if (
    quiz &&
    questions.filter((q) => quiz.answers[q.id] === q.correct).length >= 3 &&
    (!previous.rulesQuiz ||
      previous.rulesQuiz.startedAt !== quiz.startedAt ||
      questions.filter((q) => previous.rulesQuiz!.answers[q.id] === q.correct)
        .length < 3)
  )
    add(`quiz:${quiz.startedAt}`, "quiz", 15, now.toISOString(), 1);
  const week = weeklyProgress(next, now);
  if (week.perfect) {
    add(`week:${week.week}`, "week", 30, now.toISOString(), 1);
    for (const milestone of [2, 4, 8, 12])
      if (
        week.streak >= milestone &&
        !awards.some((a) => a.id === `perfect:${milestone}`)
      )
        awards.push({
          id: `perfect:${milestone}`,
          name: `Perfect Week × ${milestone}`,
          description: `${milestone} ukończonych tygodni w serii.`,
          unlockedAt: now.toISOString(),
        });
  }
  const challenge = weeklyChallenge(next, now);
  if (challenge.complete)
    add(`challenge:${challenge.week}`, "challenge", 25, now.toISOString(), 1);
  return {
    ...next,
    awards,
    coaching: { weeklyGoals: [], ...next.coaching, xpEvents: events },
  };
}
export function masteryHits(session: Session) {
  return session.results.filter((a) =>
    a.mode === "lob" ? a.landingHit === true : a.hit,
  ).length;
}
export const masteryDrills = ["point-basic", "shoot-basic", "target", "lob"];
export function exerciseProgress(state: State, drillId: string) {
  const sessions = state.sessions.filter(
    (s) =>
      fullSession(s) &&
      s.drillId === drillId &&
      !s.mastery &&
      !s.challenge &&
      s.kind !== "test",
  );
  const groups = new Map<string, Session[]>();
  for (const s of sessions) {
    const mode = s.plan[0].mode,
      distance = s.plan[0].distance;
    if (!s.plan.every((a) => a.mode === mode && a.distance === distance))
      continue;
    const key = conditionKey(s, mode, distance);
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  const sample = [...groups.values()]
    .filter((g) => g.length >= 2)
    .map((g) =>
      g
        .sort((a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!))
        .slice(-2),
    )
    .filter(
      (g) =>
        g.reduce((n, s) => n + s.results.length, 0) >= 20 &&
        g.every((s) => percent(masteryHits(s), s.results.length) >= 60),
    )
    .sort(
      (a, b) =>
        Date.parse(b.at(-1)!.completedAt!) - Date.parse(a.at(-1)!.completedAt!),
    )[0];
  const passed = (tier: "mastery" | "legendary") =>
    !!state.awards?.some((a) => a.id === `${tier}:${drillId}`) ||
    state.sessions.some(
      (s) =>
        s.drillId === drillId &&
        s.mastery?.tier === tier &&
        fullSession(s) &&
        s.results.length === 10 &&
        masteryHits(s) >= 8,
    );
  const mastery = passed("mastery"),
    legendary = passed("legendary");
  return {
    sample: sample?.at(-1) ?? null,
    unlocked: !!sample || mastery,
    mastery,
    legendary,
    stage: legendary
      ? "LEGENDARY"
      : mastery
        ? "MASTERY"
        : sample
          ? "TEST"
          : sessions.length >= 2
            ? "UTRWAL"
            : sessions.length
              ? "TRENUJ"
              : "POZNAJ",
  };
}
export function createMastery(
  state: State,
  drillId: string,
  tier: "mastery" | "legendary",
  rng = Math.random,
): Session {
  if (!masteryDrills.includes(drillId))
    throw new Error("To ćwiczenie nie ma próby mistrzowskiej.");
  const p = exerciseProgress(state, drillId);
  if (!p.unlocked || (tier === "legendary" && !p.mastery))
    throw new Error("Najpierw ukończ poprzedni etap.");
  const proof = state.sessions
    .filter(
      (s) =>
        fullSession(s) &&
        s.drillId === drillId &&
        s.mastery?.tier === "mastery",
    )
    .at(-1);
  const base = p.sample ?? proof;
  if (!base)
    throw new Error("Zapisz serię w wybranych warunkach przed następną próbą.");
  let previous = 0;
  const plan = Array.from({ length: 10 }, () => {
    const pool = (
      audience(state) === "junior" ? [6, 7] : [6, 7, 8, 9, 10]
    ).filter((d) => d !== previous);
    const distance =
      tier === "mastery"
        ? base.plan[0].distance
        : pool[Math.floor(rng() * pool.length)];
    previous = distance;
    return { mode: base.plan[0].mode, distance };
  });
  return {
    ...base,
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    completedAt: undefined,
    kind: "training",
    benchmarkVersion: undefined,
    mastery: { tier, version: 1 },
    plan,
    situationChoice: undefined,
    results: [],
    score: 0,
    trainingPlan: undefined,
    missionId: undefined,
    missionTitle: undefined,
    missionCue: undefined,
    mentalExerciseDone: undefined,
    lessonReflection: undefined,
    routineUsed: undefined,
    recovery: undefined,
    stressLevel: undefined,
    trackDirections: false,
  };
}
export function daysUntilCompetition(state: State, now = new Date()) {
  const date = state.coaching?.competition?.date;
  if (!date) return null;
  const days =
    (Date.parse(`${date}T00:00:00Z`) -
      Date.parse(`${localDay(now)}T00:00:00Z`)) /
    86400000;
  return Number.isFinite(days) ? Math.round(days) : null;
}
export function competitionTraining(
  state: State,
  now = new Date(),
): Session | null {
  const days = daysUntilCompetition(state, now);
  if (days === null || days < 0 || days > 14) return null;
  const r = recommendation(state, now);
  const mode: Mode =
    state.player?.preferredRole === "strzelec" ? "shoot" : r.mode;
  const session: Session = {
    id: crypto.randomUUID(),
    drillId:
      mode === "shoot" ? "shoot-basic" : mode === "lob" ? "lob" : "point-basic",
    kind: "training",
    startedAt: now.toISOString(),
    difficulty: r.mode === mode ? (r.session?.difficulty ?? "łatwy") : "średni",
    targetSize: r.session?.targetSize ?? 50,
    boundary: r.session?.boundary ?? 40,
    surface: r.session?.surface,
    plan: [],
    situationChoice: undefined,
    results: [],
    score: 0,
  };
  const minutes = days <= 3 ? 10 : days <= 7 ? 20 : 30;
  const count = days <= 1 ? 6 : days <= 3 ? 12 : days <= 7 ? 20 : 30;
  const candidates = eligible(state, now)
    .flatMap((s) => s.results)
    .filter(
      (a) =>
        a.mode === mode &&
        a.distance <= (audience(state) === "junior" ? 7 : 10),
    );
  const distances = [...new Set(candidates.map((a) => a.distance))];
  const strongest =
    distances
      .map((distance) => {
        const a = candidates.filter((x) => x.distance === distance);
        return {
          distance,
          count: a.length,
          rate: a.filter((x) => x.hit).length / a.length,
        };
      })
      .filter((g) => g.count >= 10)
      .sort((a, b) => b.rate - a.rate)[0]?.distance ?? 6;
  session.plan = Array.from({ length: count }, () => ({
    mode,
    distance: strongest,
    phase: days <= 3 ? "Pewny ruch" : "Jakość + rutyna",
  }));
  session.trainingPlan = {
    minutes,
    focus: "zawody",
    index: 0,
    blocks: [
      {
        title: "Spokojna rozgrzewka",
        instruction:
          "Kilka ruchów bez kuli i przygotowanie celu. Bez dodatkowego zmęczenia.",
        minutes: minutes === 10 ? 3 : 5,
        kind: "warmup",
        start: 0,
        end: 0,
      },
      {
        title: days <= 3 ? "Pewność i jakość" : "Jakość + rutyna",
        instruction: `${count} prób na znanym dystansie. Jedna rutyna przed każdym rzutem. Nie dokładaj objętości po pudle.`,
        minutes: minutes === 10 ? 4 : minutes === 20 ? 12 : 22,
        kind: "throws",
        start: 0,
        end: count,
      },
      {
        title: "Mental reset",
        instruction:
          "Trzy oddechy. Wyobraź sobie pierwszy rzut na zawodach i nazwij swoje zadanie.",
        minutes: 3,
        kind: "mental",
        start: count,
        end: count,
      },
    ],
  };
  return session;
}

export function createGoalSession(
  state: State,
  goal: TrainingGoal,
): Session | null {
  const base = state.sessions.find((s) => s.id === goal.sourceSessionId);
  if (!base) return null;
  return {
    ...base,
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    completedAt: undefined,
    situationChoice: undefined,
    results: [],
    score: 0,
    lessonReflection: undefined,
    routineUsed: undefined,
    recovery: undefined,
    stressLevel: undefined,
    mentalExerciseDone: undefined,
    missionId: undefined,
    missionTitle: undefined,
    missionCue: undefined,
    trainingPlan: base.trainingPlan
      ? { ...base.trainingPlan, index: 0 }
      : undefined,
  };
}
