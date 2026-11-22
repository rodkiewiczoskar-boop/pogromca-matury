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
