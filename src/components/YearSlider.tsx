import React from 'react';

interface YearSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (year: number) => void;
}

export default function YearSlider({ min, max, value, onChange }: YearSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md border border-white/50 px-3 py-1.5 rounded-full shadow-sm">
      <span className="text-xs font-semibold text-slate-500">{min}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-24 sm:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0f5f79]"
      />
      <span className="text-xs font-semibold text-slate-500">{max}</span>
    </div>
  );
}
