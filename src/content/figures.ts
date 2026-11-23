// Opis rysunków do zadań (wykresy w układzie współrzędnych i rysunki geometryczne).

export type Pt = [number, number];

export interface GraphCurve {
  /** Łamana lub gęsto próbkowana krzywa */
  pts: Pt[];
  /** Kropki na końcach: pełna (należy), pusta (nie należy) lub brak (strzałka/ciąg dalszy) */
  ends?: ['closed' | 'open' | 'none', 'closed' | 'open' | 'none'];
}

export interface GraphFigure {
  kind: 'graph';
  xr: [number, number];
  yr: [number, number];
  curves: GraphCurve[];
  /** Nazwa funkcji przy wykresie, np. "y = f(x)" */
  label?: string;
  /** Uczeń może zaznaczyć punkt kratowy kliknięciem */
  pick?: boolean;
}

export type GeoShape =
  | { t: 'circle'; c: Pt; r: number }
  | { t: 'seg'; a: Pt; b: Pt; dash?: boolean }
  | { t: 'poly'; pts: Pt[] }
  | { t: 'pt'; p: Pt; label?: string; dx?: number; dy?: number; dot?: boolean }
  | { t: 'angle'; at: Pt; from: Pt; to: Pt; label?: string; right?: boolean; r?: number }
  | { t: 'label'; p: Pt; text: string };

export interface GeoFigure {
  kind: 'geo';
  /** Obszar rysunku w jednostkach rysunku */
  box: [number, number, number, number];
  shapes: GeoShape[];
}

export type Figure = GraphFigure | GeoFigure;

/** Wartość łamanej w punkcie x (null poza dziedziną) */
export function polyAt(pts: Pt[], x: number): number | null {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if (x >= x0 - 1e-12 && x <= x1 + 1e-12) return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return null;
}
