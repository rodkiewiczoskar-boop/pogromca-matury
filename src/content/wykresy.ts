// Zadania z wykresami funkcji i rysunkami geometrycznymi.
import { linTex, polyTex, q } from '../math/latex';
import { int, intNZ, pick, type Rng } from '../math/rng';
import { polyAt, type GeoShape, type Pt } from './figures';
import type { Skill } from './types';

const num = (expected: string) => ({ kind: 'input' as const, expected, form: 'number' as const });
const ivTex = (lo: ReturnType<typeof q> | null, hi: ReturnType<typeof q> | null, loC: boolean, hiC: boolean) =>
  `${lo === null ? '\\left(-\\infty' : loC ? `\\left\\langle ${lo.tex()}` : `\\left(${lo.tex()}`}; ${hi === null ? '\\infty\\right)' : hiC ? `${hi.tex()}\\right\\rangle` : `${hi.tex()}\\right)`}`;
const ptTex = (x: number, y: number) => `\\left(${x}; ${y}\\right)`;

/* ───────── Wykres funkcji odczytywany z rysunku ───────── */

/** Losowa łamana na punktach kratowych: bez odcinków poziomych, z jednym najwyższym wierzchołkiem */
function randomPolyline(r: Rng): Pt[] {
  for (;;) {
    const pts: Pt[] = [];
    let x = int(r, -5, -4);
    let y = int(r, -3, 3);
    pts.push([x, y]);
    const end = int(r, 3, 5);
    while (x < end) {
      const dx = Math.min(int(r, 1, 3), end - x);
      let ny: number;
      do ny = int(r, -3, 4); while (ny === y || Math.abs(ny - y) > 5);
      x += dx; y = ny;
      pts.push([x, y]);
    }
    if (pts.length < 4) continue;
    const ys = pts.map((p) => p[1]);
    const max = Math.max(...ys), min = Math.min(...ys);
    if (ys.filter((v) => v === max).length !== 1 || max <= 0 || min >= 0) continue;
    // miejsce zerowe w wierzchołku tylko przy przecięciu osi (bez dotknięcia), żeby liczenie było jednoznaczne
    let ok = true;
    for (let i = 1; i + 1 < pts.length; i++) if (pts[i][1] === 0 && pts[i - 1][1] * pts[i + 1][1] > 0) ok = false;
    if (ok) return pts;
  }
}

/** Liczba miejsc zerowych liczona próbkowaniem gęstej siatki (niezależnie od wzoru na przecięcie) */
function countZerosBrute(pts: Pt[]): number {
  const N = 840, a = pts[0][0], b = pts[pts.length - 1][0];
  let n = 0, prev: number | null = null;
  for (let k = a * N; k <= b * N; k++) {
    const v = polyAt(pts, k / N)!;
    const s = Math.abs(v) < 1e-9 ? 0 : Math.sign(v);
    if (s === 0) n++;
    else if (prev !== null && prev !== 0 && s !== prev) n++; // przejście przez zero między próbkami
    prev = s;
  }
  return n;
}

function sampleRange(pts: Pt[]): [number, number] {
  let lo = Infinity, hi = -Infinity;
  const a = pts[0][0], b = pts[pts.length - 1][0];
  for (let k = a * 100; k <= b * 100; k++) { const v = polyAt(pts, k / 100)!; lo = Math.min(lo, v); hi = Math.max(hi, v); }
  return [lo, hi];
}

const wykresFunkcji: Skill = {
  id: 'wykres-funkcji',
  title: 'Odczytywanie z wykresu',
  tip: ['Wartość $f(a)$: idź od $x=a$ pionowo do wykresu i odczytaj $y$.', 'Miejsca zerowe to punkty, w których wykres przecina oś $x$. Zbiór wartości czytasz na osi $y$.'],
  generate(r) {
    const pts = randomPolyline(r);
    const ys = pts.map((p) => p[1]);
    const max = Math.max(...ys), min = Math.min(...ys);
    const [x0, x1] = [pts[0][0], pts[pts.length - 1][0]];
    const figBase = { kind: 'graph' as const, xr: [-6, 6] as [number, number], yr: [-4, 5] as [number, number], curves: [{ pts, ends: ['closed', 'closed'] as ['closed', 'closed'] }], label: 'y = f(x)' };
    const dom = `\\left\\langle ${x0}; ${x1}\\right\\rangle`;
    const type = int(r, 0, 4);
    if (type === 0) {
      return {
        text: `Na rysunku jest wykres funkcji $f$ określonej w przedziale $${dom}$. Jaka jest największa wartość funkcji $f$?`,
        figure: figBase,
        answer: num(`${max}`),
        solution: [`Najwyżej położony punkt wykresu to $${ptTex(pts[ys.indexOf(max)][0], max)}$.`, `Największa wartość to druga współrzędna: $${max}$.`],
        verify: { expr: `${max}` },
        verifyFn: () => sampleRange(pts)[1],
        distractors: [`${pts[ys.indexOf(max)][0]}`, `${min}`, `${x1}`, `${max - 1}`],
      };
    }
    if (type === 1) {
      const zeros = countZerosBrute(pts);
      return {
        text: `Na rysunku jest wykres funkcji $f$ określonej w przedziale $${dom}$. Ile miejsc zerowych ma funkcja $f$?`,
        figure: figBase,
        answer: num(`${zeros}`),
        solution: ['Miejsce zerowe to punkt wspólny wykresu z osią $x$ (wtedy $f(x)=0$).', `Wykres przecina oś $x$ w $${zeros}$ ${zeros === 1 ? 'punkcie' : 'punktach'}.`],
        verify: { expr: `${zeros}` },
        verifyFn: () => {
          // niezależnie: zliczanie zmian znaku na wierzchołkach i zer w wierzchołkach
          let n = 0;
          for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i][1], b = pts[i + 1][1]; if (a * b < 0) n++; if (b === 0) n++; }
          if (pts[0][1] === 0) n++;
          return n;
        },
        distractors: [`${zeros + 1}`, `${Math.max(0, zeros - 1)}`, `${zeros + 2}`, '0'],
      };
    }
    if (type === 2) {
      const a = pick(r, pts.map((p) => p[0]));
      const v = polyAt(pts, a)!;
      const fv = q(Math.round(v * 6), 6);
      return {
        text: `Na rysunku jest wykres funkcji $f$. Odczytaj wartość $f(${a})$.`,
        figure: figBase,
        answer: { ...num(fv.tex()), prefix: `f(${a}) =` },
        solution: [`Z $x = ${a}$ idziemy pionowo do wykresu.`, `Punkt wykresu ma drugą współrzędną $${fv.tex()}$, więc $f(${a}) = ${fv.tex()}$.`],
        verify: { expr: fv.tex() },
        verifyFn: () => polyAt(pts, a)!,
        distractors: [`${a}`, fv.neg().tex(), fv.add(q(1)).tex(), `${max}`],
      };
    }
    if (type === 3) {
      return {
        text: `Na rysunku jest wykres funkcji $f$ określonej w przedziale $${dom}$. Podaj zbiór wartości funkcji $f$.`,
        figure: figBase,
        answer: { kind: 'input' as const, expected: ivTex(q(min), q(max), true, true), form: 'interval' as const, prefix: 'ZW =' },
        solution: [`Najniżej wykres schodzi do $y = ${min}$, najwyżej dochodzi do $y = ${max}$.`, `Oba końce należą do wykresu (pełne kropki), więc $ZW = ${ivTex(q(min), q(max), true, true)}$.`],
        verify: { expr: '0' },
        verifyIn: (y: number) => { const [lo, hi] = sampleRange(pts); return y >= lo - 1e-9 && y <= hi + 1e-9; },
        distractors: [ivTex(q(x0), q(x1), true, true), ivTex(q(min + 1), q(max), true, true), ivTex(q(0), q(max), true, true), ivTex(q(min), q(max + 1), true, true)],
      };
    }
    const i = ys.indexOf(max);
    return {
      text: 'Zaznacz na wykresie punkt, w którym funkcja $f$ przyjmuje największą wartość (albo wpisz jego współrzędne).',
      figure: { ...figBase, pick: true },
      answer: { kind: 'input' as const, expected: ptTex(pts[i][0], max), form: 'point' as const, prefix: 'P =' },
      solution: [`Najwyżej położony punkt wykresu to $${ptTex(pts[i][0], max)}$.`],
      verify: { expr: '0' },
      verifyPoint: [pts[i][0], max],
      distractors: [ptTex(max, pts[i][0]), ptTex(pts[i][0], 0), ptTex(0, max), ptTex(pts[i][0] + 1, max), ptTex(pts[i][0], max - 1), ptTex(pts[i][0] - 1, max)],
    };
  },
};

/* ───────── Parabola z rysunku ───────── */

function parabolaPts(a: number, p: number, qq: number, xr: [number, number], yr: [number, number]): Pt[] {
  const out: Pt[] = [];
  for (let k = xr[0] * 20; k <= xr[1] * 20; k++) {
    const x = k / 20, y = a * (x - p) ** 2 + qq;
    if (y >= yr[0] - 0.3 && y <= yr[1] + 0.3) out.push([x, y]);
  }
  return out;
}

const parabolaWykres: Skill = {
  id: 'parabola-wykres',
  title: 'Parabola z wykresu',
  tip: ['Wierzchołek $W=(p; q)$ odczytasz z rysunku. Wtedy $f(x)=a(x-p)^2+q$.', '$a$ policzysz z drugiego punktu wykresu. Ramiona w górę: $a>0$, zbiór wartości $\\langle q; \\infty)$.'],
  generate(r) {
    const a = pick(r, [1, -1, 1, -1, 2, -2]);
    const p = intNZ(r, -3, 3);
    const qq = a > 0 ? int(r, -3, 1) : int(r, 0, 4);
    const xr: [number, number] = [-6, 6], yr: [number, number] = [-4, 5];
    const fig = { kind: 'graph' as const, xr, yr, curves: [{ pts: parabolaPts(a, p, qq, xr, yr) }], label: 'y = f(x)' };
    const aT = a === 1 ? '' : a === -1 ? '-' : `${a}`;
    const canon = `${aT}\\left(${linTex(1, -p)}\\right)^2${qq === 0 ? '' : qq < 0 ? `-${-qq}` : `+${qq}`}`;
    const co = [a * p * p + qq, -2 * a * p, a];
    const fp = (x: number) => a * (x - p) ** 2 + qq;
    const type = int(r, 0, 2);
    if (type === 0) {
      const wrongP = `${aT}\\left(${linTex(1, p)}\\right)^2${qq === 0 ? '' : qq < 0 ? `-${-qq}` : `+${qq}`}`;
      return {
        text: `Na rysunku jest fragment paraboli, która jest wykresem funkcji kwadratowej $f$. Współczynnik przy $x^2$ jest równy $${a}$. Zapisz wzór funkcji $f$ w postaci kanonicznej.`,
        figure: fig,
        answer: { kind: 'input' as const, expected: canon, form: 'any' as const, vars: ['x'], prefix: 'f(x) =' },
        solution: [`Wierzchołek odczytany z rysunku: $W = ${ptTex(p, qq)}$, czyli $p = ${p}$, $q = ${qq}$.`, `$f(x) = a(x-p)^2+q = ${canon}$`],
        verify: { expr: polyTex(co), vars: ['x'] },
        verifyFn: () => fp(p + 1) - fp(p),
        verifyFnExpect: a,
        distractors: [wrongP, `${aT}\\left(${linTex(1, -qq)}\\right)^2${p < 0 ? `-${-p}` : `+${p}`}`, `${a === 1 ? '-' : a === -1 ? '' : -a}\\left(${linTex(1, -p)}\\right)^2${qq === 0 ? '' : qq < 0 ? `-${-qq}` : `+${qq}`}`],
      };
    }
    if (type === 1) {
      const zw = a > 0 ? ivTex(q(qq), null, true, false) : ivTex(null, q(qq), false, true);
      return {
        text: 'Na rysunku jest fragment paraboli, która jest wykresem funkcji kwadratowej $f$ (ramiona biegną dalej). Podaj zbiór wartości funkcji $f$.',
        figure: fig,
        answer: { kind: 'input' as const, expected: zw, form: 'interval' as const, prefix: 'ZW =' },
        solution: [`Wierzchołek: $W = ${ptTex(p, qq)}$. Ramiona idą w ${a > 0 ? 'górę' : 'dół'}.`, `Zbiór wartości: $${zw}$`],
        verify: { expr: '0' },
        verifyIn: (y: number) => {
          let lo = Infinity, hi = -Infinity;
          for (let k = -4000; k <= 4000; k++) { const v = fp(k / 100); lo = Math.min(lo, v); hi = Math.max(hi, v); }
          return y >= lo - 1e-9 && y <= hi + 1e-9;
        },
        distractors: [a > 0 ? ivTex(null, q(qq), false, true) : ivTex(q(qq), null, true, false), a > 0 ? ivTex(q(p), null, true, false) : ivTex(null, q(p), false, true), a > 0 ? ivTex(q(qq - 1), null, true, false) : ivTex(null, q(qq + 1), false, true), a > 0 ? ivTex(q(qq + 1), null, true, false) : ivTex(null, q(qq - 1), false, true), ivTex(null, null, false, false)],
      };
    }
    return {
      text: 'Zaznacz na rysunku wierzchołek paraboli (albo wpisz jego współrzędne).',
      figure: { ...fig, pick: true },
      answer: { kind: 'input' as const, expected: ptTex(p, qq), form: 'point' as const, prefix: 'W =' },
      solution: [`Wierzchołek to punkt zwrotu paraboli: $W = ${ptTex(p, qq)}$.`],
      verify: { expr: '0' },
      verifyPoint: [p, qq],
      distractors: [ptTex(qq, p), ptTex(-p, qq), ptTex(p, -qq), ptTex(0, co[0]), ptTex(p + 1, qq), ptTex(p, qq + 1)],
    };
  },
};

/* ───────── Kąty na rysunku ───────── */

const deg = (t: number) => (t * Math.PI) / 180;
const onCircle = (t: number, R = 2): Pt => [R * Math.cos(deg(t)), R * Math.sin(deg(t))];
/** Miara kąta APB w stopniach, liczona z rysunku */
const angleAt = (P: Pt, A: Pt, B: Pt) => {
  const u = [A[0] - P[0], A[1] - P[1]], v = [B[0] - P[0], B[1] - P[1]];
  return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))) * 180) / Math.PI;
};
/** Etykieta punktu odsunięta od środka okręgu */
const lab = (P: Pt, text: string, k = 0.32): GeoShape => { const l = Math.hypot(P[0], P[1]) || 1; return { t: 'pt', p: P, label: text, dx: (P[0] / l) * k, dy: (P[1] / l) * k }; };

const katRysunek: Skill = {
  id: 'kat-rysunek',
  title: 'Kąty z rysunku',
  tip: ['Kąt wpisany $=\\frac12$ kąta środkowego opartego na tym samym łuku.', 'W czworokącie wpisanym w okrąg przeciwległe kąty sumują się do $180^\\circ$.'],
  generate(r) {
    const type = int(r, 0, 2);
    const box: [number, number, number, number] = [-2.9, -2.9, 5.8, 5.8];
    const O: Pt = [0, 0];
    if (type <= 1) {
      // A, B na okręgu, kąt środkowy AOB = 2β; C na dłuższym łuku
      const beta = 5 * int(r, 5, 16); // 25..80
      const rot = int(r, 0, 3) * 90 - 90 + int(r, -10, 10);
      const tA = rot - beta, tB = rot + beta;
      const tC = rot + 180 + int(r, -40, 40);
      const A = onCircle(tA), B = onCircle(tB), C = onCircle(tC);
      const askInscribed = type === 0;
      const shapes: GeoShape[] = [
        { t: 'circle', c: O, r: 2 },
        { t: 'seg', a: O, b: A }, { t: 'seg', a: O, b: B }, { t: 'seg', a: C, b: A }, { t: 'seg', a: C, b: B },
        lab(A, 'A'), lab(B, 'B'), lab(C, 'C'), { t: 'pt', p: O, label: 'O', dx: -0.25 * Math.cos(deg(rot)), dy: -0.25 * Math.sin(deg(rot)) },
        { t: 'angle', at: O, from: A, to: B, r: 0.5, label: askInscribed ? `${2 * beta}°` : 'β' },
        { t: 'angle', at: C, from: A, to: B, r: 0.55, label: askInscribed ? 'α' : `${beta}°` },
      ];
      return {
        text: askInscribed
          ? `Punkty $A$, $B$, $C$ leżą na okręgu o środku $O$, a kąt środkowy $AOB$ ma miarę $${2 * beta}^\\circ$ (rysunek). Oblicz miarę kąta $\\alpha$.`
          : `Punkty $A$, $B$, $C$ leżą na okręgu o środku $O$, a kąt wpisany $ACB$ ma miarę $${beta}^\\circ$ (rysunek). Oblicz miarę kąta środkowego $\\beta$.`,
        figure: { kind: 'geo' as const, box, shapes },
        answer: { ...num(`${askInscribed ? beta : 2 * beta}`), prefix: askInscribed ? '\\alpha =' : '\\beta =', suffix: '^\\circ' },
        solution: askInscribed
          ? ['Kąty $ACB$ i $AOB$ są oparte na tym samym łuku $AB$.', `$\\alpha = \\frac{${2 * beta}^\\circ}{2} = ${beta}^\\circ$`]
          : ['Kąt środkowy jest dwa razy większy od kąta wpisanego opartego na tym samym łuku.', `$\\beta = 2\\cdot ${beta}^\\circ = ${2 * beta}^\\circ$`],
        verify: { expr: askInscribed ? `${2 * beta}/2` : `2\\cdot ${beta}` },
        verifyFn: () => (askInscribed ? angleAt(C, A, B) : angleAt(O, A, B)),
        distractors: askInscribed ? [`${2 * beta}`, `${180 - beta}`, `${90 - beta}`, `${180 - 2 * beta}`] : [`${beta}`, `${180 - beta}`, `${360 - 2 * beta}`, `${90 + beta}`],
      };
    }
    // czworokąt ABCD wpisany w okrąg: dany kąt przy A, szukany kąt przy C
    const tA = 180 + int(r, -15, 15), tB = 270 + int(r, -25, 15), tC = int(r, -15, 15), tD = int(r, 70, 130);
    const A = onCircle(tA), B = onCircle(tB), C = onCircle(tC), D = onCircle(tD);
    // dobieramy D tak, by kąt przy A był całkowity: kąt DAB = połowa łuku BCD (nie zawierającego A)
    // łuk BCD od tB do tD+360 przez tC: miara = (tD + 360 - tB); kąt A = (tD + 360 - tB)/2
    const arc = tD + 360 - tB;
    if (arc % 2 !== 0) return katRysunek.generate(r);
    const a = arc / 2;
    const shapes: GeoShape[] = [
      { t: 'circle', c: O, r: 2 }, { t: 'poly', pts: [A, B, C, D] },
      lab(A, 'A'), lab(B, 'B'), lab(C, 'C'), lab(D, 'D'),
      { t: 'angle', at: A, from: B, to: D, r: 0.55, label: `${a}°` },
      { t: 'angle', at: C, from: D, to: B, r: 0.55, label: 'γ' },
    ];
    return {
      text: `Czworokąt $ABCD$ jest wpisany w okrąg, a kąt $DAB$ ma miarę $${a}^\\circ$ (rysunek). Oblicz miarę kąta $\\gamma$.`,
      figure: { kind: 'geo' as const, box, shapes },
      answer: { ...num(`${180 - a}`), prefix: '\\gamma =', suffix: '^\\circ' },
      solution: ['W czworokącie wpisanym w okrąg sumy przeciwległych kątów są równe $180^\\circ$.', `$\\gamma = 180^\\circ - ${a}^\\circ = ${180 - a}^\\circ$`],
      verify: { expr: `180-${a}` },
      verifyFn: () => angleAt(C, D, B),
      distractors: [`${a}`, `${360 - a}`, `${90 - (a % 90)}`, `${2 * a > 180 ? 2 * a - 180 : 2 * a}`],
    };
  },
};

/* ───────── Trójkąt prostokątny z rysunku ───────── */

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25]];

const trojkatRysunek: Skill = {
  id: 'trojkat-rysunek',
  title: 'Trójkąt prostokątny z rysunku',
  tip: ['$\\sin\\alpha=\\frac{\\text{naprzeciw}}{\\text{przeciwprostokątna}}$, $\\cos\\alpha=\\frac{\\text{przy}}{\\text{przeciwprostokątna}}$', '$\\operatorname{tg}\\alpha=\\frac{\\text{naprzeciw}}{\\text{przy}}$. Brakujący bok liczysz z Pitagorasa.'],
  generate(r) {
    const [m, n, h] = pick(r, TRIPLES);
    const swap = r() < 0.5;
    const adj = swap ? n : m, opp = swap ? m : n; // przyprostokątne: przy kącie α (pozioma) i naprzeciw (pionowa)
    // rysunek w skali: przyprostokątna pozioma ma 5 jednostek rysunku
    const s = 4.6 / Math.max(adj, opp);
    const A: Pt = [0, 0], C: Pt = [adj * s, 0], B: Pt = [adj * s, opp * s];
    const box: [number, number, number, number] = [-0.6, -0.7, adj * s + 1.4, opp * s + 1.4];
    const hide = int(r, 0, 2); // który bok jest niepodany: 0 = przeciwprostokątna, 1 = naprzeciw, 2 = przy
    const sideLabel = (P: Pt, Q: Pt, v: number | string, off: Pt): GeoShape => ({ t: 'label', p: [(P[0] + Q[0]) / 2 + off[0], (P[1] + Q[1]) / 2 + off[1]], text: `${v}` });
    const shapes: GeoShape[] = [
      { t: 'poly', pts: [A, C, B] },
      { t: 'pt', p: A, label: 'A', dx: -0.3, dy: -0.25 }, { t: 'pt', p: C, label: 'C', dx: 0.3, dy: -0.25 }, { t: 'pt', p: B, label: 'B', dx: 0.3, dy: 0.2 },
      { t: 'angle', at: C, from: B, to: A, right: true },
      { t: 'angle', at: A, from: C, to: B, r: 0.8, label: 'α' },
      sideLabel(A, C, hide === 2 ? 'x' : adj, [0, -0.35]),
      sideLabel(C, B, hide === 1 ? 'x' : opp, [0.4, 0]),
      sideLabel(A, B, hide === 0 ? 'x' : h, [-0.35, 0.3]),
    ];
    const fig = { kind: 'geo' as const, box, shapes };
    const dist = (P: Pt, Q: Pt) => Math.hypot(P[0] - Q[0], P[1] - Q[1]) / s;
    const askSide = r() < 0.35;
    if (askSide) {
      const val = hide === 0 ? h : hide === 1 ? opp : adj;
      const [k1, k2] = hide === 0 ? [adj, opp] : hide === 1 ? [h, adj] : [h, opp];
      return {
        text: 'Oblicz długość boku oznaczonego na rysunku literą $x$.',
        figure: fig,
        answer: { ...num(`${val}`), prefix: 'x =' },
        solution: hide === 0
          ? [`Z twierdzenia Pitagorasa: $x^2 = ${adj}^2 + ${opp}^2 = ${h * h}$`, `$x = ${h}$`]
          : [`Z twierdzenia Pitagorasa: $x^2 + ${k2}^2 = ${k1}^2$`, `$x^2 = ${k1 * k1} - ${k2 * k2} = ${val * val}$, więc $x = ${val}$`],
        verify: { expr: hide === 0 ? `\\sqrt{${adj}^2+${opp}^2}` : `\\sqrt{${k1}^2-${k2}^2}` },
        verifyFn: () => (hide === 0 ? dist(A, B) : hide === 1 ? dist(C, B) : dist(A, C)),
        distractors: hide === 0 ? [`${adj + opp}`, `${h + 1}`, `${h * h}`, `${Math.abs(opp - adj) || 1}`] : [`${k1 - k2}`, `${k1 + k2}`, `${val + 1}`, `${val * val}`],
      };
    }
    // wszystkie boki znane z trójki (x tylko gdy nie jest potrzebny? — pokazujemy komplet)
    shapes.splice(shapes.length - 3, 3, sideLabel(A, C, adj, [0, -0.35]), sideLabel(C, B, opp, [0.4, 0]), sideLabel(A, B, h, [-0.35, 0.3]));
    const fn = pick(r, ['sin', 'cos', 'tg'] as const);
    const res = fn === 'sin' ? q(opp, h) : fn === 'cos' ? q(adj, h) : q(opp, adj);
    const fT = fn === 'tg' ? '\\operatorname{tg}' : `\\${fn}`;
    return {
      text: `Na rysunku jest trójkąt prostokątny $ABC$. Oblicz $${fT}\\alpha$.`,
      figure: fig,
      answer: num(res.tex()),
      solution: [
        `Przy kącie $\\alpha$ leży przyprostokątna $${adj}$, naprzeciw niego $${opp}$, przeciwprostokątna to $${h}$.`,
        fn === 'sin' ? `$\\sin\\alpha = \\frac{${opp}}{${h}} = ${res.tex()}$` : fn === 'cos' ? `$\\cos\\alpha = \\frac{${adj}}{${h}} = ${res.tex()}$` : `$\\operatorname{tg}\\alpha = \\frac{${opp}}{${adj}} = ${res.tex()}$`,
      ],
      verify: { expr: fn === 'sin' ? `${opp}/${h}` : fn === 'cos' ? `${adj}/${h}` : `${opp}/${adj}` },
      verifyFn: () => {
        const t = deg(angleAt(A, C, B));
        return fn === 'sin' ? Math.sin(t) : fn === 'cos' ? Math.cos(t) : Math.tan(t);
      },
      distractors: [q(adj, h), q(opp, h), q(opp, adj), q(adj, opp), q(h, adj)].filter((v) => !v.eq(res)).map((v) => v.tex()),
    };
  },
};

export { wykresFunkcji, parabolaWykres, katRysunek, trojkatRysunek };
