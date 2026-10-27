# Strategia testów

## Cel

Jedna kula jest lokalną PWA do treningu pétanque. Dane treningowe i szkice są zapisywane w IndexedDB, a service worker udostępnia aplikację offline po przygotowaniu cache. Strategia testów chroni przede wszystkim zachowania, których utrata byłaby odczuwalna dla gracza: zapis wyniku, trwałość postępu, użycie bez sieci, dostępność krytycznych kontrolek i odporność na uszkodzone dane.

Nie jest to pełna automatyczna macierz wszystkich urządzeń, przeglądarek i wariantów interfejsu. Testy przeglądarkowe korzystają z jednego reprezentatywnego profilu: Pixel 7 w Chromium. Macierze algorytmów, punktacji i progresu pozostają na poziomie Vitest.

## Aktualny zestaw

- **Vitest:** testy jednostkowe i integracyjne w `tests/unit`, `tests/integration`, `tests/agent-security` oraz `tests/agentic`. Obejmują między innymi punktację, sesje, rekomendacje, progres, import, walidację i kontrakty demonstracyjnego harnessu agentowego.
- **Krytyczne E2E:** pięć scenariuszy w `tests/e2e/critical`. Pokrywają pełny trening z cofnięciem i wznowieniem, trwałość lekcji mentalnej, modułu ruchowego, misji Przygody i decyzji taktycznej.
- **PWA/offline:** trzy scenariusze w `tests/pwa/offline.spec.ts`, wykonywane na produkcyjnym buildzie z rzeczywistym service workerem i wyłączoną siecią.
- **Dostępność:** dwa scenariusze Axe-core oraz asercje skip linku, nazw kontrolek i klawiatury w `tests/accessibility/critical.spec.ts`.
- **Bezpieczeństwo danych:** trzy scenariusze w `tests/security/input.spec.ts`: tekstowa obsługa nazwy przypominającej XSS, kontrolowany błąd dla uszkodzonego IndexedDB oraz odrzucenie sfałszowanego importu.
- **Odporność zapisu:** trzy scenariusze w `tests/resilience/commit.spec.ts`. Zatrzymują potwierdzenie transakcji IndexedDB, aby sprawdzić blokadę interfejsu, brak duplikatów i zachowanie danych podczas opuszczania ekranu.
- **Demonstracja agentic QA:** lokalne fixtures i sztuczny plan/review. Generator tworzy test wykonywany przez Playwright, a test review blokuje niezatwierdzony plan i zmianę oczekiwanego zachowania. To nie jest test żywego modelu AI ani produkcyjny sandbox.

Konfiguracja `playwright.config.ts` uruchamia tylko `tests/e2e/critical/**/*.spec.ts`. Konfiguracja showcase rozszerza ją o PWA, dostępność, bezpieczeństwo, odporność i wygenerowany test agentic. Repozytorium nie utrzymuje obecnie testów visual regression, automatycznych baseline PNG ani macierzy Firefox/WebKit/desktop.

## Dobór poziomu testu

Vitest jest używany dla czystej logiki oraz współpracy modułów, gdy UI nie wnosi dodatkowego ryzyka. Playwright jest używany tam, gdzie istotne są renderowanie Reacta, routing, IndexedDB, dostępność lub service worker. Dzięki temu scenariusze przeglądarkowe pozostają krótkie i skupione na krytycznych przepływach, a warianty domenowe nie są wielokrotnie odtwarzane przez UI.

Testy przeglądarkowe używają locatorów opartych na rolach, nazwach i etykietach. Każdy ma izolowany kontekst przeglądarki; nie polegają na współdzielonym stanie ani stałych opóźnieniach. `retries` pozostaje ustawione na `0`.

## CI i uruchamianie

Workflow GitHub Actions działa dla pull requestów, pushów do `main`/`master` i uruchomień ręcznych. Quality gate wykonuje lint, typecheck, Vitest, kontrolę wygenerowanego testu, smoke i browserowe testy ryzyka. Po pushu lub uruchomieniu ręcznym uruchamiane są także showcase i krytyczne E2E. Deploy dla `main` zależy od obu jobów testowych.

```sh
npm ci
npx playwright install chromium
npm run typecheck
npm run lint
npm test
npm run qa:showcase
npm run test:e2e
npm run build
```

Pojedyncze obszary można uruchomić przez `npm run qa:smoke`, `npm run qa:pwa`, `npm run qa:a11y`, `npm run qa:security`, `npm run qa:resilience`, `npm run qa:agent-security` oraz `npm run qa:agentic`.

## Granice automatyzacji

Axe-core nie zastępuje ręcznej oceny z czytnikiem ekranu ani testu na fizycznym telefonie. Automatycznie nie są obecnie sprawdzane Firefox, WebKit, desktopowe układy i różnice pikselowe. Nie testujemy prawdziwych ataków, odczytu sekretów ani zachowania modelu AI online. Te ograniczenia są celowe i powinny być traktowane jako obszary do ręcznej weryfikacji lub przyszłej rozbudowy, a nie jako pokryte kontrakty.
