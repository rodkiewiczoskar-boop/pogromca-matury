// Dział 2: Wyrażenia algebraiczne
import { linTex, polyAdd, polyMul, polyTex, q, surdTex } from '../math/latex';
import { int, intNZ, pick } from '../math/rng';
import type { Dzial, Skill } from './types';

const poly = (expected: string) => ({ kind: 'input' as const, expected, form: 'polynomial' as const, vars: ['x'] });
const paren = (a: number, b: number) => `\\left(${linTex(a, b)}\\right)`;

const wzory: Skill = {
  id: 'wzory-skr',
  title: 'Wzory skróconego mnożenia',
  tip: ['$(a+b)^2=a^2+2ab+b^2$,  $(a-b)^2=a^2-2ab+b^2$', '$(a-b)(a+b)=a^2-b^2$'],
  generate(r) {
    const a = pick(r, [1, 1, 1, 2, 3, 2, 4, 5]);
    const b = int(r, 1, 9) * (r() < 0.5 ? -1 : 1);
    const type = int(r, 0, 2);
    if (type < 2) {
      const res = polyMul([b, a], [b, a]);
      const display = `${paren(a, b)}^{2}`;
      const s = b < 0 ? '-' : '+';
      return {
        text: 'Rozwiń wyrażenie i zredukuj.', display, answer: poly(polyTex(res)),
        solution: [`Wzór $(a${s}b)^2 = a^2 ${s} 2ab + b^2$, gdzie $a=${a === 1 ? '' : a}x$, $b=${Math.abs(b)}$.`, `$${display} = ${a === 1 ? 'x^2' : `${a * a}x^2`} ${s} 2\\cdot ${a === 1 ? '' : a}x\\cdot ${Math.abs(b)} + ${b * b} = ${polyTex(res)}$`],
        verify: { expr: display, vars: ['x'] },
        distractors: [polyTex([b * b, 0, a * a]), polyTex([b * b, a * b, a * a]), polyTex([-b * b, 2 * a * b, a * a]), polyTex([b * b, -2 * a * b, a * a])],
      };
    }
    const B = Math.abs(b);
    const res = polyMul([-B, a], [B, a]);
    const display = `${paren(a, -B)}${paren(a, B)}`;
    return {
      text: 'Wymnóż i zredukuj.', display, answer: poly(polyTex(res)),
      solution: [`Wzór $(a-b)(a+b) = a^2 - b^2$, gdzie $a=${a === 1 ? '' : a}x$, $b=${B}$.`, `$${display} = ${polyTex(res)}$`],
      verify: { expr: display, vars: ['x'] },
      distractors: [polyTex([B * B, 0, a * a]), polyTex([-B * B, -2 * a * B, a * a]), polyTex([-B, 0, a * a]), polyTex([-B * B, 0, a])],
    };
  },
};

const upraszczanie: Skill = {
  id: 'upraszczanie',
  title: 'Upraszczanie wyrażeń',
  tip: ['Najpierw rozwiń każdy nawias osobno, potem zredukuj wyrazy podobne.', 'Uwaga na minus przed nawiasem: $-(x^2-4)=-x^2+4$'],
  generate(r) {
    const type = int(r, 0, 2);
    if (type === 0) {
      // (x+a)^2 - (x-b)(x+b)
      const a = intNZ(r, -6, 6), b = int(r, 1, 6);
      const A = polyMul([a, 1], [a, 1]);
      const B = polyMul([-b, 1], [b, 1]);
      const res = polyAdd(A, B, -1);
      const display = `${paren(1, a)}^{2} - ${paren(1, -b)}${paren(1, b)}`;
      return {
        text: 'Uprość wyrażenie.', display, answer: poly(polyTex(res)),
        solution: [`$${paren(1, a)}^{2} = ${polyTex(A)}$`, `$${paren(1, -b)}${paren(1, b)} = ${polyTex(B)}$`, `$${polyTex(A)} - \\left(${polyTex(B)}\\right) = ${polyTex(res)}$`],
        verify: { expr: display, vars: ['x'] },
        distractors: [polyTex(polyAdd(A, B, 1)), polyTex([a * a - b * b, 2 * a]), polyTex([a * a + b * b, a]), polyTex(polyAdd(res, [0, 0, 2]))],
      };
    }
    if (type === 1) {
      // (x+a)(x+c) - x(x+d)
      const a = intNZ(r, -7, 7), c = intNZ(r, -7, 7), d = intNZ(r, -7, 7);
      const A = polyMul([a, 1], [c, 1]);
      const B = [0, d, 1];
      const res = polyAdd(A, B, -1);
      if (res.every((v) => v === 0)) return upraszczanie.generate(r);
      const display = `${paren(1, a)}${paren(1, c)} - x${paren(1, d)}`;
      return {
        text: 'Uprość wyrażenie.', display, answer: poly(polyTex(res)),
        solution: [`$${paren(1, a)}${paren(1, c)} = ${polyTex(A)}$`, `$x${paren(1, d)} = ${polyTex(B)}$`, `$${polyTex(A)} - \\left(${polyTex(B)}\\right) = ${polyTex(res)}$`],
        verify: { expr: display, vars: ['x'] },
        distractors: [polyTex(polyAdd(A, B, 1)), polyTex([a * c, a + c + d]), polyTex([a * c, a + c - d, 0]).replace(/^0$/, '1'), polyTex(polyAdd(res, [0, 2 * d]))],
      };
    }
    // k(x-a)^2 - (kx^2 ...)  → 2(x-a)^2 - 2x^2
    const k = pick(r, [2, 3, -2, 4]), a = intNZ(r, -5, 5);
    const A = polyMul([k], polyMul([-a, 1], [-a, 1]));
    const res = polyAdd(A, [0, 0, k], -1);
    const display = `${k}${paren(1, -a)}^{2} - ${k}x^{2}`;
    return {
      text: 'Uprość wyrażenie.', display, answer: poly(polyTex(res)),
      solution: [`$${paren(1, -a)}^{2} = ${polyTex(polyMul([-a, 1], [-a, 1]))}$`, `$${k}\\cdot\\left(${polyTex(polyMul([-a, 1], [-a, 1]))}\\right) = ${polyTex(A)}$`, `$${polyTex(A)} - ${k}x^{2} = ${polyTex(res)}$`],
      verify: { expr: display, vars: ['x'] },
      distractors: [polyTex([k * a * a, -2 * a]), polyTex([a * a, -2 * k * a]), polyTex([k * a * a, 0]), polyTex([k * a * a, 2 * k * a])],
    };
  },
};

const wartosc: Skill = {
  id: 'wartosc-wyr',
  title: 'Wartość wyrażenia z pierwiastkami',
  tip: ['Wzory skróconego mnożenia działają też z pierwiastkami:', '$(1+\\sqrt{2})^2=1+2\\sqrt{2}+2=3+2\\sqrt{2}$'],
  generate(r) {
    const type = int(r, 0, 2);
    const m = pick(r, [2, 3, 5, 6, 7]);
    if (type === 0) {
      const a = intNZ(r, -4, 5), b = pick(r, [1, 1, 2, -1]);
      // (a + b√m)^2 = a² + b²m + 2ab√m
      const ra = a * a + b * b * m, rb = 2 * a * b;
      const base = surdTex(q(a), q(b), m);
      const display = `\\left(${base}\\right)^{2}`;
      const ans = surdTex(q(ra), q(rb), m);
      return {
        text: 'Oblicz.', display, answer: { kind: 'input', expected: ans, form: 'surd' },
        solution: [`$= ${a * a} ${rb < 0 ? '-' : '+'} 2\\cdot ${Math.abs(a)}\\cdot ${Math.abs(b) === 1 ? '' : Math.abs(b)}\\sqrt{${m}} + ${b * b * m}$`, `$= ${ans}$`],
        verify: { expr: display },
        distractors: [`${a * a + b * b * m}`, surdTex(q(a * a + b * b), q(rb), m), surdTex(q(ra), q(a * b), m), surdTex(q(ra), q(-rb), m)],
      };
    }
    if (type === 1) {
      // (√x - √y)(√x + √y) albo (a - √m)(a + √m)
      const a = int(r, 1, 6);
      const display = `\\left(${a} - \\sqrt{${m}}\\right)\\left(${a} + \\sqrt{${m}}\\right)`;
      const res = a * a - m;
      return {
        text: 'Oblicz.', display, answer: { kind: 'input', expected: `${res}`, form: 'surd' },
        solution: [`Wzór $(a-b)(a+b) = a^2 - b^2$:`, `$${a}^2 - \\left(\\sqrt{${m}}\\right)^2 = ${a * a} - ${m} = ${res}$`],
        verify: { expr: display },
        distractors: [`${a * a + m}`, `${a * a - m * m}`, `${a - m}`, `${m - a * a}`],
      };
    }
    // x^2 + bx dla x = a + √m
    const a = intNZ(r, -3, 3), bco = intNZ(r, -4, 4);
    // x² = a² + m + 2a√m; bx = ab + b√m
    const ra = a * a + m + bco * a, rb = 2 * a + bco;
    const xTex = surdTex(q(a), q(1), m);
    const ans = surdTex(q(ra), q(rb), m);
    return {
      text: `Oblicz wartość wyrażenia $${polyTex([0, bco, 1])}$ dla $x = ${xTex}$.`,
      answer: { kind: 'input', expected: ans, form: 'surd' },
      solution: [`$x^2 = \\left(${xTex}\\right)^2 = ${surdTex(q(a * a + m), q(2 * a), m)}$`, `$${bco}x = ${surdTex(q(bco * a), q(bco), m)}$`, `Razem: $${ans}$`],
      verify: { expr: `\\left(${xTex}\\right)^{2} + ${bco}\\left(${xTex}\\right)` },
      distractors: [surdTex(q(ra), q(-rb), m), surdTex(q(a * a + bco * a), q(rb), m), surdTex(q(ra + 1), q(rb), m), surdTex(q(ra), q(rb + 1), m)],
    };
  },
};

const rozklad: Skill = {
  id: 'rozklad',
  title: 'Rozkład na czynniki',
  tip: ['Najpierw wyłącz wspólny czynnik: $3x^2-6x=3x(x-2)$.', 'Potem szukaj wzoru: $x^2-9=(x-3)(x+3)$,  $x^2-10x+25=(x-5)^2$'],
  generate(r) {
    const type = int(r, 0, 2);
    const fac = (expected: string) => ({ kind: 'input' as const, expected, form: 'factored' as const, vars: ['x'] });
    if (type === 0) {
      const a = int(r, 1, 3), b = int(r, 1, 10);
      const display = polyTex([-b * b, 0, a * a]);
      const ans = `${paren(a, -b)}${paren(a, b)}`;
      return {
        text: 'Rozłóż na czynniki.', display, answer: fac(ans),
        solution: [`$${display} = ${a === 1 ? 'x' : `\\left(${a}x\\right)`}^2 - ${b}^2$`, `Wzór $a^2-b^2=(a-b)(a+b)$: $${ans}$`],
        verify: { expr: display, vars: ['x'] },
        distractors: [`${paren(a, -b)}^{2}`, `${paren(a, b)}^{2}`, `${paren(a, -b * b)}${paren(a, b * b)}`, `x${paren(a * a, -b * b)}`],
      };
    }
    if (type === 1) {
      const b = intNZ(r, -9, 9);
      const display = polyTex(polyMul([b, 1], [b, 1]));
      const ans = `${paren(1, b)}^{2}`;
      return {
        text: 'Rozłóż na czynniki.', display, answer: fac(ans),
        solution: [`$${b * b} = ${Math.abs(b)}^2$ i $${Math.abs(2 * b)}x = 2\\cdot x\\cdot ${Math.abs(b)}$`, `Wzór $(a${b < 0 ? '-' : '+'}b)^2$: $${ans}$`],
        verify: { expr: display, vars: ['x'] },
        distractors: [`${paren(1, -b)}^{2}`, `${paren(1, -b)}${paren(1, b)}`, `${paren(1, 2 * b)}^{2}`, `x${paren(1, 2 * b)}`],
      };
    }
    const k = pick(r, [1, 2, 3, 4, 5]), c = intNZ(r, -9, 9);
    if (k === 1 && Math.abs(c) === 1) return rozklad.generate(r);
    // k x^2 + k c x = kx(x + c)
    const display = polyTex([0, k * c, k]);
    const ans = `${k === 1 ? '' : k}x${paren(1, c)}`;
    return {
      text: 'Wyłącz wspólny czynnik przed nawias.', display, answer: fac(ans),
      solution: [`Wspólny czynnik to $${k === 1 ? '' : k}x$.`, `$${display} = ${ans}$`],
      verify: { expr: display, vars: ['x'] },
      distractors: [`${k === 1 ? '' : k}x${paren(1, -c)}`, `x${paren(k, c)}`, `${k * 2}x${paren(1, c)}`, `${k === 1 ? '' : k}${paren(1, c)}`],
    };
  },
};

export const dzial2: Dzial = {
  id: 'wyrazenia',
  num: 2,
  title: 'Wyrażenia algebraiczne',
  skills: [wzory, upraszczanie, rozklad, wartosc],
};
