# Formularz pomysłów i problemów

W menu Więcej dodano „Zgłoś pomysł / problem”, prowadzące do `/feedback`. Pola: rodzaj, treść 10–5000 znaków, opcjonalny adres do odpowiedzi. Nie zbieramy automatycznie profilu, treningów, informacji o urządzeniu ani załączników. Treść jest wysyłana na stały adres `p.logasz@gmail.com`; adres klienta może trafić tylko do zweryfikowanego Reply-To.

React wysyła JSON do `/api/feedback.php`. PHP generuje token CSRF w sesji z ciasteczkiem Secure/HttpOnly/SameSite Strict, dopuszcza POST tylko z produkcyjnego originu i sprawdza treść po stronie serwera. Nie przyjmuje adresata ani tematu z klienta. Nagłówki są stałe; Reply-To odrzuca znaki nowej linii. Treść jest kodowana base64 jako zwykły tekst UTF-8. PHP nie jest buforowane przez service worker, a endpoint nie wpada w fallback SPA.

Zabezpieczenia przeciw przypadkowym duplikatom i spamowi: blokada wysyłania w formularzu, ukryte pole honeypot, limit trzech prób wysyłki na sesję w 15 minut i wspólny limit 50 prób w godzinie. Plik limitu w katalogu tymczasowym zawiera tylko znaczniki czasu, bez IP i treści. Zgłoszenia nie są zapisywane w plikach ani bazie aplikacji. Ciasteczko sesyjne służy ochronie formularza, nie analityce; ogólne logi serwera pozostają konfiguracją hostingu.

Sukces wyświetlamy tylko po odpowiedzi `ok: true`, gdy hosting przyjmie e-mail do wysyłki. [Dokumentacja PHP mail](https://www.php.net/manual/en/function.mail.php) rozróżnia przyjęcie do wysyłki od doręczenia do skrzynki. Nie deklarujemy potwierdzenia doręczenia przez Gmail. Błąd zachowuje treść do ponownej próby; brak sieci pokazuje czytelny komunikat. Treść pozostaje w pamięci aktualnego ekranu, nie jest trwale zapisywana na urządzeniu.

Testy E2E: wejście przez menu, wysyłka tylko wpisanych pól, blokada ponownego wysłania podczas trwającego żądania, walidacja, błąd i ponowna próba bez adresu odpowiedzi, offline, WCAG i szerokość 320 px. W lokalnym Vite nie wykonuje się PHP, dlatego testy UI podstawiają odpowiedzi endpointu. Weryfikacja PHP i poczty odbywa się dodatkowo na docelowym hostingu.
