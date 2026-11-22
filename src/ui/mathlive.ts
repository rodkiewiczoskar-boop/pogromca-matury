import { MathfieldElement, convertLatexToMarkup } from 'mathlive';
import 'mathlive/fonts.css';
import 'mathlive/static.css';

MathfieldElement.fontsDirectory = null;
MathfieldElement.soundsDirectory = null;
MathfieldElement.decimalSeparator = ',';

const sep = { class: 'separator w5' };
const act = (label: string, command: string) => ({ class: 'action', label, command });

export function setupKeyboard() {
  const kb = window.mathVirtualKeyboard;
  kb.layouts = [
    {
      label: 'Matura',
      displayEditToolbar: false,
      rows: [
        ['7', '8', '9', { latex: '\\div', insert: ':', label: ':' }, sep, { latex: '\\frac{#@}{#?}', class: 'small' }, { latex: '\\sqrt{#0}', class: 'small' }, { latex: '\\sqrt[#?]{#0}', class: 'small' }],
        ['4', '5', '6', { latex: '\\cdot' }, sep, { latex: '#@^{2}', class: 'small' }, { latex: '#@^{#?}', class: 'small' }, { latex: '\\log_{#?}#0', label: 'log', class: 'small' }],
        ['1', '2', '3', '-', sep, { latex: 'x' }, { latex: '(', insert: '\\left(#0\\right)' }, { latex: ')', key: ')' }],
        ['0', { label: ',', insert: '{,}' }, { latex: '\\pi' }, '+', sep, act('←', 'moveToPreviousChar'), act('→', 'moveToNextChar'), { class: 'action', label: '⌫', command: 'deleteBackward' }],
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
