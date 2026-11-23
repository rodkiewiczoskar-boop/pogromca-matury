// Arkusz CKE: klucz odpowiedzi sprawdzony niezależnym obliczeniem, rysunki zgodne z treścią.
import { describe, expect, it } from 'vitest';
import { ARKUSZE, ArkuszClosed, MAJ_2026 } from '../src/content/arkusze';
import { polyAt, type GeoShape, type Pt } from '../src/content/figures';
import { scoreOpen } from '../src/exam/open';
import { checkAnswer } from '../src/math/check';
import { ceNumeric } from '../src/math/evaluate';
import { verifyTask } from './verify';

const closed = (n: number) => MAJ_2026.items.find((i) => i.num === n) as ArkuszClosed;
const val = (latex: string) => {
  let s = latex.replace(/\\text\{[^}]*\}/g, '').replace(/\{,\}/g, '.').replace(/^\s*[a-zA-Z]\s*=/, '').trim();
  const tup = s.replace(/\\left|\\right/g, '').match(/^\((.*),(.*)\)$/);
  if (tup) s = tup[2];
  return ceNumeric(s, {});
};
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));

/** Wartość liczbowa poprawnej odpowiedzi musi być równa niezależnie policzonej, a pozostałe opcje różne */
function keyIs(n: number, expected: number) {
  const t = closed(n);
  const vals = t.options.map((o) => val(o));
  expect(close(vals[t.correct], expected), `zad. ${n}: klucz ${'ABCD'[t.correct]}=${vals[t.correct]}, liczę ${expected}`).toBe(true);
  vals.forEach((v, i) => { if (i !== t.correct) expect(close(v, expected), `zad. ${n}: opcja ${'ABCD'[i]} też pasuje`).toBe(false); });
}

describe('arkusz CKE maj 2026', () => {
  it('układ: 34 zadania, 25 zamkniętych, 50 punktów', () => {
    expect(MAJ_2026.items.length).toBe(34);
    expect(MAJ_2026.items.filter((i) => i.kind === 'closed').length).toBe(25);
    expect(MAJ_2026.items.reduce((s, i) => s + (i.kind === 'closed' ? 1 : i.task.points), 0)).toBe(50);
    MAJ_2026.items.forEach((it, k) => expect(it.num).toBe(k + 1));
  });

  it('klucz zgodny z „Zasadami oceniania” CKE', () => {
    // litery z oficjalnego klucza CKE (maj 2026, formuła 2015, PP)
    const KEY = 'CBCBACDACADADBCCDCCBDDDAC';
    MAJ_2026.items.filter((i): i is ArkuszClosed => i.kind === 'closed').forEach((t) => expect('ABCD'[t.correct], `zad. ${t.num}`).toBe(KEY[t.num - 1]));
  });

  it('zadania zamknięte: klucz potwierdzony własnym rachunkiem', () => {
    keyIs(1, Math.sqrt(25 / 8) * Math.sqrt(2) + 0.5);
    keyIs(2, 10000 * 1.06 ** 2 - 10000);
    keyIs(3, Math.sqrt(5 * Math.sqrt(5)));
    keyIs(4, Math.log(4 / 32) / Math.log(8));
    keyIs(5, (Math.sqrt(2) - 5) ** 2 + 10 * (Math.sqrt(2) - 5) + 25);
    keyIs(6, (() => { for (let m = -20; m <= 20; m++) if (-3 + m - 2 === 0) return m; return NaN; })());
    keyIs(7, (() => { for (let x = -50; x <= 50; x++) if (3 * x - 1 !== 0 && close((x + 2) / (3 * x - 1), 2 / 5)) return x; return NaN; })());
    keyIs(12, (-3 - 0) / (0 - -2));
    keyIs(13, (() => { for (let k = 1; k <= 1000; k++) { const t = k / 100; if (Math.abs(-4.9 * t * t + 14.7 * t) < 1e-9) return t; } return NaN; })());
    keyIs(14, 1 + 8 * ((17 - 1) / 4));
    // ciąg geometryczny: dla dowolnego a1, q spełniającego warunek
    { const q = 1.7, a1 = Math.sqrt(18 / q ** 7); keyIs(15, a1 * q * a1 * q ** 6); }
    keyIs(16, Math.sqrt(40 - 4) / (2 * Math.sqrt(10)));
    { const t = (6 - 1) * 4 / 3; expect(close((3 * Math.sin(Math.atan(t)) + 4 * Math.cos(Math.atan(t))) / (4 * Math.cos(Math.atan(t))), 6)).toBe(true); keyIs(17, t); }
    keyIs(19, 9 * Math.sqrt(3) * Math.sqrt(3));
    keyIs(20, (6 * 12) / 8);
    keyIs(22, Math.sqrt(12 / 6) * Math.sqrt(3));
    keyIs(23, ((1 / 3) * Math.PI * 4 * 1) / (Math.PI * 1));
    { let c = 0; for (let n = 100; n <= 999; n++) if (n % 2 === 1 && [...String(n)].every((d) => '0123456'.includes(d))) c++; keyIs(24, c); }
    keyIs(25, (3 * 2 + 4 * 5.5) / 7);
  });

  it('zadania 8–11 i 18, 21: odpowiedź zgodna z rysunkiem i treścią', () => {
    const fig = closed(8).figure!;
    if (fig.kind !== 'graph') throw new Error();
    const [left, right] = fig.curves;
    const f = (x: number) => (x >= -4 && x <= 2 ? polyAt(left.pts, x)! : x > 2 && x < 5 ? polyAt(right.pts, x)! : NaN);
    expect(f(1)).toBe(3); // A prawdziwe
    expect(f(2)).toBe(4); // B fałszywe (największa w <2,3> to 4)
    expect(f(1)).toBeGreaterThan(f(0)); // C fałszywe
    // D: miejsca zerowe
    let zeros = 0; for (let k = -400; k < 500; k++) { const x = k / 100; if (f(x) === 0) zeros++; }
    expect(zeros).toBe(1);
    expect(closed(8).correct).toBe(0);
    // 9: zbiór wartości <−2, 4>
    let lo = Infinity, hi = -Infinity; for (let k = -400; k < 500; k++) { const v = f(k / 100); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    expect([lo, hi]).toEqual([-2, 4]);
    expect(closed(9).options[closed(9).correct]).toBe('\\langle -2, 4\\rangle');
    // 10: ujemne dla x z <−4, −2)
    for (let k = -400; k < 500; k++) { const x = k / 100; expect(f(x) < 0, `x=${x}`).toBe(x >= -4 && x < -2); }
    expect(closed(10).options[closed(10).correct]).toBe('\\langle -4, -2)');
    // 11: prosta przez (−2, 0) i (0, −3)
    const g = closed(11).figure!; if (g.kind !== 'graph') throw new Error();
    expect(close(polyAt(g.curves[0].pts, -2)!, 0)).toBe(true);
    expect(close(polyAt(g.curves[0].pts, 0)!, -3)).toBe(true);
    expect(closed(11).options[closed(11).correct]).toContain('a < 0 \\text{ oraz } b < 0');
    // 18: kąty na rysunku
    const sh = closed(18).figure!; if (sh.kind !== 'geo') throw new Error();
    const pts = Object.fromEntries(sh.shapes.filter((s): s is Extract<GeoShape, { t: 'pt' }> => s.t === 'pt').map((s) => [s.label!, s.p]));
    const ang = (P: Pt, A: Pt, B: Pt) => { const u = [A[0] - P[0], A[1] - P[1]], v = [B[0] - P[0], B[1] - P[1]]; return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))) * 180) / Math.PI; };
    expect(ang(pts.D, pts.C, pts.A)).toBeCloseTo(50, 9);
    expect(ang(pts.O, pts.C, pts.B)).toBeCloseTo(30, 9);
    expect(ang(pts.O, pts.B, pts.A)).toBeCloseTo(70, 9);
    expect(closed(18).options[closed(18).correct]).toBe('70^\\circ');
    // 20: proste k i l równoległe, długości jak w treści
    const s20 = closed(20).figure!; if (s20.kind !== 'geo') throw new Error();
    const p20 = Object.fromEntries(s20.shapes.filter((s): s is Extract<GeoShape, { t: 'pt' }> => s.t === 'pt').map((s) => [s.label!, s.p]));
    const d = (P: Pt, Q: Pt) => Math.hypot(P[0] - Q[0], P[1] - Q[1]) * 3;
    expect(d(p20.O, p20.A)).toBeCloseTo(12, 9); expect(d(p20.O, p20.B)).toBeCloseTo(6, 9); expect(d(p20.O, p20.C)).toBeCloseTo(8, 9);
    const cross = (p: Pt, q: Pt, r: Pt, s: Pt) => (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
    expect(Math.abs(cross(p20.A, p20.D, p20.B, p20.C))).toBeLessThan(1e-9);
    expect(d(p20.O, p20.D)).toBeCloseTo(9, 9);
    // 21: punkt przecięcia z osią Oy
    keyIs(21, -2 - (-1 / 3) * 2);
  });

  it('zadania otwarte: odpowiedzi i kroki poprawne, punktacja spójna', () => {
    for (const it of MAJ_2026.items) {
      if (it.kind !== 'open') continue;
      const t = it.task;
      const ctx = `zad. ${it.num}`;
      expect(t.scheme.length, ctx).toBe(t.points);
      for (const part of t.parts) verifyTask({ text: t.text, answer: part.answer, solution: t.solution, verify: part.verify, distractors: [], verifyFn: part.verifyFn, verifyFnExpect: part.verifyFnExpect, verifyRoots: part.verifyRoots, verifyIneq: part.verifyIneq, verifyPoint: part.verifyPoint }, `${ctx} ${part.label}`);
      for (const st of t.steps ?? []) {
        if (st.answer.form === 'equation') {
          expect(checkAnswer(st.answer.expected, st.answer).status, ctx).toBe('correct');
          const v = st.answer.vars![0];
          const [L, R] = st.answer.expected.split('=');
          const sol = ceNumeric(st.verify.expr, {});
          expect(Math.abs(ceNumeric(L, { [v]: sol }) - ceNumeric(R, { [v]: sol })), ctx).toBeLessThan(1e-9);
        } else verifyTask({ text: t.text, answer: st.answer, solution: t.solution, verify: st.verify, distractors: [], verifyFn: st.verifyFn, verifyFnExpect: st.verifyFnExpect, verifyRoots: st.verifyRoots, verifyPoint: st.verifyPoint }, `${ctx} ${st.title}`);
        expect(st.pts, ctx).toBeLessThan(t.points);
      }
      if (t.parts.length) {
        expect(scoreOpen(t, (t.steps ?? []).map(() => false), t.parts.map(() => true)), ctx).toBe(t.points);
        expect(scoreOpen(t, (t.steps ?? []).map(() => true), t.parts.map(() => false)), ctx).toBeLessThan(t.points);
      }
    }
  });

  it('typowe odpowiedzi ucznia są dobrze oceniane', () => {
    const open = (n: number) => (MAJ_2026.items.find((i) => i.num === n) as any).task;
    expect(checkAnswer('\\left(-\\infty;-\\frac43\\right\\rangle\\cup\\left\\langle2;\\infty\\right)', open(26).parts[0].answer).status).toBe('correct');
    expect(checkAnswer('\\left\\langle-\\frac43;2\\right\\rangle', open(26).parts[0].answer).status).toBe('wrong');
    expect(checkAnswer('35(200-y)+25y=6220', open(28).steps[0].answer).status).toBe('correct');
    expect(checkAnswer('0{,}5x^2-3x+2{,}5', open(32).parts[0].answer).status).toBe('correct');
    expect(checkAnswer('\\frac12(x-3)^2-2', open(32).parts[0].answer).status).toBe('form'); // trzeba postaci ogólnej
    expect(checkAnswer('y=-\\frac{x}{6}+3{,}5', open(34).steps[1].answer).status).toBe('correct');
    expect(checkAnswer('(21;0)', open(34).parts[0].answer).status).toBe('correct');
    // C bez pola: 3 pkt, C i |AB|: 4 pkt (jak w kluczu)
    expect(scoreOpen(open(34), [false, false], [true, false])).toBe(3);
    expect(scoreOpen(open(34), [true, false], [true, false])).toBe(4);
    expect(scoreOpen(open(33), [true, true], [true, false])).toBe(3);
  });

  it('każdy arkusz ma unikalny identyfikator', () => {
    expect(new Set(ARKUSZE.map((a) => a.id)).size).toBe(ARKUSZE.length);
  });
});
