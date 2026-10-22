import { ruleAnswerKey } from "./answer-key";
import type { QuizQuestion, RulesQuizProgress } from "./model";
import { contentVersion } from "./model";
import { findRule } from "./catalog";
export const questions: QuizQuestion[] = [
  {
    id: "q01",
    ruleId: "jack-out",
    situation: "Świnka wypadła na aut. Masz 2 kule, rywal żadnej. Jaki wynik?",
    options: ["2 punkty dla Ciebie", "0 punktów", "2 punkty dla rywala"],
    explanation: "",
  },
  {
    id: "q02",
    ruleId: "jack-out",
    situation: "Świnka jest martwa. Obie drużyny mają jeszcze kule. Co teraz?",
    options: [
      "Punktuje bliższa kula",
      "Rozgrywka anulowana, 0 punktów",
      "Każdy rzuca pozostałe kule",
    ],
    explanation: "",
  },
  {
    id: "q03",
    ruleId: "jack-out",
    situation: "Świnka na aucie, nikomu nie zostały kule. Co robisz?",
    options: [
      "Przyznajesz punkt ostatnio rzucającemu",
      "Mierzysz od linii",
      "Anulujesz rozgrywkę bez punktów",
    ],
    explanation: "",
  },
  {
    id: "q04",
    ruleId: "boule-out",
    situation:
      "Kula częściowo leży nad linią autową, ale jej nie przekroczyła w całości.",
    options: ["Jest ważna", "Jest martwa", "Trzeba ją odsunąć od linii"],
    explanation: "",
  },
  {
    id: "q05",
    ruleId: "jack-dead",
    situation: "Świnka całkowicie minęła linię autową i wróciła na boisko.",
    options: [
      "Jest znów ważna",
      "Pozostaje martwa",
      "Zależy od najbliższej kuli",
    ],
    explanation: "",
  },
  {
    id: "q06",
    ruleId: "lines",
    situation:
      "Gracie na czas na oznaczonym boisku. Kula całkowicie przekracza boczną granicę.",
    options: [
      "Można grać na sąsiednim boisku",
      "Jest ważna, jeśli wróci",
      "Jest autowa",
    ],
    explanation: "",
  },
  {
    id: "q07",
    ruleId: "minute",
    situation:
      "Poprzednia kula się zatrzymała, pomiar nie jest potrzebny. Kiedy zaczyna się Twoja minuta?",
    options: ["Teraz", "Gdy wejdziesz do kółka", "Gdy weźmiesz kulę do ręki"],
    explanation: "",
  },
  {
    id: "q08",
    ruleId: "minute",
    situation: "Był konieczny pomiar. Kiedy zaczyna się czas na kolejną kulę?",
    options: [
      "Od początku pomiaru",
      "Po zakończeniu pomiaru",
      "Po podniesieniu miarki przez zawodnika",
    ],
    explanation: "",
  },
  {
    id: "q09",
    ruleId: "feet",
    situation: "Wychodzisz z kółka, gdy kula jeszcze leci. Czy to prawidłowe?",
    options: [
      "Tak, po wypuszczeniu kuli",
      "Tak, jeśli kula trafi cel",
      "Nie, trzeba czekać do kontaktu z ziemią",
    ],
    explanation: "",
  },
  {
    id: "q10",
    ruleId: "circle-size",
    situation:
      "Chcesz narysować własne kółko. Który zakres średnic jest właściwy?",
    options: ["35–50 cm", "20–30 cm", "60–80 cm"],
    explanation: "",
  },
  {
    id: "q11",
    ruleId: "circle-position",
    situation: "Kółko leży 60 cm od przeszkody. Czy spełnia minimum?",
    options: ["Tak", "Nie, minimum to 1 m", "Tak, jeśli wszyscy się zgodzą"],
    explanation: "",
  },
  {
    id: "q12",
    ruleId: "jack-distance",
    situation:
      "Gracie standardowy mecz seniorów. Świnka po rzucie jest na 5 m.",
    options: [
      "Ważna, bo jest widoczna",
      "Ważna, jeśli rywal ma punkt",
      "Nieprawidłowy dystans początkowy",
    ],
    explanation: "",
  },
  {
    id: "q13",
    ruleId: "jack-invalid",
    situation: "Twój jedyny rzut świnką jest za krótki. Co dalej?",
    options: [
      "Rywal ustawia prawidłowo; pierwszą kulę gra Twoja drużyna",
      "Masz jeszcze dwie próby",
      "Rywal ustawia i rzuca pierwszą kulę",
    ],
    explanation: "",
  },
  {
    id: "q14",
    ruleId: "jack-clearance",
    situation: "Świnka przy ustawieniu jest 20 cm od końcowej linii autowej.",
    options: [
      "Dopuszczalne w każdym meczu",
      "Nie spełnia minimum 50 cm",
      "Dopuszczalne przy dobrym rzucie",
    ],
    explanation: "",
  },
  {
    id: "q15",
    ruleId: "jack-moved",
    situation: "Oznaczona świnka została przypadkowo kopnięta.",
    options: [
      "Zostaje w nowym miejscu",
      "Rozgrywka zawsze anulowana",
      "Przywracasz oznaczoną pozycję",
    ],
    explanation: "",
  },
  {
    id: "q16",
    ruleId: "jack-unmarked",
    situation:
      "Nieoznaczona świnka została przypadkowo przesunięta. Można przywrócić ją z pamięci?",
    options: [
      "Nie, brak podstaw do odtworzenia pozycji",
      "Tak, po zgodzie partnera",
      "Tak, zawsze mierząc od kółka",
    ],
    explanation: "",
  },
  {
    id: "q17",
    ruleId: "turn",
    situation:
      "Twoja kula jest najbliżej świnki, rywal ma jeszcze kule. Kto rzuca?",
    options: ["Ty", "Rywal", "Zwycięzca losowania"],
    explanation: "",
  },
  {
    id: "q18",
    ruleId: "equal",
    situation:
      "Najbliższe kule obu stron są równo. Obie strony mają kule. Kto następny?",
    options: [
      "Zespół prowadzący w meczu",
      "Zespół z większą liczbą kul",
      "Strona, która rzucała ostatnio",
    ],
    explanation: "",
  },
  {
    id: "q19",
    ruleId: "equal",
    situation: "Najbliższe kule są równo, żadna drużyna nie ma kul.",
    options: [
      "Rozgrywka bez punktów",
      "Po jednym punkcie dla obu",
      "Losowanie punktu",
    ],
    explanation: "",
  },
  {
    id: "q20",
    ruleId: "measuring",
    situation: "Nie wiadomo, kto ma punkt. Kto powinien wykonać pomiar?",
    options: [
      "Wyłącznie kapitan rywali",
      "Ostatnio rzucający lub jego partner",
      "Osoba z największym stażem",
    ],
    explanation: "",
  },
  {
    id: "q21",
    ruleId: "measuring",
    situation: "Chcesz sprawdzić odległość, przykładając buty do ziemi.",
    options: [
      "Dozwolone, jeśli buty są jednakowe",
      "Dozwolone za zgodą rywala",
      "Niedozwolone — użyj przyrządu",
    ],
    explanation: "",
  },
  {
    id: "q22",
    ruleId: "measure-move",
    situation: "Poruszyłeś świnkę podczas swojego pomiaru.",
    options: [
      "Twoja drużyna traci punkt",
      "Powtarzasz poprzedni rzut",
      "Rywal dostaje 3 punkty",
    ],
    explanation: "",
  },
  {
    id: "q23",
    ruleId: "pickup",
    situation:
      "Kule już zagrane, ale punkty nie są uzgodnione. Podnosisz własną kulę.",
    options: [
      "Możesz domagać się za nią punktu z pamięci",
      "Kula jest nieważna i nie można żądać za nią punktu",
      "Nic się nie zmienia",
    ],
    explanation: "",
  },
  {
    id: "q24",
    ruleId: "wrong-boule",
    situation: "Pierwszy raz w meczu zagrywasz cudzą kulę.",
    options: [
      "Natychmiastowa dyskwalifikacja",
      "Kula automatycznie na aucie",
      "Ostrzeżenie; kula ważna, wymiana na własną",
    ],
    explanation: "",
  },
  {
    id: "q25",
    ruleId: "terrain-change",
    situation: "Przed strzałem chcesz wygładzić cały teren przed celem.",
    options: [
      "Nie wolno",
      "Wolno, jeśli użyjesz własnej kuli",
      "Wolno raz na rozgrywkę",
    ],
    explanation: "",
  },
  {
    id: "q26",
    ruleId: "boules-spec",
    situation:
      "Kolega proponuje dociążyć kulę w środku, żeby lepiej trzymała punkt.",
    options: [
      "Dopuszczalne przed turniejem",
      "Zabroniona modyfikacja",
      "Dopuszczalne w dublecie",
    ],
    explanation: "",
  },
  {
    id: "q27",
    ruleId: "junior-boules",
    situation:
      "Dziesięciolatek idzie na zwykły OPEN. Czy sam wiek gwarantuje kule 65 mm / 600 g?",
    options: [
      "Tak, w każdych zawodach",
      "Tak, do 17 lat",
      "Nie, wyjątek dotyczy zawodów przeznaczonych do 11 lat",
    ],
    explanation: "",
  },
  {
    id: "q28",
    ruleId: "teams",
    situation: "Grasz w triplecie. Ile kul ma każdy zawodnik?",
    options: ["2", "3", "6"],
    explanation: "",
  },
  {
    id: "q29",
    ruleId: "score",
    situation:
      "Masz 3 kule bliżej celu niż najlepsza rywala. Ile punktów zdobywasz?",
    options: ["1", "3", "6"],
    explanation: "",
  },
  {
    id: "q30",
    ruleId: "time-warning",
    situation:
      "Sędzia daje żółtą za przekroczenie czasu. Kogo obejmuje ostrzeżenie?",
    options: [
      "Tylko kapitana",
      "Tylko rzucającego",
      "Wszystkich zawodników drużyny",
    ],
    explanation: "",
  },
  {
    id: "q31",
    ruleId: "shoot-format",
    situation:
      "W eliminacjach MPSP 2026 zakończyłeś figurę 1 na 6 m. Co teraz?",
    options: ["Ta sama figura na 7 m", "Figura 2 na 6 m", "Figura 5 na 9 m"],
    explanation: "",
  },
  {
    id: "q32",
    ruleId: "shoot-valid",
    situation:
      "W MPSP rzucana kula przy pierwszym lądowaniu dotyka obrzeża koła celu.",
    options: [
      "Ważny strzał za 1 pkt",
      "Nieważny strzał",
      "Ważny, jeśli cel wyleci",
    ],
    explanation: "",
  },
  {
    id: "q33",
    ruleId: "shoot-points",
    situation: "Figura 5: trafiłeś świnkę, ale została w kole. Ile punktów?",
    options: ["1", "5", "3"],
    explanation: "",
  },
  {
    id: "q34",
    ruleId: "shoot-points",
    situation:
      "Figura 1: kula celu poza kołem, Twoja w kole. Ważne lądowanie. Ile punktów?",
    options: ["5", "3", "1"],
    explanation: "",
  },
  {
    id: "q35",
    ruleId: "mele",
    situation:
      "W supermele kończy się kolejna runda fazy wstępnej. Co ze składem?",
    options: [
      "Musi pozostać identyczny",
      "Jest ponownie losowany",
      "Sam wybierasz partnerów",
    ],
    explanation: "",
  },
  {
    id: "q36",
    ruleId: "mp-doubles-m",
    situation:
      "Turniej finałowy MPDM według regulaminu 30.12.2025. Jaki limit czasu?",
    options: ["50 min jak w kwalifikacjach", "70 min", "Bez limitu czasu"],
    explanation: "",
  },
].map((q) => ({
  ...q,
  correct: ruleAnswerKey[q.id],
  explanation: findRule(q.ruleId)!.shortAnswer,
}));
export function newQuiz(length: number): RulesQuizProgress {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    version: contentVersion,
    ids: shuffled.slice(0, length).map((q) => q.id),
    answers: {},
    currentIndex: 0,
    startedAt: new Date().toISOString(),
  };
}
export const quizScore = (progress: RulesQuizProgress) =>
  progress.ids.reduce(
    (score, id) =>
      score +
      (progress.answers[id] === questions.find((q) => q.id === id)?.correct
        ? 1
        : 0),
    0,
  );
