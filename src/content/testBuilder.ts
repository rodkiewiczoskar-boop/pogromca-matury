import { equivalent } from '../math/check';
import { parseLatex } from '../math/evaluate';
import { Rng, shuffle } from '../math/rng';
import type { Dzial, Task } from './types';

export interface ChoiceQuestion { kind: 'choice'; task: Task; options: string[]; correct: number }
export interface OpenQuestion { kind: 'open'; task: Task }
export type Question = ChoiceQuestion | OpenQuestion;

function safeEq(a: string, b: string, vars?: string[]): boolean {
  try { return equivalent(parseLatex(a), parseLatex(b), vars); } catch { return true; /* nieczytelny = traktuj jako duplikat */ }
}

export function makeChoice(task: Task, r: Rng): ChoiceQuestion {
  const vars = task.answer.vars;
  const correct = task.answer.expected;
  const picked: string[] = [];
  const pool = [...task.distractors];
  // zapasowe zaburzenia
  const fallback = vars?.length
    ? [`${correct} + 1`, `${correct} - 2x`, `-\\left(${correct}\\right)`, `2\\left(${correct}\\right)`]
    : [`-\\left(${correct}\\right)`, `${correct} + 1`, `2\\cdot\\left(${correct}\\right)`, `${correct} - 1`];
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
    const sk = skills[i % skills.length];
    const task = { ...sk.generate(r), skillId: sk.id };
    qs.push(i < 6 ? makeChoice(task, r) : { kind: 'open', task });
  }
  return qs;
}
