// Postęp ucznia w localStorage (bezpiecznie, gdy niedostępny).
import { useEffect, useState } from 'preact/hooks';
import { DZIALY, STAGE_GOAL } from '../content/curriculum';
import type { Dzial } from '../content/types';

export interface SkillProgress { correct: number; attempts: number; done: boolean }
export interface TestResult { best: number; last: number; date: string }
export interface State {
  skills: Record<string, SkillProgress>;
  tests: Record<string, TestResult>;
  tipsSeen: Record<string, boolean>;
  freeMode: boolean;
}

const KEY = 'pogromca-matury:v1';
const empty = (): State => ({ skills: {}, tests: {}, tipsSeen: {}, freeMode: false });

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch { /* brak dostępu */ }
  return empty();
}

let state = load();
const listeners = new Set<() => void>();

export function getState() { return state; }
export function update(fn: (s: State) => void) {
  const next: State = JSON.parse(JSON.stringify(state));
  fn(next);
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignoruj */ }
  listeners.forEach((l) => l());
}
export function useStore(): State {
  const [, set] = useState(0);
  useEffect(() => { const l = () => set((x) => x + 1); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return state;
}

export function skillProgress(s: State, id: string): SkillProgress {
  return s.skills[id] ?? { correct: 0, attempts: 0, done: false };
}
export function recordAnswer(id: string, ok: boolean) {
  update((s) => {
    const p = skillProgress(s, id);
    p.attempts += 1;
    if (ok) p.correct += 1;
    if (p.correct >= STAGE_GOAL) p.done = true;
    s.skills[id] = p;
  });
}
export function isUnlocked(s: State, d: Dzial, index: number): boolean {
  if (s.freeMode || index === 0) return true;
  return skillProgress(s, d.skills[index - 1].id).done;
}
export function testUnlocked(s: State, d: Dzial): boolean {
  return s.freeMode || d.skills.every((k) => skillProgress(s, k.id).done);
}
export function dzialProgress(s: State, d: Dzial): number {
  const done = d.skills.filter((k) => skillProgress(s, k.id).done).length + (s.tests[d.id]?.best >= 70 ? 1 : 0);
  return done / (d.skills.length + 1);
}
export function findSkill(id: string) {
  for (const d of DZIALY) {
    const i = d.skills.findIndex((k) => k.id === id);
    if (i >= 0) return { dzial: d, skill: d.skills[i], index: i };
  }
  return null;
}
