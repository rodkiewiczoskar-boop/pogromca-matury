import { describe, expect, it } from 'vitest';
import { buildExam, maxPoints } from '../src/exam/builder';
import { OPEN_BLUEPRINT } from '../src/exam/open';
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
      }
    });
  }
  it('symetralna: odpowiedź w postaci y = ax + b jest akceptowana na różne sposoby', () => {
    const t = OPEN_BLUEPRINT[6](mulberry32(5));
    const exp = t.parts[0].answer.expected;
    expect(checkAnswer(exp, t.parts[0].answer).status).toBe('correct');
    expect(checkAnswer(exp.replace('y = ', ''), t.parts[0].answer).status).toBe('correct');
  });
});
