import { describe, expect, it } from 'vitest';
import { buildExam, maxPoints } from '../src/exam/builder';
import { OPEN_BLUEPRINT, OPEN_SKILLS, scoreOpen } from '../src/exam/open';
import { ceNumeric } from '../src/math/evaluate';
import { CLOSED_BLUEPRINT } from '../src/exam/builder';
import { DZIALY } from '../src/content/curriculum';
import { sameAnswer } from '../src/content/testBuilder';
import { checkAnswer } from '../src/math/check';
import { mulberry32 } from '../src/math/rng';
import { verifyTask } from './verify';

describe('próbna matura', () => {
  it('układ arkusza: 34 zadania, 25 zamkniętych, 50 punktów', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const ex = buildExam(seed);
      expect(ex.length).toBe(34);
      expect(ex.filter((i) => i.kind === 'closed').length).toBe(25);
      expect(maxPoints(ex)).toBe(50);
      for (const it of ex) if (it.kind === 'closed') {
        expect(it.q.options.length).toBe(4);
        expect(it.q.options.filter((o) => sameAnswer(o, it.q.task.answer.expected, it.q.task.answer)).length).toBe(1);
      }
    }
  });
  it('ten sam numer arkusza daje te same zadania', () => {
    const a = buildExam(123), b = buildExam(123);
    expect(a.map((i) => (i.kind === 'closed' ? i.q.task.text + i.q.options.join() : i.task.text))).toEqual(b.map((i) => (i.kind === 'closed' ? i.q.task.text + i.q.options.join() : i.task.text)));
  });
  for (const gen of OPEN_BLUEPRINT) {
    it(`zadanie otwarte ${gen.name}: 300 losowań poprawnych`, () => {
      for (let seed = 1; seed <= 300; seed++) {
        const t = gen(mulberry32(seed * 31 + 7));
        const ctx = `${gen.name} seed=${seed} ${t.text}`;
        expect(t.scheme.length, ctx).toBe(t.points);
        t.scheme.forEach((l, i) => expect(l.pts).toBe(i + 1));
        expect(t.solution.length).toBeGreaterThan(0);
        for (const part of t.parts) {
          verifyTask({ text: t.text, answer: part.answer, solution: t.solution, verify: part.verify, distractors: [], verifyFn: part.verifyFn, verifyFnExpect: part.verifyFnExpect, verifyRoots: part.verifyRoots, verifyIneq: part.verifyIneq }, `${ctx} part=${part.label} exp=${part.answer.expected}`);
        }
        if (t.id !== 'o-dowod') expect(t.parts.length, ctx).toBeGreaterThan(0);
        for (const st of t.steps ?? []) {
          const sctx = `${ctx} krok=${st.title} exp=${st.answer.expected}`;
          expect(st.pts, sctx).toBeLessThan(t.points);
          if (st.answer.form === 'equation') {
            // równanie warunku jest spełnione przez rozwiązanie zadania i przechodzi własną sprawdzarkę
            expect(checkAnswer(st.answer.expected, st.answer).status, sctx).toBe('correct');
            const [L, R] = st.answer.expected.split('=');
            const x = ceNumeric(st.verify.expr, {});
            expect(Math.abs(ceNumeric(L, { x }) - ceNumeric(R, { x })), sctx).toBeLessThan(1e-9);
          } else {
            verifyTask({ text: t.text, answer: st.answer, solution: t.solution, verify: st.verify, distractors: [], verifyFn: st.verifyFn, verifyFnExpect: st.verifyFnExpect, verifyRoots: st.verifyRoots, verifyIneq: st.verifyIneq, verifyPoint: st.verifyPoint }, sctx);
          }
        }
        // punktacja: pełne za wszystkie części, częściowe nigdy pełne
        if (t.parts.length) {
          expect(scoreOpen(t, (t.steps ?? []).map(() => false), t.parts.map(() => true)), ctx).toBe(t.points);
          expect(scoreOpen(t, (t.steps ?? []).map(() => true), t.parts.map(() => false)), ctx).toBeLessThan(t.points);
          expect(scoreOpen(t, (t.steps ?? []).map(() => false), t.parts.map(() => false)), ctx).toBe(0);
        }
      }
    });
  }
  it('symetralna: odpowiedź w postaci y = ax + b jest akceptowana na różne sposoby', () => {
    const t = OPEN_BLUEPRINT[6](mulberry32(5));
    const exp = t.parts[0].answer.expected;
    expect(checkAnswer(exp, t.parts[0].answer).status).toBe('correct');
    expect(checkAnswer(exp.replace('y = ', ''), t.parts[0].answer).status).toBe('correct');
  });
  it('etapy w układzie arkusza i w przewidywaniu wyniku istnieją', () => {
    const ids = new Set(DZIALY.flatMap((d) => d.skills.map((k) => k.id)));
    for (const slot of CLOSED_BLUEPRINT) for (const id of slot) expect(ids.has(id), id).toBe(true);
    for (const o of OPEN_SKILLS) for (const id of o.skills) expect(ids.has(id), id).toBe(true);
    expect(OPEN_SKILLS.reduce((a, o) => a + o.points, 0)).toBe(25);
  });
});
