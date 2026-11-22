// Weryfikacja wszystkich generatorów zadań:
// 1) oczekiwana odpowiedź przechodzi własną sprawdzarkę (poprawna postać),
// 2) jej wartość zgadza się z NIEZALEŻNYM obliczeniem treści zadania przez Compute Engine
//    (dla list: każde rozwiązanie zeruje wyrażenie; dla przedziałów: zbiór zgadza się z nierównością w setkach punktów),
// 3) tam, gdzie to możliwe, wynik zgadza się z liczeniem brutalną siłą (zliczanie, podstawienie),
// 4) w zadaniach zamkniętych jest dokładnie jedna poprawna odpowiedź i 4 różne opcje.
import { describe, expect, it } from 'vitest';
import { DZIALY } from '../src/content/curriculum';
import { buildTest, makeChoice, sameAnswer } from '../src/content/testBuilder';
import { mulberry32 } from '../src/math/rng';
import { verifyTask } from './verify';

const N = 300;


for (const d of DZIALY) {
  describe(`Dział ${d.num}: ${d.title}`, () => {
    for (const s of d.skills) {
      it(`${s.id}: ${N} losowych zadań jest poprawnych`, () => {
        for (let seed = 1; seed <= N; seed++) {
          const r = mulberry32(seed * 7919 + s.id.length);
          const t = s.generate(r);
          const ctx = `${s.id} seed=${seed} text=${t.text} display=${t.display ?? ''} expected=${t.answer.expected}`;
          verifyTask(t, ctx);
          if (s.noChoice) continue;
          const ch = makeChoice(t, r);
          expect(ch.options.length, `${ctx} opcje=${ch.options}`).toBe(4);
          const correctOnes = ch.options.filter((o) => sameAnswer(o, t.answer.expected, t.answer));
          expect(correctOnes.length, `${ctx} opcje=${ch.options}`).toBe(1);
          for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++)
            expect(sameAnswer(ch.options[i], ch.options[j], t.answer), `${ctx} duplikat ${ch.options}`).toBe(false);
        }
      });
    }
    it('test z działu ma 10 pytań', () => {
      for (let seed = 1; seed < 30; seed++) expect(buildTest(d, mulberry32(seed)).length).toBe(10);
    });
  });
}
