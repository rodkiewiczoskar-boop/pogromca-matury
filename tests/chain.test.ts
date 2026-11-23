import { describe, expect, it } from 'vitest';
import { checkAnswer, InputAnswer } from '../src/math/check';
const num = (expected: string): InputAnswer => ({ kind: 'input', expected, form: 'number' });
describe('rozpisywanie obliczeń ze znakiem =', () => {
  const a = num('\\frac{5}{6}');
  it('sprawdza wynik po ostatnim =', () => {
    expect(checkAnswer('\\frac12+\\frac13=\\frac36+\\frac26=\\frac56', a).status).toBe('correct');
    expect(checkAnswer('\\frac12+\\frac13=\\frac36+\\frac26', a).status).toBe('form');
    expect(checkAnswer('\\frac12+\\frac13=\\frac25', a).status).toBe('wrong');
  });
  it('wskazuje krok z błędem', () => {
    const r = checkAnswer('\\frac12+\\frac13=\\frac36+\\frac16=\\frac46', a);
    expect(r.status).toBe('wrong');
    expect(r.message).toMatch(/Krok 2/);
    const ok = checkAnswer('\\frac12+\\frac13=\\frac36+\\frac16=\\frac56', a);
    expect(ok.status).toBe('correct');
    expect(ok.note).toMatch(/Krok 2/);
  });
  it('puste po =', () => { expect(checkAnswer('\\frac12+\\frac13=', a).status).toBe('invalid'); });
  it('x = ... = wynik', () => { expect(checkAnswer('x=\\frac{10}{12}=\\frac56', a).status).toBe('correct'); });
  it('wielomian rozpisany', () => {
    const p: InputAnswer = { kind: 'input', expected: 'x^2+6x+9', form: 'polynomial', vars: ['x'] };
    expect(checkAnswer('(x+3)^2=x^2+2\\cdot3x+9=x^2+6x+9', p).status).toBe('correct');
    expect(checkAnswer('(x+3)^2=x^2+3x+9', p).status).toBe('wrong');
  });
  it('równanie prostej y = ...', () => {
    const l: InputAnswer = { kind: 'input', expected: 'y = 2x + 1', form: 'polynomial', vars: ['x'] };
    expect(checkAnswer('y=2x+1', l).status).toBe('correct');
  });
  it('punkt S = (..)', () => {
    expect(checkAnswer('S=\\left(2;-3\\right)', { kind: 'input', expected: '(2;-3)', form: 'point' }).status).toBe('correct');
  });
});
