// Three small stat tiles on the canvas colour (#EFEEF6).

export function FitTiles({ tiles }: { tiles: { label: string; value: string; tone?: "teal" | "coral" }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-[12px] bg-bg px-2.5 py-[9px]">
          <div className="text-[10px] text-muted">{t.label}</div>
          <div className={`text-[14px] font-semibold ${t.tone === "teal" ? "text-teal-text" : t.tone === "coral" ? "text-coral-text" : ""}`}>
            {t.value}
          </div>
        </div>
      ))}
    </div>
  );
}
