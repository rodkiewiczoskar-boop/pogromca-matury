// Sprawdzanie odpowiedzi: równoważność matematyczna + wymagana postać.
import { Json, MathError, args, evaluate, head, isIntLiteral, isMixedNumber, numLiteral, parseLatex, unwrap } from './evaluate';
import { gcd, isSquarefree } from './latex';
import { infiniteBracketProblem, parseIntervals, parseList, parsePoint, sameIntervals, sameMultiset, samePoint } from './sets';

export type Form = 'number' | 'surd' | 'polynomial' | 'factored' | 'power' | 'any' | 'list' | 'interval' | 'point';

export interface InputAnswer {
  kind: 'input';
  expected: string;          // poprawna odpowiedź w LaTeX
  form: Form;
  vars?: string[];           // zmienne (np. ['x'])
  rationalDenominator?: boolean; // wymagaj braku pierwiastka w mianowniku
  base?: number;             // dla form 'power'
  prefix?: string;           // np. "x ="
  suffix?: string;           // np. "\\%"
}

export interface CheckResult {
  status: 'correct' | 'wrong' | 'form' | 'invalid';
  message?: string; // wyjaśnienie dla ucznia
  note?: string;    // drobna uwaga przy poprawnej odpowiedzi
}

const SAMPLE_POINTS = [-2.37, -0.61, 0.43, 1.29, 3.17];

function close(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= 1e-11 * Math.max(1, Math.abs(a), Math.abs(b));
}

/** Czy dwa wyrażenia są równe dla wszystkich próbnych wartości zmiennych. */
export function equivalent(a: Json, b: Json, vars: string[] = []): boolean {
  if (!vars.length) return close(evaluate(a), evaluate(b));
  for (let i = 0; i < SAMPLE_POINTS.length; i++) {
    const env: Record<string, number> = {};
    vars.forEach((v, k) => (env[v] = SAMPLE_POINTS[(i + k * 2) % SAMPLE_POINTS.length] + k * 0.071));
    if (!close(evaluate(a, env), evaluate(b, env))) return false;
  }
  return true;
}

function stripSign(j: Json): Json {
  j = unwrap(j);
  while (head(j) === 'Negate') j = unwrap(args(j)[0]);
  return j;
}

/** Liczba wymierna zapisana wprost: 3, -2.5, \frac{3}{4}, 2\frac{1}{2} */
export function isRationalLiteral(j: Json): boolean {
  j = stripSign(j);
  if (numLiteral(j) !== null) return true;
  if (isMixedNumber(j)) return true;
  if (head(j) === 'Divide' || head(j) === 'Rational') {
    const [a, b] = args(j).map(stripSign);
    return isIntLiteral(a) && isIntLiteral(b);
  }
  return false;
}

function walk(j: Json, f: (n: Json, parents: Json[]) => void, parents: Json[] = []): void {
  f(j, parents);
  if (Array.isArray(j)) j.slice(1).forEach((c) => walk(c as Json, f, [...parents, j]));
}

function containsVar(j: Json, vars: string[]): boolean {
  let found = false;
  walk(j, (n) => { if (typeof n === 'string' && vars.includes(n)) found = true; });
  return found;
}

function isSum(j: Json): boolean {
  const h = head(unwrap(j));
  return h === 'Add' || h === 'Subtract';
}

function formProblem(j: Json, ans: InputAnswer): string | null {
  const vars = ans.vars ?? [];
  switch (ans.form) {
    case 'any': case 'list': case 'interval': case 'point': return null;
    case 'number':
      return isRationalLiteral(j) ? null : 'Podaj wynik jako jedną liczbę (całkowitą, dziesiętną albo ułamek), bez działań do wykonania.';
    case 'power': {
      const u = stripSign(j);
      if (head(u) === 'Power' && numLiteral(unwrap(args(u)[0])) === ans.base && isRationalLiteral(args(u)[1])) return null;
      return `Zapisz wynik jako jedną potęgę liczby ${ans.base}, np. ${ans.base}^{...}.`;
    }
    case 'surd': {
      let problem: string | null = null;
      walk(j, (n, parents) => {
        if (problem) return;
        const h = head(n);
        const lit = numLiteral(n);
        if (lit !== null && !Number.isInteger(lit)) problem = 'Podaj wynik dokładny (z pierwiastkiem), a nie przybliżenie dziesiętne.';
        else if (h === 'Power' || h === 'Square') problem = 'Wykonaj potęgowanie do końca.';
        else if (h && ['Log', 'Lb', 'Lg', 'Ln'].includes(h)) problem = 'Oblicz logarytm do końca.';
        else if (h === 'Sqrt') {
          const a = unwrap(args(n)[0]);
          const v = numLiteral(a);
          if (v === null || !Number.isInteger(v)) problem = 'Pod pierwiastkiem zostaw jedną liczbę całkowitą.';
          else if (!isSquarefree(v)) problem = v > 1 && Number.isInteger(Math.sqrt(v)) ? 'Oblicz pierwiastek do końca.' : 'Wyłącz czynnik przed znak pierwiastka.';
        } else if (h === 'Root') {
          const v = numLiteral(unwrap(args(n)[0])); const k = numLiteral(args(n)[1]);
          if (v !== null && k !== null && Number.isInteger(Math.round(Math.pow(Math.abs(v), 1 / k) * 1e9) / 1e9)) problem = 'Oblicz pierwiastek do końca.';
        }
        if (!problem && ans.rationalDenominator && (h === 'Sqrt' || h === 'Root')) {
          for (let i = 0; i < parents.length; i++) {
            const par = parents[i];
            const child = i + 1 < parents.length ? parents[i + 1] : n;
            if (head(par) === 'Divide' && (par as Json[])[2] === child) problem = 'Usuń niewymierność z mianownika.';
          }
        }
      });
      return problem;
    }
    case 'polynomial': {
      let problem: string | null = null;
      walk(j, (n) => {
        if (problem) return;
        const h = head(n);
        if (h === 'Power' || h === 'Square') {
          const base = unwrap(args(n)[0]);
          if (typeof base !== 'string' && containsVar(base, vars)) problem = 'Rozwiń nawiasy do końca (bez potęg nawiasów).';
        }
        if (h === 'Multiply' || h === 'InvisibleOperator') {
          const cs = args(n);
          if (cs.some(isSum) && cs.some((c) => containsVar(c, vars))) problem = 'Wymnóż nawiasy do końca.';
        }
        if (h === 'Divide' && containsVar(args(n)[1], vars)) problem = 'Wyrażenie powinno być wielomianem.';
      });
      if (problem) return problem;
      // redukcja wyrazów podobnych: każdy stopień najwyżej raz
      const top = unwrap(j);
      const terms = head(top) === 'Add' || head(top) === 'Subtract' ? args(top) : [top];
      const degs = terms.map((t) => degreeOf(t, vars[0]));
      if (degs.some((d) => d === null)) return null;
      if (new Set(degs).size !== degs.length) return 'Zredukuj wyrazy podobne.';
      return null;
    }
    case 'factored': {
      const u = stripSign(j);
      const h = head(u);
      if (h === 'Add' || h === 'Subtract') return 'Zapisz wyrażenie w postaci iloczynu (bez dodawania na zewnątrz nawiasów).';
      if (h === 'Power' && isSum(args(u)[0])) return null;
      if ((h === 'Multiply' || h === 'InvisibleOperator') && args(u).some((c) => isSum(c) || head(unwrap(c)) === 'Power')) return null;
      return 'Zapisz wyrażenie w postaci iloczynu nawiasów.';
    }
  }
}

function degreeOf(t: Json, v?: string): number | null {
  if (!v) return null;
  t = stripSign(t);
  if (t === v) return 1;
  if (numLiteral(t) !== null) return 0;
  const h = head(t);
  if (h === 'Power' && unwrap(args(t)[0]) === v) return numLiteral(args(t)[1]);
  if (h === 'Multiply' || h === 'InvisibleOperator' || h === 'Divide') {
    let d = 0;
    for (const c of args(t)) { const cd = degreeOf(c, v); if (cd === null) return null; d += cd; }
    return d;
  }
  return null;
}

function softNote(j: Json, ans: InputAnswer): string | undefined {
  let note: string | undefined;
  walk(j, (n) => {
    if (head(n) === 'Divide') {
      const [a, b] = args(n).map(stripSign);
      if (isIntLiteral(a) && isIntLiteral(b) && gcd(numLiteral(a)!, numLiteral(b)!) > 1) note = 'Dobrze. Na maturze warto jeszcze skrócić ułamek.';
    }
  });
  if (!note && ans.form === 'surd' && !ans.rationalDenominator) {
    walk(j, (n, parents) => {
      if ((head(n) === 'Sqrt') && parents.some((p) => head(p) === 'Divide' && containsSqrt((p as Json[])[2]))) note = 'Dobrze. Możesz jeszcze usunąć niewymierność z mianownika.';
    });
  }
  return note;
}
function containsSqrt(j: Json): boolean { let f = false; walk(j, (n) => { if (head(n) === 'Sqrt' || head(n) === 'Root') f = true; }); return f; }

function checkSet(studentLatex: string, ans: InputAnswer): CheckResult {
  if (/\\placeholder/.test(studentLatex)) return { status: 'invalid', message: 'Uzupełnij puste pola w odpowiedzi.' };
  if (!studentLatex.trim()) return { status: 'invalid', message: 'Wpisz odpowiedź.' };
  try {
    if (ans.form === 'point') return samePoint(parsePoint(studentLatex), parsePoint(ans.expected)) ? { status: 'correct' } : { status: 'wrong' };
    if (ans.form === 'list') {
      const got = parseList(studentLatex), exp = parseList(ans.expected);
      if (sameMultiset(got, exp)) return { status: 'correct' };
      if (got.length < exp.length && got.every((g) => exp.some((e) => Math.abs(e - g) < 1e-9))) return { status: 'wrong', message: 'Brakuje części rozwiązań.' };
      return { status: 'wrong' };
    }
    const got = parseIntervals(studentLatex), exp = parseIntervals(ans.expected);
    if (!sameIntervals(got, exp)) return { status: 'wrong' };
    if (infiniteBracketProblem(got)) return { status: 'form', message: 'Zbiór się zgadza, ale przy nieskończoności stawiamy zawsze nawias okrągły.' };
    return { status: 'correct' };
  } catch (err) {
    return { status: 'invalid', message: err instanceof MathError ? err.message : 'Nie rozumiem tego zapisu.' };
  }
}

/** Dzieli zapis na części oddzielone znakiem "=" (poza nawiasami klamrowymi). */
export function splitChain(latex: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (let i = 0; i < latex.length; i++) {
    const c = latex[i];
    if (c === '{') depth++;
    if (c === '}') depth--;
    if (c === '=' && depth === 0 && latex[i - 1] !== '\\') { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

const isBareSymbol = (seg: string) => /^[a-zA-Z](_\{?\w+\}?)?$/.test(seg.trim());

/** Sprawdza odpowiedź. Można rozpisać obliczenia: wynikiem jest część po ostatnim "=", a kroki muszą być sobie równe. */
export function checkAnswer(studentLatex: string, ans: InputAnswer): CheckResult {
  if (ans.form === 'list') return checkSet(studentLatex, ans);
  const segs = splitChain(studentLatex);
  if (segs.length > 1) {
    const last = segs[segs.length - 1];
    if (!last) return { status: 'invalid', message: 'Dokończ obliczenia: po ostatnim znaku „=” wpisz wynik.' };
    const steps = segs.filter((x) => x && !isBareSymbol(x));
    const res = checkSingle(last, ans);
    if (steps.length > 1 && !['interval', 'point'].includes(ans.form)) {
      const bad = firstBrokenStep(steps, ans.vars);
      if (bad !== null) {
        const where = `Krok ${bad + 1} nie jest równy poprzedniemu: $${steps[bad - 1]} \\ne ${steps[bad]}$.`;
        if (res.status === 'correct') return { ...res, note: `Wynik dobry, ale w rozpisaniu jest błąd. ${where}` };
        if (res.status === 'wrong') return { ...res, message: `${where} Od tego miejsca rachunek się rozjeżdża.` };
      }
    }
    return res;
  }
  return checkSingle(studentLatex, ans);
}

function firstBrokenStep(steps: string[], vars?: string[]): number | null {
  try {
    const parsed = steps.map((x) => parseLatex(x));
    for (let i = 1; i < parsed.length; i++) if (!equivalent(parsed[i - 1], parsed[i], vars)) return i;
  } catch { return null; }
  return null;
}

function checkSingle(studentLatex: string, ans: InputAnswer): CheckResult {
  if (ans.form === 'list' || ans.form === 'interval' || ans.form === 'point') return checkSet(studentLatex, ans);
  let s: Json, e: Json;
  try {
    s = parseLatex(studentLatex);
  } catch (err) {
    return { status: 'invalid', message: err instanceof MathError ? err.message : 'Nie rozumiem tego zapisu.' };
  }
  e = parseLatex(ans.expected);
  // "x = 5" → 5, "y = 2x + 1" → 2x + 1 (równanie prostej)
  if (head(s) === 'Equal' && typeof args(s)[0] === 'string' && !(ans.vars ?? []).includes(args(s)[0] as string)) s = args(s)[1];
  if (head(e) === 'Equal' && typeof args(e)[0] === 'string') e = args(e)[1];
  let eq: boolean;
  try {
    eq = equivalent(s, e, ans.vars);
  } catch (err) {
    if (err instanceof MathError) {
      if (/Nieznany symbol/.test(err.message)) return { status: 'invalid', message: 'W odpowiedzi jest symbol, którego tu nie powinno być.' };
      return { status: 'wrong', message: err.message };
    }
    return { status: 'invalid', message: 'Nie rozumiem tego zapisu.' };
  }
  if (!eq) return { status: 'wrong' };
  const fp = formProblem(s, ans);
  if (fp) return { status: 'form', message: `Wartość się zgadza, ale: ${fp}` };
  return { status: 'correct', note: softNote(s, ans) };
}
