// Logika prostego kalkulatora (bez zależności od UI).
type Tok = { t: 'n'; v: number } | { t: 'op'; v: string } | { t: 'l' } | { t: 'r' } | { t: 'f'; v: 'sqrt' };

export function calcEval(src: string): number {
  const s = src.replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  const toks: Tok[] = [];
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const v = parseFloat(s.slice(i, j)); if (Number.isNaN(v)) throw new Error('liczba'); toks.push({ t: 'n', v }); i = j; continue; }
    if (s.startsWith('√', i)) { toks.push({ t: 'f', v: 'sqrt' }); i++; continue; }
    if ('+-*/^%'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
    if (c === '(') { toks.push({ t: 'l' }); i++; continue; }
    if (c === ')') { toks.push({ t: 'r' }); i++; continue; }
    if (c === '²') { toks.push({ t: 'op', v: '^' }, { t: 'n', v: 2 }); i++; continue; }
    throw new Error('znak');
  }
  let k = 0;
  const peek = () => toks[k];
  const expr = (): number => { let v = term(); while (peek()?.t === 'op' && (peek() as any).v.match(/[+-]/)) { const o = (toks[k++] as any).v; const w = term(); v = o === '+' ? v + w : v - w; } return v; };
  const term = (): number => { let v = unary(); while (peek()?.t === 'op' && (peek() as any).v.match(/[*/]/)) { const o = (toks[k++] as any).v; const w = unary(); if (o === '/' && w === 0) throw new Error('zero'); v = o === '*' ? v * w : v / w; } return v; };
  const unary = (): number => { if (peek()?.t === 'op' && (peek() as any).v === '-') { k++; return -unary(); } return power(); };
  const power = (): number => { let v = postfix(); if (peek()?.t === 'op' && (peek() as any).v === '^') { k++; v = Math.pow(v, unary()); } return v; };
  const postfix = (): number => { let v = atom(); while (peek()?.t === 'op' && (peek() as any).v === '%') { k++; v = v / 100; } return v; };
  const atom = (): number => {
    const tk = toks[k++];
    if (!tk) throw new Error('koniec');
    if (tk.t === 'n') return tk.v;
    if (tk.t === 'f') { const v = atom(); if (v < 0) throw new Error('sqrt'); return Math.sqrt(v); }
    if (tk.t === 'l') { const v = expr(); if (toks[k]?.t === 'r') k++; return v; }
    throw new Error('składnia');
  };
  const v = expr();
  if (k !== toks.length) throw new Error('składnia');
  return v;
}

export function formatCalc(v: number): string {
  if (!Number.isFinite(v)) return 'Błąd';
  const r = Math.round(v * 1e10) / 1e10;
  return String(r).replace('.', ',');
}
