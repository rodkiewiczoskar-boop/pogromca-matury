import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { KbMode, latexToHtml, MathfieldElement, setupKeyboard } from './mathlive';

/** Tekst z fragmentami $...$ renderowanymi jako wzory */
export function MathText({ text, class: cls }: { text: string; class?: string }) {
  const parts = text.split(/(\$[^$]+\$)/g).filter(Boolean);
  return (
    <span class={cls}>
      {parts.map((p, i) =>
        p.startsWith('$') ? <span key={i} class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(p.slice(1, -1)) }} /> : <span key={i}>{p}</span>,
      )}
    </span>
  );
}

/** Odpowiedź ABCD: LaTeX z wstawkami \\text{…} renderujemy jako zwykły tekst, żeby długie zdania się zawijały */
export function OptionMath({ latex }: { latex: string }) {
  if (!latex.includes('\\text{')) return <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(latex) }} />;
  const parts = latex.split(/\\text\{([^}]*)\}/g);
  return (
    <span class="opt-text">
      {parts.map((p, i) => (i % 2 ? <span key={i}>{p}</span> : p.trim() ? <span key={i} class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(p.trim()) }} /> : null))}
    </span>
  );
}

export function MathDisplay({ latex }: { latex: string }) {
  return <div class="display" dangerouslySetInnerHTML={{ __html: latexToHtml(latex, true) }} />;
}

export interface MathInputApi { focus(): void; clear(): void; insert(latex: string): void; command(c: string): void; set(latex: string): void }

/** Zdarzenia między polem odpowiedzi a kalkulatorem */
export const fieldEvents = new EventTarget();
export let lastField: MathInputApi | null = null;

export function MathInput({ onInput, onEnter, prefix, suffix, disabled, apiRef, autoFocus, kb = 'default', initial }: {
  kb?: KbMode;
  initial?: string;
  onInput: (latex: string) => void;
  onEnter: () => void;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  apiRef?: { current: MathInputApi | null };
  autoFocus?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mfRef = useRef<MathfieldElement | null>(null);
  const cb = useRef({ onInput, onEnter, kb });
  cb.current = { onInput, onEnter, kb };

  useEffect(() => {
    const mf = new MathfieldElement();
    mf.smartFence = true;
    mf.mathVirtualKeyboardPolicy = 'auto';
    mf.setAttribute('aria-label', 'Twoja odpowiedź');
    mf.addEventListener('input', () => cb.current.onInput(mf.value));
    mf.addEventListener('focusin', () => { setupKeyboard(cb.current.kb); lastField = api; fieldEvents.dispatchEvent(new Event('field-focus')); });
    if (initial) mf.value = initial;
    mf.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); cb.current.onEnter(); }
    }, { capture: true });
    // nie pokazuj klawiatury po "Enter" na klawiaturze ekranowej
    mf.addEventListener('beforeinput', (e: InputEvent) => { if (e.inputType === 'insertLineBreak') { e.preventDefault(); cb.current.onEnter(); } });
    host.current!.appendChild(mf);
    try { mf.menuItems = []; } catch { /* starsze wersje */ }
    mfRef.current = mf;
    const api: MathInputApi = {
      focus: () => mf.focus(),
      clear: () => { mf.value = ''; cb.current.onInput(''); },
      insert: (l) => { mf.executeCommand(['insert', l, { focus: true, feedback: false, selectionMode: 'placeholder' } as any]); mf.focus(); cb.current.onInput(mf.value); },
      command: (c) => { mf.executeCommand(c as any); mf.focus(); cb.current.onInput(mf.value); },
      set: (l) => { mf.value = l; cb.current.onInput(mf.value); },
    };
    if (apiRef) apiRef.current = api;
    if (autoFocus && matchMedia('(pointer: fine)').matches) setTimeout(() => mf.focus(), 50);
    return () => { if (lastField === api) lastField = null; mf.remove(); };
  }, []);

  useEffect(() => { if (mfRef.current) mfRef.current.readOnly = !!disabled; }, [disabled]);

  return (
    <div class={`answer-row${disabled ? ' is-disabled' : ''}`}>
      {prefix && <span class="affix" dangerouslySetInnerHTML={{ __html: latexToHtml(prefix) }} />}
      <div class="mf-host" ref={host} />
      {suffix && <span class="affix" dangerouslySetInnerHTML={{ __html: latexToHtml(suffix) }} />}
    </div>
  );
}

const TOOLS: { label: string; insert?: string; cmd?: string; title: string }[] = [
  { label: '\\frac{a}{b}', insert: '\\frac{#@}{#?}', title: 'Ułamek (klawisz /)' },
  { label: '\\sqrt{a}', insert: '\\sqrt{#0}', title: 'Pierwiastek (wpisz sqrt)' },
  { label: '\\sqrt[n]{a}', insert: '\\sqrt[#?]{#0}', title: 'Pierwiastek n-tego stopnia' },
  { label: 'a^2', insert: '#@^{2}', title: 'Kwadrat' },
  { label: 'a^n', insert: '#@^{#?}', title: 'Potęga (klawisz ^)' },
  { label: '\\log_a', insert: '\\log_{#?}#0', title: 'Logarytm' },
  { label: '(\\,)', insert: '\\left(#0\\right)', title: 'Nawias' },
  { label: '\\pi', insert: '\\pi', title: 'Pi' },
];

/** Pasek szybkiego wstawiania (komputer) */
const SET_TOOLS: typeof TOOLS = [
  { label: '\\infty', insert: '\\infty', title: 'Nieskończoność' },
  { label: '\\cup', insert: '\\cup', title: 'Suma przedziałów' },
  { label: '\\langle', insert: '\\langle', title: 'Nawias domknięty (lewy)' },
  { label: '\\rangle', insert: '\\rangle', title: 'Nawias domknięty (prawy)' },
  { label: ';', insert: ';', title: 'Średnik (oddziela liczby)' },
];

export function Toolbar({ api, kb = 'default' }: { api: { current: MathInputApi | null }; kb?: KbMode }) {
  const tools = kb === 'sets' ? [...SET_TOOLS, ...TOOLS.filter((t) => ['\\frac{a}{b}', '\\sqrt{a}'].includes(t.label))] : TOOLS;
  return (
    <div class="toolbar" role="toolbar" aria-label="Wstaw symbol">
      {tools.map((t) => (
        <button key={t.label} type="button" class="tool" title={t.title} aria-label={t.title}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => api.current?.insert(t.insert!)}
          dangerouslySetInnerHTML={{ __html: latexToHtml(t.label) }} />
      ))}
    </div>
  );
}

export function Icon({ name }: { name: 'back' | 'check' | 'lock' | 'close' | 'arrow' | 'cross' }) {
  const paths: Record<string, ComponentChildren> = {
    back: <path d="M15 5l-7 7 7 7" />,
    arrow: <path d="M9 5l7 7-7 7" />,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    cross: <path d="M6 6l12 12M18 6L6 18" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    lock: <><rect x="5.5" y="10.5" width="13" height="9" rx="1.5" /><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" /></>,
  };
  return <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function TopBar({ back, title, children }: { back?: string; title?: string; children?: ComponentChildren }) {
  return (
    <header class="topbar">
      {back !== undefined ? <a class="icon-btn" href={back} aria-label="Wróć"><Icon name="back" /></a> : <span class="wordmark">Pogromca<b>Matury</b></span>}
      {title && <h1 class="topbar-title">{title}</h1>}
      <div class="topbar-right">{children}</div>
    </header>
  );
}

export function Progress({ value }: { value: number }) {
  return <div class="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}><div style={{ width: `${Math.min(100, value * 100)}%` }} /></div>;
}
