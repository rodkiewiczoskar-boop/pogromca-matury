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
  exams?: { date: string; points: number; max: number; pct: number; sheet?: string }[];
  /** Zadania do powtórki: klucz `${skillId}:${seed}` */
  reviews?: Record<string, ReviewItem>;
  /** Ostatnie wyniki w każdym etapie (1 = dobrze bez podpowiedzi, 0 = źle albo z podpowiedzią), najnowsze na końcu */
  recent?: Record<string, number[]>;
  /** Liczba rozwiązanych zadań każdego dnia (data lokalna RRRR-MM-DD) */
  days?: Record<string, { n: number; ok: number }>;
  /** Plan nauki */
  plan?: { examDate: string; daily: number };
}
export interface ReviewItem { skillId: string; seed: number; box: number; due: string; added: string }

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
/* ── daty lokalne ── */
const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => dayKey(new Date());
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}
export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/** Odstępy powtórek (w dniach) po kolejnych dobrych odpowiedziach; po ostatnim zadanie uznajemy za opanowane */
export const REVIEW_STEPS = [1, 3, 7, 14, 30];
const RECENT_MAX = 20;

/** Zapis wyniku w statystykach i kalendarzu; zła odpowiedź (lub z podpowiedzią) trafia do powtórek */
function logResult(s: State, skillId: string, ok: boolean, seed?: number) {
  const rec = (s.recent ??= {})[skillId] ?? [];
  rec.push(ok ? 1 : 0);
  s.recent[skillId] = rec.slice(-RECENT_MAX);
  const d = ((s.days ??= {})[today()] ??= { n: 0, ok: 0 });
  d.n += 1; if (ok) d.ok += 1;
  if (!ok && seed !== undefined) {
    const key = `${skillId}:${seed}`;
    (s.reviews ??= {})[key] = { skillId, seed, box: 0, due: addDays(today(), REVIEW_STEPS[0]), added: today() };
  }
}

/** Odpowiedź w etapie. Z podpowiedzią: nie liczy się do zaliczenia etapu i wraca w powtórkach. */
export function recordAnswer(id: string, ok: boolean, opts: { seed?: number; hinted?: boolean } = {}) {
  update((s) => {
    const p = skillProgress(s, id);
    p.attempts += 1;
    if (ok && !opts.hinted) p.correct += 1;
    if (p.correct >= STAGE_GOAL) p.done = true;
    s.skills[id] = p;
    logResult(s, id, ok && !opts.hinted, opts.seed);
  });
}

/** Wyniki zadań z testu albo próbnej matury (bez wpływu na zaliczenie etapów) */
export function recordResults(list: { skillId: string; ok: boolean; seed?: number }[]) {
  update((s) => { for (const r of list) logResult(s, r.skillId, r.ok, r.seed); });
}

export function dueReviews(s: State, day = today()): [string, ReviewItem][] {
  return Object.entries(s.reviews ?? {}).filter(([, r]) => r.due <= day).sort((a, b) => a[1].due.localeCompare(b[1].due));
}

/** Wynik powtórki: dobrze → dłuższa przerwa i nowe liczby; źle → od początku (jutro) */
export function answerReview(key: string, ok: boolean, hinted = false) {
  update((s) => {
    const r = s.reviews?.[key];
    if (!r) return;
    logResult(s, r.skillId, ok && !hinted);
    delete s.reviews![key];
    if (ok && !hinted) {
      const box = r.box + 1;
      if (box >= REVIEW_STEPS.length) return; // opanowane
      const seed = (Math.random() * 2 ** 31) | 0;
      s.reviews![`${r.skillId}:${seed}`] = { ...r, seed, box, due: addDays(today(), REVIEW_STEPS[box]) };
    } else {
      s.reviews![key] = { ...r, box: 0, due: addDays(today(), REVIEW_STEPS[0]) };
    }
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
