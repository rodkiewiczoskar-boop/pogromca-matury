import { useEffect, useRef, useState } from 'preact/hooks';
import { DZIALY, PLANNED, STAGE_GOAL } from '../content/curriculum';
import { buildTest, Question, TEST_SIZE } from '../content/testBuilder';
import type { Dzial, Skill, Task } from '../content/types';
import { checkAnswer, CheckResult } from '../math/check';
import { mulberry32 } from '../math/rng';
import { loadCE } from '../math/evaluate';
import { Icon, MathDisplay, MathInput, MathInputApi, MathText, Progress, Toolbar, TopBar } from './components';
import { latexToHtml } from './mathlive';
import { dzialProgress, findSkill, isUnlocked, recordAnswer, skillProgress, testUnlocked, update, useStore } from './store';

const seed = () => (Math.random() * 2 ** 31) | 0;

/* ───────────── Start ───────────── */
export function Home() {
  const s = useStore();
  const total = DZIALY.reduce((a, d) => a + d.skills.length, 0);
  const done = DZIALY.reduce((a, d) => a + d.skills.filter((k) => skillProgress(s, k.id).done).length, 0);
  const next = nextStage(s);
  return (
    <div class="page">
      <TopBar />
      <main class="container">
        <section class="hero">
          <p class="eyebrow">Matura z matematyki · poziom podstawowy</p>
          <h1>Najpierw liczysz, potem czytasz.</h1>
          <p class="lead">Każdy etap to krótka ściąga i seria zadań. Zaliczasz go po {STAGE_GOAL} dobrych odpowiedziach. Na końcu działu czeka test jak na maturze.</p>
          <div class="hero-row">
            {next && <a class="btn btn-primary" href={`#/s/${next.id}`}>{done ? 'Kontynuuj' : 'Zacznij'}: {next.title}<Icon name="arrow" /></a>}
            <span class="stat"><b>{done}</b> z {total} etapów</span>
          </div>
        </section>

        <h2 class="section-title">Działy</h2>
        <ol class="dzialy">
          {DZIALY.map((d) => {
            const pr = dzialProgress(s, d);
            return (
              <li key={d.id}>
                <a class="dzial-row" href={`#/d/${d.id}`}>
                  <span class="dzial-num">{d.num}</span>
                  <span class="dzial-body">
                    <span class="dzial-title">{d.title}</span>
                    <span class="dzial-meta">{d.skills.length} etapów i test{s.tests[d.id] ? ` · najlepszy wynik ${s.tests[d.id].best}%` : ''}</span>
                    <Progress value={pr} />
                  </span>
                  <Icon name="arrow" />
                </a>
              </li>
            );
          })}
          {PLANNED.map((t, i) => (
            <li key={t}>
              <div class="dzial-row is-planned">
                <span class="dzial-num">{DZIALY.length + i + 1}</span>
                <span class="dzial-body"><span class="dzial-title">{t}</span><span class="dzial-meta">w przygotowaniu</span></span>
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}

function nextStage(s: ReturnType<typeof useStore>): Skill | null {
  for (const d of DZIALY) for (const k of d.skills) if (!skillProgress(s, k.id).done) return k;
  return null;
}

/* ───────────── Dział ───────────── */
export function DzialView({ id }: { id: string }) {
  const s = useStore();
  const d = DZIALY.find((x) => x.id === id);
  if (!d) return <NotFound />;
  const tOpen = testUnlocked(s, d);
  const tr = s.tests[d.id];
  return (
    <div class="page">
      <TopBar back="#/" title={`Dział ${d.num}`} />
      <main class="container">
        <h1 class="page-title">{d.title}</h1>
        <ol class="track">
          {d.skills.map((k, i) => {
            const p = skillProgress(s, k.id);
            const open = isUnlocked(s, d, i);
            const state = p.done ? 'done' : open ? 'open' : 'locked';
            const body = (
              <>
                <span class="track-dot">{p.done ? <Icon name="check" /> : open ? i + 1 : <Icon name="lock" />}</span>
                <span class="track-body">
                  <span class="track-title">{k.title}</span>
                  <span class="track-meta">{p.done ? 'zaliczony · możesz powtarzać' : open ? `${Math.min(p.correct, STAGE_GOAL)} z ${STAGE_GOAL} poprawnych` : `najpierw etap ${i}`}</span>
                </span>
              </>
            );
            return <li key={k.id} class={`track-item is-${state}`}>{open ? <a href={`#/s/${k.id}`}>{body}</a> : <div>{body}</div>}</li>;
          })}
          <li class={`track-item is-test ${tOpen ? (tr && tr.best >= 70 ? 'is-done' : 'is-open') : 'is-locked'}`}>
            {(() => {
              const body = (
                <>
                  <span class="track-dot">{tOpen ? 'T' : <Icon name="lock" />}</span>
                  <span class="track-body">
                    <span class="track-title">Test z działu</span>
                    <span class="track-meta">{tr ? `ostatnio ${tr.last}%, najlepiej ${tr.best}%` : tOpen ? `${TEST_SIZE} zadań, jak na maturze` : 'odblokujesz po wszystkich etapach'}</span>
                  </span>
                </>
              );
              return tOpen ? <a href={`#/t/${d.id}`}>{body}</a> : <div>{body}</div>;
            })()}
          </li>
        </ol>
        {!s.freeMode && (
          <button class="link-btn" onClick={() => update((x) => { x.freeMode = true; })}>Znam podstawy, chcę wybierać etapy dowolnie</button>
        )}
      </main>
    </div>
  );
}

/* ───────────── Etap (ćwiczenia) ───────────── */
export function Lesson({ id }: { id: string }) {
  const found = findSkill(id);
  if (!found) return <NotFound />;
  return <LessonInner key={id} dzial={found.dzial} skill={found.skill} index={found.index} />;
}

function LessonInner({ dzial, skill, index }: { dzial: Dzial; skill: Skill; index: number }) {
  const s = useStore();
  const prog = skillProgress(s, skill.id);
  const [task, setTask] = useState<Task>(() => skill.generate(mulberry32(seed())));
  const [latex, setLatex] = useState('');
  const [res, setRes] = useState<CheckResult | null>(null);
  const [showSol, setShowSol] = useState(false);
  const [tipOpen, setTipOpen] = useState(!s.tipsSeen[skill.id]);
  const [celebrate, setCelebrate] = useState(false);
  const api = useRef<MathInputApi | null>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const wasDone = useRef(prog.done);

  const finished = res && (res.status === 'correct' || res.status === 'wrong');

  useEffect(() => { if (!s.tipsSeen[skill.id]) update((x) => { x.tipsSeen[skill.id] = true; }); }, []);
  useEffect(() => { if (finished) nextBtn.current?.focus(); }, [finished]);

  async function check() {
    if (finished) return next();
    await loadCE();
    const r = checkAnswer(latex, task.answer);
    setRes(r);
    if (r.status === 'correct' || r.status === 'wrong') {
      recordAnswer(skill.id, r.status === 'correct');
      if (r.status === 'wrong') setShowSol(true);
    }
  }
  function giveUp() {
    setRes({ status: 'wrong', message: 'Zobacz rozwiązanie krok po kroku.' });
    recordAnswer(skill.id, false);
    setShowSol(true);
  }
  function next() {
    if (!wasDone.current && skillProgress(s, skill.id).done) { wasDone.current = true; setCelebrate(true); return; }
    setTask(skill.generate(mulberry32(seed())));
    setRes(null); setShowSol(false); setLatex('');
    api.current?.clear();
    setTimeout(() => api.current?.focus(), 30);
  }

  const nextSkill = dzial.skills[index + 1];

  if (celebrate) {
    return (
      <div class="page">
        <TopBar back={`#/d/${dzial.id}`} title={skill.title} />
        <main class="container narrow done-screen">
          <span class="big-check"><Icon name="check" /></span>
          <h1>Etap zaliczony</h1>
          <p class="lead">{prog.correct} poprawnych na {prog.attempts} prób.</p>
          <div class="stack">
            {nextSkill ? <a class="btn btn-primary" href={`#/s/${nextSkill.id}`}>Następny etap: {nextSkill.title}<Icon name="arrow" /></a>
              : <a class="btn btn-primary" href={`#/t/${dzial.id}`}>Przejdź do testu z działu<Icon name="arrow" /></a>}
            <button class="btn btn-ghost" onClick={() => { setCelebrate(false); next(); }}>Ćwicz dalej ten etap</button>
          </div>
        </main>
      </div>
    );
  }

  const feedbackClass = res ? `feedback is-${res.status}` : 'feedback';
  return (
    <div class="page lesson">
      <TopBar back={`#/d/${dzial.id}`} title={skill.title}>
        <span class="counter">{Math.min(prog.correct, STAGE_GOAL)}/{STAGE_GOAL}</span>
      </TopBar>
      <div class="lesson-progress"><Progress value={prog.correct / STAGE_GOAL} /></div>
      <main class="container narrow">
        <section class={`tip${tipOpen ? ' is-open' : ''}`}>
          <button class="tip-head" onClick={() => setTipOpen(!tipOpen)} aria-expanded={tipOpen}>
            <span>Ściąga</span><span class="tip-toggle">{tipOpen ? 'zwiń' : 'pokaż'}</span>
          </button>
          {tipOpen && <div class="tip-body">{skill.tip.map((t, i) => <p key={i}><MathText text={t} /></p>)}</div>}
        </section>

        <section class="task-card">
          <p class="task-text"><MathText text={task.text} /></p>
          {task.display && <MathDisplay latex={task.display} />}
          <Toolbar api={api} />
          <MathInput apiRef={api} onInput={(l) => { setLatex(l); if (res && !finished) setRes(null); }} onEnter={check}
            prefix={task.answer.prefix} suffix={task.answer.suffix} disabled={!!finished} autoFocus />
          <p class="hint-line">Skróty: <kbd>/</kbd> ułamek, <kbd>^</kbd> potęga, wpisz <kbd>sqrt</kbd> dla pierwiastka. Przecinek dziesiętny: <kbd>,</kbd></p>
        </section>

        <div class={feedbackClass} aria-live="polite">
          {res?.status === 'correct' && <><strong>Dobrze.</strong>{res.note && <span> {res.note}</span>}</>}
          {res?.status === 'wrong' && (
            <>
              <strong>Niestety nie.</strong>{res.message && <span> {res.message}</span>}
              <span class="correct-answer">Poprawna odpowiedź: <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(task.answer.expected) }} /></span>
            </>
          )}
          {(res?.status === 'form' || res?.status === 'invalid') && <span>{res.message}</span>}
        </div>

        {showSol && (
          <section class="solution">
            <h3>Rozwiązanie</h3>
            <ol>{task.solution.map((l, i) => <li key={i}><MathText text={l} /></li>)}</ol>
          </section>
        )}

        <div class="actions">
          {!finished && <button class="btn btn-ghost" onClick={giveUp}>Nie wiem</button>}
          {finished && !showSol && <button class="btn btn-ghost" onClick={() => setShowSol(true)}>Pokaż rozwiązanie</button>}
          <button ref={nextBtn} class="btn btn-primary grow" onClick={check} disabled={!finished && !latex.trim()}>
            {finished ? 'Dalej' : 'Sprawdź'}
          </button>
        </div>
      </main>
    </div>
  );
}

/* ───────────── Test z działu ───────────── */
type Answer = { choice?: number; latex?: string };

export function TestView({ id }: { id: string }) {
  const d = DZIALY.find((x) => x.id === id);
  if (!d) return <NotFound />;
  return <TestInner key={id} d={d} />;
}

function TestInner({ d }: { d: Dzial }) {
  const [phase, setPhase] = useState<'intro' | 'run' | 'result'>('intro');
  const [qs, setQs] = useState<Question[]>([]);
  async function start() {
    await loadCE();
    setQs(buildTest(d, mulberry32(seed())));
    setAnswers([]); setI(0); setPhase('run');
    window.scrollTo(0, 0);
  }
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [i, setI] = useState(0);
  const api = useRef<MathInputApi | null>(null);

  const grade = (q: Question, a: Answer | undefined): CheckResult | null => {
    if (!a) return null;
    if (q.kind === 'choice') return a.choice === undefined ? null : { status: a.choice === q.correct ? 'correct' : 'wrong' };
    return a.latex ? checkAnswer(a.latex, q.task.answer) : null;
  };

  function finish() {
    const score = qs.filter((q, k) => grade(q, answers[k])?.status === 'correct').length;
    const pct = Math.round((score / qs.length) * 100);
    update((s) => {
      const prev = s.tests[d.id];
      s.tests[d.id] = { last: pct, best: Math.max(pct, prev?.best ?? 0), date: new Date().toISOString() };
    });
    setPhase('result');
    window.scrollTo(0, 0);
  }

  if (phase === 'intro') {
    return (
      <div class="page">
        <TopBar back={`#/d/${d.id}`} title="Test z działu" />
        <main class="container narrow">
          <h1 class="page-title">{d.title}</h1>
          <ul class="facts">
            <li><b>{TEST_SIZE}</b> zadań: 6 zamkniętych (A–D) i 4 otwarte</li>
            <li>Wynik zobaczysz dopiero na końcu, jak na maturze</li>
            <li>Dział zaliczasz od <b>70%</b></li>
          </ul>
          <button class="btn btn-primary" onClick={start}>Zaczynam<Icon name="arrow" /></button>
        </main>
      </div>
    );
  }

  if (phase === 'result') {
    const graded = qs.map((q, k) => grade(q, answers[k]));
    const score = graded.filter((g) => g?.status === 'correct').length;
    const pct = Math.round((score / qs.length) * 100);
    const weak = new Map<string, string>();
    qs.forEach((q, k) => {
      if (graded[k]?.status !== 'correct') {
        const sk = d.skills.find((x) => x.id === q.task.skillId);
        if (sk) weak.set(sk.id, sk.title);
      }
    });
    return (
      <div class="page">
        <TopBar back={`#/d/${d.id}`} title="Wynik testu" />
        <main class="container narrow">
          <div class={`score ${pct >= 70 ? 'is-pass' : 'is-fail'}`}>
            <span class="score-num">{pct}%</span>
            <span class="score-text">{score} z {qs.length} punktów · {pct >= 70 ? 'dział zaliczony' : 'jeszcze trochę ćwiczeń'}</span>
          </div>
          {weak.size > 0 && (
            <section class="weak">
              <h2 class="section-title">Do powtórki</h2>
              <ul>{[...weak].map(([id, t]) => <li key={id}><a href={`#/s/${id}`}>{t}<Icon name="arrow" /></a></li>)}</ul>
            </section>
          )}
          <h2 class="section-title">Przegląd zadań</h2>
          <ol class="review">
            {qs.map((q, k) => {
              const g = graded[k];
              const ok = g?.status === 'correct';
              const a = answers[k];
              return (
                <li key={k} class={ok ? 'is-ok' : 'is-bad'}>
                  <div class="review-head"><span class="badge">{ok ? <Icon name="check" /> : <Icon name="cross" />}</span>Zadanie {k + 1}</div>
                  <p><MathText text={q.task.text} /></p>
                  {q.task.display && <MathDisplay latex={q.task.display} />}
                  <p class="review-line">Twoja odpowiedź: {q.kind === 'choice'
                    ? (a?.choice !== undefined ? <><b>{'ABCD'[a.choice]}</b> <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(q.options[a.choice]) }} /></> : 'brak')
                    : (a?.latex ? <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(a.latex) }} /> : 'brak')}</p>
                  {!ok && g?.message && <p class="review-line muted">{g.message}</p>}
                  {!ok && <p class="review-line">Poprawnie: {q.kind === 'choice' && <b>{'ABCD'[q.correct]} </b>}<span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(q.task.answer.expected) }} /></p>}
                  {!ok && <details><summary>Rozwiązanie</summary><ol>{q.task.solution.map((l, j) => <li key={j}><MathText text={l} /></li>)}</ol></details>}
                </li>
              );
            })}
          </ol>
          <div class="actions">
            <a class="btn btn-ghost" href={`#/d/${d.id}`}>Wróć do działu</a>
            <button class="btn btn-primary grow" onClick={start}>Nowy test</button>
          </div>
        </main>
      </div>
    );
  }

  const q = qs[i];
  const a = answers[i] ?? {};
  const setA = (v: Answer) => setAnswers((prev) => { const n = prev.slice(); n[i] = v; return n; });
  const answeredCount = qs.filter((_, k) => answers[k]?.choice !== undefined || answers[k]?.latex).length;
  return (
    <div class="page lesson">
      <TopBar back={`#/d/${d.id}`} title={`Zadanie ${i + 1} z ${qs.length}`}>
        <span class="counter">{answeredCount}/{qs.length}</span>
      </TopBar>
      <div class="lesson-progress"><Progress value={(i + 1) / qs.length} /></div>
      <main class="container narrow">
        <nav class="qnav" aria-label="Zadania">
          {qs.map((_, k) => (
            <button key={k} class={`qnav-dot${k === i ? ' is-current' : ''}${answers[k]?.choice !== undefined || answers[k]?.latex ? ' is-answered' : ''}`} onClick={() => setI(k)}>{k + 1}</button>
          ))}
        </nav>
        <section class="task-card" key={i}>
          <p class="task-kind">{q.kind === 'choice' ? 'Zadanie zamknięte · wybierz jedną odpowiedź' : 'Zadanie otwarte · wpisz wynik'}</p>
          <p class="task-text"><MathText text={q.task.text} /></p>
          {q.task.display && <MathDisplay latex={q.task.display} />}
          {q.kind === 'choice' ? (
            <div class="options" role="radiogroup">
              {q.options.map((o, k) => (
                <button key={k} role="radio" aria-checked={a.choice === k} class={`option${a.choice === k ? ' is-selected' : ''}`} onClick={() => setA({ choice: k })}>
                  <span class="option-letter">{'ABCD'[k]}</span>
                  <span class="m" dangerouslySetInnerHTML={{ __html: latexToHtml(o) }} />
                </button>
              ))}
            </div>
          ) : (
            <>
              <Toolbar api={api} />
              <MathInputSeeded key={`in-${i}`} initial={a.latex ?? ''} apiRef={api} onInput={(l) => setA({ latex: l })}
                onEnter={() => (i < qs.length - 1 ? setI(i + 1) : undefined)} prefix={q.task.answer.prefix} suffix={q.task.answer.suffix} />
            </>
          )}
        </section>
        <div class="actions">
          <button class="btn btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Poprzednie</button>
          {i < qs.length - 1
            ? <button class="btn btn-primary grow" onClick={() => setI(i + 1)}>Następne</button>
            : <button class="btn btn-primary grow" onClick={finish}>Zakończ test{answeredCount < qs.length ? ` (${qs.length - answeredCount} bez odpowiedzi)` : ''}</button>}
        </div>
      </main>
    </div>
  );
}

function MathInputSeeded(props: { initial: string; apiRef: { current: MathInputApi | null }; onInput: (l: string) => void; onEnter: () => void; prefix?: string; suffix?: string }) {
  useEffect(() => {
    if (props.initial) setTimeout(() => { const mf = document.querySelector('math-field') as any; if (mf) mf.value = props.initial; }, 0);
  }, []);
  return <MathInput apiRef={props.apiRef} onInput={props.onInput} onEnter={props.onEnter} prefix={props.prefix} suffix={props.suffix} autoFocus />;
}

export function NotFound() {
  return (
    <div class="page"><TopBar back="#/" /><main class="container narrow"><h1 class="page-title">Nie ma takiej strony</h1><a class="btn btn-primary" href="#/">Na start</a></main></div>
  );
}
