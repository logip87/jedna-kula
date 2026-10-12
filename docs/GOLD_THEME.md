# Grafit, złoto i krem — 7 października 2026

Inspiracja: przekazana przez użytkownika grafika kuli, czerni, złota i ciepłej jasnej powierzchni. Paletę przeniesiono na istniejącą aplikację, bez umieszczania tekstury pod formularzami i treścią treningów.

Główne tokeny CSS: `--ink` #1d1c18, `--charcoal` #24231e, `--gold` #efbb32, `--sand` #ede3cf, `--surface` #fffdf8, tło #f7f1e5. Złoto wyróżnia główną akcję, aktywną nawigację i postęp. Grafit wyznacza sekcje i tekst, a kremowe oraz piaskowe powierzchnie porządkują informacje. Zachowano znaczenie komunikatów sukcesu i błędu wraz z etykietami.

Zaktualizowano CSS, diagramy SVG i ilustracje kodowe, źródłową ikonę SVG, ikony 192/512, maskowalną i Apple oraz kolor przeglądarki i manifestu. Ikony rastrowe zostały wygenerowane z nowego SVG.

Kontrast: główna akcja grafit/złoto 9,60:1; opisy na jasnym tle 7,44:1; jasny tekst na grafitowym panelu 15,48:1; mały ciemny opis na złocie 4,91:1; fokus na jasnej powierzchni 5,13:1. Testy axe-core sprawdzają główne ekrany według WCAG A/AA; nie jest to certyfikacja całego produktu. Interfejs obejrzano na zrzutach telefonu i komputera. Układ, rozmiary przycisków, etykiety oraz obsługa klawiatury pozostają zachowane.

Weryfikacja: ESLint, TypeScript, 93 jednostkowe, pełne 40 E2E po zmianie palety. Po ostatniej korekcie kolorów komunikatów ponowiono sześć testów dostępności i układu — poprawne.
