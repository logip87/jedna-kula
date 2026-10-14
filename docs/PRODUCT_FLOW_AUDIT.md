# Audyt przepływów produktu — 14 października 2026

## Zakres i metoda

Audyt istniejącej PWA, bez ponownego audytu kolorów, ikon, spacingu, breakpoints i bottom navigation. Przeczytano PRD, README, ARCHITECTURE, TEST_STRATEGY, dokumentację etapów produktu i kod treningów, rekomendacji, historii, postępu, mentalu i persistence. Findings zapisano **przed zmianami kodu aplikacji**.

Aplikację uruchomiono lokalnie przez Vite. Rzeczywiste interakcje w przeglądarce: pierwszy start bez profilu, rekomendacja → pełne 6 rzutów puenty → zapis → wynik → Postęp; pełny lob z oddzielnym lądowaniem i pozycją końcową; pełny strzał z trafieniami i dotknięciami; pełny trening mieszany z rolą middle i decyzjami sytuacyjnymi. Izolowany port 5187 oddziela sztuczną historię od istniejącego szkicu na 5173. Dodatkowe reprodukcje przeglądarkowe obejmują opóźniony commit, Undo i ostatni rzut. Kontrolowane historie A–J wykonano na rzeczywistych funkcjach silnika. Dalsza weryfikacja po zmianach jest opisana niżej.

## Findings i wybór zmian

| Finding                                                                                                                                           | User impact                                                                                  | Severity | Effort | Proposed change                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| F1. Jeden słaby wynik gwałtownie zmienia rekomendację: 3×90%/6 m + 3×70%/7 m → 7 m; dodatkowe 0%/6 m → 6 m.                                       | Zawodnik porzuca właściwy priorytet po pojedynczym nieudanym dniu.                           | P2       | Medium | Uodpornić ranking na pojedynczą serię; zachować prawdziwe procenty w opisie i reagować na powtarzający się spadek.                              |
| F2. Globalne ostatnie 12 sesji usuwa historię nietrenowanej kategorii. Dwie serie strzału + 10 puenty dają strzał, +1 puenta usuwa go z analizy.  | Aplikacja zapomina o zaniedbanej umiejętności i utrwala trenowanie najmocniejszej kategorii. | P2       | Medium | Ograniczać próbkę osobno dla porównywalnych warunków; jasno uzasadniać powrót po przerwie.                                                      |
| F3. Przy trendzie 30% → 90% rekomendacja opiera cel na średniej 60% i proponuje 67%.                                                              | Cel jest już poniżej aktualnego poziomu, a opis nie pasuje do poprawy.                       | P2       | Low    | Przy wiarygodnym trendzie brać pod uwagę aktualną próbkę, pokazać krótkie uzasadnienie poprawy.                                                 |
| F4. Lob w trendzie i na Home bywa oceniany po pozycji końcowej, choć podsumowanie i rekomendacja oceniają pierwsze lądowanie.                     | Ten sam trening daje sprzeczne wnioski o rozwoju techniki lobu.                              | P1       | Low    | Wspólna reguła skuteczności: landingHit dla lobu, hit dla pozostałych; cutoff dat także dla trendu.                                             |
| F5. Po ostatnim rzucie znika Undo; powrót do Active też nie pozwala poprawić pomyłki. Częściowe podsumowanie nie ma bezpośredniej kontynuacji.    | Błędny ostatni wpis zostaje w wyniku albo wymaga porzucenia treningu.                        | P1       | Medium | Poprawienie ostatniego rzutu w zwykłym niezapisanym podsumowaniu i bezpośredni powrót do niepełnej serii; zachować reguły testów i wyzwań.      |
| F6. Undo zachowuje lokalnie wybrane lądowanie/kierunki następnej próby.                                                                           | Poprawiany lob może dostać ocenę należącą do innego rzutu.                                   | P1       | Low    | Czyścić robocze wybory po udanym cofnięciu, pozostawić je przy błędzie zapisu.                                                                  |
| F7. Zakończenie opóźnionego zapisu ostatniego rzutu przejmuje nawigację z Postępu na podsumowanie.                                                | Użytkownik trafia na inny ekran niż świadomie wybrał.                                        | P2       | Low    | Przechodzić automatycznie tylko wtedy, gdy użytkownik nadal jest w tej samej aktywnej sesji; zapis danych zawsze kończyć.                       |
| F8. Postęp nie wykorzystuje istniejących wniosków i rekomendacji, a dystanse łączą puentę, strzał i lob.                                          | Nie wiadomo, czy poprawia się konkretna umiejętność i co trenować dalej.                     | P2       | Medium | Reużyć istniejące evidence, rozdzielić rodzaj rzutu i dystans, poprowadzić do następnego treningu.                                              |
| F9. Historia i ostatnie wyniki eksponują % punktów, gdy podsumowanie pokazuje % trafień; brak dystansu i porównania, kolejność zależy od tablicy. | 6/6 trafień wygląda jak 67%; użytkownik musi otwierać wpisy i sam szukać kontekstu.          | P2       | Medium | Spójna skuteczność, dystanse i porównanie tylko przy dostatecznej porównywalnej próbce, sortowanie według zakończenia; punkty pozostają wtórne. |
| F10. Brak samooceny rutyny liczony jest jako niestosowanie rutyny, a szczegóły pokazują „nie”.                                                    | Brak danych tworzy fałszywy wniosek mentalny.                                                | P1       | Low    | Liczyć wyłącznie jawne odpowiedzi i pokazywać wielkość próbki/brak odpowiedzi.                                                                  |
| F11. Z Home nie można jednym krokiem powtórzyć ostatniego zwykłego treningu z jego ustawieniami.                                                  | Regularny gracz ponownie szuka ćwiczenia i ustawia warunki.                                  | P2       | Medium | Mała akcja „Powtórz ostatni trening”, wykorzystująca istniejący plan; szkic ma pierwszeństwo.                                                   |
| F12. Podsumowanie nazywa obszar „Do poprawy” nawet przy remisie 100% puenty i 100% strzału.                                                       | Aplikacja sugeruje słabość bez poparcia wynikiem.                                            | P2       | Low    | Nie wyróżniać słabszego obszaru przy jednakowej skuteczności.                                                                                   |

Wybrano F1–F12: istniejące mechanizmy i małe/średnie zmiany bez nowego modułu, backendu ani migracji danych. Dla logiki dodajemy testy jednostkowe/integracyjne, a dla interakcji i transakcji tylko potrzebne testy przeglądarkowe.

## Pomiar interakcji przed zmianami

- Home → rekomendowany trening → gotowość pierwszego rzutu: **1 kliknięcie, 0 wymaganych decyzji konfiguracyjnych**. Zachować.
- Home → Trening → wybrane ćwiczenie → Zaczynam: **3 kliknięcia**, ustawienia mają wartości domyślne. Zachować możliwość konfiguracji.
- Powtórzenie ostatniego ćwiczenia: brak bezpośredniej akcji; co najmniej powyższe 3 kliknięcia i ewentualne odtwarzanie ustawień.
- Puenta/strzał: **1 dotknięcie na zapis wyniku**; opcjonalne kierunki nie blokują. Zachować.
- Lob: **2 dotknięcia** (pierwsze lądowanie + pozycja końcowa). Obie informacje są potrzebne; nie automatyzować drugiej oceny.
- Sytuacja: decyzja + wynik; ocena decyzji jest opcjonalna. To rozdzielenie jest merytorycznie użyteczne.
- Refresh po rzucie: wynik i indeks zachowane; szkic nie jest liczony jako zapisany trening.

## Kontrolowane historie A–J — stan wyjściowy

- A: bez sesji — spokojna puenta 6 m, jawnie brak wystarczających danych.
- B: 1 sesja — ten sam bezpieczny wariant, bez wymyślonej analizy.
- C: 3 serie po 6 rzutów — 18 prób, więc nadal brak progu 20. Próg działa poprawnie; copy „Zacznij” jest mało osobiste.
- D: 12 sesji — deterministyczny wynik, rozdzielanie warunków i testów działa.
- E: 6 m 85%, 7 m 72%, 8 m 48%, 9 m brak — **8 m**, osiągalny obszar do poprawy.
- F: 90/88/82/61% na 6/7/8/9 m — **9 m**, sensowna progresja.
- G: pojedyncze 0% po dobrych seriach — ujawnia F1.
- H: starszy dystans/kategoria wypada z globalnego okna — F2.
- I: 5×30%, następnie 5×90% — trend jest dostępny, ale cel wynosi 67%; F3. Dla lobu dodatkowo F4.
- J: wyłącznie mocna puenta — brak historii innych kategorii nie tworzy fikcyjnych danych; adaptacja po trzech seriach działa, lecz zaniedbane wcześniej trenowane obszary znikają (F2).

## Mental, empty states i ergonomia

Lekcje są krótkie i autorskie, każda ma konkretne „Spróbuj dziś” oraz link do odpowiadającego ćwiczenia praktycznego. Aktywny trening podaje krótkie wskazówki dopasowane do rzutu i poprzedniego wyniku. Istniejąca krótka rutyna przed serią jest wystarczająca; nie dodawać kolejnej biblioteki. W Postępie lepiej prowadzić do praktyki i rzetelnie oznaczyć brak samoocen (F10).

Pusta historia ma CTA do treningu. Home ma główny start mimo braku danych. Pusty Postęp wymaga mocniejszego prowadzenia do pierwszej sesji i ograniczenia pozornych zer (F8/F10). Brak profilu nie blokuje ćwiczeń. Zapisy są transakcyjne, blokada chroni równoczesne dotknięcia, szkic ma pierwszeństwo przed nowym startem. Nie dodawać ostrzeżeń przy każdym przejściu między ekranami, skoro dane są już utrwalane.

## Deferred — decyzje produktowe

- Automatyczne proponowanie nigdy nietrenowanej kategorii i tygodniowy podział ról: wymaga wyboru pomiędzy specjalizacją a wszechstronnością. Nie zgadywać preferencji tylko z braku danych.
- Zmiana protokołów testów, wyzwań i „jednej próby” w celu dopuszczenia cofania: pozostawić świadome ograniczenia.
- Synchronizacja między urządzeniami, konta, przypomnienia i rozbudowany plan sezonu: duży zakres poza tym audytem.
- Personalizacja copy i skrócenie wszystkich instrukcji awansu: niższy priorytet niż błędy danych; bez kolejnego redesignu.

## Weryfikacja po implementacji

Wdrożono F1–F12. Nie zmieniono CSS, protokołów testów i wyzwań, schematu IndexedDB ani formatu eksportu.

- `npm run lint`: poprawny.
- `npm run typecheck`: poprawny.
- `npm test`: **147/147**, 16 plików; obejmuje unit i integration.
- `npm run test:e2e`: **78/78**, produkcyjny build, bez retry.
- Dodatkowe testy produkcyjne: **16/16** — opóźnione i błędne zapisy, wielokrotne kliknięcia, opuszczenie ekranu podczas zapisu ostatniego rzutu i całego wyniku, offline, ponowne otwarcie strony, dostępność i istniejące zabezpieczenia danych. Smoke przechodzi w Chromium, Firefox i WebKit.
- `npm run build`: poprawny; Vite nadal sygnalizuje duży wspólny bundle (>500 kB), co wymaga osobnego zadania optymalizacji, bez wpływu na wynik tej regresji.
- `git diff --check`: poprawny.

Pierwszy przebieg E2E wykonano jednocześnie z osobnym buildem, co dało trzy puste strony podczas wymiany plików. Po rozdzieleniu tych operacji cały zestaw 78/78 przeszedł bez zmiany asercji ani oczekiwanego zachowania.

## Ponowny rzeczywisty loop produktu

Do lokalnej przeglądarki przez istniejący import wczytano zwalidowaną, syntetyczną historię **18 sesji / 360 prób**, obejmującą puentę 6/7/8 m, strzał 7/8 m, lob 8 m i przerwę we wrześniu. Home zaproponował puentę 8 m z uzasadnieniem 50% z 60 prób. Uruchomienie: **1 kliknięcie**.

Wykonano 20 rzutów. Reload po dziesiątym zachował dokładnie 10 wyników i rzut 11/20. Po ukończeniu poprawiono ostatnie pudło z podsumowania: wrócił rzut 20/20, po trafieniu wynik zmienił się z 14/20 na **15/20 = 75%**, porównanie z wcześniejszymi seriami z +20 na **+25 pp**. Po zapisie ten sam wynik był w szczegółach, na wykresie i w historii wraz z dystansem 8 m. Postęp rozdzielał puentę, strzał i lob; powrót na Home dawał nadal stabilną rekomendację 8 m z aktualnymi danymi **56% / 80 prób / 4 sesje**. Kolejny trening nie był uzależniony od profilu ani czytania lekcji.

Powtórzenie ostatniego pełnego zwykłego treningu zajmuje teraz **1 kliknięcie z Home**, przy zachowaniu ustawień i bez nadpisania szkicu. Jedno dotknięcie na zwykły wynik i dwa na lob pozostają bez zmian. Podsumowanie pozwala kontynuować niepełny trening oraz poprawić ostatni wpis zwykłej serii; chronione protokoły nie zyskują Undo.

Ręcznie sprawdzono też opcjonalny profil bez wieku, krótką lekcję „Reset po błędzie” i komplet pięciu kroków praktycznego modułu ze skutecznym zapisem. Nie kopiowano materiałów zewnętrznych.

Ograniczenie: zamknięcie/ponowne otwarcie strony i działanie offline sprawdzono w przeglądarkach. Nie wykonano instalacji ani wymuszonego zamknięcia procesu PWA na fizycznym iPhonie/Androidzie. Wdrożenie produkcyjne nie było częścią tej iteracji.

## Trzy najlepsze dalsze pomysły

1. Opcjonalny wybór celu „specjalizacja / wszechstronność”, wykorzystany w istniejących rekomendacjach do ostrożnego proponowania nigdy nietrenowanej kategorii.
2. Jedna zapisana wskazówka mentalna z praktyki do wykorzystania w następnej serii; małe połączenie istniejących modułów zamiast kolejnej biblioteki.
3. Przy słabych wynikach na wielu dystansach proponowanie istniejącego łatwiejszego wariantu z wyraźnym powodem i zachowaniem kontroli użytkownika; dobrać regułę na rzeczywistych historiach zamiast rozszerzać dashboard.

## Realizacja pomysłów 2 i 3 — 14.10.2026

Na prośbę użytkownika zaimplementowano dwa ostatnie pomysły:

- **Wskazówka mentalna do następnej serii.** Ostatni krok praktyki mentalnej ma opcjonalny wybór spośród frazy bieżącej lekcji, rutyny i resetu. Wybór zapisuje się od razu i przeżywa odświeżenie. Dopiero ukończenie modułu przygotowuje wskazówkę do kolejnego treningu. Ekran praktyki pokazuje wybraną frazę, pozwala ją usunąć i prowadzi do treningu technicznego. Utworzenie nowego zwykłego szkicu atomowo przypina wskazówkę i usuwa ją z oczekujących. Wznowienie szkicu nie zmienia jego wskazówki; testy i wyzwania zachowują ją na później. Active pokazuje krótki „Twój fokus” obok wskazówek zależnych od rzutu. Następna sesja nie dziedziczy jej automatycznie.
- **Łatwiejszy wariant przy trudnościach na kilku dystansach.** Potrzeba minimum dwóch dystansów tego samego ćwiczenia i rodzaju rzutu, w tych samych warunkach. Na każdym wymagane są trzy ostatnie pełne serie z ostatnich 30 dni, minimum 10 prób w każdej i skuteczność poniżej 35% w każdej serii. Dla lobu liczy się pierwsze lądowanie. Proponowany dystans jest o metr bliższy niż najbliższy z potwierdzonych trudnych dystansów, z dolną granicą 5 m. Przykład: strzał na 7 i 8 m → seria na 6 m. Propozycja pokazuje powód i próbkę; zwykły start nadal zachowuje rekomendację. Akceptacja odtwarza właściwe ćwiczenie, cel i teren, również gdy główna rekomendacja dotyczy innej kategorii.

Odrzucono łączenie różnych nawierzchni, celów i trudności, niepełnych serii, przyszłych wyników oraz testów. Pojedynczy słaby dzień nie wystarcza; poprawa w ostatniej serii wycofuje szerszą propozycję. Przy okazji naprawiono blokowanie dotychczasowej adaptacji przez przeplatane sesje na innych dystansach.

Nowe pola są opcjonalnymi identyfikatorami istniejących lekcji i są walidowane przy odczycie i imporcie. Zachowano IndexedDB 1 i format kopii JSON 6. Testy obejmują logikę, trwałość i kopie danych oraz dwa pełne przepływy przeglądarkowe.

Końcowa weryfikacja tej iteracji: **164/164 unit/integration**, **80/80 Playwright E2E**, **16/16 dodatkowych kontroli** (PWA, resilience, a11y, security oraz smoke Chromium/Firefox/WebKit), bez retry. ESLint, TypeScript, produkcyjny build i kontrola diff są poprawne. Nie wykonano publikacji na hostingu.
