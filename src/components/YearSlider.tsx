import React, { useEffect, useState, useCallback } from 'react';

interface YearSliderProps {
  min: number;
  max: number;
  value: number;
  /** Commit change when user releases the slider (mouse up / touch end / blur) */
  onChange: (year: number) => void;
}

export default function YearSlider({ min, max, value, onChange }: YearSliderProps) {
  const [temp, setTemp] = useState<number>(value);

  // Keep temp in sync when external value changes
  useEffect(() => {
    setTemp(value);
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemp(parseInt(e.target.value, 10));
  };

  const commit = useCallback(() => {
    if (temp !== value) onChange(temp);
  }, [temp, value, onChange]);

  const [active, setActive] = useState<boolean>(false);

  return (
    <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md border border-white/50 px-3 py-1.5 rounded-full shadow-sm">
      <span className="text-xs font-semibold text-slate-500">{min}</span>
      <div className="flex items-center gap-2">
        <div className="relative w-24 sm:w-32">
          <input
            type="range"
            min={min}
            max={max}
            value={temp}
            onChange={handleInput}
            onMouseDown={() => setActive(true)}
            onTouchStart={() => setActive(true)}
            onMouseUp={() => {
              commit();
              setActive(false);
            }}
            onTouchEnd={() => {
              commit();
              setActive(false);
            }}
            onBlur={() => {
              commit();
              setActive(false);
            }}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0f5f79]"
          />
          {/* Bubble that follows the thumb — visible only while interacting */}
          {active && (
            <div
              aria-hidden
              className="absolute -bottom-8 transform -translate-x-1/2"
              style={{
                left: `${max > min ? ((temp - min) / (max - min)) * 100 : 0}%`,
              }}
            >
              <div className="bg-white/95 border border-slate-200 rounded-md px-2 py-0.5 text-xs font-semibold shadow-sm">
                {temp}
              </div>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-500">{max}</span>
    </div>
  );
}
