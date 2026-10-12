# Uproszczenie produktu — 7 października 2026

Zakres: załącznik `4fd5b3cd-ef21-426a-ba02-0e63af44e724/Wklejony tekst.txt`. Zmiany istniejącej PWA, bez rewrite’u, nowych rankingów, lekcji, walut, Daily Quests czy backendu grywalizacji.

## CURRENT STATE

Przed iteracją aplikacja miała wspólny silnik rzutów i zapisu, Dzisiaj, 30 ćwiczeń, generator 10/20/30, Do poprawy, benchmarki, PB, Pokonaj siebie, lekcje, misje juniora, taktykę, mapę, rozwój, mental, fizyczny i tryb meczowy. Wszystko działało z lokalnym IndexedDB i buforowaniem PWA. Stan P0/P1/P2 opisują poprzednie dokumenty.

## PRODUCT OVERLAP

Misje, Skill Tree, XP, tygodniowe wyzwania, seria tygodni i kula dnia równolegle motywowały do treningu. Dzisiaj, generator, rekomendacja przygody i Do poprawy oferowały kilka wejść do podobnej sesji. Zachowano istniejące mechanizmy; nie dodano kolejnego systemu motywacyjnego.

## UX COMPLEXITY

Ekran startowy eksponował wiele równorzędnych wejść. Nawigacja zawierała dodatkowe sekcje lekcji, misji i przepisów. Wynik od razu prezentował statystyki i szczegółowe analizy. Instrukcje były jednakowo rozbudowane dla początkujących i zawodników.

## REUSE

Wykorzystano istniejące wyniki, warunki sesji, samooceny, kierunki, generator bloków, testy, historię, profil, tygodniowy licznik oraz mechanizm transakcyjnego zapisu. Nie zmieniono schematu IndexedDB. Dodatkowe metadane sesji są opcjonalne; eksport ma wersję 5 i przyjmuje wersje 2/3/4/5 oraz wcześniejszy surowy stan.

## PLAN i wdrożenie

1. Dzisiaj: jedna rekomendacja, powód, cel, sygnał postępu i regularność. Opcjonalna kula dnia. Otwarty szkic i zbliżające się zawody mają pierwszeństwo. Domyślny trening pozostaje krótki.
2. Trener deterministyczny: porównywalne grupy wyników uwzględniają rodzaj rzutu, dystans, trudność, teren, cel, linię i wariant ćwiczenia. Priorytet obejmuje trend, próbkę, aktualność, rolę, profil i ostatnio trenowany element. Wyniki 35–75% otrzymują większy priorytet niż dystanse poniżej 35%; test potwierdza wybór 8 m zamiast 9 m przy podobnym rozkładzie jak w briefie.
3. Adaptacyjna propozycja: trzy ostatnie pełne, porównywalne serie, minimum 10 prób każda, wszystkie z ostatnich 30 dni. Wszystkie powyżej 80% → dystans +1 m; przy limicie odległości wariant jednej próby bez cofania. Wszystkie poniżej 35% → dystans −1 m. Granice 5–10 m, junior do 7 m. Na dolnej granicy nie pokazujemy pozornej zmiany. Dopiero świadomy wybór przycisku zmienia plan; zwykły start zachowuje warunki.
4. Wyjaśnienie: skuteczność, próby, warunki i osiągalny zakres; dominujący kierunek błędu tylko przy dostępnych zapisach. Brak wystarczającej próbki jest opisany wprost.
5. Podsumowanie: trafienia/próby i skuteczność, porównanie z maksymalnie pięcioma poprzednimi pełnymi seriami przy minimum dwóch seriach i 20 próbach. Brak próbki nie generuje fikcyjnej zmiany. Najlepszy/najsłabszy typ i dystans wymagają co najmniej trzech prób w danym treningu. Jeden wyróżniony PB, następny krok; pozostałe analizy rozwijane. Zapis i Zakończ prowadzą z powrotem do Dzisiaj.
6. Pokonaj siebie: dokładne odtworzenie warunków i jawne wskazanie poprzedniej sesji, cel +1 do osiągalnego maksimum, po treningu rzeczywista różnica trafień. Nie zastępujemy odniesienia inną sesją po zmianie historii.
7. PB: czytelne rekordy skuteczności na dystansie, seria trafień, carreaux, pełny test, strzał precyzyjny oraz lądowanie lobu. Porównywalność sprawdzana wewnętrznie; nie powstaje katalog rekordów dla wszystkich kombinacji ustawień. Rekord celności na dystansie wymaga pełnej serii co najmniej 10 prób i porównywalnej wcześniejszej serii.
8. Generator 45/60: rozgrzewka → technika → priorytet → zmiana dystansu → presja → mental → krótki sprawdzian. Obie długości mają 51 prób; dodatkowy czas służy przygotowaniu, przerwom i refleksji. Krótki sześciopróbowy sprawdzian nie zastępuje standaryzowanego benchmarku. Etapy i wyniki wznawiają się po odświeżeniu.
9. Zawodnik: instrukcje zwinięte, szybkie wejścia w testy, zawody, generator z wybraną presją i mecz. Początkujący oraz junior zachowują edukacyjne instrukcje i dostęp do przewodnika.
10. Mental: wykorzystujemy pięć zapisanych samoocen rutyny/napięcia albo powtarzalną różnicę między porównywalnymi seriami zwykłymi i pod presją. Brak samooceny nie oznacza niestosowania rutyny. Krótka rutyna przed serią i reset po niej korzystają z istniejących bloków. Bez diagnoz psychologicznych i dodatkowych lekcji.
11. Odkrywanie: podstawowa nawigacja Dzisiaj, Trenuj, Postęp i Więcej. Rozbudowane moduły pozostają dostępne głębiej; analiza i trend zależą od próbki, nie od sztucznych blokad dostępu.

## Minimalna architektura pomiaru

`features/product/analytics.ts` przyjmuje wyłącznie dozwoloną nazwę zdarzenia. Wywołania start/zakończenie działają po udanym zapisie, nie po samym kliknięciu; import historii nie emituje ukończeń. Jedna kula dnia nie jest liczona jako sensowny pełny trening: liczniki treningów wymagają planu co najmniej sześciu prób, a ukończenia pełnego planu.

Zdarzenia potrzebne do podstawowej pętli pomiaru: `app_open`, `today_view`, `recommended_training_start`, `recommended_training_complete`, `manual_training_start`, `training_complete`, `training_abandon`, `summary_view`. Opcjonalne eksploracje: `weakness_view`, `personal_best_view`, `match_mode_start`, `mental_module_start`, `physical_module_start`, `precision_shooting_start`, `weekly_challenge_view`. „Potrzebne” oznacza ich rolę w przyszłym pomiarze, nie obowiązkową zgodę: cały pomiar jest opcjonalny i domyślnie wyłączony.

Ustawienia zawierają jawny przełącznik lokalnych liczników. Zapisujemy wyłącznie dzień i sumę danej nazwy zdarzenia, przez maksymalnie 90 dni. Wyłączenie usuwa liczniki. Nie zbieramy imienia, wieku, profilu, wyników, historii, ID sesji/użytkownika, sekwencji rzutów ani fingerprintingu. Nie ma połączenia sieciowego ani kolejki wysyłki. `setEventSink` umożliwia późniejsze podłączenie transportu z payloadem ograniczonym do nazwy zdarzenia; obecnie nie jest podłączony.

Przed uruchomieniem zewnętrznej analityki trzeba osobno wybrać odbiornik agregujący nazwy, zasady retencji i wyłączenie logowania IP oraz innych identyfikatorów. Ten release tego nie robi i nie przekazuje lokalnych liczników administratorowi.

## Uczciwe granice KPI

Lokalne liczniki pozwalają sprawdzić liczbę rozpoczęć/ukończeń, udział rekomendowanych sesji i wejścia do wskazanych modułów na danym urządzeniu. Iloraz startów do odsłon Dzisiaj jest wskaźnikiem zdarzeń, nie procentem unikalnych ludzi. Usunięcie pamięci lub wyłączenie pomiaru zeruje lokalną próbkę. Liczniki dzienne nie łączą rozpoczęcia z konkretnym ukończeniem.

Nie mierzymy obecnie globalnej liczby użytkowników ani retencji osób w kolejnym tygodniu. Bez identyfikatora nie można rzetelnie policzyć powrotów tych samych ludzi. Nie mierzymy również, czy dana osoba ponownie trenowała wskazaną słabość: takie śledzenie wymagałoby osobnego, ograniczonego projektu pomiaru i nie jest zaszyte w nazwach zdarzeń. Nie usuwamy modułów na podstawie nieistniejących danych.

## Weryfikacja

ESLint, TypeScript, Vitest i produkcyjny build. Testy przeglądarkowe sprawdzają adaptację dopiero po akceptacji, rzeczywistą różnicę Pokonaj siebie, zwinięte szczegóły, rutynę, cały plan 60 minut, odświeżenie, lokalną zgodę i usunięcie pomiaru, dostępność oraz szerokość 320 px. Dotychczasowe scenariusze P0/P1/P2, offline, benchmarków, importów i awarii pamięci pozostają w pełnym zestawie regresji. Wynik testów i publikacji: dokument wdrożenia tej iteracji.
