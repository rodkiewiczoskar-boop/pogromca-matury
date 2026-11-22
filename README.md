# Pogromca Matury

PWA do nauki matematyki do matury (formuła 2015, poziom podstawowy).

## Uruchomienie

    npm install
    npm run dev      # tryb deweloperski, http://localhost:5173
    npm test         # testy sprawdzarki i generatorów zadań
    npm run build    # wersja produkcyjna w dist/ (statyczne pliki, można wrzucić na dowolny hosting HTTPS)

Gotową wersję z `dist/` można też podejrzeć lokalnie: `npx vite preview`.

## Jak to działa

- `src/content/` – działy i etapy. Każdy etap ma generator losujący zadania z dokładnie policzoną odpowiedzią (arytmetyka wymierna), rozwiązaniem krok po kroku i typowymi błędnymi odpowiedziami do zadań A–D.
- `src/math/check.ts` – sprawdzarka: odpowiedź ucznia (LaTeX z MathLive) jest parsowana i porównywana z poprawną wartościowo (dla wyrażeń z x w kilku punktach), a potem sprawdzana jest postać (np. wyłączony czynnik spod pierwiastka, rozwinięty wielomian, iloczyn przy rozkładzie).
- `tests/content.test.ts` – dla każdego etapu losuje 400 zadań i sprawdza, że odpowiedź zgadza się z niezależnym obliczeniem przez Compute Engine (CAS), że przechodzi sprawdzarkę i że w zadaniach zamkniętych jest dokładnie jedna poprawna opcja.

## Próbna matura

`src/exam/` – arkusz jak w CKE (formuła 2015, poziom podstawowy): 25 zadań zamkniętych po 1 pkt, 6 otwartych po 2 pkt, 2 po 4 pkt i 1 za 5 pkt, razem 50 pkt, 170 minut, próg 30%. Zadania są losowane według wzorców z arkuszy CKE (nie są kopiowane). Zadania otwarte mają schemat punktowania jak w kluczu: poprawny wynik końcowy daje pełne punkty automatycznie, w pozostałych przypadkach uczeń ocenia swoje rozwiązanie według klucza.

Kalkulator w aplikacji jest celowo prosty (cztery działania, pierwiastek, kwadrat, procent), bo taki jest dozwolony na maturze podstawowej.
