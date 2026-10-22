// Three blinking dots in a side colour ("Wakil X is writing").

export function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex justify-center gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 animate-dotblink rounded-full" style={{ background: color, animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}
