// Karta wzorów: panel w trakcie zadań i osobna strona.
import { useEffect, useRef, useState } from 'preact/hooks';
import { WZORY, WZORY_DLA_DZIALU } from '../content/wzory';
import { fieldEvents, Icon, MathText, TopBar } from './components';
import { latexToHtml } from './mathlive';

function Sekcje({ first }: { first?: string }) {
  const order = first ? [...WZORY.filter((s) => s.id === first), ...WZORY.filter((s) => s.id !== first)] : WZORY;
  return (
    <div class="wzory">
      {order.map((s) => (
        <section key={s.id} class="wzory-sec" id={`wz-${s.id}`}>
          <h3>{s.title}</h3>
          {s.items.map((it, i) => (
            <div key={i} class="wzor">
              {it.label && <p class="wzor-label"><MathText text={it.label} /></p>}
              {it.text && <p class="wzor-text"><MathText text={it.text} /></p>}
              {it.tex && <div class="wzor-tex" dangerouslySetInnerHTML={{ __html: latexToHtml(it.tex, true) }} />}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

/** Przycisk „Wzory” w górnym pasku; otwiera kartę wzorów obok zadania */
export function FormulaButton({ dzial }: { dzial?: string }) {
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = () => setOpen(false);
    const other = (e: Event) => { if ((e as CustomEvent).detail !== 'wzory') setOpen(false); };
    fieldEvents.addEventListener('field-focus', close);
    fieldEvents.addEventListener('panel-open', other);
    return () => { fieldEvents.removeEventListener('field-focus', close); fieldEvents.removeEventListener('panel-open', other); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);
  const toggle = () => {
    if (!open) {
      window.mathVirtualKeyboard?.hide();
      (document.activeElement as HTMLElement | null)?.blur?.();
      fieldEvents.dispatchEvent(new CustomEvent('panel-open', { detail: 'wzory' }));
    }
    setOpen(!open);
  };
  return (
    <>
      <button class="calc-fab" type="button" onPointerDown={(e) => e.preventDefault()} onClick={toggle} aria-expanded={open} aria-label="Karta wzorów">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14v16H5z" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4" /></svg>
        <span>Wzory</span>
      </button>
      {open && (
        <div class="sheet" role="dialog" aria-label="Karta wzorów">
          <div class="calc-head">
            <span>Wybrane wzory matematyczne</span>
            <button class="icon-btn" onClick={() => setOpen(false)} aria-label="Zamknij kartę wzorów"><Icon name="close" /></button>
          </div>
          <div class="sheet-body" ref={body}><Sekcje first={dzial ? WZORY_DLA_DZIALU[dzial] : undefined} /></div>
        </div>
      )}
    </>
  );
}

export function FormulaPage() {
  return (
    <div class="page">
      <TopBar back="#/" title="Karta wzorów" />
      <main class="container narrow">
        <p class="lead">Te same wzory dostaniesz na maturze w broszurze CKE. Warto wiedzieć, gdzie co jest, żeby nie szukać na egzaminie.</p>
        <nav class="chips">{WZORY.map((s) => <a key={s.id} class="chip" href={`#/wzory`} onClick={(e) => { e.preventDefault(); document.getElementById(`wz-${s.id}`)?.scrollIntoView({ behavior: 'smooth' }); }}>{s.title}</a>)}</nav>
        <Sekcje />
      </main>
    </div>
  );
}
