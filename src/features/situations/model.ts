import { localDay, type State, type Session } from "../../domain";
import { tacticCases } from "../adventure/data";
import {
  createPractice,
  defaultConfig,
  missionCompleted,
  missionKey,
} from "../adventure/model";
import { audience, masteryHits } from "../development/model";
import type { MatchTraining, SessionChallenge } from "./types";

export const bossChapters = [
  {
    id: "point",
    title: "Puenta 6 m",
    drillId: "target",
    mode: "target" as const,
    distance: 6,
    metric: "trafień w koło",
  },
  {
    id: "shoot",
    title: "Strzał 7 m",
    drillId: "shoot-basic",
    mode: "shoot" as const,
    distance: 7,
    metric: "trafień z usunięciem celu",
  },
  {
    id: "lob",
    title: "Lądowanie 6 m",
    drillId: "lob",
    mode: "lob" as const,
    distance: 6,
    metric: "trafień w pierwsze lądowanie",
  },
  {
    id: "final",
    title: "Puenta i strzał",
    drillId: "roles",
    mode: "point" as const,
    distance: 7,
    metric: "trafień",
  },
];
export function bossProgress(state: State, index: number) {
  const config = state.adventure?.config ?? defaultConfig;
  const chapter = bossChapters[index];
  if (!chapter) throw new Error("Nieznany rozdział.");
  const id = `junior-${config.length}-${chapter.id}`;
  const available =
    config.audience === "junior" && (index + 1) * 5 <= config.length;
  const count = Array.from({ length: (index + 1) * 5 }, (_, i) =>
    missionCompleted(state, missionKey(config, i)),
  ).filter(Boolean).length;
  return {
    id,
    available,
    unlocked: available && count >= (index + 1) * 5,
    count,
    required: (index + 1) * 5,
    passed:
      !!state.awards?.some((a) => a.id === `boss:${id}`) ||
      state.sessions.some(
        (s) =>
          s.challenge?.kind === "boss" &&
          s.challenge.id === id &&
          challengePassed(s),
      ),
  };
}
export function challengePassed(s: Session) {
  if (!s.completedAt || s.results.length !== s.plan.length || !s.challenge)
    return false;
  if (s.challenge.kind === "pressure")
    return (
      [0, 3, 6].every(
        (i) => s.results.slice(i, i + 3).filter((a) => a.hit).length >= 2,
      ) && s.results.length === 9
    );
  return (
    masteryHits(s) >=
    (s.challenge.kind === "boss" ? 6 : s.challenge.kind === "ladder" ? 7 : 1)
  );
}
export function createBoss(state: State, index: number): Session {
  const p = bossProgress(state, index),
    c = bossChapters[index];
  if (!p.unlocked) throw new Error("Najpierw ukończ misje tego rozdziału.");
  const s = createPractice(c.drillId, c.mode, [c.distance], 10, {
    surface: "gravel",
    targetSize: 75,
  });
  return {
    ...s,
    trackDirections: false,
    difficulty: "średni",
    targetSize: 75,
    boundary: 40,
    ...(c.id === "final"
      ? {
          plan: s.plan.map((a, i) => ({
            ...a,
            mode: i < 5 ? ("point" as const) : ("shoot" as const),
            distance: i < 5 ? 6 : 7,
          })),
        }
      : {}),
    challenge: { kind: "boss", id: p.id, version: 1 },
  };
}
export function createExtraChallenge(
  state: State,
  kind: Exclude<SessionChallenge["kind"], "boss">,
  now = new Date(),
): Session {
  const junior = audience(state) === "junior",
    day = localDay(now);
  if (
    kind === "daily" &&
    (state.situations?.dailyResults?.some((r) => r.day === day) ||
      state.sessions.some(
        (s) =>
          s.completedAt &&
          s.challenge?.kind === "daily" &&
          s.challenge.id === day,
      ))
  )
    throw new Error(
      "Kula dnia jest już zapisana. Wróć jutro albo wybierz pełne wyzwanie.",
    );
  const mode = kind === "pressure" ? "shoot" : "target",
    count = kind === "daily" ? 1 : kind === "pressure" ? 9 : 10;
  const distances =
    kind === "ladder" ? (junior ? [6, 7] : [6, 7, 8, 9, 10]) : [junior ? 7 : 8];
  return {
    ...createPractice(
      kind === "pressure" ? "shoot-basic" : "target",
      mode,
      distances,
      count,
      { surface: "gravel", targetSize: kind === "daily" ? 50 : 75 },
    ),
    trackDirections: false,
    difficulty: "średni",
    boundary: 40,
    challenge: { kind, id: kind === "daily" ? day : kind, version: 1 },
  };
}
export function awardSituations(previous: State, next: State): State {
  const awards = [...(next.awards ?? [])],
    daily = [...(next.situations?.dailyResults ?? [])];
  for (const s of next.sessions.filter(
    (s) =>
      s.completedAt &&
      s.challenge &&
      !previous.sessions.some((p) => p.id === s.id && p.completedAt),
  )) {
    if (
      s.challenge!.kind === "daily" &&
      s.results.length === 1 &&
      !daily.some((r) => r.day === s.challenge!.id)
    )
      daily.push({
        day: s.challenge!.id,
        sessionId: s.id,
        hit: s.results[0].hit,
      });
    if (s.challenge!.kind !== "daily" && challengePassed(s)) {
      const id = `${s.challenge!.kind}:${s.challenge!.id}`;
      if (!awards.some((a) => a.id === id))
        awards.push({
          id,
          name:
            s.challenge!.kind === "boss"
              ? `Sprawdzian rozdziału · ${bossChapters.find((c) => s.challenge!.id.endsWith(c.id))?.title ?? "Junior"}`
              : s.challenge!.kind === "ladder"
                ? "Drabinka dystansów"
                : "Presja 2/3",
          description: "Pełna próba w ustalonych warunkach.",
          unlockedAt: s.completedAt!,
          sourceSessionId: s.id,
        });
    }
  }
  return {
    ...next,
    awards,
    situations: { ...next.situations, dailyResults: daily },
  };
}
export function matchScore(m: MatchTraining): [number, number] {
  return m.ends.reduce<[number, number]>(
    (s, e) => [s[0] + e.ownPoints, s[1] + e.opponentPoints],
    [...m.initialScore],
  );
}
export function startMatch(
  state: State,
  initial: [number, number] = [0, 0],
  firstScenarioId?: string,
): State {
  if (state.situations?.matchDraft) return state;
  if (initial.some((n) => !Number.isInteger(n) || n < 0 || n > 12))
    throw new Error("Wynik początkowy: od 0 do 12.");
  const pool = tacticCases.map((c) => c.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (firstScenarioId && pool.includes(firstScenarioId)) {
    pool.splice(pool.indexOf(firstScenarioId), 1);
    pool.unshift(firstScenarioId);
  }
  const match: MatchTraining = {
    id: crypto.randomUUID(),
    version: 1,
    startedAt: new Date().toISOString(),
    initialScore: initial,
    scenarios: pool.slice(0, 6),
    ends: [],
  };
  return { ...state, situations: { ...state.situations, matchDraft: match } };
}
export function chooseMatch(state: State, choice: number): State {
  const m = state.situations?.matchDraft;
  if (!m || m.choice !== undefined) return state;
  const c = tacticCases.find((c) => c.id === m.scenarios[m.ends.length]);
  if (!c || !Number.isInteger(choice) || !c.options[choice])
    throw new Error("Nieznana decyzja.");
  return {
    ...state,
    situations: { ...state.situations, matchDraft: { ...m, choice } },
  };
}
export function advanceMatch(
  state: State,
  ownPoints: number,
  opponentPoints: number,
): State {
  const m = state.situations?.matchDraft;
  if (!m || m.choice === undefined)
    throw new Error("Najpierw wybierz zagranie.");
  if (
    [ownPoints, opponentPoints].some(
      (n) => !Number.isInteger(n) || n < 0 || n > 3,
    ) ||
    (ownPoints > 0 && opponentPoints > 0)
  )
    throw new Error("Punkty rozgrywki: 0–3 dla jednej strony.");
  const next = {
    ...m,
    choice: undefined,
    ends: [
      ...m.ends,
      {
        scenarioId: m.scenarios[m.ends.length],
        choice: m.choice,
        ownPoints,
        opponentPoints,
      },
    ],
  };
  const completed =
    matchScore(next).some((n) => n >= 13) ||
    next.ends.length === next.scenarios.length;
  return {
    ...state,
    situations: {
      ...state.situations,
      matchDraft: completed ? undefined : next,
      matchHistory: completed
        ? [
            ...(state.situations?.matchHistory ?? []),
            { ...next, completedAt: new Date().toISOString() },
          ]
        : state.situations?.matchHistory,
    },
  };
}
