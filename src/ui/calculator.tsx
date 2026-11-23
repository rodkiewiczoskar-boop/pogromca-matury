// Prosty kalkulator (cztery działania, pierwiastek, kwadrat, procent), jak dozwolony na maturze.
import { useEffect, useState } from 'preact/hooks';
import { fieldEvents, Icon, lastField } from './components';
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
      {lastField && expr && /^-?[0-9]+(,[0-9]+)?$/.test(expr) && (
        <button type="button" class="calc-insert" onPointerDown={(e) => e.preventDefault()} onClick={() => { lastField?.insert(expr.replace(',', '{,}')); onClose(); }}>Wstaw {expr} do odpowiedzi</button>
      )}
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
  // dotknięcie pola odpowiedzi zamyka kalkulator (wraca klawiatura matematyczna)
  useEffect(() => {
    const f = () => setOpen(false);
    const other = (e: Event) => { if ((e as CustomEvent).detail !== 'calc') setOpen(false); };
    fieldEvents.addEventListener('field-focus', f);
    fieldEvents.addEventListener('panel-open', other);
    return () => { fieldEvents.removeEventListener('field-focus', f); fieldEvents.removeEventListener('panel-open', other); };
  }, []);
  // przy otwartym kalkulatorze przewijamy tak, żeby pole odpowiedzi było widać nad nim
  useEffect(() => {
    document.body.classList.toggle('calc-open', open);
    if (!open) return;
    const t = setTimeout(() => {
      const calc = document.querySelector('.calc') as HTMLElement | null;
      const mf = (document.querySelector('.task-card math-field') ?? document.querySelector('math-field')) as HTMLElement | null;
      if (!calc || !mf) return;
      const top = calc.getBoundingClientRect().top, b = mf.getBoundingClientRect().bottom;
      if (b > top - 12) window.scrollBy({ top: b - top + 24, behavior: 'smooth' });
    }, 30);
    return () => clearTimeout(t);
  }, [open]);
  const toggle = () => {
    if (!open) {
      // najpierw chowamy klawiaturę matematyczną i zdejmujemy fokus z pola
      window.mathVirtualKeyboard?.hide();
      (document.activeElement as HTMLElement | null)?.blur?.();
      fieldEvents.dispatchEvent(new CustomEvent('panel-open', { detail: 'calc' }));
    }
    setOpen(!open);
  };
  return (
    <>
      <button class="calc-fab" type="button" onPointerDown={(e) => e.preventDefault()} onClick={toggle} aria-expanded={open} aria-label="Kalkulator">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8.5 7.5h7M8.5 12h1M12 12h0M15.5 12h0M8.5 15.5h1M12 15.5h0M15.5 15.5h0" /></svg>
        <span>Kalkulator</span>
      </button>
      {open && <Calculator onClose={() => setOpen(false)} />}
    </>
  );
}
