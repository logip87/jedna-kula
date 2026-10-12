# Publikacja uproszczenia produktu — 7 października 2026

Opublikowano zweryfikowany build na https://jednakula.progtest.pl przez FTPS z weryfikacją TLS, istniejącym skryptem `scripts/cal-ftp.py`. Hasło pozostaje w Pęku kluczy macOS.

Weryfikacja przed publikacją: ESLint, TypeScript, 93/93 testów jednostkowych, build oraz 37/37 E2E. Scenariusze obejmują offline, import starych kopii, awarie pamięci, adaptację po akceptacji, rzeczywistą różnicę Pokonaj siebie, rutynę i pełne 60 minut. Główne widoki sprawdzono przy 320 px, także axe-core WCAG A/AA.

Kopia zastępowanych plików: `release/backup-cal-20261007T153728211960Z`. Wysłano 31 plików; stare zasoby zachowano. Pliki wejścia i service worker opublikowano na końcu.

Po publikacji pobrano wszystkie 31 plików przez FTPS: SHA-256 zgodne z lokalnym buildem. HTTPS: odpowiedź 200 i identyczna treść `/`, `/coach/generator`, `/coach/challenge`, `/settings`, `/sw.js`, `/manifest.webmanifest`.

Publiczny Chromium potwierdził Dzisiaj i start treningu, cztery widoczne wejścia nawigacji, generator z wybraną presją, wariant 60 minut oraz ustawienia z pomiarem domyślnie wyłączonym. Bez błędów JavaScript. Kontrola była w osobnym kontekście przeglądarki i nie zmieniała danych użytkownika.

Zakres, analiza produktu i ograniczenia pomiaru: [PRODUCT_REFINEMENT.md](PRODUCT_REFINEMENT.md). Liczniki są lokalne i opcjonalne; publikacja nie uruchamia zewnętrznej analityki. Kopie treningów mają wersję 5. Istniejąca PWA proponuje aktualizację po zakończeniu aktywnej sesji.
