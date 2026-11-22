import { dzial1 } from './dzial1';
import { dzial2 } from './dzial2';
import type { Dzial } from './types';

export const DZIALY: Dzial[] = [dzial1, dzial2];

/** Pozostałe działy wymagań CKE (formuła 2015, poziom podstawowy) — w przygotowaniu */
export const PLANNED: string[] = [
  'Równania i nierówności',
  'Funkcje',
  'Funkcja liniowa i kwadratowa',
  'Ciągi',
  'Trygonometria',
  'Planimetria',
  'Geometria analityczna',
  'Stereometria',
  'Statystyka, kombinatoryka i prawdopodobieństwo',
];

/** Ile poprawnych odpowiedzi zalicza etap */
export const STAGE_GOAL = 6;
