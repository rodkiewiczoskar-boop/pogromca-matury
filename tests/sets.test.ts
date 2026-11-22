import { describe, expect, it } from 'vitest';
import { checkAnswer, InputAnswer } from '../src/math/check';

const list = (expected: string): InputAnswer => ({ kind: 'input', expected, form: 'list' });
const iv = (expected: string): InputAnswer => ({ kind: 'input', expected, form: 'interval' });
const st = (s: string, a: InputAnswer) => checkAnswer(s, a).status;

describe('lista rozwiązań', () => {
  const a = list('\\frac{4}{3}; 4');
  it('kolejność i zapis dowolny', () => {
    for (const s of ['4;\\frac43', '\\frac{4}{3};4', 'x=4;x=\\frac{4}{3}', 'x_1=\\frac43, x_2=4', 'x=4\\lor x=\\frac{4}{3}', '\\frac{8}{6}; 4']) expect(st(s, a), s).toBe('correct');
  });
  it('braki i błędy', () => {
    expect(st('4', a)).toBe('wrong');
    expect(checkAnswer('4', a).message).toMatch(/Brakuje/);
    expect(st('4; 3', a)).toBe('wrong');
    expect(st('4; \\frac43; 1', a)).toBe('wrong');
  });
  it('pierwiastki niewymierne', () => {
    expect(st('1+\\sqrt{2}; 1-\\sqrt2', list('1-\\sqrt{2}; 1+\\sqrt{2}'))).toBe('correct');
  });
});

describe('przedziały', () => {
  const a = iv('\\left(-\\infty;2\\right\\rangle\\cup\\left\\langle3;\\infty\\right)');
  it('różne zapisy nawiasów', () => {
    for (const s of ['(-\\infty;2]\\cup[3;\\infty)', '\\left(-\\infty;2\\right\\rbrack\\cup\\left\\lbrack3;+\\infty\\right)', 'x\\in(-\\infty;2]\\cup[3;\\infty)', '[3;\\infty)\\cup(-\\infty;2]', '(-\\infty,2]\\cup[3,\\infty)'])
      expect(st(s, a), s).toBe('correct');
  });
  it('złe końce i nawiasy', () => {
    expect(st('(-\\infty;2)\\cup[3;\\infty)', a)).toBe('wrong');
    expect(st('[2;3]', a)).toBe('wrong');
    expect(st('(-\\infty;2]\\cup[3;\\infty]', a)).toBe('form');
    expect(st('x\\le2', a)).toBe('invalid');
  });
  it('przedział ograniczony i ułamki', () => {
    const b = iv('\\left(-\\frac{1}{3};2\\right)');
    expect(st('(-\\frac13;2)', b)).toBe('correct');
    expect(st('\\left(-\\frac{2}{6};2\\right)', b)).toBe('correct');
    expect(st('[-\\frac13;2)', b)).toBe('wrong');
  });
  it('zbiór pusty i R', () => {
    expect(st('\\emptyset', iv('\\varnothing'))).toBe('correct');
    expect(st('\\mathbb{R}', iv('(-\\infty;\\infty)'))).toBe('correct');
  });
});
