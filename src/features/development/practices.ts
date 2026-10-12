import type { State } from "../../domain";
import type { PracticeSession } from "./types";
import {
  mentalLessons,
  mentalCompetencies,
  type MentalCompetency,
  type MentalLevel,
} from "../mental/catalog";
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
  },
  {
    id: "physical-stability",
    kind: "physical",
    title: "Stabilne koło",
    category: "Stabilizacja",
    description: "Równowaga i spokojny tułów.",
    steps: [
      "20 s balansu na jednej nodze na stronę, przy stabilnym podparciu.",
      "Dead bug: na plecach, kolana zgięte. Po 5 spokojnych wyprostów przeciwnej ręki i nogi w małym zakresie, bez odrywania lędźwi.",
      "Bird dog: w klęku podpartym, po 5 niewielkich wyprostów przeciwnej ręki i nogi, bez kołysania.",
      "Plank przy ścianie: dłonie na ścianie, tułów w jednej linii, 20 s.",
      "Boczna stabilizacja przy ścianie: przedramię oparte, lekki nacisk, po 15 s na stronę.",
    ],
    juniorSteps: [
      "10 s balansu na nodze przy podparciu, każda strona.",
      "Dead bug: na plecach, powoli odsuń jedną piętę po podłożu, po 4 razy na stronę.",
      "Bird dog: w klęku podpartym unieś tylko jedną rękę, po 4 razy na stronę.",
      "10 s podparcia dłońmi o ścianę, tułów spokojnie.",
      "10 s lekkiego oparcia bokiem przedramieniem o ścianę, każda strona.",
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
      "Split squat: mały rozkrok wykroczny, 4 niewielkie ugięcia kolan na stronę przy podparciu.",
      "Po 4 wejścia na niski, stabilny stopień na stronę, z dostępną poręczą. Jeśli nie ma stopnia, zrób przeniesienia ciężaru.",
      "15 s utrzymania wygodnej pozycji rzutu. Nie pogłębiaj ugięcia.",
    ],
    juniorSteps: [
      "30 s spokojnego marszu.",
      "4 niewielkie przysiady przy podparciu.",
      "3 małe ugięcia w pozycji wykrocznej na stronę przy podparciu.",
      "Po 3 wejścia na niski stabilny stopień z podparciem albo przeniesienia ciężaru.",
      "10 s spokojnego stania w pozycji rzutu.",
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
  },
];
export function practiceSteps(session: PracticeSession) {
  const module = practiceModules.find((m) => m.id === session.moduleId);
  if (!module) return [];
  const steps =
    session.audience === "junior"
      ? (module.juniorSteps ?? module.steps)
      : module.steps;
  return session.minutes === 10
    ? [
        ...steps,
        "Odpocznij około minuty. Powtórz spokojnie tę samą sekwencję.",
        ...steps,
      ]
    : steps;
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
      practiceDraft: last ? undefined : next,
      practiceHistory: last
        ? [...(state.coaching?.practiceHistory ?? []), next]
        : state.coaching?.practiceHistory,
    },
  };
}
