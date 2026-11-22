// Parsowanie LaTeX (z MathLive) do MathJSON i własny ewaluator numeryczny.
import type { ComputeEngine } from '@cortex-js/compute-engine';

export type Json = number | string | { num: string } | Json[];

// Compute Engine jest duży, więc ładujemy go osobno (w tle po starcie aplikacji).
let _ce: ComputeEngine | null = null;
let _loading: Promise<void> | null = null;
export function loadCE(): Promise<void> {
  if (!_loading) _loading = import('@cortex-js/compute-engine').then((m) => { _ce = new m.ComputeEngine(); });
  return _loading;
}
export const ceReady = () => _ce !== null;
export function ce(): ComputeEngine {
  if (!_ce) throw new Error('Compute Engine nie jest jeszcze załadowany');
  return _ce;
}

export class MathError extends Error {}

/** Ujednolica zapis z polskiej klawiatury: przecinek dziesiętny, dwukropek jako dzielenie itp. */
export function normalizeLatex(src: string): string {
  let s = src.trim();
  s = s.replace(/\{,\}/g, '.');
  s = s.replace(/(\d)\s*,\s*(?=\d)/g, '$1.');
  s = s.replace(/\\colon/g, '\\div ');
  s = s.replace(/(^|[^\\a-zA-Z]):/g, '$1\\div ');
  s = s.replace(/\\left\s*\./g, '').replace(/\\right\s*\./g, '');
  s = s.replace(/\\mathrm\{([a-zA-Z]+)\}/g, '$1');
  s = s.replace(/\\[,;!: ]/g, ' ');
  s = s.replace(/\\(?:text|operatorname)\{\s*\}/g, '');
  return s.trim();
}

export function hasPlaceholder(src: string): boolean {
  return /\\placeholder/.test(src);
}

export function parseLatex(src: string): Json {
  if (hasPlaceholder(src)) throw new MathError('Uzupełnij puste pola w odpowiedzi.');
  const s = normalizeLatex(src);
  if (!s) throw new MathError('Wpisz odpowiedź.');
  const json = ce().parse(s, { form: 'raw' }).json as Json;
  assertNoError(json);
  return json;
}

function assertNoError(j: Json): void {
  if (Array.isArray(j)) {
    if (j[0] === 'Error') throw new MathError('Nie rozumiem tego zapisu. Sprawdź nawiasy i znaki.');
    j.forEach(assertNoError);
  }
}

export function head(j: Json): string | null {
  return Array.isArray(j) && typeof j[0] === 'string' ? j[0] : null;
}
export function args(j: Json): Json[] {
  return Array.isArray(j) ? j.slice(1) : [];
}

/** Zdejmuje nawiasy (Delimiter) z pojedynczym argumentem. */
export function unwrap(j: Json): Json {
  while (Array.isArray(j) && (j[0] === 'Delimiter' || j[0] === 'Sequence') && j.length >= 2) {
    const inner = j[1];
    if (j[0] === 'Sequence' && j.length !== 2) break;
    if (j[0] === 'Delimiter' && head(inner) === 'Sequence' && args(inner).length !== 1) break;
    j = head(inner) === 'Sequence' && args(inner).length === 1 ? args(inner)[0] : inner;
  }
  return j;
}

export function numLiteral(j: Json): number | null {
  if (typeof j === 'number') return j;
  if (j && typeof j === 'object' && !Array.isArray(j) && 'num' in j) {
    const v = parseFloat(j.num);
    return Number.isFinite(v) ? v : null;
  }
  return null;
}

export function isIntLiteral(j: Json): boolean {
  const v = numLiteral(j);
  return v !== null && Number.isInteger(v);
}

/** Czy to liczba mieszana typu 2\frac{1}{2} */
export function isMixedNumber(j: Json): boolean {
  if (head(j) !== 'InvisibleOperator') return false;
  const a = args(j);
  if (a.length !== 2) return false;
  const w = head(a[0]) === 'Negate' ? args(a[0])[0] : a[0];
  return isIntLiteral(w) && (numLiteral(w) as number) > 0 && head(a[1]) === 'Divide' &&
    args(a[1]).every(isIntLiteral) && (numLiteral(args(a[1])[0]) as number) > 0 && (numLiteral(args(a[1])[1]) as number) > 0;
}

export type Env = Record<string, number>;

export function evaluate(j: Json, env: Env = {}): number {
  const n = numLiteral(j);
  if (n !== null) return n;
  if (typeof j === 'string') {
    if (j in env) return env[j];
    if (j === 'Pi') return Math.PI;
    if (j === 'ExponentialE') return Math.E;
    if (j === 'Nothing') throw new MathError('Wpisz odpowiedź.');
    throw new MathError(`Nieznany symbol: ${j}`);
  }
  if (!Array.isArray(j)) throw new MathError('Nie rozumiem tego zapisu.');
  const h = j[0];
  const a = j.slice(1) as Json[];
  const ev = (x: Json) => evaluate(x, env);
  switch (h) {
    case 'Add': return a.reduce<number>((s, x) => s + ev(x), 0);
    case 'Subtract': return a.length === 1 ? -ev(a[0]) : ev(a[0]) - a.slice(1).reduce<number>((s, x) => s + ev(x), 0);
    case 'Negate': return -ev(a[0]);
    case 'Multiply': return a.reduce<number>((s, x) => s * ev(x), 1);
    case 'InvisibleOperator':
      if (isMixedNumber(j)) { const w = ev(a[0]); return w < 0 ? w - ev(a[1]) : w + ev(a[1]); }
      return a.reduce<number>((s, x) => s * ev(x), 1);
    case 'Divide': case 'Rational': {
      const d = ev(a[1]);
      if (d === 0) throw new MathError('Dzielenie przez zero.');
      return ev(a[0]) / d;
    }
    case 'Power': return Math.pow(ev(a[0]), ev(a[1]));
    case 'Square': return ev(a[0]) ** 2;
    case 'Sqrt': {
      const v = ev(a[0]);
      if (v < 0) throw new MathError('Pierwiastek z liczby ujemnej.');
      return Math.sqrt(v);
    }
    case 'Root': {
      const v = ev(a[0]); const k = ev(a[1]);
      if (v < 0 && Math.round(k) % 2 === 1) return -Math.pow(-v, 1 / k);
      return Math.pow(v, 1 / k);
    }
    case 'Log': return a.length === 1 ? Math.log10(ev(a[0])) : Math.log(ev(a[0])) / Math.log(ev(a[1]));
    case 'Lg': return Math.log10(ev(a[0]));
    case 'Lb': return Math.log2(ev(a[0]));
    case 'Ln': return Math.log(ev(a[0]));
    case 'Abs': return Math.abs(ev(a[0]));
    case 'Exp': return Math.exp(ev(a[0]));
    case 'Delimiter': {
      const u = unwrap(j);
      if (u === j) throw new MathError('Podaj jedną wartość.');
      return ev(u);
    }
    case 'Sequence':
      if (a.length === 1) return ev(a[0]);
      throw new MathError('Podaj jedną wartość.');
    case 'Equal':
      // "x = 5" → bierzemy prawą stronę, gdy lewa to sama zmienna
      if (a.length === 2 && typeof a[0] === 'string') return ev(a[1]);
      throw new MathError('Podaj samą wartość.');
    case 'Percent': return ev(a[0]) / 100;
    default:
      throw new MathError('Nie rozumiem tego zapisu.');
  }
}

/** Niezależna ewaluacja przez Compute Engine (do testów weryfikujących). */
export function ceNumeric(latex: string, env: Env = {}): number {
  const e = ce().parse(normalizeLatex(latex));
  const sub = Object.keys(env).length ? e.subs(Object.fromEntries(Object.entries(env).map(([k, v]) => [k, ce().number(v)]))) : e;
  const v = sub.N();
  const re = (v as any).re;
  return typeof re === 'number' ? re : Number(v.valueOf());
}
