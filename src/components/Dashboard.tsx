import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { ProvinceData } from '../utils/inequality';

interface DashboardProps {
  /** Full dataset (all provinces) */
  allData: ProvinceData[];
  /** Currently selected provinces (empty = show all) */
  selectedProvinces: string[];
}

/** Pie colours for top-5 poverty provinces */
const PIE_COLORS = ['#bd0026', '#f03b20', '#fd8d3c', '#fed976', '#ffffcc'];

/**
 * Dashboard panel containing:
 *  - Bar chart: poverty rate per province (top 10)
 *  - Pie chart: share of top-5 poverty provinces
 *  - Scatter/bar chart: inequality index per province
 */
export default function Dashboard({ allData, selectedProvinces }: DashboardProps) {
  const hasSelection = selectedProvinces.length > 0;
  const chartHeight = hasSelection ? 96 : 112;
  const filteredData = hasSelection
    ? allData.filter((d) => selectedProvinces.includes(d.province))
    : allData;

  // When provinces are selected, show only selected rows; otherwise show top-10 by poverty
  const chartData = hasSelection
    ? filteredData
    : [...allData].sort((a, b) => b.poverty - a.poverty).slice(0, 10);

  const inequalityData = hasSelection
    ? filteredData
    : [...allData].sort((a, b) => (b.inequality ?? 0) - (a.inequality ?? 0)).slice(0, 10);

  // Shorten province names for the axis (remove common words)
  const shorten = (name: string) =>
    name
      .replace('Kepulauan ', 'Kep. ')
      .replace('Kalimantan ', 'Kal. ')
      .replace('Sulawesi ', 'Sul. ')
      .replace('Sumatera ', 'Sum. ')
      .replace('Nusa Tenggara ', 'NT');

  return (
    <div className="flex gap-2 min-w-max">
      {/* ── Bar Chart: Poverty Rate ───────────────────────────────────────── */}
      <div className="min-w-[220px] xl:min-w-[260px] rounded-xl bg-white/86 backdrop-blur border border-white/65 shadow p-2">
        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 leading-snug">
          {hasSelection
            ? selectedProvinces.length === 1
              ? `Tingkat Kemiskinan - ${selectedProvinces[0]}`
              : `Tingkat Kemiskinan - ${selectedProvinces.length} Provinsi Terpilih`
            : 'Tingkat Kemiskinan (Top 10 Tertinggi)'}
        </h3>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={chartData} margin={{ top: 2, right: 2, left: -22, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="province"
              tick={{ fontSize: 9 }}
              tickFormatter={shorten}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 9 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 'dataMax + 2']}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Kemiskinan']}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="poverty" fill="#f03b20" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Pie Chart: Top-5 poverty share ───────────────────────────────── */}
      {!hasSelection && (
        <div className="min-w-[220px] xl:min-w-[260px] rounded-xl bg-white/86 backdrop-blur border border-white/65 shadow p-2">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 leading-snug">
            Distribusi Kemiskinan – 5 Provinsi Teratas
          </h3>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={[...allData].sort((a, b) => b.poverty - a.poverty).slice(0, 5)}
                dataKey="poverty"
                nameKey="province"
                cx="50%"
                cy="50%"
                outerRadius={chartHeight === 96 ? 36 : 44}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${shorten(name)} ${(percent * 100).toFixed(1)}%`
                }
                labelLine={false}
              >
                {[...allData]
                  .sort((a, b) => b.poverty - a.poverty)
                  .slice(0, 5)
                  .map((_, i) => (
                    <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Kemiskinan']}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Bar Chart: Inequality Index ───────────────────────────────────── */}
      <div className="min-w-[220px] xl:min-w-[260px] rounded-xl bg-white/86 backdrop-blur border border-white/65 shadow p-2">
        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 leading-snug">
          {hasSelection
            ? selectedProvinces.length === 1
              ? `Indeks Ketimpangan - ${selectedProvinces[0]}`
              : `Indeks Ketimpangan - ${selectedProvinces.length} Provinsi Terpilih`
            : 'Indeks Ketimpangan (Top 10 Tertinggi)'}
        </h3>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={inequalityData} margin={{ top: 2, right: 2, left: -22, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="province"
              tick={{ fontSize: 9 }}
              tickFormatter={shorten}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 9 }} domain={[0, 'dataMax + 5']} />
            <Tooltip
              formatter={(value: number) => [value.toFixed(1), 'Indeks Ketimpangan']}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="inequality" fill="#bd0026" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
