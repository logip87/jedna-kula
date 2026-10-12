import { extraTacticCases } from "../situations/cases";
import type { Mode } from "../../domain";
export interface Mission {
  title: string;
  drillId: string;
  mode: Mode;
  distances: number[];
  goal: string;
  cue: string;
  lesson?: string;
  scenario?: string;
}
export const missions: Mission[] = [
  {
    title: "Pierwszy ślad",
    drillId: "point-basic",
    mode: "point",
    distances: [6],
    goal: "Ustaw świnkę na 6 m. Zapisz 6 prób, żeby poznać swój punkt startowy.",
    cue: "Sprawdź dystans. Rzuć spokojnie.",
    lesson: "one",
  },
  {
    title: "Poczuj długość",
    drillId: "point-basic",
    mode: "point",
    distances: [6, 7],
    goal: "Zmieniaj dystans między 6 i 7 m. Zauważ, kiedy kula jest za krótka lub za długa.",
    cue: "Dopasuj ruch do odległości.",
  },
  {
    title: "Wybierz kierunek",
    drillId: "target",
    mode: "target",
    distances: [6],
    goal: "Wyznacz cel. Po każdej próbie zaznacz kierunek końcowej pozycji kuli.",
    cue: "Patrz na wybrany punkt.",
  },
  {
    title: "Pierwsze trafienie",
    drillId: "shoot-basic",
    mode: "shoot",
    distances: [6],
    goal: "Ustaw kulę celu na 6 m. Próbuj ją usunąć i zapisuj także pudła.",
    cue: "Jedna kula. Jeden spokojny ruch.",
  },
  {
    title: "Miękkie lądowanie",
    drillId: "lob",
    mode: "lob",
    distances: [6],
    goal: "Wyznacz koło lądowania 50 cm. Zapisuj oddzielnie lądowanie i końcową pozycję.",
    cue: "Widzę miejsce lądowania.",
  },
  {
    title: "Zmieniam odległość",
    drillId: "point-random",
    mode: "point",
    distances: [6, 7],
    goal: "Przenoś cel zgodnie z dystansem na ekranie. Przy każdej zmianie wybierz nową siłę rzutu.",
    cue: "Nowy dystans. Nowa decyzja.",
  },
  {
    title: "Odzyskaj punkt",
    drillId: "point-basic",
    mode: "point",
    distances: [7],
    goal: "Wyobraź sobie kulę rywala 50 cm od świnki. Spróbuj ustawić swoją bliżej.",
    cue: "Wybieram cel przed rzutem.",
    scenario: "recover",
  },
  {
    title: "Mniejszy cel",
    drillId: "target",
    mode: "target",
    distances: [7],
    goal: "Wyznacz cel i wykonaj pełną serię. Nie musisz trafiać za każdym razem, żeby zrobić postęp.",
    cue: "Powtarzam przygotowanie.",
  },
  {
    title: "Spokojnie przy linii",
    drillId: "boundary",
    mode: "boundary",
    distances: [6],
    goal: "Świnka 60 cm od bocznej linii autowej. Ćwicz kontrolę, zamiast ryzykować aut.",
    cue: "Wybieram bezpieczny kierunek.",
  },
  {
    title: "Sprawdzam swój postęp",
    drillId: "point-basic",
    mode: "point",
    distances: [6],
    goal: "Powtórz test z pierwszej misji na takim samym terenie. Porównaj wyniki i kierunki błędów.",
    cue: "Porównuję się ze sobą.",
  },
  {
    title: "Strzał o metr dalej",
    drillId: "shoot-basic",
    mode: "shoot",
    distances: [7],
    goal: "Przenieś kulę celu na 7 m. Zapisuj każde trafienie i kierunek każdego pudła.",
    cue: "Nie przyspieszam po błędzie.",
    lesson: "mistake",
  },
  {
    title: "Lob za znacznikiem",
    drillId: "lob-obstacle",
    mode: "lob",
    distances: [6, 7],
    goal: "Połóż płaski znacznik przed strefą lądowania. Przeleć nad nim i sprawdź dwa miejsca: lądowanie oraz zatrzymanie.",
    cue: "Wybieram miejsce za przeszkodą.",
  },
  {
    title: "Poznaj 8 metrów",
    drillId: "point-basic",
    mode: "point",
    distances: [8],
    goal: "Zapisz serię na 8 m. Nie gonimy wyniku — poznajemy nową odległość.",
    cue: "Więcej odległości, ten sam spokój.",
  },
  {
    title: "Zagraj z planem",
    drillId: "point-basic",
    mode: "point",
    distances: [7],
    goal: "Przed każdą kulą powiedz, co chcesz osiągnąć. Poznaj warianty na planszy taktycznej.",
    cue: "Najpierw decyzja, potem rzut.",
    scenario: "last",
  },
  {
    title: "Zmieniam rolę",
    drillId: "roles",
    mode: "point",
    distances: [6, 7],
    goal: "Pierwszą połowę serii puentuj, drugą strzelaj. Ćwicz zmianę zadania bez pośpiechu.",
    cue: "Potrafię wybrać swoją rolę.",
  },
  {
    title: "Strzał na dwa dystanse",
    drillId: "shoot-random",
    mode: "shoot",
    distances: [6, 8],
    goal: "Zmieniaj dystans zgodnie z ekranem. Obserwuj, czy kierunek pudła zależy od odległości.",
    cue: "Widzę cel przed każdym rzutem.",
  },
  {
    title: "Celowanie w lądowanie",
    drillId: "lob",
    mode: "lob",
    distances: [7],
    goal: "Zwróć uwagę na to, gdzie kula pierwszy raz dotyka ziemi. To osobny wynik od końcowej pozycji.",
    cue: "Lądowanie też ma znaczenie.",
  },
  {
    title: "Moja słabsza strona",
    drillId: "point-basic",
    mode: "point",
    distances: [6],
    goal: "Ćwiczenie i dystans dobierzemy do Twoich zapisanych wyników. Trenuj jeden konkretny wariant.",
    cue: "Pracuję nad jednym zadaniem.",
  },
  {
    title: "Powrót po pudle",
    drillId: "pressure",
    mode: "shoot",
    distances: [7],
    goal: "Po każdym pudle zrób wydech i spokojnie przygotuj następną kulę. Zapisz całą serię.",
    cue: "Następna kula to nowa próba.",
    lesson: "mistake",
  },
  {
    title: "Mój finał",
    drillId: "roles",
    mode: "point",
    distances: [6, 7, 8],
    goal: "Zagraj serię puenty i strzału. Zobacz mapę błędów i wybierz, czego chcesz uczyć się dalej.",
    cue: "Znam swój następny krok.",
  },
];
export interface TacticCase {
  id: string;
  title: string;
  score: string;
  own: number;
  opponent: number;
  description: string;
  distance?: number;
  surface?: string;
  shotRisk?: string;
  jack?: { x: number; y: number };
  balls: { x: number; y: number; team: string }[];
  options: {
    title: string;
    explanation: string;
    benefit?: string;
    risk?: string;
    alternative?: string;
  }[];
}
export const tacticCases: TacticCase[] = [
  {
    distance: 7,
    surface: "Drobny żwir",
    shotRisk: "Średnie — sprawdź drugą kulę za celem",
    id: "recover",
    title: "Rywal trzyma punkt",
    score: "4 : 4",
    own: 3,
    opponent: 2,
    description:
      "Rywal ma kulę 50 cm od świnki. Masz trzy kule i sporo miejsca przed celem.",
    balls: [
      { x: 154, y: 190, team: "opponent" },
      { x: 113, y: 257, team: "own" },
    ],
    options: [
      {
        title: "Puentuję bliżej",
        explanation:
          "Masz miejsce i trzy próby. Dobra puenta może odzyskać punkt bez konieczności trafienia kuli. Ryzyko: za krótka kula może zawęzić następne wejście.",
      },
      {
        title: "Strzelam kulę rywala",
        explanation:
          "Trafienie usuwa najbliższą kulę, ale pudło zużywa próbę bez poprawy położenia. To rozsądny wariant, gdy oceniasz swoje strzelanie na tym dystansie jako pewniejsze niż puentę.",
      },
      {
        title: "Próbuję przesunąć świnkę",
        explanation:
          "Możesz zmienić cały układ, lecz trudniej przewidzieć końcowe pozycje. Oceń również liczbę pozostałych kul i to, czy cel nie trafi na aut.",
      },
    ],
  },
  {
    distance: 8,
    surface: "Gładkie / twarde",
    shotRisk: "Wysokie — ostatnia kula",
    id: "last",
    title: "Jedna kula na decyzję",
    score: "10 : 11",
    own: 1,
    opponent: 0,
    description:
      "Rywal trzyma punkt kulą 25 cm od świnki. Została Ci jedna kula; rywal zagrał wszystkie.",
    balls: [
      { x: 150, y: 207, team: "opponent" },
      { x: 94, y: 253, team: "own" },
      { x: 181, y: 270, team: "own" },
    ],
    options: [
      {
        title: "Strzelam najbliższą kulę",
        explanation:
          "Trafienie może odzyskać punkt, ale pudło zostawia punkt rywalowi. Wybór zależy od Twojej skuteczności na tym dystansie i pozycji kolejnej kuli przeciwnika.",
      },
      {
        title: "Puentuję na punkt",
        explanation:
          "Puenta musi być bliżej niż 25 cm. Przy dobrym wejściu możesz odzyskać punkt; przy trudnym podłożu to wymagające zadanie. Najpierw wybierz miejsce lądowania.",
      },
      {
        title: "Wybijam świnkę na aut",
        explanation:
          "Obie drużyny nie będą już miały kul, więc martwa świnka oznacza anulowanie rozgrywki bez punktów (art. 14). Jest to wariant ratunkowy, ale samo skuteczne wybicie celu może być trudniejsze od innych zagrań.",
      },
    ],
  },
  {
    distance: 7,
    surface: "Drobny żwir",
    shotRisk: "Średnie — ciasne skupienie kul",
    id: "protect",
    title: "Nie dokładaj rywalowi celu",
    score: "8 : 8",
    own: 2,
    opponent: 2,
    description:
      "Masz punkt. Rozważ położenie kolejnych kul, gdy rywal będzie zmuszony grać. To analiza następnego ruchu, a nie prawo do rzutu poza kolejnością.",
    balls: [
      { x: 133, y: 208, team: "own" },
      { x: 181, y: 255, team: "opponent" },
    ],
    options: [
      {
        title: "Obserwuję, zanim zagram",
        explanation:
          "Teraz rzuca rywal, bo nie ma punktu. Poczekaj na efekt i dopiero wtedy dobierz zagranie. Nie musisz od razu dokładać kul przy własnej punktującej kuli.",
      },
      {
        title: "Planuję kolejną kulę obok",
        explanation:
          "Dodatkowa kula może dać następny punkt, ale zbyt ciasny układ może ułatwić rywalowi usunięcie kilku kul jednym strzałem. Rozważ odstęp, gdy odzyskasz kolejkę.",
      },
      {
        title: "Planuję blokadę wejścia",
        explanation:
          "Kula w torze puenty może utrudnić wejście, lecz może także zasłonić Twoją własną drogę. To wariant sytuacyjny, który trzeba ocenić po następnym ruchu rywala.",
      },
    ],
  },
  {
    distance: 9,
    surface: "Nierówne / grube",
    shotRisk: "Średnie — cel bez osłony",
    id: "terrain",
    title: "Najpierw miejsce lądowania",
    score: "2 : 3",
    own: 3,
    opponent: 3,
    description:
      "Przed świnką leży pas grubego żwiru. Rywal ma punkt. Możesz przetoczyć kulę, zagrać półlobem lub wyżej.",
    balls: [{ x: 155, y: 197, team: "opponent" }],
    options: [
      {
        title: "Szukam gładkiego wejścia",
        explanation:
          "Niższy rzut może być dobry, jeżeli znajdziesz przewidywalny tor toczenia. Sprawdź trasę wzrokiem, bez usuwania przeszkód.",
      },
      {
        title: "Ląduję za grubym żwirem",
        explanation:
          "Wyższy rzut pozwala ominąć fragment terenu, ale wymaga kontroli lądowania i dalszego toczenia. Wybierz konkretną strefę, nie tylko świnkę.",
      },
      {
        title: "Strzelam kulę rywala",
        explanation:
          "Omijasz problem dojścia puentą, ale potrzebujesz skutecznego strzału. Porównaj obie możliwości ze swoimi wynikami na tej odległości.",
      },
    ],
  },
  ...extraTacticCases,
];
