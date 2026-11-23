// Próbna matura: arkusz 170 minut, 34 zadania, 50 punktów, ocena jak w CKE.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { buildExam, EXAM_MINUTES, ExamItem, maxPoints, PASS_PCT } from '../exam/builder';
import { ARKUSZE, Arkusz } from '../content/arkusze';
import type { OpenTask } from '../exam/open';
import { loadCE } from '../math/evaluate';
import { CalcButton } from './calculator';
import { FormulaButton } from './formulas';
import { Icon, MathDisplay, OptionMath, MathInputApi, MathText, TopBar } from './components';
import { latexToHtml } from './mathlive';
import { recordResults, update, useStore } from './store';
import { gradeOpen, OpenAnswersReview, OpenGrade, OpenInputs, OpenScore } from './open';
import { Figure } from './Figure';

interface ExamAnswers { choice: Record<number, number>; parts: Record<number, string[]>; self: Record<number, number>; steps?: Record<number, string[]> }
interface ExamState { seed: number; start: number; finishedAt?: number; answers: ExamAnswers; saved?: boolean }

const keyFor = (sheet?: string) => `pogromca-matury:exam${sheet ? `:${sheet}` : ''}`;
function loadExam(sheet?: string): ExamState | null { try { const r = localStorage.getItem(keyFor(sheet)); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveExam(s: ExamState | null, sheet?: string) { try { if (s) localStorage.setItem(keyFor(sheet), JSON.stringify(s)); else localStorage.removeItem(keyFor(sheet)); } catch { /* ignoruj */ } }

/** Oryginalny arkusz CKE jako pozycje arkusza próbnej matury */
export function arkuszItems(a: Arkusz): ExamItem[] {
  return a.items.map((it): ExamItem => it.kind === 'open'
    ? { kind: 'open', num: it.num, points: it.task.points, task: it.task }
    : { kind: 'closed', num: it.num, points: 1, q: { kind: 'choice', options: [...it.options], correct: it.correct, task: {
      text: it.text, display: it.display, figure: it.figure, after: it.after, solution: it.solution, skillId: it.skillId,
      answer: { kind: 'input', expected: it.options[it.correct], form: 'any' }, verify: { expr: '0' }, distractors: [] } } });
}

const fmtTime = (ms: number) => { const t = Math.max(0, Math.round(ms / 1000)); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };

export function ExamView({ sheet }: { sheet?: string }) {
  const arkusz = sheet ? ARKUSZE.find((a) => a.id === sheet) : undefined;
  const [st, setSt] = useState<ExamState | null>(() => loadExam(sheet));
  const [ready, setReady] = useState(false);
  useEffect(() => { loadCE().then(() => setReady(true)); }, []);
  const set = (s: ExamState | null) => { saveExam(s, sheet); setSt(s); };

  if (sheet && !arkusz) return <div class="page"><TopBar back="#/arkusze" title="Arkusz" /><main class="container narrow"><p class="lead">Nie ma takiego arkusza.</p></main></div>;
  if (!st) return <ExamIntro arkusz={arkusz} ready={ready} onStart={() => set({ seed: (Math.random() * 2 ** 31) | 0, start: Date.now(), answers: { choice: {}, parts: {}, self: {} } })} />;
  if (!ready) return <div class="page"><TopBar back="#/" title="Próbna matura" /><main class="container narrow"><p class="lead">Wczytuję arkusz…</p></main></div>;
  return <ExamSession key={st.seed} st={st} set={set} arkusz={arkusz} />;
}

function ExamIntro({ onStart, ready, arkusz }: { onStart: () => void; ready: boolean; arkusz?: Arkusz }) {
  const s = useStore();
  const hist = (s.exams ?? []).filter((e) => e.sheet === arkusz?.id);
  return (
    <div class="page">
      <TopBar back={arkusz ? '#/arkusze' : '#/'} title={arkusz ? 'Arkusz CKE' : 'Próbna matura'} />
      <main class="container narrow">
        <h1 class="page-title">{arkusz ? arkusz.title : 'Próbna matura'}</h1>
        <p class="lead">{arkusz ? `${arkusz.subtitle}. Oryginalne zadania z arkusza CKE, punktowane według oficjalnego klucza.` : 'Arkusz ułożony jak w CKE (formuła 2015, poziom podstawowy). Każdy arkusz jest losowany od nowa.'}</p>
        <ul class="facts">
          <li><b>{EXAM_MINUTES} minut</b>, zegar odlicza czas. Możesz zamknąć aplikację i wrócić, arkusz poczeka.</li>
          <li><b>25 zadań zamkniętych</b> (A–D) po 1 punkcie</li>
          <li><b>9 zadań otwartych</b>: sześć po 2 punkty, dwa po 4 i jedno za 5 punktów. Rozwiązuj na kartce, a wpisz wynik.</li>
          <li>Razem <b>50 punktów</b>. Matura zdana od <b>{PASS_PCT}%</b>, czyli 15 punktów.</li>
          <li>Wolno używać prostego kalkulatora (jest w aplikacji) i karty wzorów CKE.</li>
          <li>Po zakończeniu ocenisz rozwiązania zadań otwartych według klucza, tak jak egzaminator.</li>
        </ul>
        <button class="btn btn-primary" disabled={!ready} onClick={onStart}>{ready ? 'Rozpoczynam maturę' : 'Wczytuję…'}<Icon name="arrow" /></button>
        {hist.length > 0 && (
          <section class="history">
            <h2 class="section-title">Twoje wyniki</h2>
            <ol>
              {[...hist].reverse().map((h, i) => (
                <li key={i}><span>{new Date(h.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</span><b class={h.pct >= PASS_PCT ? 'ok' : 'bad'}>{h.points}/{h.max} pkt · {h.pct}%</b></li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}

function gradeItem(it: ExamItem, a: ExamAnswers): OpenGrade {
  if (it.kind === 'closed') return { auto: a.choice[it.num] === it.q.correct ? 1 : 0, partRes: [], stepRes: [] };
  return gradeOpen(it.task, a.parts[it.num] ?? [], a.steps?.[it.num] ?? []);
}
const itemPoints = (it: ExamItem, g: OpenGrade, self?: number) => (g.auto === null ? Math.min(it.points, self ?? 0) : Math.max(g.auto, Math.min(it.points, self ?? 0)));

function ExamSession({ st, set, arkusz }: { st: ExamState; set: (s: ExamState | null) => void; arkusz?: Arkusz }) {
  const items = useMemo(() => (arkusz ? arkuszItems(arkusz) : buildExam(st.seed)), [st.seed]);
  const [i, setI] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [confirmEnd, setConfirmEnd] = useState(false);
  const api = useRef<MathInputApi | null>(null);
  const end = st.start + EXAM_MINUTES * 60_000;
  const finished = !!st.finishedAt;

  useEffect(() => { if (finished) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [finished]);
  useEffect(() => { if (!finished && now >= end) finish(); }, [now]);

  function patch(f: (a: ExamAnswers) => void) { const n: ExamState = JSON.parse(JSON.stringify(st)); f(n.answers); set(n); }
  function finish() {
    recordResults(items.flatMap((x) => (x.kind === 'closed' ? [{ skillId: x.q.task.skillId!, seed: x.q.task.seed, ok: st.answers.choice[x.num] === x.q.correct }] : [])));
    set({ ...st, finishedAt: Date.now() }); window.scrollTo(0, 0);
  }

  if (finished) return <ExamResult items={items} st={st} set={set} arkusz={arkusz} />;

  const it = items[i];
  const answered = (x: ExamItem) => (x.kind === 'closed' ? st.answers.choice[x.num] !== undefined : x.task.parts.length ? (st.answers.parts[x.num] ?? []).some(Boolean) : true);
  const left = end - now;
  return (
    <div class="page lesson exam">
      <TopBar back={arkusz ? '#/arkusze' : '#/'} title={`Zadanie ${it.num} z ${items.length}`}>
        <FormulaButton />
        <CalcButton />
        <span class={`timer${left < 10 * 60_000 ? ' is-low' : ''}`} aria-label="Pozostały czas">{fmtTime(left)}</span>
      </TopBar>
      <main class="container narrow">
        <nav class="qnav exam-nav" aria-label="Zadania">
          {items.map((x, k) => (
            <button key={k} class={`qnav-dot${k === i ? ' is-current' : ''}${answered(x) && (x.kind === 'closed' || x.task.parts.length) ? ' is-answered' : ''}${x.kind === 'open' ? ' is-open-task' : ''}`} onClick={() => setI(k)}>{x.num}</button>
          ))}
        </nav>
        <section class="task-card" key={i}>
          <p class="task-kind">{it.kind === 'closed' ? 'Zadanie zamknięte · 0–1 pkt' : `Zadanie otwarte · 0–${it.points} pkt`}</p>
          {it.kind === 'closed' ? (
            <>
              <p class="task-text"><MathText text={it.q.task.text} /></p>
              {it.q.task.display && <MathDisplay latex={it.q.task.display} />}
              {it.q.task.figure && <Figure fig={it.q.task.figure} />}
              {it.q.task.after && <p class="task-text"><MathText text={it.q.task.after} /></p>}
              <div class="options" role="radiogroup">
                {it.q.options.map((o, k) => (
                  <button key={k} role="radio" aria-checked={st.answers.choice[it.num] === k} class={`option${st.answers.choice[it.num] === k ? ' is-selected' : ''}`} onClick={() => patch((a) => { a.choice[it.num] = k; })}>
                    <span class="option-letter">{'ABCD'[k]}</span>
                    <OptionMath latex={o} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <OpenInputs task={it.task} parts={st.answers.parts[it.num] ?? []} steps={st.answers.steps?.[it.num] ?? []} api={api}
              onPart={(k, l) => patch((a) => { const arr = a.parts[it.num] ?? []; arr[k] = l; a.parts[it.num] = arr; })}
              onStep={(k, l) => patch((a) => { a.steps ??= {}; const arr = a.steps[it.num] ?? []; arr[k] = l; a.steps[it.num] = arr; })}
              onEnter={() => i < items.length - 1 && setI(i + 1)} />
          )}
        </section>
        <div class="actions">
          <button class="btn btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Poprzednie</button>
          {i < items.length - 1 ? <button class="btn btn-primary grow" onClick={() => setI(i + 1)}>Następne</button>
            : <button class="btn btn-primary grow" onClick={() => setConfirmEnd(true)}>Zakończ maturę</button>}
        </div>
        {!confirmEnd && <button class="link-btn" onClick={() => setConfirmEnd(true)}>Zakończ wcześniej</button>}
        {confirmEnd && (
          <div class="confirm">
            <p>Zakończyć arkusz? Bez odpowiedzi: {items.filter((x) => (x.kind === 'closed' || x.task.parts.length) && !answered(x)).length} zadań. Pozostały czas: {fmtTime(left)}.</p>
            <div class="actions">
              <button class="btn btn-ghost" onClick={() => setConfirmEnd(false)}>Wracam do zadań</button>
              <button class="btn btn-primary grow" onClick={finish}>Tak, kończę</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ExamResult({ items, st, set, arkusz }: { items: ExamItem[]; st: ExamState; set: (s: ExamState | null) => void; arkusz?: Arkusz }) {
  const graded = items.map((it) => gradeItem(it, st.answers));
  const pts = items.map((it, k) => itemPoints(it, graded[k], st.answers.self[it.num]));
  const total = pts.reduce((a, b) => a + b, 0);
  const max = maxPoints(items);
  const pct = Math.round((total / max) * 100);
  const toAssess = items.filter((it, k) => it.kind === 'open' && graded[k].auto === null);
  const closedPts = pts.slice(0, 25).reduce((a, b) => a + b, 0);
  const s = useStore();

  useEffect(() => {
    // zapis wyniku w historii (aktualizowany przy zmianie samooceny)
    update((x) => {
      x.exams = x.exams ?? [];
      const date = new Date(st.finishedAt!).toISOString();
      const idx = x.exams.findIndex((e) => e.date === date);
      const row = { date, points: total, max, pct, ...(arkusz ? { sheet: arkusz.id } : {}) };
      if (idx >= 0) x.exams[idx] = row; else x.exams.push(row);
    });
  }, [total]);

  const setSelf = (num: number, v: number) => { const n: ExamState = JSON.parse(JSON.stringify(st)); n.answers.self[num] = v; set(n); };
  void s;

  return (
    <div class="page">
      <TopBar back="#/" title="Wynik próbnej matury" />
      <main class="container narrow">
        <div class={`score ${pct >= PASS_PCT ? 'is-pass' : 'is-fail'}`}>
          <span class="score-num">{pct}%</span>
          <span class="score-text">{total} z {max} punktów · {pct >= PASS_PCT ? 'matura zdana' : `do zdania brakuje ${Math.ceil((PASS_PCT / 100) * max) - total} pkt`}</span>
          <span class="score-sub">Zadania zamknięte: {closedPts}/25 · otwarte: {total - closedPts}/25 · czas: {fmtTime(st.finishedAt! - st.start)}</span>
        </div>
        {toAssess.length > 0 && <p class="assess-note">Oceń jeszcze {toAssess.length} {toAssess.length === 1 ? 'zadanie otwarte' : 'zadań otwartych'} według klucza poniżej. Wynik zmieni się od razu.</p>}
        <ol class="review exam-review">
          {[...items.keys()].sort((x, y) => (items[y].kind === 'open' ? 1 : 0) - (items[x].kind === 'open' ? 1 : 0) || x - y).map((k) => {
            const it = items[k];
            const g = graded[k];
            const full = pts[k] === it.points;
            const zero = pts[k] === 0;
            return (
              <li key={k} class={full ? 'is-ok' : zero ? 'is-bad' : 'is-part'}>
                <div class="review-head">
                  <span class="badge">{full ? <Icon name="check" /> : zero ? <Icon name="cross" /> : '½'}</span>
                  Zadanie {it.num}<span class="pts">{pts[k]}/{it.points} pkt</span>
                </div>
                {it.kind === 'closed' && full ? (
                  <details class="closed-ok"><summary>Pokaż zadanie</summary><p><MathText text={it.q.task.text} /></p>{it.q.task.display && <MathDisplay latex={it.q.task.display} />}{it.q.task.figure && <Figure fig={it.q.task.figure} />}{it.q.task.after && <p><MathText text={it.q.task.after} /></p>}<p class="review-line">Odpowiedź <b>{'ABCD'[it.q.correct]}</b> <OptionMath latex={it.q.task.answer.expected} /></p></details>
                ) : it.kind === 'closed' ? (
                  <>
                    <p><MathText text={it.q.task.text} /></p>
                    {it.q.task.display && <MathDisplay latex={it.q.task.display} />}
                    {it.q.task.figure && <Figure fig={it.q.task.figure} />}
                    {it.q.task.after && <p><MathText text={it.q.task.after} /></p>}
                    <p class="review-line">Twoja odpowiedź: {st.answers.choice[it.num] !== undefined ? <><b>{'ABCD'[st.answers.choice[it.num]]}</b> <OptionMath latex={it.q.options[st.answers.choice[it.num]]} /></> : 'brak'}</p>
                    {!full && <p class="review-line">Poprawnie: <b>{'ABCD'[it.q.correct]}</b> <OptionMath latex={it.q.task.answer.expected} /></p>}
                    {!full && <details><summary>Rozwiązanie</summary><ol>{it.q.task.solution.map((l, j) => <li key={j}><MathText text={l} /></li>)}</ol></details>}
                  </>
                ) : (
                  <OpenReview it={it} g={g} values={st.answers.parts[it.num] ?? []} steps={st.answers.steps?.[it.num] ?? []} self={st.answers.self[it.num]} onSelf={(v) => setSelf(it.num, v)} />
                )}
              </li>
            );
          })}
        </ol>
        <div class="actions">
          <a class="btn btn-ghost" href="#/">Na start</a>
          <button class="btn btn-primary grow" onClick={() => set(null)}>{arkusz ? 'Rozwiąż ten arkusz jeszcze raz' : 'Nowa próbna matura'}</button>
        </div>
      </main>
    </div>
  );
}

function OpenReview({ it, g, values, steps, self, onSelf }: { it: Extract<ExamItem, { kind: 'open' }>; g: OpenGrade; values: string[]; steps: string[]; self?: number; onSelf: (v: number) => void }) {
  const t = it.task;
  return (
    <>
      <p><MathText text={t.text} /></p>
      {t.display && <MathDisplay latex={t.display} />}
      <OpenAnswersReview task={t} grade={g} parts={values} steps={steps} />
      <OpenScore task={t} grade={g} self={self} onSelf={onSelf} />
      <details open={g.auto !== t.points}><summary>Rozwiązanie wzorcowe</summary><ol>{t.solution.map((l, j) => <li key={j}><MathText text={l} /></li>)}</ol></details>
    </>
  );
}

export function ArkuszeList() {
  const s = useStore();
  return (
    <div class="page">
      <TopBar back="#/" title="Arkusze CKE" />
      <main class="container narrow">
        <h1 class="page-title">Arkusze CKE</h1>
        <p class="lead">Prawdziwe matury z matematyki (formuła 2015, poziom podstawowy) z oficjalnym kluczem odpowiedzi. Rozwiązujesz je tak jak losowaną próbną maturę: 170 minut, kalkulator i karta wzorów.</p>
        <ol class="todo">
          {ARKUSZE.map((a) => {
            const best = (s.exams ?? []).filter((e) => e.sheet === a.id).reduce<number | null>((m, e) => (m === null ? e.pct : Math.max(m, e.pct)), null);
            const running = loadExam(a.id);
            return (
              <li key={a.id}><a class="todo-row" href={`#/arkusz/${a.id}`}>
                <span class="todo-title">{a.title}</span>
                <span class="todo-meta">{a.subtitle}{running && !running.finishedAt ? ' · w trakcie' : best !== null ? ` · najlepiej ${best}%` : ''}</span>
                <Icon name="arrow" />
              </a></li>
            );
          })}
        </ol>
        <p class="muted">Losowane próbne matury znajdziesz na stronie głównej. Arkusz CKE ma stałe zadania, więc najlepiej rozwiązać go raz, w warunkach jak na egzaminie.</p>
      </main>
    </div>
  );
}
