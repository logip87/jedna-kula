# Trener osobisty — P2

## Tryb meczowy

`/coach/match` prowadzi trening decyzji w singlu: maksymalnie sześć rozgrywek albo do osiągnięcia 13 punktów. Można zacząć od wyniku 0–12 dla każdej strony. Sześć różnych plansz losuje się raz; kolejność, decyzja i punkty zapisują się lokalnie.

Każda sytuacja pokazuje wynik, liczbę pozostałych kul, dystans świnki, teren, pozycje kul i jakościowy opis ryzyka strzału. Diagram jest poglądowy, bez skali. Dla sytuacji bez własnych kul pytanie dotyczy obserwacji, nie niedozwolonego kolejnego rzutu.

Po wyborze zagrania pojawia się uzasadnienie, korzyść, ryzyko i alternatywa. Pierwszy wybór jest zapisywany i pozostaje po odświeżeniu. Użytkownik wpisuje końcowy wynik rozgrywki po ćwiczeniu na boisku lub własnej symulacji: 0–3 dla jednej strony, albo zero dla obu przy anulowanej rozgrywce. Aplikacja nie symuluje fizyki, nie przewiduje zwycięstwa i nie ocenia tych decyzji jako zawsze dobrych lub złych. Wynik meczowy nie zmienia celności ani poziomu taktyki.

Ukończony zestaw zachowuje wynik i wszystkie decyzje w osobnej historii. Przerwa zachowuje szkic; jego usunięcie wymaga potwierdzenia. Wszystko działa offline po buforowaniu PWA.

## Plansze taktyczne

Biblioteka `/adventure/tactics` ma 12 plansz: zachowano cztery wcześniejsze i dodano dwie kule w osi, świnkę przy linii, dwie próby bez odpowiedzi rywala, zasłonięte wejście, piłkę meczową, własną przeszkodę, brak własnych kul i teren odprowadzający kulę. Nowe plansze jawnie podają korzyści, ryzyko i alternatywę; wcześniejsze zachowują swoje opisowe uzasadnienia z ryzykiem. Diagram i analiza są współdzielone z trybem meczowym.

## Boss Tests juniora

`/coach/boss` kończy rozdziały ścieżki juniora. Każde pięć ukończonych misji odblokowuje sprawdzian, więc ścieżka 10/15/20 misji udostępnia odpowiednio 2/3/4 bossów. Zmiana ścieżki nie nadpisuje wcześniejszych zaliczeń.

Rozdziały: puenta w kole na 6 m, strzał na 7 m, pierwsze lądowanie lobu na 6 m oraz pięć puent na 6 m + pięć strzałów na 7 m. Każdy boss ma 10 prób i cel 6 trafień, średni poziom, drobny żwir, średnicę celu 75 cm, granicę 40 cm. Koło 75 cm dotyczy testu puenty. Cel strzału pozostaje kulą, w lobie liczy się pierwsze lądowanie w kole 50 cm, a w finale puenta do 60 cm i usunięcie celu strzałem. Plan nie zmienia się po odświeżeniu; nie ma cofania. Niepełna lub nieudana seria nie daje oznaczenia. Odznaka powstaje po zapisaniu wyniku i pozostaje po usunięciu historii technicznej.

Boss jest dodatkowym sprawdzianem; nie zmienia wcześniejszych reguł odblokowania misji i nie karze za przerwę. To autorski test treningowy, nie oficjalna kategoria zawodów.

## Wyzwania własne

`/coach/extras` dodaje:

- Jedną kulę dnia: jeden rzut w koło o średnicy 50 cm na 8 m, junior 7 m. Bez cofania, bez XP. Zapis próby pozostaje w osobnym rejestrze także po usunięciu sesji. Pominięty dzień nie przerywa żadnej serii.
- Drabinkę dystansów: 10 puent w kole o średnicy 75 cm, dwa przejścia 6–10 m (junior pięć przejść 6–7), cel 7 trafień.
- Presję 2/3: trzy serie po trzy strzały, na 8 m (junior 7). Zaliczenie wymaga minimum dwóch trafień w każdej serii, a nie tylko sześciu w całym treningu.

Wyzwania korzystają z dotychczasowego ekranu rzutów, zachowują szkic i blokują cofanie. Nie nadpisują otwartej sesji. Zwykłe statystyki, rekomendacje i Mastery nie mieszają nowych wyzwań z regularnym treningiem. Personal Best porównuje tylko taki sam rodzaj i plan wyzwania.

## Zapis i zakres

`Session.challenge` opisuje stałe warunki wyzwania. `State.situations` przechowuje mecz, jego historię i rejestr prób dnia. Oznaczenia korzystają z istniejącej listy osiągnięć. Nie zmieniono schematu IndexedDB. Kopia JSON ma wersję 4, a import nadal czyta wersje 2/3 oraz wcześniejszy surowy stan. Walidacja sprawdza punkty, kolejność rozgrywek, zakończenie meczu i warunki wyzwań.

Nie dodano rankingów użytkowników. Opcjonalne funkcje społecznościowe pozostawiono poza wdrożeniem; zachowany dawny trening dwóch osób na jednym telefonie nie jest rankingiem.
