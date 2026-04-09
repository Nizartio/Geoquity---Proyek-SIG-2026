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
  /** Currently selected province name (empty = show all) */
  selected: string;
}

/** Pie colours for top-5 poverty provinces */
const PIE_COLORS = ['#bd0026', '#f03b20', '#fd8d3c', '#fed976', '#ffffcc'];

/**
 * Dashboard panel containing:
 *  - Bar chart: poverty rate per province (top 10)
 *  - Pie chart: share of top-5 poverty provinces
 *  - Scatter/bar chart: inequality index per province
 */
export default function Dashboard({ allData, selected }: DashboardProps) {
  // When a province is selected, highlight it; otherwise show top-10 by poverty
  const chartData = selected
    ? allData.filter((d) => d.province === selected)
    : [...allData].sort((a, b) => b.poverty - a.poverty).slice(0, 10);

  const inequalityData = selected
    ? allData.filter((d) => d.province === selected)
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
    <div className="flex flex-col gap-6">
      {/* ── Bar Chart: Poverty Rate ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          {selected ? `Tingkat Kemiskinan – ${selected}` : 'Tingkat Kemiskinan (Top 10 Tertinggi)'}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="province"
              tick={{ fontSize: 11 }}
              tickFormatter={shorten}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 'dataMax + 2']}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Kemiskinan']}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="poverty" fill="#f03b20" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Pie Chart: Top-5 poverty share ───────────────────────────────── */}
      {!selected && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Distribusi Kemiskinan – 5 Provinsi Teratas
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[...allData].sort((a, b) => b.poverty - a.poverty).slice(0, 5)}
                dataKey="poverty"
                nameKey="province"
                cx="50%"
                cy="50%"
                outerRadius={70}
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
      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          {selected
            ? `Indeks Ketimpangan – ${selected}`
            : 'Indeks Ketimpangan (Top 10 Tertinggi)'}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={inequalityData} margin={{ top: 4, right: 8, left: -16, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="province"
              tick={{ fontSize: 11 }}
              tickFormatter={shorten}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 'dataMax + 5']} />
            <Tooltip
              formatter={(value: number) => [value.toFixed(1), 'Indeks Ketimpangan']}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="inequality" fill="#bd0026" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
