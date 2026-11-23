// Karta wzorów na wzór „Wybranych wzorów matematycznych” CKE (matura z matematyki, formuła 2015, poziom podstawowy).
// Każdy wpis: [opis, wzór w LaTeX] albo sama linijka tekstu z $...$.

export interface WzorSekcja { id: string; title: string; items: { label?: string; tex?: string; text?: string }[] }

export const WZORY: WzorSekcja[] = [
  {
    id: 'abs', title: 'Wartość bezwzględna',
    items: [
      { tex: '|x| = \\begin{cases} x & \\text{dla } x \\ge 0 \\\\ -x & \\text{dla } x < 0 \\end{cases}' },
      { text: 'Dla $r \\ge 0$:' },
      { tex: '|x - a| \\le r \\iff a - r \\le x \\le a + r' },
      { tex: '|x - a| \\ge r \\iff x \\le a - r \\ \\text{ lub } \\ x \\ge a + r' },
    ],
  },
  {
    id: 'potegi', title: 'Potęgi i pierwiastki',
    items: [
      { text: 'Dla $a, b > 0$ oraz liczb rzeczywistych $m, n$:' },
      { tex: 'a^m \\cdot a^n = a^{m+n} \\qquad \\frac{a^m}{a^n} = a^{m-n} \\qquad \\left(a^m\\right)^n = a^{m\\cdot n}' },
      { tex: '(a\\cdot b)^n = a^n b^n \\qquad \\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n} \\qquad a^{-n} = \\frac{1}{a^n}' },
      { tex: 'a^{\\frac{m}{n}} = \\sqrt[n]{a^m} \\qquad \\sqrt{a^2} = |a|' },
    ],
  },
  {
    id: 'log', title: 'Logarytmy',
    items: [
      { text: 'Dla $a > 0$, $a \\ne 1$, $c > 0$:' },
      { tex: '\\log_a c = b \\iff a^b = c' },
      { text: 'Dla $x, y > 0$ i liczby rzeczywistej $r$:' },
      { tex: '\\log_a (x\\cdot y) = \\log_a x + \\log_a y \\qquad \\log_a \\frac{x}{y} = \\log_a x - \\log_a y' },
      { tex: '\\log_a x^r = r\\cdot\\log_a x \\qquad \\log_b c = \\frac{\\log_a c}{\\log_a b}' },
      { text: '$\\log x$ oznacza $\\log_{10} x$.' },
    ],
  },
  {
    id: 'skrocone', title: 'Wzory skróconego mnożenia',
    items: [
      { tex: '(a + b)^2 = a^2 + 2ab + b^2 \\qquad (a - b)^2 = a^2 - 2ab + b^2' },
      { tex: 'a^2 - b^2 = (a - b)(a + b)' },
      { tex: '(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3 \\qquad (a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3' },
      { tex: 'a^3 + b^3 = (a + b)\\left(a^2 - ab + b^2\\right) \\qquad a^3 - b^3 = (a - b)\\left(a^2 + ab + b^2\\right)' },
    ],
  },
  {
    id: 'kwadratowa', title: 'Funkcja kwadratowa',
    items: [
      { label: 'Postać ogólna', tex: 'f(x) = ax^2 + bx + c, \\quad a \\ne 0' },
      { label: 'Wierzchołek', tex: 'W = (p; q), \\quad p = \\frac{-b}{2a}, \\quad q = \\frac{-\\Delta}{4a}, \\quad \\Delta = b^2 - 4ac' },
      { label: 'Postać kanoniczna', tex: 'f(x) = a(x - p)^2 + q' },
      { label: 'Miejsca zerowe ($\\Delta \\ge 0$)', tex: 'x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}' },
      { label: 'Postać iloczynowa ($\\Delta \\ge 0$)', tex: 'f(x) = a(x - x_1)(x - x_2)' },
      { label: 'Wzory Viète’a', tex: 'x_1 + x_2 = \\frac{-b}{a}, \\qquad x_1\\cdot x_2 = \\frac{c}{a}' },
    ],
  },
  {
    id: 'ciagi', title: 'Ciągi',
    items: [
      { label: 'Arytmetyczny', tex: 'a_n = a_1 + (n - 1)r \\qquad S_n = \\frac{a_1 + a_n}{2}\\cdot n = \\frac{2a_1 + (n-1)r}{2}\\cdot n' },
      { tex: 'a_n = \\frac{a_{n-1} + a_{n+1}}{2} \\quad \\text{dla } n \\ge 2' },
      { label: 'Geometryczny', tex: 'a_n = a_1\\cdot q^{n-1} \\qquad S_n = a_1\\cdot\\frac{1 - q^n}{1 - q} \\ \\text{dla } q \\ne 1, \\qquad S_n = n\\cdot a_1 \\ \\text{dla } q = 1' },
      { tex: 'a_n^2 = a_{n-1}\\cdot a_{n+1} \\quad \\text{dla } n \\ge 2' },
      { label: 'Procent składany', tex: 'K_n = K\\cdot\\left(1 + \\frac{p}{100}\\right)^n' },
    ],
  },
  {
    id: 'tryg', title: 'Trygonometria',
    items: [
      { text: 'W trójkącie prostokątnym o przyprostokątnych $a$ (naprzeciw $\\alpha$), $b$ i przeciwprostokątnej $c$:' },
      { tex: '\\sin\\alpha = \\frac{a}{c} \\qquad \\cos\\alpha = \\frac{b}{c} \\qquad \\operatorname{tg}\\alpha = \\frac{a}{b}' },
      { tex: '\\sin^2\\alpha + \\cos^2\\alpha = 1 \\qquad \\operatorname{tg}\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha}' },
      { tex: '\\sin\\left(90^\\circ - \\alpha\\right) = \\cos\\alpha \\qquad \\sin\\left(180^\\circ - \\alpha\\right) = \\sin\\alpha \\qquad \\cos\\left(180^\\circ - \\alpha\\right) = -\\cos\\alpha' },
      { tex: '\\begin{array}{c|ccccc} & 0^\\circ & 30^\\circ & 45^\\circ & 60^\\circ & 90^\\circ \\\\ \\sin & 0 & \\frac12 & \\frac{\\sqrt2}{2} & \\frac{\\sqrt3}{2} & 1 \\\\ \\cos & 1 & \\frac{\\sqrt3}{2} & \\frac{\\sqrt2}{2} & \\frac12 & 0 \\\\ \\operatorname{tg} & 0 & \\frac{\\sqrt3}{3} & 1 & \\sqrt3 & \\text{—} \\end{array}' },
    ],
  },
  {
    id: 'planimetria', title: 'Planimetria',
    items: [
      { label: 'Pole trójkąta', tex: 'P = \\frac12 a\\cdot h_a = \\frac12 ab\\sin\\gamma = \\sqrt{p(p-a)(p-b)(p-c)}, \\quad p = \\frac{a+b+c}{2}' },
      { label: 'Trójkąt równoboczny', tex: 'h = \\frac{a\\sqrt3}{2} \\qquad P = \\frac{a^2\\sqrt3}{4}' },
      { label: 'Okręgi trójkąta', tex: 'r = \\frac{P}{p} \\qquad R = \\frac{abc}{4P}' },
      { label: 'Twierdzenie sinusów', tex: '\\frac{a}{\\sin\\alpha} = \\frac{b}{\\sin\\beta} = \\frac{c}{\\sin\\gamma} = 2R' },
      { label: 'Twierdzenie cosinusów', tex: 'c^2 = a^2 + b^2 - 2ab\\cos\\gamma' },
      { label: 'Czworokąty', tex: 'P_{\\text{równoległoboku}} = a\\cdot h = ab\\sin\\alpha \\qquad P_{\\text{rombu}} = \\frac{d_1 d_2}{2} \\qquad P_{\\text{trapezu}} = \\frac{a + b}{2}\\cdot h' },
      { label: 'Koło', tex: 'P = \\pi r^2 \\qquad L = 2\\pi r' },
      { label: 'Wycinek koła i łuk (kąt $\\alpha$)', tex: 'P = \\frac{\\alpha}{360^\\circ}\\cdot\\pi r^2 \\qquad l = \\frac{\\alpha}{360^\\circ}\\cdot 2\\pi r' },
      { text: 'Kąt wpisany jest równy połowie kąta środkowego opartego na tym samym łuku. Kąt wpisany oparty na półokręgu jest prosty.' },
      { text: 'Czworokąt da się wpisać w okrąg, gdy $\\alpha + \\gamma = \\beta + \\delta = 180^\\circ$; opisać na okręgu, gdy $a + c = b + d$.' },
    ],
  },
  {
    id: 'analityczna', title: 'Geometria analityczna',
    items: [
      { label: 'Długość i środek odcinka', tex: '|AB| = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2} \\qquad S = \\left(\\frac{x_A + x_B}{2}; \\frac{y_A + y_B}{2}\\right)' },
      { label: 'Prosta', tex: 'y = ax + b \\qquad Ax + By + C = 0' },
      { label: 'Prosta przez dwa punkty', tex: '(y - y_A)(x_B - x_A) - (y_B - y_A)(x - x_A) = 0' },
      { label: 'Współczynnik kierunkowy', tex: 'a = \\frac{y_B - y_A}{x_B - x_A} = \\operatorname{tg}\\alpha' },
      { label: 'Proste $y = a_1x + b_1$ i $y = a_2x + b_2$', tex: '\\text{równoległe: } a_1 = a_2 \\qquad \\text{prostopadłe: } a_1\\cdot a_2 = -1' },
      { label: 'Odległość punktu od prostej', tex: 'd = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}' },
      { label: 'Okrąg', tex: '(x - a)^2 + (y - b)^2 = r^2' },
    ],
  },
  {
    id: 'stereometria', title: 'Stereometria',
    items: [
      { label: 'Graniastosłup', tex: 'V = P_p\\cdot H \\qquad P_c = 2P_p + P_b' },
      { label: 'Ostrosłup', tex: 'V = \\frac13 P_p\\cdot H \\qquad P_c = P_p + P_b' },
      { label: 'Walec', tex: 'V = \\pi r^2 h \\qquad P_b = 2\\pi r h \\qquad P_c = 2\\pi r(r + h)' },
      { label: 'Stożek', tex: 'V = \\frac13\\pi r^2 h \\qquad P_b = \\pi r l \\qquad P_c = \\pi r(r + l)' },
      { label: 'Kula', tex: 'V = \\frac43\\pi r^3 \\qquad P = 4\\pi r^2' },
      { label: 'Sześcian i prostopadłościan', tex: 'd_{\\text{sześcianu}} = a\\sqrt3 \\qquad d = \\sqrt{a^2 + b^2 + c^2}' },
    ],
  },
  {
    id: 'kombinatoryka', title: 'Kombinatoryka i prawdopodobieństwo',
    items: [
      { label: 'Permutacje', tex: 'n! = 1\\cdot 2\\cdot\\ldots\\cdot n, \\quad 0! = 1' },
      { label: 'Wariacje z powtórzeniami', tex: 'n^k' },
      { label: 'Wariacje bez powtórzeń', tex: '\\frac{n!}{(n-k)!} = n(n-1)\\cdot\\ldots\\cdot(n-k+1)' },
      { label: 'Kombinacje', tex: '\\binom{n}{k} = \\frac{n!}{k!\\,(n-k)!}' },
      { label: 'Prawdopodobieństwo klasyczne', tex: 'P(A) = \\frac{|A|}{|\\Omega|}' },
      { tex: "P(A') = 1 - P(A) \\qquad P(A \\cup B) = P(A) + P(B) - P(A \\cap B)" },
    ],
  },
  {
    id: 'statystyka', title: 'Statystyka',
    items: [
      { label: 'Średnia arytmetyczna', tex: '\\bar{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n}' },
      { label: 'Średnia ważona', tex: '\\bar{x} = \\frac{w_1x_1 + w_2x_2 + \\ldots + w_nx_n}{w_1 + w_2 + \\ldots + w_n}' },
      { label: 'Mediana (dane uporządkowane)', tex: 'n \\text{ nieparzyste: } x_{\\frac{n+1}{2}} \\qquad n \\text{ parzyste: } \\frac{x_{\\frac n2} + x_{\\frac n2 + 1}}{2}' },
      { label: 'Wariancja i odchylenie standardowe', tex: '\\sigma^2 = \\frac{(x_1 - \\bar{x})^2 + \\ldots + (x_n - \\bar{x})^2}{n} \\qquad \\sigma = \\sqrt{\\sigma^2}' },
    ],
  },
];

/** Która sekcja karty pasuje do działu (otwiera się jako pierwsza) */
export const WZORY_DLA_DZIALU: Record<string, string> = {
  liczby: 'potegi', wyrazenia: 'skrocone', rownania: 'kwadratowa', funkcje: 'kwadratowa', ciagi: 'ciagi',
  trygonometria: 'tryg', planimetria: 'planimetria', analityczna: 'analityczna', stereometria: 'stereometria', statystyka: 'kombinatoryka',
};
