# Mental i taktyka — audyt i projekt przed implementacją

Stan wejściowy: 25 lekcji w `mental/catalog.ts`, 25 modułów mentalnych generowanych z tych lekcji i 5 fizycznych. Dziesięć historycznych identyfikatorów modułów ma stabilne liczby kroków. Kompetencje: Koncentracja, Reset, Presja, Pewność gry, Zawodnik kompletny. Trzy poziomy są dostępne bez blokad wiekowych.

Istniejący przepływ: lekcja → ręczne zaliczenie; ćwiczenie → check-in napięcia → wskazówka do następnej sesji. W sesji zapisuje się rutynę, stres, powrót po błędzie; rzuty sytuacyjne mają oddzielną ocenę decyzji i wykonania. Brakuje zadania z lekcji i refleksji po jego zastosowaniu.

Taktyka: `adventure/data.ts` i `situations/cases.ts` zawierają wspólną pulę 12 scenariuszy wykorzystywanych w analizie i trybie meczowym. `throw-scenarios.ts` ma siedem sytuacji do fizycznych rzutów. Nie należy kopiować ich do quizów. Wybór wariantu taktycznego nie jest automatycznie dobry lub zły — aplikacja zapisuje analizę, nie trafność decyzji. Nie da się rzetelnie wykrywać „słabej taktyki” z samego wyboru opcji.

Progres: `State.lessons` przechowuje ID; IndexedDB i backup walidują je względem katalogu. XP i osiągnięcia już istnieją. Skill Tree Mental opiera się na samoocenie rutyny w 5 pełnych sesjach, Taktyka na wiedzy i analizach. Zachować te znaczenia; dodać do opisu dowody zastosowania, bez punktów za refleksję.

## Klasyfikacja wszystkich obecnych lekcji

- routine — IMPROVE: rozdzielić krótkie przygotowanie od zadania pełnej rutyny w serii.
- one — IMPROVE: decyzja przed kołem, warunek zmiany tylko przy nowej informacji.
- goal — KEEP: wybór widocznego punktu skupienia, odrębny od wyboru zagrania.
- focus-return — KEEP: powrót po przerwaniu przygotowania.
- focus-endurance — KEEP: cykle uwagi i odpoczynku w długim turnieju.
- mistake — IMPROVE: fakt → korekta → następna kula.
- good — KEEP: ponowna ocena układu po sukcesie.
- reset-analysis — IMPROVE: zamknięcie analizy po jednej obserwacji; odróżnić od klasyfikacji błędu.
- reset-chain — KEEP: przywrócenie tempa po kilku pudłach.
- reset-energy — KEEP: zamknięcie meczu przed przerwą; odrębne od utrzymywania uwagi.
- stress — IMPROVE: rozpoznawanie ostrożności, desperackiego ataku i zmiany decyzji.
- score — IMPROVE: porównać ten sam układ przy 2:2 i 12:12, bez automatycznej recepty.
- pressure-trailing — KEEP: wykonalny cel przy stracie.
- name — IMPROVE: reputacja rywala nie zastępuje obserwacji dzisiejszej gry.
- pressure-last — KEEP: jedna próba bez poprawki, ocena procesu osobno od wyniku.
- trust — KEEP: uwaga na efekcie podczas wykonania.
- confidence-technique — KEEP: jedna wskazówka zamiast wielu zmian technicznych.
- confidence-series — IMPROVE: pewność z porównywalnych serii i statystyk.
- confidence-dialogue — IMPROVE: zastąpić żargon konkretnym komunikatem działania.
- confidence-flow — IMPROVE: usunąć żargon; zachować odrębny temat utrzymania rytmu po udanej serii.
- roles — KEEP: elastyczność roli wobec potrzeb drużyny.
- complete-decision — IMPROVE: porównanie dwóch wykonalnych zagrań i powiązanie z istniejącą sytuacją.
- complete-team — IMPROVE: informacja przed rutyną, bez sprzecznych instrukcji w kole.
- complete-communication — IMPROVE: sytuacja → cel → decyzja → plan B.
- complete-preparation — KEEP: kontrola przygotowania przed startem.

Bilans: 12 KEEP, 13 IMPROVE, 0 MERGE, 0 REPLACE, 0 REMOVE. Bliskość tematów nie oznacza duplikatu: reset po pudle, po sukcesie, po serii i zamknięcie meczu mają inne wyzwalacze. Wskazówka wewnętrzna steruje własną uwagą; komunikacja zespołu przekazuje informacje między zawodnikami. Nie usuwać zapisów ani linków.

## Mapa kompetencji i rzeczywiste luki

Docelowo 31 lekcji, nadal pięć istniejących kompetencji:

- Koncentracja (5): rutyna, decyzja przed kołem, cel, powrót uwagi, długi turniej.
- Reset (6): błąd, sukces, krótka analiza, seria błędów, energia, NOWA reakcja na złość.
- Presja (5): ważny rzut, wynik i cena błędu, strata, mocniejszy rywal, ostatnia kula.
- Pewność gry (5): wytrenowany ruch, jedna korekta, porównywalne serie, komunikat działania, rytm.
- Zawodnik kompletny (10): role, wybór zagrania, pomoc partnerowi, komunikacja, przygotowanie; NOWE ryzyko, liczenie kul, zmiana strategii, czytanie terenu, decyzja a wykonanie.

Każda lekcja otrzymuje addytywne pola: czas, tagi, procedura, komenda meczowa, refleksja i opcjonalny identyfikator istniejącej sytuacji. Dotychczasowe pola stanowią problem, przesłanie, przykład i zadanie — nie dublować modelu synonimami.

## Projekt przepływu i kompatybilności

Główne CTA lekcji wybiera jej zadanie do następnej sesji przez istniejące `pendingMentalCueLessonId`. Przy tworzeniu sesji istniejąca transakcja przenosi ID do `mentalCueLessonId`. Podczas rzucania widoczna jest wskazówka i zadanie, bez dodatkowych kliknięć. Po sesji jedno opcjonalne pytanie z trzema odpowiedziami: zastosowane / powtórzyć / nie było okazji. Refleksja jest addytywnym polem sesji, walidowanym w backupie. Można ponowić zadanie. Stare zaliczenia pozostają dowodem przeczytania; zastosowanie jest pokazywane osobno. Nie uznawać starego zaliczenia za wykonaną praktykę.

Biblioteka domyślnie pokazuje następny temat i aktualną kompetencję. Pełny katalog i filtry pozostają w rozwijanym panelu; linki filtrów otwierają go automatycznie.

Rekomendacje korzystają z istniejących progów danych: 5 ocen rutyny; 3 check-iny napięcia; porównanie minimum 2 serii i 20 prób z presją oraz bez, przy tych samych warunkach. Dołączyć konkretne ID lekcji. Nie tworzyć diagnozy taktycznej, ponieważ obecne dane jej nie uzasadniają.

Powiązania do wspólnych sytuacji: one / complete-decision → recover; score / pressure-last / risk / ball-count → last; complete-team / complete-communication → protect; terrain-reading → terrain; strategy-change → two-targets; decision-error → recover. Link do meczu uruchamia tę samą istniejącą sytuację jako pierwszą, zachowując trwający mecz.

## Weryfikacja

Po wdrożeniu: kontrakty katalogu i referencji, zapis starego progresu i wznowienie dawnych modułów, import wersji backupów 2–6, nowe zadanie i refleksja, progi rekomendacji, regresja XP, Playwright mobile/desktop/offline, lint, typecheck i build. Wyniki końcowe uzupełnić po wykonaniu.


## Wynik wdrożenia

Bilans treści: 25 → 31 mikro-lekcji. Zachowano merytorycznie 12, poprawiono 13, połączono 0, zastąpiono 0, usunięto 0, dodano 6. Wszystkie lekcje otrzymały wspólne metadane i konkretne procedury. Nadal są 3 poziomy, 5 kompetencji, te same klucze zapisów i ten sam system nagród. Istniejąca biblioteka praktyki generuje 31 modułów z tego samego katalogu — nie powstała druga biblioteka treści.

Powiązania z meczem (11 lekcji): `one`, `complete-decision`, `score`, `pressure-last`, `risk`, `ball-count`, `complete-team`, `complete-communication`, `terrain-reading`, `strategy-change`, `decision-error`. Używają dokładnie tych samych scenariuszy, które już istniały. W ćwiczeniu liczenia kul przy scenariuszu `last` trzeba podać obie liczby przed wyborem. Trwający mecz nigdy nie jest zastępowany linkiem z lekcji.

Rekomendowane na podstawie danych: `routine` (najwyżej 2 zastosowania rutyny na 5 pełnych treningów), `mistake` (większy stres w minimum 3 z 5 pełnych treningów albo 3 check-iny 4–5/5 z ostatnich 14 dni), `one` (minimum 2 serie i 20 prób w każdym wariancie, minimum 60% w zwykłych seriach i spadek co najmniej 15 pp pod presją w porównywalnych warunkach). Wybór zadania, refleksja i powtórka nie przyznają nowych XP. Mental i Taktyka w istniejącym Skill Tree otrzymały informację o potwierdzonym zastosowaniu, bez przeliczania odporności psychicznej na poziom.

Walidacja zapisów jest addytywna: stare dane nie wymagają przepisywania ani zmiany wersji IndexedDB. Nowe pole `Session.lessonReflection` jest opcjonalne i walidowane; stare kopie wersji 2–6 nadal przechodzą import. Nowa sesja nie dziedziczy refleksji poprzedniej serii. Odczyt nie dopisuje wykonanej praktyki do historycznych zaliczeń.

### Zmienione pliki

Treść i przepływ:

- `src/features/mental/catalog.ts` — sześć nowych lekcji w istniejącym katalogu.
- `src/features/mental/content.ts` — poprawki 13 lekcji, procedury, pytania, tagi i powiązania.
- `src/features/mental/Lessons.tsx` — następny temat, aktualny moduł i rozwijana biblioteka.
- `src/features/mental/FieldTask.tsx` — wybór zadania, refleksja, powtórka, dowody zastosowania.
- `src/features/mental/CountBeforeChoice.tsx` — liczenie kul przed wyborem w istniejącej sytuacji.
- `src/features/mental/cue.ts` — użycie jednej komendy w ćwiczeniu i sesji, wybór zadania w istniejącej kolejce.
- `src/domain.ts` — opcjonalne metadane lekcji i refleksja sesji.
- `src/main.tsx` — szczegóły lekcji, zadanie w sesji i refleksja w podsumowaniu/historycznym wyniku.

Integracje:

- `src/features/adventure/Adventure.tsx` — liczenie przed analizą wariantów.
- `src/features/situations/Situations.tsx` — powiązanie meczu z lekcją i liczenie przed decyzją.
- `src/features/situations/model.ts` — opcjonalny scenariusz na początek nowego meczu.
- `src/features/product/model.ts` — konkretne ID rekomendacji oraz prawidłowe, chronologiczne uzasadnienie obserwacji napięcia.
- `src/features/coaching/Coaching.tsx` — link z rekomendacji do lekcji.
- `src/features/coaching/backup.ts` — walidacja opcjonalnej refleksji.
- `src/features/coaching/model.ts` — wyzerowanie refleksji przy nowej próbie.
- `src/features/development/Development.tsx` — ta sama komenda w bibliotece ćwiczeń.
- `src/features/development/model.ts` — dowody zastosowania w istniejącym Skill Tree i czyszczenie refleksji nowych sesji.

Testy i dokumentacja:

- `tests/unit/mental-field.test.ts` — kontrakty katalogu, migracje zapisów, progres, rekomendacje, scenariusze i brak nowych nagród.
- `tests/e2e/mental-field.spec.ts` — pełny przepływ offline, telefon, desktop, liczenie i wszystkie dawne adresy.
- `tests/unit/domain.test.ts`, `tests/unit/mental.test.ts` — oczekiwania rozszerzonego katalogu.
- `tests/unit/product-next-steps.test.ts`, `tests/e2e/product-next-steps.spec.ts` — kanoniczna komenda resetu.
- `tests/e2e/app.spec.ts`, `tests/e2e/mental.spec.ts` — liczba lekcji i rozwijana biblioteka.
- `tests/support/agentic-workflow.ts`, `tests/agentic/generated/mental.spec.ts` — aktualna liczba lekcji w generowanym kontrakcie.
- `README.md`, `docs/MENTAL_TACTICAL.md` — opis modułu i pełny audyt.

### Wyniki testów

- `npm test`: 174/174, w tym import wersji 2–6, zachowanie 25 dawnych zaliczeń, istniejące wznowienia modułów, refleksje i progi danych.
- `npm run qa:contracts`: 11/11.
- `npm run test:e2e`: 85/85, w tym istniejące regresje, offline, dostępność, stare linki, 320–1920 px oraz nowy test rzeczywistego kontekstu desktopowego.
- `npm run lint`, `npm run typecheck`, `npm run build`: poprawne.
- Obejrzano zrzuty telefonu i desktopu. Po doprecyzowaniu treści procedur ponowiono testy jednostkowe, build i pięć testów nowego przepływu.

### Ograniczenia

Refleksja jest samooceną, a nie automatycznym pomiarem zachowania. Nie diagnozujemy błędnej taktyki na podstawie wybranej opcji: obecny model dopuszcza kilka uzasadnionych decyzji. Dlatego nie ma automatycznej rekomendacji „Cena ryzyka” z rzekomo słabej taktyki. Dostępne są bezpośrednie powiązania i ręczny wybór tej lekcji.

Refleksja z zadania jest obecnie zapisywana w fizycznej sesji treningowej; istniejący symulowany tryb meczowy zachowuje własną analizę decyzji i historię men. W treningach testowych i wyzwaniach wskazówka czeka na zwykłą sesję, aby zachować porównywalność istniejących sprawdzianów.

Build zgłasza ostrzeżenie o głównym pakiecie JavaScript powyżej 500 kB. Nie blokuje generowania ani cache PWA; podział pakietu pozostaje osobnym tematem wydajnościowym. Nie wykonywano publikacji aplikacji.
