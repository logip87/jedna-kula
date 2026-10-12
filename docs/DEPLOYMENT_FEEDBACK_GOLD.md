# Publikacja formularza i złotej palety — 7 października 2026

Adres produkcyjny: https://jednakula.progtest.pl.

Dodano menu Więcej → Zgłoś pomysł / problem, formularz `/feedback` i PHP `/api/feedback.php`. Zgłoszenia trafiają na stały adres `p.logasz@gmail.com`. Na produkcji sprawdzono poprawny token CSRF, no-store oraz odrzucenie błędnego tokenu, obcego originu, zbyt krótkiej treści, wstrzyknięcia nagłówka w e-mail, honeypotu i nieznanego rodzaju. Te przypadki nie wysyłały maili.

Publicznym formularzem wysłano jedną wiadomość z wyraźnym oznaczeniem TEST TECHNICZNY. PHP zwróciło HTTP 200 i `ok: true`; hosting przyjął ją do wysyłki. Nie potwierdzano doręczenia przez Gmail. Dalsze kontrole nie wysyłały wiadomości.

Zastosowano grafit, ciepłe złoto i krem zgodnie z załączoną inspiracją. Zmieniono ekrany, diagramy, ikony PWA i manifest. Kontrasty i zasady: [GOLD_THEME.md](GOLD_THEME.md).

Testy: lint, TypeScript, 93/93 jednostkowe i 40/40 E2E. Po końcowej korekcie kolorów komunikatów ponowiono sześć scenariuszy dostępności — poprawne. Pełny zestaw obejmuje treningi offline, kompatybilność, zapis, błędy pamięci, formularz, ponowną próbę i blokadę duplikatów.

Formularz opublikowano najpierw z kopią `release/backup-cal-20261007T155552865162Z`. Ostateczną wersję z paletą opublikowano przez FTPS, kopia zastępowanych plików `release/backup-cal-20261007T160118114988Z`. Wysłano 32 pliki, stare zasoby zachowano. Wszystkie 32 pliki po ponownym pobraniu przez FTPS miały SHA-256 zgodne z lokalnym buildem. HTTPS zwrócił 200 i zgodną treść dla `/`, `/feedback`, `/more`, `/sw.js`, `/manifest.webmanifest` i `/icon-192.png`. PHP ponownie zwróciło prawidłowy JSON.

Publiczny Chromium potwierdził nową paletę, wejście w formularz z menu, przycisk Wyślij, brak poziomego przewijania przy 320 px oraz poprawny wynik axe-core i brak błędów JavaScript. Kontrole działały w odrębnym kontekście przeglądarki.
