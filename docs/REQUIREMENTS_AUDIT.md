# Audyt założeń Jednej Kuli — 7 października 2026

Źródło: pełny tekst przekazany w załączniku `abaae1b0-8e9c-4b50-8b16-c73cb1294b7a/Wklejony tekst.txt`, 47 sekcji, oraz późniejsze polecenie wyłączenia rankingów między użytkownikami. Audyt dotyczy kodu po P0/P1/P2. „Wdrożone” oznacza obecność funkcji i sprawdzenie wskazanych ścieżek, nie potwierdzenie skuteczności sportowej po kilku tygodniach.

**Wniosek: główny zakres P0/P1/P2 jest wdrożony, ale pełna specyfikacja zawiera dodatkowe szczegóły, których jeszcze nie zrealizowano. Nie można oznaczyć wszystkich 47 sekcji jako w pełni zamkniętych.**

> Aktualizacja po kolejnym briefie: dokument poniżej pozostaje audytem stanu po P2. [Iteracja uproszczenia produktu](PRODUCT_REFINEMENT.md) wdraża generator 45/60 i adaptacyjne propozycje. Daily Quests są teraz celowo wyłączone przez użytkownika, a szeroki katalog PB nie jest celem produktu. Pozostałe historyczne luki nie stanowią automatycznie zakresu kolejnej iteracji.

## Wdrożony zakres priorytetów

- P0: Dzisiaj, rekomendacje z minimalną próbką, Do poprawy, generator 10/20/30, rozbudowana technika, testy, Personal Best w porównywalnych warunkach, trendy, podsumowanie i import.
- P1: sześć obszarów Skill Tree, osobne XP, Weekly Streak, Perfect Week, Weekly Challenge, mikrocele, Mastery/Legendary, mental, fizyczny i przygotowanie do zawodów.
- P2: tryb meczowy, 12 plansz, Boss Tests juniora, kula dnia, drabinka i presja 2/3. Opcjonalnych funkcji społecznościowych nie dodano. Rankingów nie ma zgodnie z późniejszym poleceniem.

## Sprawdzenie wszystkich sekcji

1. **Fundament — wdrożone.** Zachowane misje, 10/15/20 treningów, technika, mental, przepisy, quiz, PWA, historia i dawny trening dwóch osób. Dotychczasowe E2E pozostają w zestawie regresji.
2. **Pętla treningowa — wdrożone.** Wynik → warunki → słabość → rekomendacja → mikrocel → sprawdzenie nowych porównywalnych sesji. Przykładowa sześcioblokowa sesja 40 rzutów nie jest dokładnie odtworzona; generator ma własne budżety.
3. **Dzisiaj — wdrożone.** Trzy główne zadania, powód, start bez przeglądania biblioteki, wznowienie szkicu.
4. **Biblioteka techniczna — częściowo.** 30 ćwiczeń oraz osobne katalogi mentalny/fizyczny i tryb meczowy. Istnieją drabiny, korytarz, przeszkody, serie po trzy, strzał po zmianie dystansu, carreaux, presja, lob i testy. Nie zaimplementowano każdego szczegółowego wariantu z listy: m.in. trzech stref 30/50/100 w jednej prowadzonej sesji, „musisz poprawić” ze specjalną punktacją, premii za strzał po pudle, strzału po wysiłku ani losowej/zmienianej strefy lądowania. Zmiana nawierzchni jest ustawieniem i filtrem, nie odrębnym protokołem porównawczym.
5. **Generator — częściowo.** 10/20/30 min i wybór wszystko/puenta/strzał/lob/słabości/presja/lekko. Brak 45/60 min. Przygotowanie do zawodów jest osobnym trybem ze zmianą rekomendacji Dzisiaj, a nie pozycją generatora. Nie ma odrębnego krótkiego benchmarku końcowego we wszystkich planach.
6. **Fizyczny — wdrożone.** Pięć kategorii, junior/dorosły, 5/10 min, instrukcje i zapis kroków. Czasy orientacyjne. Bez obietnic leczenia.
7. **Mental — częściowo.** Dziesięć zachowanych lekcji i dziesięć nowych modułów. Rutyna, reset, wizualizacja, napięcie przed/po, koncentracja, pewność i następna kula. Moduły pewności używają refleksji nad dowodami; nie podstawiają automatycznie liczby trafień z historii. Symulacja i rosnące napięcie są prowadzone mentalnie; nie ma rosnącej punktacji etapów w tych modułach.
8. **Tryb meczowy — wdrożone.** Wynik, zasoby kul, teren, świnka, diagram, ryzyko, wybór, korzyść i alternatywa, zapis rozgrywek. Wyniki są deklarowane, nie przewidywane. Losowanie korzysta z 12 przygotowanych sytuacji, nie generatora fizyki.
9. **Skill Tree — wdrożone.** Sześć osobnych obszarów. Technika z dwóch porównywalnych testów; taktyka z wiedzy, mental z jawnej rutyny, regularność z tygodni. XP oddzielone.
10. **XP — wdrożone.** Sesja/test, rekord, powrót do słabości, misja, quiz, mental, ciało, lekcja, tydzień i wyzwanie. Limity dzienne i identyfikatory; kula dnia bez XP.
11. **Poziom — wdrożone.** Rosnące progi i nazwy kamieni milowych. Brak infantylizacji.
12. **Weekly Streak — wdrożone.** Cel 1–7 pełnych sesji; odpoczynek nie przerywa serii dnia. Historia celów tygodni.
13. **Perfect Week — wdrożone.** Cel i oznaczenia 2/4/8/12 tygodni.
14. **Daily Quests — brak osobnego systemu.** Małe zadanie Dzisiaj i kula dnia istnieją, ale nie ma trzech generowanych zadań, ich rejestru i zaliczeń na każdy dzień.
15. **Weekly Challenge — wdrożone.** 100 celnych puent, 50 strzałów, trzy dystanse, trzy rutyny. Przykładowe „popraw wynik z 9 m” realizuje mikrocel, a nie piąty wariant Weekly Challenge.
16. **Personal Best — częściowo.** Pełne porównywalne sesje: trafienia, procent, punkty, carreaux, ciąg trafień i lądowanie. Strzał precyzyjny ma własny rekord pełnej serii. Nie ma osobnego rekordu najlepszego ruchomego okna 10/20 rzutów ani zbiorczego rejestru rekordów dystansowych ze wszystkich ćwiczeń. Warunki nie są mieszane.
17. **Mastery/Legendary — wdrożone.** Cztery podstawowe ćwiczenia, 8/10, losowe dystanse Legendary, brak cofania, trwałe oznaczenia. To autorskie progi, nie klasyfikacja oficjalna.
18. **Do poprawy — częściowo.** Technika, dystans, warunki, liczba prób, trend i aktualność. Rutyna mentalna jest w Skill Tree; nie ma osobnego priorytetu mentalnego w liście Do poprawy.
19. **Adaptacyjna trudność — brak.** Użytkownik wybiera poziom, a rekomendacja zachowuje porównywalne warunki. Nie ma odrębnej propozycji zmiany po >80% lub <30–40%, akceptowanej przed zmianą ustawień.
20. **Test kontrolny — wdrożone.** Propozycja po kilku sesjach, 5×6/7/8/9 m, porównanie dystansów i punktów procentowych.
21. **Test vs trening — wdrożone.** Wersjonowane warunki i brak cofania; oddzielne zwykłe statystyki. Mastery, Boss i wyzwania także oznaczone osobno.
22. **Trend — wdrożone.** 5 ostatnich vs 5 poprzednich porównywalnych sesji i minimalna próbka.
23. **Profil błędów — wdrożone.** Opcjonalne kierunki, dominujący błąd, oddzielne lądowanie, filtr rodzaju/dystansu/terenu i powiązany trening.
24. **Junior — wdrożone.** Misje, mapa, krótsze dystanse, oznaczenia i Boss na zakończenie co pięciu misji. Przerwa nie odbiera osiągnięć.
25. **Zawodnik — częściowo.** Trzeci wariant profilu zapisany; dostęp do benchmarków, presji i zawodów. Interfejs nie skraca jeszcze automatycznie objaśnień dla zawodnika i nie ma oddzielnego zaawansowanego ekranu startowego.
26. **Mam zawody — wdrożone.** Termin, 1/3/7/14 dni, krótsze plany przed startem, rutyna i znany dystans. Tryb meczowy jest dostępny osobno; nie jest automatycznym blokiem planu.
27. **Pokonaj siebie — wdrożone.** Odtworzenie pełnego planu i warunków poprzedniej sesji, cel ponad własny wynik.
28. **Jedna kula dnia — wdrożone.** Jedna zapisana próba dziennie bez XP, kar i zastępowania pełnej sesji.
29. **Odznaki — częściowo.** Dotychczasowe osiągnięcia, Perfect Week, Mastery, Legendary, Boss i wyzwania. Nie ma wszystkich wymienionych przykładów i pełnego podziału na sześć kategorii; np. „Powrót” i „Pierwsze 100 strzałów” nie są odrębnymi odznakami.
30. **Statystyki odpowiadające na pytania — częściowo.** Słabość, dystans, regularność, trend i następny trening dostępne. Brak osobnego porównania miesiąc do miesiąca oraz porównania wyników pod presją z regularnymi seriami w identycznych warunkach.
31. **Podsumowanie — częściowo.** Wynik, Personal Best, porównanie testu/trend, mental i następny krok. Nie ma dwóch wyraźnych paneli „najlepszy element” i „do poprawy” w każdym podsumowaniu mieszanej sesji.
32. **Mikrocele — wdrożone w podstawowym zakresie.** Wzrost o 7 pp, rutyna w trzech sesjach i cel tygodnia. Brak celu rutyny przy 20 kolejnych pojedynczych rzutach; rutyna jest deklarowana na sesję.
33. **Progresja ćwiczeń — wdrożone dla czterech podstawowych ćwiczeń.** Poznaj/trenuj/utrwal/test/Mastery/Legendary. Nie objęto nią każdego z 30 wpisów biblioteki.
34. **Umiar grywalizacji — wdrożone.** Brak walut, lootboxów, agresywnych powiadomień i karania za dzień odpoczynku. Dawne historyczne osiągnięcie dni jest zachowane tylko jeśli wcześniej zdobyte.
35. **Offline-first — wdrożone.** IndexedDB, PWA, lokalne katalogi, zapisy i wznowienie; E2E sprawdza utratę sieci także w nowych modułach.
36. **Model danych — wdrożone poza Quest.** Sesja/próba/plan/test/profil i osiągnięcia przechowywane; SkillScore/PersonalBest obliczane, bez duplikowania. Addytywne opcjonalne pola. Quest nie istnieje jako osobny model.
37. **Import — wdrożone.** JSON 4, odczyt 2/3 i starszego stanu, walidacja, potwierdzenie oraz atomowa kopia sprzed importu. Test błędu zapisu i retry.
38. **UX telefonu — wdrożone.** Główne CTA, trzy zadania, szczegóły głębiej. Sprawdzenie szerokości 320 px i automatycznych reguł WCAG A/AA.
39. **Tryb boiskowy — wdrożone.** Duże przyciski, opcjonalne kierunki, ochrona zakończenia. Cofanie dostępne w zwykłym treningu, celowo wyłączone w ustalonych próbach.
40. **Minimum wpisywania — wdrożone.** Wynik jednym wyborem; kierunek i dodatkowe szczegóły są opcjonalne. Lob ma odrębne wskazanie lądowania wymagane przez jego ocenę.
41. **Algorytm — wdrożone.** Deterministyczny dobór, próbka, kategoria, dystans, warunki, trend, rola/junior i aktualność. Bez LLM.
42. **Testy — wdrożone.** Jednostkowe i E2E logiki oraz regresji; wyniki końcowe zapisane w README. Automatyczna dostępność nie zastępuje pełnego audytu manualnego.
43. **Diagnostyka — zgodne z ograniczeniem.** Nie dodano zewnętrznej analityki ani kont. Nie ma odrębnego eksportu diagnostycznego, ponieważ nie był potrzebny do tych modułów.
44. **Priorytety — wdrożone etapami P0/P1/P2.** P2 społecznościowe było opcjonalne i pozostaje niewdrożone. Szczegóły ponad zakres etapów są jawnie oznaczone powyżej.
45. **Analiza przed kodem — wykonana.** Przejrzano modele, routing, przechowywanie i możliwości ponownego użycia; rozwój bez rewrite'u.
46. **Praca i weryfikacja — wykonane.** Implementacja, build, lint, TypeScript, testy i sprawdzenie wizualne; publikacja FTPS po zakończeniu weryfikacji.
47. **Definicja sukcesu — produktowo wsparta, wymaga obserwacji.** Użytkownik może zobaczyć słabość, trenować konkretny wariant i porównać nowe wyniki. Realnej poprawy po kilku tygodniach nie można potwierdzić testem programistycznym.

## Wyłączenia i granice publikacji

Rankingi między użytkownikami są wyłączone przez późniejsze polecenie. Funkcje społecznościowe były opcjonalne; nie dodano kont, feedu ani backendu. Dawny lokalny trening dwóch osób zachowano. Instalacji PWA na fizycznym iPhonie/Androidzie i skuteczności sportowej całego programu nie zweryfikowano na urządzeniach lub w badaniu.

Publikacja obejmuje aktualne `dist/`, nie dokumentację i dane prywatne użytkownika. FTPS zapisuje kopię zastępowanych plików lokalnie, wysyła zasoby przed `index.html` i `sw.js`, zachowuje stare haszowane zasoby. Dane użytkowników w przeglądarkach nie są przesyłane ani nadpisywane przez deployment.
