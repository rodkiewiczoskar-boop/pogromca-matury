// Logika nauki bez UI: opanowanie etapów, przewidywany wynik, plan i seria.
import { DZIALY, STAGE_GOAL } from '../content/curriculum';
import { CLOSED_BLUEPRINT } from '../exam/builder';
import { OPEN_SKILLS } from '../exam/open';
import { addDays, daysBetween, skillProgress, State, today } from './store';

/* ───────── Model opanowania ───────── */

/** Skuteczność w etapie z ostatnich odpowiedzi; `prior` to wartość bez danych (0,25 = zgadywanie w ABCD) */
export function mastery(s: State, skillId: string, prior: number): { p: number; n: number } {
  const rec = (s.recent?.[skillId] ?? []).slice(-10);
  const n = rec.length, ok = rec.reduce((a, b) => a + b, 0);
  return { p: (ok + prior) / (n + 1), n };
}

export interface Prediction { points: number; max: number; pct: number; closed: number; open: number; practiced: number; total: number }

/** Przewidywany wynik: zadania zamknięte jak w arkuszu (25 × 1 pkt) + otwarte (25 pkt) wg skuteczności w etapach */
export function predict(s: State): Prediction {
  let closed = 0;
  for (const slot of CLOSED_BLUEPRINT) closed += slot.reduce((a, id) => a + mastery(s, id, 0.25).p, 0) / slot.length;
  let open = 0;
  for (const o of OPEN_SKILLS) open += o.points * (o.skills.reduce((a, id) => a + mastery(s, id, 0).p, 0) / o.skills.length);
  const all = DZIALY.flatMap((d) => d.skills);
  const practiced = all.filter((k) => (s.recent?.[k.id]?.length ?? 0) >= 5).length;
  const points = Math.round(closed + open);
  return { points, max: 50, pct: Math.round((points / 50) * 100), closed: Math.round(closed), open: Math.round(open), practiced, total: all.length };
}

/* ───────── Seria i plan ───────── */

export const DEFAULT_EXAM_DATE = '2027-05-05'; // CKE: matematyka PP, 5 maja 2027, 9:00
export const examDate = (s: State) => s.plan?.examDate ?? DEFAULT_EXAM_DATE;

/** Ile zadań zostało do zaliczenia wszystkich etapów i testów (szacunek: 70% trafień) */
function remainingWork(s: State): number {
  let n = 0;
  for (const d of DZIALY) {
    for (const k of d.skills) { const p = skillProgress(s, k.id); if (!p.done) n += Math.ceil((STAGE_GOAL - p.correct) / 0.7); }
    if (!(s.tests[d.id]?.best >= 70)) n += 10;
  }
  return n;
}

export function planInfo(s: State) {
  const t = today();
  const exam = examDate(s);
  const daysLeft = Math.max(0, daysBetween(t, exam));
  // działy do przerobienia na 60 dni przed maturą, potem próbne matury i powtórki
  const cutoff = addDays(exam, -60);
  const learnDays = Math.max(1, daysBetween(t, cutoff));
  const work = remainingWork(s);
  const reviewsPerDay = Math.ceil(Object.keys(s.reviews ?? {}).length / 7);
  const recommended = Math.min(40, Math.max(10, Math.ceil(work / learnDays) + reviewsPerDay));
  const goal = s.plan?.daily ?? recommended;
  const doneToday = s.days?.[t]?.n ?? 0;
  // seria: kolejne dni z wykonaną porcją, licząc od dziś (albo od wczoraj, jeśli dziś jeszcze trwa)
  let streak = 0;
  let d = doneToday >= goal ? t : addDays(t, -1);
  while ((s.days?.[d]?.n ?? 0) >= goal) { streak++; d = addDays(d, -1); }
  return { exam, daysLeft, cutoff, learnDays, work, recommended, goal, doneToday, streak, phase: t < cutoff ? 'learn' as const : 'exam' as const };
}

