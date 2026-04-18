/**
 * Color scale utilities for choropleth mapping.
 *
 * Maps poverty-rate percentages to a fixed 8-step palette,
 * from light yellow (low) to dark red (severe).
 */

/** Threshold-based color scale for poverty rate (%) */
const SCALE: Array<{ threshold: number; color: string; label: string }> = [
  { threshold: 0, color: '#ffeda0', label: '< 4%' },
  { threshold: 4, color: '#fed976', label: '4 - 6%' },
  { threshold: 6, color: '#feb24c', label: '6 - 8%' },
  { threshold: 8, color: '#fd8d3c', label: '8 - 10%' },
  { threshold: 10, color: '#fc4e2a', label: '10 - 12%' },
  { threshold: 12, color: '#e31a1c', label: '12 - 15%' },
  { threshold: 15, color: '#bd0026', label: '15 - 20%' },
  { threshold: 20, color: '#7f0000', label: '>= 20%' },
];

/**
 * Map a poverty-rate value to a fill color.
 * @param value  Poverty rate in percent
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
