// Dział 1: Liczby rzeczywiste
import { Q, q, lcm, simplifySqrt, surdTex, p } from '../math/latex';
import { int, intNZ, pick } from '../math/rng';
import type { Dzial, Skill, Task } from './types';

const sf = (n: number, d: number) => `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
const num = (expected: string) => ({ kind: 'input' as const, expected, form: 'number' as const });

const ulamkiDod: Skill = {
  id: 'ulamki-dod',
  title: 'Dodawanie i odejmowanie ułamków',
  tip: ['Sprowadź do wspólnego mianownika, potem dodaj liczniki.', '$\\frac{1}{4}+\\frac{1}{6}=\\frac{3}{12}+\\frac{2}{12}=\\frac{5}{12}$'],
  generate(r) {
    let a: Q, b: Q, op: '+' | '-', res: Q;
    do {
      a = q(intNZ(r, -9, 11), int(r, 2, 12));
      b = q(int(r, 1, 11), int(r, 2, 12));
      op = r() < 0.5 ? '+' : '-';
      res = op === '+' ? a.add(b) : a.sub(b);
    } while (a.isInt() || b.isInt() || res.n === 0 || a.d === b.d && r() < 0.7);
    const L = lcm(a.d, b.d);
    const an = a.n * (L / a.d), bn = b.n * (L / b.d);
    const display = `${a.tex()} ${op} ${b.tex()}`;
    const steps = [
      `Wspólny mianownik to $${L}$.`,
      `$${display} = ${sf(an, L)} ${op} ${sf(bn, L)} = ${sf(op === '+' ? an + bn : an - bn, L)}$`,
    ];
    if (!(res.d === L)) steps.push(`Skracamy: $${res.tex()}$`);
    return {
      text: 'Oblicz.',
      display,
      answer: num(res.tex()),
      solution: steps,
      verify: { expr: display },
      distractors: [
        q(op === '+' ? a.n + b.n : a.n - b.n, a.d + b.d).tex(),
        (op === '+' ? a.sub(b) : a.add(b)).tex(),
        q(op === '+' ? an + bn : an - bn, L * 2).tex(),
        res.neg().tex(),
      ],
    };
  },
};

const ulamkiMnoz: Skill = {
  id: 'ulamki-mnoz',
  title: 'Mnożenie i dzielenie ułamków',
  tip: ['Mnożenie: licznik razy licznik, mianownik razy mianownik.', 'Dzielenie: mnożysz przez odwrotność. $\\frac{2}{3}:\\frac{4}{5}=\\frac{2}{3}\\cdot\\frac{5}{4}=\\frac{5}{6}$'],
  generate(r) {
    let a: Q, b: Q;
    do { a = q(intNZ(r, -8, 9), int(r, 2, 10)); b = q(int(r, 1, 9), int(r, 2, 10)); } while (a.isInt() || b.isInt() || a.eq(b));
    const mul = r() < 0.5;
    const res = mul ? a.mul(b) : a.div(b);
    const display = `${a.tex()} ${mul ? '\\cdot' : ':'} ${b.tex()}`;
    const solution = mul
      ? [`$${display} = \\frac{${a.n}\\cdot ${b.n}}{${a.d}\\cdot ${b.d}} = ${res.tex()}$`]
      : [`Zamieniamy dzielenie na mnożenie przez odwrotność: $${a.tex()} \\cdot ${q(b.d, b.n).tex()}$`, `$= ${res.tex()}$`];
    return {
      text: 'Oblicz.',
      display,
      answer: num(res.tex()),
      solution,
      verify: { expr: `${a.tex()} ${mul ? '\\cdot' : '\\div'} ${b.tex()}` },
      distractors: [(mul ? a.div(b) : a.mul(b)).tex(), res.neg().tex(), q(a.n * b.d, a.d + b.n).tex(), (mul ? a.add(b) : a.sub(b)).tex()],
    };
  },
};

const potegiCalk: Skill = {
  id: 'potegi-calk',
  title: 'Potęgi o wykładniku całkowitym',
  tip: ['$a^m\\cdot a^n=a^{m+n}$,  $\\frac{a^m}{a^n}=a^{m-n}$,  $(a^m)^n=a^{mn}$', '$a^{-n}=\\frac{1}{a^n}$, czyli $\\left(\\frac{2}{3}\\right)^{-2}=\\left(\\frac{3}{2}\\right)^{2}=\\frac{9}{4}$'],
  generate(r) {
    const type = int(r, 0, 2);
    if (type === 0) {
      // (p/q)^{-n}
      const base = pick(r, [q(2, 3), q(3, 4), q(1, 2), q(2, 5), q(3, 2), q(1, 3), q(5, 2), q(-1, 2), q(-2, 3), q(4, 3)]);
      const n = int(r, 1, 3);
      const res = base.pow(-n);
      const display = `\\left(${base.tex()}\\right)^{-${n}}`;
      return {
        text: 'Oblicz.', display, answer: num(res.tex()),
        solution: [`Ujemny wykładnik odwraca ułamek: $${display} = \\left(${q(base.d, base.n).tex()}\\right)^{${n}}$`, `$= ${res.tex()}$`],
        verify: { expr: display },
        distractors: [base.pow(n).tex(), res.neg().tex(), q(-base.n * n, base.d).tex(), q(base.d * n, base.n).tex()],
      };
    }
    if (type === 1) {
      // a^m · a^n / a^k
      const a = pick(r, [2, 3, 5, 10]);
      let m: number, n: number, k: number, e: number;
      do { m = intNZ(r, -6, 9); n = intNZ(r, -6, 9); k = intNZ(r, -5, 9); e = m + n - k; } while (Math.abs(e) > (a === 2 ? 6 : 3) || e === 0 || e === 1);
      const res = q(a).pow(e);
      const display = `\\frac{${a}^{${m}}\\cdot ${a}^{${n}}}{${a}^{${k}}}`;
      return {
        text: 'Oblicz.', display, answer: num(res.tex()),
        solution: [`$= ${a}^{${m}+${p(n)}-${p(k)}} = ${a}^{${e}}$`, `$= ${res.tex()}$`],
        verify: { expr: display },
        distractors: [q(a).pow(-e).tex(), q(a).pow(e + 1).tex(), `${a * e}`, q(a).pow(e - 1).tex()],
      };
    }
    // (a^m)^n · a^k
    const a = pick(r, [2, 3]);
    let m: number, n: number, k: number, e: number;
    do { m = intNZ(r, -3, 4); n = intNZ(r, -3, 3); k = intNZ(r, -7, 7); e = m * n + k; } while (Math.abs(e) > (a === 2 ? 6 : 4) || e === 0 || e === 1);
    const res = q(a).pow(e);
    const display = `\\left(${a}^{${m}}\\right)^{${n}}\\cdot ${a}^{${k}}`;
    return {
      text: 'Oblicz.', display, answer: num(res.tex()),
      solution: [`$= ${a}^{${m}\\cdot ${p(n)}}\\cdot ${a}^{${k}} = ${a}^{${m * n}+${p(k)}} = ${a}^{${e}}$`, `$= ${res.tex()}$`],
      verify: { expr: display },
      distractors: [q(a).pow(-e).tex(), q(a).pow(e + 1).tex(), `${a * e}`, q(a).pow(e - 1).tex()],
    };
  },
};

const SQUAREFREE = [2, 3, 5, 6, 7, 10, 11];
const pierwWylacz: Skill = {
  id: 'pierw-wylacz',
  title: 'Wyłączanie czynnika przed pierwiastek',
  tip: ['Szukasz największego kwadratu, który dzieli liczbę pod pierwiastkiem.', '$\\sqrt{72}=\\sqrt{36\\cdot 2}=6\\sqrt{2}$'],
  generate(r) {
    const m = pick(r, SQUAREFREE.slice(0, 5));
    const k = int(r, 2, m <= 3 ? 9 : 6);
    const N = k * k * m;
    return {
      text: 'Wyłącz czynnik przed znak pierwiastka.',
      display: `\\sqrt{${N}}`,
      answer: { kind: 'input', expected: `${k}\\sqrt{${m}}`, form: 'surd' },
      solution: [`$${N} = ${k * k}\\cdot ${m}$, a $${k * k}$ to kwadrat liczby $${k}$.`, `$\\sqrt{${N}} = \\sqrt{${k * k}}\\cdot\\sqrt{${m}} = ${k}\\sqrt{${m}}$`],
      verify: { expr: `\\sqrt{${N}}` },
      distractors: [`${m}\\sqrt{${k}}`, `${k * k}\\sqrt{${m}}`, `${k}\\sqrt{${m + 1}}`, `${k + 1}\\sqrt{${m}}`],
    };
  },
};

const pierwDzialania: Skill = {
  id: 'pierw-dzialania',
  title: 'Działania na pierwiastkach',
  tip: ['Dodajesz tylko te same pierwiastki: $2\\sqrt{3}+5\\sqrt{3}=7\\sqrt{3}$, więc najpierw wyłącz czynniki.', 'Niewymierność z mianownika: $\\frac{6}{\\sqrt{3}}=\\frac{6\\sqrt{3}}{3}=2\\sqrt{3}$'],
  generate(r) {
    const type = int(r, 0, 2);
    const m = pick(r, [2, 3, 5]);
    if (type === 0) {
      // √(a²m) ± √(b²m)
      const a = int(r, 1, 5); let b = int(r, 1, 5); if (a === b) b = a + 1;
      const op = r() < 0.6 ? '+' : '-';
      const A = a * a * m, B = b * b * m;
      const c = op === '+' ? a + b : a - b;
      const sq = (k: number) => (k === 1 ? `\\sqrt{${m}}` : `${k}\\sqrt{${m}}`);
      const display = `\\sqrt{${A}} ${op} \\sqrt{${B}}`;
      return {
        text: 'Oblicz i zapisz w najprostszej postaci.', display,
        answer: { kind: 'input', expected: surdTex(q(0), q(c), m), form: 'surd' },
        solution: [`$\\sqrt{${A}} = ${sq(a)}$, $\\sqrt{${B}} = ${sq(b)}$`, `$${sq(a)} ${op} ${sq(b)} = ${surdTex(q(0), q(c), m)}$`],
        verify: { expr: display },
        distractors: [`\\sqrt{${op === '+' ? A + B : Math.abs(A - B)}}`, surdTex(q(0), q(op === '+' ? a - b : a + b), m), surdTex(q(0), q(-c), m), surdTex(q(0), q(a * b), m)],
      };
    }
    if (type === 1) {
      // a / √m  → rationalize
      const k = int(r, 1, 4) * (r() < 0.6 ? m : 1);
      const res = q(k, m);
      const display = `\\frac{${k}}{\\sqrt{${m}}}`;
      return {
        text: 'Usuń niewymierność z mianownika.', display,
        answer: { kind: 'input', expected: surdTex(q(0), res, m), form: 'surd', rationalDenominator: true },
        solution: [`Mnożymy licznik i mianownik przez $\\sqrt{${m}}$:`, `$\\frac{${k}\\cdot\\sqrt{${m}}}{\\sqrt{${m}}\\cdot\\sqrt{${m}}} = \\frac{${k}\\sqrt{${m}}}{${m}}${res.d === m ? '' : ` = ${surdTex(q(0), res, m)}`}$`],
        verify: { expr: display },
        distractors: [surdTex(q(0), q(k), m), surdTex(q(0), q(m, k), m), surdTex(q(0), q(k, m * m), m), `${q(k, m).tex()}`],
      };
    }
    // √a · √b  albo  √a / √b
    const [x, y] = pick(r, [[2, 8], [3, 12], [2, 18], [3, 27], [5, 20], [6, 24], [2, 32], [3, 15], [2, 6], [5, 10], [6, 10], [10, 15]]);
    const prod = x * y; const [k, mm] = simplifySqrt(prod);
    const display = `\\sqrt{${x}}\\cdot\\sqrt{${y}}`;
    const ans = surdTex(q(0), q(k), mm);
    return {
      text: 'Oblicz i zapisz w najprostszej postaci.', display,
      answer: { kind: 'input', expected: ans, form: 'surd' },
      solution: [`$\\sqrt{${x}}\\cdot\\sqrt{${y}} = \\sqrt{${prod}}$`, mm === 1 ? `$= ${k}$` : `$= \\sqrt{${k * k}\\cdot ${mm}} = ${ans}$`],
      verify: { expr: display },
      distractors: [`\\sqrt{${x + y}}`, surdTex(q(0), q(k + 1), mm), `${prod}`, surdTex(q(0), q(k * 2), mm)],
    };
  },
};

const potegiWym: Skill = {
  id: 'potegi-wym',
  title: 'Potęgi o wykładniku wymiernym',
  tip: ['$a^{\\frac{m}{n}}=\\sqrt[n]{a^m}$. Najpierw pierwiastek, potem potęga:', '$8^{\\frac{2}{3}}=\\left(\\sqrt[3]{8}\\right)^2=2^2=4$,  $27^{-\\frac{1}{3}}=\\frac{1}{3}$'],
  generate(r) {
    const n = pick(r, [2, 2, 3, 3, 4]);
    const b = n === 4 ? pick(r, [2, 3]) : n === 3 ? int(r, 2, 4) : int(r, 2, 9);
    const a = b ** n;
    let m = intNZ(r, -3, 3);
    if (m % n === 0) m = m > 0 ? m + 1 : m - 1;
    if (Math.abs(b ** Math.abs(m)) > 1000) m = Math.sign(m);
    const res = q(b).pow(m);
    const mq = q(m, n);
    const expTex = mq.tex();
    const display = `${a}^{${expTex}}`;
    return {
      text: 'Oblicz.', display, answer: num(res.tex()),
      solution: [`$\\sqrt${n === 2 ? '' : `[${n}]`}{${a}} = ${b}$`, `$${display} = ${b}^{${m}} = ${res.tex()}$`],
      verify: { expr: display },
      distractors: [q(b).pow(-m).tex(), q(a).mul(mq).tex(), q(b * m).tex(), q(a, n).tex()],
    };
  },
};

const logarytmy: Skill = {
  id: 'logarytmy',
  title: 'Logarytmy',
  tip: ['$\\log_a b = c$ znaczy $a^c = b$. Pytasz: do której potęgi podnieść $a$, żeby wyszło $b$?', '$\\log_a x + \\log_a y = \\log_a(xy)$,  $\\log_a x - \\log_a y = \\log_a\\frac{x}{y}$'],
  generate(r) {
    const type = int(r, 0, 2);
    const a = pick(r, [2, 3, 5, 10, 2, 3]);
    const maxK = a === 2 ? 6 : a === 3 ? 4 : 3;
    if (type === 0) {
      const k = int(r, -2, maxK);
      const arg = q(a).pow(k);
      const display = `\\log_{${a}} ${arg.d === 1 ? arg.tex() : `\\left(${arg.tex()}\\right)`}`;
      return {
        text: 'Oblicz.', display, answer: num(`${k}`),
        solution: [`$${a}^{${k}} = ${arg.tex()}$`, `więc $${display} = ${k}$`],
        verify: { expr: display },
        distractors: [`${-k}`, `${k + 1}`, q(arg.n * arg.d, a).tex(), `${k - 1}`],
      };
    }
    // log x ± log y
    const plus = type === 1;
    let x: number, y: number, k: number, b: number;
    if (plus) {
      b = pick(r, [6, 10, 12, 15, 20, 6, 10]);
      k = b <= 10 ? int(r, 1, 2) : 1;
      const total = b ** k;
      const cand: number[] = [];
      for (let d = 2; d < total; d++) if (total % d === 0 && !isPowerOf(d, b) && !isPowerOf(total / d, b)) cand.push(d);
      x = pick(r, cand); y = total / x;
    } else {
      b = a;
      k = int(r, 1, maxK);
      y = pick(r, a === 10 ? [2, 4, 5, 20, 25] : a === 2 ? [3, 5, 6, 7] : [2, 4, 7]);
      x = y * a ** k;
    }
    const display = plus ? `\\log_{${b}} ${x} + \\log_{${b}} ${y}` : `\\log_{${b}} ${x} - \\log_{${b}} ${y}`;
    const inner = plus ? x * y : x / y;
    return {
      text: 'Oblicz.', display, answer: num(`${k}`),
      solution: [`$${display} = \\log_{${b}} ${plus ? `(${x}\\cdot ${y})` : `\\frac{${x}}{${y}}`} = \\log_{${b}} ${inner}$`, `$${b}^{${k}} = ${inner}$, więc wynik to $${k}$.`],
      verify: { expr: display },
      distractors: [`${k + 1}`, `${-k}`, `${inner}`, `${k - 1 === 0 ? k + 2 : k - 1}`],
    };
  },
};
function isPowerOf(n: number, a: number) { while (n > 1 && n % a === 0) n /= a; return n === 1; }

const procenty: Skill = {
  id: 'procenty',
  title: 'Procenty',
  tip: ['$p\\%$ liczby $x$ to $\\frac{p}{100}\\cdot x$.', 'Podwyżka o $20\\%$ to mnożenie przez $1{,}2$, obniżka o $20\\%$ to mnożenie przez $0{,}8$.'],
  generate(r) {
    const type = int(r, 0, 3);
    const dec = (v: Q) => decTex(v);
    if (type === 0) {
      const pc = pick(r, [5, 10, 12, 15, 20, 25, 30, 40, 75, 120, 150, 2, 4]);
      const x = pick(r, [40, 60, 80, 120, 150, 200, 240, 250, 300, 360, 400, 450, 500, 800, 1200]);
      const res = q(pc * x, 100);
      return {
        text: `Oblicz $${pc}\\%$ liczby $${x}$.`,
        answer: num(dec(res)),
        solution: [`$\\frac{${pc}}{100}\\cdot ${x} = ${dec(res)}$`],
        verify: { expr: `\\frac{${pc}}{100}\\cdot ${x}` },
        distractors: [dec(q(x * 100, pc)), dec(res.mul(q(10))), dec(q(x + pc)), dec(res.div(q(10)))],
      };
    }
    if (type === 1) {
      const b = pick(r, [20, 25, 40, 50, 80, 120, 160, 200, 250, 400]);
      const pc = pick(r, [5, 10, 15, 20, 25, 30, 40, 60, 75, 80, 120, 150]);
      const a = (pc * b) / 100;
      if (!Number.isInteger(a)) return procenty.generate(r);
      return {
        text: `Jakim procentem liczby $${b}$ jest liczba $${a}$?`,
        answer: { ...num(`${pc}`), suffix: '\\%' },
        solution: [`$\\frac{${a}}{${b}}\\cdot 100\\% = ${pc}\\%$`],
        verify: { expr: `\\frac{${a}}{${b}}\\cdot 100` },
        distractors: [dec(q(b * 100, a)), dec(q(pc, 10)), `${pc + 10}`, `${100 - pc}`],
      };
    }
    // podwyżka / obniżka
    const price = pick(r, [80, 120, 150, 200, 250, 400, 500, 600, 800, 1000]);
    const up = pick(r, [10, 20, 25, 50]);
    const down = pick(r, [10, 20, 25, 50]);
    const res = q(price).mul(q(100 + up, 100)).mul(q(100 - down, 100));
    if (!Number.isInteger(res.value * 100)) return procenty.generate(r);
    return {
      text: `Cenę $${price}$ zł podniesiono o $${up}\\%$, a potem nową cenę obniżono o $${down}\\%$. Ile wynosi cena końcowa (w zł)?`,
      answer: { ...num(dec(res)), suffix: '\\text{ zł}' },
      solution: [`Po podwyżce: $${price}\\cdot ${dec(q(100 + up, 100))} = ${dec(q(price).mul(q(100 + up, 100)))}$`, `Po obniżce: $${dec(q(price).mul(q(100 + up, 100)))}\\cdot ${dec(q(100 - down, 100))} = ${dec(res)}$`],
      verify: { expr: `${price}\\cdot\\frac{${100 + up}}{100}\\cdot\\frac{${100 - down}}{100}` },
      distractors: [dec(q(price * (100 + up - down), 100)), `${price}`, dec(q(price).mul(q(100 - up + down, 100))), dec(res.add(q(10)))],
    };
  },
};

/** Liczba wymierna jako dziesiętna z przecinkiem (gdy skończona), inaczej ułamek */
export function decTex(v: Q): string {
  let d = v.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5;
  if (d !== 1) return v.tex();
  const s = String(Math.round(v.value * 1e6) / 1e6);
  return s.replace('.', '{,}');
}

export const dzial1: Dzial = {
  id: 'liczby',
  num: 1,
  title: 'Liczby rzeczywiste',
  skills: [ulamkiDod, ulamkiMnoz, potegiCalk, potegiWym, pierwWylacz, pierwDzialania, logarytmy, procenty],
};
export type { Task };
