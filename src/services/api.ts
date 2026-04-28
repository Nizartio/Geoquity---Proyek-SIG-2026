/**
 * API service layer.
 *
 * Connects to Supabase to fetch province records for year 2025.
 */

import { createClient } from '@supabase/supabase-js';
import { normalizeProvinceName } from '../data/indonesia-province-normalized';
import { enrichWithInequality, ProvinceData } from '../utils/inequality';

/** Supabase credentials (publishable/anon key) */
const SUPABASE_URL = 'https://jkylndmvrladdaryrrlw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gPs8Dj_OlvEHaPrf9n7pEA_9TZFqyJ0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Simulated network delay (ms) to demonstrate loading state */
const SIMULATED_DELAY_MS = 600;

/**
 * Fetch province data from Supabase table `data_ketimpangan` for tahun = 2025.
 *
 * Expected table columns (as provided):
 * - no
 * - kode_provinsi
 * - nama_provinsi
 * - tahun
 * - pdrb_per_kapita
 * - persen_miskin
 * - rasio_gini
 */
export async function fetchProvinceData(): Promise<ProvinceData[]> {
  // Keep a small artificial delay for consistent UX
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  type ProvinceRow = {
    no?: number;
    kode_provinsi?: number;
    nama_provinsi?: string;
    tahun?: number;
    pdrb_per_kapita?: number | string;
    persen_miskin?: number | string;
    rasio_gini?: number | string;
  };

  const { data, error } = await supabase
    .from('data_ketimpangan')
    .select('kode_provinsi, nama_provinsi, tahun, pdrb_per_kapita, persen_miskin, rasio_gini')
    .eq('tahun', 2025);

  if (error) {
    console.error('Supabase fetch error:', error);
    throw new Error('Gagal memuat data dari database.');
  }

  // Helper: parse numbers that may contain commas, spaces or other chars
  const parseNumber = (v: number | string | undefined): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const cleaned = String(v).replace(/[^0-9.-]+/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  // Canonicalize province names and keep only one row per province code/name.
  const deduped = new Map<string, Omit<ProvinceData, 'inequality'>>();

  for (const row of (data ?? []) as ProvinceRow[]) {
    const province = normalizeProvinceName(row.nama_provinsi);
    if (!province) continue;

    const key = row.kode_provinsi != null ? String(row.kode_provinsi) : province;

    if (!deduped.has(key)) {
      deduped.set(key, {
        province,
        poverty: parseNumber(row.persen_miskin),
        income: parseNumber(row.pdrb_per_kapita),
      });
    }
  }

  return enrichWithInequality([...deduped.values()]);
}
