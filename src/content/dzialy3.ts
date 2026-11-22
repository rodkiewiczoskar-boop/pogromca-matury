// Działy 3–5: równania i nierówności, funkcje, ciągi
import { linTex, p, polyMul, polyTex, q, Q } from '../math/latex';
import { int, intNZ, pick } from '../math/rng';
import type { Dzial, Skill } from './types';

const num = (expected: string) => ({ kind: 'input' as const, expected, form: 'number' as const });
export const ivTex = (lo: Q | null, hi: Q | null, loC: boolean, hiC: boolean) =>
  `${lo === null ? '\\left(-\\infty' : loC ? `\\left\\langle ${lo.tex()}` : `\\left(${lo.tex()}`}; ${hi === null ? '\\infty\\right)' : hiC ? `${hi.tex()}\\right\\rangle` : `${hi.tex()}\\right)`}`;
const relTex: Record<string, string> = { '<': '<', '<=': '\\le', '>': '>', '>=': '\\ge' };

/* ───────── Dział 3 ───────── */

const nierLiniowa: Skill = {
  id: 'nier-liniowa',
  title: 'Nierówności liniowe',
  tip: ['Przenieś $x$ na jedną stronę, liczby na drugą.', 'Dzieląc przez liczbę ujemną, odwracasz znak nierówności: $-2x<6 \\Rightarrow x>-3$'],
  generate(r) {
    // a x + b  <  c x + d, a > c, rozwiązanie x < K
    let a: number, c: number, b: number, d: number, K: Q;
    do { a = intNZ(r, -5, 7); c = intNZ(r, -5, 7); b = int(r, -12, 12); d = int(r, -12, 24); } while (a <= c || (K = q(d - b, a - c)).value <= 1.2 || K.value > 12);
    const strict = r() < 0.5;
    const rel = strict ? '<' : '\\le';
    const count = K.isInt() ? (strict ? K.value - 1 : K.value) : Math.floor(K.value);
    const lhs = linTex(a, b), rhs = linTex(c, d);
    return {
      text: `Ile liczb całkowitych dodatnich spełnia nierówność $${lhs} ${rel} ${rhs}$?`,
      answer: num(`${count}`),
      solution: [`$${a}x ${c < 0 ? '+' : '-'} ${Math.abs(c)}x ${rel} ${d} ${b < 0 ? '+' : '-'} ${Math.abs(b)}$`, `$${a - c}x ${rel} ${d - b}$, więc $x ${rel} ${K.tex()}$`, `Liczby całkowite dodatnie: od $1$ do $${count}$, czyli jest ich $${count}$.`],
      verify: { expr: `${count}` },
      verifyFn: () => { let n = 0; for (let x = 1; x < 100; x++) { const L = a * x + b, R = c * x + d; if (strict ? L < R : L <= R) n++; } return n; },
      distractors: [`${count + 1}`, `${Math.max(0, count - 1)}`, `${count + 2}`, `${Math.ceil(K.value) + 1}`],
    };
  },
};

const uklad: Skill = {
  id: 'uklad',
  title: 'Układy równań',
  tip: ['Wyznacz jedną niewiadomą z prostszego równania i wstaw do drugiego.', 'Albo dodaj równania stronami tak, żeby jedna niewiadoma się skróciła.'],
  generate(r) {
    const x = int(r, -6, 6), y = int(r, -6, 6);
    let a1: number, b1: number, a2: number, b2: number;
    do { a1 = intNZ(r, -4, 5); b1 = intNZ(r, -4, 5); a2 = intNZ(r, -4, 5); b2 = intNZ(r, -4, 5); } while (a1 * b2 - a2 * b1 === 0);
    const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
    const eq = (a: number, b: number, c: number) => `${a === 1 ? '' : a === -1 ? '-' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${c}`;
    const askX = r() < 0.5;
    const ans = askX ? x : y;
    return {
      text: `Para liczb $(x; y)$ jest rozwiązaniem układu równań. Oblicz $${askX ? 'x' : 'y'}$.`,
      display: `\\begin{cases} ${eq(a1, b1, c1)} \\\\ ${eq(a2, b2, c2)} \\end{cases}`,
      answer: { ...num(`${ans}`), prefix: askX ? 'x =' : 'y =' },
      solution: [`Rozwiązanie układu: $x = ${x}$, $y = ${y}$.`, `Sprawdzenie: $${a1}\\cdot ${p(x)} ${b1 < 0 ? '-' : '+'} ${Math.abs(b1)}\\cdot ${p(y)} = ${c1}$ oraz $${a2}\\cdot ${p(x)} ${b2 < 0 ? '-' : '+'} ${Math.abs(b2)}\\cdot ${p(y)} = ${c2}$.`],
      verify: { expr: askX ? `\\frac{${c1 * b2 - c2 * b1}}{${a1 * b2 - a2 * b1}}` : `\\frac{${a1 * c2 - a2 * c1}}{${a1 * b2 - a2 * b1}}` },
      distractors: [`${askX ? y : x}`, `${-ans}`, `${ans + 1}`, `${ans - 2}`],
    };
  },
};

const rownWymierne: Skill = {
  id: 'rown-wymierne',
  title: 'Równania z ułamkiem',
  tip: ['Najpierw dziedzina: mianownik nie może być zerem.', 'Potem mnożysz obie strony przez mianownik: $\\frac{x-1}{x+2}=3 \\Rightarrow x-1=3(x+2)$'],
  generate(r) {
    let a: number, b: number, c: number, x: Q;
    do { a = intNZ(r, -8, 8); b = intNZ(r, -8, 8); c = intNZ(r, -4, 5); } while (c === 1 || (x = q(a + c * b, 1 - c)).value === -b || !x.isInt() && x.d > 5);
    const display = `\\frac{${linTex(1, -a)}}{${linTex(1, b)}} = ${c}`;
    return {
      text: 'Rozwiąż równanie.',
      display,
      answer: { ...num(x!.tex()), prefix: 'x =' },
      solution: [`Dziedzina: $x \\ne ${-b}$.`, `$${linTex(1, -a)} = ${c}\\left(${linTex(1, b)}\\right)$`, `$x - ${p(c)}x = ${c * b} + ${p(a)}$, czyli $${1 - c}x = ${a + c * b}$, więc $x = ${x!.tex()}$`],
      verify: { expr: `\\frac{${a + c * b}}{${1 - c}}` },
      verifyFn: () => { const v = x!.value; return (v - a) / (v + b) - c; },
      verifyFnExpect: 0,
      distractors: [q(a - c * b, 1 - c).tex(), q(a + c * b, c - 1).tex(), `${-b}`, `${a}`],
    };
  },
};

const rownKwadr: Skill = {
  id: 'rown-kwadr',
  noChoice: true,
  title: 'Równania kwadratowe',
  tip: ['$\\Delta = b^2-4ac$,  $x_{1,2}=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}$', 'Wpisz wszystkie rozwiązania oddzielone średnikiem, np. $2; -\\frac{1}{3}$'],
  generate(r) {
    // (p1 x - q1)(p2 x - q2) = 0
    const p1 = pick(r, [1, 1, 1, 2, 3]), p2 = pick(r, [1, 1, 2]);
    let q1 = intNZ(r, -7, 7), q2 = intNZ(r, -7, 7);
    if (q1 * p2 === q2 * p1) q2 = q2 + 1 || 1;
    const co = polyMul([-q1, p1], [-q2, p2]);
    const x1 = q(q1, p1), x2 = q(q2, p2);
    const a = co[2], b = co[1], c = co[0];
    const D = b * b - 4 * a * c;
    return {
      text: 'Rozwiąż równanie. Rozwiązania oddziel średnikiem.',
      display: `${polyTex(co)} = 0`,
      answer: { kind: 'input', expected: `${x1.tex()}; ${x2.tex()}`, form: 'list', prefix: 'x \\in \\{' , suffix: '\\}' },
      solution: [`$\\Delta = ${p(b)}^2 - 4\\cdot ${p(a)}\\cdot ${p(c)} = ${D}$, $\\sqrt{\\Delta} = ${Math.sqrt(D)}$`, `$x_1 = \\frac{${-b} - ${Math.sqrt(D)}}{${2 * a}} = ${(x1.value < x2.value ? x1 : x2).tex()}$, $x_2 = \\frac{${-b} + ${Math.sqrt(D)}}{${2 * a}} = ${(x1.value < x2.value ? x2 : x1).tex()}$`],
      verify: { expr: polyTex(co), vars: ['x'] },
      verifyRoots: true,
      distractors: [`${x1.neg().tex()}; ${x2.neg().tex()}`, `${x1.tex()}; ${x2.neg().tex()}`, `${q(q1).tex()}; ${q(q2).tex()}`, `${x1.neg().tex()}; ${x2.tex()}`],
    };
  },
};

const nierKwadr: Skill = {
  id: 'nier-kwadr',
  noChoice: true,
  title: 'Nierówności kwadratowe',
  tip: ['Znajdź miejsca zerowe, naszkicuj parabolę i odczytaj, gdzie jest nad lub pod osią.', 'Zapis: $\\left(-\\infty; 2\\right\\rangle \\cup \\left\\langle 3; \\infty\\right)$. Na klawiaturze użyj klawiszy nawiasów i $\\infty$.'],
  generate(r) {
    const s = pick(r, [1, 1, -1, 2, -2, 3]);
    let r1 = int(r, -7, 6), r2 = int(r, -6, 8);
    if (r1 === r2) r2 = r1 + int(r, 1, 4);
    const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    const co = polyMul([s], polyMul([-lo, 1], [-hi, 1]));
    const rel = pick(r, ['<', '<=', '>', '>='] as const);
    const closed = rel === '<=' || rel === '>=';
    const inside = (s > 0) === (rel === '<' || rel === '<=');
    const expected = inside ? ivTex(q(lo), q(hi), closed, closed) : `${ivTex(null, q(lo), false, closed)} \\cup ${ivTex(q(hi), null, closed, false)}`;
    return {
      text: 'Rozwiąż nierówność. Zapisz wynik jako przedział lub sumę przedziałów.',
      display: `${polyTex(co)} ${relTex[rel]} 0`,
      answer: { kind: 'input', expected, form: 'interval', prefix: 'x \\in' },
      solution: [`Miejsca zerowe: $x_1 = ${lo}$, $x_2 = ${hi}$.`, `Współczynnik przy $x^2$ jest ${s > 0 ? 'dodatni, ramiona paraboli w górę' : 'ujemny, ramiona paraboli w dół'}.`, `Odczytujemy z wykresu: $x \\in ${expected}$`],
      verify: { expr: polyTex(co), vars: ['x'] },
      verifyIneq: rel,
      distractors: [],
    };
  },
};

export const dzial3: Dzial = { id: 'rownania', num: 3, title: 'Równania i nierówności', skills: [nierLiniowa, uklad, rownWymierne, rownKwadr, nierKwadr] };

/* ───────── Dział 4 ───────── */

const fLinM: Skill = {
  id: 'f-liniowa',
  title: 'Funkcja liniowa',
  tip: ['$f(x)=ax+b$: $a$ to współczynnik kierunkowy, $b$ to punkt przecięcia z osią $y$.', 'Przez punkty $A, B$: $a=\\frac{y_B-y_A}{x_B-x_A}$. Miejsce zerowe: $f(x_0)=0$.'],
  generate(r) {
    const type = int(r, 0, 1);
    if (type === 0) {
      // f(x) = (m - a)x + b, miejsce zerowe x0 → m
      const x0 = pick(r, [-4, -3, -2, -1, 1, 2, 3, 4]);
      const k = intNZ(r, -5, 5); // współczynnik kierunkowy
      const b = -k * x0;
      const a = int(r, -4, 6);
      const m = k + a;
      return {
        text: `Funkcja $f(x) = (m ${a < 0 ? '+' : '-'} ${Math.abs(a)})x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$ ma miejsce zerowe $x = ${x0}$. Oblicz $m$.`,
        answer: { ...num(`${m}`), prefix: 'm =' },
        solution: [`$f(${x0}) = 0$: $(m ${a < 0 ? '+' : '-'} ${Math.abs(a)})\\cdot ${p(x0)} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = 0$`, `$m ${a < 0 ? '+' : '-'} ${Math.abs(a)} = ${k}$, więc $m = ${m}$`],
        verify: { expr: `${a} - \\frac{${b}}{${x0}}` },
        distractors: [`${m - 2 * a}`, `${-m}`, `${k}`, `${m + 1}`],
      };
    }
    let x1: number, x2: number, y1: number, y2: number;
    do { x1 = int(r, -6, 6); x2 = int(r, -6, 6); y1 = int(r, -8, 8); y2 = int(r, -8, 8); } while (x1 === x2 || y1 === y2);
    const a = q(y2 - y1, x2 - x1);
    return {
      text: `Wykres funkcji liniowej przechodzi przez punkty $A = (${x1}; ${y1})$ i $B = (${x2}; ${y2})$. Oblicz współczynnik kierunkowy $a$.`,
      answer: { ...num(a.tex()), prefix: 'a =' },
      solution: [`$a = \\frac{y_B - y_A}{x_B - x_A} = \\frac{${y2} - ${p(y1)}}{${x2} - ${p(x1)}} = ${a.tex()}$`],
      verify: { expr: `\\frac{${y2}-(${y1})}{${x2}-(${x1})}` },
      distractors: [q(x2 - x1, y2 - y1).tex(), a.neg().tex(), q(y2 + y1, x2 + x1 || 1).tex(), q(-(x2 - x1), y2 - y1).tex()],
    };
  },
};

const fKwadr: Skill = {
  id: 'f-kwadratowa',
  title: 'Funkcja kwadratowa',
  tip: ['Wierzchołek: $p=\\frac{-b}{2a}$, $q=f(p)$. Postać kanoniczna: $f(x)=a(x-p)^2+q$.', 'Gdy $a<0$, największa wartość to $q$. Gdy $a>0$, najmniejsza wartość to $q$.'],
  generate(r) {
    const a = pick(r, [1, -1, 2, -2, 3, -3, -1, 1]);
    const pp = intNZ(r, -5, 5), qq = int(r, -9, 9);
    const co = [a * pp * pp + qq, -2 * a * pp, a];
    const type = int(r, 0, 2);
    const f = polyTex(co);
    if (type === 0) {
      return {
        text: `Oblicz pierwszą współrzędną wierzchołka paraboli $y = ${f}$.`,
        answer: { ...num(`${pp}`), prefix: 'p =' },
        solution: [`$p = \\frac{-b}{2a} = \\frac{${-co[1]}}{${2 * a}} = ${pp}$`],
        verify: { expr: `\\frac{-(${co[1]})}{2\\cdot(${a})}` },
        distractors: [`${-pp}`, `${qq}`, `${2 * pp}`, `${-co[1]}`],
      };
    }
    if (type === 1) {
      const word = a < 0 ? 'największa' : 'najmniejsza';
      return {
        text: `Jaka jest ${word} wartość funkcji $f(x) = ${f}$?`,
        answer: num(`${qq}`),
        solution: [`$p = \\frac{-b}{2a} = ${pp}$`, `$q = f(${pp}) = ${qq}$, i to jest ${word} wartość, bo $a ${a < 0 ? '<' : '>'} 0$.`],
        verify: { expr: `${co[2]}\\cdot(${pp})^2 + (${co[1]})\\cdot(${pp}) + ${co[0]}` },
        distractors: [`${pp}`, `${-qq}`, `${co[0]}`, `${qq + a}`],
      };
    }
    // f w postaci kanonicznej → c
    return {
      text: `Funkcja $f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}\\left(${linTex(1, -pp)}\\right)^2 ${qq < 0 ? '-' : '+'} ${Math.abs(qq)}$ zapisana w postaci ogólnej to $f(x)=ax^2+bx+c$. Oblicz $c$.`,
      answer: { ...num(`${co[0]}`), prefix: 'c =' },
      solution: [`$\\left(${linTex(1, -pp)}\\right)^2 = ${polyTex(polyMul([-pp, 1], [-pp, 1]))}$`, `$f(x) = ${f}$, więc $c = ${co[0]}$`],
      verify: { expr: `${a}\\cdot(0-(${pp}))^2+(${qq})` },
      distractors: [`${pp * pp + qq}`, `${qq}`, `${a * pp * pp - qq}`, `${-co[0]}`],
    };
  },
};

export const dzial4: Dzial = { id: 'funkcje', num: 4, title: 'Funkcja liniowa i kwadratowa', skills: [fLinM, fKwadr] };

/* ───────── Dział 5 ───────── */

const ciagArytm: Skill = {
  id: 'ciag-arytm',
  title: 'Ciąg arytmetyczny',
  tip: ['$a_n = a_1 + (n-1)r$', '$S_n = \\frac{a_1+a_n}{2}\\cdot n$'],
  generate(r) {
    const a1 = int(r, -10, 15), d = intNZ(r, -6, 7);
    const type = int(r, 0, 2);
    if (type === 0) {
      const n = int(r, 8, 25);
      const an = a1 + (n - 1) * d;
      return {
        text: `W ciągu arytmetycznym $a_1 = ${a1}$ i $a_2 = ${a1 + d}$. Oblicz $a_{${n}}$.`,
        answer: num(`${an}`),
        solution: [`$r = a_2 - a_1 = ${d}$`, `$a_{${n}} = ${a1} + ${n - 1}\\cdot ${p(d)} = ${an}$`],
        verify: { expr: `${a1}+(${n}-1)\\cdot(${d})` },
        distractors: [`${a1 + n * d}`, `${a1 * n}`, `${an - d}`, `${n * d}`],
      };
    }
    if (type === 1) {
      const n = int(r, 6, 20);
      const an = a1 + (n - 1) * d;
      const S = ((a1 + an) * n) / 2;
      return {
        text: `Ciąg arytmetyczny ma $a_1 = ${a1}$ i różnicę $r = ${d}$. Oblicz sumę ${n} początkowych wyrazów.`,
        answer: num(`${S}`),
        solution: [`$a_{${n}} = ${a1} + ${n - 1}\\cdot ${p(d)} = ${an}$`, `$S_{${n}} = \\frac{${a1} + ${p(an)}}{2}\\cdot ${n} = ${S}$`],
        verify: { expr: `\\frac{2\\cdot(${a1})+(${n}-1)\\cdot(${d})}{2}\\cdot ${n}` },
        distractors: [`${(a1 + an) * n}`, `${an}`, `${S + an}`, `${((a1 + an + d) * n) / 2}`],
      };
    }
    // a_3 i a_7 → r
    const i = int(r, 2, 4), j = i + int(r, 2, 5);
    return {
      text: `W ciągu arytmetycznym $a_{${i}} = ${a1 + (i - 1) * d}$ i $a_{${j}} = ${a1 + (j - 1) * d}$. Oblicz różnicę ciągu.`,
      answer: { ...num(`${d}`), prefix: 'r =' },
      solution: [`$a_{${j}} - a_{${i}} = ${j - i}r$`, `$${(j - i) * d} = ${j - i}r$, więc $r = ${d}$`],
      verify: { expr: `\\frac{${(j - i) * d}}{${j - i}}` },
      distractors: [`${(j - i) * d}`, `${-d}`, `${a1}`, q((j - i) * d, j - i + 1).tex()],
    };
  },
};

const ciagGeom: Skill = {
  id: 'ciag-geom',
  title: 'Ciąg geometryczny',
  tip: ['$a_n = a_1\\cdot q^{n-1}$', 'Trzy liczby $a, b, c$ tworzą ciąg geometryczny, gdy $b^2 = ac$.'],
  generate(r) {
    const type = int(r, 0, 2);
    const qq = pick(r, [q(2), q(3), q(-2), q(1, 2), q(-1, 2), q(-3), q(1, 3)]);
    const a1 = pick(r, [1, 2, 3, -1, 4, 5, -2]) * (qq.d === 1 ? 1 : qq.d ** 2);
    if (type === 0) {
      const n = int(r, 4, 6);
      const an = q(a1).mul(qq.pow(n - 1));
      return {
        text: `Ciąg geometryczny ma $a_1 = ${a1}$ i iloraz $q = ${qq.tex()}$. Oblicz $a_{${n}}$.`,
        answer: num(an.tex()),
        solution: [`$a_{${n}} = ${a1}\\cdot\\left(${qq.tex()}\\right)^{${n - 1}} = ${an.tex()}$`],
        verify: { expr: `${a1}\\cdot\\left(${qq.tex()}\\right)^{${n - 1}}` },
        distractors: [q(a1).mul(qq.pow(n)).tex(), an.neg().tex(), q(a1).mul(qq).mul(q(n - 1)).tex(), q(a1).mul(qq.pow(n - 2)).tex()],
      };
    }
    if (type === 1) {
      const a2 = q(a1).mul(qq), a5 = q(a1).mul(qq.pow(4));
      return {
        text: `W ciągu geometrycznym $a_2 = ${a2.tex()}$ i $a_5 = ${a5.tex()}$. Oblicz iloraz $q$.`,
        answer: { ...num(qq.tex()), prefix: 'q =' },
        solution: [`$a_5 = a_2\\cdot q^3$, więc $q^3 = ${a5.div(a2).tex()}$`, `$q = ${qq.tex()}$`],
        verify: { expr: `\\sqrt[3]{${a5.div(a2).tex()}}` },
        distractors: [qq.neg().tex(), a5.div(a2).tex(), qq.pow(2).tex(), q(qq.d, qq.n).tex()],
      };
    }
    // (b, x, c) geometryczny, x > 0
    const b = pick(r, [1, 2, 3, 4]), k = pick(r, [2, 3, 4]);
    const c = b * k * k; const x = b * k;
    return {
      text: `Liczby $${b}, x, ${c}$ (w tej kolejności) tworzą ciąg geometryczny o wyrazach dodatnich. Oblicz $x$.`,
      answer: { ...num(`${x}`), prefix: 'x =' },
      solution: [`$x^2 = ${b}\\cdot ${c} = ${b * c}$`, `$x > 0$, więc $x = ${x}$`],
      verify: { expr: `\\sqrt{${b}\\cdot ${c}}` },
      distractors: [`${(b + c) / 2}`, `${b * c}`, `${-x}`, `${c / b}`],
    };
  },
};

const ciagWzor: Skill = {
  id: 'ciag-wzor',
  title: 'Ciąg dany wzorem',
  tip: ['Wyraz $a_n$ obliczasz, wstawiając numer $n$ do wzoru.', '$(-1)^n$ to $1$ dla parzystych $n$ i $-1$ dla nieparzystych.'],
  generate(r) {
    const type = int(r, 0, 1);
    if (type === 0) {
      const a = intNZ(r, -3, 3), b = int(r, -10, 10), c = pick(r, [1, 2, 3]);
      const n = int(r, 2, 9);
      const num0 = a * n * n + b;
      const val = q(num0, n + c);
      const f = `\\frac{${polyTex([b, 0, a], 'n')}}{n + ${c}}`;
      return {
        text: `Ciąg jest określony wzorem $a_n = ${f}$. Oblicz $a_{${n}}$.`,
        answer: num(val.tex()),
        solution: [`$a_{${n}} = \\frac{${a}\\cdot ${n}^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}}{${n} + ${c}} = \\frac{${num0}}{${n + c}}${val.d === n + c && val.n === num0 ? '' : ` = ${val.tex()}`}$`],
        verify: { expr: `\\frac{${a}\\cdot ${n}^2+(${b})}{${n}+${c}}` },
        distractors: [q(a * n + b, n + c).tex(), q(num0, n).tex(), val.neg().tex(), q(a * (n + 1) ** 2 + b, n + 1 + c).tex()],
      };
    }
    // a_n = k*(-1)^(n+1) + m, suma N pierwszych
    const k = intNZ(r, -4, 4), m = int(r, -6, 8), N = pick(r, [10, 12, 20, 15, 11]);
    let S = 0; for (let n = 1; n <= N; n++) S += k * (-1) ** (n + 1) + m;
    return {
      text: `Ciąg jest określony wzorem $a_n = ${k}\\cdot(-1)^{n+1} ${m < 0 ? '-' : '+'} ${Math.abs(m)}$. Oblicz sumę ${N} początkowych wyrazów.`,
      answer: num(`${S}`),
      solution: [`Wyrazy na zmianę: $a_1 = ${k + m}$, $a_2 = ${-k + m}$, $a_3 = ${k + m}$, ...`, `Dwa kolejne wyrazy dają razem $${2 * m}$. ${N % 2 === 0 ? `Mamy $${N / 2}$ par, więc $S = ${N / 2}\\cdot ${p(2 * m)} = ${S}$` : `Mamy $${(N - 1) / 2}$ par i jeszcze $a_{${N}} = ${k + m}$, więc $S = ${S}$`}`],
      verify: { expr: `${S}` },
      verifyFn: () => { let s = 0; for (let n = 1; n <= N; n++) s += k * Math.pow(-1, n + 1) + m; return s; },
      distractors: [`${N * m}`, `${S + k}`, `${N * (k + m)}`, `${S - 2 * k || S + 2}`],
    };
  },
};

export const dzial5: Dzial = { id: 'ciagi', num: 5, title: 'Ciągi', skills: [ciagArytm, ciagGeom, ciagWzor] };
