# Publikacja P2 — 7 października 2026

Opublikowano build P0/P1/P2 na https://jednakula.progtest.pl przez istniejący skrypt `scripts/cal-ftp.py` i FTPS z weryfikacją TLS. Hasło pobrano z Pęku kluczy; nie zapisano go w repozytorium ani raportach.

Weryfikacja przed publikacją: 82/82 testów Vitest, 31/31 Playwright, ESLint, TypeScript i build. Nowe ścieżki sprawdzono również przy 320 px i automatycznymi regułami WCAG A/AA.

Kopia zastępowanych plików: `release/backup-cal-20261007T150002796514Z`. Wysłano 31 plików z `dist/`; stare zasoby zachowano. `index.html` i `sw.js` wysłano na końcu.

Po publikacji pobrano wszystkie 31 plików przez FTPS i porównano SHA-256 z buildem — pełna zgodność. HTTPS zwrócił 200 i identyczną treść dla `/`, `/coach/match`, `/coach/boss`, `/coach/extras`, `/sw.js` i `/manifest.webmanifest`. Chromium poprawnie wyrenderował trzy nowe ekrany produkcyjne, bez błędów JavaScript.

Dane treningowe użytkowników pozostają lokalne. Osoba z uruchomioną starszą PWA może zaakceptować komunikat aktualizacji aplikacji po zakończeniu swojej sesji.

Zakres nie jest równoznaczny z realizacją każdego szczegółowego pomysłu: [audyt wszystkich 47 sekcji](REQUIREMENTS_AUDIT.md) opisuje pozostałe luki. Rankingi użytkowników są wyłączone.
