/**
 * Color scale utilities for choropleth mapping.
 *
 * Maps poverty-rate percentages to a fixed 8-step palette,
 * from light yellow (low) to dark red (severe).
 */

import { CHOROPLETH_SCALE, CHOROPLETH_COLORS, SEVERITY } from './colors';

/** Threshold-based color scale for poverty rate (%) (derived from named colors) */
const SCALE: Array<{ threshold: number; color: string; colorName: keyof typeof SEVERITY; label: string }> = CHOROPLETH_SCALE.map((s) => ({
  threshold: s.threshold,
  colorName: s.colorName,
  color: CHOROPLETH_COLORS[CHOROPLETH_SCALE.indexOf(s)],
  label: s.label,
}));

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
  return SCALE.map((s) => ({ threshold: s.threshold, color: s.color, colorName: s.colorName, label: s.label }));
}
