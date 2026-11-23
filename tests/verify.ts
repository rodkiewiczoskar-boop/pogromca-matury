import { expect } from 'vitest';
import type { Task } from '../src/content/types';
import { checkAnswer } from '../src/math/check';
import { ceNumeric, evaluate, parseLatex } from '../src/math/evaluate';
import { inIntervals, parseIntervals, parseList, parsePoint } from '../src/math/sets';

const PTS = [-1.7, 0.3, 2.45];

export function verifyTask(t: Task, ctx: string) {
  const self = checkAnswer(t.answer.expected, t.answer);
  expect(self.status, `${ctx} ${self.message ?? ''}`).toBe('correct');
  const tol = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  const form = t.answer.form;
  if (form === 'list') {
    const roots = parseList(t.answer.expected);
    if (t.verifyRoots) for (const x of roots) expect(Math.abs(ceNumeric(t.verify.expr, { x })), `${ctx} root ${x}`).toBeLessThan(1e-9);
  } else if (form === 'interval') {
    const iv = parseIntervals(t.answer.expected);
    if (t.verifyIn) {
      for (let k = -400; k <= 400; k++) expect(inIntervals(k / 20, iv), `${ctx} x=${k / 20}`).toBe(t.verifyIn(k / 20));
      return;
    }
    const rel = t.verifyIneq!;
    const ex = parseLatex(t.verify.expr);
    for (let k = -400; k <= 400; k++) {
      const x = k / 20;
      const v = evaluate(ex, { x });
      const truth = rel === '<' ? v < -1e-12 : rel === '<=' ? v <= 1e-12 : rel === '>' ? v > 1e-12 : v >= -1e-12;
      expect(inIntervals(x, iv), `${ctx} x=${x}`).toBe(truth);
    }
    // a niezależnie: wartość wyrażenia przez CE w jednym punkcie zgadza się z naszym ewaluatorem
    expect(tol(ceNumeric(t.verify.expr, { x: 0.37 }), evaluate(parseLatex(t.verify.expr), { x: 0.37 })), ctx).toBe(true);
  } else if (form === 'point') {
    const pt = parsePoint(t.answer.expected);
    expect(pt.length).toBe(2);
    t.verifyPoint!.forEach((v, i) => expect(tol(v, pt[i]), `${ctx} point`).toBe(true));
  } else {
    const vars = t.verify.vars ?? [];
    for (const x of vars.length ? PTS : [0]) {
      const env: Record<string, number> = vars.length ? { x } : {};
      const indep = ceNumeric(t.verify.expr, env);
      const exp = parseLatex(t.answer.expected);
      const e = Array.isArray(exp) && exp[0] === 'Equal' ? exp[2] : exp;
      const ours = evaluate(e as any, env);
      expect(tol(indep, ours), `${ctx} CE=${indep} ours=${ours}`).toBe(true);
    }
  }
  if (t.verifyFn) {
    const got = t.verifyFn();
    const want = t.verifyFnExpect ?? evaluate(parseLatex(t.answer.expected));
    expect(tol(got, want), `${ctx} brute=${got} want=${want}`).toBe(true);
  }
  expect(t.solution.length, ctx).toBeGreaterThan(0);
}
