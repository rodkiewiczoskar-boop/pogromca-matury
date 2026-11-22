import { MathfieldElement, convertLatexToMarkup } from 'mathlive';
import 'mathlive/fonts.css';
import 'mathlive/static.css';

MathfieldElement.fontsDirectory = null;
MathfieldElement.soundsDirectory = null;
MathfieldElement.decimalSeparator = ',';

const sep = { class: 'separator w5' };
const act = (label: string, command: string) => ({ class: 'action', label, command });

export type KbMode = 'default' | 'sets';
let currentMode: KbMode | null = null;

export function setupKeyboard(mode: KbMode = 'default') {
  if (currentMode === mode) return;
  currentMode = mode;
  const kb = window.mathVirtualKeyboard;
  const bottom = ['0', { label: ',', insert: '{,}' }, { latex: '\\pi' }, '+', sep, act('←', 'moveToPreviousChar'), act('→', 'moveToNextChar'), { class: 'action', label: '⌫', command: 'deleteBackward' }];
  if (mode === 'sets') {
    kb.layouts = [{
      label: 'Przedziały',
      displayEditToolbar: false,
      rows: [
        ['7', '8', '9', { label: ';', insert: ';' }, sep, { label: '(', insert: '(' }, { label: ')', insert: ')' }, { latex: '\\langle', insert: '\\langle' }, { latex: '\\rangle', insert: '\\rangle' }],
        ['4', '5', '6', { latex: '\\cdot' }, sep, { latex: '\\frac{#@}{#?}', class: 'small' }, { latex: '\\sqrt{#0}', class: 'small' }, { latex: '\\infty' }, { latex: '\\cup' }],
        ['1', '2', '3', '-', sep, { latex: 'x' }, { latex: '#@^{2}', class: 'small' }, { latex: '#@^{#?}', class: 'small' }, { latex: '=' }],
        bottom,
      ],
    }];
    return;
  }
  kb.layouts = [
    {
      label: 'Matura',
      displayEditToolbar: false,
      rows: [
        ['7', '8', '9', { latex: '\\div', insert: ':', label: ':' }, sep, { latex: '\\frac{#@}{#?}', class: 'small' }, { latex: '\\sqrt{#0}', class: 'small' }, { latex: '\\sqrt[#?]{#0}', class: 'small' }],
        ['4', '5', '6', { latex: '\\cdot' }, sep, { latex: '#@^{2}', class: 'small' }, { latex: '#@^{#?}', class: 'small' }, { latex: '\\log_{#?}#0', label: 'log', class: 'small' }],
        ['1', '2', '3', '-', sep, { latex: 'x' }, { latex: '(', insert: '\\left(#0\\right)' }, { label: ';', insert: ';' }],
        bottom,
      ],
    },
  ];
}

export function latexToHtml(latex: string, display = false): string {
  try {
    return convertLatexToMarkup(latex, { defaultMode: display ? 'math' : 'inline-math' } as any);
  } catch {
    return latex;
  }
}

export { MathfieldElement };
