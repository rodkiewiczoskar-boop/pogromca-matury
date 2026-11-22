// Zadania otwarte próbnej matury (2, 4 i 5 punktów) z schematem punktowania wzorowanym na kluczach CKE.
import type { InputAnswer } from '../math/check';
import { linTex, p, polyTex, q, Q, simplifySqrt, surdTex } from '../math/latex';
import { int, intNZ, pick, Rng } from '../math/rng';
import { dzial3 } from '../content/dzialy3';

export interface OpenPart {
  label?: string;          // np. "a ="
  answer: InputAnswer;
  verify: { expr: string; vars?: string[] };
  verifyFn?: () => number;
  verifyFnExpect?: number;
  verifyRoots?: boolean;
  verifyIneq?: '<' | '<=' | '>' | '>=';
}
export interface SchemeLevel { pts: number; desc: string }
export interface OpenTask {
  id: string;
  points: number;
  text: string;
  display?: string;
  /** Puste dla zadań na dowodzenie: wtedy tylko samoocena wg klucza */
  parts: OpenPart[];
  scheme: SchemeLevel[];
  solution: string[];
}

const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25]];
const num = (expected: string): InputAnswer => ({ kind: 'input', expected, form: 'number' });

/* ── 2 punkty ── */

export function openNierownosc(r: Rng): OpenTask {
  const sk = dzial3.skills.find((s) => s.id === 'nier-kwadr')!;
  const t = sk.generate(r);
  const zeros = /x_1 = (-?\d+)\$, \$x_2 = (-?\d+)/.exec(t.solution[0]);
  return {
    id: 'o-nier', points: 2, text: 'Rozwiąż nierówność. Wynik zapisz jako przedział lub sumę przedziałów.', display: t.display,
    parts: [{ answer: t.answer, verify: t.verify, verifyIneq: t.verifyIneq }],
    scheme: [
      { pts: 1, desc: `Obliczenie lub podanie pierwiastków trójmianu: $x_1 = ${zeros?.[1]}$, $x_2 = ${zeros?.[2]}$ (albo zaznaczenie ich na osi i szkic paraboli).` },
      { pts: 2, desc: `Podanie zbioru rozwiązań: $${t.answer.expected}$.` },
    ],
    solution: t.solution,
  };
}

export function openRownanie(r: Rng): OpenTask {
  let a = intNZ(r, -6, 6), b = int(r, 1, 6);
  if (Math.abs(a) === b) b = b === 6 ? 5 : b + 1;
  // (x + a)(x^2 - b^2) = x^3 + a x^2 - b^2 x - a b^2
  const co = [-a * b * b, -b * b, a, 1];
  const roots = [-a, b, -b];
  const display = `${polyTex(co)} = 0`;
  const g = `x^2\\left(${linTex(1, a)}\\right) - ${b * b}\\left(${linTex(1, a)}\\right)`;
  return {
    id: 'o-rown', points: 2, text: 'Rozwiąż równanie. Wszystkie rozwiązania oddziel średnikiem.', display,
    parts: [{ label: 'x \\in \\{', answer: { kind: 'input', expected: roots.join('; '), form: 'list', suffix: '\\}' }, verify: { expr: polyTex(co), vars: ['x'] }, verifyRoots: true }],
    scheme: [
      { pts: 1, desc: `Zapisanie lewej strony w postaci iloczynu, np. $\\left(${linTex(1, a)}\\right)\\left(x^2 - ${b * b}\\right)$ albo $\\left(${linTex(1, a)}\\right)(x-${b})(x+${b})$.` },
      { pts: 2, desc: `Podanie wszystkich rozwiązań: $x = ${-a}$, $x = ${b}$, $x = ${-b}$.` },
    ],
    solution: [`Grupujemy wyrazy: $${display.replace(' = 0', '')} = ${g}$`, `$= \\left(${linTex(1, a)}\\right)\\left(x^2 - ${b * b}\\right) = \\left(${linTex(1, a)}\\right)(x - ${b})(x + ${b})$`, `Iloczyn jest zerem, gdy któryś czynnik jest zerem: $x = ${-a}$ lub $x = ${b}$ lub $x = ${-b}$.`],
  };
}

export function openDowod(r: Rng): OpenTask {
  const type = int(r, 0, 3);
  if (type === 0) {
    const k = int(r, 2, 7);
    return {
      id: 'o-dowod', points: 2, parts: [],
      text: `Wykaż, że dla dowolnych liczb rzeczywistych $x$ i $y$ prawdziwa jest nierówność $x^2 + ${k * k}y^2 \\ge ${2 * k}xy$.`,
      scheme: [
        { pts: 1, desc: `Przeniesienie wszystkiego na jedną stronę i zapisanie lewej strony jako kwadratu: $x^2 - ${2 * k}xy + ${k * k}y^2 = (x - ${k}y)^2$.` },
        { pts: 2, desc: `Pełne uzasadnienie: $(x - ${k}y)^2 \\ge 0$ dla dowolnych $x, y$, więc nierówność jest prawdziwa.` },
      ],
      solution: [`Nierówność jest równoważna $x^2 - ${2 * k}xy + ${k * k}y^2 \\ge 0$.`, `Lewa strona to $(x - ${k}y)^2$ (wzór na kwadrat różnicy).`, 'Kwadrat liczby rzeczywistej jest nieujemny, co kończy dowód.'],
    };
  }
  if (type === 1) {
    const a = intNZ(r, -6, 6), c = int(r, 1, 9);
    const co = [a * a + c, -2 * a, 1];
    return {
      id: 'o-dowod', points: 2, parts: [],
      text: `Wykaż, że dla każdej liczby rzeczywistej $x$ prawdziwa jest nierówność $${polyTex(co)} > 0$.`,
      scheme: [
        { pts: 1, desc: `Zapisanie trójmianu w postaci kanonicznej $(${linTex(1, -a)})^2 + ${c}$ albo obliczenie $\\Delta = ${4 * a * a - 4 * (a * a + c)} < 0$.` },
        { pts: 2, desc: `Pełne uzasadnienie: kwadrat jest nieujemny, więc suma z $${c}$ jest dodatnia (albo: $\\Delta<0$ i $a=1>0$, więc parabola leży nad osią).` },
      ],
      solution: [`$${polyTex(co)} = \\left(${linTex(1, -a)}\\right)^2 + ${c}$`, `$\\left(${linTex(1, -a)}\\right)^2 \\ge 0$, więc całe wyrażenie jest $\\ge ${c} > 0$.`],
    };
  }
  if (type === 2) {
    return {
      id: 'o-dowod', points: 2, parts: [],
      text: 'Wykaż, że suma kwadratów trzech kolejnych liczb całkowitych przy dzieleniu przez $3$ daje resztę $2$.',
      scheme: [
        { pts: 1, desc: 'Zapisanie sumy, np. $(n-1)^2 + n^2 + (n+1)^2$, i doprowadzenie do postaci $3n^2 + 2$.' },
        { pts: 2, desc: 'Pełne uzasadnienie: $3n^2$ jest podzielne przez $3$, więc reszta z dzielenia sumy przez $3$ to $2$.' },
      ],
      solution: ['Trzy kolejne liczby całkowite: $n-1$, $n$, $n+1$.', '$(n-1)^2 + n^2 + (n+1)^2 = n^2 - 2n + 1 + n^2 + n^2 + 2n + 1 = 3n^2 + 2$', '$3n^2$ dzieli się przez $3$, więc reszta wynosi $2$.'],
    };
  }
  const k = int(r, 2, 6);
  return {
    id: 'o-dowod', points: 2, parts: [],
    text: `Wykaż, że dla każdej liczby całkowitej $n$ liczba $(n + ${k})^2 - (n - ${k})^2$ jest podzielna przez $${4 * k}$.`,
    scheme: [
      { pts: 1, desc: `Przekształcenie wyrażenia do postaci $${4 * k}n$ (np. ze wzoru na różnicę kwadratów lub po rozwinięciu nawiasów).` },
      { pts: 2, desc: `Pełne uzasadnienie: $${4 * k}n$ jest podzielne przez $${4 * k}$, bo $n$ jest całkowite.` },
    ],
    solution: [`$(n + ${k})^2 - (n - ${k})^2 = (n + ${k} - n + ${k})(n + ${k} + n - ${k}) = ${2 * k}\\cdot 2n = ${4 * k}n$`, `$n$ jest liczbą całkowitą, więc $${4 * k}n$ dzieli się przez $${4 * k}$.`],
  };
}

export function openCiag(r: Rng): OpenTask {
  // (2r x^2 + q1, r x^2 + s, t x + u) arytmetyczny ⇒ 2s = q1 + t x + u
  const rr = pick(r, [1, 2, -1, 3]);
  const x = intNZ(r, -6, 6), t = intNZ(r, -5, 5);
  const q1 = int(r, -9, 9), u = int(r, -9, 9);
  const twoS = q1 + t * x + u;
  if (twoS % 2) return openCiag(r);
  const s = twoS / 2;
  const A = polyTex([q1, 0, 2 * rr]), B = polyTex([s, 0, rr]), C = linTex(t, u);
  return {
    id: 'o-ciag', points: 2,
    text: `Liczby $${A}$, $${B}$, $${C}$ (w podanej kolejności) są pierwszym, drugim i trzecim wyrazem ciągu arytmetycznego. Oblicz $x$.`,
    parts: [{ label: 'x =', answer: num(`${x}`), verify: { expr: `\\frac{${2 * s - q1 - u}}{${t}}` }, verifyFn: () => { const a = 2 * rr * x * x + q1, b = rr * x * x + s, c = t * x + u; return 2 * b - a - c === 0 ? x : NaN; } }],
    scheme: [
      { pts: 1, desc: `Zapisanie warunku na ciąg arytmetyczny: $2\\left(${B}\\right) = ${A} + ${C}$.` },
      { pts: 2, desc: `Obliczenie $x = ${x}$.` },
    ],
    solution: [`Środkowy wyraz to średnia sąsiednich: $2\\left(${B}\\right) = ${A} + ${C}$`, `$${polyTex([2 * s, 0, 2 * rr])} = ${polyTex([q1 + u, t, 2 * rr])}$`, `$${2 * s - q1 - u} = ${t}x$, więc $x = ${x}$`],
  };
}

export function openPrawd(r: Rng): OpenTask {
  const m = int(r, 4, 7), n = int(r, 5, 9), k = pick(r, [3, 4, 5, 6, 11]);
  let fav = 0; const favList: string[] = [];
  for (let a = 1; a <= m; a++) for (let b = 1; b <= n; b++) if ((10 * a + b) % k === 0 && b <= 9) { fav++; favList.push(`${10 * a + b}`); }
  if (fav === 0) return openPrawd(r);
  const P = q(fav, m * n);
  return {
    id: 'o-prawd', points: 2,
    text: `W pierwszym pudełku są kule z numerami od $1$ do $${m}$, a w drugim od $1$ do $${n}$. Losujemy po jednej kuli z każdego pudełka i tworzymy liczbę dwucyfrową: numer z pierwszego pudełka to cyfra dziesiątek, a z drugiego cyfra jedności. Oblicz prawdopodobieństwo, że otrzymana liczba jest podzielna przez $${k}$.`,
    parts: [{ label: 'P =', answer: num(P.tex()), verify: { expr: `\\frac{${fav}}{${m * n}}` }, verifyFn: () => { let c = 0; for (let a = 1; a <= m; a++) for (let b = 1; b <= n; b++) if ((10 * a + b) % k === 0) c++; return c / (m * n); } }],
    scheme: [
      { pts: 1, desc: `Obliczenie $|\\Omega| = ${m}\\cdot ${n} = ${m * n}$ albo wypisanie zdarzeń sprzyjających: $${favList.join(', ')}$ (jest ich $${fav}$).` },
      { pts: 2, desc: `Obliczenie prawdopodobieństwa: $P = \\frac{${fav}}{${m * n}}${P.d === m * n ? '' : ` = ${P.tex()}`}$.` },
    ],
    solution: [`$|\\Omega| = ${m}\\cdot ${n} = ${m * n}$`, `Liczby podzielne przez $${k}$: $${favList.join(', ')}$, czyli $${fav}$.`, `$P = \\frac{${fav}}{${m * n}}${P.d === m * n ? '' : ` = ${P.tex()}`}$`],
  };
}

export function openGeometria2(r: Rng): OpenTask {
  if (r() < 0.5) {
    const [a, b, c] = pick(r, TRIPLES);
    const h = q(a * b, c);
    return {
      id: 'o-plan', points: 2,
      text: `Przyprostokątne trójkąta prostokątnego mają długości $${a}$ i $${b}$. Oblicz wysokość tego trójkąta poprowadzoną na przeciwprostokątną.`,
      parts: [{ label: 'h =', answer: num(h.tex()), verify: { expr: `\\frac{${a}\\cdot ${b}}{\\sqrt{${a}^2+${b}^2}}` } }],
      scheme: [
        { pts: 1, desc: `Obliczenie długości przeciwprostokątnej $c = ${c}$ albo zapisanie pola na dwa sposoby: $\\frac12\\cdot ${a}\\cdot ${b} = \\frac12\\cdot c\\cdot h$.` },
        { pts: 2, desc: `Obliczenie wysokości $h = ${h.tex()}$.` },
      ],
      solution: [`$c = \\sqrt{${a}^2 + ${b}^2} = ${c}$`, `Pole: $\\frac{1}{2}\\cdot ${a}\\cdot ${b} = \\frac{1}{2}\\cdot ${c}\\cdot h$`, `$h = \\frac{${a * b}}{${c}}${h.d === c ? '' : ` = ${h.tex()}`}$`],
    };
  }
  const t = pick(r, [q(2), q(3), q(1, 2), q(3, 2), q(4), q(2, 3), q(1, 3), q(5, 2)]);
  const kk = t.add(q(t.d, t.n));
  const res = q(kk.d, kk.n);
  return {
    id: 'o-tryg', points: 2,
    text: `Kąt $\\alpha$ jest ostry i $\\operatorname{tg}\\alpha + \\frac{1}{\\operatorname{tg}\\alpha} = ${kk.tex()}$. Oblicz wartość wyrażenia $\\sin\\alpha\\cdot\\cos\\alpha$.`,
    parts: [{ answer: num(res.tex()), verify: { expr: `\\frac{${t.tex()}}{1+\\left(${t.tex()}\\right)^2}` } }],
    scheme: [
      { pts: 1, desc: 'Zapisanie lewej strony jako $\\frac{\\sin^2\\alpha + \\cos^2\\alpha}{\\sin\\alpha\\cos\\alpha}$ albo wyznaczenie $\\operatorname{tg}\\alpha$.' },
      { pts: 2, desc: `Obliczenie $\\sin\\alpha\\cos\\alpha = ${res.tex()}$.` },
    ],
    solution: [`$\\frac{\\sin\\alpha}{\\cos\\alpha} + \\frac{\\cos\\alpha}{\\sin\\alpha} = \\frac{\\sin^2\\alpha + \\cos^2\\alpha}{\\sin\\alpha\\cos\\alpha} = \\frac{1}{\\sin\\alpha\\cos\\alpha}$`, `$\\frac{1}{\\sin\\alpha\\cos\\alpha} = ${kk.tex()}$, więc $\\sin\\alpha\\cos\\alpha = ${res.tex()}$`],
  };
}

/* ── 4 punkty ── */

function lineTex(a: Q, b: Q): string {
  const ax = a.eq(q(1)) ? 'x' : a.eq(q(-1)) ? '-x' : a.d === 1 ? `${a.n}x` : `${a.n < 0 ? '-' : ''}\\frac{${Math.abs(a.n)}}{${a.d}}x`;
  if (b.n === 0) return ax;
  return `${ax} ${b.n < 0 ? '-' : '+'} ${new Q(Math.abs(b.n), b.d).tex()}`;
}

export function openSymetralna(r: Rng): OpenTask {
  let xa: number, ya: number, xb: number, yb: number;
  do { xa = int(r, -8, 8); ya = int(r, -8, 8); xb = int(r, -8, 8); yb = int(r, -8, 8); }
  while (xa === xb || ya === yb || (xa + xb) % 2 !== 0 || (ya + yb) % 2 !== 0);
  const S = [(xa + xb) / 2, (ya + yb) / 2];
  const m = q(yb - ya, xb - xa);
  const k = q(-m.d, m.n);
  const b = q(S[1]).sub(k.mul(q(S[0])));
  const ans = `y = ${lineTex(k, b)}`;
  return {
    id: 'o-anal', points: 4,
    text: `Dane są punkty $A = (${xa}; ${ya})$ i $B = (${xb}; ${yb})$. Wyznacz równanie symetralnej odcinka $AB$. Zapisz je w postaci $y = ax + b$.`,
    parts: [{ answer: { kind: 'input', expected: ans, form: 'polynomial', vars: ['x'] }, verify: { expr: `${k.tex()}x + ${b.texP()}`, vars: ['x'] },
      verifyFn: () => { // punkt symetralnej jest równoodległy od A i B
        const x = 1.37, y = k.value * x + b.value; return Math.hypot(x - xa, y - ya) - Math.hypot(x - xb, y - yb); }, verifyFnExpect: 0 }],
    scheme: [
      { pts: 1, desc: `Obliczenie współrzędnych środka odcinka: $S = (${S[0]}; ${S[1]})$.` },
      { pts: 2, desc: `Obliczenie współczynnika kierunkowego prostej $AB$: $a_{AB} = ${m.tex()}$ (i środek $S$).` },
      { pts: 3, desc: `Wyznaczenie współczynnika kierunkowego symetralnej: $a = ${k.tex()}$ (prostopadła do $AB$, przez $S$).` },
      { pts: 4, desc: `Podanie równania symetralnej: $${ans}$.` },
    ],
    solution: [`Środek: $S = \\left(\\frac{${xa} + ${p(xb)}}{2}; \\frac{${ya} + ${p(yb)}}{2}\\right) = (${S[0]}; ${S[1]})$`, `$a_{AB} = \\frac{${yb} - ${p(ya)}}{${xb} - ${p(xa)}} = ${m.tex()}$`, `Symetralna jest prostopadła do $AB$: $a = -\\frac{1}{${m.tex()}} = ${k.tex()}$`, `Przechodzi przez $S$: $${S[1]} = ${k.tex()}\\cdot ${p(S[0])} + b$, więc $b = ${b.tex()}$`, `$${ans}$`],
  };
}

export function openStereo(r: Rng): OpenTask {
  const a = pick(r, [2, 4, 6, 8, 10]);
  const ang = pick(r, [30, 45, 60]);
  // H = (a√2/2)·tg α
  const half = q(a, 2);
  let Htex: string, Vtex: string, Hval: [Q, number];
  if (ang === 45) Hval = [half, 2];
  else if (ang === 60) Hval = [half, 6];
  else Hval = [half.mul(q(1, 3)), 6];
  const [hk, hm] = simplifySqrt(Hval[1]);
  Htex = surdTex(q(0), Hval[0].mul(q(hk)), hm);
  Vtex = surdTex(q(0), q(a * a, 3).mul(Hval[0]).mul(q(hk)), hm);
  const rad: Record<number, string> = { 30: '\\frac{\\pi}{6}', 45: '\\frac{\\pi}{4}', 60: '\\frac{\\pi}{3}' };
  return {
    id: 'o-stereo', points: 4,
    text: `Podstawą ostrosłupa prawidłowego czworokątnego jest kwadrat o boku $${a}$. Krawędź boczna tworzy z płaszczyzną podstawy kąt $${ang}^\\circ$. Oblicz objętość tego ostrosłupa.`,
    parts: [{ label: 'V =', answer: { kind: 'input', expected: Vtex, form: 'surd' }, verify: { expr: `\\frac{1}{3}\\cdot ${a}^2\\cdot\\frac{${a}\\sqrt{2}}{2}\\tan\\left(${rad[ang]}\\right)` } }],
    scheme: [
      { pts: 1, desc: `Obliczenie przekątnej podstawy $${a}\\sqrt{2}$ lub jej połowy $${surdTex(q(0), half, 2)}$.` },
      { pts: 2, desc: `Zauważenie, że w trójkącie z wysokością $H$, połową przekątnej i krawędzią boczną kąt przy podstawie to $${ang}^\\circ$, i zapisanie zależności, np. $\\operatorname{tg} ${ang}^\\circ = \\frac{H}{${surdTex(q(0), half, 2)}}$.` },
      { pts: 3, desc: `Obliczenie wysokości $H = ${Htex}$.` },
      { pts: 4, desc: `Obliczenie objętości $V = ${Vtex}$.` },
    ],
    solution: [`Przekątna podstawy: $${a}\\sqrt{2}$, jej połowa: $${surdTex(q(0), half, 2)}$.`, `$\\operatorname{tg} ${ang}^\\circ = \\frac{H}{${surdTex(q(0), half, 2)}}$, więc $H = ${Htex}$`, `$V = \\frac{1}{3}\\cdot ${a * a}\\cdot ${Htex} = ${Vtex}$`],
  };
}

/* ── 5 punktów ── */

export function openKwadratowa(r: Rng): OpenTask {
  const h = pick(r, [1, 2, 3, 4, 6]);
  const x1 = int(r, -6, 4), x2 = x1 + 2 * h;
  const a = pick(r, [q(-1), q(-2), q(-1, 2), q(-1, 4), q(-3), q(-1, 3)]);
  const M = a.neg().mul(q(h * h));
  if (!M.isInt()) return openKwadratowa(r);
  const b = a.neg().mul(q(x1 + x2)), c = a.mul(q(x1 * x2));
  const pp = (x1 + x2) / 2;
  return {
    id: 'o-kwadr', points: 5,
    text: `Funkcja kwadratowa $f(x) = ax^2 + bx + c$ przyjmuje wartości dodatnie wtedy i tylko wtedy, gdy $x \\in (${x1}; ${x2})$. Największa wartość funkcji $f$ jest równa $${M.tex()}$. Oblicz współczynniki $a$, $b$ i $c$.`,
    parts: [
      { label: 'a =', answer: num(a.tex()), verify: { expr: `-\\frac{${M.tex()}}{${h}^2}` } },
      { label: 'b =', answer: num(b.tex()), verify: { expr: `\\frac{${M.tex()}}{${h}^2}\\cdot(${x1}+${x2})` } },
      { label: 'c =', answer: num(c.tex()), verify: { expr: `-\\frac{${M.tex()}}{${h}^2}\\cdot(${x1})\\cdot(${x2})` },
        verifyFn: () => { const f = (x: number) => a.value * x * x + b.value * x + c.value; return Math.abs(f(x1)) + Math.abs(f(x2)) + Math.abs(f(pp) - M.value) < 1e-9 ? c.value : NaN; } },
    ],
    scheme: [
      { pts: 1, desc: `Zauważenie, że $${x1}$ i $${x2}$ to miejsca zerowe, a ramiona paraboli są skierowane w dół ($a<0$), albo że $q = ${M.tex()}$.` },
      { pts: 2, desc: `Zapisanie postaci iloczynowej $f(x) = a(x ${x1 < 0 ? '+' : '-'} ${Math.abs(x1)})(x ${x2 < 0 ? '+' : '-'} ${Math.abs(x2)})$ albo wyznaczenie wierzchołka $W = (${pp}; ${M.tex()})$.` },
      { pts: 3, desc: `Zapisanie równania z jedną niewiadomą $a$, np. $f(${pp}) = ${M.tex()}$.` },
      { pts: 4, desc: `Obliczenie $a = ${a.tex()}$.` },
      { pts: 5, desc: `Obliczenie wszystkich współczynników: $a = ${a.tex()}$, $b = ${b.tex()}$, $c = ${c.tex()}$.` },
    ],
    solution: [
      `Funkcja jest dodatnia tylko między $${x1}$ a $${x2}$, więc to miejsca zerowe i $a < 0$: $f(x) = a(x ${x1 < 0 ? '+' : '-'} ${Math.abs(x1)})(x ${x2 < 0 ? '+' : '-'} ${Math.abs(x2)})$`,
      `Wierzchołek leży w połowie między miejscami zerowymi: $p = ${pp}$, a największa wartość to $f(${pp}) = ${M.tex()}$.`,
      `$a\\cdot ${p(pp - x1)}\\cdot ${p(pp - x2)} = ${M.tex()}$, więc $a = ${a.tex()}$`,
      `$f(x) = ${a.tex()}\\left(x^2 ${-(x1 + x2) < 0 ? '-' : '+'} ${Math.abs(x1 + x2)}x ${x1 * x2 < 0 ? '-' : '+'} ${Math.abs(x1 * x2)}\\right)$, więc $b = ${b.tex()}$, $c = ${c.tex()}$`,
    ],
  };
}

export const OPEN_BLUEPRINT: ((r: Rng) => OpenTask)[] = [openNierownosc, openRownanie, openDowod, openCiag, openGeometria2, openPrawd, openSymetralna, openStereo, openKwadratowa];

