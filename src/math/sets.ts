// Odpowiedzi w postaci zbioru: lista rozwiązań równania albo suma przedziałów.
import { evaluate, MathError, parseLatex } from './evaluate';

export interface Interval { lo: number; hi: number; loC: boolean; hiC: boolean }

const close = (a: number, b: number) => (a === b) || Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

function stripVarPrefix(s: string): string {
  return s.replace(/^\s*x\s*(?:_\{?\d\}?)?\s*(=|\\in)\s*/, '');
}

/** "4; \frac{4}{3}" → [4, 1.333] (kolejność dowolna) */
export function splitList(latex: string): string[] {
  const s = latex.replace(/\\text\{\s*(lub|i|oraz)\s*\}/g, ';').replace(/\\(lor|vee)/g, ';');
  let parts = s.split(/;|,(?=\s*x)|\{,\}(?=\s*x)/);
  if (parts.length === 1 && /\\\{|\\lbrace/.test(s)) parts = s.replace(/\\left|\\right|\\\{|\\\}|\\lbrace|\\rbrace/g, '').split(/;/);
  return parts.map((p) => stripVarPrefix(p.trim())).filter((p) => p.length > 0);
}

export function parseList(latex: string): number[] {
  const items = splitList(latex);
  if (!items.length) throw new MathError('Wpisz odpowiedź.');
  return items.map((it) => evaluate(parseLatex(it)));
}

export function sameMultiset(a: number[], b: number[]): boolean {
  const ua = dedupe(a), ub = dedupe(b);
  if (ua.length !== ub.length) return false;
  return ua.every((v) => ub.some((w) => close(v, w)));
}
function dedupe(a: number[]): number[] { const r: number[] = []; for (const v of a) if (!r.some((w) => close(v, w))) r.push(v); return r; }

function normInterval(src: string): string {
  let s = src.trim();
  s = s.replace(/\\left|\\right|\\mathopen|\\mathclose|\\bigl|\\bigr|\\big/g, '');
  s = s.replace(/\\lbrack|\\lbrace/g, '[').replace(/\\rbrack|\\rbrace/g, ']');
  s = s.replace(/\\langle|⟨/g, '[').replace(/\\rangle|⟩/g, ']');
  s = s.replace(/\\lparen/g, '(').replace(/\\rparen/g, ')');
  s = s.replace(/\\\{|\\\}/g, '');
  s = s.replace(/^\s*x\s*\\in\s*/, '');
  return s.trim();
}

function endpoint(t: string): number {
  const x = t.trim().replace(/\s+/g, '');
  if (/^\+?\\infty$/.test(x) || x === '∞') return Infinity;
  if (/^-\\infty$/.test(x)) return -Infinity;
  return evaluate(parseLatex(t));
}

export function parseIntervals(latex: string): Interval[] {
  const s = normInterval(latex);
  if (/^\\(emptyset|varnothing|O)\b/.test(s) || s === '∅') return [];
  if (/^\\mathbb\{R\}$|^\\R$|^ℝ$/.test(s)) return [{ lo: -Infinity, hi: Infinity, loC: false, hiC: false }];
  const pieces = s.split(/\\cup|∪/);
  const out: Interval[] = [];
  for (const raw of pieces) {
    const p = raw.trim();
    const m = /^([\[(])(.*)([\])])$/.exec(p);
    if (!m) throw new MathError('Zapisz odpowiedź jako przedział, np. (-∞; 2⟩ ∪ ⟨3; ∞).');
    const inner = m[2];
    let sep = inner.indexOf(';');
    let len = 1;
    if (sep < 0) { sep = inner.indexOf('{,}'); len = 3; }
    if (sep < 0) { sep = inner.indexOf(','); len = 1; }
    if (sep < 0) throw new MathError('Oddziel końce przedziału średnikiem, np. ⟨2; 5⟩.');
    const lo = endpoint(inner.slice(0, sep)), hi = endpoint(inner.slice(sep + len));
    if (!(lo < hi)) throw new MathError('Lewy koniec przedziału musi być mniejszy od prawego.');
    out.push({ lo, hi, loC: m[1] === '[', hiC: m[3] === ']' });
  }
  return out;
}

export function infiniteBracketProblem(iv: Interval[]): boolean {
  return iv.some((i) => (i.lo === -Infinity && i.loC) || (i.hi === Infinity && i.hiC));
}

export function mergeIntervals(iv: Interval[]): Interval[] {
  const a = iv.map((i) => ({ ...i, loC: i.lo === -Infinity ? false : i.loC, hiC: i.hi === Infinity ? false : i.hiC }))
    .sort((x, y) => x.lo - y.lo);
  const r: Interval[] = [];
  for (const i of a) {
    const last = r[r.length - 1];
    if (last && (i.lo < last.hi || (close(i.lo, last.hi) && (i.loC || last.hiC)))) {
      if (i.hi > last.hi || close(i.hi, last.hi)) { last.hiC = close(i.hi, last.hi) ? last.hiC || i.hiC : i.hiC; last.hi = Math.max(last.hi, i.hi); }
    } else r.push({ ...i });
  }
  return r;
}

export function sameIntervals(a: Interval[], b: Interval[]): boolean {
  const x = mergeIntervals(a), y = mergeIntervals(b);
  if (x.length !== y.length) return false;
  return x.every((i, k) => close(i.lo, y[k].lo) && close(i.hi, y[k].hi) && (i.lo === -Infinity || i.loC === y[k].loC) && (i.hi === Infinity || i.hiC === y[k].hiC));
}

/** Czy liczba należy do sumy przedziałów (do testów) */
export function inIntervals(x: number, iv: Interval[]): boolean {
  return iv.some((i) => (x > i.lo || (i.loC && close(x, i.lo))) && (x < i.hi || (i.hiC && close(x, i.hi))));
}

/** "(2; -3)" → [2, -3] */
export function parsePoint(latex: string): number[] {
  let s = latex.trim().replace(/\\left|\\right/g, '').replace(/^\s*[A-Z]\s*=\s*/, '');
  const m = /^\((.*)\)$/.exec(s.trim());
  if (!m) throw new MathError('Zapisz punkt w nawiasie, np. (2; -3).');
  const inner = m[1];
  let parts = inner.split(';');
  if (parts.length !== 2) parts = inner.split(/\{,\}|,/);
  if (parts.length !== 2) throw new MathError('Punkt ma dwie współrzędne oddzielone średnikiem, np. (2; -3).');
  return parts.map((p) => evaluate(parseLatex(p)));
}
export const samePoint = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => close(v, b[i]));
