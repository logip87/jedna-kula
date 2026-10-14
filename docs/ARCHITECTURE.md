# Architektura

## Aplikacja

Statyczna aplikacja React z React Router. `main.tsx` zawiera niezależne komponenty ekranów i lekki kontekst stanu. Nawigacja na dole telefonu, boczna na komputerze. Aktywny trening ma ograniczony interfejs. `styles.css` wykorzystuje Tailwind i style komponentów, bez zewnętrznych fontów, zdjęć ani zasobów potrzebnych z sieci.

## Modele i katalog

`domain.ts` definiuje Player, Drill, Lesson, Session, PlannedThrow, Attempt, Achievement i State. `data.ts` łączy 13 pierwotnych ćwiczeń z 17 dodatkowymi z `features/coaching/catalog.ts`; udostępnia 25 lekcji z `features/mental/catalog.ts`. Treści są po polsku i dostępne offline.

## Wspólny silnik

`makePlan` tworzy plan odległości, typów rzutów, faz i ról. Plan losowy nigdy nie powtarza odległości bezpośrednio po sobie. Wygenerowany plan zapisuje się w szkicu, więc odświeżenie nie losuje go ponownie. `choices` definiuje punktację i znaczenie trafienia. Active korzysta z tych samych elementów dla każdego ćwiczenia. Decyzja sytuacyjna wybiera rodzaj rzutu; MIDDLE wybiera zadanie. Lob wymaga osobnego zapisu lądowania.

Tryb 30-minutowy zapisuje numer etapu i czas jego początku. Zegar po wznowieniu wylicza pozostały czas; przejście do kolejnego etapu pozostaje świadomą akcją użytkownika. W etapach technicznych można zapisywać dowolną liczbę rzutów. Czas nie wpływa na punktację.

## Zapis

`storage.ts` udostępnia Repository: load/save. IndexedDB przechowuje pojedynczy spójny stan w transakcji `put`: profil, lekcje, historię, osiągnięcia i aktywny szkic. Każdy rzut czeka na zakończenie zapisu. Blokada zapobiega podwójnemu zapisowi przy szybkim dotknięciu. Interfejs przechodzi dalej dopiero po zatwierdzeniu transakcji. Błędy zapisów są widoczne i pozostawiają obecny ekran.

Historia dostaje completedAt, samoocenę stresu, powrotu po błędzie i użycia rutyny. Osiągnięcia mają datę pierwszego odblokowania i pozostają odblokowane. Wyniki i statystyki wyliczają się z prób; liczba sesji nie obejmuje szkicu. Seria dni używa lokalnych dat kalendarzowych i toleruje trening zakończony wczoraj.

## PWA i aktualizacje

VitePWA/Workbox buforuje cały app shell, łącznie z katalogiem ćwiczeń i lekcji. Navigation fallback obsługuje głębokie linki offline. Wersja produkcyjna potrzebuje HTTPS lub localhost. Aktualizacja service workera czeka na potwierdzenie użytkownika po zakończeniu aktywnego treningu.

## Rozszerzanie

Nowe ćwiczenie zwykle wymaga nowego wpisu w katalogu i ewentualnego trybu punktacji. Repozytorium można zastąpić implementacją synchronizującą bez zmiany ekranów; przyszłe zmiany schematu powinny używać migracji wersji IndexedDB. Import kopii dodano w P0 opisanym poniżej; konta i synchronizacja pozostają poza zakresem. Przed większym rozwojem ekrany można rozdzielić do folderów features bez zmiany modelu domenowego.

## Weryfikacja

Vitest sprawdza reguły domeny i zapis przy ponownym utworzeniu repozytorium. Playwright pracuje na buildzie produkcyjnym w mobilnym Chromium, w tym ze stanem sieci offline i ponownym otwarciem strony. Testy nie zastępują ręcznej instalacji na fizycznym iPhonie i Androidzie.

## Zasady gry

Moduł `src/features/rules` oddziela wersjonowane treści (`catalog.ts`), pytania (`quiz.ts`), modele i logikę (`model.ts`), rysunki SVG (`diagrams.tsx`) i ekrany (`Rules.tsx`). `app-context.ts` udostępnia istniejący kontekst treningu i quizu; nie tworzono drugiego repozytorium ani aplikacji.

Routing: `/rules`, `/rules/category/:category`, `/rules/rule/:id`, `/rules/quick`, `/rules/quiz`. Wyszukiwanie wykorzystuje parametr `q`, normalizuje polskie znaki i ignoruje interpunkcję. Powiązane zasady mają trwałe identyfikatory. Każdy wpis ma nazwę i datę dokumentu, zweryfikowany odnośnik do artykułu, zakres zawodów, działanie w meczu, tagi i opcjonalny status braku weryfikacji.

Opcjonalne `State.rulesQuiz` przechowuje wersję treści, kolejność pytań, odpowiedzi i bieżący indeks. Wpis nie wymaga zmiany wersji bazy, więc istniejący profil, treningi i lekcje pozostają kompatybilne. Odpowiedź oraz przejście dalej czekają na transakcję zapisu. Po zmianie wersji treści użytkownik rozpoczyna aktualny quiz. Pytania nie wykorzystują niezweryfikowanych wpisów.

Workbox buforuje lokalne PDF-y w `public/rule-sources` razem z aplikacją. Odnośnik „Oryginał PFP” wymaga internetu; lokalny „Dokument PDF” działa offline. Zasady sprawdzono według źródeł opisanych w `RULES_SOURCES.md`. Aktualizacja wymaga edycji danych, daty weryfikacji i `contentVersion`, nie przebudowy ekranów.

## Przygoda i pięć modułów

`src/features/adventure` zawiera modele, katalog 20 autorskich misji i czterech plansz taktycznych, wspólne kontrolki kierunków oraz osobne ekrany ścieżki, rekomendacji, mapy, strzału precyzyjnego i gry we dwoje. Trasy rozpoczynają się od `/adventure`. Link „Misje” w głównej nawigacji prowadzi do tej sekcji; dotychczasowy Postęp pozostaje pod `/progress`, dostępny przez Więcej i mapę rzutów.

Ścieżki: krótka lub standardowa seria, 10/15/20 sesji. Krótka seria ma po 6 prób, dystanse treningowe do 7 m i większy cel w ćwiczeniach do celu; standardowa seria ma 12 prób. To autorskie warianty ćwiczeń, nie interpretacja kategorii zawodów. Sesje misji korzystają z istniejącego `Active` i `Result`, historii, punktacji i IndexedDB. Kule na różnych dystansach oraz puenta/strzał w sesji mieszanej zapisują właściwy tryb każdej próby.

Opcjonalny `State.adventure` przechowuje konfigurację, pierwsze zaliczenie każdej misji, decyzje taktyczne oraz szkice i historie serii precyzyjnych i wyzwań. Misja zalicza się dopiero podczas zapisu pełnej serii. Powtórzenia nie dodają kolejnych zaliczeń tej samej misji. Zaliczenia zachowują się po usunięciu historii technicznej; konfiguracja i długość są częścią identyfikatora ścieżki. Starsze dane działają bez migracji bazy.

`Attempt.missDirection` oraz `landingDirection` przechowują wskazany kierunek, a `Session.surface` teren. Mapa filtruje rodzaj, dystans i podłoże. Stare próby bez kierunków są jawnie pomijane w rozkładzie. Lądowanie obejmuje tylko próby lobu i nie jest mieszane z pozycją końcową.

Rekomendacja korzysta ze wspólnej logiki `features/coaching/model.ts`: bierze ostatnie 12 zapisanych sesji osobno dla każdych porównywalnych warunków i wymaga minimum 20 prób z 2 sesji na wariant. Trening innej kategorii nie usuwa starszych dowodów. Od trzech serii ranking używa mediany ostatnich maksymalnie pięciu serii, natomiast prezentowana skuteczność pozostaje rzeczywistym odsetkiem wszystkich prób w próbce. Trend 5 + 5 sesji uwzględnia daty i pierwsze lądowanie lobu; aktualna część trendu wyznacza cel. Niepełne testy nie są sygnałem do rekomendacji, a pełne analizuje się osobno od treningu. Priorytet uwzględnia słabość, pewność danych, trend, aktualność, rolę i przerwę od treningu. Starszy wariant krótkich serii zachowuje dobór dystansów do 7 m; wiek profilu nie bierze udziału w obliczeniach. Bez wystarczających danych proponuje spokojną puentę 6 m.

Strzał precyzyjny prowadzi przez figury 1–5, każdą na 6–9 m. Figura świnki nie dopuszcza 1 punktu. Można ćwiczyć bez czasu lub z ręcznym zegarem przygotowania 15 min: rozpoczęcie przygotowania uruchamia czas, potwierdzenie oddania rzutu go zatrzymuje. Stan zegara zachowuje się po odświeżeniu. Spóźniona próba nie otrzymuje punktów; częściowe serie nie liczą się do rekordu pełnych serii. Pomiar jest narzędziem treningowym, nie elektronicznym sędziowaniem zawodów.

Gra we dwoje działa na jednym telefonie, naprzemiennie po jednej kuli w rundzie; tryby pojedynku i wspólnego celu. Każdy wynik czeka na transakcję i przechodzi do następnej osoby dopiero po zapisie. Seria precyzyjna i wyzwanie mają własne historie, aby nie mieszać ich specyficznej punktacji lub wyników drugiej osoby ze statystykami osobistego treningu.

## Moduł treningowy P0

`src/features/coaching` zawiera katalog dodatkowych ćwiczeń, czystą logikę rekomendacji i porównań, ekrany Dzisiaj/generatora/słabości/własnego wyzwania oraz walidację kopii. `main.tsx` nadal prowadzi rzuty i zapisuje wyniki w istniejącym kontekście; opcjonalny `Session.trainingPlan` steruje etapami generatora. `Session.kind` i `benchmarkVersion` oddzielają testy od treningów. Statystyki treningu nie mieszają testów. Starszy eksport i stan pozostają czytelne bez nadpisującej migracji.

Rekomendacja misji deleguje do nowego algorytmu zamiast utrzymywać odrębną regułę sześciu prób. Nowy próg to 20 prób z minimum 2 porównywalnych sesji. Rytm tygodnia zastępuje serię dni w UI. [Szczegóły i zakres](TRAINING_P0.md).

## Moduł rozwoju P1

`src/features/development` zawiera modele Skill Tree, XP, celów, prób mistrzowskich i przygotowania do zawodów oraz katalog modułów mentalnych/fizycznych. `awardDevelopment(previous, next)` jest wywoływane przed zapisem zwykłych zmian; import korzysta z osobnej ścieżki i nie nalicza XP za przywrócone sesje. Dziennik nagród z identyfikatorami i limitami dziennymi jest częścią opcjonalnego `State.coaching`.

Szkic modułu jest osobny od szkicu sesji rzutowej. Każdy krok zapisuje się istniejącą transakcją i przechodzi dalej dopiero po powodzeniu. `Session.mastery` utrzymuje rodzaj próby, a plan losowego dystansu jest zapisany przed startem. Testy i próby mistrzowskie są oddzielone od zwykłych statystyk. Kopia JSON 3 zachowuje kompatybilność odczytu z wersją 2 i wcześniejszym stanem; struktura IndexedDB nie wymaga zmiany. [Reguły P1](TRAINING_P1.md).

## Sytuacje meczowe P2

`src/features/situations` współdzieli planszę i analizę z dawną taktyką. `State.situations` przechowuje oddzielny szkic i historię symulacji meczu oraz rejestr prób dnia. `Session.challenge` oznacza Boss/kulę dnia/drabinkę/presję z wersją protokołu. `awardSituations` dopisuje oznaczenia przed centralnym naliczeniem XP i atomowym zapisem; import nie uruchamia naliczania. Rzuty wyzwań korzystają z istniejącego Active/Result, z wyłączonym cofnięciem i opcjonalnymi kierunkami.

Plan sześciu różnych sytuacji jest ustalany przed meczem. Wynik każdej rozgrywki deklaruje użytkownik; nie wnioskujemy o celności i taktyce ze sztucznego wyniku. Kopia JSON 4 waliduje także sekwencję i zakończenie meczu oraz dokładne warunki wyzwań; odczyt 2/3/raw pozostaje dostępny. Brak zmiany wersji IndexedDB. [Zakres](TRAINING_P2.md), [audyt](REQUIREMENTS_AUDIT.md).

## Adaptacyjny trener i podsumowanie

`features/product/model.ts` korzysta z porównywalności i katalogu `features/coaching`, bez LLM. Propozycje trudności wymagają trzech ostatnich pełnych serii i są zatwierdzane przez użytkownika. `Session.coach` przechowuje opcjonalnie źródło startu, ID odniesienia Pokonaj siebie i wariant jednej próby. Generator 45/60 oraz krótka rutyna używają istniejącego `TrainingPlan`. JSON wersji 6 przyjmuje też kopie 2/3/4/5 i wcześniejszy stan; nie zmieniono wersji IndexedDB.

`features/product/Product.tsx` prezentuje podsumowanie i ustawienia pomiaru. `analytics.ts` jest warstwą dozwolonych nazw zdarzeń. Opcjonalne liczniki lokalne w localStorage nie są częścią kopii treningów; wyłączenie zgody usuwa pomiar. Nie ma aktywnego transportu sieciowego ani identyfikatora użytkownika. Zdarzenia zmian stanu emitowane są po zatwierdzonej transakcji, z pominięciem importów. [Progi, prywatność i granice KPI](PRODUCT_REFINEMENT.md).

## Formularz kontaktowy

`features/feedback/Feedback.tsx` wysyła wyłącznie świadomie wpisaną treść do małego endpointu PHP `/api/feedback.php`, umieszczonego razem z buildem na istniejącym hostingu. Wyniki treningów nadal pozostają lokalne; endpoint nie ma dostępu do IndexedDB. Wymaga PHP 7.3+ i poczty hostingu. Szczegóły CSRF, walidacji, limitów i zakresu danych: [FEEDBACK.md](FEEDBACK.md). API jest wyłączone z fallbacku nawigacji PWA i nie znajduje się w precache.

## System mentalny i profil — aktualny kierunek produktu

Główni odbiorcy: dorośli gracze rekreacyjni, klubowi i turniejowi na każdym poziomie. Juniorzy korzystają z tych samych funkcji. Nie ma blokad wieku. Grafit, złoto i neutralna typografia tworzą wspólny sportowy interfejs.

`features/mental/catalog.ts` definiuje pięć kompetencji, trzy poziomy, 25 autorskich lekcji, rutynę Plan → Oddech → Wykonanie → Reset i wskazówki do rzutów. `Lesson` otrzymuje `competency` i `level`. `features/mental/Lessons.tsx` grupuje lekcje i liczy unikalne znane zaliczenia. Filtry lekcji zapisują się w URL; `Filters.tsx` jest współdzielony z ćwiczeniami. Poziomy nie wymagają ukończenia wcześniejszych etapów.

`features/development/practices.ts` tworzy 25 praktycznych modułów z tego samego katalogu. Każda lekcja ma jeden moduł i link do niego. Dziesięć istniejących identyfikatorów modułów i liczby kroków 4/5 pozostają stabilne dla szkiców i historii. Dotychczasowe dziesięć identyfikatorów lekcji zachowuje zaliczenia; nowe lekcje pozostają niezaliczone. Wcześniej zdobyte osiągnięcia są trwałe. Nowe pełne zaliczenie programu wymaga 25 znanych identyfikatorów.

`Player.age` jest opcjonalny, `Player.level` ma cztery wartości. Brak wieku nie jest zastępowany domyślną wartością. Role i ręka pozostają kompatybilne; zapis nowego poziomu aktualizuje pole `audience`. Starsze profile bez `level` działają jak wcześniej. Identyfikatory `junior` w dawnych wariantach oznaczają krótki plan, nie weryfikację wieku.

`features/situations/throw-scenarios.ts` definiuje siedem sytuacji dla wspólnego silnika. `PlannedThrow.situationId` stabilizuje scenariusz po odświeżeniu. `Session.situationChoice` przechowuje decyzję bieżącej próby przed wykonaniem, po zapisie rzutu jest czyszczona. `Attempt.decisionReview` zapisuje opcjonalną ocenę planu niezależnie od punktacji. Starsze szkice bez identyfikatora korzystają ze scenariusza według indeksu. Nie powstaje silnik taktyczny. Istniejący symulator meczu i plansze pozostają osobnymi modułami.

W Active wskazówka zależy od rodzaju rzutu, presji i ostatniego wyniku (w lobie od pierwszego lądowania). Ocena decyzji jest dostępna po wykonaniu, również w podsumowaniu i historii. Każda zmiana czeka na transakcję IndexedDB.

`dashboardEvidence` korzysta z istniejącego grupowania porównywalnych warunków. Ostatnie wyniki sortuje według zakończenia sesji; mocniejsze/słabsze obszary wymagają 20 prób z dwóch sesji, trend 5 + 5 sesji. Nie pokazujemy przykładowych procentów jako danych użytkownika. Testy kontrolne i wyzwania są oddzielone od zwykłych treningów.

Eksport JSON 6 waliduje opcjonalny wiek, poziom, katalog lekcji, sytuacje, bieżącą decyzję i ocenę. Import czyta wersje 2–6 i raw. Wersja IndexedDB nadal 1; opcjonalne pola nie wymagają niszczącej migracji. Brak synchronizacji i nowego backendu. Dokumenty P0/P1/P2 opisują wcześniejsze etapy; aktualny kontrakt mentalny i profilu określa ta sekcja oraz PRD.

## Quality Engineering Showcase

`playwright.config.ts` zachowuje regresję modułów; `playwright.showcase.config.ts` wybiera oznaczone scenariusze `@showcase`. Pełne przepływy działają w Chromium/Pixel 7, jeden smoke także w desktop Chromium, Firefox i WebKit/iPhone 13. `tests/support` zawiera małe helpery danych, persystencji i sesji, bez rozbudowanych Page Objects. `vitest.showcase.config.ts` wybiera trzy integracje i pięć kontraktów agentowych. Podstawowy Vitest nadal obejmuje wcześniejsze unit tests.

`tests/visual` zawiera dwa rzeczywiste porównania PNG, z kontrolowanym czasem i viewport. Baselines macOS nie są używane w Linux; osobny job macOS wymaga weryfikacji wzorców w docelowym środowisku CI. `tests/resilience` wstrzymuje potwierdzenie rzeczywistej transakcji IndexedDB do jawnego sygnału, bez sleeps. `tests/agentic/generated` to wynik generatora opartego na syntetycznym planie i review; `qa:generate:check` sprawdza spójność bez mutacji.

Odczyt IndexedDB jest walidowany przez istniejącą walidację stanu/kopii przed przekazaniem do React. Uszkodzony zapis daje czytelny alert i pozostaje w bazie, bez automatycznego usunięcia. To poprawka rzeczywistego ryzyka ujawnionego w analizie QA, a nie zmiana architektury produktu.

## Usprawnienia przepływów — 14.10.2026

`features/coaching/session.ts` współdzieli reguły cofania między Active i niezapisanym podsumowaniem. Cofnięcie przelicza wynik, czyści decyzję i odtwarza właściwy blok generatora; po commit interfejs czyści robocze wybory lądowania i kierunku. Testy, próby mistrzowskie, wyzwania, jedna próba i końcowy sprawdzian zachowują ograniczenia. Spóźnione zakończenie zapisu nie zmienia ekranu po opuszczeniu sesji lub podsumowania.

`features/coaching/repeat.ts` odtwarza ostatni pełny zwykły trening (dla trybu czasowego ostatni zapisany), zachowując plan i ustawienia. Nowa sesja ma nowe ID, puste wyniki i samooceny, a etapy i zegar startują od przygotowania. Istniejący szkic ma pierwszeństwo.

`features/mental/cue.ts` przypina oczekujący identyfikator lekcji do nowego zwykłego szkicu i zużywa go w tej samej transakcji App.save. PracticeSession.cueLessonId utrwala wybór przed ukończeniem praktyki, CoachingState.pendingMentalCueLessonId przenosi go do kolejnego treningu, a Session.mentalCueLessonId zachowuje fokus sesji. Import pomija transformację startu. Wznowienie istniejącego szkicu, testy i wyzwania nie zużywają oczekującej wskazówki. Identyfikatory są sprawdzane względem istniejącego katalogu lekcji.

Adaptacja może zaproponować łatwiejszą serię na podstawie co najmniej dwóch dystansów. Każdy wymaga trzech ostatnich pełnych serii z 30 dni, po minimum 10 prób i poniżej 35% skuteczności. Porównywalne warunki pozostają rozdzielone. Propozycja przechowuje źródłową sesję, dzięki czemu akceptacja nie zmienia omyłkowo kategorii aktualnej głównej rekomendacji. Zwykły start nie przyjmuje propozycji automatycznie.

`successfulAttempt` w domenie oznacza trafienie pierwszego lądowania lobu albo trafienie pozostałego rzutu. Historia, Home, wykres Postępu i evidence używają tego samego kryterium; punkty pozostają osobną metryką. Postęp rozdziela rodzaj rzutu i dystans, a wnioski o zmianie korzystają z porównywalnych warunków. Statystyka rutyny obejmuje tylko jawne odpowiedzi; moduły mentalne i reset podczas serii liczone są osobno. Bez zmian schematu danych i eksportu JSON 6. [Audyt, pomiary i weryfikacja](PRODUCT_FLOW_AUDIT.md).

GitHub Actions uruchamia PR gate i osobno pełne przepływy po push/manualnie. Konfiguracja jest gotowa, wykonanie w GitHub wymaga repozytorium z tymi plikami. Zasady i ograniczenia: TEST_STRATEGY.md, AGENTIC_TESTING.md, FLAKINESS.md.
