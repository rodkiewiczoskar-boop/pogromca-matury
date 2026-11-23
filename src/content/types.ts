import type { InputAnswer } from '../math/check';
import type { Rng } from '../math/rng';
import type { Figure } from './figures';

export interface Task {
  /** Polecenie; fragmenty $...$ to wzory */
  text: string;
  /** Duży wzór pod poleceniem */
  display?: string;
  /** Rysunek (wykres funkcji albo figura) */
  figure?: Figure;
  /** Dalsza część polecenia pod rysunkiem */
  after?: string;
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
  /** Przedział: przynależność liczby do zbioru liczona niezależnie (np. próbkowaniem wykresu) */
  verifyIn?: (x: number) => boolean;
  /** Uzupełniane przy losowaniu (genTask): etap i ziarno, z którego da się odtworzyć zadanie */
  skillId?: string;
  seed?: number;
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
