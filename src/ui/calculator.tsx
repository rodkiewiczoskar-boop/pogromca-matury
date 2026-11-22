// Prosty kalkulator (cztery działania, pierwiastek, kwadrat, procent), jak dozwolony na maturze.
import { useEffect, useState } from 'preact/hooks';
import { Icon } from './components';
import { calcEval, formatCalc } from '../math/calc';

const KEYS: { k: string; label?: string; cls?: string }[] = [
  { k: 'C', cls: 'fn' }, { k: '(', cls: 'fn' }, { k: ')', cls: 'fn' }, { k: '÷', cls: 'op' },
  { k: '7' }, { k: '8' }, { k: '9' }, { k: '×', cls: 'op' },
  { k: '4' }, { k: '5' }, { k: '6' }, { k: '−', cls: 'op' },
  { k: '1' }, { k: '2' }, { k: '3' }, { k: '+', cls: 'op' },
  { k: '√', cls: 'fn' }, { k: '0' }, { k: ',' }, { k: '²', label: 'x²', cls: 'fn' },
  { k: '%', cls: 'fn' }, { k: '⌫', cls: 'fn' }, { k: '=', cls: 'eq wide' },
];

export function Calculator({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const press = (k: string) => {
    if (k === 'C') { setExpr(''); setResult(null); return; }
    if (k === '⌫') { setExpr((e) => e.slice(0, -1)); setResult(null); return; }
    if (k === '=') {
      try { const v = calcEval(expr); const f = formatCalc(v); setResult(f); setExpr(f === 'Błąd' ? '' : f); } catch { setResult('Błąd'); }
      return;
    }
    setResult(null);
    setExpr((e) => e + k);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, string> = { '*': '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Backspace: '⌫', Escape: 'esc', '.': ',' };
      const k = map[e.key] ?? e.key;
      if (k === 'esc') { onClose(); return; }
      if (/^[0-9+×÷−,()%√²=⌫]$/.test(k) || k === '⌫') { e.preventDefault(); e.stopPropagation(); press(k); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [expr]);

  return (
    <div class="calc" role="dialog" aria-label="Kalkulator">
      <div class="calc-head">
        <span>Kalkulator prosty</span>
        <button class="icon-btn" onClick={onClose} aria-label="Zamknij kalkulator"><Icon name="close" /></button>
      </div>
      <div class="calc-screen" aria-live="polite">
        <div class="calc-expr">{expr || '0'}</div>
        {result === 'Błąd' && <div class="calc-err">Nie da się tego obliczyć</div>}
      </div>
      <div class="calc-keys">
        {KEYS.map((key) => (
          <button key={key.k} type="button" class={`calc-key ${key.cls ?? ''}`} onPointerDown={(e) => e.preventDefault()} onClick={() => press(key.k)}>{key.label ?? key.k}</button>
        ))}
      </div>
    </div>
  );
}

export function CalcButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button class="calc-fab" type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => { window.mathVirtualKeyboard?.hide(); setOpen(!open); }} aria-expanded={open}>
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8.5 7.5h7M8.5 12h1M12 12h0M15.5 12h0M8.5 15.5h1M12 15.5h0M15.5 15.5h0" /></svg>
        <span>Kalkulator</span>
      </button>
      {open && <Calculator onClose={() => setOpen(false)} />}
    </>
  );
}
