# Test strategy

## Cel i analiza projektu

Jedna kula jest lokalną PWA React/TypeScript bez kont i synchronizacji. Wyniki i szkice trafiają do IndexedDB; Workbox buforuje shell, katalogi i PDF-y. Import JSON przechodzi walidację struktury oraz punktacji. Formularz kontaktowy jest odrębnym endpointem PHP i nie ma dostępu do wyników.

Stan przed zmianą: 101 testów Vitest i 44 mobilne testy Playwright. Istnieją testy punktacji, postępu, rekomendacji, wznowienia, offline, importu i axe-core. Konfiguracja obsługiwała wyłącznie Chromium/Pixel 7; zrzuty były artefaktami, nie porównaniami do baseline. Brak GitHub Actions i demonstracji agentowych. Na początku folder roboczy nie był repozytorium Git. Projekt jest teraz opublikowany jako publiczne `logip87/jedna-kula`.

## Quality Engineering Showcase

Celem jest pokazanie różnych technik quality engineering na rzeczywistej PWA, nie maksymalnej liczby testów. Showcase ma 25 logicznych scenariuszy. Cztery E2E są wydzielone z dotychczasowych przepływów, zamiast dopisywane jako ich kopie. Szersza regresja domeny i modułów pozostaje osobno. Liczba wykonań jest większa od liczby scenariuszy, bo jeden smoke jest powtarzany na różnych silnikach.

## Plan reprezentatywnych testów i ryzyka

- E2E, 4: puenta → zapis → historia/postęp; strzał pod presją i rozróżnienie trafienia od dotknięcia; zaliczenie lekcji; profil/preferencje po ponownym otwarciu.
- Integration, 3: silnik punktacji → repozytorium → statystyki; lekcja i praktyczny moduł → trwały postęp; import → atomowe zastąpienie i kopia poprzedniego stanu. Vitest i fake-indexeddb, bez UI.
- PWA, 3: rzeczywisty service worker/cache i manifest → shell offline; pełny zapis sesji offline; ponowne otwarcie strony z trwałymi danymi. Build produkcyjny, bez zastępowania service workera mockiem.
- Accessibility, 2: dashboard/skip link/klawiatura; aktywny trening i lekcja mentalna. Axe-core plus semantyczne nazwy/fokus.
- Visual, 2: pusty dashboard i aktywna sesja, stałe dane, zegar i viewport. Baselines wymagają review; CI nie aktualizuje ich automatycznie.
- Security, 3: XSS-like nazwa pozostaje tekstem; uszkodzony IndexedDB daje kontrolowany błąd; fałszywa punktacja w imporcie nie zmienia danych.
- Agent security, 4: niezaufana strona; instrukcja w repo; niebezpieczna komenda/eksfiltracja; dane użytkownika. Lokalne fixtures, broker odmawiający nieprzyznanych możliwości przed wywołaniem adaptera.
- Agentic, 2: plan → generator → review → realne wykonanie testu; healer przedstawia propozycję, bez zmiany oczekiwań i automatycznego zastosowania.
- Resilience, 2: błąd quota i ponowienie; opóźniony zapis i szybkie wielokrotne kliknięcia nie dublują prób.

## Poziomy i granice

Vitest sprawdza czystą logikę, współpracę modułów oraz kontrakty harnessu agentowego. Przeglądarka sprawdza zachowanie React, transakcje IndexedDB, worker, routing, fokus i wizualne renderowanie. Nie powtarzamy przez UI macierzy odległości, wszystkich kombinacji punktacji i algorytmu rekomendacji. Nie automatyzujemy rankingu użytkowników, którego produkt nie ma, ani prawdziwych ataków, odczytu sekretów, fizycznej instalacji PWA i zachowania modelu online.

Testy bezpieczeństwa aplikacji dotyczą rzeczywistych granic danych. Harness agentowy nie jest modelem ani produkcyjnym sandboxem; sprawdza mechaniczne ograniczenia narzędzi i proces review, nie „odporność AI na każdy prompt injection”. Szczegóły: [AGENTIC_TESTING.md](AGENTIC_TESTING.md).

## Stabilność

Każdy test ma nowy browser context lub unikalną bazę IndexedDB. Dane i zegar są kontrolowane; nie ma zależności między testami ani współdzielonego stanu mutowalnego. Helpers obejmują tylko uruchomienie sesji, zakończenie sześciu prób i oczekiwanie na kontrolera workera. Locatory opierają się na role/name/label; selektory CSS służą jedynie stabilnym granicom komponentów. Brak hard-coded sleeps: oczekujemy na stan UI, transakcję lub sygnał workera. [FLAKINESS.md](FLAKINESS.md) opisuje triage, retry i quarantine.

## Automated accessibility: ograniczenia

Axe-core sprawdza reguły WCAG A/AA i wykryte problemy serious/critical. Dodatkowo testujemy skip link, nazwy kontrolek i obsługę klawiatury. To nie certyfikat zgodności WCAG: wymagane są ręczne testy czytnikiem ekranu, kolejności odczytu, czytelności instrukcji, powiększenia i użycia na urządzeniu.

## Cross-browser i mobile

Pełny zestaw przeglądarkowy działa w Chromium/Pixel 7. Jeden E2E smoke zapisu puenty działa także w desktop Chromium, Firefox i WebKit/iPhone 13. UI jest emulowany; to nie test sprzętowego Androida ani iOS. Nie mnożymy całej suite przez projekty.

## Visual baseline

Baseline PNG są dla Chromium na macOS; dedykowany workflow visual używa `macos-26` (Apple Silicon), zgodnego z główną wersją systemu bazowego. [Obsługiwane obrazy GitHub Actions](https://github.com/actions/runner-images). Linux nie porównuje do baseline macOS, ponieważ renderowanie zależy od środowiska. Brak baseline lub istotny diff to failure; aktualizacja jest świadomym lokalnym poleceniem i wymaga porównania before/after. Wersja Playwright pochodzi z package-lock. Pierwszy przebieg 12.10.2026 potwierdził zgodność dwóch pierwotnych baseline na hosted runnerze `macos-26`, bez ich aktualizacji. [Zasady Playwright dotyczące środowiska](https://playwright.dev/docs/test-snapshots).

## Audyt interfejsu — 14.10.2026

Przegląd w przeglądarce obejmuje główne ekrany w 13 rozdzielczościach od 320 × 568 do 1920 × 1080, dodatkowo landscape, małą wysokość oraz powiększony tekst. Przesuwanie nawigacji powodowała kolizja klasy `.active` ekranu sesji z klasą aktywnego `NavLink`: `margin: auto` zmieniał odstępy po kliknięciu. Sesja ma teraz osobną klasę, a dolne menu cztery równe kolumny i stałe boxy ikon/etykiet. Kolor i tło wyróżniają aktywną pozycję bez zmiany jej geometrii.

- [Geometria i responsywność](../tests/e2e/ui-layout.spec.ts): wszystkie cztery zakładki na 13 viewportach, landscape, zoom 125% oraz kontrolki sesji na 320 px. Pomiary obejmują pozycje, szerokości, wysokości, wycentrowanie, SVG i brak overflow. Szerokość porównujemy z zadanym viewportem, ponieważ mobilna przeglądarka potrafi automatycznie rozszerzyć `innerWidth` przy przepełnieniu.
- [Kontrolki i długie treści](../tests/e2e/ui-controls.spec.ts): imię 40 znaków, nazwy pojedynku 30 znaków, wartości statystyk z dziewięcioma cyframi, powiększony tekst, jednoczesny stan offline/install, przyciski i linki z celem minimum 44 × 44 px oraz ustawienia treningu na tabletach i przy granicach breakpointów.
- [Safe-area](../tests/e2e/ui-safe-area.spec.ts): WebKit z viewportem PWA iPhone 390 × 844. Emulacja nie dostarcza sprzętowych insetów, dlatego test zastępuje wyłącznie wartości `env()` w rzeczywistym CSS wartościami testowymi: top 44 px, bottom 32 px i asymetryczny bok 24 px. Sprawdza odstęp od gestów, górny nagłówek, symetrię menu i padding treści. Fizyczny iPhone i zainstalowana PWA pozostają do kontroli na urządzeniu.
- [Porównania wizualne](../tests/visual/navigation.spec.ts): home 320 px, aktywny trening 390 px i crop samego menu w każdym aktywnym stanie na 320/390 px. Wraz z dwoma dotychczasowymi obrazami suite ma 12 wzorców PNG; nie snapshotuje całej aplikacji.

Uruchomienie: `npm run test:e2e -- tests/e2e/ui-layout.spec.ts tests/e2e/ui-controls.spec.ts tests/e2e/ui-safe-area.spec.ts` oraz `npm run qa:visual`. Zmiany UI pozostają w istniejących komponentach i CSS; logika treningu oraz architektura są zachowane.

Końcowa weryfikacja lokalna: 114/114 Vitest, 75/75 Playwright E2E i 6/6 scenariuszy visual (12 obrazów), bez retry. Wzorce oceniono wizualnie i zaktualizowano, a następny przebieg porównujący je bez aktualizacji przeszedł. TypeScript, ESLint, formatowanie oraz produkcyjny build PWA są poprawne. Nie wykonano wdrożenia ani testu na fizycznym telefonie.

## CI i uruchamianie

PR gate: npm ci → lint/TypeScript → unit/integration i kontrakty agentowe → build → smoke cross-browser → a11y/security/PWA/resilience. Full regression i showcase uruchamiają się po push oraz manualnie; visual ma osobny job macOS. Artefakty failure: HTML report, trace i screenshots, krótka retencja, bez video i uploadu dist/node_modules. Workflow ma read-only permissions i concurrency; joby testowe nie dostają sekretów. Hasło FTPS otrzymuje wyłącznie krok wysyłki w jobie deploy. Agent fixtures nie mogą zmieniać workflow ani uruchamiać shell/network.

Komendy i wyniki bieżącej weryfikacji są w README. Instalacja przeglądarek ma osobny limit 5 minut; nie ponawiamy automatycznie testów w celu ukrycia awarii. Regresja i showcase mają osobne katalogi HTML i wyników, aby raporty się nie nadpisywały. Artefakty są zbierane również po anulowaniu, jeśli zostały wygenerowane.

CI uruchamia checki, lecz nie wymusza blokady merge bez skonfigurowania required checks w regułach gałęzi GitHub. Job CD uruchamia się tylko po push do `main`, zależy od sukcesu quality-gate, full-regression i visual. Buduje wskazany commit z lockfile, publikuje FTPS i sprawdza SHA-256 statycznych plików przez HTTPS oraz SPA fallback. Sekret jest w środowisku `production`, ograniczonym do gałęzi `main`. Kopia zastępowanych plików trafia do artefaktu z retencją 14 dni. Po nieudanej wysyłce nie ponawiamy transferu automatycznie; wymagany jest triage. Lokalny deploy nadal działa.

## Wyniki lokalnej weryfikacji — 12.10.2026

Showcase: 8/8 Vitest i 20/20 wykonań Playwright (17 różnych browser scenarios + 3 dodatkowe wykonania smoke). Łącznie 25 logicznych scenariuszy. Porównania wizualne przeszły z zapisanymi PNG, bez update. Szersza regresja: 109/109 Vitest, 47/47 Playwright. Wybrane smoke/resilience powtórzono pięć razy: 15/15, retries=0. TypeScript, ESLint i produkcyjny build PWA poprawne.

Środowisko baseline: macOS 26.5.2 arm64, Node 24.18.0, Playwright 1.63.0, Chromium z instalacji Playwright, viewport 393 × 852, scale 1. Kod jest opublikowany na GitHub. [Pierwszy przebieg CI](https://github.com/logip87/jedna-kula/actions/runs/38235390349) zaliczył full-regression (showcase i 47 E2E) oraz visual. Quality gate zaliczył lint, TypeScript, Vitest i kontrolę generatora, ale przekroczył limit joba podczas instalacji przeglądarek. Cały przebieg miał wynik cancelled; nie deklarujemy pełnego CI jako zielonego.

## Potwierdzenie CI — 12.10.2026

[Przebieg dla commita `03c478a`](https://github.com/logip87/jedna-kula/actions/runs/38237821420) zakończył się sukcesem. Wszystkie trzy joby przeszły: quality-gate, full-regression, visual. Potwierdza to wykonanie na hosted runnerach, w tym smoke Chromium/Firefox/WebKit, representative risk gate, pełną regresję i zgodność baseline macOS. Wynik dotyczy wskazanego commita; bieżący status należy sprawdzać w Actions. Poprawiony test mentalny przeszedł również pięć razy lokalnie z `CI=1`, bez retry.
