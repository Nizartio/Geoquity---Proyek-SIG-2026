/**
 * Color scale utilities for choropleth mapping.
 *
 * Maps poverty-rate percentages to a fixed 8-step palette,
 * from light yellow (low) to dark red (severe).
 */

import { CHOROPLETH_SCALE_POVERTY, CHOROPLETH_SCALE_INCOME, CHOROPLETH_SCALE_INEQUALITY, SEVERITY, GREEN_SEVERITY, BLUE_SEVERITY } from './colors';

export type MapMetric = 'poverty' | 'income' | 'inequality';

/** Threshold-based color scale for poverty rate (%) (derived from named colors) */
const SCALE_POVERTY = CHOROPLETH_SCALE_POVERTY.map((s) => ({
  threshold: s.threshold,
  color: SEVERITY[s.colorName],
  label: s.label,
}));

const SCALE_INCOME = CHOROPLETH_SCALE_INCOME.map((s) => ({
  threshold: s.threshold,
  color: GREEN_SEVERITY[s.colorName],
  label: s.label,
}));

const SCALE_INEQUALITY = CHOROPLETH_SCALE_INEQUALITY.map((s) => ({
  threshold: s.threshold,
  color: BLUE_SEVERITY[s.colorName],
  label: s.label,
}));


/**
 * Map a metric value to a fill color.
 * @param value  The metric value
 * @param metric The selected metric
 * @returns      Hex color string
 */
export function getColor(value: number, metric: MapMetric = 'poverty'): string {
  let scale: Array<{ threshold: number; color: string; label: string }> = SCALE_POVERTY;
  if (metric === 'income') scale = SCALE_INCOME;
  if (metric === 'inequality') scale = SCALE_INEQUALITY;

  // Walk scale in reverse so the highest threshold wins
  for (let i = scale.length - 1; i >= 0; i--) {
    if (value >= scale[i].threshold) return scale[i].color;
  }
  return scale[0].color;
}

/**
 * Returns the full scale array (useful for rendering a legend).
 */
export function getScale(metric: MapMetric = 'poverty') {
  let scale: Array<{ threshold: number; color: string; label: string }> = SCALE_POVERTY;
  if (metric === 'income') scale = SCALE_INCOME;
  if (metric === 'inequality') scale = SCALE_INEQUALITY;
  return scale.map((s) => ({ threshold: s.threshold, color: s.color, label: s.label }));
}
