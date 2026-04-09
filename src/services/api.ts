/**
 * API service layer.
 *
 * In a production environment this would fetch from the Metabase API.
 * For now it loads the local mock JSON and enriches it with the
 * computed inequality index.
 */

import rawData from '../data/dummyData.json';
import { enrichWithInequality, ProvinceData } from '../utils/inequality';

/** Simulated network delay (ms) to demonstrate loading state */
const SIMULATED_DELAY_MS = 600;

/**
 * Fetch province data.
 * Returns a promise that resolves to an enriched ProvinceData array.
 *
 * Replace the body of this function with a real fetch() call when
 * the Metabase API endpoint is available:
 *
 *   const res = await fetch('https://metabase.example.com/api/...');
 *   const raw = await res.json();
 *   return enrichWithInequality(raw);
 */
export async function fetchProvinceData(): Promise<ProvinceData[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  // rawData is typed as an array of objects without `inequality`
  return enrichWithInequality(rawData as Omit<ProvinceData, 'inequality'>[]);
}
