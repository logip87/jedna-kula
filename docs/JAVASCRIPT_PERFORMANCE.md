# JavaScript — podział kodu i pomiar startu

Bazą jest commit `d002b65` z gałęzi `main`. `git pull --ff-only origin main` potwierdził aktualność lokalnego repozytorium. Zachowano nowszy onboarding, wybór celu treningowego i wcześniejsze zmiany mentalno-taktyczne.

## Zmiany

- `src/main.tsx` zawiera powłokę, zapis stanu i routing. „Dzisiaj” pozostaje dostępne bez oczekiwania na dodatkowy moduł strony.
- `src/route-components.tsx` definiuje stałe komponenty `React.lazy` z jawnymi importami. Osobno ładowane są ekrany przepisów/quizu, przygody, precyzji, gry we dwoje, rozwoju, sytuacji, lekcji, generatora oraz formularza zgłoszeń. Ekrany treningu, wyników, profilu i ustawień współdzielą odroczony `src/screens.tsx`.
- `src/BeginnerGuide.tsx` zawiera przewodnik wspólny dla „Dzisiaj” i ekranu startowego. `Today.tsx` i `ResultInsights.tsx` wydzielono z dotychczasowego `Coaching.tsx`. Zachowano jego dotychczasowe eksporty dla kompatybilności importów.
- `src/features/rules/answer-key.ts` jest jednym źródłem klucza odpowiedzi. Quiz nadal korzysta z tych samych odpowiedzi, lecz obliczanie XP i Skill Tree nie importuje już treści wszystkich pytań ani całego katalogu przepisów.
- `Suspense` pokazuje krótki komunikat wczytywania. `ScreenBoundary` utrzymuje powłokę i nawigację przy nieudanym pobraniu ekranu oraz pozwala ponowić otwarcie przez odświeżenie. Zapisany profil i treningi pozostają w IndexedDB.
- Dotychczasowy Workbox precache nadal obejmuje wszystkie wygenerowane pliki JavaScript. Nie zwiększono progu ostrzeżenia Vite ani nie usunięto treści, funkcji czy obsługi offline.

## Rozmiary

Wartości w bajtach, kB oznacza 1000 B. Gzip porównano tym samym `gzipSync` z Node, więc nie miesza się ustawień raportera Vite i narzędzia pomiarowego.

- Główny plik: 640 190 → 321 077 B, spadek 49,8%.
- Cały startowy graf JS: 640 190 → 424 755 B, spadek 33,7%.
- Cały startowy graf po gzip: 197 267 → 139 260 B, spadek 29,4%.
- Wszystkie wygenerowane pliki JS: 645 843 → 660 712 B, wzrost 2,3% wynikający z granic modułów, dodatkowych importów i obsługi błędu. PWA pobiera cały komplet w tle na potrzeby offline.

Nie należy utożsamiać głównego pliku z całym kosztem startu. Raport z manifestu obejmuje także wszystkie rekurencyjne importy statyczne, bez importów dynamicznych.

## Czas startu

`scripts/measure-startup.mjs` obsługuje zbudowane pliki na lokalnym HTTP z gzip i uruchamia Chromium w świeżym kontekście dla każdej próby. Warunki: viewport 390 × 844, procesor spowolniony 4 razy, opóźnienie sieci 100 ms, pobieranie 200 kB/s, wysyłanie 100 kB/s. Mierzony jest czas od początku nawigacji do widocznego nagłówka „Dzisiaj”. To lokalny pomiar laboratoryjny, a nie wynik z telefonów użytkowników ani FCP/LCP.

Każda wersja: 7 prób. Mediana przed zmianą 1440 ms, po zmianie 1158 ms, poprawa 19,6%. Przed zmianą: 1432–1443 ms; po zmianie: 1150–1163 ms. [Surowe próbki i warunki](STARTUP_MEASUREMENTS.json).

Service worker jest wyłączony wyłącznie w pomiarze, aby oddzielić pierwszy start dokumentu od pobierania pełnego cache w tle. Offline ma osobne testy z aktywnym service workerem. Pomiar nie obiecuje skrócenia pełnej instalacji PWA.

Aby powtórzyć porównanie, zbuduj obie wersje do osobnych katalogów i uruchom kolejno, bez równoległych testów przeglądarkowych:

```sh
node scripts/measure-startup.mjs /sciezka/do/starego/dist 7
node scripts/measure-startup.mjs dist 7
```

## Kontrola rozmiaru

`vite.config.ts` generuje manifest buildu. `scripts/check-bundle.mjs` jest częścią `npm run build` i zlicza unikalne statyczne importy entry pointu. Build kończy się błędem po przekroczeniu 475 000 B startowego JS albo 500 000 B w dowolnym pojedynczym pliku JS. Limity są zapasem na niewielkie zmiany, a nie celem dalszego zwiększania kodu. `npm run check:bundle` ponawia raport bez przebudowania.

## Weryfikacja

Nowe testy sprawdzają limit pobieranego JS na ekranie startowym, odroczenie innych ekranów, pierwsze otwarcie wszystkich wydzielonych modułów offline po przygotowaniu wyłącznie ekranu „Dzisiaj”, obsługę błędu pobrania i skuteczne ponowienie. Test klucza odpowiedzi sprawdza kompletność pytań, ignorowanie nieznanych ID oraz zachowanie dotychczasowego przyznawania XP i progresu.

Test geometrii nagłówka w trybie offline przygotowuje teraz cache przez wspólny helper `cachedApp`. Wcześniej zakładał, że sama widoczność ekranu startowego gwarantuje dostępność całego kodu; po podziale nie jest to warunek ukończonej instalacji PWA. Oczekiwane zachowanie nagłówka i możliwość otwarcia profilu nie zostały zmienione.

Wyniki końcowe:

- `npm test`: 179/179 w 21 plikach.
- `npm run test:e2e`: 91/91, w tym nowe testy pierwszego wejścia offline, limitu startowego JS i odzyskania ekranu po błędzie pobrania.
- `npm run qa:contracts`: 11/11.
- `npm run qa:generate:check`: wygenerowany test zgodny z planem.
- `npm run lint`, `npm run typecheck`, `npm run build`: poprawne, bez ostrzeżenia o pliku JS większym niż 500 kB.
- Oba skrypty pomiarowe przeszły `node --check`; raport manifestu i benchmark wykonano na rzeczywistych buildach.

Pomiary i testy wykonano na lokalnym buildzie. Nie wykonywano publikacji aplikacji.
