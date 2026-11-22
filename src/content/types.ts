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
  /** Dodatkowa weryfikacja w testach: wartość liczona brutalną siłą (np. zliczaniem) */
  verifyFn?: () => number;
  /** Oczekiwany wynik verifyFn (domyślnie: wartość odpowiedzi) */
  verifyFnExpect?: number;
  /** Lista: każde rozwiązanie zeruje verify.expr */
  verifyRoots?: boolean;
  /** Przedział: zbiór rozwiązań nierówności verify.expr (rel) 0 */
  verifyIneq?: '<' | '<=' | '>' | '>=';
  /** Punkt: oczekiwane współrzędne */
  verifyPoint?: number[];
  /** Uzupełniane w teście z działu */
  skillId?: string;
}

export interface Skill {
  id: string;
  title: string;
  /** Krótka ściąga: 1–3 linijki */
  tip: string[];
  /** Nie nadaje się na zadanie zamknięte A–D */
  noChoice?: boolean;
  generate(r: Rng): Task;
}

export interface Dzial {
  id: string;
  num: number;
  title: string;
  skills: Skill[];
}
