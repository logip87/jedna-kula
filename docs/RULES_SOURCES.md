# Źródła przewodnika „Zasady gry”

Weryfikacja: **07.10.2026**. Treści to praktyczne parafrazy reguł, a nie kopia pełnego regulaminu. Metadane wpisów i źródeł są w `src/features/rules/catalog.ts`. Oryginały PDF znajdują się w `public/rule-sources`, a tekst roboczy odczytany z PDF w `docs/rule-sources`. Data w adresie serwera jest datą publikacji pliku, nie automatycznie datą zatwierdzenia regulaminu.

## Podstawa i pierwszeństwo

- [Oficjalny Regulamin Sportu Pétanque PFP](https://petanque.pl/wp-content/uploads/2026/02/tlumaczenie_regulaminu_2021_zmiany_kolegium_sedziow_na_www.pdf): aktualizacja tłumaczenia 19.03.2021, zasady FIPJP od 01.01.2021. Zweryfikowano artykuły wykorzystywane w katalogu oraz odpowiadający im [oficjalny regulamin FIPJP](https://fipjp.org/images/pdf/reglements/REGLEMENT-OFFICIEL-SPORT-PETANQUE.pdf).
- [FIPJP](https://www.fipjp.org/index.php/fr/) informuje o braku zmian regulaminu gry na 2026 rok; ewentualne zmiany zapowiedziano od 01.01.2027. Dlatego nie nadano zasadom z 2021 fikcyjnej daty zatwierdzenia „2026”.
- [Aktualna lista regulaminów PFP](https://petanque.pl/regulaminy/) była punktem wejścia do dokumentów zawodów.
- [Wykładnie Kolegium Sędziów PFP](https://petanque.pl/wykladnie-kolegium-sedziow/) udostępniają wykładnie z lat 2012–2017. Nie znaleziono na tej stronie wykładni późniejszej niż obecny ogólny regulamin, która zastępowałaby wykorzystane zasady.
- Zasady ogólne PFP: 24.02.2021, § 2 (definicje rozgrywki, początku rozgrywki, dodatkowego rzutu, punktów, Buchholza).
- Systemy turniejowe: 30.11.2024, rozdziały 1–6. Starszego rozdziału o strzale nie zastosowano do MPSP 2026.
- Ranking: 30.11.2024, § 1. Turnieje rankingowe: aktualizacja 15.04.2025, § 1–2.
- IMPK, IMPM, MPDK, MPDM, MPTK, MPTM, MP Mikstów: zatwierdzenie 30.12.2025. Wskazane czasy mają zakres konkretnej konkurencji, etapu i wariantu liczby zgłoszeń; nie są przepisem ogólnym.
- MPJ i MMP: 03.04.2026, § 1–4. Wiek MPJ liczony do końca roku; MMP obejmuje kończących w roku startu 18–22 lata.
- [MPSP](https://petanque.pl/wp-content/uploads/2026/04/MPStrzal.pdf): 03.04.2026, § 1 pkt 8–11, § 2 pkt 3–4, § 3 i załącznik nr 2. Poza tekstem obejrzano diagramy pięciu figur. Szczególna czerwona kartka, 15-minutowa seria i sprzęt MPSP mają pierwszeństwo w tych zawodach przed starszym opisem konkursu w systemach turniejowych.

## Zakres przewodnika

Katalog zawiera wyłącznie zweryfikowane zasady. Warunki konkretnych zawodów należy sprawdzać w ich regulaminie.

Przy rzucie poza kolejnością opisano art. 24, możliwość korzyści i wyjątki art. 35; nie obiecano automatycznego anulowania przy każdym zdarzeniu. Przy nieoznaczonym kółku podano obowiązek oznaczenia i interwencję sędziego, bez wymyślonej sankcji punktowej. Sekwencja kar nie oznacza obowiązku trzech kartek przed każdą dyskwalifikacją.

## Aktualizacja katalogu

1. Pobierz nowy dokument z oficjalnej strony, zachowaj PDF i sprawdź datę zatwierdzenia w środku.
2. Przeczytaj tekst i obejrzyj diagramy, gdy położenie obiektów wpływa na interpretację.
3. Zmień wpis źródła, właściwe reguły i pytania; stosuj nowy dokument tylko w jego zakresie.
4. Zmień `verifiedOn` i `contentVersion` w `model.ts` po rzeczywistej weryfikacji.
5. Uruchom lint, typecheck, Vitest, build i Playwright; sprawdź nowy PDF offline. Testy sprawdzają spójność danych i zachowanie aplikacji, nie zastępują ponownego czytania przepisów.

## Pliki implementacji

Dodane:

- `src/app-context.ts` — wspólny kontekst zapisu.
- `src/features/rules/model.ts` — model reguł, źródeł i postępu quizu; wersja treści; normalizacja tekstu; wynik martwej świnki.
- `src/features/rules/catalog.ts` — kategorie, oficjalne źródła, reguły i szybka pomoc.
- `src/features/rules/quiz.ts` — 36 pytań, losowanie rundy i punktacja.
- `src/features/rules/diagrams.tsx` — granice boiska, tor i pięć figur.
- `src/features/rules/Rules.tsx` — ekran główny, wyszukiwanie, kategorie, szczegóły, szybka pomoc, kalkulator i quiz.
- `tests/unit/rules.test.ts`, `tests/e2e/rules.spec.ts` — spójność źródeł, decyzje, zapis, responsywność, dostępność i offline.
- `eslint.config.js` — kontrola kodu TypeScript.
- `public/rule-sources/*.pdf`, `docs/rule-sources/*.txt` — oryginały i odczyt źródeł.
- `docs/RULES_SOURCES.md` — ta dokumentacja.

Zmienione: `src/main.tsx` (routing i nawigacja), `src/domain.ts` (opcjonalny postęp quizu), `src/styles.css`, `vite.config.ts` (PDF-y offline), `package.json` i lockfile, README, architektura i lista wdrożenia. Bez resetowania danych użytkownika i bez osobnej bazy.
