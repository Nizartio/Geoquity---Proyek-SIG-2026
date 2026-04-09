/**
 * Color scale utilities for choropleth mapping.
 *
 * Maps a numeric value to a hex color along a gradient
 * from light yellow (low inequality) to dark red (high inequality).
 */

/** A simple threshold-based color scale for the inequality index */
const SCALE: Array<{ threshold: number; color: string }> = [
  { threshold: 0,   color: '#ffffcc' },
  { threshold: 10,  color: '#fed976' },
  { threshold: 20,  color: '#fd8d3c' },
  { threshold: 30,  color: '#f03b20' },
  { threshold: 40,  color: '#bd0026' },
];

/**
 * Map an inequality index value to a fill color.
 * @param value  Inequality index (result of computeInequality)
 * @returns      Hex color string
 */
export function getColor(value: number): string {
  // Walk scale in reverse so the highest threshold wins
  for (let i = SCALE.length - 1; i >= 0; i--) {
    if (value >= SCALE[i].threshold) return SCALE[i].color;
  }
  return SCALE[0].color;
}

/**
 * Returns the full scale array (useful for rendering a legend).
 */
export function getScale() {
  return SCALE;
}
