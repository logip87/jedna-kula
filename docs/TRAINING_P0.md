# Rozwój treningu — P0

## Stan wyjściowy i ponowne użycie

Rozbudowano istniejącą aplikację React/TypeScript, bez drugiego repozytorium danych ani nowego backendu. Zachowano 13 wcześniejszych ćwiczeń, 10 lekcji, misje, mapę rzutów, taktykę, strzał precyzyjny, grę we dwoje, quiz i PWA. Dotychczasowy ekran startowy jest dostępny pod `/start` przez Więcej → Pierwsze kroki.

`Session`, `Attempt`, `PlannedThrow`, `Player` i `Achievement` pozostają źródłem danych. Nowe pola są opcjonalne. Nie tworzymy kopii historii do wyliczania rekordów ani drugiego zapisu benchmarków.

## Wdrożone P0

1. `/`: Dzisiaj — polecana sesja, małe zadanie, rutyna mentalna. Otwartą sesję zawsze wznawiamy zamiast zastępować.
2. `features/coaching/model.ts`: deterministyczny wybór priorytetu; starsza rekomendacja w module misji deleguje do tej samej logiki.
3. `/coach/weaknesses`: warianty do poprawy, liczba prób, warunki, trend i profil kierunków. Pierwsze lądowanie lobu i pozycja końcowa są rozdzielone.
4. `/coach/generator`: 10/20/30 minut; wszystko, puenta, strzał, lob, słabości, presja, lekko. Plan ma rozgrzewkę, technikę, priorytet, serię jednej próby i reset. Czasy to szacunki, nie automatyczny stoper. Etapy i rzuty zachowują się po odświeżeniu.
5. Biblioteka: 17 dodatkowych pozycji, łącznie 30. Filtry Puenta/Strzał/Lob/Presja/Mix/Testy. Nowe warianty m.in. drabiny, korytarz, przeszkody, jedna kula, trzy kule, 3×3, Match point, carreau i serie lobu.
6. Trzy wersjonowane testy: strzał, puenta do koła i lob. Po 5 prób na 6/7/8/9 m, ustalona punktacja i cel; oznaczony teren. Brak cofania prób. Częściowy test zostaje w historii, ale nie jest benchmarkiem. Test puenty używa promienia 50 cm, czyli średnicy 100 cm; nie mylimy tych jednostek.
7. Personal Best oraz `/coach/challenge`: powtórzenie własnego planu w tych samych warunkach. Rekordy trafień pełnej serii (w tym serie 10/20 rzutów), punktów, carreaux, ciągu trafień i trafień lądowania. Remis nie jest nowym rekordem.
8. Trend: ostatnie 5 vs poprzednie 5 porównywalnych sesji, minimum po 20 prób w każdym oknie, różnica w punktach procentowych.
9. Podsumowanie: istniejące trafienia, punkty, najlepszy/najsłabszy dystans i mental, plus rekordy, trend/benchmark oraz następny krok.
10. Import: nowe kopie JSON wersji 2 oraz wcześniejszy surowy eksport. Walidacja przed potwierdzeniem, atomowy zapis i pobieralna kopia stanu sprzed ostatniego importu.

Nie ma rankingu użytkowników. Punktem odniesienia jest własny wcześniejszy wynik.

## Reguły analizy

Ocena wariantu wymaga 20 prób z co najmniej dwóch sesji. Analiza bierze ostatnie 12 sesji, z wyłączeniem szkiców, pustych wyników i niepełnych testów. Klucz warunków obejmuje ćwiczenie, rodzaj sesji, cel generatora, tryb rzutu, dystans, poziom, rozmiar celu, ustawienie linii oraz teren. Nieoznaczony teren stanowi osobną grupę.

Priorytet to słabość × pewność danych × aktualność × znaczenie dla roli × przerwa od treningu. Spadkowy trend zwiększa priorytet. Juniorowi nie rekomendujemy dystansów powyżej 7 m. Brak wystarczających danych daje neutralną propozycję puenty 6 m, bez stwierdzania słabości.

Statystyki treningów wykluczają testy. Pełne testy mogą dostarczyć oddzielnego sygnału do rekomendacji, ale nigdy nie są łączone z treningiem w jednej grupie. Porównanie benchmarku wymaga identycznego typu testu, wersji, planu i warunków. Kolejność pól JSON nie wpływa na porównanie.

Profil błędu wymaga minimum 10 oznaczonych nietrafionych prób; podajemy procent wśród oznaczonych pudeł, nie wszystkich rzutów. Kierunków brakujących w starej historii nie uzupełniamy. Opcjonalne kierunki na ekranie boiskowym nie blokują zapisu wyniku; tryb jawnie wymagający mapowania nadal wymaga kierunku.

## Kompatybilność i import

IndexedDB pozostaje w wersji 1: używamy tego samego magazynu `state` i klucza `local`. Brak `Session.kind` oznacza trening. Brak konfiguracji tygodnia oznacza cel 2 sesji. Nie uruchamiamy migracji nadpisującej starszy profil, lekcje ani wyniki. Rozszerzenie jest addytywne i sprawdzone testami odczytu starego stanu.

Kopia ma `format: jedna-kula`, `version: 2`, datę i pełne `data`. Surowy dawny eksport traktujemy jako format legacy, po pełnej walidacji. Nieznana wersja, nieznane ćwiczenie, zła struktura, niespójna punktacja lub nieprawidłowy plan są odrzucane. Limit pliku wynosi 10 MB.

`Repository.restore` zapisuje poprzedni `local` jako `before-import`, a następnie nowy `local`, w jednej transakcji. Niepowodzenie dowolnego zapisu wycofuje oba. Przed operacją użytkownik widzi liczbę importowanych i zastępowanych sesji; może anulować. W ustawieniach może pobrać stan sprzed ostatniego importu i ponownie go przywrócić. To pojedynczy punkt odzyskania, nie archiwum wszystkich kopii.

## Rytm tygodnia i kolejne etapy

Dodatkowo przygotowano podstawę tygodniowego celu: 1–7 sesji, poniedziałek jako początek tygodnia, niezrywanie serii podczas bieżącego nieukończonego tygodnia, Perfect Week po osiągnięciu celu. Historia zmian celu chroni wcześniejsze tygodnie. Dotychczasowa odznaka dziennej serii pozostaje tylko u osób, które już ją zdobyły; nie odblokowujemy jej ponownie.

P1/P2 pozostają osobnymi etapami: Skill Tree/XP, wyzwania tygodniowe, Mastery/Legendary, rozszerzone moduły mentalne i fizyczne, przygotowanie do zawodów, rozbudowany tryb meczowy i Boss Tests. Nie dodano generatora 45/60 min ani całej listy pomysłów na ćwiczenia; P0 obejmuje użyteczny pierwszy zestaw i 10/20/30 min.

## Weryfikacja

Vitest sprawdza progi danych, warunki, trendy, rekordy, benchmarki, plany, tygodnie, kompatybilność kopii, walidację oraz rollback transakcji. Playwright sprawdza dotychczasowe funkcje i nowe ścieżki, offline, wznowienie generatora, cofnięcie między blokami, porównanie importowanego benchmarku, potwierdzenie/anulowanie importu, awarię zapisu, układ 320 px i axe WCAG A/AA. Testy przeglądarkowe czekają na zatwierdzony zapis przed nawigacją.
