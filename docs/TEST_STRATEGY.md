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

Dwa baseline PNG są dla Chromium na macOS; dedykowany workflow visual używa `macos-26` (Apple Silicon), zgodnego z główną wersją systemu bazowego. [Obsługiwane obrazy GitHub Actions](https://github.com/actions/runner-images). Linux nie porównuje do baseline macOS, ponieważ renderowanie zależy od środowiska. Brak baseline lub istotny diff to failure; aktualizacja jest świadomym lokalnym poleceniem i wymaga porównania before/after. Wersja Playwright pochodzi z package-lock. Pierwszy przebieg 12.10.2026 potwierdził zgodność obu baseline na hosted runnerze `macos-26`, bez ich aktualizacji. [Zasady Playwright dotyczące środowiska](https://playwright.dev/docs/test-snapshots).

## CI i uruchamianie

PR gate: npm ci → lint/TypeScript → unit/integration i kontrakty agentowe → build → smoke cross-browser → a11y/security/PWA/resilience. Full regression i showcase uruchamiają się po push oraz manualnie; visual ma osobny job macOS. Artefakty failure: HTML report, trace i screenshots, krótka retencja, bez video i uploadu dist/node_modules. Workflow ma read-only permissions, concurrency i brak sekretów. Agent fixtures nie mogą zmieniać workflow ani uruchamiać shell/network.

Komendy i wyniki bieżącej weryfikacji są w README. Instalacja przeglądarek ma osobny limit 5 minut; nie ponawiamy automatycznie testów w celu ukrycia awarii. Regresja i showcase mają osobne katalogi HTML i wyników, aby raporty się nie nadpisywały. Artefakty są zbierane również po anulowaniu, jeśli zostały wygenerowane.

CI uruchamia checki, lecz nie wymusza blokady merge bez skonfigurowania required checks w regułach gałęzi GitHub. Publikacja na produkcję jest lokalną, ręcznie uruchamianą operacją FTPS (`npm run deploy`); automatyczny job CD nie jest skonfigurowany.

## Wyniki lokalnej weryfikacji — 12.10.2026

Showcase: 8/8 Vitest i 20/20 wykonań Playwright (17 różnych browser scenarios + 3 dodatkowe wykonania smoke). Łącznie 25 logicznych scenariuszy. Porównania wizualne przeszły z zapisanymi PNG, bez update. Szersza regresja: 109/109 Vitest, 47/47 Playwright. Wybrane smoke/resilience powtórzono pięć razy: 15/15, retries=0. TypeScript, ESLint i produkcyjny build PWA poprawne.

Środowisko baseline: macOS 26.5.2 arm64, Node 24.18.0, Playwright 1.63.0, Chromium z instalacji Playwright, viewport 393 × 852, scale 1. Kod jest opublikowany na GitHub. [Pierwszy przebieg CI](https://github.com/logip87/jedna-kula/actions/runs/38235390349) zaliczył full-regression (showcase i 47 E2E) oraz visual. Quality gate zaliczył lint, TypeScript, Vitest i kontrolę generatora, ale przekroczył limit joba podczas instalacji przeglądarek. Cały przebieg miał wynik cancelled; nie deklarujemy pełnego CI jako zielonego.
