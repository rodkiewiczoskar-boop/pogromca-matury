import type { InputAnswer } from '../math/check';
import type { Rng } from '../math/rng';

export interface Task {
  /** Polecenie; fragmenty $...$ to wzory */
  text: string;
  /** Duży wzór pod poleceniem */
  display?: string;
  answer: InputAnswer;
  /** Kolejne kroki rozwiązania ($...$ to wzory) */
  solution: string[];
  /** Niezależne wyrażenie o tej samej wartości co odpowiedź (weryfikowane w testach przez Compute Engine) */
  verify: { expr: string; vars?: string[] };
  /** Typowe błędne odpowiedzi (do zadań zamkniętych A–D) */
  distractors: string[];
  /** Uzupełniane w teście z działu */
  skillId?: string;
}

export interface Skill {
  id: string;
  title: string;
  /** Krótka ściąga: 1–3 linijki */
  tip: string[];
  generate(r: Rng): Task;
}

export interface Dzial {
  id: string;
  num: number;
  title: string;
  skills: Skill[];
}
