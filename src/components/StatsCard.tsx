interface StatsCardProps {
  /** Card title, e.g. "Poverty Rate" */
  title: string;
  /** Formatted value string, e.g. "10.5%" */
  value: string;
  /** Optional sub-label shown below the value */
  sub?: string;
  /** Tailwind background accent colour class, e.g. "bg-red-500" */
  accent?: string;
}

/**
 * A compact statistics card used in the summary row of the dashboard.
 */
export default function StatsCard({ title, value, sub, accent = 'bg-blue-500' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex items-start gap-4">
      {/* Coloured accent bar */}
      <div className={`${accent} w-1.5 self-stretch rounded-full`} />
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}
