/**
 * Utility functions for computing social inequality index.
 *
 * The inequality index is a composite metric derived from:
 *   poverty rate (%) and income per capita (IDR thousands).
 *
 * Formula: inequality = poverty * (1 / (income / 1000))
 * Higher value  → greater inequality
 * Lower value   → less inequality
 */

export interface ProvinceData {
  province: string;
  /** Poverty rate in percent (e.g. 10.5 means 10.5%) */
  poverty: number;
  /** Income per capita in IDR thousands (e.g. 55000 = Rp 55.000.000) */
  income: number;
  /** Computed inequality index (populated by computeInequality) */
  inequality?: number;
}

/**
 * Compute the inequality index for a single province.
 * Returns a number proportional to poverty severity relative to income.
 */
export function computeInequality(poverty: number, income: number): number {
  if (income <= 0) return 0;
  // Scale factor keeps the value in a readable range (~0–1000)
  return Math.round((poverty / (income / 10000)) * 10) / 10;
}

/**
 * Enrich an array of province records with a computed inequality field.
 */
export function enrichWithInequality(data: Omit<ProvinceData, 'inequality'>[]): ProvinceData[] {
  return data.map((d) => ({
    ...d,
    inequality: computeInequality(d.poverty, d.income),
  }));
}

/**
 * Return basic aggregate statistics over a dataset.
 */
export function computeStats(data: ProvinceData[]) {
  const count = data.length;
  if (count === 0) return { avgPoverty: 0, avgIncome: 0, avgInequality: 0 };

  const sum = data.reduce(
    (acc, d) => ({
      poverty: acc.poverty + d.poverty,
      income: acc.income + d.income,
      inequality: acc.inequality + (d.inequality ?? 0),
    }),
    { poverty: 0, income: 0, inequality: 0 }
  );

  return {
    avgPoverty: Math.round((sum.poverty / count) * 100) / 100,
    avgIncome: Math.round(sum.income / count),
    avgInequality: Math.round((sum.inequality / count) * 10) / 10,
  };
}
