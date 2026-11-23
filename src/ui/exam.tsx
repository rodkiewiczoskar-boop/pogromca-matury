// Próbna matura: arkusz 170 minut, 34 zadania, 50 punktów, ocena jak w CKE.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { buildExam, EXAM_MINUTES, ExamItem, maxPoints, PASS_PCT } from '../exam/builder';
import type { OpenTask } from '../exam/open';
import { checkAnswer, CheckResult } from '../math/check';
import { loadCE } from '../math/evaluate';
import { CalcButton } from './calculator';
import { Icon, MathDisplay, MathInput, MathInputApi, MathText, TopBar, Toolbar } from './components';
import { latexToHtml } from './mathlive';
import { update, useStore } from './store';
import { kbFor } from './views';
import { Figure } from './Figure';

interface ExamAnswers { choice: Record<number, number>; parts: Record<number, string[]>; self: Record<number, number> }
interface ExamState { seed: number; start: number; finishedAt?: number; answers: ExamAnswers; saved?: boolean }

const KEY = 'pogromca-matury:exam';
function loadExam(): ExamState | null { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveExam(s: ExamState | null) { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch { /* ignoruj */ } }

const fmtTime = (ms: number) => { const t = Math.max(0, Math.round(ms / 1000)); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };

export function ExamView() {
  const [st, setSt] = useState<ExamState | null>(loadExam);
  const [ready, setReady] = useState(false);
  useEffect(() => { loadCE().then(() => setReady(true)); }, []);
  const set = (s: ExamState | null) => { saveExam(s); setSt(s); };

  if (!st) return <ExamIntro ready={ready} onStart={() => set({ seed: (Math.random() * 2 ** 31) | 0, start: Date.now(), answers: { choice: {}, parts: {}, self: {} } })} />;
  if (!ready) return <div class="page"><TopBar back="#/" title="Próbna matura" /><main class="container narrow"><p class="lead">Wczytuję arkusz…</p></main></div>;
  return <ExamSession key={st.seed} st={st} set={set} />;
}

function ExamIntro({ onStart, ready }: { onStart: () => void; ready: boolean }) {
  const s = useStore();
  const hist = s.exams ?? [];
  return (
    <div class="page">
      <TopBar back="#/" title="Próbna matura" />
      <main class="container narrow">
        <h1 class="page-title">Próbna matura</h1>
        <p class="lead">Arkusz ułożony jak w CKE (formuła 2015, poziom podstawowy). Każdy arkusz jest losowany od nowa.</p>
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

function gradeItem(it: ExamItem, a: ExamAnswers): { auto: number | null; results: (CheckResult | null)[] } {
  if (it.kind === 'closed') {
    const c = a.choice[it.num];
    return { auto: c === it.q.correct ? 1 : 0, results: [] };
  }
  const t = it.task;
  if (!t.parts.length) return { auto: null, results: [] };
  const vals = a.parts[it.num] ?? [];
  const results = t.parts.map((p, i) => (vals[i] ? checkAnswer(vals[i], p.answer) : null));
  return { auto: results.every((r) => r?.status === 'correct') ? it.points : null, results };
}

function ExamSession({ st, set }: { st: ExamState; set: (s: ExamState | null) => void }) {
  const items = useMemo(() => buildExam(st.seed), [st.seed]);
  const [i, setI] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [confirmEnd, setConfirmEnd] = useState(false);
  const api = useRef<MathInputApi | null>(null);
  const end = st.start + EXAM_MINUTES * 60_000;
  const finished = !!st.finishedAt;

  useEffect(() => { if (finished) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [finished]);
  useEffect(() => { if (!finished && now >= end) finish(); }, [now]);

  function patch(f: (a: ExamAnswers) => void) { const n: ExamState = JSON.parse(JSON.stringify(st)); f(n.answers); set(n); }
  function finish() { set({ ...st, finishedAt: Date.now() }); window.scrollTo(0, 0); }

  if (finished) return <ExamResult items={items} st={st} set={set} />;

  const it = items[i];
  const answered = (x: ExamItem) => (x.kind === 'closed' ? st.answers.choice[x.num] !== undefined : x.task.parts.length ? (st.answers.parts[x.num] ?? []).some(Boolean) : true);
  const left = end - now;
  return (
    <div class="page lesson exam">
      <TopBar back="#/" title={`Zadanie ${it.num} z ${items.length}`}>
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
              <div class="options" role="radiogroup">
                {it.q.options.map((o, k) => (
                  <button key={k} role="radio" aria-checked={st.answers.choice[it.num] === k} class={`option${st.answers.choice[it.num] === k ? ' is-selected' : ''}`} onClick={() => patch((a) => { a.choice[it.num] = k; })}>
                    <span class="option-letter">{'ABCD'[k]}</span>
                    <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(o) }} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <OpenInputs task={it.task} values={st.answers.parts[it.num] ?? []} api={api}
              onChange={(k, l) => patch((a) => { const arr = a.parts[it.num] ?? []; arr[k] = l; a.parts[it.num] = arr; })}
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

function OpenInputs({ task, values, onChange, onEnter, api }: { task: OpenTask; values: string[]; onChange: (k: number, l: string) => void; onEnter: () => void; api: { current: MathInputApi | null } }) {
  return (
    <>
      <p class="task-text"><MathText text={task.text} /></p>
      {task.display && <MathDisplay latex={task.display} />}
      {task.parts.length === 0 ? (
        <p class="proof-note">To zadanie na dowodzenie. Zapisz rozumowanie na kartce. Po zakończeniu matury porównasz je z kluczem i przyznasz sobie punkty.</p>
      ) : (
        <>
          <Toolbar api={api} kb={kbFor(task.parts[0].answer.form)} />
          {task.parts.map((p, k) => (
            <div class="part" key={k}>
              <MathInput initial={values[k] ?? ''} kb={kbFor(p.answer.form)} apiRef={k === 0 ? api : undefined} prefix={p.label ?? p.answer.prefix} suffix={p.answer.suffix}
                onInput={(l) => onChange(k, l)} onEnter={onEnter} autoFocus={k === 0} />
            </div>
          ))}
          <p class="hint-line hint-any">Możesz rozpisać obliczenia ze znakiem „=”. Liczy się wynik po ostatnim „=”. Przy ocenie porównasz rozwiązanie z kluczem.</p>
        </>
      )}
    </>
  );
}

function ExamResult({ items, st, set }: { items: ExamItem[]; st: ExamState; set: (s: ExamState | null) => void }) {
  const graded = items.map((it) => gradeItem(it, st.answers));
  const pts = items.map((it, k) => graded[k].auto ?? Math.min(it.points, st.answers.self[it.num] ?? 0));
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
      const row = { date, points: total, max, pct };
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
                  <details class="closed-ok"><summary>Pokaż zadanie</summary><p><MathText text={it.q.task.text} /></p>{it.q.task.display && <MathDisplay latex={it.q.task.display} />}{it.q.task.figure && <Figure fig={it.q.task.figure} />}<p class="review-line">Odpowiedź <b>{'ABCD'[it.q.correct]}</b> <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(it.q.task.answer.expected) }} /></p></details>
                ) : it.kind === 'closed' ? (
                  <>
                    <p><MathText text={it.q.task.text} /></p>
                    {it.q.task.display && <MathDisplay latex={it.q.task.display} />}
                    {it.q.task.figure && <Figure fig={it.q.task.figure} />}
                    <p class="review-line">Twoja odpowiedź: {st.answers.choice[it.num] !== undefined ? <><b>{'ABCD'[st.answers.choice[it.num]]}</b> <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(it.q.options[st.answers.choice[it.num]]) }} /></> : 'brak'}</p>
                    {!full && <p class="review-line">Poprawnie: <b>{'ABCD'[it.q.correct]}</b> <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(it.q.task.answer.expected) }} /></p>}
                    {!full && <details><summary>Rozwiązanie</summary><ol>{it.q.task.solution.map((l, j) => <li key={j}><MathText text={l} /></li>)}</ol></details>}
                  </>
                ) : (
                  <OpenReview it={it} g={g} values={st.answers.parts[it.num] ?? []} self={st.answers.self[it.num]} onSelf={(v) => setSelf(it.num, v)} />
                )}
              </li>
            );
          })}
        </ol>
        <div class="actions">
          <a class="btn btn-ghost" href="#/">Na start</a>
          <button class="btn btn-primary grow" onClick={() => set(null)}>Nowa próbna matura</button>
        </div>
      </main>
    </div>
  );
}

function OpenReview({ it, g, values, self, onSelf }: { it: Extract<ExamItem, { kind: 'open' }>; g: { auto: number | null; results: (CheckResult | null)[] }; values: string[]; self?: number; onSelf: (v: number) => void }) {
  const t = it.task;
  return (
    <>
      <p><MathText text={t.text} /></p>
      {t.display && <MathDisplay latex={t.display} />}
      {t.parts.map((p, k) => (
        <p class="review-line" key={k}>
          {p.label && <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(p.label) }} />} Twoja odpowiedź: {values[k] ? <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(values[k]) }} /> : 'brak'}
          {g.results[k]?.status === 'correct' ? <span class="tag ok">dobrze</span> : values[k] ? <span class="tag bad">{g.results[k]?.status === 'form' ? 'popraw zapis' : 'źle'}</span> : null}
          {g.results[k]?.status !== 'correct' && <> · poprawnie: <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(p.answer.expected) }} /></>}
        </p>
      ))}
      {g.auto !== null ? <p class="review-line muted">Wynik końcowy poprawny: pełna liczba punktów.</p> : (
        <div class="scheme">
          <p class="scheme-title">{t.parts.length ? 'Wynik nie jest pełny. Ile punktów przyznałby egzaminator za Twoje rozwiązanie z kartki?' : 'Porównaj swój dowód z kluczem i przyznaj punkty.'}</p>
          <div class="scheme-levels" role="radiogroup">
            {[{ pts: 0, desc: 'Brak rozwiązania albo brak istotnego postępu.' }, ...t.scheme].map((l) => (
              <button key={l.pts} role="radio" aria-checked={(self ?? 0) === l.pts} class={`level${(self ?? 0) === l.pts ? ' is-selected' : ''}`} onClick={() => onSelf(l.pts)}>
                <span class="level-pts">{l.pts} pkt</span><span class="level-desc"><MathText text={l.desc} /></span>
              </button>
            ))}
          </div>
        </div>
      )}
      <details open={g.auto === null}><summary>Rozwiązanie wzorcowe</summary><ol>{t.solution.map((l, j) => <li key={j}><MathText text={l} /></li>)}</ol></details>
    </>
  );
}
