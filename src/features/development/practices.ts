import type { State } from "../../domain";
import type { PracticeSession } from "./types";
import {
  mentalLessons,
  mentalCompetencies,
  type MentalCompetency,
  type MentalLevel,
} from "../mental/catalog";

export interface PhysicalModuleSummary {
  module: PracticeModule;
  completed: number;
  lastCompletedAt?: string;
}
export interface PracticeModule {
  competency?: MentalCompetency;
  level?: MentalLevel;
  lessonId?: string;
  id: string;
  kind: "mental" | "physical";
  title: string;
  category: string;
  description: string;
  steps: string[];
  juniorSteps?: string[];
  extendedSteps?: string[];
  juniorExtendedSteps?: string[];
}
// Legacy module IDs and step counts keep existing drafts and completed backups readable.
const legacyModules = [
  ["mental-routine", "routine", 4],
  ["mental-reset", "mistake", 5],
  ["mental-pressure", "stress", 4],
  ["mental-visual", "goal", 4],
  ["mental-tension", "pressure-last", 4],
  ["mental-focus", "one", 4],
  ["mental-confidence", "trust", 4],
  ["mental-next", "good", 4],
  ["mental-match", "complete-decision", 4],
  ["mental-rising", "score", 4],
] as const;
export const practiceModules: PracticeModule[] = [
  ...mentalLessons.map((l) => {
    const legacy = legacyModules.find(([, lessonId]) => lessonId === l.id);
    const steps = [
      l.rule,
      l.example,
      l.exercise,
      "Po ćwiczeniu oceń napięcie. Wybierz wskazówkę do następnej serii technicznej.",
    ];
    if (legacy?.[2] === 5)
      steps.splice(2, 0, "Rozluźnij chwyt i wykonaj spokojny wydech.");
    return {
      id: legacy?.[0] ?? `mental-${l.id}`,
      lessonId: l.id,
      kind: "mental" as const,
      title: l.title,
      category: mentalCompetencies.find((c) => c.id === l.competency)!.name,
      competency: l.competency,
      level: l.level,
      description: l.description,
      steps,
    };
  }),
  {
    id: "physical-mobility",
    kind: "physical",
    title: "Mobilność do rzutu",
    category: "Mobilność",
    description: "Barki, łopatki, nadgarstki, biodra, kostki i tułów.",
    steps: [
      "30 s spokojnego marszu w miejscu.",
      "Po 5 małych krążeń barków w obie strony; ręce luźno.",
      "8 spokojnych ruchów łopatek: lekko zbliż i rozluźnij, bez unoszenia barków.",
      "Po 5 krążeń nadgarstków w obie strony, bez kuli.",
      "5 niewielkich skrętów klatki piersiowej na każdą stronę, biodra spokojnie.",
      "5 łagodnych przeniesień ciężaru z nogi na nogę i 5 krążeń kostki na stronę.",
    ],
    juniorSteps: [
      "30 s marszu jak przed wejściem do koła.",
      "Po 4 małe krążenia barków w obie strony.",
      "5 razy lekko zbliż łopatki i rozluźnij.",
      "Po 4 krążenia nadgarstków bez kuli.",
      "4 małe skręty tułowia na stronę.",
      "4 przeniesienia ciężaru i 4 krążenia kostki na stronę.",
    ],
    extendedSteps: [
      "Połóż dłonie na biodrach i zrób po 5 wolnych skrętów tułowia na stronę.",
      "Zrób po 5 spokojnych ruchów ręki jak do rzutu, bez kuli.",
      "Stań wygodnie w pozycji rzutu i wykonaj 3 spokojne oddechy.",
    ],
    juniorExtendedSteps: [
      "Po 4 wolne skręty tułowia na stronę, dłonie na biodrach.",
      "4 ruchy ręki jak do rzutu, bez kuli.",
      "Stań w pozycji rzutu i wykonaj 2 spokojne oddechy.",
    ],
  },
  {
    id: "physical-stability",
    kind: "physical",
    title: "Stabilne koło",
    category: "Stabilizacja",
    description: "Równowaga i spokojny tułów.",
    steps: [
      "20 s balansu na jednej nodze na stronę, przy stabilnym podparciu.",
      "Leżąc na plecach z ugiętymi kolanami, po 5 razy wyprostuj przeciwną rękę i nogę w małym zakresie. Lędźwie zostają przy podłożu.",
      "W klęku podpartym po 5 razy wyprostuj przeciwną rękę i nogę. Tułów pozostaje spokojny.",
      "Oprzyj dłonie o ścianę, utrzymaj tułów w jednej linii przez 20 s.",
      "Boczna stabilizacja przy ścianie: przedramię oparte, lekki nacisk, po 15 s na stronę.",
    ],
    juniorSteps: [
      "10 s balansu na nodze przy podparciu, każda strona.",
      "Leżąc na plecach, powoli odsuń jedną piętę po podłożu, po 4 razy na stronę.",
      "W klęku podpartym unieś tylko jedną rękę, po 4 razy na stronę.",
      "10 s podparcia dłońmi o ścianę, tułów spokojnie.",
      "10 s lekkiego oparcia bokiem przedramieniem o ścianę, każda strona.",
    ],
    extendedSteps: [
      "Przy podparciu wykonaj po 5 spokojnych przeniesień ciężaru na każdą nogę.",
      "W pozycji rzutu zatrzymaj się na 20 s; oddychaj swobodnie.",
      "Powtórz po 10 s balansu na każdej nodze przy podparciu.",
    ],
    juniorExtendedSteps: [
      "Przy podparciu wykonaj po 4 spokojne przeniesienia ciężaru na każdą nogę.",
      "W pozycji rzutu zatrzymaj się na 10 s i oddychaj swobodnie.",
      "Powtórz po 8 s balansu na każdej nodze przy podparciu.",
    ],
  },
  {
    id: "physical-legs",
    kind: "physical",
    title: "Nogi bez pośpiechu",
    category: "Nogi",
    description: "Pozycja i kontrolowane przeniesienie ciężaru.",
    steps: [
      "30 s spokojnego marszu.",
      "5 płytkich przysiadów przy stabilnym podparciu, kolana w kierunku stóp.",
      "W małym rozkroku wykrocznym zrób po 4 niewielkie ugięcia kolan na stronę, przy podparciu.",
      "Po 4 wejścia na niski, stabilny stopień na stronę, przy poręczy. Jeśli nie ma stopnia, przenieś ciężar z nogi na nogę.",
      "Przez 15 s utrzymaj wygodną pozycję rzutu. Nie pogłębiaj ugięcia.",
    ],
    juniorSteps: [
      "30 s spokojnego marszu.",
      "4 niewielkie przysiady przy podparciu.",
      "3 małe ugięcia w pozycji wykrocznej na stronę przy podparciu.",
      "Po 3 wejścia na niski stabilny stopień z podparciem albo przeniesienia ciężaru.",
      "10 s spokojnego stania w pozycji rzutu.",
    ],
    extendedSteps: [
      "Przy podparciu wykonaj jeszcze po 4 płytkie przysiady.",
      "Po 5 razy przenieś ciężar do przodu i do tyłu, stopy zostają na podłożu.",
      "Przez 20 s utrzymaj spokojną pozycję rzutu.",
    ],
    juniorExtendedSteps: [
      "Przy podparciu wykonaj jeszcze po 3 małe przysiady.",
      "Po 4 razy przenieś ciężar do przodu i do tyłu.",
      "Przez 12 s utrzymaj spokojną pozycję rzutu.",
    ],
  },
  {
    id: "physical-arm",
    kind: "physical",
    title: "Bark i ramię",
    category: "Bark i ramię",
    description: "Lekki ruch bez obciążenia.",
    steps: [
      "Po 5 małych krążeń barków w obie strony.",
      "5 ślizgów dłoni po ścianie w wygodnym zakresie, bez unoszenia barków.",
      "5 delikatnych pompek przy ścianie; ciało w jednej linii.",
      "5 powolnych wahadeł ręki bez kuli.",
      "5 otwarć i zamknięć dłoni, potem rozluźnij chwyt.",
    ],
    juniorSteps: [
      "Po 4 małe krążenia barków.",
      "4 spokojne przesunięcia dłoni po ścianie.",
      "4 delikatne pompki przy ścianie z bliskiej odległości.",
      "4 wolne wahadła ręki bez kuli.",
      "4 otwarcia dłoni i rozluźnienie chwytu.",
    ],
    extendedSteps: [
      "Po 5 razy wolno unieś i opuść rękę w wygodnym zakresie.",
      "Przy ścianie wykonaj jeszcze 5 lekkich ugięć rąk.",
      "Zrób 5 spokojnych ruchów rzutu bez kuli, rozluźniając dłoń po każdym ruchu.",
    ],
    juniorExtendedSteps: [
      "Po 4 razy wolno unieś i opuść rękę w wygodnym zakresie.",
      "Przy ścianie wykonaj jeszcze 4 lekkie ugięcia rąk.",
      "Zrób 4 spokojne ruchy rzutu bez kuli.",
    ],
  },
  {
    id: "physical-coordination",
    kind: "physical",
    title: "Ruch, stop, rzut",
    category: "Koordynacja",
    description: "Wzrok i ręka wracają do jednego zadania.",
    steps: [
      "Spójrz na wybrany punkt, potem na punkt lądowania; 5 spokojnych zmian.",
      "Zrób 5 ruchów rzutu bez kuli w tym samym rytmie.",
      "Stań przy podparciu na jednej nodze: po 15 s na stronę.",
      "Zrób dwa spokojne kroki, zatrzymaj się, przyjmij pozycję i wykonaj ruch rzutu bez kuli; 5 razy.",
      "Zakończ trzema pełnymi rutynami bez kuli.",
    ],
    juniorSteps: [
      "4 spokojne zmiany wzroku między dwoma punktami.",
      "4 ruchy rzutu bez kuli.",
      "Po 10 s balansu przy podparciu.",
      "Dwa kroki, stop i ruch ręki bez kuli; 4 razy.",
      "Trzy rutyny: Plan. Oddech. Wykonanie. Reset.",
    ],
    extendedSteps: [
      "Wybierz punkt lądowania i wykonaj 5 spokojnych ruchów rzutu bez kuli.",
      "Przy podparciu stań po 20 s na każdej nodze.",
      "Zrób 3 wolne przejścia: dwa kroki, zatrzymanie, pozycja rzutu i ruch ręki.",
    ],
    juniorExtendedSteps: [
      "Wybierz punkt lądowania i wykonaj 4 ruchy rzutu bez kuli.",
      "Przy podparciu stań po 12 s na każdej nodze.",
      "Zrób 3 wolne przejścia: dwa kroki, zatrzymanie i ruch ręki.",
    ],
  },
];

export function physicalModuleHistory(state: State): PhysicalModuleSummary[] {
  const completed = (state.coaching?.practiceHistory ?? [])
    .filter((practice) => practice.kind === "physical" && practice.completedAt)
    .sort((a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!));
  return practiceModules
    .filter((module) => module.kind === "physical")
    .map((module) => {
      const entries = completed.filter(
        (practice) => practice.moduleId === module.id,
      );
      return {
        module,
        completed: entries.length,
        lastCompletedAt: entries.at(-1)?.completedAt,
      };
    });
}

export function recommendedPhysicalModule(state: State, now = new Date()) {
  const history = physicalModuleHistory(state);
  const recent = (state.coaching?.practiceHistory ?? [])
    .filter((practice) => practice.kind === "physical" && practice.completedAt)
    .sort((a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!))
    .slice(-5)
    .map((practice) => practice.moduleId);
  const maxCompleted = Math.max(0, ...history.map((item) => item.completed));
  const scored = history.map((item, index) => {
    const daysSince = item.lastCompletedAt
      ? Math.max(
          0,
          Math.floor(
            (now.getTime() - Date.parse(item.lastCompletedAt)) / 86_400_000,
          ),
        )
      : 60;
    const recentPosition = recent.lastIndexOf(item.module.id);
    const recentPenalty =
      recentPosition < 0 ? 0 : (recent.length - recentPosition) * 24;
    return {
      ...item,
      score:
        Math.min(daysSince, 30) +
        (maxCompleted - item.completed) * 7 -
        recentPenalty,
      daysSince,
      index,
    };
  });
  const best = scored.sort(
    (a, b) => b.score - a.score || a.index - b.index,
  )[0]!;
  return {
    ...best,
    reason: !best.lastCompletedAt
      ? "Jeszcze nie wykonywałeś tego modułu."
      : recent.includes(best.module.id)
        ? "Dla urozmaicenia po ostatnich modułach."
        : best.daysSince >= 7
          ? "Dawno nie wykonywałeś tego modułu."
          : "Dobry, spokojny wybór na dziś.",
  };
}

export function timeSincePractice(value?: string, now = new Date()) {
  if (!value) return "jeszcze nie wykonywano";
  const days = Math.max(
    0,
    Math.floor((now.getTime() - Date.parse(value)) / 86_400_000),
  );
  if (days === 0) return "dzisiaj";
  if (days === 1) return "wczoraj";
  return `${days} dni temu`;
}
export function practiceSteps(session: PracticeSession) {
  const module = practiceModules.find((m) => m.id === session.moduleId);
  if (!module) return [];
  const steps =
    session.audience === "junior"
      ? (module.juniorSteps ?? module.steps)
      : module.steps;
  if (session.minutes !== 10) return steps;
  const extended =
    session.audience === "junior"
      ? (module.juniorExtendedSteps ?? module.extendedSteps ?? [])
      : (module.extendedSteps ?? []);
  return [
    ...steps,
    "Odpocznij około minuty i napij się wody, jeśli chcesz.",
    ...extended,
  ];
}
export function startPractice(
  state: State,
  id: string,
  minutes: 2 | 5 | 10,
  audience: "junior" | "adult",
  before = 3,
): State {
  const module = practiceModules.find((m) => m.id === id);
  if (!module) throw new Error("Nieznany moduł.");
  if (
    module.kind === "mental" &&
    (!Number.isInteger(before) || before < 1 || before > 5)
  )
    throw new Error("Napięcie musi być liczbą od 1 do 5.");
  if (state.coaching?.practiceDraft) return state;
  if (
    (module.kind === "mental" && minutes !== 2) ||
    (module.kind === "physical" && minutes === 2)
  )
    throw new Error("Nieprawidłowy czas modułu.");
  return {
    ...state,
    coaching: {
      weeklyGoals: [],
      ...state.coaching,
      practiceDraft: {
        id: crypto.randomUUID(),
        moduleId: id,
        kind: module.kind,
        audience,
        minutes,
        startedAt: new Date().toISOString(),
        step: 0,
        ...(module.kind === "mental" ? { checkin: { before } } : {}),
      },
    },
  };
}
export function advancePractice(state: State, after?: number): State {
  const draft = state.coaching?.practiceDraft;
  if (!draft) return state;
  const steps = practiceSteps(draft);
  if (draft.step >= steps.length) throw new Error("Moduł jest już zakończony.");
  const last = draft.step === steps.length - 1;
  if (
    last &&
    draft.kind === "mental" &&
    (!Number.isInteger(after) || after! < 1 || after! > 5)
  )
    throw new Error("Wybierz napięcie 1–5.");
  const next = {
    ...draft,
    step: draft.step + 1,
    ...(last
      ? {
          completedAt: new Date().toISOString(),
          ...(draft.kind === "mental"
            ? { checkin: { before: draft.checkin!.before, after } }
            : {}),
        }
      : {}),
  };
  return {
    ...state,
    coaching: {
      weeklyGoals: [],
      ...state.coaching,
      ...(last && draft.kind === "mental" && draft.cueLessonId
        ? { pendingMentalCueLessonId: draft.cueLessonId }
        : {}),
      practiceDraft: last ? undefined : next,
      practiceHistory: last
        ? [...(state.coaching?.practiceHistory ?? []), next]
        : state.coaching?.practiceHistory,
    },
  };
}

export function selectPracticeCue(state: State, lessonId?: string): State {
  const draft = state.coaching?.practiceDraft;
  if (!draft || draft.kind !== "mental") return state;
  if (lessonId && !mentalLessons.some((l) => l.id === lessonId))
    throw new Error("Nieznana wskazówka mentalna.");
  return {
    ...state,
    coaching: {
      weeklyGoals: [],
      ...state.coaching,
      practiceDraft: { ...draft, cueLessonId: lessonId },
    },
  };
}
