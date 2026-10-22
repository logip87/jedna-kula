# Jedna Kula: od grania do trenowania

Główna grupa: ambitni gracze klubowi, juniorzy, początkujący i średniozaawansowani, którzy chcą trenować regularnie i potrzebują struktury. Zaawansowany zawodnik może korzystać z aplikacji jako dodatkowego narzędzia.

Persona do decyzji UX: gracz klubowy, gra regularnie od 1–5 lat, zna zasady, startuje lub zaczyna startować w turniejach, chce być wyraźnie lepszy, ale nie ma uporządkowanego planu treningowego ani indywidualnego trenera.

Komunikat: „Jedna Kula pomaga graczom pétanque wejść poziom wyżej: uporządkować trening, zauważyć słabe strony i wybrać kolejny krok”. Ambicja sportowa nie jest obietnicą miejsca w rankingu.

## Audyt i decyzje

- Dzisiaj miało użyteczny cykl trening → wynik → kolejny krok, ale bez informacji, komu służy. Zachowujemy go jako podstawę produktu, z krótkim wprowadzeniem dla nowych użytkowników.
- Pierwsze kroki mówiły „Nie potrzebujesz doświadczenia” i „Każdy kiedyś zaczynał”. To zawężało produkt do debiutantów. Wprowadzenie obejmuje teraz świadomy trening; instrukcja podstaw pozostaje dostępna.
- Profil zbierał poziom, rolę i rękę, ale nie cel. Dodano dwa opcjonalne pytania, także w szybkim starcie bez imienia i rankingu. Pominięcie nie blokuje treningu. Cel i sposób gry można zmienić w profilu.
- Zbyt ogólne opisy („Jeden pewny strzał”, „z pełną kontrolą”) zastąpiono informacją, co ćwiczyć i mierzyć.
- Propozycja początkowa uwzględnia wybór strzału. Inne cele otrzymują odpowiedni kolejny krok. Po uzyskaniu próbki obowiązują istniejące porównania; cel nie unieważnia danych i nie jest oceną umiejętności.
- Dla profilu athlete ekran główny eksponował testy i presję. Teraz dla wszystkich priorytetem są regularność, wyniki, rutyna i przygotowanie do zawodów. Testy, próby mistrzowskie, presja i wyzwanie własnego wyniku pozostają w rozwijanej sekcji. Sprawdziany rozdziałów w Przygodzie są opcjonalnym dodatkiem.
- Obecna Przygoda ma już warianty „Krótka seria” i „Standardowa seria”, a nie trzy osobne ścieżki Junior/Początkujący/Zawodnik. Doprecyzowano ich zastosowanie. Identyfikatory junior, beginner i athlete oraz klucze misji pozostają bez zmian; nie resetujemy postępu.
- Tryb meczowy i plansze już pokazują korzyść, ryzyko i alternatywę. Zachowano scenariusze, doprecyzowując edukacyjny cel analizy, liczenia kul i wyniku. Nie rozbudowujemy symulatora dla elity.
- W Więcej dodano rolę techniczną Pawła i miejsce na potwierdzone konsultacje. Brak dostarczonych nazwisk i zakresów konsultacji oznacza brak przypisanych recenzji; nie sugerujemy, że materiały zostały już zatwierdzone przez ekspertów.
- Metadane strony, opis instalowanej PWA i opis aplikacji używają tego samego pozycjonowania.

## Dane i przyszłe decyzje

Nowe opcjonalne pola player.playingStyle i player.trainingGoal zachowują zgodność ze starszymi profilami i kopiami. Walidator importu akceptuje wyłącznie znane wartości. Szybki start zachowuje istniejący profil, historię i szkic, a ekran profilu zachowuje nowe pola podczas edycji imienia.

Najpierw pytamy: czy funkcja pomaga graczowi wybrać zadanie, utrzymać regularność lub zrozumieć wynik? Funkcje wymagające rozbudowanego własnego systemu treningowego pozostają dodatkami. Nie dodajemy rankingów krajowych, gwarancji TOP 200 ani autorytetu niepotwierdzonych konsultantów. Przyszły podpis konsultanta powinien wskazywać nazwisko, konkretny zakres treści, rolę, datę i rzeczywisty wkład.
