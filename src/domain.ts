import { throwScenarios } from "./features/situations/throw-scenarios";
import {
  completedMentalLessons,
  mentalLessons,
} from "./features/mental/catalog";
import type {
  SessionChallenge,
  SituationsState,
} from "./features/situations/types";
import type { Audience, CoachingState } from "./features/development/types";
import type {
  AdventureState,
  Direction,
  Surface,
} from "./features/adventure/model";
import type { RulesQuizProgress } from "./features/rules/model";
export type Category =
  | "Puenta"
  | "Strzał"
  | "Lob"
  | "Gra przy linii"
  | "Różne odległości"
  | "Precyzja"
  | "Gra sytuacyjna"
  | "Trening mieszany";
export type Mode = "point" | "shoot" | "target" | "boundary" | "lob";
export type Difficulty = "łatwy" | "średni" | "trudny";
export interface Player {
  playingStyle?: import("./features/profile/intent").PlayingStyle;
  trainingGoal?: import("./features/profile/intent").TrainingGoal;
  audience?: Audience;
  id: string;
  name: string;
  age?: number;
  level?: "beginner" | "intermediate" | "advanced" | "tournament";
  preferredRole: string;
  preferredHand: string;
  createdAt: string;
}
export interface Drill {
  sequence?: number[];
  test?: boolean;
  group?: "Puenta" | "Strzał" | "Lob" | "Presja" | "Mix" | "Testy";
  id: string;
  name: string;
  category: Category;
  description: string;
  instructions: string;
  mode: Mode;
  distances: number[];
  attempts: number;
  random?: boolean;
  mixed?: boolean;
  pressure?: boolean;
  requiredHits?: number;
  timed?: boolean;
  cue: string;
  minutes: number;
}
export type LessonTag =
  | "mental"
  | "tactical"
  | "team"
  | "terrain"
  | "pressure"
  | "decision"
  | "match-management";
export interface Lesson {
  durationMinutes?: number;
  tags?: LessonTag[];
  procedure?: string[];
  matchCue?: string;
  reflection?: string;
  scenarioId?: string;
  competency: import("./features/mental/catalog").MentalCompetency;
  level: import("./features/mental/catalog").MentalLevel;
  id: string;
  title: string;
  description: string;
  rule: string;
  example: string;
  exercise: string;
  phrase: string;
}
export interface PlannedThrow {
  situationId?: string;
  distance: number;
  mode: Mode;
  role?: string;
  phase?: string;
}
export interface Attempt extends PlannedThrow {
  id: string;
  result: string;
  points: number;
  hit: boolean;
  carreau: boolean;
  outside: boolean;
  landingHit?: boolean;
  decision?: string;
  decisionReview?: import("./features/situations/throw-scenarios").DecisionReview;
  missDirection?: Direction;
  landingDirection?: Direction;
}
export interface Session {
  lessonReflection?: "applied" | "repeat" | "no-opportunity";
  mentalCueLessonId?: string;
  situationChoice?: { index: number; title: string; mode: Mode };
  coach?: {
    source: "recommended" | "manual" | "generator" | "self" | "adaptive";
    referenceSessionId?: string;
    adaptation?: "harder" | "easier";
    oneChance?: boolean;
  };
  challenge?: SessionChallenge;
  mastery?: { tier: "mastery" | "legendary"; version: 1 };
  kind?: "training" | "test";
  benchmarkVersion?: number;
  trainingPlan?: TrainingPlan;
  id: string;
  drillId: string;
  startedAt: string;
  completedAt?: string;
  difficulty: Difficulty;
  plan: PlannedThrow[];
  results: Attempt[];
  score: number;
  stressLevel?: string;
  routineUsed?: boolean;
  recovery?: string;
  targetSize: number;
  boundary: number;
  mentalExerciseDone?: boolean;
  missionId?: string;
  missionTitle?: string;
  missionCue?: string;
  trackDirections?: boolean;
  surface?: Surface;
  timedPhase?: number;
  phaseStartedAt?: string;
}
export interface TrainingBlock {
  title: string;
  instruction: string;
  minutes: number;
  kind: "warmup" | "throws" | "mental";
  start: number;
  end: number;
}
export interface TrainingPlan {
  minutes: 10 | 20 | 30 | 45 | 60;
  focus: string;
  index: number;
  blocks: TrainingBlock[];
}
export interface Achievement {
  sourceSessionId?: string;
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
}
export interface State {
  situations?: SituationsState;
  coaching?: CoachingState;
  player: Player | null;
  lessons: string[];
  sessions: Session[];
  draft: Session | null;
  awards?: Achievement[];
  rulesQuiz?: RulesQuizProgress;
  adventure?: AdventureState;
}
export const emptyState: State = {
  player: null,
  lessons: [],
  sessions: [],
  draft: null,
};
export const choices: Record<
  Mode,
  {
    label: string;
    points: number;
    hit: boolean;
    carreau?: boolean;
    outside?: boolean;
  }[]
> = {
  point: [
    { label: "0–30 cm", points: 3, hit: true },
    { label: "31–60 cm", points: 2, hit: true },
    { label: "61–100 cm", points: 1, hit: false },
    { label: "Ponad 100 cm", points: 0, hit: false },
  ],
  shoot: [
    { label: "Carreau", points: 5, hit: true, carreau: true },
    { label: "Czyste trafienie", points: 3, hit: true },
    { label: "Dotknięcie", points: 1, hit: false },
    { label: "Pudło", points: 0, hit: false },
  ],
  target: [
    { label: "W celu", points: 1, hit: true },
    { label: "Poza celem", points: 0, hit: false },
  ],
  boundary: [
    { label: "0–30 cm", points: 3, hit: true },
    { label: "31–60 cm", points: 2, hit: true },
    { label: "61–100 cm", points: 1, hit: false },
    { label: "Ponad 100 cm", points: 0, hit: false },
    { label: "Za linią", points: 0, hit: false, outside: true },
  ],
  lob: [
    { label: "0–30 cm od świnki", points: 3, hit: true },
    { label: "31–60 cm od świnki", points: 2, hit: true },
    { label: "61–100 cm od świnki", points: 1, hit: false },
    { label: "Ponad 100 cm od świnki", points: 0, hit: false },
  ],
};
export const maxPoints = (mode: Mode) =>
  Math.max(...choices[mode].map((c) => c.points));
export const percent = (n: number, d: number) =>
  d ? Math.round((n / d) * 100) : 0;
export function successfulAttempt(a: Attempt): boolean {
  return a.mode === "lob" ? a.landingHit === true : a.hit;
}
export function makePlan(
  drill: Drill,
  distance: number,
  attempts: number,
  all: boolean,
  rng = Math.random,
): PlannedThrow[] {
  const ds = all ? drill.distances : [distance];
  const count =
    all && !drill.random && !drill.mixed ? attempts * ds.length : attempts;
  let previous = 0;
  return Array.from({ length: count }, (_, i) => {
    let d = drill.sequence
      ? drill.sequence[i % drill.sequence.length]
      : (ds[Math.floor(i / attempts)] ?? distance);
    if (drill.random) {
      const pool = drill.distances.filter((x) => x !== previous);
      d = pool[Math.floor(rng() * pool.length)];
    }
    previous = d;
    let mode = drill.mode;
    let role: string | undefined;
    let phase: string | undefined;
    if (drill.mixed) {
      const quarter = Math.min(3, Math.floor(i / (count / 4)));
      mode =
        quarter === 0
          ? "point"
          : quarter === 1
            ? "shoot"
            : rng() < 0.5
              ? "point"
              : "shoot";
      role =
        quarter === 2
          ? ["PUENTER", "STRZELEC", "MIDDLE"][Math.floor(rng() * 3)]
          : mode === "shoot"
            ? "STRZELEC"
            : "PUENTER";
      if (role === "PUENTER") mode = "point";
      if (role === "STRZELEC") mode = "shoot";
      phase = ["Puenta", "Strzał", "Losowa rola", "Gra sytuacyjna"][quarter];
    }
    return {
      distance: d,
      mode,
      role,
      phase,
      ...(drill.id === "situation" || phase === "Gra sytuacyjna"
        ? { situationId: throwScenarios[i % throwScenarios.length].id }
        : {}),
    };
  });
}
export function summarize(s: Session) {
  const byDistance = Object.entries(
    s.results.reduce<Record<string, Attempt[]>>((groups, a) => {
      (groups[String(a.distance)] ??= []).push(a);
      return groups;
    }, {}),
  ).map(([d, results]) => {
    const r = results ?? [];
    return {
      distance: Number(d),
      accuracy: percent(r.filter((x) => x.hit).length, r.length),
      score: percent(
        r.reduce((a, x) => a + x.points, 0),
        r.reduce((a, x) => a + maxPoints(x.mode), 0),
      ),
      attempts: r.length,
    };
  });
  const ordered = [...byDistance].sort((a, b) => b.score - a.score);
  return {
    points: s.results.reduce((a, x) => a + x.points, 0),
    percentage: percent(
      s.results.reduce((a, x) => a + x.points, 0),
      s.results.reduce((a, x) => a + maxPoints(x.mode), 0),
    ),
    hits: s.results.filter((x) => x.hit).length,
    misses: s.results.filter((x) => !x.hit).length,
    carreaux: s.results.filter((x) => x.carreau).length,
    outside: s.results.filter((x) => x.outside).length,
    landing: percent(
      s.results.filter((x) => x.landingHit).length,
      s.results.filter((x) => x.mode === "lob").length,
    ),
    byDistance,
    best: ordered[0],
    weakest: ordered.at(-1),
  };
}
export const localDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function streak(sessions: Session[], now = new Date()) {
  const days = new Set(
    sessions.map((s) => localDay(new Date(s.completedAt ?? s.startedAt))),
  );
  const cursor = new Date(now);
  let n = 0;
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(localDay(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}
export function stats(state: State) {
  const sessions = state.sessions.filter(
    (s) => s.kind !== "test" && !s.mastery && !s.challenge,
  );
  const attempts = sessions.flatMap((s) => s.results);
  const point = attempts.filter(
    (a) => a.mode === "point" || a.mode === "boundary" || a.mode === "target",
  );
  const shoot = attempts.filter((a) => a.mode === "shoot");
  const routineResponses = sessions.filter(
    (s) => typeof s.routineUsed === "boolean",
  );
  const routineUsed = routineResponses.filter((s) => s.routineUsed).length;
  return {
    count: sessions.length,
    pointAttempts: point.length,
    shootAttempts: shoot.length,
    point: percent(point.filter((a) => a.hit).length, point.length),
    shoot: percent(shoot.filter((a) => a.hit).length, shoot.length),
    carreau: percent(shoot.filter((a) => a.carreau).length, shoot.length),
    streak: streak(sessions),
    routine: routineResponses.length
      ? percent(routineUsed, routineResponses.length)
      : null,
    routineResponses: routineResponses.length,
    routineUsed,
    mental: sessions.filter((s) => s.mentalExerciseDone).length,
    mentalModules:
      state.coaching?.practiceHistory?.filter(
        (p) => p.kind === "mental" && !!p.completedAt,
      ).length ?? 0,
    attempts,
  };
}
export function achievements(state: State) {
  const st = stats(state);
  return [
    ["Pierwszy trening", st.count >= 1],
    ["5 treningów", st.count >= 5],
    ["10 treningów", st.count >= 10],
    ...(state.awards?.some((a) => a.name === "3 dni z rzędu")
      ? [["3 dni z rzędu", true]]
      : []),
    ["10 trafień", st.attempts.filter((a) => a.hit).length >= 10],
    ["5 carreaux", st.attempts.filter((a) => a.carreau).length >= 5],
    [
      "Puenta 30 cm",
      st.attempts.some((a) => a.mode === "point" && a.points === 3),
    ],
    ["Trening na 10 m", st.attempts.some((a) => a.distance === 10)],
    [
      "Wszechstronny zawodnik",
      st.attempts.some((a) => a.mode === "shoot") &&
        st.attempts.some((a) => a.mode === "point"),
    ],
    [
      "Spokojna głowa",
      completedMentalLessons(state.lessons) === mentalLessons.length,
    ],
  ].map(([name, unlocked]) => ({
    name: String(name),
    unlocked: Boolean(unlocked) || !!state.awards?.some((a) => a.name === name),
  }));
}

export function awardAchievements(
  state: State,
  now = new Date().toISOString(),
): State {
  const awards = [...(state.awards ?? [])];
  for (const a of achievements(state)) {
    if (a.unlocked && !awards.some((x) => x.name === a.name))
      awards.push({
        id: a.name,
        name: a.name,
        description: a.name,
        unlockedAt: now,
      });
  }
  return { ...state, awards };
}
