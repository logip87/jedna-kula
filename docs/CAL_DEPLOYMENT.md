# Jedna kula — publikacja na cal.pl

## Skonfigurowane wysyłanie z tego komputera

- Strona: `https://jednakula.progtest.pl`
- FTPS z weryfikacją certyfikatu: `jednakula.progtest.pl`, port `21`, tryb pasywny, szyfrowane dane i logowanie.
- Konto: `jednakula@progtest.pl`, ograniczone do katalogu strony `public_html`. W połączeniu FTP ten katalog jest widoczny jako `/`.
- Hasło: Pęk kluczy macOS, usługa `jedna-kula-cal-ftps`. Nie znajduje się w projekcie.

`npm run deploy:setup` zapisuje hasło po sprawdzeniu logowania. `npm run deploy:check` sprawdza połączenie bez zmiany plików. `npm run deploy` buduje i publikuje aplikację. Uruchamiaj polecenia z katalogu projektu.

Publikacja najpierw zapisuje lokalną kopię zastępowanych plików w `release/backup-cal-*`, następnie wysyła zasoby, a na końcu konfigurację, `index.html` i `sw.js`. Pliki są przesyłane pod tymczasową nazwą i przemianowywane po zakończeniu transferu. Stare zasoby pozostają na serwerze. Katalog `release` jest wyłączony z Git. Przy zmianie katalogu konta FTP ponownie potwierdź jego przypisanie do domeny przed publikacją.

Paczka `jedna-kula-cal.zip` zawiera gotową aplikację. Node.js i baza danych nie są potrzebne na hostingu. Formularz zgłoszeń korzysta z PHP 7.3+ oraz poczty `mail()` udostępnianej przez hosting. Nie zawiera kodu źródłowego, haseł ani wyników treningów.

## Pierwsza publikacja

1. W panelu cal.pl przygotuj domenę lub subdomenę, np. `petanque.twojadomena.pl`. Paczka jest przygotowana dla głównego katalogu tego adresu, nie dla podkatalogu typu `/petanque/`.
2. Włącz dla tego adresu certyfikat SSL i wymuszanie HTTPS w panelu. HTTPS jest konieczny do instalacji PWA i działania offline. Ustawienia wykonuj po poprawnym skierowaniu domeny na hosting.
3. Otwórz menedżer plików albo połącz się przez FTP. Wybierz katalog przypisany tej konkretnej domenie/subdomenie (często `public_html`). Nie wybieraj katalogu istniejącej strony, którą chcesz zachować.
4. Wgraj ZIP i rozpakuj go w tym katalogu albo rozpakuj go na komputerze i wgraj wszystkie pliki. `index.html`, `.htaccess`, `sw.js`, `manifest.webmanifest` oraz foldery `assets` i `rule-sources` muszą znajdować się bezpośrednio w katalogu strony. Nie wgrywaj samego dodatkowego folderu `dist`.
5. Koniecznie wgraj ukryty plik `.htaccess`. Jeśli wybrany katalog już ma własny `.htaccess`, połącz konfiguracje zamiast nadpisywać istniejące ustawienia w ciemno. Dla nowej, pustej subdomeny użyj pliku z paczki.
6. Jeśli rozpakowywałeś paczkę na serwerze, usuń ZIP z publicznego katalogu po rozpakowaniu.

## Sprawdzenie po wgraniu

- Otwórz stronę przez `https://` i sprawdź ekran startowy.
- Otwórz bezpośrednio `https://TWOJ-ADRES/adventure`, a potem odśwież. Sprawdź również `/rules`. Błąd 404 na tych ekranach zwykle oznacza brak aktywnej konfiguracji `.htaccess`.
- Otwórz `/manifest.webmanifest` i `/sw.js`: powinny pokazywać właściwe pliki, a nie ekran aplikacji.
- Wejdź w misje, zapisz trening i odśwież stronę. Postęp powinien pozostać zapisany.
- Po pierwszym pełnym załadowaniu aplikacji wyłącz internet i sprawdź, czy można otworzyć ją ponownie. Instalację sprawdź na telefonie: opcja „Zainstaluj aplikację” lub „Dodaj do ekranu początkowego”, zależnie od przeglądarki.
- Błąd serwera 500 po dodaniu `.htaccess` wymaga sprawdzenia logów hostingu i obsługi mod_rewrite, nie usuwania plików aplikacji.

## Aktualizacje

Wgrywaj nowe pliki z `assets` i pozostałe zasoby przed `index.html` i `sw.js`. Zachowaj stare pliki z `assets` podczas aktualizacji, aby osoby z otwartą poprzednią wersją nie straciły dostępu do jej zasobów. Aplikacja obsługuje komunikat o dostępnej aktualizacji.

## Dane użytkowników

Wyniki i postęp są zapisane lokalnie w przeglądarce danego urządzenia. Nie ma synchronizacji między telefonami ani kont na serwerze. Dane z `localhost` nie przeniosą się automatycznie na domenę. Zmiana domeny, przeglądarki lub usunięcie danych witryny oznacza oddzielną historię. Eksport JSON jest dostępny w aplikacji, a import waliduje i przywraca kopie, w tym starsze wersje.

## Ponowne przygotowanie paczki

W katalogu projektu uruchom `npm run build`. Folder `dist` zawiera gotową stronę wraz z `.htaccess`; spakuj jego zawartość, uwzględniając pliki ukryte. Kod źródłowy można przechowywać osobno w prywatnym repozytorium GitHub.

Instrukcja FTP cal.pl: https://www.cal.pl/pomoc/jak-polaczyc-sie-z-serwerem-przez-ftp/
Certyfikaty SSL cal.pl: https://www.cal.pl/certyfikatyssl
