// Staff approval limit vs this deal: teal-soft up to the limit, coral-soft beyond it, ink marker at the limit.

export function LimitBar({ limit, amount }: { limit: number; amount: number }) {
  const over = amount > limit;
  const pct = over ? (limit / amount) * 100 : 100;
  const fill = over ? pct : (amount / limit) * 100;
  return (
    <div className="flex flex-col gap-2.5 rounded-[24px] bg-white p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">Your approval limit</span>
        <span className={`text-[13px] font-semibold ${over ? "text-coral-text" : "text-teal-text"}`}>RM{limit} / week</span>
      </div>
      <div className="relative h-3 rounded-[6px] bg-neutral">
        <div className="absolute inset-y-0 left-0 rounded-[6px] bg-teal-soft" style={{ width: `${fill}%` }} />
        {over && <div className="absolute inset-y-0 right-0 rounded-r-[6px] bg-coral-soft" style={{ left: `${pct}%` }} />}
        {over && <div className="absolute -bottom-1 -top-1 w-0.5 bg-ink" style={{ left: `${pct}%` }} />}
      </div>
      <div className="flex justify-between text-[11px] text-muted">
        <span>RM0</span>
        <span>limit RM{limit}</span>
        <span className={over ? "font-semibold text-coral-text" : ""}>this deal RM{amount}</span>
      </div>
    </div>
  );
}
