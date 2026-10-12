import type { Drill, Mode } from "../../domain";
const make = (
  id: string,
  name: string,
  mode: Mode,
  instructions: string,
  sequence?: number[],
  attempts = 10,
  pressure = false,
): Drill => ({
  id,
  name,
  mode,
  category: mode === "shoot" ? "Strzał" : mode === "lob" ? "Lob" : "Puenta",
  group: pressure
    ? "Presja"
    : mode === "shoot"
      ? "Strzał"
      : mode === "lob"
        ? "Lob"
        : "Puenta",
  description: instructions.split(". ")[0] + ".",
  instructions,
  sequence,
  distances: sequence
    ? [...new Set(sequence)].sort((a, b) => a - b)
    : [6, 7, 8, 9, 10],
  attempts,
  cue: pressure
    ? "Jeden oddech. Następna kula."
    : "Plan. Oddech. Wykonanie. Reset.",
  requiredHits: pressure && attempts === 1 ? 1 : undefined,
  minutes: 15,
});
export const extraDrills: Drill[] = [
  make(
    "point-ladder",
    "Drabina puenty 6–10 m",
    "point",
    "Dwie kule na każdy dystans: 6, 7, 8, 9 i 10 m. Zmierz końcową odległość od świnki.",
    [6, 6, 7, 7, 8, 8, 9, 9, 10, 10],
  ),
  make(
    "point-up-down",
    "Drabina w górę i w dół",
    "point",
    "Jeden rzut na dystans. Przejdź od 6 do 10 m i wróć do 6 m.",
    [6, 7, 8, 9, 10, 9, 8, 7, 6],
    9,
  ),
  make(
    "point-corridor",
    "Korytarz",
    "target",
    "Wyznacz korytarz o szerokości wybranego celu i długości 2 m przed świnką. Trafienie: kula przeszła korytarzem i zatrzymała się w kole celu. Inaczej zapisz poza celem.",
  ),
  make(
    "point-behind",
    "Puenta za przeszkodę",
    "point",
    "Ustaw kulę przeszkodę 1 m przed świnką. Wybierz punkt lądowania za przeszkodą. Mierz odległość końcową od świnki.",
  ),
  make(
    "point-before",
    "Puenta przed przeszkodę",
    "point",
    "Ustaw kulę przeszkodę 50 cm za świnką. Zaplanuj zatrzymanie przed nią. Mierz odległość końcową od świnki.",
  ),
  make(
    "point-one",
    "Jedna kula",
    "point",
    "Tylko jeden rzut na ustawienie. Po każdym wyniku zbierz kulę i ustaw cel ponownie. Nie poprawiaj tego rzutu.",
    undefined,
    10,
    true,
  ),
  make(
    "point-three",
    "Trzy kule",
    "point",
    "Graj kolejkami po trzy kule. Zapisz pozycję każdej względem świnki. Przed następną kolejką zbierz kule.",
    undefined,
    12,
  ),
  make(
    "shoot-ladder",
    "Drabina strzału 6–10 m",
    "shoot",
    "Dwa strzały na każdy dystans. Kolejność 6, 7, 8, 9, 10 m.",
    [6, 6, 7, 7, 8, 8, 9, 9, 10, 10],
  ),
  make(
    "shoot-three",
    "Strzał 3 × 3",
    "shoot",
    "Trzy strzały na 6, 7 i 8 m. Każda odległość zaczyna się od pełnej rutyny.",
    [6, 6, 6, 7, 7, 7, 8, 8, 8],
    9,
  ),
  {
    ...make(
      "shoot-match",
      "Match point",
      "shoot",
      "Masz jedną kulę. Trafienie kończy wyobrażony mecz. Zapisz wynik i zakończ próbę.",
      undefined,
      1,
      true,
    ),
    requiredHits: 1,
  },
  make(
    "shoot-carreau",
    "Carreau challenge",
    "shoot",
    "Dziesięć strzałów. Cel: trzy carreaux. Czyste trafienia zapisuj osobno, bez zamiany ich na carreau.",
  ),
  make(
    "shoot-covered",
    "Kula częściowo zasłonięta",
    "shoot",
    "Ustaw przeszkodę przed kulą celem tak, aby część celu była widoczna. Zapisuj trafienie w wybrany cel, nie w przeszkodę.",
  ),
  make(
    "lob-five",
    "Lob: seria pięciu",
    "lob",
    "Pięć rzutów do jednej strefy pierwszego lądowania o średnicy 50 cm. Osobno zapisz lądowanie i pozycję końcową.",
    undefined,
    5,
  ),
  {
    ...make(
      "lob-changing",
      "Lob: zmiana dystansu",
      "lob",
      "Zmieniaj odległość po każdej kuli. Koło pierwszego lądowania ma 50 cm. Osobno oceniaj końcową pozycję.",
    ),
    random: true,
    distances: [6, 7, 8, 9],
  },
  ...(["shoot", "target", "lob"] as const).map((mode) => ({
    ...make(
      `test-${mode}`,
      `Test ${mode === "shoot" ? "strzału" : mode === "lob" ? "lobu" : "puenty"}`,
      mode,
      `20 rzutów: po 5 z 6, 7, 8 i 9 m. Jedna próba na ustawienie. Bez cofania i dodatkowych rzutów. ${mode === "target" ? "Koło końcowe: średnica 100 cm (promień 50 cm)." : mode === "lob" ? "Koło lądowania: średnica 50 cm. Zapisz też pozycję końcową." : "Zapisuj carreau, czyste trafienie, dotknięcie lub pudło."} Wybierz teren i powtarzaj test w tych samych warunkach.`,
      Array.from({ length: 20 }, (_, i) => 6 + Math.floor(i / 5)),
      20,
    ),
    test: true,
    group: "Testy" as const,
    targetSize: mode === "target" ? 100 : 50,
  })),
];
