// Powtórki błędów, statystyki z przewidywanym wynikiem i plan nauki do matury.
import { useMemo, useState } from 'preact/hooks';
import { DZIALY, STAGE_GOAL } from '../content/curriculum';
import { genTask } from '../content/testBuilder';
import type { Skill } from '../content/types';
import { loadCE } from '../math/evaluate';
import { CalcButton } from './calculator';
import { Icon, Progress, TopBar } from './components';
import { FormulaButton } from './formulas';
import { addDays, answerReview, daysBetween, dueReviews, findSkill, getState, ReviewItem, skillProgress, State, today, update, useStore } from './store';
import { TaskCard } from './views';
import { examDate, mastery, planInfo, predict } from './plan';

function nextStages(s: State, n: number): Skill[] {
  const out: Skill[] = [];
  for (const d of DZIALY) for (const k of d.skills) if (!skillProgress(s, k.id).done && out.length < n) out.push(k);
  return out;
}

const fmtDate = (day: string) => { const [y, m, d] = day.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }); };
const dni = (n: number) => (n === 1 ? 'dzień' : 'dni');

/* ───────── Karta „Dziś” na stronie głównej ───────── */

export function TodayCard() {
  const s = useStore();
  const pi = planInfo(s);
  const due = dueReviews(s).length;
  return (
    <a class="today-card" href="#/plan">
      <span class="today-main">
        <span class="today-title">Plan na dziś</span>
        <span class="today-meta">{Math.min(pi.doneToday, pi.goal)} z {pi.goal} zadań{due ? ` · ${due} do powtórki` : ''} · do matury {pi.daysLeft} {dni(pi.daysLeft)}</span>
        <Progress value={pi.doneToday / pi.goal} />
      </span>
      <span class="today-streak" aria-label={`Seria: ${pi.streak} dni`}><b>{pi.streak}</b><small>seria</small></span>
    </a>
  );
}

/* ───────── Plan ───────── */

export function PlanView() {
  const s = useStore();
  const pi = planInfo(s);
  const due = dueReviews(s).length;
  const stages = nextStages(s, 2);
  const lastExam = s.exams?.[s.exams.length - 1];
  const sinceExam = lastExam ? daysBetween(lastExam.date.slice(0, 10), today()) : Infinity;
  const allDone = stages.length === 0;
  const testReady = DZIALY.find((d) => d.skills.every((k) => skillProgress(s, k.id).done) && !(s.tests[d.id]?.best >= 70));
  const suggestExam = (pi.phase === 'exam' || allDone || DZIALY.filter((d) => s.tests[d.id]?.best >= 70).length >= 5) && sinceExam >= (pi.phase === 'exam' ? 7 : 14);

  // terminy działów: rozkładamy pozostałą pracę równo do dnia „cutoff”
  const schedule = useMemo(() => {
    const perDay = Math.max(1, pi.work / pi.learnDays);
    let acc = 0;
    return DZIALY.map((d) => {
      let w = 0;
      for (const k of d.skills) { const p = skillProgress(s, k.id); if (!p.done) w += Math.ceil((STAGE_GOAL - p.correct) / 0.7); }
      if (!(s.tests[d.id]?.best >= 70)) w += 10;
      acc += w;
      return { d, done: w === 0, by: w === 0 ? null : addDays(today(), Math.ceil(acc / perDay)) };
    });
  }, [s]);

  const setPlan = (p: Partial<NonNullable<State['plan']>>) => update((x) => { x.plan = { examDate: examDate(x), daily: x.plan?.daily ?? pi.recommended, ...p }; });

  return (
    <div class="page">
      <TopBar back="#/" title="Plan do matury" />
      <main class="container narrow">
        <div class="plan-head">
          <div><span class="big-num">{pi.daysLeft}</span><span class="big-label">{dni(pi.daysLeft)} do matury ({fmtDate(pi.exam)})</span></div>
          <div><span class="big-num">{pi.streak}</span><span class="big-label">{pi.streak === 1 ? 'dzień' : 'dni'} serii</span></div>
        </div>
        <p class="lead">Dzisiaj: <b>{pi.doneToday}</b> z <b>{pi.goal}</b> zadań. {pi.doneToday >= pi.goal ? 'Porcja na dziś zrobiona.' : `Zostało ${pi.goal - pi.doneToday}.`}</p>
        <Progress value={pi.doneToday / pi.goal} />

        <h2 class="section-title">Na dziś</h2>
        <ol class="todo">
          {due > 0 && <li><a class="todo-row" href="#/powtorki"><span class="todo-title">Powtórki: {due} {due === 1 ? 'zadanie' : 'zadań'}</span><span class="todo-meta">zadania, w których wcześniej był błąd</span><Icon name="arrow" /></a></li>}
          {testReady && <li><a class="todo-row" href={`#/t/${testReady.id}`}><span class="todo-title">Test: {testReady.title}</span><span class="todo-meta">wszystkie etapy zaliczone, sprawdź się</span><Icon name="arrow" /></a></li>}
          {stages.map((k) => {
            const f = findSkill(k.id)!;
            const p = skillProgress(s, k.id);
            return <li key={k.id}><a class="todo-row" href={`#/s/${k.id}`}><span class="todo-title">{k.title}</span><span class="todo-meta">dział {f.dzial.num} · {Math.min(p.correct, STAGE_GOAL)} z {STAGE_GOAL} dobrych</span><Icon name="arrow" /></a></li>;
          })}
          {suggestExam && <li><a class="todo-row" href="#/matura"><span class="todo-title">Próbna matura</span><span class="todo-meta">{lastExam ? `ostatnia ${sinceExam} ${dni(sinceExam)} temu (${lastExam.pct}%)` : 'jeszcze żadnej'}; najlepiej w weekend, 170 minut</span><Icon name="arrow" /></a></li>}
          {allDone && !due && !suggestExam && <li class="todo-row is-static"><span class="todo-title">Wszystkie etapy zaliczone</span><span class="todo-meta">Ćwicz najsłabsze etapy z <a href="#/postep">postępów</a> albo rozwiąż arkusz CKE.</span></li>}
        </ol>

        <h2 class="section-title">Harmonogram</h2>
        <p class="muted">Działy przerabiasz do {fmtDate(pi.cutoff)}. Ostatnie dwa miesiące to próbne matury co tydzień i powtórki. Przy {pi.goal} zadaniach dziennie:</p>
        <ol class="sched">
          {schedule.map(({ d, done, by }) => (
            <li key={d.id} class={done ? 'is-done' : by && by > pi.cutoff ? 'is-late' : ''}>
              <span class="sched-num">{d.num}</span><span class="sched-title">{d.title}</span>
              <span class="sched-date">{done ? 'gotowe' : `do ${fmtDate(by!)}`}</span>
            </li>
          ))}
        </ol>
        {schedule.some((x) => x.by && x.by > pi.cutoff) && <p class="warn-line">Przy tej porcji nie zdążysz przed {fmtDate(pi.cutoff)}. Zalecana porcja to {pi.recommended} zadań dziennie.</p>}

        <h2 class="section-title">Ustawienia</h2>
        <div class="settings">
          <label>Data matury <input type="date" value={pi.exam} onChange={(e) => { const v = (e.target as HTMLInputElement).value; if (v) setPlan({ examDate: v }); }} /></label>
          <label>Zadań dziennie
            <select value={String(pi.goal)} onChange={(e) => setPlan({ daily: Number((e.target as HTMLSelectElement).value) })}>
              {[...new Set([5, 10, 15, 20, 25, 30, 40, pi.recommended, pi.goal])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n}{n === pi.recommended ? ' (zalecane)' : ''}</option>)}
            </select>
          </label>
        </div>
        <p class="muted">Dzień liczy się do serii, gdy rozwiążesz całą porcję. Liczą się zadania z etapów, powtórek, testów i próbnej matury.</p>
      </main>
    </div>
  );
}

/* ───────── Powtórki ───────── */

export function ReviewView() {
  const s = useStore();
  // kolejka ustalana przy wejściu, żeby nie przeskakiwała w trakcie
  const [queue] = useState<[string, ReviewItem][]>(() => dueReviews(getState()));
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [ready, setReady] = useState(false);
  useMemo(() => { loadCE().then(() => setReady(true)); }, []);
  const upcoming = Object.values(s.reviews ?? {}).filter((r) => r.due > today()).sort((a, b) => a.due.localeCompare(b.due));

  if (!queue.length || i >= queue.length) {
    return (
      <div class="page">
        <TopBar back="#/" title="Powtórki" />
        <main class="container narrow">
          {queue.length ? <><h1 class="page-title">Powtórki zrobione</h1><p class="lead">Dobrze: {ok} z {queue.length}. Zadania z błędem wrócą jutro, a te dobre za kilka dni z nowymi liczbami.</p></>
            : <><h1 class="page-title">Na dziś nie ma powtórek</h1><p class="lead">Zadanie z błędem (albo rozwiązane z podpowiedzią) wraca następnego dnia. Po dobrej odpowiedzi wraca po 3, 7, 14 i 30 dniach, za każdym razem z innymi liczbami. Po piątej dobrej odpowiedzi uznaję je za opanowane.</p></>}
          {upcoming.length > 0 && (
            <>
              <h2 class="section-title">Kolejne powtórki</h2>
              <ul class="plain-list">
                {Object.entries(upcoming.reduce<Record<string, number>>((m, r) => { m[r.due] = (m[r.due] ?? 0) + 1; return m; }, {})).slice(0, 7).map(([d, n]) => (
                  <li key={d}><span>{fmtDate(d)}</span><b>{n}</b></li>
                ))}
              </ul>
            </>
          )}
          <a class="btn btn-primary" href="#/plan">Wróć do planu<Icon name="arrow" /></a>
        </main>
      </div>
    );
  }

  const [key, item] = queue[i];
  const f = findSkill(item.skillId);
  if (!f) { setI(i + 1); return null; }
  const task = genTask(f.skill, item.seed);
  return (
    <div class="page lesson">
      <TopBar back="#/" title={`Powtórka ${i + 1} z ${queue.length}`}>
        <FormulaButton dzial={f.dzial.id} />
        <CalcButton />
      </TopBar>
      <div class="lesson-progress"><Progress value={i / queue.length} /></div>
      <main class="container narrow">
        <p class="task-kind">{f.skill.title} · dział {f.dzial.num}{item.box > 0 ? ` · powtórka ${item.box + 1} z ${5}` : ''}</p>
        {ready && <TaskCard key={key} task={task} tip={f.skill.tip} nextLabel={i + 1 < queue.length ? 'Następna' : 'Zakończ'}
          onResult={(o) => { answerReview(key, o.ok, o.hinted); if (o.ok && !o.hinted) setOk(ok + 1); }} onNext={() => setI(i + 1)} />}
      </main>
    </div>
  );
}

/* ───────── Statystyki ───────── */

export function StatsView() {
  const s = useStore();
  const pr = predict(s);
  const pi = planInfo(s);
  const lastExam = s.exams?.[s.exams.length - 1];
  const skills = DZIALY.flatMap((d) => d.skills.map((k) => ({ k, d, m: mastery(s, k.id, 0) })));
  const weak = skills.filter((x) => x.m.n >= 3).sort((a, b) => a.m.p - b.m.p).slice(0, 4).filter((x) => x.m.p < 0.75);
  const days = Array.from({ length: 14 }, (_, k) => addDays(today(), k - 13));
  const maxDay = Math.max(pi.goal, ...days.map((d) => s.days?.[d]?.n ?? 0));
  const total = Object.values(s.days ?? {}).reduce((a, d) => a + d.n, 0);
  const totalOk = Object.values(s.days ?? {}).reduce((a, d) => a + d.ok, 0);
  return (
    <div class="page">
      <TopBar back="#/" title="Postępy" />
      <main class="container narrow">
        <div class={`score ${pr.pct >= 30 ? 'is-pass' : 'is-fail'}`}>
          <span class="score-num">{pr.pct}%</span>
          <span class="score-text">przewidywany wynik matury · około {pr.points} z 50 pkt (zamknięte {pr.closed}/25, otwarte {pr.open}/25)</span>
        </div>
        <p class="muted">Liczę z 10 ostatnich odpowiedzi w każdym etapie. Etapy, których jeszcze nie ćwiczyłeś, liczę jak zgadywanie: 25% w zadaniach zamkniętych i 0 pkt w otwartych. {pr.practiced < pr.total ? `Przećwiczone (min. 5 odpowiedzi): ${pr.practiced} z ${pr.total} etapów, więc wynik jeszcze mało pewny.` : 'Wszystkie etapy przećwiczone.'}{lastExam ? ` Ostatnia próbna matura: ${lastExam.pct}%.` : ''} Próg zdania: 30%.</p>

        <h2 class="section-title">Działy</h2>
        <ol class="stats-dzialy">
          {DZIALY.map((d) => {
            const ms = d.skills.map((k) => mastery(s, k.id, 0));
            const p = ms.reduce((a, m) => a + m.p, 0) / ms.length;
            const n = ms.reduce((a, m) => a + m.n, 0);
            return (
              <li key={d.id}>
                <a href={`#/d/${d.id}`}>
                  <span class="dzial-num">{d.num}</span>
                  <span class="dzial-body"><span class="dzial-title">{d.title}</span><span class="dzial-meta">{n ? `opanowanie ${Math.round(p * 100)}%` : 'jeszcze nie ćwiczony'}{s.tests[d.id] ? ` · test ${s.tests[d.id].best}%` : ''}</span><Progress value={p} /></span>
                </a>
              </li>
            );
          })}
        </ol>

        {weak.length > 0 && (
          <>
            <h2 class="section-title">Do poprawy</h2>
            <ol class="todo">
              {weak.map(({ k, d, m }) => <li key={k.id}><a class="todo-row" href={`#/s/${k.id}`}><span class="todo-title">{k.title}</span><span class="todo-meta">dział {d.num} · {Math.round(m.p * 100)}% w ostatnich odpowiedziach</span><Icon name="arrow" /></a></li>)}
            </ol>
          </>
        )}

        <h2 class="section-title">Ostatnie 14 dni</h2>
        <div class="bars" role="img" aria-label="Liczba zadań w ostatnich 14 dniach">
          {days.map((d) => {
            const n = s.days?.[d]?.n ?? 0;
            return <span key={d} class={`bar${n >= pi.goal ? ' is-goal' : ''}`} title={`${fmtDate(d)}: ${n}`}><i style={{ height: `${(n / maxDay) * 100}%` }} /><small>{Number(d.slice(8))}</small></span>;
          })}
        </div>
        <p class="muted">Razem {total} zadań, dobrze {totalOk}{total ? ` (${Math.round((totalOk / total) * 100)}%)` : ''}. Seria: {pi.streak} {dni(pi.streak)}.</p>

        {s.exams?.length ? (
          <>
            <h2 class="section-title">Próbne matury</h2>
            <ul class="plain-list">{s.exams.slice(-8).reverse().map((e) => <li key={e.date}><span>{new Date(e.date).toLocaleDateString('pl-PL')}</span><b>{e.pct}% · {e.points}/{e.max}</b></li>)}</ul>
          </>
        ) : null}
      </main>
    </div>
  );
}
