// Arkusz próbnej matury: układ jak w arkuszach CKE (formuła 2015, poziom podstawowy).
import { DZIALY } from '../content/curriculum';
import { makeChoice, ChoiceQuestion } from '../content/testBuilder';
import type { Skill } from '../content/types';
import { mulberry32, pick } from '../math/rng';
import { OPEN_BLUEPRINT, OpenTask } from './open';

export const EXAM_MINUTES = 170;
export const PASS_PCT = 30;

/** 25 zadań zamkniętych po 1 pkt, w kolejności tematów jak w arkuszu */
export const CLOSED_BLUEPRINT: string[][] = [
  ['potegi-calk', 'potegi-wym'], ['pierw-dzialania', 'pierw-wylacz'], ['logarytmy'], ['procenty'], ['wartosc-wyr', 'wzory-skr'],
  ['nier-liniowa'], ['uklad'], ['rown-wymierne'], ['f-liniowa'], ['f-kwadratowa'], ['f-kwadratowa', 'proste'],
  ['ciag-arytm'], ['ciag-geom'], ['ciag-wzor'], ['tryg-sin-cos'], ['tryg-wartosci'], ['katy-okrag'], ['trojkaty'],
  ['odcinki'], ['proste', 'odcinki'], ['graniastoslupy'], ['bryly-obrotowe'], ['statystyka'], ['kombinatoryka'], ['prawdopodobienstwo'],
];

export type ExamItem =
  | { kind: 'closed'; num: number; points: 1; q: ChoiceQuestion }
  | { kind: 'open'; num: number; points: number; task: OpenTask };

const skillById = new Map<string, Skill>(DZIALY.flatMap((d) => d.skills.map((s) => [s.id, s] as [string, Skill])));

export function buildExam(seed: number): ExamItem[] {
  const r = mulberry32(seed);
  const items: ExamItem[] = [];
  const seen = new Set<string>();
  CLOSED_BLUEPRINT.forEach((ids, i) => {
    let task;
    for (let tries = 0; tries < 20; tries++) {
      const sk = skillById.get(pick(r, ids))!;
      task = { ...sk.generate(r), skillId: sk.id };
      const key = task.text + (task.display ?? '');
      if (!seen.has(key)) { seen.add(key); break; }
    }
    items.push({ kind: 'closed', num: i + 1, points: 1, q: makeChoice(task!, r) });
  });
  OPEN_BLUEPRINT.forEach((gen, i) => {
    const task = gen(r);
    items.push({ kind: 'open', num: CLOSED_BLUEPRINT.length + i + 1, points: task.points as number, task });
  });
  return items;
}

export const maxPoints = (items: ExamItem[]) => items.reduce((s, it) => s + it.points, 0);
