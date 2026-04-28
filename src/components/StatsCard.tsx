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
    <div className="bg-white/85 backdrop-blur rounded-xl shadow border border-white/60 p-2.5 flex items-start gap-2 w-full min-w-0 max-w-none">
      {/* Coloured accent bar */}
      <div className={`${accent} w-1.5 self-stretch rounded-full shadow-sm`} />
      <div>
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.14em] leading-tight">{title}</p>
        <p className="mt-0.5 text-base font-bold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="mt-0.5 text-[10px] text-slate-500 leading-tight">{sub}</p>}
      </div>
    </div>
  );
}
