import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDays, answerReview, daysBetween, dueReviews, getState, recordAnswer, recordResults, update } from '../src/ui/store';
import { planInfo, predict } from '../src/ui/plan';
import { DZIALY } from '../src/content/curriculum';

const reset = () => update((s) => { s.skills = {}; s.reviews = {}; s.recent = {}; s.days = {}; s.plan = undefined; s.exams = []; });
afterEach(() => { vi.useRealTimers(); reset(); });
const at = (d: string) => { vi.useFakeTimers(); vi.setSystemTime(new Date(`${d}T12:00:00`)); };

describe('daty', () => {
  it('dodawanie dni przez koniec miesiąca i zmianę czasu', () => {
    expect(addDays('2027-03-27', 2)).toBe('2027-03-29');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(daysBetween('2026-11-23', '2027-05-05')).toBe(163);
  });
});

describe('powtórki', () => {
  it('błąd wraca jutro, dobre odpowiedzi wydłużają przerwę do opanowania', () => {
    reset(); at('2026-11-23');
    recordAnswer('ulamki-dod', false, { seed: 42 });
    expect(dueReviews(getState()).length).toBe(0);
    at('2026-11-24');
    let due = dueReviews(getState());
    expect(due.map(([k]) => k)).toEqual(['ulamki-dod:42']);
    // błąd w powtórce: znowu jutro
    answerReview(due[0][0], false);
    expect(Object.values(getState().reviews!)[0].due).toBe('2026-11-25');
    let day = '2026-11-25';
    const gaps: number[] = [];
    for (let i = 0; i < 5; i++) {
      at(day);
      due = dueReviews(getState());
      expect(due.length).toBe(1);
      answerReview(due[0][0], true);
      const left = Object.values(getState().reviews ?? {});
      if (i < 4) { gaps.push(daysBetween(day, left[0].due)); day = left[0].due; expect(left[0].seed).not.toBe(42); }
      else expect(left.length).toBe(0);
    }
    expect(gaps).toEqual([3, 7, 14, 30]);
  });
  it('dobra odpowiedź z podpowiedzią też trafia do powtórek i nie zalicza etapu', () => {
    reset(); at('2026-11-23');
    recordAnswer('logarytmy', true, { seed: 7, hinted: true });
    expect(getState().skills.logarytmy.correct).toBe(0);
    expect(Object.keys(getState().reviews!)).toEqual(['logarytmy:7']);
    expect(getState().recent!.logarytmy).toEqual([0]);
  });
});

describe('plan i seria', () => {
  it('seria liczy dni z wykonaną porcją, dzisiejszy dzień nie przerywa serii', () => {
    reset(); at('2026-11-23');
    update((s) => { s.plan = { examDate: '2027-05-05', daily: 3 }; s.days = { '2026-11-20': { n: 3, ok: 3 }, '2026-11-21': { n: 5, ok: 1 }, '2026-11-22': { n: 3, ok: 2 }, '2026-11-23': { n: 1, ok: 1 } }; });
    expect(planInfo(getState()).streak).toBe(3);
    recordResults([{ skillId: 'procenty', ok: true }, { skillId: 'procenty', ok: false }]);
    expect(planInfo(getState()).streak).toBe(4);
    expect(planInfo(getState()).daysLeft).toBe(163);
  });
  it('przewidywany wynik: bez ćwiczeń jak zgadywanie, przy samych dobrych blisko 100%', () => {
    reset();
    const p0 = predict(getState());
    expect(p0.closed).toBe(6); // 25 × 0,25
    expect(p0.open).toBe(0);
    update((s) => { s.recent = {}; for (const id of DZIALY.flatMap((d) => d.skills.map((k) => k.id))) s.recent[id] = Array(10).fill(1); });
    const p1 = predict(getState());
    expect(p1.pct).toBeGreaterThanOrEqual(90);
  });
});
