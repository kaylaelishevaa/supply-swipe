"use client";
// Neutral track with a white thumb (S2 style pill, S2a face/language/tone).

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  height = 38,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  height?: number;
}) {
  return (
    <div
      className="grid rounded-[12px] bg-neutral p-[3px]"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      role="radiogroup"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            style={{ height }}
            className={`flex items-center justify-center text-[13px] ${
              on ? "rounded-[10px] bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(60,55,120,0.08)]" : "text-muted"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
