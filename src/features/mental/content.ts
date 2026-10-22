import type { Lesson, LessonTag } from "../../domain";

// Existing IDs and legacy fields remain the canonical source for saved progress.
const improvements: Record<string, Partial<Lesson>> = {
  routine: {
    exercise:
      "Przez następne 10 rzutów wykonuj Plan → Oddech → Wykonanie → Reset. Oceń pełną serię, niezależnie od liczby trafień.",
  },
  one: {
    title: "Decyzja przed kołem",
    rule: "Nazwij zagranie i cel przed wejściem do koła. W kole wykonuj; zmieniaj decyzję tylko po nowej informacji.",
    exercise:
      "Przez następne 10 rzutów przed wejściem do koła nazwij zagranie i cel. Jeśli zmienisz decyzję w kole, po serii przypomnij sobie powód.",
    matchCue: "Decyzja przed kołem. W kole wykonanie.",
  },
  mistake: {
    rule: "Fakt → korekta → następna kula. Jedno pudło opisuje ten rzut, nie cały dzień.",
    example:
      "Spudłowałem w lewo → dzisiaj nie trafiam → spinam się to pułapka. Zamiast niej: lewo → sprawdzam cel i kierunek → przygotowuję następną kulę.",
    matchCue: "Ta kula się skończyła. Co jest teraz?",
  },
  "reset-analysis": {
    rule: "Nazwij jeden fakt i jedną korektę, potem zakończ analizę do czasu po menie. Decyzję i wykonanie oceniaj osobno.",
  },
  stress: {
    example:
      "Przy ważnym rzucie zauważasz przesadnie ostrożną puentę, desperacki strzał albo zmianę planu w kole. Wyjdź z przygotowania, porównaj opcje i wróć do zwykłej rutyny.",
  },
  score: {
    title: "Wynik i cena błędu",
    rule: "Ten sam układ przy 2:2 i 12:12 może wymagać innej decyzji. Porównaj cenę błędu i odpowiedź rywala, zamiast stosować regułę zawsze strzelaj albo zawsze puentuj.",
    exercise:
      "Ustaw ten sam układ przy 2:2 i 12:12. W obu wersjach policz kule i nazwij skutki powodzenia oraz błędu. Zagraj wybraną opcję.",
  },
  name: {
    rule: "Ranking nie rzuca kul. Zobacz, co rywal robi dzisiaj, i wybierz odpowiedź na aktualny układ.",
    example:
      "On jest mocny → zobaczymy, co zrobi dzisiaj → jedna sytuacja → jedna decyzja → jedna kula.",
  },
  "confidence-series": {
    rule: "Opieraj pewność na seriach, trendzie i powtarzalności w porównywalnych warunkach, zamiast na jednej świetnej kuli.",
    exercise:
      "W statystykach porównaj pełne serie na tym samym dystansie, nawierzchni i ustawieniach. Jeśli danych brakuje, zapisz kolejną serię bez wniosku o formie.",
  },
  "confidence-dialogue": {
    description:
      "Krótki komunikat pomaga wrócić do działania po ocenie samego siebie.",
  },
  "confidence-flow": {
    title: "Utrzymaj rytm dobrej serii",
    description:
      "Po udanej serii łatwo przyspieszyć przygotowanie albo dodać zbędne instrukcje. Zachowaj wypracowany rytm.",
  },
  "complete-decision": {
    exercise:
      "W istniejącej sytuacji Rywal trzyma punkt porównaj puentę i strzał. Nazwij korzyść, ryzyko i alternatywę. Po rzucie oddziel wybór od wykonania.",
  },
  "complete-team": {
    rule: "Przekaż jedną obserwację przed rutyną. Po uzgodnieniu decyzji nie dodawaj sprzecznych instrukcji zawodnikowi w kole, chyba że zmienił się układ.",
  },
  "complete-communication": {
    rule: "Sytuacja → cel → decyzja → plan B. Ustalcie, jaka nowa informacja wymaga ponownej rozmowy.",
    example:
      "Rywal ma punkt, mamy dwie kule → chcemy odzyskać punkt i zachować odpowiedź → puenta z prawej → jeśli wejście się zamknie, ponownie porównamy opcje.",
  },
};
const procedures: Record<string, string[]> = {
  routine: [
    "Przed kołem wybierz zagranie i cel.",
    "Zrób spokojny wydech.",
    "Wykonaj przygotowany ruch.",
    "Nazwij fakt i przygotuj kolejną kulę.",
  ],
  one: [
    "Poza kołem sprawdź układ i dostępne zagrania.",
    "Nazwij zagranie oraz konkretny cel.",
    "W kole wykonuj plan; przy nowej informacji przerwij przygotowanie i oceń go ponownie.",
  ],
  goal: [
    "Wybierz widoczny szczegół celu.",
    "Zauważ, co odciągnęło wzrok.",
    "Wróć do tego samego szczegółu przed wykonaniem.",
  ],
  "focus-return": [
    "Zatrzymaj przerwane przygotowanie.",
    "Ponownie sprawdź układ i cel.",
    "Rozpocznij rutynę od planu.",
  ],
  "focus-endurance": [
    "Między menami pozwól uwadze odpocząć.",
    "Przed swoją próbą wróć do obserwacji terenu.",
    "Wybierz aktualny cel i wykonaj rutynę.",
  ],
  mistake: [
    "Nazwij fakt: na przykład lewo, zamiast dzisiaj nie trafiam.",
    "Wybierz jedną korektę.",
    "Zrób wydech i nazwij zadanie następnej kuli.",
  ],
  good: [
    "Zakończ reakcję na udany rzut.",
    "Sprawdź, jak zmienił się układ.",
    "Przygotuj kolejną kulę w tym samym rytmie.",
  ],
  "reset-analysis": [
    "Wybierz jedną obserwację o ostatniej próbie.",
    "Nazwij jedną korektę planu albo wykonania.",
    "Zakończ analizę i wróć do bieżącego układu.",
  ],
  "reset-chain": [
    "Zauważ przyspieszenie po kilku pudłach.",
    "Przywróć zwykłe tempo wydechu i przygotowania.",
    "Sprawdź cel przed zmianami techniki.",
  ],
  "reset-energy": [
    "Zapisz jedną rzecz do utrzymania i jedną do ćwiczenia.",
    "Zamknij analizę zakończonego meczu.",
    "Odpocznij i wróć do rozgrzewki przed kolejnym startem.",
  ],
  stress: [
    "Zauważ ostrożność, desperacki atak albo zmianę planu w ostatniej chwili.",
    "Przed kołem ponownie porównaj dostępne opcje.",
    "Wybierz cel, zrób wydech i utrzymaj zwykłą rutynę.",
  ],
  score: [
    "Sprawdź wynik i pozostałe kule obu drużyn.",
    "Porównaj skutki powodzenia oraz błędu dla obu opcji.",
    "Wybierz zagranie według ceny błędu w tej sytuacji.",
  ],
  "pressure-trailing": [
    "Nazwij aktualny układ zamiast wielkości straty.",
    "Porównaj dwie wykonalne opcje.",
    "Wybierz cel jednej kuli, zachowując normalne przygotowanie.",
  ],
  name: [
    "Zauważ myśl o reputacji rywala.",
    "Sprawdź, co zrobił dzisiaj i jaki jest teraz układ.",
    "Wybierz jedną odpowiedź na tę sytuację.",
  ],
  "pressure-last": [
    "Uzgodnij cel przed wejściem do koła.",
    "Sprawdź tempo i rozluźnij chwyt.",
    "Wykonaj rutynę bez dodawania ostatniej instrukcji.",
  ],
  trust: [
    "Wybierz opanowane zagranie i efekt.",
    "Podczas ruchu trzymaj uwagę na celu.",
    "Tematy techniczne oceń dopiero po serii.",
  ],
  "confidence-technique": [
    "Wybierz jedną wskazówkę do wykonania.",
    "Zastosuj ją przez całą serię.",
    "Pozostałe zmiany zapisz na osobny trening.",
  ],
  "confidence-series": [
    "Sprawdź dystans, nawierzchnię i ustawienia porównywanych serii.",
    "Oceń powtarzalność i trend pełnych serii.",
    "Jeśli prób jest za mało, zbierz kolejną serię bez oceny formy.",
  ],
  "confidence-dialogue": [
    "Zauważ ocenę siebie.",
    "Zastąp ją krótką nazwą działania, na przykład wybierz lądowanie.",
    "Sprawdź, czy komenda pomaga wrócić do zadania.",
  ],
  "confidence-flow": [
    "Zauważ swoje tempo po udanym rzucie.",
    "Zachowaj czas przygotowania i jeden jasny cel.",
    "Oceń rytm dopiero po zakończeniu serii.",
  ],
  roles: [
    "Sprawdź, czego potrzebuje teraz drużyna.",
    "Porównaj wykonalne zagrania niezależnie od swojej stałej roli.",
    "Uzgodnij, kto wykona wybrane zadanie.",
  ],
  "complete-decision": [
    "Nazwij dwie realne opcje w obecnym układzie.",
    "Porównaj ich korzyść, ryzyko i pozostałe kule.",
    "Wybierz plan przed kołem; po rzucie osobno oceń wykonanie.",
  ],
  "complete-team": [
    "Przed rutyną przekaż jedną obserwację.",
    "Potwierdź uzgodnioną decyzję.",
    "Pozostaw partnerowi czas na wykonanie; przerwij tylko przy nowej informacji.",
  ],
  "complete-communication": [
    "Nazwijcie sytuację i cel drużyny.",
    "Uzgodnijcie decyzję oraz plan B.",
    "Ustalcie, jaka zmiana układu otwiera ponowną rozmowę.",
  ],
  "complete-preparation": [
    "Sprawdź teren w próbach puenty, strzału i loba.",
    "Przypomnij sobie rytm rutyny.",
    "Uzgodnij role, sposób komunikacji i przerwy.",
  ],
  anger: [
    "Nazwij emocję i zatrzymaj destrukcyjny komentarz.",
    "Zrób wydech i przerwij pośpiech.",
    "Sprawdź układ i przygotuj następną decyzję.",
  ],
  risk: [
    "Co zyskamy przy powodzeniu?",
    "Co stracimy przy błędzie?",
    "Ile kul pozostanie obu drużynom?",
    "Co może zrobić przeciwnik później?",
  ],
  "ball-count": [
    "Sprawdź, kto ma punkt.",
    "Policz nasze pozostałe kule i potwierdź z drużyną.",
    "Policz kule rywala, a dopiero potem wybierz plan.",
  ],
  "strategy-change": [
    "Co działa, a co nie działa?",
    "Czy problem dotyczy decyzji, czy wykonania?",
    "Co konkretnie zmieniamy i kiedy to ocenimy?",
  ],
  "terrain-reading": [
    "Obejrzyj twardość, kamienie i nachylenie.",
    "Obserwuj odbicie i toczenie po próbie na wybranej strefie.",
    "Dobierz lądowanie, portée, wysokość i opanowaną rotację lub sposób strzału.",
  ],
  "decision-error": [
    "Przypomnij informacje dostępne przed rzutem i oceń wybór zagrania.",
    "Porównaj wykonanie z celem: krótko, długo, lewo, prawo.",
    "Zapisz oddzielną ocenę decyzji; jeśli danych brakuje, zaznacz trudno ocenić.",
  ],
};
const questions: Record<string, string> = {
  routine: "Czy w całej serii stosowałeś cztery kroki rutyny?",
  one: "Czy utrzymałeś decyzję w kole, chyba że pojawiła się nowa informacja?",
  goal: "Czy po rozproszeniu wróciłeś wzrokiem do wybranego szczegółu?",
  "focus-return": "Czy po przerwaniu przygotowania ponownie sprawdziłeś układ?",
  "focus-endurance":
    "Czy odpoczywałeś między menami i wracałeś do celu przed rzutem?",
  mistake: "Czy po pudle nazwałeś fakt, korektę i następne zadanie?",
  good: "Czy po sukcesie ponownie oceniłeś zmieniony układ?",
  "reset-analysis": "Czy zakończyłeś analizę po jednym fakcie i korekcie?",
  "reset-chain": "Czy po kolejnych pudłach przywróciłeś tempo rutyny?",
  "reset-energy": "Czy zamknąłeś analizę meczu przed odpoczynkiem?",
  stress:
    "Czy przed ważną kulą rozpoznałeś pośpiech lub nadmierną ostrożność i wróciłeś do planu?",
  score: "Czy uwzględniłeś cenę błędu przy aktualnym wyniku?",
  "pressure-trailing":
    "Czy przy stracie wybrałeś wykonalny cel zamiast automatycznego ataku?",
  name: "Czy oceniałeś dzisiejszą sytuację zamiast reputacji rywala?",
  "pressure-last": "Czy przy ostatniej kuli wykonałeś zwykłą rutynę?",
  trust: "Czy podczas wykonania skupiłeś się na efekcie zagrania?",
  "confidence-technique": "Czy ograniczyłeś korektę do jednej wskazówki?",
  "confidence-series": "Czy oparłeś ocenę na porównywalnych seriach?",
  "confidence-dialogue":
    "Czy zastąpiłeś ocenę siebie konkretnym komunikatem działania?",
  "confidence-flow": "Czy po udanych rzutach utrzymałeś ten sam rytm?",
  roles: "Czy dobrałeś rolę do potrzeb drużyny?",
  "complete-decision": "Czy przed wyborem porównałeś dwie realne opcje?",
  "complete-team":
    "Czy przekazałeś obserwację przed rutyną i zostawiłeś partnerowi czas na wykonanie?",
  "complete-communication":
    "Czy uzgodniliście sytuację, cel, decyzję i plan B?",
  "complete-preparation":
    "Czy przed grą sprawdziłeś teren, rutynę i ustalenia drużyny?",
  anger: "Czy przerwałeś reakcję złości i wróciłeś do układu?",
  risk: "Czy sprawdziłeś zysk, stratę, pozostałe kule i odpowiedź rywala?",
  "ball-count": "Czy przed decyzją znałeś punkt i liczbę kul obu drużyn?",
  "strategy-change":
    "Czy zmieniłeś plan na podstawie obserwacji, rozróżniając decyzję i wykonanie?",
  "terrain-reading":
    "Czy obserwacja odbicia i toczenia zmieniła Twój wybór lądowania?",
  "decision-error": "Czy oceniłeś decyzję osobno od wykonania?",
};
const scenarios: Record<string, string> = {
  one: "recover",
  "complete-decision": "recover",
  score: "last",
  "pressure-last": "last",
  risk: "last",
  "ball-count": "last",
  "complete-team": "protect",
  "complete-communication": "protect",
  "terrain-reading": "terrain",
  "strategy-change": "two-targets",
  "decision-error": "recover",
};
export function enrichLesson(original: Lesson): Lesson {
  const l = { ...original, ...improvements[original.id] };
  const tags: LessonTag[] =
    l.competency === "complete" ? ["tactical", "decision"] : ["mental"];
  if (l.competency === "pressure") tags.push("pressure");
  if (["roles", "complete-team", "complete-communication"].includes(l.id))
    tags.push("team");
  if (l.id === "terrain-reading") tags.push("terrain");
  if (["score", "risk", "ball-count", "strategy-change"].includes(l.id))
    tags.push("match-management");
  if (l.id === "one") tags.push("decision");
  return {
    ...l,
    durationMinutes: 2,
    tags,
    procedure: procedures[l.id],
    reflection: questions[l.id],
    matchCue: l.matchCue ?? l.phrase,
    scenarioId: scenarios[l.id],
  };
}
