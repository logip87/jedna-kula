import type { TacticCase } from "../adventure/data";
export const extraTacticCases: TacticCase[] = [
  {
    id: "two-targets",
    title: "Dwie kule w jednej linii",
    score: "6 : 7",
    own: 2,
    opponent: 1,
    distance: 8,
    surface: "Drobny żwir",
    shotRisk: "Wysokie — jedna kula może zasłonić drugą",
    description:
      "Rywal trzyma punkt. Jego dwie kule stoją w osi rzutu, a Twoja jest trzecia w kolejności od świnki.",
    balls: [
      { x: 150, y: 208, team: "opponent" },
      { x: 151, y: 243, team: "opponent" },
      { x: 194, y: 275, team: "own" },
    ],
    options: [
      {
        title: "Strzelam przednią kulę",
        explanation:
          "Oceń, czy usunięcie przedniej kuli rzeczywiście zmieni kolejność punktujących kul.",
        benefit: "Możesz otworzyć drogę i usunąć przeszkodę.",
        risk: "Druga kula rywala może nadal trzymać punkt; jeden strzał nie musi wystarczyć.",
        alternative:
          "Puenta z boku, jeśli masz przewidywalne miejsce lądowania.",
      },
      {
        title: "Puentuję z boku",
        explanation:
          "Szukaj wejścia poza osią dwóch kul, zamiast dokładać trzeci cel w tej samej linii.",
        benefit: "Możesz odzyskać punkt bez dwóch trafień strzałem.",
        risk: "Wąskie wejście i odbicie od jednej z kul mogą oddać rywalowi następny punkt.",
        alternative:
          "Najpierw usuń przeszkodę, jeśli puenta jest wyraźnie trudniejsza.",
      },
      {
        title: "Zmieniam układ świnką",
        explanation: "Nazwij zamierzoną końcową pozycję świnki, zanim zagrasz.",
        benefit: "Nowa pozycja celu może premiować Twoją dalszą kulę.",
        risk: "Ruch świnki może też przybliżyć ją do obu kul rywala.",
        alternative: "Kontrolowana puenta; porównaj ryzyko obu zagrań.",
      },
    ],
  },
  {
    id: "jack-side",
    title: "Świnka przy bocznej linii",
    score: "9 : 9",
    own: 2,
    opponent: 1,
    distance: 7,
    surface: "Gładkie / twarde",
    shotRisk: "Wysokie — odbicie w stronę linii",
    jack: { x: 48, y: 220 },
    description:
      "Rywal ma punkt przy śwince blisko linii. Duża część bezpiecznego wejścia jest po prawej stronie.",
    balls: [
      { x: 65, y: 240, team: "opponent" },
      { x: 121, y: 263, team: "own" },
    ],
    options: [
      {
        title: "Puentuję od środka",
        explanation:
          "Wybierz tor pozostający wewnątrz boiska także po pierwszym odbiciu.",
        benefit: "Ograniczasz ryzyko wyjścia poza linię.",
        risk: "Zbyt długa kula może minąć cel i odsłonić następny ruch rywala.",
        alternative: "Strzał, gdy oceniasz jego kontrolę jako pewniejszą.",
      },
      {
        title: "Strzelam z kontrolą",
        explanation:
          "Uwzględnij miejsce, do którego mogą odskoczyć kula celu i świnka.",
        benefit: "Usunięcie najbliższej kuli może odzyskać punkt.",
        risk: "Kontakt ze świnką zmienia całą rozgrywkę.",
        alternative: "Puenta od środka, jeśli wejście jest dostępne.",
      },
      {
        title: "Przesuwam świnkę do środka",
        explanation:
          "Zaplanuj konkretny kierunek, a nie tylko kontakt z celem.",
        benefit: "Więcej przestrzeni może pomóc Twojej kolejnej kuli.",
        risk: "Końcowa pozycja świnki jest trudna do przewidzenia.",
        alternative: "Najpierw spróbuj odzyskać punkt puentą.",
      },
    ],
  },
  {
    id: "last-two",
    title: "Dwie próby, rywal bez kul",
    score: "11 : 10",
    own: 2,
    opponent: 0,
    distance: 7,
    surface: "Drobny żwir",
    shotRisk: "Średnie — zostaje jedna próba",
    description:
      "Rywal ma punkt kulą około 40 cm od świnki. Zostały Ci dwie kule, rywal nie ma już odpowiedzi.",
    balls: [
      { x: 165, y: 231, team: "opponent" },
      { x: 108, y: 274, team: "own" },
    ],
    options: [
      {
        title: "Najpierw puenta",
        explanation:
          "Wybierz wejście dające punkt i oceniaj układ ponownie przed drugą kulą.",
        benefit: "Pierwsza dobra kula pozwala drugą grać o dodatkowy punkt.",
        risk: "Słaba puenta może zamknąć wejście.",
        alternative:
          "Strzał, jeżeli usunięcie celu ma większą szansę niż wejście.",
      },
      {
        title: "Najpierw strzał",
        explanation:
          "Dwie kule dają możliwość poprawki, ale każda próba zużywa zasób.",
        benefit: "Trafienie może uwolnić punkt Twojej dalszej kuli.",
        risk: "Po pudle zostanie jedna trudna decyzja.",
        alternative: "Puenta z bezpiecznej strony celu.",
      },
      {
        title: "Puentuję na dwa punkty",
        explanation:
          "Możesz przygotować układ pod kolejną kulę; obecna musi najpierw odzyskać punkt.",
        benefit: "Plan uwzględnia obie pozostałe kule.",
        risk: "Zbyt ambitny cel może obniżyć szansę pierwszego punktu.",
        alternative: "Zabezpiecz pierwszy punkt, potem oceń dodatkowy.",
      },
    ],
  },
  {
    id: "blocked-entry",
    title: "Zasłonięte wejście",
    score: "5 : 5",
    own: 3,
    opponent: 2,
    distance: 8,
    surface: "Nierówne / grube",
    shotRisk: "Średnie — przednia kula jest przeszkodą",
    description:
      "Rywal trzyma punkt. Przed świnką stoi dodatkowa kula, a po lewej masz strefę lądowania za przeszkodą.",
    balls: [
      { x: 154, y: 199, team: "opponent" },
      { x: 151, y: 277, team: "opponent" },
      { x: 92, y: 300, team: "own" },
    ],
    options: [
      {
        title: "Lob za przeszkodę",
        explanation: "Wskaż pierwsze lądowanie i przewidywane toczenie po nim.",
        benefit: "Omijasz przednią kulę bez jej usuwania.",
        risk: "Błąd wysokości lub lądowania może zostawić kulę daleko.",
        alternative: "Wejście z boku przy niższym rzucie.",
      },
      {
        title: "Puentuję z lewej",
        explanation: "Sprawdź cały tor, także końcową część po odbiciu.",
        benefit: "Niższy rzut może być lepiej opanowany.",
        risk: "Nierówny teren może skierować kulę w przeszkodę.",
        alternative: "Lob na wybraną strefę za przeszkodą.",
      },
      {
        title: "Usuwam przeszkodę",
        explanation:
          "To zagranie przygotowujące, które samo nie musi odzyskać punktu.",
        benefit: "Otwierasz wejście na kolejne kule.",
        risk: "Zużywasz jedną z trzech prób; rywal może odbudować układ.",
        alternative: "Bezpośrednia puenta lub lob na punkt.",
      },
    ],
  },
  {
    id: "match-point",
    title: "Rywal ma piłkę meczową",
    score: "10 : 12",
    own: 1,
    opponent: 1,
    distance: 9,
    surface: "Drobny żwir",
    shotRisk: "Wysokie — mało prób",
    description:
      "Rywal trzyma jeden punkt. Masz jedną kulę i rywal również może jeszcze odpowiedzieć.",
    balls: [
      { x: 158, y: 204, team: "opponent" },
      { x: 101, y: 262, team: "own" },
    ],
    options: [
      {
        title: "Puentuję na punkt",
        explanation:
          "Oprzyj wybór o swoje wyniki na tym dystansie i miejsce lądowania.",
        benefit: "Zmuszasz rywala do ostatniej odpowiedzi.",
        risk: "Puenta poza najbliższą kulą nie zmieni wyniku.",
        alternative: "Strzał, jeśli jest Twoim pewniejszym zagraniem.",
      },
      {
        title: "Strzelam punktującą kulę",
        explanation:
          "Wynik 12 rywala nie zmienia techniki strzału: przygotuj jedną kulę według rutyny.",
        benefit: "Trafienie może usunąć bezpośrednie zagrożenie.",
        risk: "Pudło pozostawia punkt, a rywal nadal ma kulę.",
        alternative: "Kontrolowana puenta na znaną strefę.",
      },
      {
        title: "Próbuję zmienić świnkę",
        explanation: "Oceń, które dalsze kule skorzystają z przesunięcia.",
        benefit: "Możliwa duża zmiana kolejności kul.",
        risk: "Możesz zwiększyć liczbę punktów rywala.",
        alternative:
          "Wybierz mniej zmienny wariant, jeżeli masz na niego dane.",
      },
    ],
  },
  {
    id: "own-obstacle",
    title: "Twoja kula zasłania drogę",
    score: "7 : 6",
    own: 2,
    opponent: 2,
    distance: 6,
    surface: "Gładkie / twarde",
    shotRisk: "Wysokie — własna kula przed celem",
    description:
      "Rywal ma punkt, ale Twoja wcześniejsza kula stoi w osi strzału. Jest miejsce na puentę od prawej.",
    balls: [
      { x: 152, y: 205, team: "opponent" },
      { x: 151, y: 257, team: "own" },
      { x: 97, y: 286, team: "opponent" },
    ],
    options: [
      {
        title: "Puentuję od prawej",
        explanation: "Wykorzystaj wolny tor bez przemieszczania własnej kuli.",
        benefit: "Możesz odzyskać punkt i zachować wcześniejszą kulę.",
        risk: "Za mocne wejście może odbić się od celu.",
        alternative: "Wyższy rzut za własną kulę.",
      },
      {
        title: "Strzelam nad przeszkodą",
        explanation:
          "Nie przenoś skuteczności zwykłego strzału automatycznie na zasłonięty cel.",
        benefit: "Celne zagranie usuwa punktującą kulę.",
        risk: "Możesz trafić własną kulę i pogorszyć układ.",
        alternative: "Puenta od wolnej strony.",
      },
      {
        title: "Lobuję za własną kulę",
        explanation: "Wybierz strefę lądowania pomiędzy przeszkodą a świnką.",
        benefit: "Omijasz przeszkodę i zachowujesz kulę w grze.",
        risk: "Wąska strefa wymaga dobrego pierwszego lądowania.",
        alternative: "Niższa puenta od prawej.",
      },
    ],
  },
  {
    id: "no-boules",
    title: "Nie masz już kul",
    score: "8 : 10",
    own: 0,
    opponent: 2,
    distance: 7,
    surface: "Drobny żwir",
    shotRisk: "Brak rzutu — obserwujesz",
    description:
      "Twoja najbliższa kula trzyma punkt, ale zagrałeś już wszystkie. Rywal ma dwie kule. Teraz analizujesz jego możliwości.",
    balls: [
      { x: 142, y: 211, team: "own" },
      { x: 181, y: 266, team: "opponent" },
    ],
    options: [
      {
        title: "Sprawdzam układ i obserwuję",
        explanation:
          "Nie masz następnego rzutu. Zwróć uwagę na pozycję drugiej najbliższej kuli.",
        benefit: "Lepiej rozumiesz, o ile punktów gra rywal.",
        risk: "Sama obserwacja nie daje kontroli nad wynikiem.",
        alternative: "Przygotuj spokojną rutynę do następnej rozgrywki.",
      },
      {
        title: "Przewiduję strzał rywala",
        explanation:
          "Zastanów się, co stanie się po usunięciu Twojej najbliższej kuli.",
        benefit: "Ćwiczysz odczyt kolejności punktujących kul.",
        risk: "Rywal może wybrać puentę zamiast strzału.",
        alternative: "Porównaj również jego bezpieczne wejście.",
      },
      {
        title: "Przygotowuję następną rozgrywkę",
        explanation:
          "Zaakceptuj, że bieżący układ rozstrzygną pozostałe kule rywala.",
        benefit: "Utrzymujesz koncentrację na kolejnym zadaniu.",
        risk: "Nie przeocz pomiaru i potwierdzenia końcowego wyniku.",
        alternative: "Obserwuj ostatnie rzuty, potem wykonaj reset.",
      },
    ],
  },
  {
    id: "slope",
    title: "Teren odprowadza kulę",
    score: "3 : 4",
    own: 3,
    opponent: 1,
    distance: 8,
    surface: "Nierówne / grube",
    shotRisk: "Średnie — cel widoczny",
    jack: { x: 170, y: 215 },
    description:
      "Rywal trzyma punkt. Próbne rzuty pokazały, że końcowy odcinek terenu kieruje kule w prawo.",
    balls: [
      { x: 181, y: 238, team: "opponent" },
      { x: 226, y: 287, team: "own" },
    ],
    options: [
      {
        title: "Uwzględniam spadek w puencie",
        explanation:
          "Wybierz miejsce lądowania na podstawie obserwowanego toczenia.",
        benefit: "Wykorzystujesz wiedzę o terenie.",
        risk: "Zbyt duża korekta zostawi kulę po lewej stronie.",
        alternative: "Krótsze toczenie po wyższym rzucie.",
      },
      {
        title: "Skracam toczenie lobem",
        explanation:
          "Przybliż lądowanie do celu, zachowując kontrolę wysokości.",
        benefit: "Mniejsza część toru zależy od spadku.",
        risk: "Niepewne lądowanie może dać większy rozrzut.",
        alternative: "Puenta z korektą toru.",
      },
      {
        title: "Strzelam bez toczenia",
        explanation:
          "Porównaj skuteczność strzału z opanowaniem nierównego wejścia.",
        benefit: "Omijasz problem długiego toczenia.",
        risk: "Trafienie i końcowa pozycja Twojej kuli nie są gwarantowane.",
        alternative: "Puenta na najlepiej poznaną strefę.",
      },
    ],
  },
];
