// One past week with a supplier: label, how it closed, and the agreed price.

export function HistoryRow({ week, note, price, last = false }: { week: string; note: string; price: string; last?: boolean }) {
  return (
    <div className={`flex items-center py-3 ${last ? "" : "border-b border-line"}`}>
      <div className="flex-1">
        <div className="text-[13px] font-semibold">{week}</div>
        <div className="text-[11px] text-muted">{note}</div>
      </div>
      <div className="text-[14px] font-semibold">{price}</div>
    </div>
  );
}
