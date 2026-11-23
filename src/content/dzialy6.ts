// Działy 6–10: trygonometria, planimetria, geometria analityczna, stereometria, statystyka i prawdopodobieństwo
import { q, Q, simplifySqrt, surdTex } from '../math/latex';
import { int, intNZ, pick } from '../math/rng';
import { katRysunek, trojkatRysunek } from './wykresy';
import type { Dzial, Skill } from './types';

const num = (expected: string) => ({ kind: 'input' as const, expected, form: 'number' as const });
const surd = (expected: string) => ({ kind: 'input' as const, expected, form: 'surd' as const });
/** k·√n jako LaTeX, uproszczone, z opcjonalnym mianownikiem */
export const sqrtTex = (n: number, coef: Q = q(1)): string => { const [k, m] = simplifySqrt(n); return surdTex(q(0), coef.mul(q(k)), m); };
const piTex = (c: Q) => (c.d === 1 ? `${c.n === 1 ? '' : c.n === -1 ? '-' : c.n}\\pi` : `\\frac{${c.n === 1 ? '' : c.n}\\pi}{${c.d}}`);

/* ───────── Dział 6: Trygonometria ───────── */

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];

const trygSinCos: Skill = {
  id: 'tryg-sin-cos',
  title: 'Sinus, cosinus, tangens',
  tip: ['$\\sin^2\\alpha+\\cos^2\\alpha=1$,  $\\operatorname{tg}\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}$', 'Dla kąta ostrego wszystkie te wartości są dodatnie.'],
  generate(r) {
    const type = int(r, 0, 2);
    if (type === 0) {
      const [a, , c] = pick(r, TRIPLES);
      const b = Math.sqrt(c * c - a * a);
      const askTg = r() < 0.4;
      const res = askTg ? q(a, b) : q(b, c);
      return {
        text: `Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\frac{${a}}{${c}}$. Oblicz ${askTg ? '$\\operatorname{tg}\\alpha$' : '$\\cos\\alpha$'}.`,
        answer: num(res.tex()),
        solution: [`$\\cos^2\\alpha = 1 - \\left(\\frac{${a}}{${c}}\\right)^2 = \\frac{${b * b}}{${c * c}}$, więc $\\cos\\alpha = \\frac{${b}}{${c}}$`, ...(askTg ? [`$\\operatorname{tg}\\alpha = \\frac{${a}}{${c}} : \\frac{${b}}{${c}} = ${res.tex()}$`] : [])],
        verify: { expr: askTg ? `\\frac{${a}/${c}}{\\sqrt{1-(${a}/${c})^2}}` : `\\sqrt{1-\\left(\\frac{${a}}{${c}}\\right)^2}` },
        distractors: askTg ? [q(b, a).tex(), q(a, c).tex(), q(b, c).tex(), q(c, b).tex()] : [q(c - a, c).tex(), q(a, b).tex(), q(c, b).tex(), q(b, a).tex()],
      };
    }
    if (type === 1) {
      // sin = 1/k → cos = √(k²-1)/k
      const k = pick(r, [3, 4, 5, 6, 7]);
      const ans = sqrtTex(k * k - 1, q(1, k));
      return {
        text: `Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\frac{1}{${k}}$. Oblicz $\\cos\\alpha$.`,
        answer: surd(ans),
        solution: [`$\\cos^2\\alpha = 1 - \\frac{1}{${k * k}} = \\frac{${k * k - 1}}{${k * k}}$`, `$\\cos\\alpha = \\frac{\\sqrt{${k * k - 1}}}{${k}} = ${ans}$`],
        verify: { expr: `\\sqrt{1-\\frac{1}{${k * k}}}` },
        distractors: [q(k - 1, k).tex(), sqrtTex(k - 1, q(1, k)), sqrtTex(k * k + 1, q(1, k)), sqrtTex(k * k - 1)],
      };
    }
    // tg α + 1/tg α = k  → sin·cos = 1/k
    const t = pick(r, [q(2), q(3), q(1, 2), q(3, 2), q(4), q(2, 3), q(1, 3)]);
    const kk = t.add(q(t.d, t.n));
    const res = q(kk.d, kk.n);
    return {
      text: `Kąt $\\alpha$ jest ostry i $\\operatorname{tg}\\alpha + \\frac{1}{\\operatorname{tg}\\alpha} = ${kk.tex()}$. Oblicz $\\sin\\alpha\\cdot\\cos\\alpha$.`,
      answer: num(res.tex()),
      solution: [`$\\frac{\\sin\\alpha}{\\cos\\alpha} + \\frac{\\cos\\alpha}{\\sin\\alpha} = \\frac{\\sin^2\\alpha+\\cos^2\\alpha}{\\sin\\alpha\\cos\\alpha} = \\frac{1}{\\sin\\alpha\\cos\\alpha}$`, `$\\frac{1}{\\sin\\alpha\\cos\\alpha} = ${kk.tex()}$, więc $\\sin\\alpha\\cos\\alpha = ${res.tex()}$`],
      verify: { expr: `\\frac{${t.tex()}}{1+\\left(${t.tex()}\\right)^2}` },
      distractors: [kk.tex(), res.mul(q(2)).tex(), q(1, 2).eq(res) ? q(1, 4).tex() : q(1, 2).tex(), t.tex()],
    };
  },
};

const ANG: Record<number, { sin: [Q, Q, number]; cos: [Q, Q, number]; tg: [Q, Q, number] }> = {
  // [część wymierna, współczynnik, pierwiastek]
  30: { sin: [q(1, 2), q(0), 1], cos: [q(0), q(1, 2), 3], tg: [q(0), q(1, 3), 3] },
  45: { sin: [q(0), q(1, 2), 2], cos: [q(0), q(1, 2), 2], tg: [q(1), q(0), 1] },
  60: { sin: [q(0), q(1, 2), 3], cos: [q(1, 2), q(0), 1], tg: [q(0), q(1), 3] },
};
const FN_TEX: Record<string, string> = { sin: '\\sin', cos: '\\cos', tg: '\\operatorname{tg}' };
const RAD: Record<number, string> = { 30: '\\frac{\\pi}{6}', 45: '\\frac{\\pi}{4}', 60: '\\frac{\\pi}{3}' };
const FN_CE: Record<string, string> = { sin: '\\sin', cos: '\\cos', tg: '\\tan' };

const trygWartosci: Skill = {
  id: 'tryg-wartosci',
  title: 'Wartości dla 30°, 45°, 60°',
  tip: ['$\\sin 30^\\circ=\\frac12$, $\\sin 45^\\circ=\\frac{\\sqrt2}{2}$, $\\sin 60^\\circ=\\frac{\\sqrt3}{2}$', '$\\cos 60^\\circ=\\frac12$, $\\operatorname{tg}45^\\circ=1$, $\\operatorname{tg}60^\\circ=\\sqrt3$. Tablice wzorów CKE mają pełną tabelkę.'],
  generate(r) {
    // k1 * f1(A) + k2 * f2(B), z tym samym pierwiastkiem lub wymierne
    for (;;) {
      const A = pick(r, [30, 45, 60]), B = pick(r, [30, 45, 60]);
      const f1 = pick(r, ['sin', 'cos', 'tg'] as const), f2 = pick(r, ['sin', 'cos', 'tg'] as const);
      const k1 = intNZ(r, -4, 4), k2 = intNZ(r, -4, 4);
      const v1 = ANG[A][f1], v2 = ANG[B][f2];
      if (v1[2] !== 1 && v2[2] !== 1 && v1[2] !== v2[2]) continue;
      if (A === B && f1 === f2) continue;
      const m = v1[2] !== 1 ? v1[2] : v2[2];
      const rat = v1[0].mul(q(k1)).add(v2[0].mul(q(k2)));
      const coef = v1[1].mul(q(k1)).add(v2[1].mul(q(k2)));
      const ans = surdTex(rat, coef, m);
      const t = (k: number, f: string, a: number, first: boolean) => `${first ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${Math.abs(k) === 1 ? '' : Math.abs(k)}${FN_TEX[f]} ${a}^\\circ`;
      const display = t(k1, f1, A, true) + t(k2, f2, B, false);
      return {
        text: 'Oblicz wartość wyrażenia.',
        display,
        answer: surd(ans),
        solution: [`$${FN_TEX[f1]} ${A}^\\circ = ${surdTex(...v1)}$, $${FN_TEX[f2]} ${B}^\\circ = ${surdTex(...v2)}$`, `$${display} = ${ans}$`],
        verify: { expr: `${k1}${FN_CE[f1]}\\left(${RAD[A]}\\right) + (${k2})${FN_CE[f2]}\\left(${RAD[B]}\\right)` },
        distractors: [surdTex(rat.neg(), coef, m), surdTex(rat, coef.neg(), m), surdTex(rat.add(q(1)), coef, m), surdTex(coef, rat, m === 1 ? 2 : m)],
      };
    }
  },
};

export const dzial6: Dzial = { id: 'trygonometria', num: 6, title: 'Trygonometria', skills: [trygSinCos, trygWartosci, trojkatRysunek] };

/* ───────── Dział 7: Planimetria ───────── */

const katy: Skill = {
  id: 'katy-okrag',
  title: 'Kąty w okręgu',
  tip: ['Kąt wpisany jest dwa razy mniejszy od kąta środkowego opartego na tym samym łuku.', 'Kąt wpisany oparty na półokręgu jest prosty. Suma kątów w trójkącie to $180^\\circ$.'],
  generate(r) {
    const type = int(r, 0, 2);
    if (type === 0) {
      const c = 2 * int(r, 20, 85);
      return {
        text: `Kąt środkowy $AOB$ ma miarę $${c}^\\circ$. Jaką miarę ma kąt wpisany $ACB$ oparty na tym samym łuku (punkt $C$ leży na dłuższym łuku)?`,
        answer: { ...num(`${c / 2}`), suffix: '^\\circ' },
        solution: [`Kąt wpisany to połowa kąta środkowego: $\\frac{${c}^\\circ}{2} = ${c / 2}^\\circ$`],
        verify: { expr: `${c}/2` },
        distractors: [`${c}`, `${180 - c / 2}`, `${360 - c}`, `${90 - c / 2}`],
      };
    }
    if (type === 1) {
      const k = pick(r, [3, 4, 5, 6, 8, 9, 10, 12]);
      const ans = q(180, k);
      return {
        text: `Łuk $AB$, na którym oparty jest kąt wpisany $ACB$, stanowi $\\frac{1}{${k}}$ długości okręgu. Oblicz miarę kąta $ACB$.`,
        answer: { ...num(ans.tex()), suffix: '^\\circ' },
        solution: [`Kąt środkowy: $\\frac{360^\\circ}{${k}} = ${q(360, k).tex()}^\\circ$`, `Kąt wpisany to połowa: $${ans.tex()}^\\circ$`],
        verify: { expr: `\\frac{360}{${k}}\\cdot\\frac{1}{2}` },
        distractors: [q(360, k).tex(), q(90, k).tex(), `${180 - ans.value}`, q(720, k).tex()],
      };
    }
    // trójkąt wpisany w okrąg, AB średnica, dany kąt BAC → kąt ABC
    const a = int(r, 15, 75);
    return {
      text: `Odcinek $AB$ jest średnicą okręgu, a punkt $C$ leży na tym okręgu. Kąt $BAC$ ma miarę $${a}^\\circ$. Oblicz miarę kąta $ABC$.`,
      answer: { ...num(`${90 - a}`), suffix: '^\\circ' },
      solution: ['Kąt $ACB$ jest oparty na półokręgu, więc ma $90^\\circ$.', `$180^\\circ - 90^\\circ - ${a}^\\circ = ${90 - a}^\\circ$`],
      verify: { expr: `180-90-${a}` },
      distractors: [`${180 - a}`, `${2 * a}`, `${a}`, `${90 + a}`],
    };
  },
};

const trojkaty: Skill = {
  id: 'trojkaty',
  title: 'Trójkąty: Pitagoras i pola',
  tip: ['Pitagoras: $a^2+b^2=c^2$. Trójkąt równoboczny: $h=\\frac{a\\sqrt3}{2}$, $P=\\frac{a^2\\sqrt3}{4}$.', 'Pole z kątem: $P=\\frac12 ab\\sin\\gamma$.'],
  generate(r) {
    const type = int(r, 0, 2);
    if (type === 0) {
      const a = int(r, 1, 9), b = int(r, 1, 9);
      const c2 = a * a + b * b;
      const ans = sqrtTex(c2);
      return {
        text: `Przyprostokątne trójkąta prostokątnego mają długości $${a}$ i $${b}$. Oblicz długość przeciwprostokątnej.`,
        answer: surd(ans),
        solution: [`$c^2 = ${a}^2 + ${b}^2 = ${c2}$`, `$c = \\sqrt{${c2}}${ans === `\\sqrt{${c2}}` ? '' : ` = ${ans}`}$`],
        verify: { expr: `\\sqrt{${a}^2+${b}^2}` },
        distractors: [`${a + b}`, sqrtTex(Math.abs(a * a - b * b) || 2), `${c2}`, sqrtTex(a + b)],
      };
    }
    if (type === 1) {
      const a = int(r, 2, 10);
      const askH = r() < 0.5;
      const ans = askH ? surdTex(q(0), q(a, 2), 3) : surdTex(q(0), q(a * a, 4), 3);
      return {
        text: `Oblicz ${askH ? 'wysokość' : 'pole'} trójkąta równobocznego o boku $${a}$.`,
        answer: surd(ans),
        solution: [askH ? `$h = \\frac{a\\sqrt{3}}{2} = \\frac{${a}\\sqrt{3}}{2} = ${ans}$` : `$P = \\frac{a^2\\sqrt{3}}{4} = \\frac{${a * a}\\sqrt{3}}{4} = ${ans}$`],
        verify: { expr: askH ? `\\sqrt{${a}^2-(${a}/2)^2}` : `\\frac{1}{2}\\cdot ${a}\\cdot\\sqrt{${a}^2-(${a}/2)^2}` },
        distractors: askH ? [surdTex(q(0), q(a), 3), surdTex(q(0), q(a, 2), 2), surdTex(q(0), q(a * a, 4), 3), surdTex(q(0), q(a, 3), 3)]
          : [surdTex(q(0), q(a * a, 2), 3), surdTex(q(0), q(a, 2), 3), surdTex(q(0), q(a * a, 4), 2), `${a * a}`],
      };
    }
    const a = int(r, 2, 12), b = int(r, 2, 12);
    const g = pick(r, [30, 45, 60, 150, 120]);
    const sinv: Record<number, [Q, number]> = { 30: [q(1, 2), 1], 150: [q(1, 2), 1], 45: [q(1, 2), 2], 60: [q(1, 2), 3], 120: [q(1, 2), 3] };
    const [s, m] = sinv[g];
    const coef = q(a * b, 2).mul(s);
    const ans = m === 1 ? coef.tex() : surdTex(q(0), coef, m);
    const rad: Record<number, string> = { 30: '\\frac{\\pi}{6}', 45: '\\frac{\\pi}{4}', 60: '\\frac{\\pi}{3}', 120: '\\frac{2\\pi}{3}', 150: '\\frac{5\\pi}{6}' };
    return {
      text: `Dwa boki trójkąta mają długości $${a}$ i $${b}$, a kąt między nimi ma miarę $${g}^\\circ$. Oblicz pole trójkąta.`,
      answer: surd(ans),
      solution: [`$P = \\frac{1}{2}\\cdot ${a}\\cdot ${b}\\cdot\\sin ${g}^\\circ = \\frac{${a * b}}{2}\\cdot ${surdTex(m === 1 ? s : q(0), m === 1 ? q(0) : s, m)} = ${ans}$`],
      verify: { expr: `\\frac{1}{2}\\cdot ${a}\\cdot ${b}\\cdot\\sin\\left(${rad[g]}\\right)` },
      distractors: [`${a * b}`, m === 1 ? `${(a * b) / 2}` : surdTex(q(0), q(a * b, 2), m), m === 1 ? surdTex(q(0), coef, 3) : coef.tex(), surdTex(q(0), coef.mul(q(2)), m === 1 ? 2 : m)],
    };
  },
};

export const dzial7: Dzial = { id: 'planimetria', num: 7, title: 'Planimetria', skills: [katy, katRysunek, trojkaty] };

/* ───────── Dział 8: Geometria analityczna ───────── */

const odcinki: Skill = {
  id: 'odcinki',
  title: 'Środek i długość odcinka',
  tip: ['Środek: $S=\\left(\\frac{x_A+x_B}{2}; \\frac{y_A+y_B}{2}\\right)$', 'Długość: $|AB|=\\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}$. Punkt wpisujesz jako $(2; -3)$.'],
  generate(r) {
    const type = int(r, 0, 2);
    const xa = int(r, -8, 8), ya = int(r, -8, 8);
    let xb = int(r, -8, 8), yb = int(r, -8, 8);
    if (xa === xb && ya === yb) xb += 3;
    if (type === 0) {
      const S = `\\left(${q(xa + xb, 2).tex()}; ${q(ya + yb, 2).tex()}\\right)`;
      return {
        text: `Wyznacz środek odcinka $AB$, gdzie $A = (${xa}; ${ya})$ i $B = (${xb}; ${yb})$.`,
        answer: { kind: 'input', expected: S, form: 'point', prefix: 'S =' },
        solution: [`$S = \\left(\\frac{${xa} + ${xb < 0 ? `(${xb})` : xb}}{2}; \\frac{${ya} + ${yb < 0 ? `(${yb})` : yb}}{2}\\right) = ${S}$`],
        verify: { expr: `${(xa + xb) / 2}` },
        verifyPoint: [(xa + xb) / 2, (ya + yb) / 2],
        distractors: [`\\left(${q(xb - xa, 2).tex()}; ${q(yb - ya, 2).tex()}\\right)`, `\\left(${xa + xb}; ${ya + yb}\\right)`, `\\left(${q(ya + yb, 2).tex()}; ${q(xa + xb, 2).tex()}\\right)`, `\\left(${q(xa - xb, 2).tex()}; ${q(ya - yb, 2).tex()}\\right)`],
      };
    }
    if (type === 1) {
      // dany A i środek S → B
      const S = [xa, ya], A = [xb, yb];
      const B = [2 * S[0] - A[0], 2 * S[1] - A[1]];
      return {
        text: `Punkt $S = (${S[0]}; ${S[1]})$ jest środkiem odcinka $AB$, a $A = (${A[0]}; ${A[1]})$. Wyznacz współrzędne punktu $B$.`,
        answer: { kind: 'input', expected: `\\left(${B[0]}; ${B[1]}\\right)`, form: 'point', prefix: 'B =' },
        solution: [`$\\frac{${A[0]} + x_B}{2} = ${S[0]}$, więc $x_B = ${B[0]}$`, `$\\frac{${A[1]} + y_B}{2} = ${S[1]}$, więc $y_B = ${B[1]}$`],
        verify: { expr: `${B[0]}` },
        verifyPoint: [B[0], B[1]],
        distractors: [`\\left(${q(S[0] + A[0], 2).tex()}; ${q(S[1] + A[1], 2).tex()}\\right)`, `\\left(${S[0] - A[0]}; ${S[1] - A[1]}\\right)`, `\\left(${B[1]}; ${B[0]}\\right)`, `\\left(${-B[0]}; ${-B[1]}\\right)`],
      };
    }
    const d2 = (xb - xa) ** 2 + (yb - ya) ** 2;
    const ans = sqrtTex(d2);
    return {
      text: `Oblicz długość odcinka $AB$, gdzie $A = (${xa}; ${ya})$ i $B = (${xb}; ${yb})$.`,
      answer: surd(ans),
      solution: [`$|AB| = \\sqrt{(${xb} - ${xa < 0 ? `(${xa})` : xa})^2 + (${yb} - ${ya < 0 ? `(${ya})` : ya})^2} = \\sqrt{${d2}}${ans === `\\sqrt{${d2}}` ? '' : ` = ${ans}`}$`],
      verify: { expr: `\\sqrt{(${xb}-(${xa}))^2+(${yb}-(${ya}))^2}` },
      distractors: [sqrtTex(Math.abs(xb - xa) + Math.abs(yb - ya)), `${d2}`, sqrtTex((xb + xa) ** 2 + (yb + ya) ** 2 || 3), `${Math.abs(xb - xa) + Math.abs(yb - ya)}`],
    };
  },
};

const proste: Skill = {
  id: 'proste',
  title: 'Proste równoległe i prostopadłe',
  tip: ['Proste $y=a_1x+b_1$ i $y=a_2x+b_2$ są równoległe, gdy $a_1=a_2$, a prostopadłe, gdy $a_1\\cdot a_2=-1$.', 'Równanie prostej wpisz jako $y = ax + b$.'],
  generate(r) {
    const type = int(r, 0, 1);
    const a = pick(r, [q(2), q(-3), q(1, 2), q(-1, 2), q(3), q(-2), q(1, 3), q(-4), q(2, 3)]);
    const b = int(r, -7, 7);
    const line = `y = ${lineTex(a, q(b))}`;
    if (type === 0) {
      const perp = r() < 0.5;
      const k = perp ? q(-a.d, a.n) : a;
      const x0 = int(r, -4, 4), y0 = int(r, -6, 6);
      const bb = q(y0).sub(k.mul(q(x0)));
      const ans = `y = ${lineTex(k, bb)}`;
      return {
        text: `Wyznacz równanie prostej ${perp ? 'prostopadłej' : 'równoległej'} do prostej $${line}$ i przechodzącej przez punkt $P = (${x0}; ${y0})$.`,
        answer: { kind: 'input', expected: ans, form: 'polynomial', vars: ['x'] },
        solution: [perp ? `Współczynnik kierunkowy prostej prostopadłej: $-\\frac{1}{${a.tex()}} = ${k.tex()}$` : `Prosta równoległa ma ten sam współczynnik kierunkowy: $${k.tex()}$`, `$${y0} = ${k.tex()}\\cdot ${x0 < 0 ? `(${x0})` : x0} + b$, więc $b = ${bb.tex()}$`, `$${ans}$`],
        verify: { expr: `${k.tex()}\\cdot x + ${bb.texP()}`, vars: ['x'] },
        distractors: [`y = ${lineTex(k.neg(), bb)}`, `y = ${lineTex(perp ? a : q(-a.d, a.n), bb)}`, `y = ${lineTex(k, bb.neg())}`, `y = ${lineTex(k, q(b))}`],
      };
    }
    // y = (m - c)x + 3 równoległa do y = a x + b → m
    const c = int(r, -5, 5);
    const m = a.add(q(c));
    return {
      text: `Proste $y = (m ${c < 0 ? '+' : '-'} ${Math.abs(c)})x + 3$ oraz $${line}$ są równoległe. Oblicz $m$.`,
      answer: { ...num(m.tex()), prefix: 'm =' },
      solution: [`Równoległe mają równe współczynniki kierunkowe: $m ${c < 0 ? '+' : '-'} ${Math.abs(c)} = ${a.tex()}$`, `$m = ${m.tex()}$`],
      verify: { expr: `${a.tex()} + (${c})` },
      distractors: [a.sub(q(c)).tex(), q(-a.d, a.n).add(q(c)).tex(), m.neg().tex(), a.tex()],
    };
  },
};
function lineTex(a: Q, b: Q): string {
  const ax = a.eq(q(1)) ? 'x' : a.eq(q(-1)) ? '-x' : a.d === 1 ? `${a.n}x` : `${a.n < 0 ? '-' : ''}\\frac{${Math.abs(a.n)}}{${a.d}}x`;
  if (b.n === 0) return ax;
  return `${ax} ${b.n < 0 ? '-' : '+'} ${new Q(Math.abs(b.n), b.d).tex()}`;
}

export const dzial8: Dzial = { id: 'analityczna', num: 8, title: 'Geometria analityczna', skills: [odcinki, proste] };

/* ───────── Dział 9: Stereometria ───────── */

const bryly: Skill = {
  id: 'graniastoslupy',
  title: 'Sześcian, prostopadłościan, ostrosłup',
  tip: ['Przekątna sześcianu: $a\\sqrt3$, przekątna ściany: $a\\sqrt2$. Prostopadłościan: $d=\\sqrt{a^2+b^2+c^2}$.', 'Ostrosłup: $V=\\frac13 P_p\\cdot H$. Graniastosłup: $V=P_p\\cdot H$.'],
  generate(r) {
    const type = int(r, 0, 3);
    if (type === 0) {
      const a = int(r, 2, 6);
      const face = r() < 0.5;
      return {
        text: `Przekątna ${face ? 'ściany sześcianu' : 'sześcianu'} ma długość $${face ? `${a}\\sqrt{2}` : `${a}\\sqrt{3}`}$. Oblicz objętość sześcianu.`,
        answer: num(`${a ** 3}`),
        solution: [`${face ? `$a\\sqrt{2} = ${a}\\sqrt{2}$` : `$a\\sqrt{3} = ${a}\\sqrt{3}$`}, więc krawędź $a = ${a}$`, `$V = a^3 = ${a ** 3}$`],
        verify: { expr: face ? `\\left(\\frac{${a}\\sqrt{2}}{\\sqrt{2}}\\right)^3` : `\\left(\\frac{${a}\\sqrt{3}}{\\sqrt{3}}\\right)^3` },
        distractors: [`${a * a}`, `${3 * a}`, `${(a * a * a * 2)}`, `${6 * a * a}`],
      };
    }
    if (type === 1) {
      const a = int(r, 1, 8), b = int(r, 1, 8), c = int(r, 1, 8);
      const d2 = a * a + b * b + c * c;
      return {
        text: `Krawędzie prostopadłościanu mają długości $${a}$, $${b}$ i $${c}$. Oblicz długość przekątnej prostopadłościanu.`,
        answer: surd(sqrtTex(d2)),
        solution: [`$d = \\sqrt{${a}^2 + ${b}^2 + ${c}^2} = \\sqrt{${d2}}${sqrtTex(d2) === `\\sqrt{${d2}}` ? '' : ` = ${sqrtTex(d2)}`}$`],
        verify: { expr: `\\sqrt{${a}^2+${b}^2+${c}^2}` },
        distractors: [`${a + b + c}`, sqrtTex(a * a + b * b), `${d2}`, sqrtTex(a + b + c)],
      };
    }
    if (type === 2) {
      const a = int(r, 2, 10), H = int(r, 2, 12);
      const V = q(a * a * H, 3);
      return {
        text: `Ostrosłup prawidłowy czworokątny ma krawędź podstawy $${a}$ i wysokość $${H}$. Oblicz jego objętość.`,
        answer: num(V.tex()),
        solution: [`$P_p = ${a}^2 = ${a * a}$`, `$V = \\frac{1}{3}\\cdot ${a * a}\\cdot ${H} = ${V.tex()}$`],
        verify: { expr: `\\frac{1}{3}\\cdot ${a}^2\\cdot ${H}` },
        distractors: [`${a * a * H}`, q(a * H, 3).tex(), q(4 * a * H, 3).tex(), q(a * a * H, 2).tex()],
      };
    }
    const n = int(r, 3, 12);
    const pyramid = r() < 0.5;
    const what = pick(r, ['krawędzi', 'wierzchołków'] as const);
    const ans = pyramid ? (what === 'krawędzi' ? 2 * n : n + 1) : what === 'krawędzi' ? 3 * n : 2 * n;
    return {
      text: pyramid ? `Ostrosłup ma ${n} ścian bocznych. Ile ma ${what}?` : `Graniastosłup ma w podstawie ${n}-kąt. Ile ma ${what}?`,
      answer: num(`${ans}`),
      solution: [pyramid
        ? `Podstawa to ${n}-kąt: ${n} krawędzi podstawy i ${n} bocznych, razem $${2 * n}$. Wierzchołki: $${n}$ w podstawie i wierzchołek ostrosłupa, razem $${n + 1}$.`
        : `Dwie podstawy po ${n} krawędzi i ${n} krawędzi bocznych: razem $${3 * n}$. Wierzchołków jest $2\\cdot ${n} = ${2 * n}$.`],
      verify: { expr: `${ans}` },
      distractors: [`${n}`, `${ans + 1}`, `${ans - 1}`, `${2 * ans}`],
    };
  },
};

const obrotowe: Skill = {
  id: 'bryly-obrotowe',
  title: 'Walec, stożek, kula',
  tip: ['Walec: $V=\\pi r^2 H$. Stożek: $V=\\frac13\\pi r^2 H$. Kula: $V=\\frac43\\pi r^3$.', 'Wynik zostaw z $\\pi$, np. $12\\pi$ (klawisz $\\pi$).'],
  generate(r) {
    const type = int(r, 0, 2);
    const R = int(r, 1, 6), H = int(r, 1, 10);
    if (type === 0) {
      const c = q(R * R * H);
      return {
        text: `Walec ma promień podstawy $${R}$ i wysokość $${H}$. Oblicz objętość walca.`,
        answer: surd(piTex(c)),
        solution: [`$V = \\pi\\cdot ${R}^2\\cdot ${H} = ${piTex(c)}$`],
        verify: { expr: `\\pi\\cdot ${R}^2\\cdot ${H}` },
        distractors: [piTex(q(2 * R * H)), piTex(q(R * R * H, 3)), piTex(q(R * H)), piTex(q(2 * R * R * H))],
      };
    }
    if (type === 1) {
      const c = q(R * R * H, 3);
      return {
        text: `Stożek ma promień podstawy $${R}$ i wysokość $${H}$. Oblicz objętość stożka.`,
        answer: surd(piTex(c)),
        solution: [`$V = \\frac{1}{3}\\pi\\cdot ${R}^2\\cdot ${H} = ${piTex(c)}$`],
        verify: { expr: `\\frac{1}{3}\\pi\\cdot ${R}^2\\cdot ${H}` },
        distractors: [piTex(q(R * R * H)), piTex(q(R * H, 3)), piTex(q(2 * R * H, 3)), piTex(q(R * R * H, 2))],
      };
    }
    const c = q(4 * R ** 3, 3);
    return {
      text: `Kula ma promień $${R}$. Oblicz jej objętość.`,
      answer: surd(piTex(c)),
      solution: [`$V = \\frac{4}{3}\\pi\\cdot ${R}^3 = ${piTex(c)}$`],
      verify: { expr: `\\frac{4}{3}\\pi\\cdot ${R}^3` },
      distractors: [piTex(q(4 * R * R)), piTex(q(4 * R ** 3)), piTex(q(R ** 3, 3)), piTex(q(4 * R * R, 3))],
    };
  },
};

export const dzial9: Dzial = { id: 'stereometria', num: 9, title: 'Stereometria', skills: [bryly, obrotowe] };

/* ───────── Dział 10: Statystyka, kombinatoryka, prawdopodobieństwo ───────── */

const decTex = (v: Q) => { let d = v.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1 ? String(Math.round(v.value * 1e6) / 1e6).replace('.', '{,}') : v.tex(); };

const statystyka: Skill = {
  id: 'statystyka',
  title: 'Średnia i mediana',
  tip: ['Średnia: suma liczb podzielona przez ich liczbę.', 'Mediana: ustaw liczby od najmniejszej. Środkowa liczba, a przy parzystej liczbie danych średnia dwóch środkowych.'],
  generate(r) {
    const n = int(r, 5, 8);
    const xs = Array.from({ length: n }, () => int(r, 1, 9));
    const type = int(r, 0, 2);
    const sorted = [...xs].sort((a, b) => a - b);
    const sum = xs.reduce((a, b) => a + b, 0);
    if (type === 0) {
      const mean = q(sum, n);
      return {
        text: `Oblicz średnią arytmetyczną liczb: $${xs.join(',\\ ')}$.`,
        answer: num(decTex(mean)),
        solution: [`Suma: $${sum}$, liczb jest $${n}$.`, `$\\frac{${sum}}{${n}} = ${decTex(mean)}$`],
        verify: { expr: `\\frac{${xs.join('+')}}{${n}}` },
        distractors: [decTex(q(sum, n - 1)), decTex(q(sorted[Math.floor(n / 2)])), decTex(q(sum, n + 1)), decTex(mean.add(q(1, 2)))],
      };
    }
    if (type === 1) {
      const med = n % 2 ? q(sorted[(n - 1) / 2]) : q(sorted[n / 2 - 1] + sorted[n / 2], 2);
      return {
        text: `Oblicz medianę liczb: $${xs.join(',\\ ')}$.`,
        answer: num(decTex(med)),
        solution: [`Po uporządkowaniu: $${sorted.join(',\\ ')}$`, n % 2 ? `Środkowa liczba to $${decTex(med)}$.` : `Dwie środkowe: $${sorted[n / 2 - 1]}$ i $${sorted[n / 2]}$, mediana $= ${decTex(med)}$`],
        verify: { expr: decTex(med).replace('{,}', '.') },
        verifyFn: () => { const s = [...xs].sort((a, b) => a - b); return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; },
        distractors: [decTex(q(xs[Math.floor(n / 2)])), decTex(q(sum, n)), n % 2 ? decTex(q(sorted[(n - 1) / 2] + sorted[(n + 1) / 2], 2)) : decTex(q(sorted[n / 2])), decTex(med.add(q(1)))],
      };
    }
    // średnia znana → brakująca liczba
    const target = int(r, 3, 8);
    const missing = target * (n + 1) - sum;
    if (missing < 0 || missing > 20) return statystyka.generate(r);
    return {
      text: `Średnia arytmetyczna liczb $${xs.join(',\\ ')},\\ x$ jest równa $${target}$. Oblicz $x$.`,
      answer: { ...num(`${missing}`), prefix: 'x =' },
      solution: [`$\\frac{${sum} + x}{${n + 1}} = ${target}$`, `$${sum} + x = ${target * (n + 1)}$, więc $x = ${missing}$`],
      verify: { expr: `${target}\\cdot ${n + 1} - ${sum}` },
      distractors: [`${target * n - sum}`, `${target}`, `${missing + target}`, `${Math.abs(missing - 1)}`],
    };
  },
};

function countNumbers(len: number, digits: number[], pred: (d: number[]) => boolean, distinct: boolean): number {
  let c = 0;
  const rec = (acc: number[]) => {
    if (acc.length === len) { if (pred(acc)) c++; return; }
    for (const d of digits) {
      if (acc.length === 0 && d === 0) continue;
      if (distinct && acc.includes(d)) continue;
      rec([...acc, d]);
    }
  };
  rec([]);
  return c;
}

const kombinatoryka: Skill = {
  id: 'kombinatoryka',
  title: 'Kombinatoryka',
  tip: ['Reguła mnożenia: liczba możliwości na każdym miejscu razy liczba na kolejnym.', 'Uważaj: liczba nie zaczyna się od zera.'],
  generate(r) {
    const type = int(r, 0, 2);
    if (type === 0) {
      const digits = pick(r, [[2, 4, 7], [1, 3, 6], [1, 2, 5, 8], [0, 3, 5], [0, 1, 4, 6]]);
      const len = int(r, 2, 4);
      const ev = r() < 0.5;
      const cnt = countNumbers(len, digits, (d) => (ev ? d[len - 1] % 2 === 0 : true), false);
      const nz = digits.filter((d) => d !== 0).length;
      const evens = digits.filter((d) => d % 2 === 0).length;
      return {
        text: `Ile jest ${['', '', 'dwucyfrowych', 'trzycyfrowych', 'czterocyfrowych'][len]} liczb ${ev ? 'parzystych ' : ''}zapisanych tylko cyframi $${digits.join(',\\ ')}$ (cyfry mogą się powtarzać)?`,
        answer: num(`${cnt}`),
        solution: [`Pierwsza cyfra: $${nz}$ możliwości${digits.includes(0) ? ' (bez zera)' : ''}. ${ev ? `Ostatnia cyfra parzysta: $${evens}$ możliwości. Środkowe: po $${digits.length}$.` : `Pozostałe: po $${digits.length}$.`}`, `Razem: $${cnt}$`],
        verify: { expr: `${cnt}` },
        verifyFn: () => { let c = 0; const lo = 10 ** (len - 1); for (let x = lo; x < lo * 10; x++) { const ds = String(x).split('').map(Number); if (ds.every((d) => digits.includes(d)) && (!ev || x % 2 === 0)) c++; } return c; },
        distractors: [`${digits.length ** len}`, `${cnt * 2}`, `${Math.max(1, cnt - digits.length)}`, `${digits.length * len}`],
      };
    }
    if (type === 1) {
      const len = pick(r, [2, 3]);
      const cnt = countNumbers(len, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], () => true, true);
      return {
        text: `Ile jest ${len === 2 ? 'dwucyfrowych' : 'trzycyfrowych'} liczb naturalnych o różnych cyfrach?`,
        answer: num(`${cnt}`),
        solution: [len === 2 ? 'Pierwsza cyfra: $9$ możliwości (bez zera), druga: $9$ (dowolna poza pierwszą).' : 'Pierwsza: $9$, druga: $9$, trzecia: $8$.', `Razem: $${cnt}$`],
        verify: { expr: len === 2 ? '9\\cdot 9' : '9\\cdot 9\\cdot 8' },
        distractors: [`${len === 2 ? 90 : 900}`, `${len === 2 ? 90 : 720}`, `${len === 2 ? 72 : 504}`, `${len === 2 ? 100 : 1000}`],
      };
    }
    const n = int(r, 4, 9);
    const handshake = r() < 0.5;
    const cnt = handshake ? (n * (n - 1)) / 2 : n * (n - 1);
    return {
      text: handshake ? `${n} osób wita się, każda z każdą podaje sobie rękę jeden raz. Ile jest powitań?` : `Z ${n} uczniów wybieramy przewodniczącego i jego zastępcę. Na ile sposobów można to zrobić?`,
      answer: num(`${cnt}`),
      solution: [handshake ? `Każda z $${n}$ osób wita się z $${n - 1}$ innymi, ale każde powitanie liczymy wtedy dwa razy: $\\frac{${n}\\cdot ${n - 1}}{2} = ${cnt}$` : `Przewodniczący: $${n}$ możliwości, zastępca: $${n - 1}$. Razem $${cnt}$.`],
      verify: { expr: handshake ? `\\frac{${n}(${n}-1)}{2}` : `${n}(${n}-1)` },
      distractors: [`${handshake ? n * (n - 1) : (n * (n - 1)) / 2}`, `${n * n}`, `${2 * n}`, `${n * (n + 1) / 2}`],
    };
  },
};

const DICE_EVENTS: { text: string; f: (a: number, b: number) => boolean }[] = [
  { text: 'suma wyrzuconych oczek jest równa 7', f: (a, b) => a + b === 7 },
  { text: 'suma wyrzuconych oczek jest większa od 9', f: (a, b) => a + b > 9 },
  { text: 'w pierwszym rzucie wypadnie więcej oczek niż w drugim', f: (a, b) => a > b },
  { text: 'iloczyn wyrzuconych oczek jest liczbą parzystą', f: (a, b) => (a * b) % 2 === 0 },
  { text: 'w obu rzutach wypadnie ta sama liczba oczek', f: (a, b) => a === b },
  { text: 'suma wyrzuconych oczek jest podzielna przez 3', f: (a, b) => (a + b) % 3 === 0 },
  { text: 'co najmniej raz wypadnie szóstka', f: (a, b) => a === 6 || b === 6 },
];

const prawdop: Skill = {
  id: 'prawdopodobienstwo',
  title: 'Prawdopodobieństwo',
  tip: ['$P(A)=\\frac{|A|}{|\\Omega|}$: liczba zdarzeń sprzyjających przez liczbę wszystkich.', 'Dwa rzuty kostką: $|\\Omega|=6\\cdot 6=36$.'],
  generate(r) {
    const type = int(r, 0, 1);
    if (type === 0) {
      const e = pick(r, DICE_EVENTS);
      let cnt = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (e.f(a, b)) cnt++;
      const P = q(cnt, 36);
      return {
        text: `Rzucamy dwa razy symetryczną sześcienną kostką. Oblicz prawdopodobieństwo, że ${e.text}.`,
        answer: num(P.tex()),
        solution: [`$|\\Omega| = 36$, zdarzeń sprzyjających jest $${cnt}$.`, `$P = \\frac{${cnt}}{36}${P.d === 36 ? '' : ` = ${P.tex()}`}$`],
        verify: { expr: `\\frac{${cnt}}{36}` },
        verifyFn: () => { let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (e.f(a, b)) c++; return c / 36; },
        distractors: [q(cnt, 6 * 6 + 6).tex(), q(Math.max(1, cnt - 1), 36).tex(), q(36 - cnt, 36).tex(), q(cnt, 12).value < 1 ? q(cnt, 12).tex() : q(1, 2).tex()],
      };
    }
    const black = pick(r, [6, 8, 9, 10, 12, 15, 18]);
    const P = pick(r, [q(1, 3), q(2, 5), q(3, 5), q(1, 4), q(3, 4), q(2, 3), q(1, 2)]);
    const total = q(black).div(P);
    if (!total.isInt()) return prawdop.generate(r);
    const white = total.value - black;
    return {
      text: `W pudełku są tylko kule białe i czarne. Kul czarnych jest $${black}$. Prawdopodobieństwo wylosowania kuli czarnej jest równe $${P.tex()}$. Ile jest kul białych?`,
      answer: num(`${white}`),
      solution: [`$\\frac{${black}}{n} = ${P.tex()}$, więc wszystkich kul jest $n = ${total.value}$.`, `Białych: $${total.value} - ${black} = ${white}$`],
      verify: { expr: `\\frac{${black}}{${P.tex()}} - ${black}` },
      distractors: [`${total.value}`, `${Math.round(black * P.value)}`, `${white + 1}`, `${Math.max(1, white - 2)}`],
    };
  },
};

export const dzial10: Dzial = { id: 'statystyka', num: 10, title: 'Statystyka i prawdopodobieństwo', skills: [statystyka, kombinatoryka, prawdop] };
