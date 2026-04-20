import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import StatsCard from '../components/StatsCard';
import Filter from '../components/Filter';
import { fetchProvinceData } from '../services/api';
import { computeStats, type ProvinceData } from '../utils/inequality';

const Map = lazy(() => import('../components/Map'));
const Dashboard = lazy(() => import('../components/Dashboard'));

/**
 * Home page – the single page of the Geoquity GIS Dashboard.
 *
 * Layout (responsive):
 *   - Header bar
 *   - Filter controls
 *   - Wide map section (top)
 *   - Statistics cards + charts section (bottom)
 */
export default function Home() {
  const [data, setData] = useState<ProvinceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

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
  const displayData = selectedProvinces.length
    ? data.filter((d) => selectedProvinces.includes(d.province))
    : data;
  const stats = computeStats(displayData);
  const primarySelected = selectedProvinces.length === 1 ? selectedProvinces[0] : '';

  const handleSelect = useCallback(
    (province: string, additive: boolean) => {
      setSelectedProvinces((prev) => {
        if (!additive) {
          return prev.length === 1 && prev[0] === province ? [] : [province];
        }

        return prev.includes(province) ? prev.filter((p) => p !== province) : [...prev, province];
      });
    },
    []
  );

  const sectionLoader = (
    <div className="w-full h-full min-h-[100px] bg-white rounded-2xl shadow-md animate-pulse" />
  );

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#2596be] border-t-transparent animate-spin" />
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
            className="mt-4 px-5 py-2 bg-[#2596be] text-white rounded-lg text-sm hover:opacity-90"
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
    {/* Hex */}
    <header className="bg-[#2596be] text-white shadow-lg"> 
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <img src="/Logo.png" alt="Logo Geoquity" className="h-16 w-auto object-contain" />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Geoquity
            </h1>
            <p className="text-blue-50 opacity-90 text-xs sm:text-sm mt-0.5">
              Dashboard Ketimpangan Ekonomi per Provinsi – Indonesia
            </p>
          </div>
        </div>
        <span className="hidden sm:block text-blue-50 text-xs font-medium">
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
            selected={primarySelected}
            onChange={(province) => setSelectedProvinces(province ? [province] : [])}
          />
          {selectedProvinces.length > 0 && (
            <span className="text-sm text-[#2596be] font-medium">
              Menampilkan:{' '}
              <strong>
                {selectedProvinces.length === 1
                  ? selectedProvinces[0]
                  : `${selectedProvinces.length} provinsi terpilih`}
              </strong>
              <button
                onClick={() => setSelectedProvinces([])}
                className="ml-2 text-gray-400 hover:text-gray-600 text-xs underline"
              >
                Reset
              </button>
            </span>
          )}
        </div>

        {/* Wide map section */}
        <div className="h-[400px] sm:h-[500px] lg:h-[560px] xl:h-[600px]">
          <Suspense fallback={sectionLoader}>
            <Map data={data} selected={selectedProvinces} onSelect={handleSelect} />
          </Suspense>
        </div>

        {/* Bottom statistics section */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatsCard
              title="Rata-rata Kemiskinan"
              value={`${stats.avgPoverty}%`}
              sub={
                selectedProvinces.length === 0
                  ? 'Semua Provinsi'
                  : selectedProvinces.length === 1
                    ? selectedProvinces[0]
                    : `${selectedProvinces.length} Provinsi`
              }
              accent="bg-red-500"
            />
            <StatsCard
              title="Rata-rata Pendapatan Per Kapita"
              value={`Rp ${stats.avgIncome.toLocaleString('id-ID')} rb`}
              sub={
                selectedProvinces.length === 0
                  ? 'Semua Provinsi'
                  : selectedProvinces.length === 1
                    ? selectedProvinces[0]
                    : `${selectedProvinces.length} Provinsi`
              }
              accent="bg-green-500"
            />
            <StatsCard
              title="Rata-rata Indeks Ketimpangan"
              value={stats.avgInequality.toString()}
              sub={
                selectedProvinces.length === 0
                  ? 'Semua Provinsi'
                  : selectedProvinces.length === 1
                    ? selectedProvinces[0]
                    : `${selectedProvinces.length} Provinsi`
              }
              accent="bg-orange-500"
            />
          </div>

          <Suspense fallback={sectionLoader}>
            <Dashboard allData={data} selectedProvinces={selectedProvinces} />
          </Suspense>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-400">
        Geoquity – Proyek SIG 2026 · Kelompok 6
      </footer>
    </div>
  );
}
