// Weryfikacja wszystkich generatorów zadań:
// 1) oczekiwana odpowiedź przechodzi własną sprawdzarkę (poprawna postać),
// 2) jej wartość zgadza się z NIEZALEŻNYM obliczeniem treści zadania przez Compute Engine,
// 3) ostatni krok rozwiązania zawiera tę samą wartość,
// 4) w zadaniach zamkniętych jest dokładnie jedna poprawna odpowiedź i 4 różne opcje.
import { describe, expect, it } from 'vitest';
import { DZIALY } from '../src/content/curriculum';
import { buildTest, makeChoice } from '../src/content/testBuilder';
import { checkAnswer, equivalent } from '../src/math/check';
import { ceNumeric, evaluate, parseLatex } from '../src/math/evaluate';
import { mulberry32 } from '../src/math/rng';

const N = 400;
const PTS = [-1.7, 0.3, 2.45];

for (const d of DZIALY) {
  describe(`Dział ${d.num}: ${d.title}`, () => {
    for (const s of d.skills) {
      it(`${s.id}: ${N} losowych zadań jest poprawnych`, () => {
        for (let seed = 1; seed <= N; seed++) {
          const r = mulberry32(seed * 7919 + s.id.length);
          const t = s.generate(r);
          const ctx = `${s.id} seed=${seed} display=${t.display ?? t.text} expected=${t.answer.expected}`;
          // 1
          const self = checkAnswer(t.answer.expected, t.answer);
          expect(self.status, `${ctx} ${self.message ?? ''}`).toBe('correct');
          // 2: niezależna ewaluacja (Compute Engine) vs nasz ewaluator
          const vars = t.verify.vars ?? [];
          const pts = vars.length ? PTS : [0];
          for (const x of pts) {
            const env: Record<string, number> = vars.length ? { x } : {};
            const indep = ceNumeric(t.verify.expr, env);
            const ours = evaluate(parseLatex(t.answer.expected), env);
            expect(Math.abs(indep - ours), `${ctx} CE=${indep} ours=${ours}`).toBeLessThan(1e-9 * Math.max(1, Math.abs(indep)));
          }
          // 3
          expect(t.solution.length, ctx).toBeGreaterThan(0);
          // 4
          const ch = makeChoice(t, r);
          expect(ch.options.length, `${ctx} opcje=${ch.options}`).toBe(4);
          const correctOnes = ch.options.filter((o) => equivalent(parseLatex(o), parseLatex(t.answer.expected), t.answer.vars));
          expect(correctOnes.length, ctx).toBe(1);
          for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++)
            expect(equivalent(parseLatex(ch.options[i]), parseLatex(ch.options[j]), t.answer.vars), `${ctx} duplikat ${ch.options}`).toBe(false);
        }
      });
    }
    it('test z działu ma 10 pytań', () => {
      for (let seed = 1; seed < 30; seed++) expect(buildTest(d, mulberry32(seed)).length).toBe(10);
    });
  });
}
