// Coral no-deal card: the price gap between the two sides' public numbers, and why it ended.

export function GapCard({ theirs, ours, note }: { theirs: string; ours: string; note: string }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-coral bg-white p-3.5">
      <span className="flex h-[22px] items-center self-start whitespace-nowrap rounded-full bg-coral-soft px-2 text-[11px] font-semibold text-coral-text">
        Walked away
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] text-muted">Price gap</span>
        <span className="text-[22px] font-semibold">{theirs}</span>
        <span className="text-[13px] text-muted">vs</span>
        <span className="text-[22px] font-semibold">{ours}</span>
        <span className="text-[12px] text-muted">/kg</span>
      </div>
      <div className="text-[13px] leading-[1.5]">{note}</div>
    </div>
  );
}
