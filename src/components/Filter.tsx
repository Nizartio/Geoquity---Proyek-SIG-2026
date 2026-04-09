interface FilterProps {
  /** List of province names to display */
  provinces: string[];
  /** Currently selected province (empty string = all) */
  selected: string;
  /** Callback fired when the user changes the selection */
  onChange: (province: string) => void;
}

/**
 * Province filter dropdown.
 * Selecting "All Provinces" resets the dashboard to show aggregated data.
 */
export default function Filter({ provinces, selected, onChange }: FilterProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="province-filter" className="text-sm font-medium text-gray-600">
        Filter Provinsi:
      </label>
      <select
        id="province-filter"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm
                   focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Semua Provinsi</option>
        {provinces.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
