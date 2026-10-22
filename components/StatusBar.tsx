// Fake phone status bar (44px) shown at the top of every mobile screen.

export function StatusBar({ time = "9:41" }: { time?: string }) {
  return (
    <div className="flex h-11 flex-none items-center justify-between px-6 text-[13px] font-semibold">
      <span>{time}</span>
      <span className="font-normal text-muted">5G</span>
    </div>
  );
}
