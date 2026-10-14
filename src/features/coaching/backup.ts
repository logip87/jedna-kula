import { throwScenarios, decisionReviews } from "../situations/throw-scenarios";
import { tacticCases } from "../adventure/data";
import { bossChapters, matchScore } from "../situations/model";
import type { MatchTraining } from "../situations/types";
import { masteryDrills } from "../development/model";
import { practiceModules, practiceSteps } from "../development/practices";
import { choices, type State, type Session } from "../../domain";
import { drills, lessons } from "../../data";

export const backupVersion = 6;
export function serializeBackup(state: State) {
  return JSON.stringify(
    {
      format: "jedna-kula",
      version: backupVersion,
      createdAt: new Date().toISOString(),
      data: state,
    },
    null,
    2,
  );
}
type Validator = (value: unknown, path: string) => void;
const fail = (path: string): never => {
  throw new Error(
    `Nieprawidłowa struktura kopii: ${path}. Dane nie zostały zmienione.`,
  );
};
const text: Validator = (v, p) => {
  if (typeof v !== "string" || v.length > 10000) fail(p);
};
const bool: Validator = (v, p) => {
  if (typeof v !== "boolean") fail(p);
};
const number =
  (min = 0, max = 1000000, integer = false): Validator =>
  (v, p) => {
    if (
      typeof v !== "number" ||
      !Number.isFinite(v) ||
      v < min ||
      v > max ||
      (integer && !Number.isInteger(v))
    )
      fail(p);
  };
const date: Validator = (v, p) => {
  text(v, p);
  if (!Number.isFinite(Date.parse(v as string))) fail(p);
};
const choice =
  (values: readonly unknown[]): Validator =>
  (v, p) => {
    if (!values.includes(v)) fail(p);
  };
const optional =
  (check: Validator): Validator =>
  (v, p) => {
    if (v !== undefined) check(v, p);
  };
const nullable =
  (check: Validator): Validator =>
  (v, p) => {
    if (v !== null) check(v, p);
  };
const array =
  (check: Validator, max = 100000): Validator =>
  (v, p) => {
    if (!Array.isArray(v) || v.length > max) fail(p);
    (v as unknown[]).forEach((x, i) => check(x, `${p}[${i}]`));
  };
const record =
  (check: Validator): Validator =>
  (v, p) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) fail(p);
    Object.entries(v as object).forEach(([key, x]) => {
      if (["__proto__", "constructor", "prototype"].includes(key)) fail(p);
      check(x, `${p}.${key}`);
    });
  };
const object =
  (shape: Record<string, Validator>): Validator =>
  (v, p) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) fail(p);
    for (const [key, check] of Object.entries(shape))
      check((v as Record<string, unknown>)[key], `${p}.${key}`);
  };
const mode = choice(["point", "shoot", "target", "boundary", "lob"]);
const direction = optional(
  choice(["center", "short", "long", "left", "right"]),
);
const planned = {
  situationId: optional(choice(throwScenarios.map((c) => c.id))),
  mode,
  distance: number(1, 20),
  role: optional(text),
  phase: optional(text),
};
const attempt = object({
  ...planned,
  id: text,
  result: text,
  points: number(0, 5, true),
  hit: bool,
  carreau: bool,
  outside: bool,
  landingHit: optional(bool),
  decision: optional(text),
  decisionReview: optional(choice(decisionReviews)),
  missDirection: direction,
  landingDirection: direction,
});
const block = object({
  title: text,
  instruction: text,
  minutes: number(1, 60, true),
  kind: choice(["warmup", "throws", "mental"]),
  start: number(0, 100000, true),
  end: number(0, 100000, true),
});
const session = object({
  mentalCueLessonId: optional(choice(lessons.map((l) => l.id))),
  situationChoice: optional(
    object({ index: number(0, 100000, true), title: text, mode }),
  ),
  coach: optional(
    object({
      source: choice([
        "recommended",
        "manual",
        "generator",
        "self",
        "adaptive",
      ]),
      referenceSessionId: optional(text),
      adaptation: optional(choice(["harder", "easier"])),
      oneChance: optional(bool),
    }),
  ),
  id: text,
  drillId: choice(drills.map((d) => d.id)),
  startedAt: date,
  completedAt: optional(date),
  difficulty: choice(["łatwy", "średni", "trudny"]),
  plan: array(object(planned)),
  results: array(attempt),
  score: number(),
  targetSize: number(1, 1000),
  boundary: number(0, 1000),
  kind: optional(choice(["training", "test"])),
  benchmarkVersion: optional(choice([1])),
  challenge: optional(
    object({
      kind: choice(["boss", "daily", "ladder", "pressure"]),
      id: text,
      version: choice([1]),
    }),
  ),
  mastery: optional(
    object({ tier: choice(["mastery", "legendary"]), version: choice([1]) }),
  ),
  stressLevel: optional(text),
  routineUsed: optional(bool),
  recovery: optional(text),
  mentalExerciseDone: optional(bool),
  missionId: optional(text),
  missionTitle: optional(text),
  missionCue: optional(text),
  trackDirections: optional(bool),
  surface: optional(choice(["smooth", "gravel", "rough"])),
  timedPhase: optional(number(0, 3, true)),
  phaseStartedAt: optional(date),
  trainingPlan: optional(
    object({
      minutes: choice([10, 20, 30, 45, 60]),
      focus: choice([
        "wszystko",
        "puenta",
        "strzał",
        "lob",
        "słabości",
        "presja",
        "lekko",
        "zawody",
      ]),
      index: number(0, 10, true),
      blocks: array(block, 10),
    }),
  ),
});
const precision = object({
  id: text,
  startedAt: date,
  completedAt: optional(date),
  scores: array(choice([0, 1, 3, 5]), 20),
  elapsedMs: number(0, Number.MAX_SAFE_INTEGER),
  shotStartedAt: optional(date),
  phase: choice(["ready", "aim", "score"]),
  timed: bool,
});
const duel = object({
  id: text,
  startedAt: date,
  completedAt: optional(date),
  names: array(text, 2),
  kind: choice(["versus", "team"]),
  mode: choice(["point", "shoot"]),
  distance: number(1, 20),
  rounds: number(1, 100, true),
  target: number(1, 1000, true),
  scores: array(
    object({ player: choice([0, 1]), points: number(0, 5, true) }),
    200,
  ),
});
const practice = object({
  cueLessonId: optional(choice(lessons.map((l) => l.id))),
  id: text,
  moduleId: choice(practiceModules.map((m) => m.id)),
  kind: choice(["mental", "physical"]),
  audience: choice(["junior", "adult"]),
  minutes: choice([2, 5, 10]),
  startedAt: date,
  completedAt: optional(date),
  step: number(0, 30, true),
  checkin: optional(
    object({ before: number(1, 5, true), after: optional(number(1, 5, true)) }),
  ),
});
const goal = object({
  id: text,
  sourceSessionId: optional(text),
  kind: choice(["accuracy", "routine"]),
  createdAt: date,
  target: number(1, 100, true),
  baseline: number(0, 100, true),
  mode: optional(mode),
  distance: optional(number(1, 20)),
  conditionKey: optional(text),
  drillId: optional(choice(drills.map((d) => d.id))),
  difficulty: optional(choice(["łatwy", "średni", "trudny"])),
  targetSize: optional(number(1, 1000)),
  boundary: optional(number(0, 1000)),
  surface: optional(choice(["smooth", "gravel", "rough"])),
});
const match = object({
  id: text,
  version: choice([1]),
  startedAt: date,
  completedAt: optional(date),
  initialScore: array(number(0, 12, true), 2),
  scenarios: array(choice(tacticCases.map((c) => c.id)), 6),
  choice: optional(number(0, 2, true)),
  ends: array(
    object({
      scenarioId: choice(tacticCases.map((c) => c.id)),
      choice: number(0, 2, true),
      ownPoints: number(0, 3, true),
      opponentPoints: number(0, 3, true),
    }),
    6,
  ),
});
const stateValidator = object({
  situations: optional(
    object({
      matchDraft: optional(match),
      matchHistory: optional(array(match)),
      dailyResults: optional(
        array(object({ day: date, sessionId: text, hit: bool })),
      ),
    }),
  ),
  player: nullable(
    object({
      id: text,
      name: text,
      age: optional(number(5, 110, true)),
      level: optional(
        choice(["beginner", "intermediate", "advanced", "tournament"]),
      ),
      preferredRole: text,
      preferredHand: text,
      createdAt: date,
      audience: optional(choice(["junior", "beginner", "athlete"])),
    }),
  ),
  lessons: array(choice(lessons.map((l) => l.id)), lessons.length),
  sessions: array(session),
  draft: nullable(session),
  awards: optional(
    array(
      object({
        id: text,
        name: text,
        description: text,
        unlockedAt: date,
        sourceSessionId: optional(text),
      }),
    ),
  ),
  rulesQuiz: optional(
    object({
      version: text,
      ids: array(text, 100),
      answers: record(number(0, 10, true)),
      startedAt: date,
      currentIndex: number(0, 100, true),
    }),
  ),
  adventure: optional(
    object({
      config: optional(
        object({
          audience: choice(["junior", "beginner"]),
          length: choice([10, 15, 20]),
        }),
      ),
      missionCompletions: optional(
        record(object({ sessionId: text, completedAt: date })),
      ),
      tactics: optional(record(number(0, 10, true))),
      precisionDraft: optional(precision),
      precisionHistory: optional(array(precision)),
      duelDraft: optional(duel),
      duelHistory: optional(array(duel)),
    }),
  ),
  coaching: optional(
    object({
      pendingMentalCueLessonId: optional(choice(lessons.map((l) => l.id))),
      weeklyGoals: array(object({ week: date, sessions: number(1, 7, true) })),
      weeklyChallenges: optional(
        array(
          object({
            week: date,
            kind: choice([
              "point-hits",
              "shoot-attempts",
              "distances",
              "routine",
            ]),
            target: number(1, 1000, true),
            distance: optional(number(1, 20, true)),
          }),
        ),
      ),
      goals: optional(array(goal)),
      xpEvents: optional(
        array(
          object({
            id: text,
            kind: choice([
              "session",
              "mental",
              "physical",
              "lesson",
              "quiz",
              "week",
              "challenge",
            ]),
            points: number(0, 100, true),
            earnedAt: date,
          }),
        ),
      ),
      practiceDraft: optional(practice),
      practiceHistory: optional(array(practice)),
      competition: optional(object({ date })),
    }),
  ),
});
function validateSession(s: Session) {
  const drill = drills.find((d) => d.id === s.drillId)!;
  if (!drill.timed && s.results.length > s.plan.length) fail("liczba rzutów");
  if (s.situationChoice && s.situationChoice.index !== s.results.length)
    fail("decyzja bieżącego rzutu");
  if (new Set(s.results.map((a) => a.id)).size !== s.results.length)
    fail("identyfikatory rzutów");
  if (s.score !== s.results.reduce((n, a) => n + a.points, 0))
    fail("suma punktów");
  for (const a of s.results) {
    if (a.decisionReview && !a.decision) fail("ocena decyzji bez zagrania");
    if (
      !choices[a.mode].some(
        (c) =>
          c.points === a.points &&
          c.hit === a.hit &&
          !!c.carreau === a.carreau &&
          !!c.outside === a.outside,
      )
    )
      fail("punktacja rzutu");
  }
  if (
    s.kind === "test" &&
    (!drill.test ||
      s.benchmarkVersion !== 1 ||
      s.difficulty !== "średni" ||
      s.plan.length !== drill.sequence!.length ||
      s.targetSize !== (s.plan[0]?.mode === "target" ? 100 : 50) ||
      s.plan.some(
        (a, i) => a.mode !== drill.mode || a.distance !== drill.sequence![i],
      ))
  )
    fail("warunki testu");
  if (drill.test && s.kind !== "test") fail("oznaczenie testu");
  if (
    (s.kind === "test" || s.mastery) &&
    s.results.some(
      (a, i) =>
        a.mode !== s.plan[i]?.mode || a.distance !== s.plan[i]?.distance,
    )
  )
    fail(s.kind === "test" ? "rzuty testu" : "rzuty próby mistrzowskiej");
  if (
    s.mastery &&
    (!masteryDrills.includes(s.drillId) ||
      s.kind === "test" ||
      s.plan.length !== 10 ||
      s.trainingPlan ||
      s.plan.some((a) => a.mode !== drill.mode))
  )
    fail("warunki próby mistrzowskiej");
  if (
    s.mastery?.tier === "mastery" &&
    !s.plan.every((a) => a.distance === s.plan[0].distance)
  )
    fail("dystans Mastery");
  if (
    s.mastery?.tier === "legendary" &&
    s.plan.some(
      (a, i) =>
        a.distance < 6 ||
        a.distance > 10 ||
        (i > 0 && a.distance === s.plan[i - 1].distance),
    )
  )
    fail("dystanse Legendary");
  if (s.challenge) {
    const c = s.challenge;
    if (
      s.mastery ||
      s.kind === "test" ||
      s.trainingPlan ||
      s.difficulty !== "średni" ||
      s.surface !== "gravel" ||
      s.boundary !== 40
    )
      fail("warunki wyzwania");
    if (
      s.results.some(
        (a, i) =>
          a.mode !== s.plan[i]?.mode || a.distance !== s.plan[i]?.distance,
      )
    )
      fail("rzuty wyzwania");
    if (c.kind === "boss") {
      const chapter = bossChapters.find((b) =>
        [10, 15, 20].some((n) => c.id === `junior-${n}-${b.id}`),
      );
      if (
        !chapter ||
        s.plan.length !== 10 ||
        s.drillId !== chapter.drillId ||
        s.targetSize !== 75 ||
        s.plan.some(
          (a, i) =>
            a.mode !==
              (chapter.id === "final"
                ? i < 5
                  ? "point"
                  : "shoot"
                : chapter.mode) ||
            a.distance !==
              (chapter.id === "final" ? (i < 5 ? 6 : 7) : chapter.distance),
        )
      )
        fail("Boss Test");
    } else if (c.kind === "daily") {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(c.id) ||
        s.drillId !== "target" ||
        s.targetSize !== 50 ||
        s.plan.length !== 1 ||
        s.plan.some((a) => a.mode !== "target" || ![7, 8].includes(a.distance))
      )
        fail("kula dnia");
    } else if (c.kind === "pressure") {
      if (
        c.id !== "pressure" ||
        s.drillId !== "shoot-basic" ||
        s.plan.length !== 9 ||
        s.targetSize !== 75 ||
        s.plan.some(
          (a) =>
            a.mode !== "shoot" ||
            ![7, 8].includes(a.distance) ||
            a.distance !== s.plan[0].distance,
        )
      )
        fail("presja 2/3");
    } else if (
      c.id !== "ladder" ||
      s.drillId !== "target" ||
      s.targetSize !== 75 ||
      s.plan.length !== 10 ||
      (s.plan.some(
        (a, i) => a.mode !== "target" || a.distance !== [6, 7, 8, 9, 10][i % 5],
      ) &&
        s.plan.some(
          (a, i) => a.mode !== "target" || a.distance !== [6, 7][i % 2],
        ))
    )
      fail("drabinka dystansów");
  }
  if (s.trainingPlan) {
    const p = s.trainingPlan;
    if (
      !p.blocks.length ||
      p.index >= p.blocks.length ||
      p.blocks.reduce((n, b) => n + b.minutes, 0) !== p.minutes
    )
      fail("etapy planu");
    let end = 0;
    for (const b of p.blocks) {
      if (
        b.start !== end ||
        b.end < b.start ||
        b.end > s.plan.length ||
        (b.kind !== "throws" && b.start !== b.end)
      )
        fail("rzuty w etapie");
      end = b.end;
    }
    if (end !== s.plan.length) fail("koniec planu");
    const current = p.blocks[p.index];
    if (
      !s.completedAt &&
      (s.results.length < current.start || s.results.length > current.end)
    )
      fail("bieżący etap");
  }
}
export function parseBackup(raw: string): State {
  if (raw.length > 10 * 1024 * 1024)
    throw new Error("Kopia przekracza limit 10 MB.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "To nie jest poprawny plik JSON. Dane nie zostały zmienione.",
    );
  }
  if (!parsed || typeof parsed !== "object") fail("plik");
  const envelope = parsed as Record<string, unknown>;
  const versioned =
    "version" in envelope || "format" in envelope || "data" in envelope;
  if (
    versioned &&
    (envelope.format !== "jedna-kula" ||
      ![2, 3, 4, 5, backupVersion].includes(envelope.version as number))
  )
    throw new Error("Nieobsługiwana wersja kopii. Dane nie zostały zmienione.");
  const data = versioned ? envelope.data : parsed;
  stateValidator(data, "dane");
  const state = data as State;
  if (new Set(state.sessions.map((s) => s.id)).size !== state.sessions.length)
    fail("identyfikatory sesji");
  state.sessions.forEach(validateSession);
  if (state.draft) validateSession(state.draft);
  for (const d of [
    ...(state.adventure?.duelHistory ?? []),
    ...(state.adventure?.duelDraft ? [state.adventure.duelDraft] : []),
  ]) {
    if (
      d.names.length !== 2 ||
      d.scores.length > d.rounds * 2 ||
      d.scores.some(
        (s, i) =>
          s.player !== i % 2 ||
          !(d.mode === "shoot" ? [0, 1, 3, 5] : [0, 1, 2, 3]).includes(
            s.points,
          ),
      )
    )
      fail("pojedynek");
  }
  for (const p of [
    ...(state.adventure?.precisionHistory ?? []),
    ...(state.adventure?.precisionDraft
      ? [state.adventure.precisionDraft]
      : []),
  ]) {
    if (p.scores.slice(16).includes(1)) fail("punktacja figury świnki");
  }
  for (const m of [
    ...(state.situations?.matchHistory ?? []),
    ...(state.situations?.matchDraft ? [state.situations.matchDraft] : []),
  ]) {
    if (
      m.initialScore.length !== 2 ||
      m.scenarios.length !== 6 ||
      new Set(m.scenarios).size !== 6 ||
      m.ends.length > 6 ||
      (m.choice !== undefined && m.ends.length >= 6)
    )
      fail("trening meczowy");
    m.ends.forEach((e, i) => {
      if (
        e.scenarioId !== m.scenarios[i] ||
        !tacticCases.find((c) => c.id === e.scenarioId)?.options[e.choice] ||
        (e.ownPoints > 0 && e.opponentPoints > 0)
      )
        fail("rozgrywka meczu");
      const before: MatchTraining = { ...m, ends: m.ends.slice(0, i) };
      if (matchScore(before).some((n) => n >= 13))
        fail("rozgrywka po zakończeniu meczu");
    });
    const finished = m.ends.length === 6 || matchScore(m).some((n) => n >= 13);
    if (
      !!m.completedAt !== finished ||
      (m.completedAt && m.choice !== undefined)
    )
      fail("zakończenie meczu");
  }
  if (
    state.situations?.matchHistory?.some((m) => !m.completedAt) ||
    state.situations?.matchDraft?.completedAt
  )
    fail("historia meczów");
  if (
    new Set(state.situations?.matchHistory?.map((m) => m.id)).size !==
    (state.situations?.matchHistory?.length ?? 0)
  )
    fail("identyfikatory meczów");
  if (
    new Set(state.situations?.dailyResults?.map((r) => r.day)).size !==
      (state.situations?.dailyResults?.length ?? 0) ||
    state.situations?.dailyResults?.some(
      (r) => !/^\d{4}-\d{2}-\d{2}$/.test(r.day),
    )
  )
    fail("historia kul dnia");
  const coaching = state.coaching;
  for (const p of [
    ...(coaching?.practiceHistory ?? []),
    ...(coaching?.practiceDraft ? [coaching.practiceDraft] : []),
  ]) {
    const module = practiceModules.find((m) => m.id === p.moduleId)!;
    const steps = practiceSteps(p);
    if (
      p.kind !== module.kind ||
      (p.kind !== "mental" && p.cueLessonId !== undefined) ||
      (p.kind === "mental" ? p.minutes !== 2 : p.minutes === 2) ||
      p.step > steps.length ||
      (p.completedAt ? p.step !== steps.length : p.step >= steps.length) ||
      (p.kind === "mental" &&
        (!p.checkin || (p.completedAt && p.checkin.after === undefined)))
    )
      fail("moduł praktyczny");
  }
  if (
    coaching?.practiceHistory?.some((p) => !p.completedAt) ||
    coaching?.practiceDraft?.completedAt
  )
    fail("historia modułów");
  for (const g of coaching?.goals ?? [])
    if (
      g.kind === "accuracy" &&
      (!g.conditionKey ||
        !g.mode ||
        !g.distance ||
        !g.drillId ||
        g.target < g.baseline)
    )
      fail("mikrocel");
  for (const c of coaching?.weeklyChallenges ?? [])
    if (c.kind === "shoot-attempts" && !c.distance) fail("dystans wyzwania");
  for (const list of [
    coaching?.goals ?? [],
    coaching?.xpEvents ?? [],
    coaching?.practiceHistory ?? [],
  ])
    if (new Set(list.map((x) => x.id)).size !== list.length)
      fail("identyfikatory postępu");
  if (
    coaching?.competition &&
    !/^\d{4}-\d{2}-\d{2}$/.test(coaching.competition.date)
  )
    fail("data zawodów");
  return structuredClone(state);
}
export function downloadBackup(
  content: string,
  name = "jedna-kula-kopia.json",
) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
