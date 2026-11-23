// Zadania otwarte: pola kroków i odpowiedzi, punktacja częściowa wg schematu, osobny tryb ćwiczeń.
import { useEffect, useRef, useState } from 'preact/hooks';
import { openCiag, openDowod, openGeometria2, openKwadratowa, openNierownosc, openPrawd, openRownanie, openStereo, openSymetralna, OpenPart, OpenTask, scoreOpen } from '../exam/open';
import type { Rng } from '../math/rng';
import { checkAnswer, CheckResult } from '../math/check';
import { loadCE } from '../math/evaluate';
import { mulberry32 } from '../math/rng';
import { CalcButton } from './calculator';
import { Icon, MathDisplay, MathInput, MathInputApi, MathText, Toolbar, TopBar } from './components';
import { FormulaButton } from './formulas';
import { latexToHtml } from './mathlive';
import { kbFor } from './views';
import { Figure } from './Figure';

export interface OpenGrade { auto: number | null; partRes: (CheckResult | null)[]; stepRes: (CheckResult | null)[] }

const run = (vals: string[], list: OpenPart[]) => list.map((p, i) => (vals[i]?.trim() ? checkAnswer(vals[i], p.answer) : null));

/** Ocena z automatu; null tylko dla dowodów (brak pól do sprawdzenia) */
export function gradeOpen(t: OpenTask, parts: string[], steps: string[]): OpenGrade {
  const partRes = run(parts, t.parts), stepRes = run(steps, t.steps ?? []);
  if (!t.parts.length) return { auto: null, partRes, stepRes };
  const ok = (r: CheckResult | null) => r?.status === 'correct';
  return { auto: scoreOpen(t, stepRes.map(ok), partRes.map(ok)), partRes, stepRes };
}

const statusTag = (r: CheckResult | null | undefined) =>
  !r ? null : r.status === 'correct' ? <span class="tag ok">dobrze</span> : r.status === 'wrong' ? <span class="tag bad">źle</span> : <span class="tag warn">{r.message ?? 'popraw zapis'}</span>;

export function OpenInputs({ task, parts, steps, onPart, onStep, onEnter, api, disabled, grade }: {
  task: OpenTask; parts: string[]; steps: string[]; onPart: (k: number, l: string) => void; onStep: (k: number, l: string) => void;
  onEnter: () => void; api: { current: MathInputApi | null }; disabled?: boolean; grade?: OpenGrade;
}) {
  const hasSteps = !!task.steps?.length;
  return (
    <>
      <p class="task-text"><MathText text={task.text} /></p>
      {task.table && <table class="task-table"><thead><tr>{task.table[0].map((h, i) => <th key={i}>{h}</th>)}</tr></thead><tbody>{task.table.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><MathText text={c} /></td>)}</tr>)}</tbody></table>}
      {task.display && <MathDisplay latex={task.display} />}
      {task.figure && <Figure fig={task.figure} />}
      {task.after && <p class="task-text"><MathText text={task.after} /></p>}
      {task.parts.length === 0 ? (
        <p class="proof-note">To zadanie na dowodzenie. Zapisz rozumowanie na kartce, a potem porównaj je z kluczem i przyznaj sobie punkty.</p>
      ) : (
        <>
          <Toolbar api={api} kb={kbFor(task.parts[0].answer.form)} />
          {hasSteps && (
            <div class="steps">
              <p class="steps-title">Kroki pośrednie <span>nieobowiązkowe, za dobre dostajesz punkty częściowe</span></p>
              {task.steps!.map((st, k) => (
                <div class="part step" key={`s${k}`}>
                  <p class="step-title"><MathText text={st.title} /> {grade && statusTag(grade.stepRes[k])}</p>
                  <MathInput initial={steps[k] ?? ''} kb={kbFor(st.answer.form)} prefix={st.label ?? st.answer.prefix} suffix={st.answer.suffix}
                    onInput={(l) => onStep(k, l)} onEnter={onEnter} disabled={disabled} />
                </div>
              ))}
            </div>
          )}
          <p class="steps-title">Odpowiedź</p>
          {task.parts.map((p, k) => (
            <div class="part" key={k}>
              {grade && <p class="step-title">{statusTag(grade.partRes[k])}</p>}
              <MathInput initial={parts[k] ?? ''} kb={kbFor(p.answer.form)} apiRef={k === 0 ? api : undefined} prefix={p.label ?? p.answer.prefix} suffix={p.answer.suffix}
                onInput={(l) => onPart(k, l)} onEnter={onEnter} autoFocus={k === 0 && !hasSteps} disabled={disabled} />
            </div>
          ))}
          <p class="hint-line hint-any">W każdym polu możesz rozpisać obliczenia ze znakiem „=”. Liczy się wynik po ostatnim „=”.{task.steps?.some((s) => s.answer.form === 'equation') ? ' W kroku z równaniem wpisz całe równanie, np. 2(…) = … + …' : ''}</p>
        </>
      )}
    </>
  );
}

/** Schemat punktowania z zaznaczonym wynikiem; przy niepełnym wyniku samoocena rozwiązania z kartki */
export function OpenScore({ task, grade, self, onSelf }: { task: OpenTask; grade: OpenGrade; self?: number; onSelf: (v: number) => void }) {
  const auto = grade.auto;
  const final = auto === null ? self ?? 0 : Math.max(auto, self ?? 0);
  return (
    <div class="scheme">
      {auto !== null && <p class="review-line"><b>Z automatu: {auto} z {task.points} pkt.</b> {auto === task.points ? 'Wynik końcowy poprawny.' : auto > 0 ? 'Punkty częściowe za dobre kroki.' : 'Żaden krok ani wynik nie jest dobry.'}</p>}
      {auto !== task.points && (
        <>
          <p class="scheme-title">{auto === null ? 'Porównaj swój dowód z kluczem i przyznaj punkty.' : 'Masz na kartce więcej, niż wpisałeś? Wybierz poziom, który przyznałby egzaminator.'}</p>
          <div class="scheme-levels" role="radiogroup">
            {[{ pts: 0, desc: 'Brak rozwiązania albo brak istotnego postępu.' }, ...task.scheme].map((l) => (
              <button key={l.pts} role="radio" aria-checked={final === l.pts} disabled={auto !== null && l.pts < auto}
                class={`level${final === l.pts ? ' is-selected' : ''}${auto !== null && l.pts <= auto && l.pts > 0 ? ' is-earned' : ''}`} onClick={() => onSelf(l.pts)}>
                <span class="level-pts">{l.pts} pkt</span><span class="level-desc"><MathText text={l.desc} /></span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OpenAnswersReview({ task, grade, parts, steps }: { task: OpenTask; grade: OpenGrade; parts: string[]; steps: string[] }) {
  const line = (p: OpenPart, v: string | undefined, r: CheckResult | null, title?: string, key?: string) => (
    <p class="review-line" key={key}>
      {title && <><MathText text={title} />: </>}
      {(p.label ?? p.answer.prefix) && <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(p.label ?? p.answer.prefix!) }} />} {v ? <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(v) }} /> : 'brak'}
      {statusTag(r)}
      {r?.status !== 'correct' && <> · poprawnie: <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(p.answer.expected) }} /></>}
    </p>
  );
  return (
    <>
      {(task.steps ?? []).map((st, k) => (steps[k] ? line(st, steps[k], grade.stepRes[k], st.title, `s${k}`) : null))}
      {task.parts.map((p, k) => line(p, parts[k], grade.partRes[k], undefined, `p${k}`))}
    </>
  );
}

/* ───────── Tryb ćwiczeń ───────── */

const TYPES: { id: string; gen: (r: Rng) => OpenTask; title: string; pts: string }[] = [
  { id: 'nierownosc', gen: openNierownosc, title: 'Nierówność kwadratowa', pts: '2 pkt' },
  { id: 'rownanie', gen: openRownanie, title: 'Równanie wielomianowe (grupowanie)', pts: '2 pkt' },
  { id: 'dowod', gen: openDowod, title: 'Dowód algebraiczny', pts: '2 pkt' },
  { id: 'ciag', gen: openCiag, title: 'Ciąg arytmetyczny z niewiadomą', pts: '2 pkt' },
  { id: 'trojkat', gen: openGeometria2, title: 'Trójkąt prostokątny lub trygonometria', pts: '2 pkt' },
  { id: 'prawdopodobienstwo', gen: openPrawd, title: 'Prawdopodobieństwo', pts: '2 pkt' },
  { id: 'symetralna', gen: openSymetralna, title: 'Symetralna odcinka', pts: '4 pkt' },
  { id: 'ostroslup', gen: openStereo, title: 'Ostrosłup: objętość', pts: '4 pkt' },
  { id: 'kwadratowa', gen: openKwadratowa, title: 'Funkcja kwadratowa: współczynniki', pts: '5 pkt' },
];

export function OpenList() {
  return (
    <div class="page">
      <TopBar back="#/" title="Zadania otwarte" />
      <main class="container narrow">
        <h1 class="page-title">Zadania otwarte</h1>
        <p class="lead">Takie jak w drugiej części arkusza. Wpisujesz kroki pośrednie i wynik, a ja punktuję je jak egzaminator: za dobre kroki dostajesz punkty częściowe.</p>
        <ol class="todo">
          {TYPES.map((t) => <li key={t.id}><a class="todo-row" href={`#/otwarte/${t.id}`}><span class="todo-title">{t.title}</span><span class="todo-meta">{t.pts}</span><Icon name="arrow" /></a></li>)}
        </ol>
      </main>
    </div>
  );
}

export function OpenPractice({ id }: { id: string }) {
  const meta = TYPES.find((t) => t.id === id);
  const gen = meta?.gen;
  const [seed, setSeed] = useState(() => (Math.random() * 2 ** 31) | 0);
  const [ready, setReady] = useState(false);
  useEffect(() => { loadCE().then(() => setReady(true)); }, []);
  if (!gen || !meta) return <div class="page"><TopBar back="#/otwarte" /><main class="container narrow"><p>Nie ma takiego zadania.</p></main></div>;
  return (
    <div class="page lesson">
      <TopBar back="#/otwarte" title={meta.title}><FormulaButton /><CalcButton /></TopBar>
      <main class="container narrow">{ready && <OpenRun key={seed} task={gen(mulberry32(seed))} onNext={() => { setSeed((Math.random() * 2 ** 31) | 0); window.scrollTo(0, 0); }} />}</main>
    </div>
  );
}

function OpenRun({ task, onNext }: { task: OpenTask; onNext: () => void }) {
  const [parts, setParts] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [grade, setGrade] = useState<OpenGrade | null>(null);
  const [self, setSelf] = useState<number | undefined>();
  const api = useRef<MathInputApi | null>(null);
  const proof = !task.parts.length;
  const check = () => setGrade(gradeOpen(task, parts, steps));
  const final = grade ? (grade.auto === null ? self ?? 0 : Math.max(grade.auto, self ?? 0)) : 0;
  return (
    <>
      <section class="task-card">
        <p class="task-kind">Zadanie otwarte · 0–{task.points} pkt</p>
        <OpenInputs task={task} parts={parts} steps={steps} api={api} disabled={!!grade} grade={grade ?? undefined}
          onPart={(k, l) => setParts((a) => { const n = [...a]; n[k] = l; return n; })}
          onStep={(k, l) => setSteps((a) => { const n = [...a]; n[k] = l; return n; })}
          onEnter={() => { if (!grade && parts.some((x) => x?.trim())) check(); }} />
      </section>
      {grade && (
        <>
          <div class={`feedback ${final === task.points ? 'is-correct' : final > 0 ? 'is-form' : 'is-wrong'}`}><strong>{final} z {task.points} pkt.</strong></div>
          {!proof && <OpenAnswersReview task={task} grade={grade} parts={parts} steps={steps} />}
          <OpenScore task={task} grade={grade} self={self} onSelf={setSelf} />
          <section class="solution"><h3>Rozwiązanie wzorcowe</h3><ol>{task.solution.map((l, i) => <li key={i}><MathText text={l} /></li>)}</ol></section>
        </>
      )}
      <div class="actions">
        {!grade
          ? <button class="btn btn-primary grow" onClick={check} disabled={!proof && !parts.some((x) => x?.trim()) && !steps.some((x) => x?.trim())}>{proof ? 'Pokaż klucz' : 'Sprawdź i oceń'}</button>
          : <button class="btn btn-primary grow" onClick={onNext}>Następne zadanie</button>}
      </div>
    </>
  );
}
