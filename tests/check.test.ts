import { describe, expect, it } from 'vitest';
import { checkAnswer, InputAnswer } from '../src/math/check';

const num = (expected: string): InputAnswer => ({ kind: 'input', expected, form: 'number' });
const st = (s: string, a: InputAnswer) => checkAnswer(s, a).status;

describe('liczby', () => {
  it('akceptuje równoważne zapisy', () => {
    const a = num('\\frac{1}{2}');
    for (const s of ['\\frac{1}{2}', '0{,}5', '0,5', '0.5', '\\frac{2}{4}', '\\frac{-1}{-2}']) expect(st(s, a), s).toBe('correct');
  });
  it('liczba mieszana', () => {
    expect(st('2\\frac{1}{2}', num('\\frac{5}{2}'))).toBe('correct');
    expect(st('-2\\frac{1}{2}', num('-\\frac{5}{2}'))).toBe('correct');
  });
  it('odrzuca złe', () => {
    expect(st('\\frac{1}{3}', num('\\frac{1}{2}'))).toBe('wrong');
    expect(st('-\\frac{1}{2}', num('\\frac{1}{2}'))).toBe('wrong');
    expect(st('5', num('0{,}5'))).toBe('wrong');
  });
  it('wymaga policzenia do końca', () => {
    expect(st('\\frac{1}{4}+\\frac{1}{4}', num('\\frac{1}{2}'))).toBe('form');
    expect(st('2^{-1}', num('\\frac{1}{2}'))).toBe('form');
  });
  it('uwaga o skracaniu', () => {
    expect(checkAnswer('\\frac{2}{4}', num('\\frac{1}{2}')).note).toMatch(/skrócić/);
  });
  it('x = 5', () => { expect(st('x=5', num('5'))).toBe('correct'); });
  it('puste pole', () => { expect(st('\\frac{\\placeholder{}}{2}', num('1'))).toBe('invalid'); });
  it('śmieci', () => { expect(st('', num('1'))).toBe('invalid'); });
  it('dzielenie dwukropkiem', () => { expect(st('6:4', { ...num('\\frac32'), form: 'any' })).toBe('correct'); });
});

describe('pierwiastki', () => {
  const a: InputAnswer = { kind: 'input', expected: '6\\sqrt{2}', form: 'surd' };
  it('postać k√m', () => {
    expect(st('6\\sqrt{2}', a)).toBe('correct');
    expect(st('6\\sqrt2', a)).toBe('correct');
    expect(st('\\sqrt{2}\\cdot6', a)).toBe('correct');
    expect(st('\\sqrt{72}', a)).toBe('form');
    expect(st('2\\sqrt{18}', a)).toBe('form');
    expect(st('6\\sqrt{3}', a)).toBe('wrong');
    expect(st('8{,}485281374', a)).toBe('wrong');
  });
  it('niewymierność w mianowniku', () => {
    const b: InputAnswer = { kind: 'input', expected: '2\\sqrt{3}', form: 'surd', rationalDenominator: true };
    expect(st('\\frac{6}{\\sqrt{3}}', b)).toBe('form');
    expect(st('\\frac{6\\sqrt{3}}{3}', b)).toBe('correct');
    expect(st('2\\sqrt{3}', b)).toBe('correct');
  });
  it('3+2√2', () => {
    const c: InputAnswer = { kind: 'input', expected: '3+2\\sqrt{2}', form: 'surd' };
    expect(st('2\\sqrt{2}+3', c)).toBe('correct');
    expect(st('3-2\\sqrt{2}', c)).toBe('wrong');
    expect(st('(1+\\sqrt{2})^2', c)).toBe('form');
  });
  it('pierwiastek 3 stopnia', () => {
    expect(st('\\sqrt[3]{8}', num('2'))).toBe('form');
  });
});

describe('wielomiany', () => {
  const a: InputAnswer = { kind: 'input', expected: 'x^2+6x+9', form: 'polynomial', vars: ['x'] };
  it('rozwinięcie', () => {
    expect(st('x^2+6x+9', a)).toBe('correct');
    expect(st('9+6x+x^{2}', a)).toBe('correct');
    expect(st('x^2+3x+9', a)).toBe('wrong');
    expect(st('x^2+9', a)).toBe('wrong');
    expect(st('(x+3)^2', a)).toBe('form');
    expect(st('(x+3)(x+3)', a)).toBe('form');
    expect(st('x^2+3x+3x+9', a)).toBe('form');
  });
  it('rozkład', () => {
    const f: InputAnswer = { kind: 'input', expected: '(x-3)(x+3)', form: 'factored', vars: ['x'] };
    expect(st('(x+3)(x-3)', f)).toBe('correct');
    expect(st('(x-3)(x+3)', f)).toBe('correct');
    expect(st('x^2-9', f)).toBe('form');
    expect(st('(x-3)^2', f)).toBe('wrong');
    const g: InputAnswer = { kind: 'input', expected: 'x(2x-5)', form: 'factored', vars: ['x'] };
    expect(st('x\\left(2x-5\\right)', g)).toBe('correct');
    expect(st('2x\\left(x-\\frac{5}{2}\\right)', g)).toBe('correct');
  });
});

describe('potęgi i logarytmy', () => {
  it('postać potęgi', () => {
    const a: InputAnswer = { kind: 'input', expected: '2^{\\frac{5}{3}}', form: 'power', base: 2 };
    expect(st('2^{\\frac{5}{3}}', a)).toBe('correct');
    expect(st('2^{\\frac{10}{6}}', a)).toBe('correct');
    expect(st('\\sqrt[3]{32}', a)).toBe('form');
  });
  it('logarytm jako wynik', () => {
    expect(st('\\log_2 8', num('3'))).toBe('form');
    expect(st('3', num('3'))).toBe('correct');
  });
});
