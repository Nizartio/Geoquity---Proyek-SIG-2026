import { getColor } from './colorScale';
import { CHOROPLETH_COLORS } from './colors';

/**
 * Default fallback palette derived from the choropleth colours.
 */
export const DEFAULT_PIE_COLORS = CHOROPLETH_COLORS.slice().reverse().slice(0, 5);

/**
 * Produce an array of colors for the given numeric values by mapping
 * each value through the choropleth `getColor` function. This ensures
 * pie slices follow the same visual semantics as the map.
 */
export function pieColorsFor(values: number[] | undefined): string[] {
  if (!values || values.length === 0) return DEFAULT_PIE_COLORS;
  return values.map((v) => getColor(typeof v === 'number' ? v : Number(v) || 0));
}

export default {
  DEFAULT_PIE_COLORS,
  pieColorsFor,
};
