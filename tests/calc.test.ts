import { expect, it } from 'vitest';
import { calcEval, formatCalc } from '../src/math/calc';
it('kalkulator', () => {
  expect(calcEval('2+3×4')).toBe(14);
  expect(calcEval('(2+3)×4')).toBe(20);
  expect(calcEval('√16+2')).toBe(6);
  expect(calcEval('3²')).toBe(9);
  expect(calcEval('−3²')).toBe(-9);
  expect(calcEval('200×15%')).toBe(30);
  expect(calcEval('7÷2')).toBe(3.5);
  expect(formatCalc(calcEval('1,5+1,25'))).toBe('2,75');
  expect(formatCalc(calcEval('0,1+0,2'))).toBe('0,3');
  expect(() => calcEval('5÷0')).toThrow();
  expect(() => calcEval('2+')).toThrow();
});
