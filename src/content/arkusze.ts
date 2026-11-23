// Oryginalne arkusze CKE (matura z matematyki, formuła 2015, poziom podstawowy) z kluczem odpowiedzi.
// Treści przepisane z arkusza, klucz z „Zasad oceniania” CKE. Każda odpowiedź klucza jest dodatkowo
// sprawdzana niezależnym obliczeniem w tests/arkusze.test.ts.
import type { OpenTask } from '../exam/open';
import type { Figure, Pt } from './figures';

export interface ArkuszClosed {
  kind: 'closed';
  num: number;
  text: string;
  display?: string;
  figure?: Figure;
  after?: string;
  /** Odpowiedzi A–D w LaTeX */
  options: [string, string, string, string];
  /** Indeks poprawnej odpowiedzi wg klucza CKE */
  correct: number;
  solution: string[];
  /** Etap aplikacji, którego dotyczy zadanie (do statystyk) */
  skillId: string;
}
export interface ArkuszOpen { kind: 'open'; num: number; task: OpenTask; skillId: string }
export type ArkuszItem = ArkuszClosed | ArkuszOpen;
export interface Arkusz { id: string; title: string; subtitle: string; minutes: number; items: ArkuszItem[] }

const deg = (t: number): Pt => [2 * Math.cos((t * Math.PI) / 180), 2 * Math.sin((t * Math.PI) / 180)];
const num = (expected: string) => ({ kind: 'input' as const, expected, form: 'number' as const });

/* ── rysunki ── */
const WYKRES_8: Figure = {
  kind: 'graph', xr: [-6, 6], yr: [-6, 6], label: 'y = f(x)',
  curves: [{ pts: [[-4, -2], [2, 4]], ends: ['closed', 'closed'] }, { pts: [[2, 3], [5, 0]], ends: ['open', 'open'] }],
};
const WYKRES_11: Figure = {
  kind: 'graph', xr: [-6, 6], yr: [-6, 6], label: 'y = f(x)',
  curves: [{ pts: [[-16 / 3, 5], [5 / 3, -5.5]] }],
  arcs: [{ at: [-2, 0], from: 0, to: (Math.atan2(3, -2) * 180) / Math.PI, label: 'α' }],
};
const TROJKAT_16: Figure = {
  kind: 'geo', box: [-0.6, -0.7, 7.4, 3.3],
  shapes: [
    { t: 'poly', pts: [[0, 0], [6, 0], [6, 2]] },
    { t: 'angle', at: [6, 0], from: [6, 2], to: [0, 0], right: true },
    { t: 'angle', at: [6, 2], from: [0, 0], to: [6, 0], r: 0.7, label: 'γ' },
    { t: 'pt', p: [0, 0], label: 'A', dx: -0.2, dy: -0.35, dot: false }, { t: 'pt', p: [6, 0], label: 'B', dx: 0.1, dy: -0.35, dot: false }, { t: 'pt', p: [6, 2], label: 'C', dx: 0.1, dy: 0.35, dot: false },
    { t: 'label', p: [2.9, 1.4], text: '2√10' }, { t: 'label', p: [6.35, 1], text: '2' },
  ],
};
const [A18, B18, C18, D18] = [deg(220), deg(290), deg(320), deg(90)];
const OKRAG_18: Figure = {
  kind: 'geo', box: [-2.6, -2.6, 5.2, 5.2],
  shapes: [
    { t: 'circle', c: [0, 0], r: 2 },
    { t: 'seg', a: D18, b: A18 }, { t: 'seg', a: D18, b: C18 }, { t: 'seg', a: [0, 0], b: A18 }, { t: 'seg', a: [0, 0], b: B18 }, { t: 'seg', a: [0, 0], b: C18 },
    { t: 'angle', at: D18, from: A18, to: C18, r: 0.75, label: '50°' },
    { t: 'angle', at: [0, 0], from: B18, to: C18, r: 0.55, label: '30°' },
    { t: 'angle', at: [0, 0], from: A18, to: B18, r: 0.4 },
    { t: 'pt', p: [0, 0], label: 'O', dy: 0.3 },
    { t: 'pt', p: A18, label: 'A', dx: -0.3, dot: false }, { t: 'pt', p: B18, label: 'B', dy: -0.3, dot: false },
    { t: 'pt', p: C18, label: 'C', dx: 0.25, dy: -0.2, dot: false }, { t: 'pt', p: D18, label: 'D', dy: 0.3, dot: false },
  ],
};
// zadanie 20: O w początku układu, |OA| = 12, |OC| = 8, |OB| = 6, |OD| = 9 (skala 1:3)
const um: Pt = [Math.cos(0.55), Math.sin(0.55)], un: Pt = [Math.cos(-0.45), Math.sin(-0.45)];
const at = (u: Pt, t: number): Pt => [(u[0] * t) / 3, (u[1] * t) / 3];
const A20 = at(um, -12), C20 = at(um, 8), B20 = at(un, 6), D20 = at(un, -9);
const ext = (P: Pt, Q: Pt, t0: number, t1: number): [Pt, Pt] => [[P[0] + (Q[0] - P[0]) * t0, P[1] + (Q[1] - P[1]) * t0], [P[0] + (Q[0] - P[0]) * t1, P[1] + (Q[1] - P[1]) * t1]];
const [k0, k1] = ext(A20, D20, -0.35, 1.45), [l0, l1] = ext(B20, C20, -1.1, 1.55), [m0, m1] = ext(A20, C20, -0.12, 1.12), [n0, n1] = ext(D20, B20, -0.15, 1.35);
const PROSTE_20: Figure = {
  kind: 'geo', box: [-4.4, -3, 8, 6],
  shapes: [
    { t: 'seg', a: k0, b: k1 }, { t: 'seg', a: l0, b: l1 }, { t: 'seg', a: m0, b: m1 }, { t: 'seg', a: n0, b: n1 },
    { t: 'label', p: [k1[0] - 0.2, k1[1] + 0.1], text: 'k' }, { t: 'label', p: [l1[0] - 0.2, l1[1] + 0.1], text: 'l' },
    { t: 'label', p: [m0[0] - 0.1, m0[1] - 0.3], text: 'm' }, { t: 'label', p: [n0[0] - 0.1, n0[1] + 0.3], text: 'n' },
    { t: 'pt', p: [0, 0], label: 'O', dy: -0.35 }, { t: 'pt', p: A20, label: 'A', dx: 0.35, dy: -0.25 }, { t: 'pt', p: C20, label: 'C', dx: 0.35, dy: 0.1 },
    { t: 'pt', p: B20, label: 'B', dx: 0.35, dy: 0.15 }, { t: 'pt', p: D20, label: 'D', dx: 0.3, dy: 0.25 },
    { t: 'label', p: [A20[0] / 2 + 0.25, A20[1] / 2 + 0.35], text: '12' }, { t: 'label', p: [C20[0] / 2, C20[1] / 2 + 0.35], text: '8' }, { t: 'label', p: [B20[0] / 2 - 0.1, B20[1] / 2 - 0.35], text: '6' },
  ],
};
// zadanie 29: dwusieczna z M przecina KL w N, |KN| : |NL| = |KM| : |LM|
const K29: Pt = [0, 0], L29: Pt = [6, 0], M29: Pt = [2, 3.2];
const kmLen = Math.hypot(M29[0] - K29[0], M29[1] - K29[1]), lmLen = Math.hypot(M29[0] - L29[0], M29[1] - L29[1]);
const N29: Pt = [(6 * kmLen) / (kmLen + lmLen), 0];
const TROJKAT_29: Figure = {
  kind: 'geo', box: [-0.6, -0.7, 7.2, 4.4],
  shapes: [
    { t: 'poly', pts: [K29, L29, M29] }, { t: 'seg', a: M29, b: N29 },
    { t: 'angle', at: M29, from: K29, to: N29, r: 0.45 }, { t: 'angle', at: M29, from: N29, to: L29, r: 0.45 },
    { t: 'angle', at: M29, from: K29, to: N29, r: 0.55 }, { t: 'angle', at: M29, from: N29, to: L29, r: 0.55 },
    { t: 'pt', p: K29, label: 'K', dx: -0.2, dy: -0.35, dot: false }, { t: 'pt', p: L29, label: 'L', dx: 0.2, dy: -0.35, dot: false },
    { t: 'pt', p: M29, label: 'M', dy: 0.35, dot: false }, { t: 'pt', p: N29, label: 'N', dy: -0.35, dot: false },
    { t: 'label', p: [0.7, 1.9], text: 'a' }, { t: 'label', p: [4.4, 2], text: 'b' },
  ],
};

const INFO_8 = 'Informacja do zadań 8.–10. Na rysunku, w układzie współrzędnych $(x, y)$, przedstawiono wykres funkcji $f$.';
const INFO_11 = 'Informacja do zadań 11.–12. Funkcja liniowa $f$ jest określona wzorem $f(x) = ax + b$, gdzie $a$ i $b$ są pewnymi liczbami rzeczywistymi. W układzie współrzędnych $(x, y)$ przedstawiono fragment wykresu funkcji $f$. Każdy z punktów przecięcia wykresu funkcji $f$ z osiami układu współrzędnych ma obie współrzędne całkowite. Wykres funkcji $f$ jest nachylony do osi $Ox$ układu współrzędnych pod kątem o mierze $\\alpha$ (zobacz rysunek).';
const T = (s: string) => `\\text{${s}}`;

export const MAJ_2026: Arkusz = {
  id: 'maj-2026',
  title: 'Matura maj 2026',
  subtitle: 'Termin główny, 5 maja 2026 · formuła 2015 · poziom podstawowy',
  minutes: 170,
  items: [
    { kind: 'closed', num: 1, skillId: 'pierw-dzialania', text: 'Liczba $\\sqrt{\\frac{25}{8}}\\cdot\\sqrt{2} + 2^{-1}$ jest równa', options: ['1', '2', '3', '4'], correct: 2,
      solution: ['$\\sqrt{\\frac{25}{8}}\\cdot\\sqrt{2} = \\sqrt{\\frac{50}{8}} = \\sqrt{\\frac{25}{4}} = \\frac{5}{2}$', '$2^{-1} = \\frac{1}{2}$, więc razem $\\frac{5}{2} + \\frac{1}{2} = 3$'] },
    { kind: 'closed', num: 2, skillId: 'procenty', text: 'Klient wpłacił do banku $10\\,000$ zł na lokatę dwuletnią. Po każdym rocznym okresie oszczędzania bank dolicza odsetki w wysokości $6\\%$ od kwoty bieżącego kapitału znajdującego się na lokacie – zgodnie z procentem składanym. Po dwóch latach oszczędzania łączna wartość doliczonych odsetek na tej lokacie (bez uwzględniania podatków) jest równa',
      options: ['1200\\text{ zł}', '1236\\text{ zł}', '1836\\text{ zł}', '3600\\text{ zł}'], correct: 1,
      solution: ['Po dwóch latach: $10\\,000\\cdot 1{,}06^2 = 10\\,000\\cdot 1{,}1236 = 11\\,236$ zł', 'Odsetki: $11\\,236 - 10\\,000 = 1236$ zł'] },
    { kind: 'closed', num: 3, skillId: 'potegi-wym', text: 'Liczba $\\sqrt{5\\sqrt{5}}$ jest równa', options: ['5^{\\frac{1}{4}}', '5^{\\frac{1}{2}}', '5^{\\frac{3}{4}}', '5'], correct: 2,
      solution: ['$5\\sqrt{5} = 5^1\\cdot 5^{\\frac12} = 5^{\\frac32}$', '$\\sqrt{5^{\\frac32}} = 5^{\\frac32\\cdot\\frac12} = 5^{\\frac34}$'] },
    { kind: 'closed', num: 4, skillId: 'logarytmy', text: 'Liczba $\\log_8 4 - \\log_8 32$ jest równa', options: ['(-2)', '(-1)', '1', '2'], correct: 1,
      solution: ['$\\log_8 4 - \\log_8 32 = \\log_8 \\frac{4}{32} = \\log_8 \\frac{1}{8} = -1$'] },
    { kind: 'closed', num: 5, skillId: 'wzory-skr', text: 'Wartość wyrażenia $x^2 + 10x + 25$ dla $x = \\sqrt{2} - 5$ jest równa', options: ['2', '\\sqrt{2}', '2 - 20\\sqrt{2}', '62 - 10\\sqrt{2}'], correct: 0,
      solution: ['$x^2 + 10x + 25 = (x + 5)^2$', '$(\\sqrt{2} - 5 + 5)^2 = (\\sqrt{2})^2 = 2$'] },
    { kind: 'closed', num: 6, skillId: 'rown-kwadr', text: 'Dane jest równanie', display: '3(x+3)(x-m)(2x+4) = 0', after: 'gdzie $x$ jest niewiadomą, natomiast $m$ jest pewną liczbą rzeczywistą. Suma wszystkich rozwiązań tego równania jest równa $0$. Liczba $m$ jest równa',
      options: ['(-7)', '2', '5', '7'], correct: 2,
      solution: ['Rozwiązania: $x = -3$, $x = m$, $x = -2$ (z $2x + 4 = 0$).', '$-3 + m - 2 = 0$, więc $m = 5$'] },
    { kind: 'closed', num: 7, skillId: 'rown-wymierne', text: 'Rozwiązaniem równania', display: '\\frac{x+2}{3x-1} = \\frac{2}{5}', after: 'jest liczba', options: ['\\frac{1}{3}', '\\frac{8}{11}', '3', '12'], correct: 3,
      solution: ['Mnożymy na krzyż: $5(x + 2) = 2(3x - 1)$', '$5x + 10 = 6x - 2$, więc $x = 12$ (i $3\\cdot 12 - 1 \\ne 0$)'] },
    { kind: 'closed', num: 8, skillId: 'wykres-funkcji', text: INFO_8, figure: WYKRES_8, after: 'Zadanie 8. Wskaż zdanie prawdziwe.',
      options: [`${T('Rozwiązaniem równania ')}f(x) = 3${T(' jest liczba ')}1.`, `${T('Największa wartość funkcji ')}f${T(' w przedziale ')}\\langle 2, 3\\rangle${T(' jest równa ')}3.`, `${T('Funkcja ')}f${T(' jest malejąca w przedziale ')}\\langle 0, 3\\rangle.`, `${T('Funkcja ')}f${T(' ma dwa miejsca zerowe.')}`], correct: 0,
      solution: ['Lewy odcinek wykresu przechodzi przez $(-4, -2)$ i $(2, 4)$, to $y = x + 2$. Stąd $f(1) = 3$: zdanie A jest prawdziwe.', 'B: $f(2) = 4$, więc największa wartość w $\\langle 2, 3\\rangle$ to $4$. C: na $\\langle 0, 2\\rangle$ funkcja rośnie. D: miejsce zerowe jest jedno, $x = -2$ (w $x = 5$ jest pusta kropka).'] },
    { kind: 'closed', num: 9, skillId: 'wykres-funkcji', text: INFO_8, figure: WYKRES_8, after: 'Zadanie 9. Zbiorem wartości funkcji $f$ jest przedział',
      options: ['\\langle -4, 5)', '(-4, 5\\rangle', '\\langle -2, 4\\rangle', '(-2, 4)'], correct: 2,
      solution: ['Najniższy punkt wykresu to $(-4, -2)$ (pełna kropka), najwyższy to $(2, 4)$ (pełna kropka).', 'Prawy odcinek ma wartości z przedziału $(0, 3)$, czyli mieszczą się w środku. Zbiór wartości: $\\langle -2, 4\\rangle$'] },
    { kind: 'closed', num: 10, skillId: 'wykres-funkcji', text: INFO_8, figure: WYKRES_8, after: 'Zadanie 10. Zbiorem wszystkich argumentów, dla których funkcja $f$ przyjmuje wartości ujemne, jest przedział',
      options: ['\\langle -4, -2)', '(-4, -2)', '\\langle -4, 0)', '\\langle -2, 2)'], correct: 0,
      solution: ['Wykres leży pod osią $x$ od $x = -4$ (pełna kropka, $f(-4) = -2 < 0$) do $x = -2$, gdzie $f(-2) = 0$ (już nie ujemne).', 'Odpowiedź: $\\langle -4, -2)$'] },
    { kind: 'closed', num: 11, skillId: 'f-liniowa', text: INFO_11, figure: WYKRES_11, after: 'Zadanie 11. Liczba $a$ oraz liczba $b$ we wzorze funkcji $f$ spełniają warunki:',
      options: ['a > 0 \\text{ oraz } b > 0.', 'a > 0 \\text{ oraz } b < 0.', 'a < 0 \\text{ oraz } b > 0.', 'a < 0 \\text{ oraz } b < 0.'], correct: 3,
      solution: ['Funkcja maleje, więc $a < 0$.', 'Wykres przecina oś $y$ w punkcie $(0, -3)$, więc $b = -3 < 0$.'] },
    { kind: 'closed', num: 12, skillId: 'f-liniowa', text: INFO_11, figure: WYKRES_11, after: 'Zadanie 12. Tangens kąta o mierze $\\alpha$ jest równy',
      options: ['\\left(-\\frac{3}{2}\\right)', '\\left(-\\frac{2}{3}\\right)', '\\frac{2}{3}', '\\frac{3}{2}'], correct: 0,
      solution: ['Wykres przechodzi przez $(-2, 0)$ i $(0, -3)$, więc $a = \\frac{-3 - 0}{0 - (-2)} = -\\frac{3}{2}$', 'Tangens kąta nachylenia prostej do osi $Ox$ to współczynnik kierunkowy: $\\operatorname{tg}\\alpha = -\\frac{3}{2}$'] },
    { kind: 'closed', num: 13, skillId: 'f-kwadratowa', text: 'W chwili $t = 0$ z poziomu ziemi wyrzucono piłeczkę pionowo do góry. Przyjmijmy, że wysokość $h$, na której znajduje się piłeczka w danej chwili $t$, jest określona wzorem', display: 'h(t) = -4{,}9t^2 + 14{,}7t',
      after: 'gdzie czas $t$ jest wyrażony w sekundach (s) i zmienia się od $0$ do chwili pierwszego uderzenia piłeczki o ziemię, a wysokość $h$ jest wyrażona w metrach i jest liczona względem poziomu ziemi. Wyrzucona piłeczka po raz pierwszy uderzy w ziemię w chwili',
      options: ['t = 1{,}5\\text{ s}', 't = 2\\text{ s}', 't = 2{,}5\\text{ s}', 't = 3\\text{ s}'], correct: 3,
      solution: ['Uderzenie w ziemię: $h(t) = 0$, czyli $t(-4{,}9t + 14{,}7) = 0$', '$t = 0$ (wyrzut) albo $t = \\frac{14{,}7}{4{,}9} = 3$ s'] },
    { kind: 'closed', num: 14, skillId: 'ciag-arytm', text: 'Ciąg arytmetyczny $(a_n)$ jest określony dla każdej liczby naturalnej $n \\ge 1$. W tym ciągu $a_1 = 1$ oraz $a_5 = 17$. Dziewiąty wyraz ciągu $(a_n)$ jest równy', options: ['29', '33', '34', '37'], correct: 1,
      solution: ['$a_5 = a_1 + 4r$: $17 = 1 + 4r$, więc $r = 4$', '$a_9 = a_1 + 8r = 1 + 32 = 33$'] },
    { kind: 'closed', num: 15, skillId: 'ciag-geom', text: 'Ciąg geometryczny $(a_n)$ jest określony dla każdej liczby naturalnej $n \\ge 1$. Wyrazy trzeci i szósty tego ciągu spełniają warunek $a_3\\cdot a_6 = 18$. Iloczyn $a_2\\cdot a_7$ jest równy', options: ['9', '14', '18', '36'], correct: 2,
      solution: ['$a_3\\cdot a_6 = a_1q^2\\cdot a_1q^5 = a_1^2q^7$', '$a_2\\cdot a_7 = a_1q\\cdot a_1q^6 = a_1^2q^7 = 18$'] },
    { kind: 'closed', num: 16, skillId: 'tryg-sin-cos', text: 'Dany jest trójkąt prostokątny $ABC$, w którym bok $AC$ jest przeciwprostokątną oraz $|BC| = 2$ i $|AC| = 2\\sqrt{10}$. Oznaczmy kąt $BCA$ przez $\\gamma$ (zobacz rysunek).', figure: TROJKAT_16, after: 'Sinus kąta $\\gamma$ jest równy',
      options: ['\\frac{1}{\\sqrt{10}}', '\\frac{1}{3}', '\\frac{3}{\\sqrt{10}}', '\\frac{\\sqrt{10}}{\\sqrt{11}}'], correct: 2,
      solution: ['$|AB|^2 = (2\\sqrt{10})^2 - 2^2 = 40 - 4 = 36$, więc $|AB| = 6$', 'Naprzeciw kąta $\\gamma$ leży bok $AB$: $\\sin\\gamma = \\frac{6}{2\\sqrt{10}} = \\frac{3}{\\sqrt{10}}$'] },
    { kind: 'closed', num: 17, skillId: 'tryg-sin-cos', text: 'Kąt $\\alpha$ jest ostry i spełnia warunek $\\frac{3\\sin\\alpha + 4\\cos\\alpha}{4\\cos\\alpha} = 6$. Tangens kąta $\\alpha$ jest równy', options: ['\\frac{5}{8}', '\\frac{8}{3}', '\\frac{32}{5}', '\\frac{20}{3}'], correct: 3,
      solution: ['Dzielimy licznik przez mianownik: $\\frac{3\\sin\\alpha}{4\\cos\\alpha} + 1 = 6$', '$\\frac34\\operatorname{tg}\\alpha = 5$, więc $\\operatorname{tg}\\alpha = \\frac{20}{3}$'] },
    { kind: 'closed', num: 18, skillId: 'katy-okrag', text: 'Punkty $A$, $B$, $C$ oraz $D$ leżą na okręgu o środku w punkcie $O$. Punkt $B$ leży na krótszym łuku $AC$. Kąt $CDA$ ma miarę $50^\\circ$, a kąt $COB$ ma miarę $30^\\circ$ (zobacz rysunek).', figure: OKRAG_18, after: 'Miara kąta ostrego $BOA$ jest równa',
      options: ['50^\\circ', '60^\\circ', '70^\\circ', '100^\\circ'], correct: 2,
      solution: ['Kąt środkowy $AOC$ oparty na tym samym łuku co kąt wpisany $CDA$: $2\\cdot 50^\\circ = 100^\\circ$', '$|\\angle BOA| = 100^\\circ - 30^\\circ = 70^\\circ$'] },
    { kind: 'closed', num: 19, skillId: 'trojkaty', text: 'W okrąg $\\mathcal{O}$ o promieniu $9\\sqrt{3}$ wpisano trójkąt równoboczny $\\mathcal{T}$. Bok trójkąta $\\mathcal{T}$ ma długość', options: ['\\frac{27}{2}', '\\frac{27\\sqrt{3}}{2}', '27', '27\\sqrt{3}'], correct: 2,
      solution: ['Promień okręgu opisanego na trójkącie równobocznym: $R = \\frac23 h = \\frac{a\\sqrt3}{3}$', '$a = \\frac{3R}{\\sqrt3} = R\\sqrt3 = 9\\sqrt3\\cdot\\sqrt3 = 27$'] },
    { kind: 'closed', num: 20, skillId: 'trojkaty', text: 'Na płaszczyźnie dane są cztery proste: $k$, $l$, $m$ oraz $n$. Proste $k$ oraz $l$ są równoległe. Prosta $m$ przecina proste $k$ oraz $l$ w punktach – odpowiednio – $A$ oraz $C$. Prosta $n$ przecina proste $k$ oraz $l$ w punktach – odpowiednio – $D$ oraz $B$. Odcinki $AC$ i $BD$ przecinają się w punkcie $O$. Ponadto $|OA| = 12$, $|OB| = 6$ oraz $|OC| = 8$ (zobacz rysunek).', figure: PROSTE_20, after: 'Odcinek $OD$ ma długość',
      options: ['4', '9', '10', '16'], correct: 1,
      solution: ['Trójkąty $AOD$ i $COB$ są podobne (kąty wierzchołkowe przy $O$ i kąty naprzemianległe przy prostych równoległych).', '$\\frac{|OD|}{|OB|} = \\frac{|OA|}{|OC|}$: $|OD| = 6\\cdot\\frac{12}{8} = 9$'] },
    { kind: 'closed', num: 21, skillId: 'proste', text: 'W układzie współrzędnych $(x, y)$ dana jest prosta $k$ o równaniu $y = -\\frac{1}{3}x + 2$. Prosta $l$ jest równoległa do prostej $k$ i przechodzi przez punkt $(2, -2)$. Prosta $l$ przecina oś $Oy$ w punkcie',
      options: ['(0, -3)', '\\left(0, -\\frac{1}{2}\\right)', '(0, -1)', '\\left(0, -\\frac{4}{3}\\right)'], correct: 3,
      solution: ['Prosta równoległa ma ten sam współczynnik: $y = -\\frac13 x + b$', '$-2 = -\\frac23 + b$, więc $b = -\\frac43$. Punkt na osi $Oy$: $\\left(0, -\\frac43\\right)$'] },
    { kind: 'closed', num: 22, skillId: 'graniastoslupy', text: 'Pole powierzchni całkowitej sześcianu jest równe $12$. Długość przekątnej tego sześcianu jest równa', options: ['\\sqrt{2}', '2', '2\\sqrt{2}', '\\sqrt{6}'], correct: 3,
      solution: ['$6a^2 = 12$, więc $a = \\sqrt2$', 'Przekątna sześcianu: $a\\sqrt3 = \\sqrt2\\cdot\\sqrt3 = \\sqrt6$'] },
    { kind: 'closed', num: 23, skillId: 'bryly-obrotowe', text: 'Stożek i walec mają równe wysokości. Promień podstawy stożka jest dwa razy większy od promienia podstawy walca. Stosunek objętości stożka do objętości walca jest równy', options: ['\\frac{1}{12}', '\\frac{1}{6}', '\\frac{2}{3}', '\\frac{4}{3}'], correct: 3,
      solution: ['$V_s = \\frac13\\pi(2r)^2h = \\frac43\\pi r^2h$, $V_w = \\pi r^2h$', '$\\frac{V_s}{V_w} = \\frac43$'] },
    { kind: 'closed', num: 24, skillId: 'kombinatoryka', text: 'Wszystkich liczb naturalnych trzycyfrowych nieparzystych, w których zapisie dziesiętnym występują tylko cyfry $0$, $1$, $2$, $3$, $4$, $5$, $6$ (np.: $321$, $555$), jest', options: ['6\\cdot 7\\cdot 3', '6\\cdot 7\\cdot 7', '7\\cdot 7\\cdot 3', '7\\cdot 7\\cdot 7'], correct: 0,
      solution: ['Cyfra setek: $6$ możliwości (bez zera), dziesiątek: $7$, jedności: $3$ (tylko $1$, $3$, $5$).', 'Razem $6\\cdot 7\\cdot 3$'] },
    { kind: 'closed', num: 25, skillId: 'statystyka', text: 'Średnia arytmetyczna trzech liczb: $a$, $b$, $c$, jest równa $2$. Średnia arytmetyczna czterech liczb: $d$, $e$, $f$, $g$, jest równa $5{,}5$. Średnia arytmetyczna siedmiu liczb: $a$, $b$, $c$, $d$, $e$, $f$, $g$, jest równa', options: ['3{,}5', '3{,}75', '4', '4{,}25'], correct: 2,
      solution: ['$a + b + c = 3\\cdot 2 = 6$, $d + e + f + g = 4\\cdot 5{,}5 = 22$', 'Średnia: $\\frac{6 + 22}{7} = 4$'] },

    { kind: 'open', num: 26, skillId: 'nier-kwadr', task: {
      id: 'cke-26', points: 2, text: 'Rozwiąż nierówność', display: '3x^2 + 4x \\ge 6x + 8',
      steps: [{ title: 'Miejsca zerowe trójmianu $3x^2 - 2x - 8$', pts: 1, label: 'x \\in \\{', answer: { kind: 'input', expected: '-\\frac{4}{3}; 2', form: 'list', suffix: '\\}' }, verify: { expr: '3x^2-2x-8', vars: ['x'] }, verifyRoots: true }],
      parts: [{ label: 'x \\in', answer: { kind: 'input', expected: '\\left(-\\infty; -\\frac{4}{3}\\right\\rangle \\cup \\left\\langle 2; \\infty\\right)', form: 'interval' }, verify: { expr: '3x^2+4x-6x-8', vars: ['x'] }, verifyIneq: '>=' }],
      scheme: [
        { pts: 1, desc: 'Obliczenie pierwiastków trójmianu $3x^2 - 2x - 8$: $x_1 = -\\frac{4}{3}$, $x_2 = 2$.' },
        { pts: 2, desc: 'Podanie zbioru rozwiązań: $\\left(-\\infty, -\\frac43\\right\\rangle \\cup \\langle 2, +\\infty)$.' },
      ],
      solution: ['Przenosimy wszystko na lewą stronę: $3x^2 - 2x - 8 \\ge 0$', '$\\Delta = 4 + 96 = 100$, $x_1 = \\frac{2 - 10}{6} = -\\frac43$, $x_2 = \\frac{2 + 10}{6} = 2$', 'Ramiona paraboli w górę, więc trójmian jest nieujemny poza pierwiastkami: $x \\in \\left(-\\infty, -\\frac43\\right\\rangle \\cup \\langle 2, +\\infty)$'],
    } },
    { kind: 'open', num: 27, skillId: 'wzory-skr', task: {
      id: 'cke-27', points: 2, parts: [], text: 'Wykaż, że dla każdej liczby rzeczywistej $a$ i dla każdej liczby rzeczywistej $b$ prawdziwa jest nierówność', display: 'a(a - b) \\ge b(a - 3b)',
      scheme: [
        { pts: 1, desc: 'Przekształcenie nierówności do postaci $(a - b)^2 + 2b^2 \\ge 0$ albo obliczenie wyróżnika $\\Delta = -8b^2$ trójmianu $a^2 - 2ab + 3b^2$ (zmienna $a$).' },
        { pts: 2, desc: 'Pełne uzasadnienie: suma kwadratu i liczby $2b^2 \\ge 0$ jest nieujemna (albo $\\Delta \\le 0$ i współczynnik przy $a^2$ dodatni).' },
      ],
      solution: ['$a^2 - ab \\ge ab - 3b^2$, czyli $a^2 - 2ab + 3b^2 \\ge 0$', '$a^2 - 2ab + b^2 + 2b^2 = (a - b)^2 + 2b^2$', '$(a - b)^2 \\ge 0$ i $2b^2 \\ge 0$, więc suma jest nieujemna dla wszystkich $a$, $b$. Koniec dowodu.'],
    } },
    { kind: 'open', num: 28, skillId: 'procenty', task: {
      id: 'cke-28', points: 2, text: 'Na przedstawienie w pewnym teatrze sprzedawano bilety według poniższego cennika (cennik biletów).',
      table: [['Rodzaj biletu', 'Cena w złotych'], ['Normalny', '$35$'], ['Ulgowy', '$25$']],
      after: 'Na to przedstawienie sprzedano łącznie $200$ biletów. Po opłaceniu kosztów związanych z organizacją przedstawienia w wysokości $25\\%$ wpływów ze sprzedaży biletów organizatorom pozostało $4665$ zł. Oblicz liczbę biletów ulgowych sprzedanych na to przedstawienie.',
      steps: [{ title: 'Równanie z niewiadomą $y$ (liczba biletów ulgowych)', pts: 1, answer: { kind: 'input', expected: '0{,}75\\left(35(200-y)+25y\\right) = 4665', form: 'equation', vars: ['y'] }, verify: { expr: '78' } }],
      parts: [{ label: 'y =', answer: num('78'), verify: { expr: '\\frac{35\\cdot 200 - \\frac{4665}{0.75}}{35-25}' }, verifyFn: () => { for (let y = 0; y <= 200; y++) if (Math.abs(0.75 * (35 * (200 - y) + 25 * y) - 4665) < 1e-9) return y; return NaN; } }],
      scheme: [
        { pts: 1, desc: 'Zapisanie układu $x + y = 200$, $0{,}75\\cdot(35x + 25y) = 4665$ albo równania z jedną niewiadomą, np. $35(200 - y) + 25y = \\frac{4665}{0{,}75}$.' },
        { pts: 2, desc: 'Obliczenie liczby biletów ulgowych: $78$.' },
      ],
      solution: ['Wpływy ze sprzedaży: $\\frac{4665}{0{,}75} = 6220$ zł', '$y$ – bilety ulgowe, $200 - y$ – normalne: $35(200 - y) + 25y = 6220$', '$7000 - 10y = 6220$, więc $y = 78$'],
    } },
    { kind: 'open', num: 29, skillId: 'trojkaty', task: {
      id: 'cke-29', points: 2, parts: [], text: 'Dany jest trójkąt $KLM$, w którym $|KM| = a$ oraz $|LM| = b$. Dwusieczna kąta $LMK$ przecina bok $KL$ w punkcie $N$ (zobacz rysunek).', figure: TROJKAT_29,
      after: 'Wykaż, że stosunek pola trójkąta $KNM$ do pola trójkąta $NLM$ jest równy $\\frac{a}{b}$.',
      scheme: [
        { pts: 1, desc: 'Zapisanie pól z sinusem: $P_{KNM} = \\frac12 a\\cdot|MN|\\sin\\alpha$ i $P_{NLM} = \\frac12 b\\cdot|MN|\\sin\\alpha$, gdzie $|\\angle LMK| = 2\\alpha$ (albo uzasadnienie, że wysokości z $N$ na boki $KM$ i $LM$ są równe).' },
        { pts: 2, desc: 'Pełny dowód: iloraz pól jest równy $\\frac{a}{b}$.' },
      ],
      solution: ['Niech $|\\angle LMK| = 2\\alpha$. Dwusieczna dzieli go na dwa kąty $\\alpha$.', '$P_{KNM} = \\frac12\\cdot a\\cdot|MN|\\cdot\\sin\\alpha$, $P_{NLM} = \\frac12\\cdot b\\cdot|MN|\\cdot\\sin\\alpha$', '$\\frac{P_{KNM}}{P_{NLM}} = \\frac{a}{b}$, bo pozostałe czynniki się skracają ($\\sin\\alpha \\ne 0$, $|MN| \\ne 0$).'],
    } },
    { kind: 'open', num: 30, skillId: 'graniastoslupy', task: {
      id: 'cke-30', points: 2, text: 'Dany jest ostrosłup prawidłowy czworokątny, w którym przekątna podstawy ma długość $8\\sqrt{3}$. Krawędź boczna tego ostrosłupa jest nachylona do płaszczyzny podstawy pod kątem $30^\\circ$. Oblicz objętość tego ostrosłupa.',
      steps: [
        { title: 'Wysokość ostrosłupa', pts: 1, label: 'H =', answer: num('4'), verify: { expr: '4\\sqrt{3}\\tan\\left(\\frac{\\pi}{6}\\right)' } },
        { title: 'Pole podstawy', pts: 1, label: 'P_p =', answer: num('96'), verify: { expr: '\\frac{1}{2}\\left(8\\sqrt{3}\\right)^2' } },
      ],
      parts: [{ label: 'V =', answer: num('128'), verify: { expr: '\\frac{1}{3}\\cdot\\frac{1}{2}\\left(8\\sqrt{3}\\right)^2\\cdot 4\\sqrt{3}\\tan\\left(\\frac{\\pi}{6}\\right)' } }],
      scheme: [
        { pts: 1, desc: 'Obliczenie wysokości $H = 4$ albo pola podstawy $P_p = 96$ (np. $\\frac12(8\\sqrt3)^2$).' },
        { pts: 2, desc: 'Obliczenie objętości $V = 128$.' },
      ],
      solution: ['Połowa przekątnej podstawy: $4\\sqrt3$', '$\\operatorname{tg} 30^\\circ = \\frac{H}{4\\sqrt3}$, więc $H = 4\\sqrt3\\cdot\\frac{\\sqrt3}{3} = 4$', 'Podstawa to kwadrat: $P_p = \\frac{d^2}{2} = \\frac{192}{2} = 96$', '$V = \\frac13\\cdot 96\\cdot 4 = 128$'],
    } },
    { kind: 'open', num: 31, skillId: 'prawdopodobienstwo', task: {
      id: 'cke-31', points: 2, text: 'Dane są dwa zbiory cyfr: $X = \\{1, 3, 5, 7, 9\\}$ oraz $Y = \\{0, 2, 4, 6, 8\\}$. Losujemy jedną cyfrę ze zbioru $X$, a następnie losujemy jedną cyfrę ze zbioru $Y$. Następnie zapisujemy liczbę dwucyfrową w ten sposób, że cyfra wylosowana ze zbioru $X$ jest cyfrą dziesiątek, a cyfra wylosowana ze zbioru $Y$ jest cyfrą jedności tej liczby dwucyfrowej. Oblicz prawdopodobieństwo zdarzenia $A$ polegającego na tym, że otrzymana w ten sposób liczba dwucyfrowa będzie podzielna przez $6$.',
      steps: [
        { title: 'Liczba wszystkich zdarzeń', pts: 1, label: '|\\Omega| =', answer: num('25'), verify: { expr: '5\\cdot 5' } },
        { title: 'Liczba zdarzeń sprzyjających', pts: 1, label: '|A| =', answer: num('9'), verify: { expr: '9' }, verifyFn: () => { let c = 0; for (const x of [1, 3, 5, 7, 9]) for (const y of [0, 2, 4, 6, 8]) if ((10 * x + y) % 6 === 0) c++; return c; } },
      ],
      parts: [{ label: 'P(A) =', answer: num('\\frac{9}{25}'), verify: { expr: '\\frac{9}{25}' }, verifyFn: () => { let c = 0; for (const x of [1, 3, 5, 7, 9]) for (const y of [0, 2, 4, 6, 8]) if ((10 * x + y) % 6 === 0) c++; return c / 25; } }],
      scheme: [
        { pts: 1, desc: 'Obliczenie $|\\Omega| = 5\\cdot 5 = 25$ albo wypisanie wszystkich zdarzeń sprzyjających: $12, 18, 30, 36, 54, 72, 78, 90, 96$ ($|A| = 9$).' },
        { pts: 2, desc: 'Obliczenie prawdopodobieństwa $P(A) = \\frac{9}{25}$.' },
      ],
      solution: ['$|\\Omega| = 5\\cdot 5 = 25$', 'Liczba jest podzielna przez $6$, gdy jest parzysta (zawsze tutaj) i suma cyfr dzieli się przez $3$: $12, 18, 30, 36, 54, 72, 78, 90, 96$, czyli $|A| = 9$', '$P(A) = \\frac{9}{25}$'],
    } },
    { kind: 'open', num: 32, skillId: 'f-kwadratowa', task: {
      id: 'cke-32', points: 4, text: 'W układzie współrzędnych $(x, y)$ wykresem funkcji kwadratowej $f$ jest parabola o wierzchołku w punkcie $W = (3, -2)$. Funkcja kwadratowa $g$ jest określona za pomocą funkcji $f$ wzorem $g(x) = f(x + 1)$. Jednym z miejsc zerowych funkcji $g$ jest liczba $0$. Wyznacz wzór funkcji $f$ w postaci ogólnej.',
      steps: [
        { title: 'Miejsca zerowe funkcji $f$', pts: 1, label: 'x \\in \\{', answer: { kind: 'input', expected: '1; 5', form: 'list', suffix: '\\}' }, verify: { expr: '\\frac{1}{2}x^2-3x+\\frac{5}{2}', vars: ['x'] }, verifyRoots: true },
        { title: 'Współczynnik $a$', pts: 3, label: 'a =', answer: num('\\frac{1}{2}'), verify: { expr: '\\frac{2}{(1-3)^2}' } },
      ],
      parts: [{ label: 'f(x) =', answer: { kind: 'input', expected: '\\frac{1}{2}x^2 - 3x + \\frac{5}{2}', form: 'polynomial', vars: ['x'] }, verify: { expr: '\\frac{1}{2}(x-3)^2-2', vars: ['x'] } }],
      scheme: [
        { pts: 1, desc: 'Zapisanie $f(x) = a(x - 3)^2 - 2$ albo zauważenie, że $1$ jest miejscem zerowym $f$ (bo $f(1) = g(0) = 0$).' },
        { pts: 2, desc: 'Zapisanie $f(x) = a(x - 3)^2 - 2$ razem z miejscem zerowym $x = 1$, albo $f(x) = a(x - 1)(x - 5)$.' },
        { pts: 3, desc: 'Obliczenie jednego współczynnika: $a = \\frac12$, $b = -3$ albo $c = \\frac52$.' },
        { pts: 4, desc: 'Wzór w postaci ogólnej: $f(x) = \\frac12 x^2 - 3x + \\frac52$.' },
      ],
      solution: ['$g(0) = f(0 + 1) = f(1) = 0$, więc $1$ jest miejscem zerowym funkcji $f$.', 'Postać kanoniczna: $f(x) = a(x - 3)^2 - 2$, a z $f(1) = 0$: $4a - 2 = 0$, więc $a = \\frac12$', '$f(x) = \\frac12(x^2 - 6x + 9) - 2 = \\frac12 x^2 - 3x + \\frac52$'],
    } },
    { kind: 'open', num: 33, skillId: 'ciag-geom', task: {
      id: 'cke-33', points: 4, text: 'Ciąg arytmetyczny $(a_n)$ jest określony wzorem $a_n = 3n + 5$ dla każdej liczby naturalnej $n \\ge 1$. Trzywyrazowy ciąg $(a_1, a_9, a_k)$ jest geometryczny. Oblicz $k$ oraz sumę $S_k$ początkowych $k$ wyrazów ciągu arytmetycznego $(a_n)$.',
      steps: [
        { title: 'Dziewiąty wyraz', pts: 1, label: 'a_9 =', answer: num('32'), verify: { expr: '3\\cdot 9+5' } },
        { title: 'Trzeci wyraz ciągu geometrycznego', pts: 2, label: 'a_k =', answer: num('128'), verify: { expr: '\\frac{32^2}{8}' } },
      ],
      parts: [
        { label: 'k =', pts: 3, answer: num('41'), verify: { expr: '\\frac{\\frac{32^2}{8}-5}{3}' }, verifyFn: () => { for (let k = 1; k < 1000; k++) if ((3 * 9 + 5) ** 2 === (3 + 5) * (3 * k + 5)) return k; return NaN; } },
        { label: 'S_k =', pts: 3, answer: num('2788'), verify: { expr: '\\frac{8+128}{2}\\cdot 41' }, verifyFn: () => { let s = 0; for (let n = 1; n <= 41; n++) s += 3 * n + 5; return s; } },
      ],
      scheme: [
        { pts: 1, desc: 'Obliczenie $a_1 = 8$ i $a_9 = 32$ albo zapisanie warunku $(a_9)^2 = a_1\\cdot a_k$.' },
        { pts: 2, desc: 'Wyznaczenie wyrazów ciągu geometrycznego $(8, 32, 128)$ albo równania $32^2 = 8\\cdot(3k + 5)$.' },
        { pts: 3, desc: 'Obliczenie $k = 41$ albo $S_k = 2788$.' },
        { pts: 4, desc: 'Obliczenie $k = 41$ i $S_k = 2788$.' },
      ],
      solution: ['$a_1 = 8$, $a_9 = 3\\cdot 9 + 5 = 32$', 'Ciąg geometryczny: $a_9^2 = a_1\\cdot a_k$, czyli $1024 = 8\\cdot a_k$, $a_k = 128$', '$3k + 5 = 128$, więc $k = 41$', '$S_{41} = \\frac{a_1 + a_{41}}{2}\\cdot 41 = \\frac{8 + 128}{2}\\cdot 41 = 2788$'],
    } },
    { kind: 'open', num: 34, skillId: 'proste', task: {
      id: 'cke-34', points: 5, text: 'W układzie współrzędnych $(x, y)$ punkty $A = (-4, -2)$ i $B = (-2, 10)$ są wierzchołkami trójkąta równoramiennego $ABC$, w którym $|AC| = |BC|$. Wierzchołek $C$ leży na osi $Ox$ układu współrzędnych. Oblicz współrzędne wierzchołka $C$ oraz pole trójkąta $ABC$.',
      steps: [
        { title: 'Długość podstawy $AB$', pts: 1, label: '|AB| =', answer: { kind: 'input', expected: '2\\sqrt{37}', form: 'surd' }, verify: { expr: '\\sqrt{(-2+4)^2+(10+2)^2}' } },
        { title: 'Symetralna odcinka $AB$ (w postaci $y = ax + b$)', pts: 2, answer: { kind: 'input', expected: 'y = -\\frac{1}{6}x + \\frac{7}{2}', form: 'any', vars: ['x'] }, verify: { expr: '-\\frac{1}{6}(x+3)+4', vars: ['x'] } },
      ],
      parts: [
        { label: 'C =', pts: 3, answer: { kind: 'input', expected: '\\left(21; 0\\right)', form: 'point' }, verify: { expr: '0' }, verifyPoint: [21, 0] },
        { label: 'P =', answer: num('148'), verify: { expr: '\\frac{1}{2}\\left|(-2+4)(0+2)-(10+2)(21+4)\\right|' } },
      ],
      score: ([ab, sym], [c]) => (c && ab ? 4 : c ? 3 : sym ? 2 : ab ? 1 : 0),
      scheme: [
        { pts: 1, desc: 'Obliczenie $|AB| = 2\\sqrt{37}$ albo środka $M = (-3, 4)$, albo współczynnika kierunkowego $a_{AB} = 6$.' },
        { pts: 2, desc: 'Wyznaczenie równania symetralnej odcinka $AB$: $y = -\\frac16(x + 3) + 4$ albo równania z niewiadomą $x_C$ z warunku $|AC| = |BC|$.' },
        { pts: 3, desc: 'Obliczenie współrzędnych $C = (21, 0)$.' },
        { pts: 4, desc: 'Obliczenie $C = (21, 0)$ i $|AB| = 2\\sqrt{37}$ (albo $|CM| = 4\\sqrt{37}$).' },
        { pts: 5, desc: 'Obliczenie $C = (21, 0)$ i pola $P_{ABC} = 148$.' },
      ],
      solution: ['$C = (x, 0)$. Z $|AC| = |BC|$: $(x + 4)^2 + 2^2 = (x + 2)^2 + 10^2$', '$x^2 + 8x + 20 = x^2 + 4x + 104$, więc $4x = 84$, $x = 21$ i $C = (21, 0)$', 'Środek $AB$: $M = (-3, 4)$, $|AB| = \\sqrt{4 + 144} = 2\\sqrt{37}$, $|CM| = \\sqrt{24^2 + 4^2} = 4\\sqrt{37}$', '$P = \\frac12\\cdot 2\\sqrt{37}\\cdot 4\\sqrt{37} = 148$'],
    } },
  ],
};

export const ARKUSZE: Arkusz[] = [MAJ_2026];
