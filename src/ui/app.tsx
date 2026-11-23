import { useEffect, useState } from 'preact/hooks';
import { DzialView, Home, Lesson, NotFound, TestView } from './views';
import { ArkuszeList, ExamView } from './exam';
import { FormulaPage } from './formulas';
import { PlanView, ReviewView, StatsView } from './study';
import { OpenList, OpenPractice } from './open';

function useHash() {
  const [h, setH] = useState(location.hash || '#/');
  useEffect(() => {
    const f = () => { setH(location.hash || '#/'); window.scrollTo(0, 0); window.mathVirtualKeyboard?.hide(); };
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return h;
}

export function App() {
  const h = useHash();
  const [, route, id] = h.slice(1).split('/');
  if (!route) return <Home />;
  if (route === 'matura') return <ExamView />;
  if (route === 'arkusze') return <ArkuszeList />;
  if (route === 'arkusz' && id) return <ExamView key={id} sheet={id} />;
  if (route === 'wzory') return <FormulaPage />;
  if (route === 'plan') return <PlanView />;
  if (route === 'powtorki') return <ReviewView />;
  if (route === 'postep') return <StatsView />;
  if (route === 'otwarte') return id ? <OpenPractice key={id} id={id} /> : <OpenList />;
  if (route === 'd' && id) return <DzialView id={id} />;
  if (route === 's' && id) return <Lesson id={id} />;
  if (route === 't' && id) return <TestView id={id} />;
  return <NotFound />;
}
