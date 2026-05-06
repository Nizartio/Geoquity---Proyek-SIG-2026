/**
 * Centralised color definitions used across the project.
 *
 * Each name describes how severe the color is (darker == more severe).
 * Components should import these names rather than hardcoding hex values.
 */
export const SEVERITY = {
  veryLight: '#ffeda0', // lowest severity
  light: '#fed976',
  lightMid: '#feb24c',
  mid: '#fd8d3c',
  midDark: '#fc4e2a',
  dark: '#e31a1c',
  veryDark: '#bd0026',
  extreme: '#7f0000', // highest severity
} as const;

/**
 * Choropleth scale definition that ties thresholds to named severity values.
 * Use `CHOROPLETH_SCALE` when rendering legends or building scale helpers.
 */
export const CHOROPLETH_SCALE: Array<{ threshold: number; colorName: keyof typeof SEVERITY; label: string }> = [
  { threshold: 0, colorName: 'veryLight', label: '< 4%' },
  { threshold: 4, colorName: 'light', label: '4 - 6%' },
  { threshold: 6, colorName: 'lightMid', label: '6 - 8%' },
  { threshold: 8, colorName: 'mid', label: '8 - 10%' },
  { threshold: 10, colorName: 'midDark', label: '10 - 12%' },
  { threshold: 12, colorName: 'dark', label: '12 - 15%' },
  { threshold: 15, colorName: 'veryDark', label: '15 - 20%' },
  { threshold: 20, colorName: 'extreme', label: '>= 20%' },
];

/**
 * Convenience: ordered array of hex colors from least to most severe.
 */
export const CHOROPLETH_COLORS = CHOROPLETH_SCALE.map((s) => SEVERITY[s.colorName]);

export default {
  SEVERITY,
  CHOROPLETH_SCALE,
  CHOROPLETH_COLORS,
};
