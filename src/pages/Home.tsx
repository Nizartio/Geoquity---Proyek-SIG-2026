import { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map';
import Dashboard from '../components/Dashboard';
import StatsCard from '../components/StatsCard';
import Filter from '../components/Filter';
import { fetchProvinceData } from '../services/api';
import { computeStats, type ProvinceData } from '../utils/inequality';

/**
 * Home page – the single page of the Geoquity GIS Dashboard.
 *
 * Layout (responsive):
 *   - Header bar
 *   - Stats row (3 cards)
 *   - Main content: Map (left) + Dashboard charts (right)
 */
export default function Home() {
  const [data, setData] = useState<ProvinceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');

  // ── Load data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetchProvinceData()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat data.');
        setLoading(false);
      });
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────
  const displayData = selected ? data.filter((d) => d.province === selected) : data;
  const stats = computeStats(displayData);

  const handleSelect = useCallback(
    (province: string) => {
      setSelected((prev) => (prev === province ? '' : province));
    },
    []
  );

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Memuat data provinsi…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
          <p className="text-red-500 font-semibold text-lg mb-2">Terjadi Kesalahan</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              🗺️ Geoquity
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
              Dashboard Ketimpangan Ekonomi per Provinsi – Indonesia
            </p>
          </div>
          <span className="hidden sm:block text-blue-300 text-xs">
            Data: BPS {new Date().getFullYear()}
          </span>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Filter + selected province label */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Filter
            provinces={data.map((d) => d.province)}
            selected={selected}
            onChange={setSelected}
          />
          {selected && (
            <span className="text-sm text-blue-700 font-medium">
              Menampilkan: <strong>{selected}</strong>
              <button
                onClick={() => setSelected('')}
                className="ml-2 text-gray-400 hover:text-gray-600 text-xs underline"
              >
                Reset
              </button>
            </span>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Rata-rata Kemiskinan"
            value={`${stats.avgPoverty}%`}
            sub={selected || 'Semua Provinsi'}
            accent="bg-red-500"
          />
          <StatsCard
            title="Rata-rata Pendapatan Per Kapita"
            value={`Rp ${stats.avgIncome.toLocaleString('id-ID')} rb`}
            sub={selected || 'Semua Provinsi'}
            accent="bg-green-500"
          />
          <StatsCard
            title="Rata-rata Indeks Ketimpangan"
            value={stats.avgInequality.toString()}
            sub={selected || 'Semua Provinsi'}
            accent="bg-orange-500"
          />
        </div>

        {/* Map + Dashboard side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-5 flex-1">
          {/* Map – takes 60% on desktop */}
          <div className="lg:flex-[3] h-[450px] lg:h-auto min-h-[400px]">
            <Map data={data} selected={selected} onSelect={handleSelect} />
          </div>

          {/* Dashboard charts – takes 40% on desktop */}
          <div className="lg:flex-[2] overflow-y-auto">
            <Dashboard allData={data} selected={selected} />
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-400">
        Geoquity – Proyek SIG 2026 · Kelompok 6
      </footer>
    </div>
  );
}
