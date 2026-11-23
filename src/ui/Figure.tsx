import type { Figure as Fig, GeoFigure, GraphFigure, Pt } from '../content/figures';

/** Rysunek do zadania. Dla wykresów z pick=true kliknięcie wybiera punkt kratowy. */
export function Figure({ fig, picked, onPick }: { fig: Fig; picked?: Pt | null; onPick?: (p: Pt) => void }) {
  return fig.kind === 'graph' ? <Graph fig={fig} picked={picked} onPick={onPick} /> : <Geo fig={fig} />;
}

/** Punkt zaznaczony w polu odpowiedzi, np. \left(2; -3\right) → [2, -3] */
export function pickedFrom(latex: string | undefined): Pt | null {
  const m = (latex ?? '').replace(/\\(left|right)/g, '').replace(/\s/g, '').match(/^\((-?\d+)[;,](-?\d+)\)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}
export const pointLatex = (p: Pt) => `\\left(${p[0]}; ${p[1]}\\right)`;

const U = 32; // piksele na jednostkę

function Graph({ fig, picked, onPick }: { fig: GraphFigure; picked?: Pt | null; onPick?: (p: Pt) => void }) {
  const [x0, x1] = fig.xr, [y0, y1] = fig.yr;
  const W = (x1 - x0) * U, H = (y1 - y0) * U;
  const X = (x: number) => (x - x0) * U, Y = (y: number) => (y1 - y) * U;
  const grid = [];
  for (let x = x0; x <= x1; x++) grid.push(<line key={`gx${x}`} x1={X(x)} y1={0} x2={X(x)} y2={H} class="g-grid" />);
  for (let y = y0; y <= y1; y++) grid.push(<line key={`gy${y}`} x1={0} y1={Y(y)} x2={W} y2={Y(y)} class="g-grid" />);
  const ticks = [];
  for (let x = x0 + 1; x < x1; x++) if (x !== 0) ticks.push(<text key={`tx${x}`} x={X(x)} y={Y(0) + 15} class="g-tick" text-anchor="middle">{x}</text>);
  for (let y = y0 + 1; y < y1; y++) if (y !== 0) ticks.push(<text key={`ty${y}`} x={X(0) - 6} y={Y(y) + 4} class="g-tick" text-anchor="end">{y}</text>);
  const interactive = !!(fig.pick && onPick);
  const click = (e: MouseEvent) => {
    if (!interactive) return;
    const svg = e.currentTarget as SVGSVGElement;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W, py = ((e.clientY - r.top) / r.height) * H;
    const x = Math.round(px / U + x0), y = Math.round(y1 - py / U);
    onPick!([Math.max(x0, Math.min(x1, x)), Math.max(y0, Math.min(y1, y))]);
  };
  return (
    <div class={`figure${interactive ? ' is-pick' : ''}`}>
      <svg viewBox={`-4 -4 ${W + 8} ${H + 8}`} role="img" aria-label="Wykres funkcji" onClick={click as any}>
        {grid}
        <line x1={0} y1={Y(0)} x2={W} y2={Y(0)} class="g-axis" marker-end="url(#arr)" />
        <line x1={X(0)} y1={H} x2={X(0)} y2={0} class="g-axis" marker-end="url(#arr)" />
        <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="g-arrow" /></marker></defs>
        <text x={W - 6} y={Y(0) - 8} class="g-name" text-anchor="end">x</text>
        <text x={X(0) + 8} y={14} class="g-name">y</text>
        <text x={X(0) - 6} y={Y(0) + 15} class="g-tick" text-anchor="end">0</text>
        {ticks}
        {fig.curves.map((c, i) => (
          <g key={i}>
            <polyline points={c.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} class="g-curve" />
            {c.ends?.map((e, k) => {
              if (e === 'none') return null;
              const [x, y] = k === 0 ? c.pts[0] : c.pts[c.pts.length - 1];
              return <circle key={k} cx={X(x)} cy={Y(y)} r={4.5} class={e === 'closed' ? 'g-dot' : 'g-hole'} />;
            })}
          </g>
        ))}
        {fig.arcs?.map((a, i) => {
          const r = 0.55 * U, cx = X(a.at[0]), cy = Y(a.at[1]);
          const t1 = (a.from * Math.PI) / 180, t2 = (a.to * Math.PI) / 180, mid = (t1 + t2) / 2;
          const p1 = [cx + r * Math.cos(t1), cy - r * Math.sin(t1)], p2 = [cx + r * Math.cos(t2), cy - r * Math.sin(t2)];
          return (
            <g key={`arc${i}`}>
              <path d={`M${cx} ${cy} L${p1[0]} ${p1[1]} A ${r} ${r} 0 ${a.to - a.from > 180 ? 1 : 0} 0 ${p2[0]} ${p2[1]} Z`} class="g-arc" />
              {a.label && <text x={cx + 0.33 * U * Math.cos(mid)} y={cy - 0.33 * U * Math.sin(mid) + 4} class="g-label" text-anchor="middle">{a.label}</text>}
            </g>
          );
        })}
        {fig.label && <text x={W - 8} y={22} class="g-label" text-anchor="end">{fig.label}</text>}
        {picked && <g><circle cx={X(picked[0])} cy={Y(picked[1])} r={9} class="g-pick" /><circle cx={X(picked[0])} cy={Y(picked[1])} r={3} class="g-pick-dot" /></g>}
      </svg>
      {interactive && <p class="figure-hint">Dotknij wykresu w miejscu kratki, żeby zaznaczyć punkt.</p>}
    </div>
  );
}

function Geo({ fig }: { fig: GeoFigure }) {
  const [bx, by, bw, bh] = fig.box;
  const S = 40;
  const X = (x: number) => (x - bx) * S, Y = (y: number) => (by + bh - y) * S;
  return (
    <div class="figure">
      <svg viewBox={`-10 -10 ${bw * S + 20} ${bh * S + 20}`} role="img" aria-label="Rysunek">
        {fig.shapes.map((s, i) => {
          switch (s.t) {
            case 'circle': return <circle key={i} cx={X(s.c[0])} cy={Y(s.c[1])} r={s.r * S} class="geo-line" />;
            case 'seg': return <line key={i} x1={X(s.a[0])} y1={Y(s.a[1])} x2={X(s.b[0])} y2={Y(s.b[1])} class={`geo-line${s.dash ? ' dash' : ''}`} />;
            case 'poly': return <polygon key={i} points={s.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} class="geo-line" />;
            case 'pt': return (
              <g key={i}>
                {s.dot !== false && <circle cx={X(s.p[0])} cy={Y(s.p[1])} r={3.5} class="geo-dot" />}
                {s.label && <text x={X(s.p[0]) + (s.dx ?? 0) * S} y={Y(s.p[1]) - (s.dy ?? 0) * S} class="geo-label" text-anchor="middle" dominant-baseline="middle">{s.label}</text>}
              </g>
            );
            case 'label': return <text key={i} x={X(s.p[0])} y={Y(s.p[1])} class="geo-text" text-anchor="middle" dominant-baseline="middle">{s.text}</text>;
            case 'angle': {
              const r = (s.r ?? 0.6) * S;
              const a1 = Math.atan2(s.from[1] - s.at[1], s.from[0] - s.at[0]);
              let a2 = Math.atan2(s.to[1] - s.at[1], s.to[0] - s.at[0]);
              let d = a2 - a1; while (d < 0) d += 2 * Math.PI; while (d > 2 * Math.PI) d -= 2 * Math.PI;
              const cx = X(s.at[0]), cy = Y(s.at[1]);
              const p1 = [cx + r * Math.cos(a1), cy - r * Math.sin(a1)], p2 = [cx + r * Math.cos(a1 + d), cy - r * Math.sin(a1 + d)];
              const mid = a1 + d / 2;
              const lr = r + 16;
              if (s.right) {
                const q = 0.35 * S;
                const u = [Math.cos(a1), Math.sin(a1)], v = [Math.cos(a1 + d), Math.sin(a1 + d)];
                const pts = [[cx + q * u[0], cy - q * u[1]], [cx + q * (u[0] + v[0]), cy - q * (u[1] + v[1])], [cx + q * v[0], cy - q * v[1]]];
                return <polyline key={i} points={pts.map((p) => p.join(',')).join(' ')} class="geo-angle" />;
              }
              return (
                <g key={i}>
                  <path d={`M${p1[0]} ${p1[1]} A ${r} ${r} 0 ${d > Math.PI ? 1 : 0} 0 ${p2[0]} ${p2[1]}`} class="geo-angle" />
                  {s.label && <text x={cx + lr * Math.cos(mid)} y={cy - lr * Math.sin(mid)} class="geo-alabel" text-anchor="middle" dominant-baseline="middle">{s.label}</text>}
                </g>
              );
            }
          }
        })}
      </svg>
    </div>
  );
}
