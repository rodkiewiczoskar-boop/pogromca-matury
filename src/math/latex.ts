// Pomocnicze: arytmetyka wymierna i budowanie LaTeX-a.
export const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

export class Q {
  readonly n: number; readonly d: number;
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error('d=0');
    if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`non-integer ${n}/${d}`);
    const g = gcd(n, d) || 1; const s = d < 0 ? -1 : 1;
    this.n = (s * n) / g; this.d = (s * d) / g;
  }
  add(o: Q) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o: Q) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o: Q) { return new Q(this.n * o.n, this.d * o.d); }
  div(o: Q) { return new Q(this.n * o.d, this.d * o.n); }
  pow(k: number): Q { if (k < 0) return new Q(this.d, this.n).pow(-k); let r = new Q(1); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
  neg() { return new Q(-this.n, this.d); }
  get value() { return this.n / this.d; }
  isInt() { return this.d === 1; }
  eq(o: Q) { return this.n === o.n && this.d === o.d; }
  /** LaTeX: -\frac{3}{4}, 5 */
  tex(): string { return this.d === 1 ? `${this.n}` : `${this.n < 0 ? '-' : ''}\\frac{${Math.abs(this.n)}}{${this.d}}`; }
  /** Do wstawienia w środek wyrażenia (nawias przy ujemnych). */
  texP(): string { return this.n < 0 ? `\\left(${this.tex()}\\right)` : this.tex(); }
}
export const q = (n: number, d = 1) => new Q(n, d);

/** √n = k√m, m bezkwadratowe */
export function simplifySqrt(n: number): [number, number] {
  let k = 1, m = n;
  for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; }
  return [k, m];
}
export const isSquarefree = (n: number) => n > 1 && simplifySqrt(n)[0] === 1;

/** Liczba w postaci a + b√m (a,b wymierne) do LaTeX-a. */
export function surdTex(a: Q, b: Q, m: number): string {
  if (m === 1) return a.add(b).tex();
  const parts: string[] = [];
  if (a.n !== 0) parts.push(a.tex());
  if (b.n !== 0) {
    const abs = new Q(Math.abs(b.n), b.d);
    let t: string;
    if (abs.d === 1) t = `${abs.n === 1 ? '' : abs.n}\\sqrt{${m}}`;
    else t = `\\frac{${abs.n === 1 ? '' : abs.n}\\sqrt{${m}}}{${abs.d}}`;
    if (parts.length) parts.push(b.n < 0 ? `- ${t}` : `+ ${t}`);
    else parts.push(b.n < 0 ? `-${t}` : t);
  }
  return parts.length ? parts.join(' ') : '0';
}

/** Wielomian ze współczynników [a0, a1, a2,...] w zmiennej x. */
export function polyTex(c: number[], v = 'x'): string {
  const terms: string[] = [];
  for (let i = c.length - 1; i >= 0; i--) {
    const a = c[i];
    if (!a) continue;
    const abs = Math.abs(a);
    const coef = i === 0 ? `${abs}` : abs === 1 ? '' : `${abs}`;
    const mon = i === 0 ? '' : i === 1 ? v : `${v}^{${i}}`;
    const t = coef + mon;
    if (!terms.length) terms.push(a < 0 ? `-${t}` : t);
    else terms.push(a < 0 ? `- ${t}` : `+ ${t}`);
  }
  return terms.length ? terms.join(' ') : '0';
}
export function polyMul(a: number[], b: number[]): number[] {
  const r = new Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; }));
  return r;
}
export function polyAdd(a: number[], b: number[], s = 1): number[] {
  const r = new Array(Math.max(a.length, b.length)).fill(0);
  a.forEach((x, i) => (r[i] += x)); b.forEach((y, i) => (r[i] += s * y));
  return r;
}
/** (ax + b) do LaTeX-a */
export const linTex = (a: number, b: number, v = 'x') => polyTex([b, a], v);
/** Liczba w nawiasie, jeśli ujemna */
export const p = (n: number) => (n < 0 ? `(${n})` : `${n}`);
