# Flakiness i odporność

Flaky test daje różne wyniki bez zmiany produktu, testu i kontrolowanych danych. Czasem przyczyną jest bug produktu, np. race przy zapisie; nie klasyfikujemy każdej niestabilności jako winy testu.

## Zapobieganie

- Nowy browser context per test, unikalna baza w integration; zero zależności od poprzedniego testu.
- Nazwy i stany dostępności zamiast pozycji elementów i indeksów przypadkowej listy.
- Czekanie na „ZAPISANY TRENING”, kolejną próbę, disabled po zaliczeniu oraz controller service workera. Kliknięcie samo w sobie nie oznacza zakończenia transakcji.
- Kontrolowane dane i zegar w visual, stałe projekty/viewport i osobne baselines dla środowiska.
- Brak `waitForTimeout` i arbitralnych sleeps. Timeout jest limitem oczekiwania na warunek, nie sposobem synchronizacji.

## Kontrolowana fault injection

Resilience wykorzystuje istniejący test `QuotaExceededError` z retry akcji przez użytkownika. Drugi test zatrzymuje potwierdzenie zakończenia transakcji IndexedDB do jawnego sygnału z testu. Nie symuluje opóźnienia przez sleep: pokazuje, że UI czeka i blokuje wielokrotne kliknięcia, a zapis ma jedną próbę. Przeglądarkowa transakcja jest prawdziwa; opóźnione jest jej potwierdzenie dla klienta.

## Wykrywanie i retry policy

Showcase ma `retries: 0`. PR nie dostaje statusu zielonego dzięki przypadkowemu drugiemu przebiegowi. Kontrolowane powtórzenia:

```sh
npm run qa:repeat
```

To pięć wykonań smoke i resilience, nie pięć prób zamaskowania failure. Każdy failure kończy polecenie błędem. Trend historyczny zbieramy z CI; pojedynczy zielony run nie dowodzi trwałej stabilności.

## Triage

1. Zachowaj HTML report, trace, screenshot, projekt i wersję Playwright.
2. Powtórz ten sam test z tymi samymi warunkami. Sprawdź różnice z CI.
3. Rozdziel błąd produktu, danych, testu i środowiska.
4. Dla produktu zachowaj asercję i zgłoś bug. Dla testu popraw synchronizację/locator oraz opisz dowód.
5. Powtórz wybrany test; potem odpowiednią regresję. Nie zwiększaj timeout/retry bez pomiaru.

## Quarantine

Nie ma domyślnej quarantine i automatycznych skipów. Ewentualne czasowe wyłączenie musi mieć issue, właściciela, termin usunięcia i uzasadnienie. Test nadal uruchamia się w osobnym jobie, a ryzyko jest widoczne. Critical smoke i ochrona danych pozostają gate; ich failure nie trafia automatycznie do quarantine.

## Visual i PWA

Baselines powstają w świadomie wybranym środowisku. Renderowanie na innym systemie nie jest dowodem regresji produktu. Brak Linux baseline nie jest naprawiany przez masową regenerację w CI.

Offline czeka na realny controller i sprawdza cache. Worker update i usuwanie starego cache po dwóch wdrożeniach pozostają ręcznym scenariuszem: wersja A, aktywna sesja, wdrożenie B, komunikat aktualizacji, zakończenie/zapis, świadoma aktualizacja, restart offline. W showcase nie zastępujemy tego fikcyjnym `onNeedRefresh`, bo taki test nie weryfikowałby Workbox. Instalacja na fizycznych telefonach również pozostaje manualna.
