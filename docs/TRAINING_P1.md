# Trener osobisty — P1

Wdrożono 9 elementów priorytetu P1. Punktem odniesienia są własne wyniki, Personal Best i porównywalne próby. Nie ma rankingu użytkowników.

## Mój rozwój

`/coach/development` pokazuje sześć niezależnych obszarów. Puenta, strzał i lob wymagają dwóch pełnych, porównywalnych testów wersji 1, razem 40 rzutów. Puenta wykorzystuje test precyzji w kole; lob pierwsze lądowanie. Grupowanie uwzględnia ćwiczenie, wersję, poziom, cel, granicę i teren. Poziom 1–10 to `min(10, 1 + floor(celność / 10))`. Brak próbek oznacza brak oceny, a nie fikcyjny poziom. Jest to autorska skala aplikacji, nie oficjalna klasyfikacja sportowa.

Taktyka opisuje wiedzę: poprawne odpowiedzi quizu zasad i przeanalizowane sytuacje, maksymalnie poziom 6. Nie przypisuje jednej poprawnej decyzji każdej planszy. Mental opisuje używanie rutyny w minimum pięciu pełnych sesjach z jawną samooceną; nie ocenia odporności psychicznej. Regularność wynika z ukończonych tygodni. Każda karta podaje podstawę swojej oceny.

XP jest osobnym poziomem aktywności. Progi rosną o 100, 200, 300 itd. XP nie zmienia ocen umiejętności. Nowa pełna seria minimum 6 rzutów daje 35 XP, test 50; możliwe bonusy: Personal Best 15, powrót do słabości 10, misja 10. Limit wynosi dwie serie dziennie. Mental i ciało: po 20, raz dziennie na rodzaj. Nowa lekcja: 10, quiz z minimum trzema poprawnymi odpowiedziami: 15, po jednym dziennie. Zrealizowany tydzień daje 30, wyzwanie tygodnia 25.

Dziennik identyfikatorów nagród zabezpiecza przed ponownym naliczaniem po odświeżeniu. Zmiana wyzwania nie daje drugiej nagrody w tym samym tygodniu. Import nie nalicza XP za stare sesje. Usunięcie historii technicznej nie usuwa zdobytych XP i oznaczeń. Kopia zapasowa przenosi dziennik.

## Tydzień i mikrocele

`/coach/week`: cel 1–7 pełnych sesji z minimum 6 rzutami, Weekly Streak, Perfect Week oraz trwałe oznaczenia serii 2/4/8/12 tygodni. Bieżący nieukończony tydzień nie przerywa wcześniejszej serii. Wcześniejsze cele tygodni pozostają zapisane. Moduły mentalne i fizyczne mają osobne historie; nie zastępują sesji rzutowych w tym liczniku.

Opcjonalne wyzwanie: 100 celnych puent, 50 strzałów z 8 m (junior 7 m), trzy dystanse albo trzy pełne sesje z rutyną. Postęp wynika wyłącznie z zapisanych prób w bieżącym tygodniu.

`/coach/goals`: cel poprawy słabszego wariantu o 7 punktów procentowych albo rutyna w trzech pełnych sesjach. Cel celności wymaga nowych 20 prób z co najmniej dwóch pełnych sesji po utworzeniu celu, przy zachowaniu warunków. Przycisk odtwarza plan i ustawienia sesji źródłowej. Przy usunięciu źródła warunki pozostają opisane, ale nie odtwarzamy brakujących danych. Ocena celu odpowiada aktualnej zachowanej historii.

## Próby mistrzowskie

`/coach/mastery` obejmuje puentę podstawową, strzał podstawowy, precyzję w kole i lob. Odblokowanie wymaga dwóch pełnych zwykłych serii w tych samych warunkach, łącznie minimum 20 prób, z minimum 60% skuteczności każdej. Mastery: 8/10 na stałym dystansie. Legendary po Mastery: 8/10 na losowych dystansach 6–10 m (junior 6–7), bez dwóch sąsiednich powtórzeń dystansu. W lobie liczy się pierwsze lądowanie.

Plan losuje się raz i zachowuje po odświeżeniu. Nie ma cofania rzutów. Niepełna lub nieudana próba nie odblokowuje oznaczenia; pełny wynik należy zapisać. Zaliczenie zachowuje się po usunięciu historii. Testy, zwykłe treningi i poziomy Mastery/Legendary mają osobne warunki porównania Personal Best; prób nie miesza się z wykresami zwykłego treningu.

## Mental i ciało

Zachowano wcześniejsze lekcje. `/coach/practice/mental` dodaje 10 modułów około 2 minut: rutyna, reset, presja, wizualizacja, napięcie, koncentracja, pewność, kolejna kula, mecz i rosnące napięcie. Napięcie 1–5 przed i po jest subiektywną samooceną; niższy wynik nie jest warunkiem zaliczenia.

`/coach/practice/physical` dodaje mobilność, stabilizację, nogi, bark/ramię i koordynację. Każdy moduł ma kroki dla juniora i dorosłego oraz wariant 5/10 minut. Dziesięć minut obejmuje powtórzenie sekwencji po odpoczynku. Czasy są orientacyjne, nie mierzone stoperem. Instrukcje podają spokojne powtórzenia i łatwiejsze warianty, np. podpór przy ścianie. Junior ćwiczy z dorosłym; ból oznacza zakończenie ćwiczenia. Moduły nie są leczeniem kontuzji.

Ogólne materiały referencyjne do łagodnych ćwiczeń z podparciem i dostosowania aktywności: [NHS — Strength exercises](https://www.nhs.uk/live-well/exercise/strength-exercises/) i [CDC — What counts for children and adolescents](https://www.cdc.gov/physical-activity-basics/adding-children-adolescents/what-counts.html). Katalog jest autorskim dodatkiem do treningu pétanque; te źródła nie stanowią walidacji całego programu.

Każdy krok czeka na zapis. Przerwa pozostawia szkic; wznowienie działa także offline. Jawne przerwanie wymaga potwierdzenia i nie daje XP. Zakończenie dopisuje własną historię modułu.

## Mam zawody

`/coach/competition`: data oraz skróty 1/3/7/14 dni. W ostatnich 14 dniach Dzisiaj proponuje zapisany plan przygotowania: 30 rzutów do 14 dni, 20 do 7, 12 do 3 i 6 w ostatnim dniu. Plan 10/20/30 minut obejmuje rozgrzewkę, znany dystans, rutynę i mental reset. Preferuje mocny, wcześniej ćwiczony dystans; bez danych proponuje 6 m. Nie dodaje nowego obciążenia fizycznego. Po terminie wraca zwykła rekomendacja. Istniejący szkic ma pierwszeństwo i nie jest nadpisywany.

## Dane i zakres

`src/features/development` zawiera modele, katalog modułów, ekrany i typy. Opcjonalne pola `State.coaching`, `Player.audience`, `Session.mastery` i źródło oznaczenia nie zmieniają wersji IndexedDB. Eksport JSON ma wersję 3; import nadal obsługuje wersję 2 i starszy surowy stan, z walidacją i atomową kopią sprzed importu. Wariant profilu: junior, początkujący, zawodnik.

Podstawowe ścieżki działają offline po buforowaniu aplikacji. Synchronizacja, konta, publikacja na hostingu i priorytet P2 pozostają poza tym wdrożeniem.
