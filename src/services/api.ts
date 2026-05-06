/**
 * API service layer.
 *
 * Connects to Supabase to fetch province records for year 2025.
 */

import { createClient } from '@supabase/supabase-js';
import { normalizeProvinceName } from '../data/indonesia-province-normalized';
import { ProvinceData } from '../utils/inequality';

/** Supabase credentials (publishable/anon key) — read from Vite env vars. */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://jkylndmvrladdaryrrlw.supabase.co';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_gPs8Dj_OlvEHaPrf9n7pEA_9TZFqyJ0';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Falling back to embedded keys.\nSet VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local and in your Vercel/hosting env vars.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Simulated network delay (ms) to demonstrate loading state */
const SIMULATED_DELAY_MS = 600;

export async function fetchProvinceData(year: number = 2025): Promise<ProvinceData[]> {
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
    .eq('tahun', year);

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
  const deduped = new Map<string, ProvinceData>();

  for (const row of (data ?? []) as ProvinceRow[]) {
    const province = normalizeProvinceName(row.nama_provinsi);
    if (!province) continue;

    const key = row.kode_provinsi != null ? String(row.kode_provinsi) : province;

    if (!deduped.has(key)) {
      deduped.set(key, {
        province,
        poverty: parseNumber(row.persen_miskin),
        income: parseNumber(row.pdrb_per_kapita),
        inequality: parseNumber(row.rasio_gini),
      });
    }
  }

  return [...deduped.values()];
}

/**
 * Fetch earliest and latest year available in `data_ketimpangan`.
 */
export async function fetchYearRange(): Promise<{ earliest_year: number; latest_year: number }> {
  // Small artificial delay to match UX
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  // Get earliest (min) year
  const { data: minRows, error: minError } = await supabase
    .from('data_ketimpangan')
    .select('tahun')
    .order('tahun', { ascending: true })
    .limit(1);

  if (minError) {
    console.error('Supabase fetch min year error:', minError);
    throw new Error('Gagal memuat tahun awal dari database.');
  }

  const { data: maxRows, error: maxError } = await supabase
    .from('data_ketimpangan')
    .select('tahun')
    .order('tahun', { ascending: false })
    .limit(1);

  if (maxError) {
    console.error('Supabase fetch max year error:', maxError);
    throw new Error('Gagal memuat tahun akhir dari database.');
  }

  const earliest_year = Array.isArray(minRows) && minRows.length ? Number(minRows[0].tahun) || 0 : 0;
  const latest_year = Array.isArray(maxRows) && maxRows.length ? Number(maxRows[0].tahun) || 0 : 0;

  return { earliest_year, latest_year };
}
