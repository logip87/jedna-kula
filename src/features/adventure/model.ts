import { trainingRecommendations } from "../coaching/model";
import {
  boundaryDistance,
  type State,
  type Session,
  type Mode,
} from "../../domain";
export type Direction = "center" | "short" | "long" | "left" | "right";
export type Surface = "smooth" | "gravel" | "rough";
export interface AdventureConfig {
  audience: "junior" | "beginner";
  length: 10 | 15 | 20;
}
export interface PrecisionRound {
  id: string;
  startedAt: string;
  completedAt?: string;
  scores: number[];
  elapsedMs: number;
  shotStartedAt?: string;
  phase: "ready" | "aim" | "score";
  timed: boolean;
}
export interface Duel {
  id: string;
  startedAt: string;
  completedAt?: string;
  names: [string, string];
  kind: "versus" | "team";
  mode: "point" | "shoot";
  distance: number;
  rounds: number;
  target: number;
  scores: { player: number; points: number }[];
}
export interface AdventureState {
  config?: AdventureConfig;
  missionCompletions?: Record<
    string,
    { sessionId: string; completedAt: string }
  >;
  tactics?: Record<string, number>;
  precisionDraft?: PrecisionRound;
  precisionHistory?: PrecisionRound[];
  duelDraft?: Duel;
  duelHistory?: Duel[];
}
export const directions: { id: Direction; label: string; symbol: string }[] = [
  { id: "long", label: "Za długo", symbol: "↑" },
  { id: "left", label: "W lewo", symbol: "←" },
  { id: "center", label: "Na celu", symbol: "◎" },
  { id: "right", label: "W prawo", symbol: "→" },
  { id: "short", label: "Za krótko", symbol: "↓" },
];
export const defaultConfig: AdventureConfig = {
  audience: "beginner",
  length: 15,
};
export const missionKey = (config: AdventureConfig, index: number) =>
  `${config.audience}-${config.length}-${index}`;
export function missionCompleted(state: State, id: string) {
  return (
    !!state.adventure?.missionCompletions?.[id] ||
    state.sessions.some(
      (s) =>
        s.missionId === id &&
        !!s.completedAt &&
        s.plan.length > 0 &&
        s.results.length === s.plan.length,
    )
  );
}
export function recommendedTraining(state: State, maximumDistance = 10) {
  const now = new Date();
  const candidates = trainingRecommendations(state, now).filter(
    (candidate) => candidate.distance <= maximumDistance,
  );
  const lead = candidates[0];
  // Do not rotate a clearly stronger need. Similar priorities are rotated by
  // the last time they were recommended, so variety is a consequence of the
  // training history rather than randomness.
  const comparable = lead
    ? candidates.filter(
        (candidate) =>
          candidate.personalized && candidate.priority >= lead.priority * 0.75,
      )
    : [];
  const lastRecommended = (mode: Mode, distance: number) =>
    state.sessions
      .filter(
        (session) =>
          session.completedAt &&
          session.coach?.source === "recommended" &&
          session.plan.some(
            (attempt) => attempt.mode === mode && attempt.distance === distance,
          ),
      )
      .map((session) => Date.parse(session.completedAt!))
      .sort((a, b) => b - a)[0] ?? -Infinity;
  const r =
    comparable.length > 1
      ? [...comparable].sort(
          (a, b) =>
            lastRecommended(a.mode, a.distance) -
              lastRecommended(b.mode, b.distance) || b.priority - a.priority,
        )[0]
      : lead;
  if (!r) throw new Error("Brak wariantu treningu");
  const comparableSessions = state.sessions.filter(
    (session) =>
      !!session.completedAt &&
      !session.challenge &&
      !session.mastery &&
      session.kind !== "test" &&
      session.results.some(
        (attempt) => attempt.mode === r.mode && attempt.distance === r.distance,
      ),
  );
  const sampleCount = comparableSessions.reduce(
    (total, session) =>
      total +
      session.results.filter(
        (attempt) => attempt.mode === r.mode && attempt.distance === r.distance,
      ).length,
    0,
  );
  const personalized =
    r.personalized && r.count >= 20 && comparableSessions.length >= 2;
  return {
    mode: r.mode,
    distance: r.distance,
    count: personalized ? r.count : sampleCount,
    sessions: personalized
      ? Math.max(2, comparableSessions.length)
      : comparableSessions.length,
    rate: r.rate === null ? null : r.rate / 100,
    reason: r.reason,
    personalized,
    status: personalized ? ("ready" as const) : ("building" as const),
    rotationReason:
      comparable.length > 1 && r !== lead
        ? "Zmieniamy bodziec między podobnie ważnymi obszarami."
        : undefined,
  };
}

export function createPractice(
  drillId: string,
  mode: Mode,
  distances: number[],
  attempts: number,
  // `surface` is accepted only to read old callers/backups; it is ignored.
  options: { missionId?: string; targetSize?: number; surface?: Surface },
): Session {
  return {
    id: crypto.randomUUID(),
    drillId,
    startedAt: new Date().toISOString(),
    difficulty: "łatwy",
    targetSize: options.targetSize ?? 100,
    boundary: mode === "boundary" ? boundaryDistance : 60,
    plan: Array.from({ length: attempts }, (_, i) => ({
      distance: distances[i % distances.length],
      mode,
    })),
    results: [],
    score: 0,
    trackDirections: true,
    missionId: options.missionId,
  };
}
export function errorMap(
  state: State,
  mode: string,
  distance: string,
  surfaceOrLanding: string | boolean = false,
  legacyLanding = false,
) {
  const landing =
    typeof surfaceOrLanding === "boolean" ? surfaceOrLanding : legacyLanding;
  const attempts = state.sessions
    .flatMap((s) => s.results)
    .filter(
      (a) =>
        (!landing || a.mode === "lob") &&
        (mode === "all" || a.mode === mode) &&
        (distance === "all" || String(a.distance) === distance),
    );
  const entries = attempts
    .map((a) => (landing ? a.landingDirection : a.missDirection))
    .filter((d): d is Direction => !!d);
  const counts = Object.fromEntries(
    directions.map((d) => [d.id, entries.filter((e) => e === d.id).length]),
  ) as Record<Direction, number>;
  const dominant = directions
    .filter((d) => d.id !== "center")
    .sort((a, b) => counts[b.id] - counts[a.id])[0];
  return {
    counts,
    total: entries.length,
    missing: attempts.length - entries.length,
    dominant: dominant && counts[dominant.id] > 0 ? dominant : null,
  };
}
export const precisionPlan = Array.from({ length: 20 }, (_, i) => ({
  figure: Math.floor(i / 4) + 1,
  distance: 6 + (i % 4),
}));
export const precisionScores = (figure: number) =>
  figure === 5 ? [0, 3, 5] : [0, 1, 3, 5];
export const precisionTime = (round: PrecisionRound, now = Date.now()) =>
  round.elapsedMs +
  (round.phase === "aim" && round.shotStartedAt
    ? Math.max(0, now - new Date(round.shotStartedAt).getTime())
    : 0);
export const precisionTotal = (round: PrecisionRound) =>
  round.scores.reduce((a, b) => a + b, 0);
export function addPrecisionScore(
  round: PrecisionRound,
  points: number,
): PrecisionRound {
  const shot = precisionPlan[round.scores.length];
  if (
    !shot ||
    (round.timed && round.elapsedMs > 900000) ||
    round.phase !== "score" ||
    !precisionScores(shot.figure).includes(points)
  )
    throw new Error("Nieprawidłowa punktacja lub etap strzału");
  return {
    ...round,
    scores: [...round.scores, points],
    phase: "ready",
    shotStartedAt: undefined,
  };
}
export function addDuelScore(duel: Duel, points: number): Duel {
  if (
    duel.completedAt ||
    duel.scores.length >= duel.rounds * 2 ||
    !(duel.mode === "point" ? [0, 1, 2, 3] : [0, 1, 3, 5]).includes(points)
  )
    throw new Error("Nieprawidłowy wynik wyzwania");
  const result = {
    ...duel,
    scores: [...duel.scores, { player: duel.scores.length % 2, points }],
  };
  return result.scores.length === duel.rounds * 2
    ? { ...result, completedAt: new Date().toISOString() }
    : result;
}
