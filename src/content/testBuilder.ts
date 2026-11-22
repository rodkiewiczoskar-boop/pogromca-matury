import { checkAnswer, InputAnswer } from '../math/check';
import { evaluate, parseLatex } from '../math/evaluate';
import { Rng, shuffle } from '../math/rng';
import type { Dzial, Task } from './types';

export interface ChoiceQuestion { kind: 'choice'; task: Task; options: string[]; correct: number }
export interface OpenQuestion { kind: 'open'; task: Task }
export type Question = ChoiceQuestion | OpenQuestion;

/** Czy dwie odpowiedzi są matematycznie tym samym (dla dowolnej postaci odpowiedzi) */
export function sameAnswer(a: string, b: string, ans: InputAnswer): boolean {
  try {
    const st = checkAnswer(a, { ...ans, expected: b }).status;
    return st === 'correct' || st === 'form' || st === 'invalid'; // nieczytelny = traktuj jako duplikat
  } catch { return true; }
}

export function makeChoice(task: Task, r: Rng): ChoiceQuestion {
  const vars = task.answer.vars;
  const safeEq = (a: string, b: string, _v?: string[]) => sameAnswer(a, b, task.answer);
  const correct = task.answer.expected;
  const picked: string[] = [];
  const pool = [...task.distractors];
  // zapasowe zaburzenia
  let fallback: string[];
  let v: number | null = null;
  try { v = vars?.length ? null : evaluate(parseLatex(correct)); } catch { v = null; }
  if (v !== null && Number.isInteger(v)) fallback = [v + 1, v - 1, -v, v + 2, 2 * v, v - 2].map(String);
  else fallback = vars?.length
    ? [`${correct} + 1`, `${correct} - 2x`, `-\\left(${correct}\\right)`, `2\\left(${correct}\\right)`]
    : [`-\\left(${correct}\\right)`, `2\\cdot\\left(${correct}\\right)`, `${correct} + 1`, `${correct} - 1`];
  for (const d of [...pool, ...fallback]) {
    if (picked.length === 3) break;
    if (safeEq(d, correct, vars)) continue;
    if (picked.some((x) => safeEq(x, d, vars))) continue;
    picked.push(d);
  }
  const options = shuffle(r, [correct, ...picked]);
  return { kind: 'choice', task, options, correct: options.indexOf(correct) };
}

export const TEST_SIZE = 10;

export function buildTest(d: Dzial, r: Rng): Question[] {
  const skills = shuffle(r, d.skills);
  const qs: Question[] = [];
  for (let i = 0; i < TEST_SIZE; i++) {
    const choice = i < 6;
    const pool = choice ? skills.filter((k) => !k.noChoice) : skills;
    const sk = pool[i % pool.length];
    const task = { ...sk.generate(r), skillId: sk.id };
    qs.push(choice ? makeChoice(task, r) : { kind: 'open', task });
  }
  return qs;
}
