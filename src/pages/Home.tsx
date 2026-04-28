import { useMemo, useState, useEffect, useCallback, lazy, Suspense } from 'react';
import StatsCard from '../components/StatsCard';
import Filter from '../components/Filter';
import { fetchProvinceData } from '../services/api';
import { computeStats, type ProvinceData } from '../utils/inequality';

const Map = lazy(() => import('../components/Map'));
const Dashboard = lazy(() => import('../components/Dashboard'));

export default function Home() {
  const [data, setData] = useState<ProvinceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

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

  const displayData = selectedProvinces.length
    ? data.filter((d) => selectedProvinces.includes(d.province))
    : data;
  const stats = computeStats(displayData);
  const primarySelected = selectedProvinces.length === 1 ? selectedProvinces[0] : '';

  const statsCards = useMemo(
    () => [
      {
        title: 'Rata-rata Kemiskinan',
        value: `${stats.avgPoverty}%`,
        accent: 'bg-rose-500',
      },
      {
        title: 'Pendapatan Per Kapita',
        value: `Rp ${stats.avgIncome.toLocaleString('id-ID')} rb`,
        accent: 'bg-emerald-500',
      },
      {
        title: 'Indeks Ketimpangan',
        value: stats.avgInequality.toString(),
        accent: 'bg-amber-500',
      },
    ],
    [stats.avgIncome, stats.avgInequality, stats.avgPoverty]
  );

  const handleSelect = useCallback((province: string, additive: boolean) => {
    setSelectedProvinces((prev) => {
      if (!additive) {
        return prev.length === 1 && prev[0] === province ? [] : [province];
      }

      return prev.includes(province) ? prev.filter((p) => p !== province) : [...prev, province];
    });
  }, []);

  const sectionLoader = <div className="w-full h-full min-h-[100px] rounded-3xl bg-white/70 shadow-md animate-pulse" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeaf4,_#eef4f8_50%,_#d7e3ee_100%)]">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/80 backdrop-blur px-8 py-10 shadow-xl border border-white/60">
          <div className="w-12 h-12 rounded-full border-4 border-[#2596be] border-t-transparent animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Memuat data provinsi…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeaf4,_#eef4f8_50%,_#d7e3ee_100%)]">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 max-w-md text-center border border-white/60">
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#dbeaf4,_#eef4f8_40%,_#d3e0eb_100%)] text-slate-900">
      <div className="absolute inset-0 z-0">
        <Suspense fallback={sectionLoader}>
          <Map data={data} selected={selectedProvinces} onSelect={handleSelect} />
        </Suspense>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <header className="pointer-events-auto px-2.5 sm:px-3 pt-2.5 sm:pt-3">
          <div className="rounded-[20px] bg-white/56 backdrop-blur-xl border border-white/55 shadow-[0_12px_30px_rgba(15,95,121,0.08)] px-3 sm:px-4 py-2.5 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#e9f4f8] flex items-center justify-center shadow-inner">
                <img src="/Logo.png" alt="Logo Geoquity" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900">Geoquity</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">Dashboard ketimpangan ekonomi per provinsi dengan peta full-bleed dan UI overlay.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="rounded-full bg-[#0f5f79] px-2.5 py-1 text-white font-semibold shadow-sm">
                Data: BPS {new Date().getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProvinces([])}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50"
              >
                Reset pilihan
              </button>
            </div>
          </div>
        </header>

        <aside className="pointer-events-auto absolute left-2.5 sm:left-3 top-[100px] w-[236px] sm:w-[248px] max-h-[calc(100vh-152px)] overflow-hidden rounded-[20px] bg-white/56 backdrop-blur-xl border border-white/55 shadow-[0_12px_30px_rgba(15,95,121,0.08)] p-3 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f5f79]">Infographic</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Ringkasan cepat</h2>
            <p className="mt-1.5 text-xs text-slate-500">Pilih provinsi di peta atau gunakan filter untuk fokus ke wilayah tertentu.</p>
          </div>

          <Filter
            provinces={data.map((d) => d.province)}
            selected={primarySelected}
            onChange={(province) => setSelectedProvinces(province ? [province] : [])}
          />

          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-xl bg-[#eef8fb] p-3 border border-[#d8edf4]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Provinsi aktif</p>
              <p className="mt-1.5 text-xl font-bold text-slate-900">{selectedProvinces.length || data.length}</p>
            </div>
            <div className="rounded-xl bg-[#f7fbef] p-3 border border-[#e7f0cf]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Data tampil</p>
              <p className="mt-1.5 text-xl font-bold text-slate-900">{displayData.length}</p>
            </div>
          </div>

          <div className="rounded-[16px] border border-slate-100 bg-slate-50/82 p-2.5 flex-1 min-h-0 overflow-auto">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Info pilihan</p>
              <span className="text-xs text-slate-400">{selectedProvinces.length ? 'Aktif' : 'Semua'}</span>
            </div>
            <div className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
              <div className="rounded-xl bg-white p-2.5 shadow-sm border border-slate-100">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Wilayah</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedProvinces.length === 0
                    ? 'Seluruh Indonesia'
                    : selectedProvinces.length === 1
                      ? selectedProvinces[0]
                      : `${selectedProvinces.length} provinsi terpilih`}
                </p>
              </div>
              <div className="rounded-xl bg-white p-2.5 shadow-sm border border-slate-100">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Kemiskinan</p>
                <p className="mt-1 font-semibold text-slate-900">{stats.avgPoverty}%</p>
              </div>
              <div className="rounded-xl bg-white p-2.5 shadow-sm border border-slate-100">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Pendapatan</p>
                <p className="mt-1 font-semibold text-slate-900">Rp {stats.avgIncome.toLocaleString('id-ID')} rb</p>
              </div>
            </div>
          </div>
        </aside>

        <aside className="pointer-events-auto absolute right-2.5 sm:right-3 top-[100px] w-[158px] sm:w-[168px] max-h-[calc(100vh-152px)] overflow-hidden rounded-[20px] bg-white/56 backdrop-blur-xl border border-white/55 shadow-[0_12px_30px_rgba(15,95,121,0.08)] p-2.5 flex flex-col gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f5f79]">Stats bar</p>
            <h2 className="mt-1 text-sm sm:text-base font-bold text-slate-900">Rangkuman</h2>
            <p className="mt-1 text-xs text-slate-500">Tiga kartu statistik utama.</p>
          </div>

          <div className="flex flex-col gap-2 overflow-auto pr-1">
            {statsCards.map((card) => (
              <StatsCard
                key={card.title}
                title={card.title}
                value={card.value}
                sub={
                  selectedProvinces.length === 0
                    ? 'Semua provinsi'
                    : selectedProvinces.length === 1
                      ? selectedProvinces[0]
                      : `${selectedProvinces.length} provinsi`
                }
                accent={card.accent}
              />
            ))}
          </div>
        </aside>

        <section className="pointer-events-auto absolute left-2.5 right-2.5 sm:left-[264px] sm:right-[180px] bottom-2.5 sm:bottom-3 z-20">
          <div className="rounded-[20px] border border-white/55 bg-white/54 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,95,121,0.08)] p-2 sm:p-2.5 h-[176px] overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f5f79]">Bottom tray</p>
                <h3 className="mt-0.5 text-sm sm:text-base font-bold text-slate-900">Grafik horizontal</h3>
              </div>
              <span className="hidden sm:block text-xs text-slate-500">Scroll kanan untuk grafik</span>
            </div>

            <div className="h-[118px] overflow-x-auto overflow-y-hidden pb-1">
              <div className="flex gap-4 min-w-max snap-x snap-mandatory">
                <div className="snap-start min-w-[340px] lg:min-w-[460px] xl:min-w-[560px]">
                  <Suspense fallback={sectionLoader}>
                    <Dashboard allData={data} selectedProvinces={selectedProvinces} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
