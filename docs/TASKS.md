# Plan wdrożenia

Aktualny kierunek i końcowa weryfikacja znajdują się na końcu dokumentu. Wcześniejsze sekcje oraz liczby testów opisują historię wdrożeń.

- [x] 1. React, TypeScript, routing, układ mobilny i nawigacja
- [x] 2. IndexedDB, modele danych i PWA
- [x] 3. Katalog lekcji mentalnych z zapisem postępu
- [x] 4. Wspólny silnik sesji, konfiguracja i podsumowanie
- [x] 5. Ćwiczenia puenty i precyzji
- [x] 6. Ćwiczenia strzału, w tym wyzwanie pod presją
- [x] 7. Lob, różne odległości i gra przy linii
- [x] 8. Trening mieszany i decyzje sytuacyjne
- [x] 9. Historia, statystyki, profil i osiągnięcia
- [x] 10. Testy jednostkowe, E2E, offline i dopracowanie UX

## Weryfikacja końcowa

- [x] TypeScript i build produkcyjny bez błędów
- [x] 24 testy jednostkowe Vitest
- [x] 17 mobilnych testów Playwright
- [x] Odświeżanie aktywnej sesji i ponowne otwarcie historii
- [x] Pełny trening i lekcja przy wyłączonej sieci
- [x] Symulacja błędu IndexedDB i ponowienie zapisu
- [x] Manifest, dostępność ikon i układ mobilny / desktop
- [x] Audyt npm: 0 podatności po aktualizacji zależności

Instalacja na fizycznym iPhonie i Androidzie nie była wykonywana. Testy korzystają z mobilnego Chromium; instalacja wymaga HTTPS lub localhost.

## Odświeżenie UX/UI

- [x] Nowy system kolorów i typografii
- [x] Przewodnik początkującego i domyślny trening na 6 m
- [x] Wyszukiwanie i filtr ćwiczeń na początek
- [x] Ścieżka pierwszych kroków z rzeczywistym postępem
- [x] Większe kontrolki, widoczny fokus, skip link i reduced motion
- [x] Automatyczne testy dostępności axe-core i układu 320 px
- [x] Spójne ikony PWA i kolory manifestu

## Zasady gry

- [x] Oficjalne źródła PFP/FIPJP i metadane każdej reguły
- [x] 16 kategorii, wyszukiwarka i 14 sytuacji szybkiej pomocy
- [x] Moduł martwej świnki, diagramy granic i pięciu figur MPSP
- [x] Quiz 36 pytań z wyjaśnieniami, źródłami i wznowieniem
- [x] Treści i PDF-y offline, kompatybilność dotychczasowych danych
- [x] ESLint, TypeScript, testy jednostkowe i E2E
- [x] WCAG axe-core, szerokość 320 px, zachowanie przy odświeżeniu

## Przygoda i moduły treningowe

- [x] Osobna sekcja i nawigacja Misje
- [x] Wybór krótkiej / standardowej serii oraz 10/15/20 treningów
- [x] Odblokowanie misji tylko po pełnej zapisanej serii
- [x] Dobór treningu według wyników i minimum prób
- [x] Plansze taktyczne z wariantami i zapisem decyzji
- [x] Kierunki rzutów i lądowania lobu; mapa z filtrami
- [x] Pełne 20 figur strzału, historia i ręczny zegar
- [x] Naprzemienne wyzwania dwóch osób, wspólny cel
- [x] Wznowienie, offline i zgodność z wcześniejszym zapisem
- [x] Testy logiki, pełnych przepływów, dostępności i 320 px

## Trener osobisty P1

- [x] Skill Tree z wyników testów i osobne XP z limitami
- [x] Weekly Streak, Perfect Week, kamienie milowe i Weekly Challenge
- [x] Mikrocele mierzone na nowych, porównywalnych sesjach
- [x] Mastery i Legendary, trwałe oznaczenia, brak cofania
- [x] Moduły mentalne z samooceną napięcia
- [x] 5 modułów fizycznych, junior/dorosły, 5/10 minut
- [x] Termin zawodów i plan przygotowania w Dzisiaj
- [x] Wznowienie offline, eksport 3 i import starszych danych
- [x] 71 testów logiki, 27 E2E, WCAG i układ 320 px

## Trener osobisty P2

- [x] Trening meczowy z decyzjami i zadeklarowanymi wynikami rozgrywek
- [x] 12 plansz taktycznych z ryzykiem i alternatywami
- [x] Sprawdziany rozdziałów krótkiego planu po rozdziałach, trwałe zaliczenia
- [x] Kula dnia bez XP, drabinka i presja 2/3
- [x] Osobne statystyki wyzwań i meczów, wznowienie offline
- [x] Eksport 4, walidacja i kompatybilność starszych kopii
- [x] Audyt 47 sekcji: zakres wdrożony i jawne pozostałe luki
- Funkcje społecznościowe i rankingi wyłączone z zakresu przez użytkownika.

## Uproszczenie produktu

- [x] Jeden główny trening Dzisiaj, powód, cel i regularność
- [x] Osiągalne słabości i propozycje trudności po odpowiedniej próbce
- [x] Zmiana warunków wyłącznie po akceptacji
- [x] Krótkie podsumowanie, prawdziwa zmiana, rozwijane analizy
- [x] Dokładne odniesienie Pokonaj siebie i czytelne PB
- [x] Generator 45/60 z siedmioma blokami i wznowieniem
- [x] Profil zawodnika i czytelne instrukcje dla różnych poziomów
- [x] Mental z rzeczywistych samoocen i porównywalnych prób pod presją
- [x] Prostsza nawigacja bez usuwania zaawansowanych modułów
- [x] Opcjonalne lokalne zdarzenia, bez wysyłki i identyfikatorów
- [x] Dokumentacja ograniczeń KPI i kompatybilność eksportu 5

## Dorośli gracze i autorski system mentalny — 12.10.2026

- [x] Dorośli jako główni odbiorcy; neutralny język, juniorzy bez blokad funkcji
- [x] Profil: opcjonalny wiek bez domyślnej wartości, cztery poziomy, rola i ręka
- [x] Pięć kompetencji mentalnych, trzy dostępne poziomy, 25 lekcji
- [x] Rutyna Plan → Oddech → Wykonanie → Reset w całej aplikacji
- [x] Wspólne treści lekcji i 25 ćwiczeń; filtry i postęp kompetencji
- [x] Wskazówki w treningach technicznych, po sukcesie i po błędzie
- [x] Siedem sytuacji: decyzja, rzut i opcjonalna ocena decyzji
- [x] Zapis decyzji przed rzutem, wznowienie, historia i kopia
- [x] Dashboard: ostatni trening, propozycja, regularność, wyniki, obszary i rzeczywisty progres
- [x] Sportowe nazwy planów i sprawdzianów; wcześniejsze treningi zachowane
- [x] Kopia wersji 6, odczyt 2–5/raw, dotychczasowe identyfikatory i postęp zachowane
- [x] PRD, architektura i README zgodne z kierunkiem produktu
- [x] Testy modelu mentalnego, zgodności danych, profilu, sytuacji i dashboardu
- [x] Końcowy pełny przebieg TypeScript, lint, Vitest, Playwright i build

Weryfikacja 12.10.2026: TypeScript i ESLint bez błędów; Vitest 101/101, Playwright 44/44 (w tym 40 dotychczasowych przepływów). Produkcyjny build PWA poprawny. Sprawdzono widoki 320 px i desktop, dostępność axe-core, offline, wznowienie i import starszych kopii. Vite zgłasza ostrzeżenie o paczce JavaScript powyżej 500 kB; nie blokuje buildu. Nie wykonywano publikacji ani instalacji na fizycznym telefonie.

## Quality Engineering portfolio — 12.10.2026

- [x] Analiza 101 wcześniejszych unit tests, 44 E2E, persystencji i PWA
- [x] TEST_STRATEGY.md z risk-based planem 25 scenariuszy i granicami dowodu
- [x] Cztery E2E wydzielone z istniejących przepływów, bez kopii dla dystansów
- [x] Trzy integracje Vitest i trzy rzeczywiste testy PWA/offline
- [x] Dwa axe-core/keyboard i dwa rzeczywiste visual regression PNG
- [x] Trzy testy bezpieczeństwa oraz kontrolowany błąd uszkodzonego IndexedDB
- [x] Cztery lokalne kontrakty capabilities agent security
- [x] Generator → zapisany test → wykonanie; kontrakt review i healer safety
- [x] Dwa fault-injection scenarios, bez hard-coded sleeps, retries=0
- [x] Smoke Chromium/Firefox/WebKit, Android i iPhone-like viewport
- [x] Quality gate GitHub Actions i osobne full/visual jobs, artefakty failure
- [x] README, AGENTIC_TESTING.md i FLAKINESS.md
- [x] TypeScript, lint, build; 8/8 showcase contracts i 20/20 browser executions
- [x] Pełna regresja 109/109 Vitest i 47/47 Playwright
- [x] Powtórzenie smoke/resilience: pięć przebiegów, 15/15 bez retry

Workflow CI jest skonfigurowany, lecz jeszcze nie wykonany na GitHub; wymaga umieszczenia folderu w repozytorium. Visual baseline pochodzi z lokalnego macOS 26, a jego zgodność z hosted runnerem `macos-26` wymaga pierwszego sprawdzenia. Agentowe review jest syntetycznym fixture, nie rzeczywistą zgodą człowieka ani testem żywego modelu. Nie wykonywano prawdziwych ataków, odczytu sekretów lub publikacji aplikacji.
