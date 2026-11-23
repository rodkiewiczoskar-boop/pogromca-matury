import { describe, expect, it } from 'vitest';
import { checkAnswer, InputAnswer } from '../src/math/check';

const eq = (expected: string): InputAnswer => ({ kind: 'input', expected, form: 'equation', vars: ['x'] });

describe('równanie jako krok rozwiązania', () => {
  const a = eq('2\\left(x^2+3\\right) = 2x^2 + 1 + 3x + 5');
  it('przyjmuje równania równoważne przez przekształcenia', () => {
    for (const s of ['2\\left(x^2+3\\right)=2x^2+1+3x+5', '2x^2+6=2x^2+3x+6', '6=3x+6', '3x=0', '0=3x', '-3x=0', 'x=0', '2(x^2+3)-(2x^2+3x+6)=0'])
      expect(checkAnswer(s, a).status, s).toBe('correct');
  });
  it('odrzuca złe równania i tożsamości', () => {
    for (const s of ['2x^2+6=2x^2+3x+5', 'x=1', '3x=3', 'x^2=0']) expect(checkAnswer(s, a).status, s).toBe('wrong');
    expect(checkAnswer('x=x', a).status).toBe('wrong');
  });
  it('wymaga jednego znaku równości', () => {
    expect(checkAnswer('2x^2+6', a).status).toBe('invalid');
    expect(checkAnswer('a=b=c', a).status).toBe('invalid');
  });
});
